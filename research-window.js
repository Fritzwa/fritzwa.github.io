// Expire cards even when an offline page or a browser tab stays open overnight.
const windowMs = 24 * 60 * 60 * 1000;
let expiryTimer;
function refreshWindow() {
  const now = Date.now();
  let nextExpiry = Infinity;
  for (const lane of document.querySelectorAll(".lane")) {
    let count = 0;
    for (const paper of lane.querySelectorAll(".paper")) {
      const published = Date.parse(paper.dataset.published);
      const expires = published + windowMs;
      paper.hidden = !(published <= now && now < expires);
      if (!paper.hidden) {
        count++;
        nextExpiry = Math.min(nextExpiry, expires);
      }
    }
    lane.querySelector(".empty-lane").hidden = count > 0;
  }
  clearTimeout(expiryTimer);
  if (Number.isFinite(nextExpiry)) expiryTimer = setTimeout(refreshWindow, Math.max(1, nextExpiry - now));
}
refreshWindow();
window.addEventListener("pageshow", refreshWindow);
document.addEventListener("visibilitychange", refreshWindow);
