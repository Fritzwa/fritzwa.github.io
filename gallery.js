import {element, fetchFeed, keepUpdated, mediaUrl} from "./feed.js";

const container = document.querySelector("#clips");
const status = document.querySelector("#list-status");
const fallback = document.querySelector("#gallery-fallback");
const cards = new Map();
const dateFormat = new Intl.DateTimeFormat("en", {year: "numeric", month: "short", day: "numeric"});

function makeCard(clip) {
  const article = element("article", undefined, "clip");
  const player = element("video");
  player.controls = true;
  player.playsInline = true;
  player.preload = "metadata";
  player.src = mediaUrl(clip.id);
  const heading = element("h2", clip.title);
  const time = element("time", dateFormat.format(new Date(clip.added)));
  time.dateTime = clip.added;
  const link = element("a", "Open video file");
  link.href = player.src;
  const fileLink = element("p", undefined, "fallback");
  fileLink.append(link);
  fileLink.hidden = true;
  player.addEventListener("error", () => { fileLink.hidden = false; });
  const footer = element("footer");
  footer.append(heading, time, fileLink);
  article.append(player, footer);
  return {article, heading};
}

keepUpdated(async () => {
  try {
    const {clips} = await fetchFeed("/api/goals");
    const visible = new Set(clips.map(clip => clip.id));
    for (const [id, card] of cards) {
      if (!visible.has(id)) { card.article.remove(); cards.delete(id); }
    }
    clips.forEach((clip, index) => {
      if (!cards.has(clip.id)) cards.set(clip.id, makeCard(clip));
      const card = cards.get(clip.id);
      card.heading.textContent = clip.title;
      const position = container.children[index] || null;
      if (position !== card.article) container.insertBefore(card.article, position);
    });
    document.querySelector("#empty").hidden = clips.length > 0;
    status.textContent = "";
    fallback.hidden = true;
  } catch {
    status.textContent = "Could not refresh highlights.";
    fallback.hidden = false;
  }
}, 20000);
