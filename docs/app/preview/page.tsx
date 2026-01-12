import { Suspense } from 'react';
import RawPreviewClient from '@/component/RawPreviewClient';

export default function RawPreviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: '1.5rem 1.25rem' }}>加载中...</div>}>
      <RawPreviewClient />
    </Suspense>
  );
}
