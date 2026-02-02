// react-server-components.d.ts
import type { ReactElement, ReactNode } from 'react';

// 扩展 JSX 组件类型，允许 async 函数返回 Promise<ReactElement>
declare global {
  namespace JSX {
    // 覆盖默认的 ElementType，支持异步 RSC 组件
    type ElementType = 
      | (() => ReactNode) 
      | (() => Promise<ReactElement<any, string | JSXElementConstructor<any>>>);
  }
}

// 确保此文件被当作模块处理（避免 TS 报错）
export {};