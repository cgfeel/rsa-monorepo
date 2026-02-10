declare module 'react-server-dom-webpack/client' {
  export function createFromFetch(
    // 兼容两种合法参数类型
    input: Response | Promise<Response>,
    options?: {
      moduleBaseURL?: string;
      // 补充 createFromFetch 的可选配置（按需添加，基础使用可省略）
      onError?: (error: Error) => void;
      onLoading?: () => void;
    }
  ): Promise<React.ReactElement>;
}

declare module 'react-server-dom-webpack/plugin' {
  import { Compiler } from 'webpack';

  interface ReactServerWebpackPluginOptions {
    outputPath?: string;
    isServer?: boolean;
    // 添加其他你需要的配置项
  }

  export default class ReactServerWebpackPlugin {
    constructor(options?: ReactServerWebpackPluginOptions);
    // 确保有 apply 方法
    apply(compiler: Compiler): void;
  }
}

declare module 'react-server-dom-webpack/server' {
  import { ReactNode } from 'react';
  import { PipeableStream, RenderToPipeableStreamOptions } from 'react-dom/server';

  const CLIENT_REFERENCE_TAG$: symbol;
  type ClientReference<T extends (...args: unknown[]) => unknown> = T & {
    // React 内部类型标识
    readonly $$typeof: typeof CLIENT_REFERENCE_TAG$;
    // 完整的模块标识符（格式：path#exportName）
    readonly $$id: string;
    // 是否为异步模块（代码分割）
    readonly $$async: boolean;
  };

  export type WebpackMaptype = {
    id: string | number;
    chunks: string[];
    name?: string;
    esModule?: boolean;
  };

  export function registerClientReference<T extends (...args: unknown[]) => unknown>(
    proxyImplementation: T,
    id: string,
    exportName: string
  ): ClientReference<T>;

  export function renderToPipeableStream(
    children: ReactNode,
    webpackMap: WebpackMaptype,
    options?: RenderToPipeableStreamOptions
  ): PipeableStream;
}

declare module './dist/index.js' {
  export default function App(): import('react/jsx-runtime').JSX.Element;
}

interface Window {
  __RSC_ROOT_PATH__: string;
}
