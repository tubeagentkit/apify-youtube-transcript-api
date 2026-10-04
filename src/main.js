import { Actor, log } from 'apify';
import { fetchTranscript, FATAL_ERRORS } from './transcripts.js';

const KEY_HELP = 'Add your GetYouTubeTranscript API key in the input. Get one free (no card) at https://getyoutubetranscript.com/developers';

await Actor.init();
const { videos = [], apiKey, language = 'en', timestamps = true } = (await Actor.getInput()) ?? {};
const list = [...new Set(videos.map((v) => String(v).trim()).filter(Boolean))];

if (!list.length) await Actor.fail('Add at least one YouTube URL or video ID.');

if (!apiKey) {
    // A run without a key still finishes with a readable result instead of an opaque failure.
    log.warning(KEY_HELP);
    await Actor.pushData(list.map((video) => ({ input: video, error: 'MISSING_API_KEY', message: KEY_HELP })));
    await Actor.exit(KEY_HELP);
}

let ok = 0;
for (const video of list) {
    const row = await fetchTranscript(video, { apiKey, language, timestamps });
    await Actor.pushData(row);
    if (row.error) {
        log.warning(`${video}: ${row.error} ${row.message ?? ''}`);
        if (FATAL_ERRORS.has(row.error)) await Actor.fail(`${row.error}: ${row.message}`);
    } else {
        ok += 1;
        log.info(`${video}: ${row.wordCount ?? 0} words (${row.language})`);
    }
}
await Actor.exit(`Fetched ${ok} of ${list.length} transcripts.`);
