#!/usr/bin/env node
/**
 * Запуск в режиме разработки: API и сайт одной командой.
 *
 * Два принципиальных момента:
 *  1. Порт сайта подбирается сам — занятый 3000 не повод падать.
 *  2. Дочерние процессы запускаются напрямую через node, без `npm` и без
 *     оболочки. На Windows запуск `npm.cmd` из Node падает с EINVAL
 *     (Node 18.20+/20.12+/22+ запретил spawn .cmd без shell), а так этой
 *     проблемы просто нет — и на один процесс в цепочке меньше.
 */

const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SERVER_PORT = Number(process.env.PORT_API) || 4000;
const CLIENT_PORT_FROM = Number(process.env.PORT_WEB) || 3000;

const SERVER_ENTRY = path.join(ROOT, 'server', 'index.js');
const CLIENT_ENTRY = path.join(
  ROOT,
  'client',
  'node_modules',
  'react-scripts',
  'bin',
  'react-scripts.js'
);

const c = {
  server: '[35m',
  client: '[36m',
  warn: '[33m',
  error: '[31m',
  dim: '[90m',
  reset: '[0m',
};

function isFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, '0.0.0.0');
  });
}

async function findFreePort(from, attempts = 20) {
  for (let port = from; port < from + attempts; port += 1) {
    // eslint-disable-next-line no-await-in-loop
    if (await isFree(port)) return port;
  }
  return null;
}

function writer(name) {
  const tag = `${c[name] || ''}[${name.toUpperCase()}]${c.reset} `;
  return (chunk) => {
    String(chunk)
      .split(/\r?\n/)
      .filter((line) => line.trim().length)
      .forEach((line) => process.stdout.write(tag + line + '\n'));
  };
}

const children = [];
let shuttingDown = false;

function run(name, entry, args, cwd, env) {
  const child = spawn(process.execPath, [entry, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    /* Своя группа процессов: dev-сервер CRA порождает воркеры и не всегда
       завершается по сигналу, поэтому гасить нужно всю группу целиком. */
    detached: process.platform !== 'win32',
  });

  const out = writer(name);
  child.stdout.on('data', out);
  child.stderr.on('data', out);

  child.on('error', (err) => {
    process.stdout.write(`${c.error}[${name.toUpperCase()}] не удалось запустить: ${err.message}${c.reset}\n`);
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;
    if (code) {
      process.stdout.write(`${c.error}[${name.toUpperCase()}] процесс завершился с кодом ${code}${c.reset}\n`);
    }
    shutdown(code || 0);
  });

  children.push(child);
  return child;
}

function stop(child, signal) {
  if (!child.pid) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], {
        stdio: 'ignore',
        windowsHide: true,
      });
      return;
    }
    try {
      process.kill(-child.pid, signal); // вся группа
    } catch (err) {
      child.kill(signal); // группы уже нет — гасим сам процесс
    }
  } catch (err) {
    /* процесс уже завершился */
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  children.forEach((child) => stop(child, 'SIGTERM'));

  /* Dev-сервер CRA не всегда умирает по SIGTERM и может остаться висеть,
     удерживая порт. Через секунду добиваем принудительно — иначе следующий
     запуск снова упрётся в занятый порт. */
  const hard = setTimeout(() => {
    children.filter((ch) => ch.exitCode === null).forEach((ch) => stop(ch, 'SIGKILL'));
  }, 700);

  const bail = setTimeout(() => process.exit(code), 1600);

  const check = setInterval(() => {
    if (children.every((ch) => ch.exitCode !== null)) {
      clearInterval(check);
      clearTimeout(hard);
      clearTimeout(bail);
      process.exit(code);
    }
  }, 120);
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(0)));

(async () => {
  for (const [entry, hint] of [
    [SERVER_ENTRY, 'server'],
    [CLIENT_ENTRY, 'client'],
  ]) {
    if (!fs.existsSync(entry)) {
      process.stdout.write(
        `${c.error}Не найдено: ${entry}${c.reset}\n` +
          `Похоже, зависимости не установлены. Выполните:\n  npm run install:all\n`
      );
      process.exit(1);
    }
  }

  if (!(await isFree(SERVER_PORT))) {
    process.stdout.write(
      `${c.error}Порт ${SERVER_PORT} занят — на нём должен работать API.${c.reset}\n` +
        `Скорее всего, сервер уже запущен в другом окне. Посмотреть и закрыть:\n` +
        `${c.dim}  npm run ports${c.reset}\n`
    );
    process.exit(1);
  }

  const clientPort = await findFreePort(CLIENT_PORT_FROM);
  if (!clientPort) {
    process.stdout.write(
      `${c.error}Не нашёл свободный порт для сайта начиная с ${CLIENT_PORT_FROM}.${c.reset}\n`
    );
    process.exit(1);
  }
  if (clientPort !== CLIENT_PORT_FROM) {
    process.stdout.write(`${c.warn}Порт ${CLIENT_PORT_FROM} занят — сайт запускаю на ${clientPort}.${c.reset}\n`);
  }

  process.stdout.write(
    `\n  ${c.client}Сайт${c.reset}     →  http://localhost:${clientPort}\n` +
      `  ${c.client}Админка${c.reset}  →  http://localhost:${clientPort}/admin\n` +
      `  ${c.server}API${c.reset}      →  http://localhost:${SERVER_PORT}/api\n` +
      `  ${c.dim}вход: admin / cult2026 — остановить: Ctrl+C${c.reset}\n\n`
  );

  run('server', SERVER_ENTRY, [], path.join(ROOT, 'server'), {
    PORT: String(SERVER_PORT),
  });

  run('client', CLIENT_ENTRY, ['start'], path.join(ROOT, 'client'), {
    PORT: String(clientPort),
    // адрес API для фронтенда: порт мог быть изменён через PORT_API
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || `http://localhost:${SERVER_PORT}`,
  });
})();
