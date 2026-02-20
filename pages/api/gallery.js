import { del, list, put } from "@vercel/blob";
import { galleryPhotos } from '../../data/galleryPhotos';

const GALLERY_PREFIX = 'flatbread-gallery/';
const ORDER_PATH = `${GALLERY_PREFIX}order.json`;

function jsonError(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: message }));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function parseDataUrlImage(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i.exec(dataUrl || '');
  if (!match) {
    return null;
  }

  const [, contentType, base64] = match;
  const buffer = Buffer.from(base64, 'base64');

  return { contentType, buffer };
}

function makeFileName(fileName, fallback) {
  const base = normalizeText(fileName).replace(/\.[^.]+$/, '') || normalizeText(fallback) || 'slice-moment';
  const safeBase = base
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .slice(0, 40);

  const stamp = Date.now();
  return `flatbread-gallery/${stamp}-${safeBase || 'photo'}.jpg`;
}

function parsePayload(rawBody) {
  if (typeof rawBody === 'string') {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }
  return rawBody || {};
}

function normalizePathname(pathname) {
  return normalizeText(pathname).replace(/^\/+/, '');
}

function mapPhotosFromBlobs(blobs) {
  return (blobs || [])
    .filter((item) => item && item.url && item.pathname && item.pathname !== ORDER_PATH)
    .map((item) => ({
      src: item.url,
      pathname: item.pathname,
      alt: item.pathname ? item.pathname.replace(/^flatbread-gallery\//, '') : 'Flatbread gallery photo'
    }));
}

async function loadGalleryOrder(token) {
  try {
    const orderResult = await list({
      token,
      prefix: ORDER_PATH,
      limit: 1
    });
    const orderBlob = (orderResult?.blobs || []).find((item) => item?.pathname === ORDER_PATH);
    if (!orderBlob?.url) {
      return [];
    }
    const response = await fetch(orderBlob.url, { cache: 'no-store' });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json().catch(() => ({}));
    return Array.isArray(payload?.order)
      ? payload.order.map((value) => normalizePathname(value)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function saveGalleryOrder(token, orderedPathnames) {
  const cleaned = Array.isArray(orderedPathnames)
    ? orderedPathnames.map((value) => normalizePathname(value)).filter(Boolean)
    : [];

  await put(ORDER_PATH, JSON.stringify({ order: cleaned }), {
    token,
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false
  });
}

function orderPhotos(photos, orderedPathnames) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return [];
  }
  const position = new Map(
    (orderedPathnames || []).map((pathname, index) => [pathname, index])
  );

  return [...photos].sort((a, b) => {
    const aPos = position.has(a.pathname) ? position.get(a.pathname) : Number.MAX_SAFE_INTEGER;
    const bPos = position.has(b.pathname) ? position.get(b.pathname) : Number.MAX_SAFE_INTEGER;
    if (aPos !== bPos) {
      return aPos - bPos;
    }
    return String(a.pathname || '').localeCompare(String(b.pathname || ''));
  });
}

async function handleGet(_req, res) {
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
    if (!token) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ photos: galleryPhotos, source: 'fallback' }));
      return;
    }

    try {
      const result = await list({
        token,
        prefix: GALLERY_PREFIX,
        limit: 500
      });

      const orderedPathnames = await loadGalleryOrder(token);
      const photos = orderPhotos(mapPhotosFromBlobs(result?.blobs || []), orderedPathnames);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ photos, source: 'vercel-blob' }));
      return;
    } catch (error) {
      console.error('[api/gallery] list() failed, falling back to static photos', error);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        photos: galleryPhotos,
        source: 'fallback',
        error: 'Blob list failed; using fallback photos.'
      }));
      return;
    }
  } catch (error) {
    console.error('[api/gallery] Failed to read gallery photos', error);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({
      photos: galleryPhotos,
      source: 'fallback',
      error: 'Gallery service failed; using fallback photos.'
    }));
  }
}

async function handlePost(req, res) {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (!token) {
    return jsonError(res, 500, 'Blob upload is not configured: BLOB_READ_WRITE_TOKEN is missing.');
  }

  const payload = parsePayload(req.body);

  const imageDataUrl = normalizeText(payload.imageDataUrl);
  const fileName = normalizeText(payload.fileName);
  const caption = normalizeText(payload.caption);

  if (!imageDataUrl) {
    return jsonError(res, 400, 'imageDataUrl is required.');
  }

  const parsed = parseDataUrlImage(imageDataUrl);
  if (!parsed) {
    return jsonError(res, 400, 'Unsupported image format. Please upload a real image file.');
  }

  const blobPath = makeFileName(fileName, `photo-${Date.now()}`);
  let blob;
  try {
    blob = await put(blobPath, parsed.buffer, {
      token,
      access: 'public',
      contentType: parsed.contentType,
      addRandomSuffix: false
    });
  } catch (error) {
    const message = (error && error.message) ? error.message : 'Unknown blob upload error';
    return jsonError(res, 500, `Blob upload failed: ${message}`);
  }

  try {
    const currentOrder = await loadGalleryOrder(token);
    await saveGalleryOrder(token, [...currentOrder, blobPath]);
  } catch {
    // non-blocking: upload succeeded even if order update failed
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      photo: {
        src: blob.url,
        pathname: blob.pathname || blobPath,
        alt: caption || 'Flatbread secret spot'
      }
    })
  );
}

async function handleDelete(req, res) {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (!token) {
    return jsonError(res, 500, 'Blob upload is not configured: BLOB_READ_WRITE_TOKEN is missing.');
  }

  const payload = parsePayload(req.body);
  const pathname = normalizePathname(payload.pathname);
  if (!pathname || !pathname.startsWith(GALLERY_PREFIX) || pathname === ORDER_PATH) {
    return jsonError(res, 400, 'A valid gallery pathname is required.');
  }

  try {
    await del(pathname, { token });
    const currentOrder = await loadGalleryOrder(token);
    await saveGalleryOrder(token, currentOrder.filter((item) => item !== pathname));
  } catch (error) {
    const message = error?.message ? String(error.message) : 'Delete failed.';
    return jsonError(res, 500, message);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true }));
}

async function handlePatch(req, res) {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (!token) {
    return jsonError(res, 500, 'Blob upload is not configured: BLOB_READ_WRITE_TOKEN is missing.');
  }

  const payload = parsePayload(req.body);
  const orderedPathnames = Array.isArray(payload?.orderedPathnames)
    ? payload.orderedPathnames.map((value) => normalizePathname(value)).filter(Boolean)
    : null;

  if (!orderedPathnames) {
    return jsonError(res, 400, 'orderedPathnames is required.');
  }

  const galleryResult = await list({
    token,
    prefix: GALLERY_PREFIX,
    limit: 500
  });
  const existingPathnames = new Set(
    mapPhotosFromBlobs(galleryResult?.blobs || []).map((photo) => photo.pathname)
  );

  const invalidPath = orderedPathnames.find((pathname) => !existingPathnames.has(pathname));
  if (invalidPath) {
    return jsonError(res, 400, `Unknown pathname in order: ${invalidPath}`);
  }

  await saveGalleryOrder(token, orderedPathnames);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ ok: true }));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  return jsonError(res, 405, 'Method not allowed');
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
};
