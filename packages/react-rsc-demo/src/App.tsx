import ServerUserList from "./server/ServerUserList.tsx";
import { ClientCounter } from "./client/client-references.ts";

export default function App() {
  return (
    <div
      style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "sans-serif" }}
    >
      <h1>🚀 React Server Components Demo</h1>
      <p>使用 react-server-dom-webpack 实现</p>

      {/* 混合使用 Server 和 Client Components */}
      <ServerUserList />
      <ClientCounter />

      <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
        <p>
          观察网络面板：UserList 数据通过 RSC Payload 流传输，ClientCounter
          代码在客户端执行
        </p>
      </div>
    </div>
  );
}
