// Content script: scans text nodes, finds phone numbers, asks background to check
// each one, and rewrites valid ones into wa.me links with a WA icon.

(async () => {
  const settings = await chrome.storage.local.get(["disabled", "disabledHosts"]);
  if (settings.disabled) return;
  const host = location.hostname;
  if (Array.isArray(settings.disabledHosts) && settings.disabledHosts.includes(host)) return;

  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "IFRAME", "TEXTAREA", "INPUT",
    "SELECT", "OPTION", "CODE", "PRE", "SVG", "CANVAS"
  ]);
  const PROCESSED_ATTR = "data-wa-processed";
  const SVG_NS = "http://www.w3.org/2000/svg";
  const ICON_PATH = "M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.91 9.91 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28z";
  const defaultCountry = inferCountry();
  const pendingChecks = new Map();

  function shouldSkip(node) {
    let el = node.parentElement;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.isContentEditable) return true;
      if (el.tagName === "A") return true;
      if (el.hasAttribute && el.hasAttribute(PROCESSED_ATTR)) return true;
      el = el.parentElement;
    }
    return false;
  }

  function collectTextNodes(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || node.nodeValue.length < 7) return NodeFilter.FILTER_REJECT;
          if (!/\d/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
          if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function buildLink(rawText, e164) {
    const a = document.createElement("a");
    a.href = `https://wa.me/${e164.replace(/\D/g, "")}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "wa-quick-link";
    a.setAttribute(PROCESSED_ATTR, "1");
    a.title = "Open in WhatsApp";
    a.textContent = rawText;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "wa-quick-link-icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute(PROCESSED_ATTR, "1");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", ICON_PATH);
    svg.appendChild(path);
    a.appendChild(svg);
    return a;
  }

  // Replaces a single text node with [text-before, link, text-after, link, ...] fragments.
  // Returns true if any replacement happened.
  function replaceMatchesInNode(textNode, matches) {
    if (matches.length === 0) return false;
    const parent = textNode.parentNode;
    if (!parent) return false;

    const original = textNode.nodeValue;
    const frag = document.createDocumentFragment();
    let cursor = 0;
    for (const m of matches) {
      if (m.start > cursor) {
        frag.appendChild(document.createTextNode(original.slice(cursor, m.start)));
      }
      frag.appendChild(buildLink(m.raw, m.e164));
      cursor = m.end;
    }
    if (cursor < original.length) {
      frag.appendChild(document.createTextNode(original.slice(cursor)));
    }
    parent.replaceChild(frag, textNode);
    return true;
  }

  function checkNumber(e164) {
    if (pendingChecks.has(e164)) return pendingChecks.get(e164);
    const p = new Promise(resolve => {
      try {
        chrome.runtime.sendMessage({ type: "check", e164 }, (resp) => {
          if (chrome.runtime.lastError) { resolve(null); return; }
          resolve(resp?.result ?? null);
        });
      } catch (e) {
        resolve(null);
      }
    });
    pendingChecks.set(e164, p);
    return p;
  }

  async function processRoot(root) {
    const nodes = collectTextNodes(root);
    for (const node of nodes) {
      if (!node.parentNode) continue;
      const text = node.nodeValue;
      const candidates = findPhonesInText(text, defaultCountry);
      if (candidates.length === 0) continue;

      const checked = await Promise.all(
        candidates.map(async c => ({ ...c, ok: await checkNumber(c.e164) }))
      );
      // Treat null (unknown) as valid — optimistic fallback per design.
      const keep = checked.filter(c => c.ok !== false);
      if (keep.length === 0) continue;
      if (!node.parentNode) continue;
      replaceMatchesInNode(node, keep);
    }
  }

  await processRoot(document.body);

  // Watch for dynamically added content (SPAs, infinite scroll, async DOM).
  const seenRoots = new WeakSet();
  let mutationTimer = null;
  const mutationQueue = new Set();

  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType === Node.ELEMENT_NODE && !seenRoots.has(n)) {
          seenRoots.add(n);
          mutationQueue.add(n);
        }
      }
    }
    if (!mutationTimer && mutationQueue.size > 0) {
      mutationTimer = setTimeout(async () => {
        mutationTimer = null;
        const batch = [...mutationQueue];
        mutationQueue.clear();
        for (const root of batch) {
          if (root.isConnected) await processRoot(root);
        }
      }, 400);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
