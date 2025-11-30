# youtube-to-rss

A tool to automatically pull all YouTube subscriptions and convert them into an RSS-readable OPML format.

This was inspired by David Hariri's wonderful blog post: [YouTube Subscriptions via RSS](https://dhariri.com/2023/youtube-sub-download.html)
## Features

- Dynamically converts your entire YouTube subscription base to OPML for easy RSS imports
- Runs completely client side; no data is sent anywhere
- Allows you to choose an Invidious frontend if you prefer to use that instead

## How to Use

**NOTE**: This works by opening the developer view in your browser and copy pasting javascript code into the console. You should ***never*** do this without understanding what the code you're pasting does. Failing to do so could result in [severe consequences](https://www.bleepingcomputer.com/news/security/dont-copy-paste-commands-from-webpages-you-can-get-hacked/).

- Make sure you're logged into YouTube and go to [`https://www.youtube.com/feed/channels`](https://www.youtube.com/feed/channels)
  - Make sure you go to youtube.com/feed/**channels** specifically.
  - Don't go to youtube.com/feed/subscriptions. This script will not work there.
- Open Developer View with `F12` or `Ctrl + Shift + C`
- In the pane that opens, find and click the `Console` tab
- Copy the javascript code from [`here`](https://raw.githubusercontent.com/MikeWilsonSTL/youtube-to-rss/refs/heads/main/youtube-to-rss.js)
- Find the input field (where you can type freely), paste the javascript, and hit `Enter`

Once you hit enter, follow the prompts and you'll be prompted to download a file called `subscriptions.opml`

This is the file that contains all of your YouTube or Invidious subscription data. You can take this file and import it into your RSS reader of choice.

It *should* work with most RSS readers but I've only tested it on a few myself.

Specifically, I've confirmed that the .opml file imports cleanly into FreshRSS and these RSS readers:
     
 - Android
   - [Feeder](https://github.com/spacecowboy/Feeder)(Local OPML only)
   - [Read You](https://github.com/ReadYouApp/ReadYou)(Local or FreshRSS)
   - [Readrops](https://github.com/readrops/Readrops)(FreshRSS)
   - [Capy Reader](https://github.com/jocmp/capyreader)(FreshRSS)
  
 - Windows
   - [Fluent Reader](https://github.com/yang991178/fluent-reader)(Local or FreshRSS)
