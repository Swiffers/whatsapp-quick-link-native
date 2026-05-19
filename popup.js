const globalToggle = document.getElementById("globalToggle");
const siteToggle = document.getElementById("siteToggle");
const hostLabel = document.getElementById("hostLabel");
const clearBtn = document.getElementById("clearCache");
const status = document.getElementById("status");

async function getActiveHost() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try { return new URL(tab.url).hostname; } catch { return null; }
}

async function load() {
  const { disabled = false, disabledHosts = [] } = await chrome.storage.local.get(["disabled", "disabledHosts"]);
  globalToggle.checked = !disabled;
  const host = await getActiveHost();
  hostLabel.textContent = host || "";
  siteToggle.checked = host ? !disabledHosts.includes(host) : true;
  siteToggle.disabled = !host || disabled;
}

globalToggle.addEventListener("change", async () => {
  await chrome.storage.local.set({ disabled: !globalToggle.checked });
  load();
  flash("Saved. Reload the page to apply.");
});

siteToggle.addEventListener("change", async () => {
  const host = await getActiveHost();
  if (!host) return;
  const { disabledHosts = [] } = await chrome.storage.local.get("disabledHosts");
  const set = new Set(disabledHosts);
  if (siteToggle.checked) set.delete(host); else set.add(host);
  await chrome.storage.local.set({ disabledHosts: [...set] });
  flash("Saved. Reload the page to apply.");
});

clearBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "clearCache" }, (resp) => {
    flash(`Cleared ${resp?.cleared ?? 0} entries.`);
  });
});

function flash(msg) {
  status.textContent = msg;
  setTimeout(() => { status.textContent = ""; }, 2500);
}

load();
