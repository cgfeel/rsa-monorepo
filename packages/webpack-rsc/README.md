# 使用 `react-server-dom-webpack` 实现 `RSC`

由 `React` 官方提供的服务端渲染方法，目前并没有写入官方文档；在当前仓库记录总结，包含：

- 服务端构建时加载异步组件，以及异步获取数据
- 服务端构建时加载客户端组件，并手动设置占位
- 客户端构建时生成客户端组件 `manifest` 映射文件
- 生成客户端入口资源，加载服务端生成的 `RSC` 资源 `hydrate`
- 使用 `Express` 作为服务端加载运行时所需资源，完成渲染

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
# or
pnpm -w run webpack:rsc
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

> `react-server-dom-webpack` 这个包还在开发完善中，后面可能会有比较大的调整，这里作为仅作为 `RSC` 渲染过程研究，生产环境建议使用，如：`NextJS`、`Remix` 这样成熟的框架

## 2. 服务端构建

```shell
pnpm run build:server
```

- 配置文件：`./config/webpack.config.server.ts` [[源码](./config/webpack.config.server.ts)]
- 服务端渲染用到的包：`react-server-dom-webpack/server`

### 流程

服务端构建和非服务端 `React` 项目构建几乎一致

1. 按照 `React` 正常编写业务代码
2. 客户端组件需要在第一行提供 `use client`（参考 `NextJS`）
3. 支持构建时编译服务端异步组件、异步获取数据

### 服务端编译客户端组件

方法：`registerClientReference` [[源码](./src/client/client-references.ts)]，参数说明：

- `proxyImplementation`：通过 `renderToPipeableStream` [[查看](#通过-rendertopipeablestream-加载-rsc-资源)]，读取 `RSC` 资源的时候，如果客户端组件无法渲染，将作为其代替渲染的方法，示例中直接抛出错误
- `id`：在构建客户端组件资源时的唯一标识，示例使用了相对路径
- `exportName`：默认导出用 `default`，具名导出填写导出的组件方法名

### 构建配置

`react-server-dom-webpack/server` 根据 `webpack` 配置中 `target: node` [[源码](./config/webpack.config.server.ts)] 划分以下几个文件

- `server.browser.js`
- `server.edge.js`
- `server.node.js`（示例选择 `node`）

这和启动 `server` 需要的运行时有关

> 由于需要编译业务代码的 `typescript` 类型，所以服务端打包目录设置在 `./dist`

编译过程：

- 构建时加载异步组件、以及获取异步数据
- 客户端组件将会按照指定 `id` 进行占位替换，以便项目启动后，从服务端拿到 `RSC` 资源进行替换

> 业务中有多少客户端组件，就需要通过 `registerClientReference` 手动记录 `map id`。在 `NextJS` 中这一过程由框架本身完成，开发者无需关心。这里为了演示 `RSC` 原理手动填写。

## 3. 构建客户端组件

```shell
pnpm run build:client
```

### 构建配置

和构建 `React` 业务配置一样 [[源码](./config/webpack.config.client.ts)]，包含 `RSC` 相关的配置项有：

- `entry`：配置入口文件，`./src/client.ts`
- `output.chunkFilename`：客户端组件编译切分文件
- `output.filename`：入口编译文件
- `output.path`：打包目录，需要和服务端编译区分，存放在 `./dist/client`
- `output.publicPath`：资源访问目录设置为 `/client`
- `module.rules`
  - `babel-loader`：需要添加客户端组件所需的 `react`
- `plugin`：
  - `HtmlWebpackPlugin`：设置 `/client` 的根目录静态文件
  - `ReactServerWebpackPlugin`（重要）：将项目中所有的 `use client` 文件编译为 `chunk` 文件，以及对应的 `mainifest` 映射文件，用于获取 `RSC` 资源时替换并进行 `hydrate`

`HtmlWebpackPlugin` 的静态文件来自于模板：`./public/index.html` [[源码](./public/index.html)]，编译后会将客户端入口文件 `/client/main.js` 插入入口文件中，以便加载并解析 `RSC`

### 客户端组件

`use client` 开头的组件 [[源码](./src/client/ClientCounter.tsx)]，所有需要客户端交互的部分必须通过这种方式区别服务端组件，具体参考 `React` 官方文档 [[查看](https://react.dev/reference/rsc/use-client)]

有两点需要注意：

- `registerClientReference` 是构建服务端组件时，注册客户端组件并记录占位符，不需要 `use client`
- 所有首行标记 `use client` 的文件都会在编译时记录在 `manifest` 映射表中，用于加载 `RSC` 资源后 `hydrate`

> **Todo**：`ReactServerWebpackPlugin` 的工作原理，如何记录客户端组件的，目前不清楚，但可以排除以下情况：
>
> - 通过入口文件引入解析：构建配置的入口文件中并没有引入业务组件
> - 通过服务端编译的文件：编译的文件是相对目录，生成的 `map` 文件是绝对路径
>
> 具体什么原理，如果你清楚可以在当前仓库的 `issue` 告诉我 [[去补充](https://github.com/cgfeel/rsa-monorepo/issues/new)]

### 客户端入口文件

主要做了 2 件事，详细见 [[源码](./src/client.ts)]：

- 编译客户端组件并生成 `manifest` 映射文件，上述过程
- 生成入口文件，用于加载服务端编译的 `RSC` 资源，解析后根据映射表 `hydrate`

加载编译资源 `RSC` 需要通过 `react-server-dom-webpack/client` 提供的方法 `createFromFetch`，可以通过方法类型了解 [[源码](./types/global.d.ts)]

参数：

- `input`：加载的资源，可以是 `Response` 也可以是一个 `Promise`（如果要对 `Response` 做处理的话）
- `options`：
  - `moduleBaseURL`：用于加载 `Client Components` 的代码分割模块
  - `onError`：加载解析异常时的回调函数
  - `onLoading`：加载资源时的回调函数

返回：

- 异步组件 `Promise<React.ReactElement>`

流程：

- 服务端编译时通过 `registerClientReference` 使用占位替换客户端组件
- 客户端通过 `createFromFetch` 加载服务端编译的 `RSC`
- 根据服务端编译时手动提供的 `id`，在映射文件中查找并替换后，进行 `hydrate`
- 将注水后的资源通过 `createRoot` 渲染到 `root`

### 客户端构建后编译的文件

分为 5 个部分：

- ① `*.chunk.js`：将客户端组件分成诺干个 `chunk` 文件
- ② `index.html`：静态文件，用于 `server` 启动后作为入口文件
- ③ `main.js`：打包脚本入口，用于加载并解析 `RSC` 资源
- ④ `*.manifest.json`：客户端组件映射表，`hydrate` 时使用，根据客户端和服务端会生成 2 个映射表
- ⑤ `vendors-*.js`：`React` 依赖项

## 4. 客户端 `map` 与服务端 `id` 同步

```shell
tsx ./config/fix-manifest-paths.ts
```

客户端构建的映射表 `id` 是绝对路径，而 `registerClientReference` 写的是相对路径，需要在编译后替换绝对路径为相对路径，见 [[源码](./config/fix-manifest-paths.ts)]

## 5. 构建类型文件

```shell
pnpm run ts:declaration
```

`tsconfig.json` 需要关闭 `noEmit`，其它和平常业务一样配置，省略不做说明。

## 6. 启动 `server` 服务

```shell
tsx --conditions react-server server.ts
```

在上述构建中获得以下物料，按照顺序为其配置访问接口：

| 路径                       | URL       | 说明                                                        |
| -------------------------- | --------- | ----------------------------------------------------------- |
| `./dist/client/index.html` | `/`       | 入口文件，用于加载脚本入口                                  |
| `./dist/client/`           | `/client` | 静态资源目录，包含：客户端资源入口、客户端组件 `chunk` 文件 |
| `./dist/index.js`          | `/rsc`    | 服务端编译打包后的文件，加载并解析成数据流作为接口          |

示例中使用 `Express` 作为 `server` 提供接口服务

### 写在前头

在加载资源前需要引入 `react-server-dom-webpack/node-register` 作为运行时使用，以便解析响应的资源，见：[[源码](./server.ts)]

> 在服务端构建时通过 `webpack` 配置文件中的 `target` 选择 `react-server-dom-webpack/server` 所在的环境为 `node`，那么加载资源前也需要按照运行环境引入对应的包

### 入口资源

```typescript
const clientTemplate = fs.readFileSync(path.resolve('./dist/client/index.html'), 'utf-8');

app.get('/', (_, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(clientTemplate);
});
```

打开 `./dist/client/index.html` 作为入口资源

### 加载客户端入口资源

访问时候会加载解析客户端入口资源 `/client/main.js`，通过 `fetch` 的方式加载接口 `/rsc`，并将响应结果作为 `hydrate` 资源

### 通过 `renderToPipeableStream` 加载 `RSC` 资源

将资源渲染为 `RSC Payload` 流，作为接口的 `Response` 响应结果

```typescript
const { default: App } = await import('./dist/index.js');
const clientTemplate = fs.readFileSync(path.resolve('./dist/client/index.html'), 'utf-8');

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
```

`renderToPipeableStream` 可以通过方法类型了解 [[源码](./types/global.d.ts)]

参数：

- `children`：将服务端打包的入口资源通过 `createElement` 转换为组件传入
- `webpackMap`：编译时为 `hydrate` 而生成的客户端映射文件
- `options`：配置项（可选），按照 `react-dom/server` 的同名方法写的参数类型

返回 `RSC Payload` 流带有两个方法:

- `abort`：停止渲染数据流
- `pipe`：通过管道将其作为接口响应 `Response`

### `hydrate` 过程

- 通过 `createFromFetch` 加载服务端编译的资源，并找到占位符的 `id`
- 在客户端 `manifest` 找到和 `id` 匹配的 `chunk`
- 将 `chunk` 编译后的代码，根据 `registerClientReference` 提供的导出名进行替换
- 将注水后的资源通过 `createRoot` 渲染到 `root`

### 写在后面

- 服务端构建时通过 `webpack` 的配置 `target` 决定运行环境
- 启动服务时也需要提供对应的环境
- 在运行服务时需要加上配置 `--conditions react-server` 以便提供所在环境

> 否则会默认加载通过 `server.js` 引入 `react-server-dom-webpack/server`，而这个包将默认抛出一个错误

完整的命令见：`package.json` [[源码](./package.json)]，查看演示运行 `start` 即可

```shell
pnpm run start
# or
pnpm -w run webpack:rsc
```

## 有待改进

以上是整个 `RSC` 渲染过程，即：服务端渲染 + 客户端本地注水，这就是最基本的核心，至于其它可以作为其扩展特性，有时间会单独开一个 `package`，就不在这里总结了。包含如下：

- 资源缓存
- 热更新
- 三方资源资源加载
- 服务端资源编译静态化
