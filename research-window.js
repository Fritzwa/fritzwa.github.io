// Only the open edition follows the clock. Published history stays as reviewed.
const windowMs = 24 * 60 * 60 * 1000;
let expiryTimer;
function refreshWindow() {
  const edition = document.getElementById("current-edition");
  if (!edition) return;
  const now = Date.now();
  let nextExpiry = Infinity;
  for (const lane of edition.querySelectorAll(".lane")) {
    const empty = lane.querySelector(".empty-lane");
    const earlier = lane.querySelector(".earlier");
    const currentNotes = [], earlierNotes = [];
    let freshCount = 0, earlierCount = 0;
    for (const paper of lane.querySelectorAll(".paper[data-published]")) {
      const published = Date.parse(paper.dataset.published);
      const expires = published + windowMs;
      paper.hidden = !Number.isFinite(published) || now < published;
      if (paper.hidden) {
        if (published > now) nextExpiry = Math.min(nextExpiry, published);
        continue;
      }
      const note = paper.dataset.briefZh || paper.querySelector("h3").textContent;
      if (now < expires) {
        freshCount++;
        currentNotes.push(note);
        if (paper.parentElement !== lane) empty.before(paper);
        nextExpiry = Math.min(nextExpiry, expires);
      } else {
        earlierCount++;
        earlierNotes.push(note);
        if (paper.parentElement !== earlier) earlier.append(paper);
      }
    }
    empty.hidden = freshCount > 0;
    earlier.hidden = earlierCount === 0;
    if (!freshCount) currentNotes.push("过去 24 小时暂无已核实的新进展。");
    if (earlierCount) currentNotes.push("本期早前收录：" + earlierNotes.join(" "));
    for (const classic of lane.querySelectorAll("[data-classic]")) {
      classic.hidden = lane.dataset.topic === "editing" && freshCount > 0;
      if (!classic.hidden) currentNotes.push("经典选读：" + classic.dataset.briefZh);
    }
    const digest = edition.querySelector('[data-brief-topic="' + lane.dataset.topic + '"]');
    const text = currentNotes.join(" ");
    if (digest.textContent !== text) digest.textContent = text;
  }
  clearTimeout(expiryTimer);
  if (Number.isFinite(nextExpiry)) expiryTimer = setTimeout(refreshWindow, Math.max(1, nextExpiry - now));
}
refreshWindow();
window.addEventListener("pageshow", refreshWindow);
document.addEventListener("visibilitychange", refreshWindow);
