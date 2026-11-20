import {element, fetchFeed, keepUpdated} from "./feed.js";

const kinds = {preprint: "Preprint", paper: "Paper", blog: "Research blog"};
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Shanghai", day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});
function timeLabel(stamp) {
  const time = element("time", dateFormat.format(new Date(stamp)) + " UTC+8");
  time.dateTime = stamp;
  return time;
}
function paperCard(entry) {
  const url = new URL(entry.url);
  if (url.protocol !== "https:") throw new Error("Invalid source URL.");
  const article = element("article", undefined, "paper");
  article.dataset.briefZh = entry.brief_zh || "";
  const metadata = element("p", undefined, "paper-info");
  if (entry.selected_on) {
    article.dataset.classic = "";
    const selected = element("time", "Selected " + entry.selected_on);
    selected.dateTime = entry.selected_on;
    const rank = entry.topic === "merging" ? " · CCF A" : "";
    metadata.append(selected, element("span", "Classic reading · " + entry.source + rank));
  } else {
    article.dataset.published = entry.published_at;
    metadata.append(timeLabel(entry.published_at), element("span", kinds[entry.kind] + " · " + entry.source));
  }
  const heading = element("h3");
  const title = element("a", entry.title);
  title.href = url.href;
  heading.append(title);
  const blog = entry.kind === "blog";
  const source = element("a", blog ? "Read the original post" : "Read the original abstract", "source");
  source.href = url.href;
  article.append(metadata, heading, element("p", entry.author, "byline"),
    element("h4", blog ? "Editorial summary" : "Abstract in brief"),
    element("p", entry.abstract, "abstract"), source);
  return article;
}

let lastReview;
const status = document.querySelector("#feed-status");
keepUpdated(async () => {
  try {
    const board = await fetchFeed("/api/research");
    if (board.checked !== lastReview) {
      const reviewed = timeLabel(board.checked);
      const cards = board.entries.map(entry => ({topic: entry.topic, node: paperCard(entry)}));
      for (const lane of document.querySelectorAll(".lane")) {
        for (const existing of lane.querySelectorAll(".paper")) existing.remove();
        const empty = lane.querySelector(".empty-lane");
        for (const card of cards) if (card.topic === lane.dataset.topic) empty.before(card.node);
        const classic = board.classics?.[lane.dataset.topic];
        if (classic) empty.after(paperCard(classic));
      }
      document.querySelector(".checked time").replaceWith(reviewed);
      window.refreshWindow();
      lastReview = board.checked;
    }
    status.hidden = true;
  } catch {
    status.hidden = false;
  }
}, 5 * 60 * 1000);
