async function fetchUsers() {
    // 此请求仅在服务端执行，客户端不会看到这个请求地址/逻辑
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error(`请求失败：${res.status}`);

    const users: UserItemType[] = await res.json();
    return users.slice(0, 3);
}

export default async function ServerUserList() {
    const users = await fetchUsers();
    return (
        <div>
            <h3>服务端渲染列表（Server Component）</h3>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        姓名：{user.name} | 邮箱：{user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

type UserItemType = {
    email: string;
    id: number;
    name: string;
    phone: string;
    username: string;
    website: string;
};
