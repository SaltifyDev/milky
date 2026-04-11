import StructRenderer from '@/component/StructRenderer';
import SinceBadge from '@/component/SinceBadge';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { ir } from '@saltify/milky-protocol';
import { Metadata } from 'next';

const apiCategoryMap = new Map(ir.apiCategories.map((category) => [category.key, category]));

const { h1: H1, h2: H2, wrapper: Wrapper } = getMDXComponents();

type Props = {
  params: Promise<{ slug: string; apiCategoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `Milky | ${apiCategoryMap.get(params.apiCategoryId)!.name}`,
  };
}

export function generateStaticParams() {
  return ir.apiCategories.map((category) => ({
    apiCategoryId: category.key,
  }));
}

export default async function Page(props: Props) {
  const params = await props.params;
  const apiCategory = apiCategoryMap.get(params.apiCategoryId)!;
  return (
    <Wrapper
      toc={apiCategory.apis.map((spec) => ({
        depth: 2,
        value: (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
            {spec.description} <SinceBadge version={spec.since} useSup={false} />
          </div>
        ),
        id: spec.endpoint,
      }))}
      metadata={{
        title: apiCategory.name,
      }}
    >
      <H1 style={{ marginBottom: '0.5em' }}>{apiCategory.name}</H1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '1rem',
          gap: '2rem',
        }}
      >
        {apiCategory.apis.map((spec) => (
          <div
            key={spec.endpoint}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <H2 id={spec.endpoint} style={{ marginTop: 0, marginBottom: '0.5em' }}>
              <span style={{ fontWeight: 'bold' }}>{spec.endpoint}</span>{' '}
              <span style={{ fontWeight: 'normal' }}>{spec.description}</span>
              <SinceBadge version={spec.since} />
            </H2>
            <p style={{ fontSize: '1.25rem', marginTop: '0.5em' }}>
              <b>输入参数</b>
            </p>
            {spec.requestFields === undefined ? (
              <p style={{ marginTop: '1em' }}>此 API 无输入参数，请应用端传入 {'{}'}。</p>
            ) : (
              <StructRenderer
                struct={{
                  structType: 'simple',
                  name: `${spec.endpoint}-request`,
                  description: '',
                  fields: spec.requestFields,
                }}
              />
            )}
            <p style={{ fontSize: '1.25rem', marginTop: '1em' }}>
              <b>输出参数</b>
            </p>
            {spec.responseFields === undefined ? (
              <p style={{ marginTop: '1em' }}>此 API 无输出参数，请协议端传入 {'{}'}。</p>
            ) : (
              <StructRenderer
                struct={{
                  structType: 'simple',
                  name: `${spec.endpoint}-response`,
                  description: '',
                  fields: spec.responseFields,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}
