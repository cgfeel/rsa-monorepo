# 服务端渲染 `React` 的用例

记录服务端渲染 `React` 用例实现过程，基础的概念知识会一笔带过：

- 当前仓库将展示目前已知的服务端渲染的 `React` 的用例，通过 `monorepo` 的方式分成若干个 `packages`。
- 对于服务端渲染 `React` 的基本原理，可以在网上找到相关资料，或在油管、B 站搜到相关视频，这里不做详细说明。对于浏览当前仓库的人，已默认对其服务端渲染 `React` 有一定了解。
- 每个用例实现的过程会在各自的 `packages` 下提供相关记录。

## 清单

- 手写服务端渲染 `React` 用例

`react-server-dom-webpack` 手写 `RSA` [[查看](./packages/webpack-rsc)]

```shell
pnpm -w run webpack:rsa
```

`rsbuild` 实现 `SSR` [[查看](./packages/rsbuild-ssr)]

```shell
pnpm -w run rsbuild:ssr
```

## 相关资料

- 掘金：React Server Component 教程 [[第一篇](https://juejin.cn/post/7317095140040425498)] [[第二篇](https://juejin.cn/post/7324011393601011763)]
- React Server Components Without Frameworks [[查看](https://itnext.io/react-server-components-without-frameworks-7c61c1ce0561)]
