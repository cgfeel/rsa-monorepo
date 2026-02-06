import { createRoot } from 'react-dom/client';
import { createFromFetch } from 'react-server-dom-webpack/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('未找到 root 容器');
}

// 创建 React 根节点
const root = createRoot(rootElement);

// 关键：从服务端获取 RSC Payload 并渲染
// 这会自动处理 Suspense、Client Components 的 hydration
const stream = createFromFetch(
  fetch('/rsc'), // 从服务端获取流
  {
    // 用于加载 Client Components 的代码分割模块
    moduleBaseURL: '/client/',
  }
);

// 流式渲染：服务端组件就绪后自动更新 DOM
root.render(stream);
