# YouTube Transcript API

Get the transcript of any YouTube video, with per-line timestamps, as structured data. Paste video URLs or IDs, run, and download the results as JSON, CSV or Excel, or pull them through the Apify API.

It calls the [GetYouTubeTranscript](https://getyoutubetranscript.com) API, which fetches captions server-side. That means it keeps working from cloud servers that YouTube blocks for direct scraping, and each video comes back in a single request (no job polling), typically in around 800 ms.

## What you need

A GetYouTubeTranscript API key. Create one at [getyoutubetranscript.com/developers](https://getyoutubetranscript.com/developers): the free tier needs no card. Each successful transcript uses 1 credit, and failed requests are not charged. Paid plans start at $5 per 1,000 requests.

The actor itself only makes one HTTP call per video, so Apify compute usage is tiny.

## Input

| Field | Required | Description |
|---|---|---|
| `videos` | Yes | YouTube URLs (`watch`, `youtu.be`, `shorts`) or 11-character video IDs |
| `apiKey` | Yes | Your GetYouTubeTranscript API key (stored as a secret) |
| `language` | No | Language code such as `en`, `es`, `de`. Defaults to `en` |
| `timestamps` | No | Add `segments` with `start` and `duration` in seconds. Default `true` |

```json
{
  "videos": ["https://www.youtube.com/watch?v=jNQXAC9IVRw", "dQw4w9WgXcQ"],
  "apiKey": "sk_live_...",
  "language": "en",
  "timestamps": true
}
```

## Output

One dataset item per video:

```json
{
  "input": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  "videoId": "jNQXAC9IVRw",
  "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  "title": "Me at the zoo",
  "author": "jawed",
  "language": "en",
  "wordCount": 39,
  "transcript": "All right, so here we are, in front of the elephants...",
  "segments": [
    { "start": 1.2, "duration": 2.16, "text": "All right, so here we are, in front of the elephants" }
  ]
}
```

If a video has no captions, or the requested language isn't available, the item has `error` (for example `TRANSCRIPT_NOT_FOUND` or `LANGUAGE_NOT_AVAILABLE`) and `message` instead, and the run continues with the next video. An invalid key or an empty credit balance stops the run right away.

## Use cases

- Summarize or analyze videos with an LLM
- Build a searchable knowledge base from a channel or playlist
- Quote the exact moment something was said, using `segments` timestamps
- Feed transcripts to RAG pipelines, n8n, Make or Zapier through Apify integrations

## More than transcripts

The same API key also covers video search, channel uploads, channel search and playlists. See the [API docs](https://getyoutubetranscript.com/docs), the [MCP server](https://getyoutubetranscript.com/api/mcp) for Claude and other AI agents, and SDKs for Python (`pip install getyoutubetranscript`) and Node (`npm install @tubeagentkit/getyoutubetranscript`).

Questions or issues: open an issue on this actor or contact us via [getyoutubetranscript.com](https://getyoutubetranscript.com).
