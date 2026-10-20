const { createServer } = require("http");
const { stat, createReadStream } = require("fs");
const path = require("path");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Next's built-in public/ file serving snapshots what's on disk when the
// server boots (`next({ dev: false }).prepare()`), so any file an admin
// uploads afterward 404s until the next Passenger restart even though it's
// sitting right there on disk. Uploads are the only public/ content written
// at runtime (everything else ships with the build), so route just this
// prefix around Next entirely and read it fresh from disk on every request.
function serveUpload(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const relative = urlPath.replace(/^\/uploads\//, "");
  const filePath = path.join(UPLOADS_ROOT, relative);

  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    res.writeHead(400);
    res.end();
    return;
  }

  stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Content-Length": stats.size,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    createReadStream(filePath).pipe(res);
  });
}

app.prepare().then(() => {
  createServer((req, res) => {
    if (req.url.startsWith("/uploads/")) {
      serveUpload(req, res);
      return;
    }
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
