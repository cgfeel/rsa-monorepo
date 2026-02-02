"use client";

import { FC, useState } from "react";

// 客户端组件：带交互逻辑（服务端组件无法实现）
const ClientCounter: FC<ClientCounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div
      style={{ border: "2px solid blue", padding: "10px", margin: "10px 0" }}
    >
      <h3>🔘 计数器 (Client Component)</h3>
      <p>这个组件在客户端交互</p>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <span style={{ margin: "0 10px", fontSize: "20px" }}>{count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
};

export default ClientCounter;

interface ClientCounterProps {
  initialCount?: number;
}
