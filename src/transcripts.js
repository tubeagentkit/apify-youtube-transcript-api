const API_URL = 'https://getyoutubetranscript.com/api/v1/transcript';
const REQUEST_TIMEOUT_MS = 35_000; // the API itself gives up at 25 s

/** One dataset row per video: the transcript on success, or the API's error code and message. */
export async function fetchTranscript(video, { apiKey, language, timestamps }, fetchImpl = fetch) {
    const url = new URL(API_URL);
    url.searchParams.set('v', video);
    if (language) url.searchParams.set('language', language);
    if (timestamps) url.searchParams.set('timestamps', 'true');
    try {
        const response = await fetchImpl(url, {
            headers: { Authorization: `Bearer ${apiKey}`, 'User-Agent': 'apify-youtube-transcript-api/1.0' },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.success === false) {
            return { input: video, error: body.code || `HTTP_${response.status}`, message: body.message || response.statusText };
        }
        const data = body.data || {};
        return {
            input: video,
            videoId: data.video_id,
            url: data.video_id ? `https://www.youtube.com/watch?v=${data.video_id}` : undefined,
            title: data.title,
            author: data.author_name,
            language: data.language_code,
            wordCount: data.word_count,
            transcript: data.transcript,
            ...(timestamps ? { segments: data.segments ?? [] } : {}),
        };
    } catch (error) {
        return { input: video, error: error.name === 'TimeoutError' ? 'TIMED_OUT' : 'NETWORK_ERROR', message: error.message };
    }
}

/** Stops the whole run on errors that will fail every remaining video too. */
export const FATAL_ERRORS = new Set(['MISSING_API_KEY', 'INVALID_API_KEY', 'PAYMENT_REQUIRED']);
