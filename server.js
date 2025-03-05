const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = process.env.PORT || 3000;  // ✅ ใช้ PORT จาก Plesk
const hostname = "0.0.0.0"; // ✅ รันบนทุก IP
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});
