# 使用 `react-server-dom-webpack` 实现 `RSA`

由 `React` 官方提供的服务端渲染方法，目前并没有写入文档；当前示例将展示：

- 服务端构建时加载异步组件，以及异步获取数据
- 服务端构建时加载同步组件，并设置占位符
- 客户端构建时扫描所有客户端组件生成 `manifest` 文件
- 生成客户端入口资源，加载服务端生成的 `rsc` 资源 `hydate`
- 使用 `express` 作为服务端加载运行时、所需资源，完成渲染

## 版本选择

需要使用 `React v.19.*`，在 `18.*` 下并没有提供独立的包，这里就不做历史研究了。

## 工具选择

在 `React` 官方仓库中 [[查看](https://github.com/facebook/react/tree/main/packages)]，提供了以下几个包：

- `react-server-dom-parcel`
- `react-server-dom-turbopack`
- `react-server-dom-webpack`
- ...

对于 `Vite`、`Rsbuild` 有自己实现 `React SSR` 的接口

## 运行

```shell
pnpm run start
```

按照构建流程进行描述，包含：

1. 类型检测
2. 构建服务端组件
3. 构建客户端组件
4. 客户端 `map` 与服务端 `id` 同步
5. 构建类型文件
6. 启动 `server` 服务

## 1. 类型检测

```shell
pnpm run ts:check
```

`react-server-dom-webpack` 是用 `javascript` 编写，以 `cjs` 规范作为规范，没有提供相关类型，本次示例仅对必要的几个方法提供了类型补充

- 见：`./types/global.d.ts` [[源码](./types/global.d.ts)]

## 2. 服务端构建

```shell
pnpm run build:server
```

- 配置文件：`./config/webpack.config.server.ts`
- 服务端渲染用到的包：`react-server-dom-webpack/server`

### 流程：

服务端构建和现有的 `React` 几乎一致

1. 按照 `React` 正常编写业务代码
2. 客户端组件需要在第一行提供 `use client`（参考 `NextJS`）
3. 支持构建时编译服务端异步组件、异步获取数据

### 服务端构建客户端组件

方法：`registerClientReference` [[源码](./src/client/client-references.ts)]，参数说明：

- `proxyImplementation`：通过 `renderToPipeableStream` [[查看](./src/client/client-references.ts)]，读取 `rsc` 资源的时候，如果客户端组件无法渲染，将作为其代替渲染的方法，示例中直接抛出错误
- `id`：在构建客户端组件资源时的唯一标识，示例使用了相对路径
- `exportName`：默认导出用 `default`，具名导出填写导出的组件方法名

> `react-server-dom-webpack/server` 根据 `webpack` 配置中 `target` 划分以下几个文件
>
> - `server.browser.js`
> - `server.edge.js`
> - `server.node.js`（示例选择 `node`）
>
> 这和下面将要提到的运行时有关

打包后：

- 会在构建时加载异步组件、以及获取异步数据
- 客户端组件将会按照指定 `id` 进行插桩，以便项目启动后，从服务端拿到 `rsc` 资源进行替换

> 业务中有多少客户端组件，就需要通过 `registerClientReference` 手动记录 `map id`。在 `NextJS` 中这一过程由框架本身完成，开发者无需关心。这里为了研究 `RSA` 原理手动演示。

## 3. 构建客户端组件

```shell
pnpm run build:client
```

这里涉及到 3 个文件：

- 构建配置：`./config/webpack.config.client.ts` [[源码](./config/webpack.config.client.ts)]
- 客户端组件：`./src/client/ClientCounter.tsx` [[源码](./src/client/ClientCounter.tsx)]
- 客户端入口文件：`./src/client.ts` [[源码](./src/client.ts)]
