import {keepUpdated} from "./feed.js";

let lastReview = document.querySelector(".checked time").dateTime;
keepUpdated(async () => {
  try {
    const response = await fetch("./research.html", {cache: "no-cache", signal: AbortSignal.timeout(15000)});
    if (!response.ok) throw new Error("Could not refresh the board.");
    const snapshot = new DOMParser().parseFromString(await response.text(), "text/html");
    const next = snapshot.querySelector(".research-board");
    const checked = next.querySelector(".checked time").dateTime;
    if (Date.parse(checked) > Date.parse(lastReview)) {
      const current = document.querySelector(".research-board");
      for (const open of current.querySelectorAll(".past-edition[open]")) {
        const match = snapshot.getElementById(open.id);
        if (match?.matches(".past-edition")) match.open = true;
      }
      current.replaceWith(document.importNode(next, true));
      window.refreshWindow();
      lastReview = checked;
    }
    document.getElementById("feed-status").hidden = true;
  } catch {
    document.getElementById("feed-status").hidden = false;
  }
}, 5 * 60 * 1000);
