export class ClipboardRequestError extends Error {
  constructor(public readonly status: number) {
    super(`请求失败（HTTP ${status}），请稍后重试。`);
    this.name = 'ClipboardRequestError';
  }
}

export async function requestClipboard(
  url: string,
  options: RequestInit = {},
): Promise<{ content: string }> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, 15000);

  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      signal: controller.signal,
    });

    // Vercel 的运行时错误可能返回 HTML；先检查状态，避免直接解析错误页。
    if (!response.ok) throw new ClipboardRequestError(response.status);

    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !('content' in data) ||
      (data.content !== null && typeof data.content !== 'string')
    ) {
      throw new Error('服务器返回的剪贴板内容无效，请重试。');
    }

    return { content: data.content ?? '' };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('请求已超时或取消，请重试。');
    }
    if (error instanceof SyntaxError) {
      throw new Error('服务器返回的响应无法解析，请重试。');
    }
    if (error instanceof TypeError) {
      throw new Error('网络请求失败，请检查连接后重试。');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
