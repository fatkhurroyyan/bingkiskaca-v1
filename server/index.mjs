import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ORIGINAL_DIR = path.join(PROJECT_ROOT, 'Picture', 'Original');
const STRIP_DIR = path.join(PROJECT_ROOT, 'Picture', 'Strip');
const VIDEO_DIR = path.join(PROJECT_ROOT, 'Picture', 'Video');
const GIF_DIR = path.join(PROJECT_ROOT, 'Picture', 'GIF');
const PORT = 3847;

function ensureDirs() {
  fs.mkdirSync(ORIGINAL_DIR, { recursive: true });
  fs.mkdirSync(STRIP_DIR, { recursive: true });
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.mkdirSync(GIF_DIR, { recursive: true });
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

async function saveOriginalPhotos(images, sessionId) {
  const saved = [];

  for (let i = 0; i < images.length; i++) {
    const filename = `${sessionId}-photo-${i + 1}.jpg`;
    const filepath = path.join(ORIGINAL_DIR, filename);
    fs.writeFileSync(filepath, dataUrlToBuffer(images[i]));
    saved.push(filepath);
  }

  return saved;
}

async function saveStripPhoto(image, sessionId) {
  const filename = `${sessionId}-strip.jpg`;
  const filepath = path.join(STRIP_DIR, filename);
  fs.writeFileSync(filepath, dataUrlToBuffer(image));
  return filepath;
}

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'];
    if (!contentType) {
      reject(new Error('No content-type header'));
      return;
    }
    const boundaryMatch = contentType.match(/boundary=([^;]+)/);
    if (!boundaryMatch) {
      reject(new Error('No boundary found in content-type'));
      return;
    }
    let boundary = boundaryMatch[1].trim();
    if (boundary.startsWith('"') && boundary.endsWith('"')) {
      boundary = boundary.slice(1, -1);
    }
    const boundaryBuffer = Buffer.from(`--${boundary}`);

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = {};
        
        let offset = 0;
        const positions = [];
        while (true) {
          const idx = buffer.indexOf(boundaryBuffer, offset);
          if (idx === -1) break;
          positions.push(idx);
          offset = idx + boundaryBuffer.length;
        }

        for (let i = 0; i < positions.length - 1; i++) {
          const start = positions[i] + boundaryBuffer.length;
          const end = positions[i + 1];
          
          const partBuffer = buffer.slice(start, end);
          if (partBuffer.length === 0) continue;

          const headerEndIdx = partBuffer.indexOf('\r\n\r\n');
          if (headerEndIdx === -1) continue;

          const headersString = partBuffer.slice(0, headerEndIdx).toString('utf-8');
          const headerLines = headersString.split('\r\n');
          
          let name = null;
          let filename = null;
          
          for (const line of headerLines) {
            if (line.toLowerCase().startsWith('content-disposition:')) {
              const nameMatch = line.match(/name="([^"]+)"/);
              const filenameMatch = line.match(/filename="([^"]+)"/);
              if (nameMatch) name = nameMatch[1];
              if (filenameMatch) filename = filenameMatch[1];
            }
          }

          if (name) {
            let bodyBuffer = partBuffer.slice(headerEndIdx + 4);
            
            if (bodyBuffer.length >= 2 && bodyBuffer[bodyBuffer.length - 2] === 0x0D && bodyBuffer[bodyBuffer.length - 1] === 0x0A) {
              bodyBuffer = bodyBuffer.slice(0, -2);
            }

            if (filename) {
              result[name] = bodyBuffer;
            } else {
              result[name] = bodyBuffer.toString('utf-8').trim();
            }
          }
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function saveVideo(buffer, sessionId) {
  const filename = `${sessionId}-video.webm`;
  const filepath = path.join(VIDEO_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

async function saveGif(buffer, sessionId) {
  const filename = `${sessionId}-animation.webm`;
  const filepath = path.join(GIF_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function getSharedPageHtml(sessionId) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BINGKIS KACA - Unduh Foto Kamu</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #884A00;
      --primary-hover: #723e00;
      --bg-cream: #faf7f2;
      --card-bg: rgba(255, 255, 255, 0.9);
      --text-dark: #2c1e11;
      --text-muted: #6e5e4f;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg-cream);
      background-image: 
        radial-gradient(at 0% 0%, rgba(136, 74, 0, 0.05) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(136, 74, 0, 0.03) 0px, transparent 50%);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }

    .container {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }

    .header {
      text-align: center;
      margin-bottom: 0.25rem;
    }

    .header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.03em;
      text-transform: uppercase;
    }

    .header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 0.25rem;
    }

    .preview-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(136, 74, 0, 0.1);
      border-radius: 24px;
      padding: 1.5rem;
      width: 100%;
      box-shadow: 0 10px 30px rgba(136, 74, 0, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
    }

    .preview-img-container {
      width: 100%;
      max-width: 200px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      border: 4px solid white;
      transform: rotate(-1deg);
      transition: transform 0.3s ease;
    }

    .preview-img-container:hover {
      transform: rotate(0deg) scale(1.02);
    }

    .preview-img-container img {
      width: 100%;
      display: block;
      height: auto;
    }

    .button-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
      width: 100%;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 1rem;
      border-radius: 16px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }

    .btn svg {
      flex-shrink: 0;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow: 0 4px 15px rgba(136, 74, 0, 0.25);
    }

    .btn-primary:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(136, 74, 0, 0.35);
    }

    .btn-secondary {
      background: white;
      color: var(--primary);
      border: 1px solid rgba(136, 74, 0, 0.2);
    }

    .btn-secondary:hover {
      background: #fff9f2;
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    .btn-tertiary {
      background: rgba(136, 74, 0, 0.05);
      color: var(--primary);
      border: 1px dashed rgba(136, 74, 0, 0.3);
    }

    .btn-tertiary:hover {
      background: rgba(136, 74, 0, 0.1);
      transform: translateY(-2px);
    }

    .photos-drawer {
      width: 100%;
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(136, 74, 0, 0.1);
      border-radius: 24px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(136, 74, 0, 0.06);
      display: none;
      flex-direction: column;
      gap: 1rem;
    }

    .photos-drawer.active {
      display: flex;
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .photos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
    }

    .photo-item {
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      aspect-ratio: 3/4;
      position: relative;
    }

    .photo-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .photo-item-download {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      background: rgba(0,0,0,0.6);
      color: white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-size: 0.8rem;
    }

    .footer {
      text-align: center;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bingkis Kaca</h1>
      <p>Terima kasih telah berfoto bersama kami!</p>
    </div>

    <div class="preview-card">
      <div class="preview-img-container">
        <img src="/media/Strip/${sessionId}-strip.jpg" alt="Comic Strip">
      </div>
      
      <div class="button-grid">
        <a href="/media/Strip/${sessionId}-strip.jpg" class="btn btn-primary" download="${sessionId}-strip.jpg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Unduh Comic Strip
        </a>
        <a href="/media/GIF/${sessionId}-animation.webm" class="btn btn-secondary" download="${sessionId}-animation.webm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Unduh WebM Animasi (GIF)
        </a>
        <a href="/media/Video/${sessionId}-video.webm" class="btn btn-secondary" download="${sessionId}-video.webm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          Unduh Video Sesi
        </a>
        <button onclick="toggleDrawer()" class="btn btn-tertiary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Akses 4 Foto Asli
        </button>
      </div>
    </div>

    <div id="photos-drawer" class="photos-drawer">
      <p style="font-weight: 600; text-align: center; color: var(--primary);">Foto-Foto Asli Kamu</p>
      <p style="font-size: 0.85rem; text-align: center; color: var(--text-muted); margin-bottom: 0.5rem;">Ketuk atau tahan pada foto untuk menyimpan ke galeri</p>
      <div class="photos-grid">
        <div class="photo-item">
          <img src="/media/Original/${sessionId}-photo-1.jpg" alt="Foto 1">
          <a href="/media/Original/${sessionId}-photo-1.jpg" download="${sessionId}-photo-1.jpg" class="photo-item-download">↓</a>
        </div>
        <div class="photo-item">
          <img src="/media/Original/${sessionId}-photo-2.jpg" alt="Foto 2">
          <a href="/media/Original/${sessionId}-photo-2.jpg" download="${sessionId}-photo-2.jpg" class="photo-item-download">↓</a>
        </div>
        <div class="photo-item">
          <img src="/media/Original/${sessionId}-photo-3.jpg" alt="Foto 3">
          <a href="/media/Original/${sessionId}-photo-3.jpg" download="${sessionId}-photo-3.jpg" class="photo-item-download">↓</a>
        </div>
        <div class="photo-item">
          <img src="/media/Original/${sessionId}-photo-4.jpg" alt="Foto 4">
          <a href="/media/Original/${sessionId}-photo-4.jpg" download="${sessionId}-photo-4.jpg" class="photo-item-download">↓</a>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 Bingkis Kaca. All rights reserved.</p>
    </div>
  </div>

  <script>
    function toggleDrawer() {
      const drawer = document.getElementById('photos-drawer');
      drawer.classList.toggle('active');
      if (drawer.classList.contains('active')) {
        drawer.scrollIntoView({ behavior: 'smooth' });
      }
    }
  </script>
</body>
</html>`;
}

ensureDirs();

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  try {
    // Shared page landing route
    if (req.method === 'GET' && req.url.startsWith('/shared/')) {
      const sessionId = req.url.split('/shared/')[1]?.split('?')[0];
      if (!sessionId) {
        sendJson(res, 400, { error: 'Invalid Session ID' });
        return;
      }

      const stripFile = path.join(STRIP_DIR, `${sessionId}-strip.jpg`);
      if (!fs.existsSync(stripFile)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<h1>Sesi tidak ditemukan / Session not found</h1>`);
        return;
      }

      const html = getSharedPageHtml(sessionId);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Static media serving
    if (req.method === 'GET' && req.url.startsWith('/media/')) {
      const relativePath = req.url.slice(7); // Remove '/media/'
      const filePath = path.join(PROJECT_ROOT, 'Picture', relativePath);
      const pictureDir = path.join(PROJECT_ROOT, 'Picture');

      // Prevent directory traversal
      if (!filePath.startsWith(pictureDir)) {
        sendJson(res, 403, { error: 'Forbidden' });
        return;
      }

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webm') contentType = 'video/webm';
        else if (ext === '.html') contentType = 'text/html';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      } else {
        sendJson(res, 404, { error: 'File not found' });
        return;
      }
    }

    if (req.method === 'GET' && req.url === '/api/health') {
      sendJson(res, 200, { ok: true, originalDir: ORIGINAL_DIR, stripDir: STRIP_DIR });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/save/original') {
      const { images, sessionId } = await readJsonBody(req);

      if (!sessionId || !Array.isArray(images) || images.length === 0) {
        sendJson(res, 400, { error: 'sessionId and images are required' });
        return;
      }

      const saved = await saveOriginalPhotos(images, sessionId);
      sendJson(res, 200, { ok: true, saved, count: saved.length });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/save/strip') {
      const { image, sessionId } = await readJsonBody(req);

      if (!sessionId || !image) {
        sendJson(res, 400, { error: 'sessionId and image are required' });
        return;
      }

      const saved = await saveStripPhoto(image, sessionId);
      const shareUrl = `http://${getLocalIpAddress()}:${PORT}/shared/${sessionId}`;
      sendJson(res, 200, { ok: true, saved, shareUrl });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/save/video') {
      const formData = await parseMultipartForm(req);
      const sessionId = formData.sessionId;
      const buffer = formData.file;

      if (!sessionId || !buffer) {
        sendJson(res, 400, { error: 'sessionId and file are required' });
        return;
      }

      const saved = await saveVideo(buffer, sessionId);
      sendJson(res, 200, { ok: true, saved });
      return;
    }

    if (req.method === 'POST' && req.url === '/api/save/gif') {
      const formData = await parseMultipartForm(req);
      const sessionId = formData.sessionId;
      const buffer = formData.file;

      if (!sessionId || !buffer) {
        sendJson(res, 400, { error: 'sessionId and file are required' });
        return;
      }

      const saved = await saveGif(buffer, sessionId);
      sendJson(res, 200, { ok: true, saved });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { error: err.message ?? 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Photo save server running on http://localhost:${PORT}`);
  console.log(`Original photos -> ${ORIGINAL_DIR}`);
  console.log(`Strip photos   -> ${STRIP_DIR}`);
  console.log(`Videos         -> ${VIDEO_DIR}`);
  console.log(`GIFs           -> ${GIF_DIR}`);
});
