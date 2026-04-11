import StructRenderer from '@/component/StructRenderer';
import SinceBadge from '@/component/SinceBadge';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import { ir } from '@saltify/milky-protocol';
import { Metadata } from 'next';

const commonStructMap = new Map(ir.commonStructs.map((struct) => [struct.name, struct]));

const Wrapper = getMDXComponents().wrapper;

type Props = {
  params: Promise<{ slug: string; commonEntityName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const struct = commonStructMap.get(params.commonEntityName)!;
  return {
    title: `Milky | ${struct.description} (${params.commonEntityName})`,
  };
}

export function generateStaticParams() {
  return Array.from(commonStructMap.keys()).map((name) => ({
    commonEntityName: name,
  }));
}

export default async function Page(props: Props) {
  const params = await props.params;
  const entity = commonStructMap.get(params.commonEntityName)!;
  return (
    <Wrapper
      toc={
        entity.structType === 'union'
          ? entity.unionType === 'plain'
            ? entity.derivedStructs.map((option) => ({
                depth: 2,
                value: (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
                    {option.description || option.tagValue} <SinceBadge version={option.since} useSup={false} />
                  </div>
                ),
                id: `type-${option.tagValue}`,
              }))
            : entity.derivedTypes.map((derived) => ({
                depth: 2,
                value: (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
                    {derived.description || derived.tagValue} <SinceBadge version={derived.since} useSup={false} />
                  </div>
                ),
                id: `type-${derived.tagValue}`,
              }))
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
        <b>{entity.description}</b> ({params.commonEntityName}) <SinceBadge version={entity.since} />
      </p>
      <StructRenderer struct={entity} />
    </Wrapper>
  );
}
