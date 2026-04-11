import { Link } from 'nextra-theme-docs';
import { Table } from 'nextra/components';
import { JSX } from 'react';
import { useMDXComponents as getMDXComponents } from '@/mdx-components';
import SinceBadge from './SinceBadge';
import {
  IRField,
  IRNestedUnionDerivedStructType,
  IRNestedUnionStruct,
  IRPlainUnionStruct,
  IRScalarField,
  IRStruct,
} from '@saltify/milky-protocol';

const { h2: H2 } = getMDXComponents();

function renderMarkdownCode(text: string): JSX.Element {
  const codeRegex = /`([\s\S]*?)`/g;
  const result = [];
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    const precedingText = text.slice(lastIndex, match.index);
    if (precedingText) {
      result.push(precedingText);
    }
    const codeContent = match[1];
    result.push(
      <code className="nextra-code" key={match.index}>
        {codeContent}
      </code>
    );
    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    result.push(remainingText);
  }

  return <>{result.map((result) => result)}</>;
}

function renderScalarTypeName(scalarType: IRScalarField['scalarType']) {
  if (scalarType === 'bool') {
    return 'boolean';
  }
  return scalarType;
}

function renderBaseTypeName(field: IRField): JSX.Element | string {
  if (field.fieldType === 'scalar') {
    return renderScalarTypeName(field.scalarType);
  }
  if (field.fieldType === 'enum') {
    return 'enum';
  }
  if (field.fieldType === 'ref') {
    return <Link href={`/struct/${field.refStructName}`}>{field.refStructName}</Link>;
  }
  return 'Unknown struct, consult the developers to register it';
}

function renderTypeName(field: IRField): JSX.Element | string {
  let typeName: JSX.Element | string = renderBaseTypeName(field);
  if (field.isArray) {
    typeName = <>{typeName}[]</>;
  }
  if (field.isOptional) {
    typeName = (
      <>
        {typeName}
        <b>?</b>
      </>
    );
  }
  return typeName;
}

function renderFieldsTable(fields: IRField[]) {
  if (fields.length === 0) {
    return <p style={{ marginTop: '1rem' }}>此结构体无字段。</p>;
  }
  return (
    <div style={{ marginTop: '1rem' }}>
      <Table>
        <thead>
          <Table.Tr>
            <Table.Th>字段名</Table.Th>
            <Table.Th>类型</Table.Th>
            <Table.Th>描述</Table.Th>
          </Table.Tr>
        </thead>
        <tbody>{fields.map((field) => renderFieldRow(field))}</tbody>
      </Table>
    </div>
  );
}

function renderFieldRow(field: IRField) {
  let description = field.description;
  if (field.fieldType === 'enum') {
    description += `，可能值：${field.values.map((v) => `\`${v}\``).join(' ')}`;
  }
  if (field.defaultValue !== undefined) {
    description += `，默认值：\`${field.defaultValue}\``;
  }
  return (
    <Table.Tr key={field.name}>
      <Table.Td>
        {field.name}
        <SinceBadge version={field.since} />
      </Table.Td>
      <Table.Td>{renderTypeName(field)}</Table.Td>
      <Table.Td>{renderMarkdownCode(description)}</Table.Td>
    </Table.Tr>
  );
}

function renderPlainUnionStruct(struct: IRPlainUnionStruct) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1rem',
        gap: '1rem',
      }}
    >
      <p>可能的类型如下：</p>
      {struct.derivedStructs.map((option) => (
        <div key={option.tagValue}>
          <H2 id={`type-${option.tagValue}`}>
            <span style={{ fontWeight: 'bold' }}>{option.tagValue}</span>{' '}
            <span style={{ fontWeight: 'normal' }}>{option.description}</span>
            <SinceBadge version={option.since} />
          </H2>
          <Table style={{ marginTop: '1rem' }}>
            <thead>
              <Table.Tr>
                <Table.Th>字段名</Table.Th>
                <Table.Th>类型</Table.Th>
                <Table.Th>描述</Table.Th>
              </Table.Tr>
            </thead>
            <tbody>
              <Table.Tr>
                <Table.Td>{struct.tagFieldName}</Table.Td>
                <Table.Td>string</Table.Td>
                <Table.Td>
                  固定值 <code className="nextra-code">{option.tagValue}</code>，表示{option.description}
                </Table.Td>
              </Table.Tr>
              {option.fields.map((field) => renderFieldRow(field))}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
}

function renderDerivedStruct(derived: IRNestedUnionDerivedStructType) {
  return renderFieldsTable(derived.fields);
}

function renderNestedUnionStruct(struct: IRNestedUnionStruct) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1rem',
        gap: '1rem',
      }}
    >
      <Table>
        <thead>
          <Table.Tr>
            <Table.Th>字段名</Table.Th>
            <Table.Th>类型</Table.Th>
            <Table.Th>描述</Table.Th>
          </Table.Tr>
        </thead>
        <tbody>
          <Table.Tr>
            <Table.Td>{struct.tagFieldName}</Table.Td>
            <Table.Td>string</Table.Td>
            <Table.Td>类型区分字段</Table.Td>
          </Table.Tr>
          {struct.baseFields.map((field) => renderFieldRow(field))}
          <Table.Tr>
            <Table.Td>data</Table.Td>
            <Table.Td>object</Table.Td>
            <Table.Td>与 {struct.tagFieldName} 有关</Table.Td>
          </Table.Tr>
        </tbody>
      </Table>
      <p>data 在不同 {struct.tagFieldName} 下的具体类型如下：</p>
      {struct.derivedTypes.map((derived) => (
        <div key={derived.tagValue}>
          <H2 id={`type-${derived.tagValue}`}>
            <span style={{ fontWeight: 'bold' }}>{derived.tagValue}</span>{' '}
            <span style={{ fontWeight: 'normal' }}>{derived.description}</span>{' '}
            <SinceBadge version={derived.since} />
          </H2>
          {derived.derivingType === 'ref' ? (
            <p style={{ marginTop: '1rem' }}>
              参见 <Link href={`/struct/${derived.refStructName}`}>{derived.refStructName}</Link>
            </p>
          ) : (
            renderDerivedStruct(derived)
          )}
        </div>
      ))}
    </div>
  );
}

export default function StructRenderer(props: { struct: IRStruct }) {
  if (props.struct.structType === 'simple') {
    return renderFieldsTable(props.struct.fields);
  }
  if (props.struct.structType === 'union') {
    if (props.struct.unionType === 'plain') {
      return renderPlainUnionStruct(props.struct);
    }
    if (props.struct.unionType === 'withData') {
      return renderNestedUnionStruct(props.struct);
    }
  }
  return <>unsupported type</>;
}
