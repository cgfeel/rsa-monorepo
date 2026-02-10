# 通过 `Rsbuild` 实现 `SSR`

用例来自官方文档：https://rsbuild.rs/zh/guide/advanced/ssr

> `rsbuild` 提供的 `ssr` 不支持服务端加载异步组件，在官方文档提到：
>
> - 值得注意的是，`Rsbuild` 自身不提供开箱即用的 `SSR` 能力，而是提供 `low-level` 的 `API` 和配置来允许框架开发者实现 `SSR`。如果你需要使用开箱即用的 `SSR` 支持，可以考虑使用基于 `Rsbuild` 的框架，例如 [[`Modern.js`](https://github.com/web-infra-dev/modern.js)]。
