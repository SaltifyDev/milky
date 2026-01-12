import StructRenderer from '@/component/StructRenderer';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { Metadata } from 'next';

import * as schemaOf from '@saltify/milky-types';
import { apiSpecCategories } from '@saltify/milky-types/namings';
import z from 'zod';

const Wrapper = getMDXComponents().wrapper;

type Props = {
  params: Promise<{ slug: string; apiCategoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `🥛 Milky | ${apiSpecCategories.find((category) => category.key === params.apiCategoryId)!.name}`,
  };
}

export function generateStaticParams() {
  return apiSpecCategories.map((category) => ({
    apiCategoryId: category.key,
  }));
}

export default async function Page(props: Props) {
  const params = await props.params;
  const apiCategory = apiSpecCategories.find((category) => category.key === params.apiCategoryId)!;
  return (
    <Wrapper
      toc={apiCategory.apiSpecs.map((spec) => ({
        depth: 2,
        value: spec.description,
        id: spec.endpoint,
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
        {apiCategory.apiSpecs.map((spec) => (
          <div
            id={spec.endpoint}
            key={spec.endpoint}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p
              className="x:text-slate-900 x:dark:text-slate-100 x:border-b nextra-border"
              style={{ fontSize: '1.75rem', marginBottom: '0.5em' }}
            >
              <b>{spec.endpoint}</b> {spec.description}
            </p>
            <p style={{ fontSize: '1.25rem', marginTop: '0.5em' }}>
              <b>输入参数</b>
            </p>
            {spec.inputStructName === null ? (
              <p style={{ marginTop: '1em' }}>此 API 无输入参数，请应用端传入 {'{}'}。</p>
            ) : (
              <StructRenderer struct={schemaOf[spec.inputStructName] as z.ZodType} />
            )}
            <p style={{ fontSize: '1.25rem', marginTop: '1em' }}>
              <b>输出参数</b>
            </p>
            {spec.outputStructName === null ? (
              <p style={{ marginTop: '1em' }}>此 API 无输出参数，请协议端传入 {'{}'}。</p>
            ) : (
              <StructRenderer struct={schemaOf[spec.outputStructName] as z.ZodType} />
            )}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
