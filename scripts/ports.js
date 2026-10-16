#!/usr/bin/env node
/**
 * `npm run ports` — показывает, кто занимает порты проекта, и как его закрыть.
 * Нужен, когда `npm start` жалуется на занятый порт.
 */

const net = require('net');
const { execSync } = require('child_process');

const PORTS = [
  { port: Number(process.env.PORT_WEB) || 3000, what: 'сайт (React)' },
  { port: Number(process.env.PORT_API) || 4000, what: 'API (Express)' },
];

function isFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, '0.0.0.0');
  });
}

function owner(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(
        `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { $p = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue; if ($p) { $p.Id.ToString() + ' ' + $p.ProcessName } }"`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      return out || null;
    }
    const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -Fpc 2>/dev/null || true`, {
      encoding: 'utf8',
    }).trim();
    if (!out) return null;
    const pid = (out.match(/^p(\d+)/m) || [])[1];
    const name = (out.match(/^c(.+)$/m) || [])[1];
    return pid ? `${pid} ${name || ''}`.trim() : null;
  } catch (err) {
    return null;
  }
}

(async () => {
  console.log('');
  for (const { port, what } of PORTS) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isFree(port);
    if (free) {
      console.log(`  ${port}  свободен  — ${what}`);
    } else {
      const who = owner(port);
      console.log(`  ${port}  ЗАНЯТ     — ${what}${who ? `, процесс: ${who}` : ''}`);
      if (process.platform === 'win32') {
        console.log(
          `        освободить:  Get-NetTCPConnection -LocalPort ${port} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
        );
      } else {
        console.log(`        освободить:  lsof -ti tcp:${port} | xargs kill`);
      }
    }
  }
  console.log(
    '\n  Порт сайта можно не освобождать: npm start сам возьмёт следующий свободный.\n' +
      '  Порт API важен — на него настроен прокси фронтенда.\n'
  );
})();
