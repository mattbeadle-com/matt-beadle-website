import { videoFiles } from '../video-files.js';

async function serveVideo({ request, env, params }) {
  if (!videoFiles.has(params.file)) return new Response(null, { status: 404 });
  if (!env.WEBSITE_VIDEOS) return new Response(null, { status: 503 });

  const bucket = env.WEBSITE_VIDEOS;
  const metadata = await bucket.head(params.file);
  if (!metadata) return new Response(null, { status: 404 });

  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Content-Length': String(metadata.size),
    'Cache-Control': 'public, max-age=3600',
    ETag: metadata.httpEtag,
  });
  if (request.method === 'HEAD') return new Response(null, { headers });

  const range = request.headers.get('Range');
  const ifRange = request.headers.get('If-Range');
  if (!range || (ifRange && ifRange !== metadata.httpEtag)) {
    const video = await bucket.get(params.file);
    return video ? new Response(video.body, { headers }) : new Response(null, { status: 404 });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const size = metadata.size;
  const start = match?.[1] ? Number(match[1]) : Math.max(0, size - Number(match?.[2]));
  const end = match?.[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!match || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }

  const length = end - start + 1;
  const video = await bucket.get(params.file, { range: { offset: start, length } });
  if (!video) return new Response(null, { status: 404 });

  headers.set('Content-Length', String(length));
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  return new Response(video.body, { status: 206, headers });
}

export const onRequestGet = serveVideo;
export const onRequestHead = serveVideo;
