import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import React from 'react';
import 'react-server-dom-webpack/node-register';
import { renderToPipeableStream } from 'react-server-dom-webpack/server';

const clientManifest = JSON.parse(
  fs.readFileSync(path.resolve('./dist/client/react-client-manifest.json'), 'utf-8')
);

const clientTemplate = fs.readFileSync(path.resolve('./dist/client/index.html'), 'utf-8');

// @ts-ignore
const { default: App } = await import('./dist/index.js');

const app = express();
const PORT = 8086;

// 手动模拟 ESM 环境下的 __filename 和 __dirname（核心代码）
const __filename = fileURLToPath(import.meta.url); // 等效于 CJS 的 __filename
const __dirname = path.dirname(__filename); // 等效于 CJS 的 __dirname

// 静态文件中间件
// app.use(express.static(path.join(__dirname, 'public')))

// 托管客户端打包后的静态资源（含client-bundle.js）
app.use('/client', express.static(path.join(__dirname, 'dist/client')));

// 根路由处理
app.get('/', (_, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(clientTemplate);
});

app.get('/rsc', (_, res) => {
  try {
    // 将 Server Component 渲染为 RSC Payload 流
    const stream = renderToPipeableStream(React.createElement(App), clientManifest);

    res.setHeader('Content-Type', 'text/x-component');
    stream.pipe(res);
  } catch (err) {
    res.status(500).send(err instanceof Error ? `请求处理失败：${err.message}` : '请求处理失败');
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ RSC服务运行在：http://localhost:${PORT}`);
  console.log('🔄 核心流程：服务端RSC渲染 → 客户端Hydration → 交互激活');
});
