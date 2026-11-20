import {keepUpdated} from "./feed.js";

const management = document.querySelector("#management");
const gallery = document.querySelector("#clips");

function showTitleEditors() {
  for (const link of gallery.querySelectorAll(".owner-title")) link.hidden = !management.open;
}

async function refreshTitle(card) {
  if (!card.dataset.titleFile) return;
  try {
    const response = await fetch(card.dataset.titleFile, {cache: "no-cache", signal: AbortSignal.timeout(10000)});
    if (!response.ok) return;
    const title = (await response.text()).trim();
    if (title) {
      card.querySelector("h2").textContent = title;
      card.querySelector("video").setAttribute("aria-label", title);
    }
  } catch { /* The title rendered with the video stays visible. */ }
}

function videoPath(card) {
  return card.querySelector(".fallback").getAttribute("href");
}

function enablePlayback(card) {
  const url = card.dataset.compatible;
  if (!url) return;
  const player = card.querySelector("video");
  async function loadCompatible() {
    if (player.dataset.compatible === "loading" || player.dataset.compatible === "ready") return;
    player.dataset.compatible = "loading";
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
      if (!response.ok) throw new Error("Video unavailable");
      const encoded = (await response.text()).replace(/\s/g, "");
      player.src = "data:video/mp4;base64," + encoded;
      player.dataset.compatible = "ready";
    } catch {
      delete player.dataset.compatible;
    }
  }
  player.addEventListener("error", loadCompatible);
  if (player.error || !player.canPlayType('video/mp4; codecs="hvc1"')) loadCompatible();
}

if (management && gallery) {
  management.addEventListener("toggle", showTitleEditors);
  showTitleEditors();
  for (const card of gallery.children) {
    enablePlayback(card);
    refreshTitle(card);
  }

  keepUpdated(async () => {
    try {
      const response = await fetch("./highlights.html", {cache: "no-cache", signal: AbortSignal.timeout(10000)});
      if (!response.ok) return;
      const next = new DOMParser().parseFromString(await response.text(), "text/html");
      const incoming = next.querySelector("#clips");
      if (!incoming || !next.querySelector("#management")) return;
      const current = new Map(Array.from(gallery.children, card => [videoPath(card), card]));
      for (const [index, fresh] of Array.from(incoming.children).entries()) {
        const key = videoPath(fresh);
        let card = current.get(key);
        if (card) {
          current.delete(key);
          card.querySelector(".owner-title").href = fresh.querySelector(".owner-title").getAttribute("href");
          if (fresh.dataset.titleFile) card.dataset.titleFile = fresh.dataset.titleFile;
          else {
            delete card.dataset.titleFile;
            card.querySelector("h2").textContent = fresh.querySelector("h2").textContent;
          }
        } else {
          card = document.importNode(fresh, true);
          enablePlayback(card);
        }
        if (gallery.children[index] !== card) gallery.insertBefore(card, gallery.children[index] || null);
        refreshTitle(card);
      }
      for (const obsolete of current.values()) obsolete.remove();
      const empty = document.getElementById("empty");
      if (gallery.children.length) empty?.remove();
      else if (!empty && next.getElementById("empty")) gallery.after(document.importNode(next.getElementById("empty"), true));
      showTitleEditors();
    } catch { /* Keep showing the last published gallery during a network failure. */ }
  }, 30000);
}
