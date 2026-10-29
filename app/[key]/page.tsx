// app/[key]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ClipboardRequestError, requestClipboard } from '../lib/clipboard-client';
import styles from './ClipboardPage.module.css'; // 引入 CSS 模块

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '请求失败，请稍后重试。';
}

export default function ClipboardPage({ params }: { params: { key: string } }) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  // Next.js 14 传入客户端页面的动态路径参数经过 URI 编码。
  const key = decodeURIComponent(params.key);

  // 手动更新标题
  useEffect(() => {
      document.title = `${key} - Azuki的剪贴板`;
    }, [key]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadError('');
    setMessage('');

    const fetchClipboard = async () => {
      try {
        let data;
        try {
          data = await requestClipboard(`/api/search?key=${encodeURIComponent(key)}`, {
            signal: controller.signal,
          });
        } catch (error) {
          // 只有明确不存在时才创建；服务异常时不能当作空剪贴板处理。
          if (!(error instanceof ClipboardRequestError) || error.status !== 404) {
            throw error;
          }
          if (!active) return;
          data = await requestClipboard('/api/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, content: '' }),
            signal: controller.signal,
          });
        }
        if (active) setContent(data.content);
      } catch (error) {
        if (active) setLoadError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchClipboard();
    return () => {
      active = false;
      controller.abort();
    };
  }, [key, retryCount]);

  const persistContent = async (nextContent: string, action: '保存' | '清除') => {
    setSaving(true);
    setMessage(`正在${action}......`);
    try {
      await requestClipboard('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, content: nextContent }),
      });
      setContent(nextContent);
      setMessage(`${action}成功！`);
    } catch (error) {
      setMessage(`${action}失败：${errorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => persistContent(content, '保存');
  const handleClear = () => persistContent('', '清除');

  // 复制到剪贴板
  const handleCopy = async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        setMessage('内容已复制到剪贴板！');
      } catch {
        setMessage('复制失败，请检查浏览器的剪贴板权限。');
      }
    } else {
      setMessage('没有内容可以复制。'); // 提示用户内容为空
    }
  };

  if (loading) {
    return <p role="status">加载中...</p>;
  }

  if (loadError) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>剪贴板 - {key}</h1>
        <p role="alert">加载失败：{loadError}</p>
        <button className={styles.button} onClick={() => setRetryCount((count) => count + 1)}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>剪贴板 - {key}</h1>
      <textarea
        className={styles.textarea}
        rows={10}
        cols={50}
        value={content}
        aria-label="剪贴板内容"
        disabled={saving}
        onChange={(e) => setContent(e.target.value)}
        placeholder="在这里输入内容"
      />
      <div className={styles.buttonContainer}>
        <button className={`${styles.button} ${styles.copyButton}`} onClick={handleCopy} disabled={saving}>复制</button>
        <button className={styles.button} onClick={handleSave} disabled={saving}>保存</button>
        <button className={`${styles.button} ${styles.clearButton}`} onClick={handleClear} disabled={saving}>清除</button>
      </div>
      {message && <p role="status" style={{ marginTop: '10px', color: '#0070f3' }}>{message}</p>}
        
        <p style={{ marginTop: '20px', color: '#333' }}>
        很多时候不懂事<span style={{ marginLeft: '10px', color: 'red' }}>❤️</span>
        <a
          href="https://github.com/murangogo/azuki_internet_clipboard"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', marginLeft: '10px', color: '#0070f3' }}
        >
          Github
        </a>
      </p>

    </div>
  );
}
