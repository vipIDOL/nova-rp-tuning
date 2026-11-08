/**
 * Мини-счётчик для калькулятора NOVA RP.
 * Хранит число в counter.txt рядом с собой. Без зависимостей.
 *
 * Запуск:            node counter.js
 * Порт:              PORT=8787 (по умолчанию 8787)
 * Файл счётчика:     COUNTER_FILE=./counter.txt
 *
 * API:
 *   GET  /count  -> { "count": 12 }
 *   POST /hit    -> { "count": 13 }
 * CORS открыт, чтобы страница могла обращаться с любого домена.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8787;
const FILE = process.env.COUNTER_FILE || path.join(__dirname, 'counter.txt');

function readCount() {
  try {
    const n = parseInt(fs.readFileSync(FILE, 'utf8').trim(), 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeCount(n) {
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, String(n));
  fs.renameSync(tmp, FILE);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/count') {
    res.writeHead(200);
    return res.end(JSON.stringify({ count: readCount() }));
  }

  if (url.pathname === '/hit' && (req.method === 'POST' || req.method === 'GET')) {
    const n = readCount() + 1;
    writeCount(n);
    res.writeHead(200);
    return res.end(JSON.stringify({ count: n }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`counter: http://localhost:${PORT}  file: ${FILE}`);
});
