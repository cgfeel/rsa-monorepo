import { ReactElement } from 'react';

// 服务端组件：可以直接访问数据库/文件系统/fetch
async function fetchUsers() {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
  ];
}

export default async function ServerUserList(): Promise<ReactElement> {
  const users = await fetchUsers();
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h3>👥 用户列表 (Server Component)</h3>
      <p>数据在服务端获取，不打包到客户端</p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
