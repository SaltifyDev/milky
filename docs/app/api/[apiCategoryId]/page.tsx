import StructRenderer from '@/component/StructRenderer';
import { apiCategories } from '@/app/common';
import { useMDXComponents as getMDXComponents } from '../../../mdx-components';
import { ZodVoid } from 'zod';
import { Metadata } from 'next';

const Wrapper = getMDXComponents().wrapper;

type Props = {
  params: Promise<{ slug: string; apiCategoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `🥛 Milky | ${apiCategories[params.apiCategoryId].name}`,
  };
}

export function generateStaticParams() {
  return Object.keys(apiCategories).map((name) => ({
    apiCategoryId: name,
  }));
}

export default async function Page(props: Props) {
  const params = await props.params;
  const apiCategory = apiCategories[params.apiCategoryId];
  return (
    <Wrapper
      toc={apiCategory.apis.map((api) => ({
        depth: 2,
        value: api.description,
        id: api.endpoint,
      }))}
      metadata={{
        title: apiCategory.name,
      }}
    >
      <p
        className="x:tracking-tight x:text-slate-900 x:dark:text-slate-100 x:mt-2 x:text-4xl"
        style={{ fontSize: '2.25rem', marginBottom: '0.5em' }}
      >
        <b>{apiCategory.name}</b>
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '1rem',
          gap: '2rem',
        }}
      >
        {apiCategory.apis.map((api) => (
          <div
            id={api.endpoint}
            key={api.endpoint}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p
              className="x:text-slate-900 x:dark:text-slate-100 x:border-b nextra-border"
              style={{ fontSize: '1.75rem', marginBottom: '0.5em' }}
            >
              <b>{api.endpoint}</b> {api.description}
            </p>
            <p style={{ fontSize: '1.25rem', marginTop: '0.5em' }}>
              <b>输入参数</b>
            </p>
            <StructRenderer struct={api.inputStruct} />
            <p style={{ fontSize: '1.25rem', marginTop: '1em' }}>
              <b>输出参数</b>
            </p>
            {api.outputStruct instanceof ZodVoid ? (
              <p style={{ marginTop: '1em' }}>此 API 无输出参数，请协议端传入 {'{}'}。</p>
            ) : (
              <StructRenderer struct={api.outputStruct} />
            )}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
