const express = require("express");
const fs = require("fs");
const net = require("net");
const path = require("path");
const { parse } = require("csv-parse/sync");

const app = express();
const DATA_DIR = path.join(__dirname, "data");

function findFreePort(start) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(start, () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on("error", () => findFreePort(start + 1).then(resolve, reject));
  });
}

app.use(express.static(path.join(__dirname, "public")));

// CSVファイル一覧を返す
app.get("/api/files", (_req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".csv"));
    res.json(files);
  } catch {
    res.json([]);
  }
});

// 指定CSVの内容を返す
app.get("/api/csv/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(DATA_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const content = fs.readFileSync(filepath, "utf8");
    const records = parse(content, { columns: true, skip_empty_lines: true });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to parse CSV" });
  }
});

const START_PORT = parseInt(process.env.PORT ?? "3000", 10);

findFreePort(START_PORT).then((port) => {
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`起動しました: ${url}`);
    if (port !== START_PORT) {
      console.log(`（ポート ${START_PORT} が使用中のため ${port} を使用しています）`);
    }
    const { exec } = require("child_process");
    exec(`start ${url}`);
  });
});
