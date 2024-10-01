// app/[key]/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ClipboardPage({ params }: { params: { key: string } }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { key } = params;

  useEffect(() => {
    // 当组件挂载时，检查数据库是否有该 key
    const fetchClipboard = async () => {
      const res = await fetch(`/api/search?key=${key}`);
      const data = await res.json();

      if (res.ok && data.content) {
        setContent(data.content);  // 数据库中有内容，设置为内容
      } else {
        // 数据库中没有，创建一个空条目
        await fetch('/api/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, content: '' })
        });
      }

      setLoading(false);  // 加载完毕
    };

    fetchClipboard();
  }, [key]);

  const handleSave = async () => {
    // 保存当前内容
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content })
    });
  };

  const handleClear = async () => {
    // 清除内容
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content: '' })
    });
    setContent('');
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>剪贴板 - {key}</h1>
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="在这里输入内容"
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSave}>保存</button>
        <button onClick={handleClear} style={{ marginLeft: '10px' }}>清除</button>
      </div>
    </div>
  );
}
