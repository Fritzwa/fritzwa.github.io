// Expire cards even when an offline page or a browser tab stays open overnight.
const windowMs = 24 * 60 * 60 * 1000;
let expiryTimer;
function refreshWindow() {
  const now = Date.now();
  let nextExpiry = Infinity;
  for (const lane of document.querySelectorAll(".lane")) {
    let count = 0;
    const notes = [];
    for (const paper of lane.querySelectorAll(".paper[data-published]")) {
      const published = Date.parse(paper.dataset.published);
      const expires = published + windowMs;
      paper.hidden = !(published <= now && now < expires);
      if (!paper.hidden) {
        count++;
        if (paper.dataset.briefZh) notes.push(paper.dataset.briefZh);
        nextExpiry = Math.min(nextExpiry, expires);
      }
    }
    lane.querySelector(".empty-lane").hidden = count > 0;
    const classic = lane.querySelector("[data-classic]");
    if (classic) classic.hidden = lane.dataset.topic === "editing" && count > 0;
    const digest = document.querySelector('[data-brief-topic="' + lane.dataset.topic + '"]');
    if (digest) {
      const fallback = count ? "中文速读待补充，可先阅读下方英文摘要。" : "过去 24 小时暂无已核实的新进展。";
      let text = notes.join(" ") || fallback;
      if (classic && !classic.hidden) text += " 经典选读：" + classic.dataset.briefZh;
      if (digest.textContent !== text) digest.textContent = text;
    }
  }
  clearTimeout(expiryTimer);
  if (Number.isFinite(nextExpiry)) expiryTimer = setTimeout(refreshWindow, Math.max(1, nextExpiry - now));
}
refreshWindow();
window.addEventListener("pageshow", refreshWindow);
document.addEventListener("visibilitychange", refreshWindow);
