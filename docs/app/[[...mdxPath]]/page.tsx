import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents as getMDXComponents } from '../../mdx-components';
import { Metadata } from 'next';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

type Props = {
  params: Promise<{ slug: string; mdxPath: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return {
    ...metadata,
    title: metadata.title ? `🥛 Milky | ${metadata.title}` : '🥛 Milky',
  };
}

const Wrapper = getMDXComponents().wrapper;

export default async function Page(props: Props) {
  const params = await props.params;
  const { default: MDXContent, toc, metadata } = await importPage(params.mdxPath);
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
