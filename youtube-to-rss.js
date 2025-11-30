/* global ytInitialData */

// escape XML safely
function xmlEscape(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
}

// extract channels from YouTube's JSON
function extractChannels(obj) {
  const results = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;

    if (node.channelId && node.title && node.title.simpleText) {
      results.push({
        channelId: node.channelId,
        title: node.title.simpleText
      });
    }

    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        walk(node[key]);
      }
    }
  }
  walk(obj);
  return results;
}

// main exit point
let data;
try {
  data = ytInitialData;
} catch (e) {
  alert("Could not find ytInitialData.\nRun this script on your YouTube Subscriptions page after it fully loads:\nhttps://www.youtube.com/feed/channels");
  throw e;
}

// extract channels and remove duplicates
const channels = extractChannels(data);
const uniqueChannels = Array.from(new Map(channels.map(c => [c.channelId, c])).values());

if (uniqueChannels.length === 0) {
  alert("No channels found. YouTube may have changed its page structure.");
  throw new Error("No channels found");
}

// user chooses feed type
let feedType = null;
while (!feedType) {
  const choice = prompt("Which feed would you like to export?\n1 = YouTube\n2 = Invidious", "1");

  if (choice === null) { // user presses cancel
    throw new Error("User cancelled export.");
  }

  if (choice === "1") {
    feedType = "youtube";
  } else if (choice === "2") {
    feedType = "invidious";
  } else {
    alert("Please enter 1 for YouTube or 2 for Invidious.");
  }
}

// if invidious, ask for URL
let invidiousBase = null;
if (feedType === "invidious") {
  while (!invidiousBase) {
    const input = prompt(
      "Enter your Invidious instance URL (e.g. https://inv.example.com)\n" +
      "Leave blank to revert to YouTube, or Cancel to exit."
    );

    if (input === null) {
      throw new Error("User cancelled export.");
    }

    const trimmed = input.trim().replace(/\/+$/, "");

    if (!trimmed) {
      // revert to youtube
      feedType = "youtube";
      break;
    }

    // normalize scheme
    let normalized = /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed;
    invidiousBase = normalized;
  }
}

// build outlines
const outlines = uniqueChannels.map(({ channelId, title }) => {
  const escaped = xmlEscape(title);
  const url = feedType === "youtube" ? 
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` :
    `${invidiousBase}/feed/channel/${channelId}`;
  return `      <outline text="${escaped}" title="${escaped}" xmlUrl="${url}" />`;
}).join("\n");

// build opml
const opmlData = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Subscriptions</title>
  </head>
  <body>
    <outline text="${feedType === "youtube" ? "YouTube" : "Invidious"}" title="${feedType === "youtube" ? "YouTube" : "Invidious"}">
${outlines}
    </outline>
  </body>
</opml>`;

// trigger download
const blob = new Blob([opmlData], { type: "text/xml" });
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "subscriptions.opml";
a.click();

console.log(`Exported ${uniqueChannels.length} ${feedType === "youtube" ? "YouTube" : "Invidious"} subscriptions${feedType === "invidious" ? ` (${invidiousBase})` : ""}`);
