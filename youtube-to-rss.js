// escape xml safely
function xmlEscape(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
}

// recursively extract channels from youtube's json
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
    for (const key in node) walk(node[key]);
  }
  walk(obj);
  return results;
}

// main
let data;
try {
  data = ytInitialData;
} catch (e) {
  alert("Could not find ytInitialData. Run this script on your YouTube Subscriptions page after it fully loads.");
  throw e;
}

// extract channels
const channels = extractChannels(data);
const uniqueChannels = Array.from(new Map(channels.map(c => [c.channelId, c])).values());

if (uniqueChannels.length === 0) {
  alert("No channels found. YouTube may have changed its page structure.");
  throw new Error("No channels found");
}

// ask whether to include invidious feeds
const includeInvidious = confirm("Would you like to include Invidious feeds as well?");

// initialize invidiousBase (optional)
let invidiousBase = null;

if (includeInvidious) {
    invidiousBase = prompt("Enter your Invidious instance URL (e.g. https://inv.example.com):");
    if (invidiousBase) {
        invidiousBase = invidiousBase.trim().replace(/\/+$/, "");
    } else {
        invidiousBase = null;
    }
}

// build youtube outlines
const ytOutlines = uniqueChannels.map(({ channelId, title }) => {
  const escaped = xmlEscape(title);
  return `      <outline text="${escaped}" title="${escaped}" xmlUrl="https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}" />`;
}).join("\n");

let invidiousSection = "";

// optionally build invidious outlines
if (includeInvidious && invidiousBase) {
  const invOutlines = uniqueChannels.map(({ channelId, title }) => {
    const escaped = xmlEscape(title);
    return `      <outline text="${escaped}" title="${escaped}" xmlUrl="${invidiousBase}/feed/channel/${channelId}" />`;
  }).join("\n");

  invidiousSection = `\n    <outline text="Invidious" title="Invidious">\n${invOutlines}\n    </outline>`;
}

// build opml with folder structure
const opmlData = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Subscriptions</title>
  </head>
  <body>
    <outline text="YouTube" title="YouYube">
${ytOutlines}
    </outline>${invidiousSection}
  </body>
</opml>`;

// trigger download
const blob = new Blob([opmlData], { type: "text/xml" });
const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = "subscriptions.opml";
a.click();

console.log(`Exported ${uniqueChannels.length} YouTube subscriptions${includeInvidious ? ` + Invidious (${invidiousBase})` : ""}`);
