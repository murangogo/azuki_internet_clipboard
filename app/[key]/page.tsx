// app/[key]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from './ClipboardPage.module.css'; // 引入 CSS 模块

export default function ClipboardPage({ params }: { params: { key: string } }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>(''); // 新增状态
  const { key } = params;

  // 手动更新标题
  useEffect(() => {
      document.title = `${key} - Azuki的剪贴板`;
    }, [key]);

  useEffect(() => {
    // 当组件挂载时，检查数据库是否有该 key
    const fetchClipboard = async () => {
      const res = await fetch(`/api/search?key=${key}`);
      const data = await res.json();

      if (res.ok && data.content) {
        setContent(data.content);  // 数据库中有内容，设置为内容
      } else if (res.ok && !data.content){
        setContent('');  // 数据库中有条目，无内容
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
    setMessage('正在保存......'); // 设置保存成功消息
    // 保存当前内容
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content })
    });
    setMessage('保存成功！'); // 设置保存成功消息
  };

  const handleClear = async () => {
    setMessage('正在清除......'); // 设置消息
    // 清除内容
    await fetch('/api/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, content: '' })
    });
    setContent('');
    setMessage('清除成功！'); // 设置成功消息
  };

  // 复制到剪贴板
  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content); // 将内容复制到剪贴板
      setMessage('内容已复制到剪贴板！'); // 设置复制成功消息
    } else {
      setMessage('没有内容可以复制。'); // 提示用户内容为空
    }
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>剪贴板 - {key}</h1>
      <textarea
        className={styles.textarea}
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="在这里输入内容"
      />
      <div className={styles.buttonContainer}>
        <button className={`${styles.button} ${styles.copyButton}`} onClick={handleCopy}>复制</button>
        <button className={styles.button} onClick={handleSave}>保存</button>
        <button className={`${styles.button} ${styles.clearButton}`} onClick={handleClear}>清除</button>
      </div>
      {message && <p style={{ marginTop: '10px', color: '#0070f3' }}>{message}</p>} {/* 显示提示的消息 */}
        
        <p style={{ marginTop: '20px', color: '#333' }}>
        很多时候不懂事  <span style={{ color: 'red' }}>❤️  </span>
        <a
          href="https://github.com/murangogo/azuki_internet_clipboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', marginLeft: '5px', color: '#0070f3' }}
        >
          Github
        </a>
      </p>

    </div>
  );
}
