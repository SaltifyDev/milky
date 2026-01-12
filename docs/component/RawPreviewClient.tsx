'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Code, Pre } from 'nextra/components';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { Link } from 'nextra-theme-docs';

type FetchState = {
  content: string;
  error: string | null;
  loading: boolean;
};

const Wrapper = getMDXComponents().wrapper;

function isValidPath(value: string) {
  if (!value) return false;
  if (value.startsWith('/')) return false;
  if (value.includes('..')) return false;
  return true;
}

function buildRawUrl(rawPath: string) {
  const encoded = rawPath
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/raw/${encoded}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    console.log('复制成功');
    return true;
  } catch (err) {
    console.error('复制失败：', err);
    return false;
  }
}

export default function RawPreviewClient() {
  const searchParams = useSearchParams();
  const rawPath = useMemo(() => searchParams.get('path')?.trim() ?? '', [searchParams]);
  const [state, setState] = useState<FetchState>({
    content: '',
    error: null,
    loading: false,
  });
  const pathWithOrigin = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URL(window.location.origin + `/raw/${rawPath}`).toString();
  }, [rawPath]);
  const [contentCopySuccess, setContentCopySuccess] = useState<boolean | null>(null);
  const [pathCopySuccess, setPathCopySuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!rawPath) {
      setState({ content: '', error: '请提供 path 查询参数。', loading: false });
      return;
    }
    if (!isValidPath(rawPath)) {
      setState({ content: '', error: 'path 不合法，请使用相对路径且不要包含 .. 。', loading: false });
      return;
    }

    const url = buildRawUrl(rawPath);
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`请求失败: ${res.status}`);
        let text = res.text();
        if (rawPath.endsWith('.json')) {
          // Format JSON for better readability
          text = text.then((t) => {
            try {
              const obj = JSON.parse(t);
              return JSON.stringify(obj, null, 2);
            } catch {
              return t;
            }
          });
        }
        return text;
      })
      .then((text) => {
        if (cancelled) return;
        setState({ content: text, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ content: '', error: err.message, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [rawPath]);

  return (
    <Wrapper toc={[]} metadata={{ title: 'Raw Preview' }}>
      <p
        className="x:tracking-tight x:text-slate-900 x:dark:text-slate-100 x:mt-2 x:text-4xl"
        style={{ fontSize: '2.25rem', marginBottom: '0.5em' }}
      >
        <b>Raw Preview</b>
      </p>
      {state.loading ? (
        <div>Loading...</div>
      ) : state.error ? (
        <div style={{ color: '#b42318' }}>{state.error}</div>
      ) : (
        <>
          <div>
            <Link
              onClick={async () => {
                const success = await copyText(state.content);
                setContentCopySuccess(success);
                setTimeout(() => setContentCopySuccess(null), 2000);
              }}
            >
              复制内容
            </Link>
            {contentCopySuccess === true && <span style={{ marginLeft: '8px', color: 'green' }}>复制成功</span>}
            {contentCopySuccess === false && <span style={{ marginLeft: '8px', color: 'red' }}>复制失败</span>}
          </div>
          <div>
            <Link
              onClick={async () => {
                const success = await copyText(pathWithOrigin);
                setPathCopySuccess(success);
                setTimeout(() => setPathCopySuccess(null), 2000);
              }}
            >
              复制路径
            </Link>
            {pathCopySuccess === true && <span style={{ marginLeft: '8px', color: 'green' }}>复制成功</span>}
            {pathCopySuccess === false && <span style={{ marginLeft: '8px', color: 'red' }}>复制失败</span>}
            <Code style={{ marginLeft: '8px' }}>{pathWithOrigin}</Code>
          </div>
          <Pre style={{ padding: '16px' }} data-pagefind-ignore={'true'}>
            <Code>{state.content}</Code>
          </Pre>
        </>
      )}
    </Wrapper>
  );
}
