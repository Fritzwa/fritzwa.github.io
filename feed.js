const origin = "https://vcard-folio-6p4n.glisteningrice8.chatgpt.site";
export const mediaUrl = id => origin + "/media/goals/" + id;

export async function fetchFeed(path) {
  const response = await fetch(origin + path, {
    credentials: "omit",
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error("The feed is unavailable.");
  return response.json();
}

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function keepUpdated(refresh, interval) {
  let loading = false;
  async function load() {
    if (loading || document.hidden) return;
    loading = true;
    try { await refresh(); }
    finally { loading = false; }
  }
  load();
  setInterval(load, interval);
  document.addEventListener("visibilitychange", load);
  window.addEventListener("pageshow", load);
}
