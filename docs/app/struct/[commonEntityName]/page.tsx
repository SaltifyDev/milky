import StructRenderer from '@/component/StructRenderer';
import { commonStructs } from '@/app/common';
import { useMDXComponents as getMDXComponents } from '../../../mdx-components';
import { ZodDiscriminatedUnion, ZodObject } from 'zod';
import { Metadata } from 'next';

const Wrapper = getMDXComponents().wrapper;

type Props = {
  params: Promise<{ slug: string; commonEntityName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `🥛 Milky | ${commonStructs[params.commonEntityName].description} (${params.commonEntityName})`,
  };
}

export function generateStaticParams() {
  return Object.keys(commonStructs).map((name) => ({
    commonEntityName: name,
  }));
}

export default async function Page(props: Props) {
  const params = await props.params;
  const entity = commonStructs[params.commonEntityName];
  return (
    <Wrapper
      toc={
        entity instanceof ZodDiscriminatedUnion
          ? entity.options.map((option) => {
              if (!(option instanceof ZodObject)) {
                throw new Error(`Expected ZodObject, but got ${option.constructor.name}`);
              }
              const discriminatorValue = option.shape[entity.def.discriminator].value;
              return {
                depth: 2,
                value: option.description,
                id: `type-${discriminatorValue}`,
              };
            })
          : []
      }
      metadata={{
        title: entity.description,
      }}
    >
      <p
        className="x:tracking-tight x:text-slate-900 x:dark:text-slate-100 x:mt-2 x:text-4xl"
        style={{ fontSize: '2.25rem', marginBottom: '0.5em' }}
      >
        <b>{entity.description}</b> ({params.commonEntityName})
      </p>
      <StructRenderer struct={entity} />
    </Wrapper>
  );
}
