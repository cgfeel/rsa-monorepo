'use client';

import { type FC, useState } from 'react';

// 客户端组件：带交互逻辑（服务端组件无法实现）
const ClientCounter: FC<ClientCounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>客户端交互组件（Client Component）</h3>
      <button onClick={() => setCount(count + 1)}>点击计数：{count}</button>
    </div>
  );
};

export default ClientCounter;

interface ClientCounterProps {
  initialCount?: number;
}
