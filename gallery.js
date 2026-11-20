const management = document.querySelector("#management");
const clips = document.querySelectorAll(".clip");

function showTitleEditors() {
  for (const link of document.querySelectorAll(".owner-title")) link.hidden = !management.open;
}

if (management) {
  management.addEventListener("toggle", showTitleEditors);
  showTitleEditors();
}

for (const clip of clips) {
  const player = clip.querySelector("video");
  if (!clip.dataset.titleFile) continue;
  fetch(clip.dataset.titleFile, {cache: "no-cache"})
    .then(response => response.ok ? response.text() : "")
    .then(text => {
      const title = text.trim();
      if (title) {
        clip.querySelector("h2").textContent = title;
        player.setAttribute("aria-label", title);
      }
    })
    .catch(() => {});
}
