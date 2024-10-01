// app/page.tsx
export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <title>Azuki的剪贴板</title>
      <h1>
        欢迎来到
        <span style={{ color: 'blue' }}>很</span>
        <span style={{ color: 'indigo' }}>多</span>
        <span style={{ color: 'violet' }}>时</span>
        <span style={{ color: 'purple' }}>不</span>
        <span style={{ color: 'pink' }}>懂</span>
        <span style={{ color: 'brown' }}>事</span>
        的网络剪贴板
      </h1>
      <p>编辑链接以开始使用。</p>
    </div>
  );
}
