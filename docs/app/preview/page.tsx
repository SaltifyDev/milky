import { Suspense } from 'react';
import RawPreviewClient from '@/component/RawPreviewClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Milky | 原始文件预览',
};

export default function RawPreviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: '1.5rem 1.25rem' }}>加载中...</div>}>
      <RawPreviewClient />
    </Suspense>
  );
}
