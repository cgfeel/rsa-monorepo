import ClientCounter from '../client/ClientCounter.tsx';
import ServerUserList from './ServerUserList.tsx';

export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>纯React RSC示例（无Next.js）</h1>
      {/* @ts-expect-error Async Server Component */}
      <ServerUserList />
      <ClientCounter />
    </div>
  );
}
