import { commonStructs } from '@/app/common';
import { Link } from 'nextra-theme-docs';
import { Table } from 'nextra/components';
import { JSX } from 'react';
import { z } from 'zod';
import { $ZodType } from 'zod/v4/core';

const commonStructNames = new Map<$ZodType, string>(
  Object.entries(commonStructs).map(([name, struct]) => [struct, name])
);

function renderTypeName(type: $ZodType): JSX.Element | string {
  if (type instanceof z.ZodArray) {
    return <>{renderTypeName(type.element)}[]</>;
  }
  if (type instanceof z.ZodNumber) {
    return (type.meta()?.scalarType as string | undefined) ?? 'int32';
  }
  if (type instanceof z.ZodBoolean) {
    return 'boolean';
  }
  if (type instanceof z.ZodString) {
    return 'string';
  }
  if (type instanceof z.ZodEnum) {
    return type.options.map((e) => JSON.stringify(e)).join(' | ');
  }
  if (type instanceof z.ZodNullable) {
    return renderTypeName(type.unwrap());
  }
  if (type instanceof z.ZodPipe) {
    return renderTypeName(type.def.in);
  }
  if (type instanceof z.ZodOptional) {
    return <>{renderTypeName(type.unwrap())} (optional)</>;
  }
  if (type instanceof z.ZodDefault) {
    let unwrapped = type.unwrap();
    if (unwrapped instanceof z.ZodOptional) {
      unwrapped = unwrapped.unwrap();
    }
    if (unwrapped instanceof z.ZodNullable) {
      unwrapped = unwrapped.unwrap();
    }
    return (
      <>
        {renderTypeName(unwrapped)} (default: {JSON.stringify(type.def.defaultValue)})
      </>
    );
  }
  if (type instanceof z.ZodLazy) {
    return renderTypeName(type.unwrap());
  }
  if (commonStructNames.has(type)) {
    return renderCommonStructName(type);
  }
  return 'Unknown struct, consult the developers to register it';
}

function renderCommonStructName(type: $ZodType): JSX.Element {
  const structName = commonStructNames.get(type)!;
  return <Link href={`/struct/${structName}`}>{structName}</Link>;
}

function renderZodObject(struct: z.ZodObject) {
  if (Object.keys(struct.shape).length === 0) {
    return <p style={{ marginTop: '1rem' }}>此对象无字段，请传入 {'{}'}。</p>;
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
        <tbody>{Object.entries<z.ZodType>(struct.shape).map(([key, value]) => renderZodObjectRow(key, value))}</tbody>
      </Table>
    </div>
  );
}

function renderZodObjectRow(key: string, ztype: z.ZodType) {
  return (
    <Table.Tr key={key}>
      <Table.Td>{key}</Table.Td>
      <Table.Td>{renderTypeName(ztype)}</Table.Td>
      <Table.Td>{ztype.description}</Table.Td>
    </Table.Tr>
  );
}

function renderZodDiscriminatedUnion(struct: z.ZodDiscriminatedUnion) {
  const keysList = struct.options.map((option) => {
    if (option instanceof z.ZodObject) {
      return Object.keys(option.shape);
    } else {
      throw new Error('Expected ZodDiscriminatedUnion to contain ZodObject');
    }
  });
  // Check if all options have the same keys
  if (keysList.every((keys) => keys.length === keysList[0].length && keys.every((key) => keysList[0].includes(key)))) {
    if (!keysList[0].includes('data')) {
      throw new Error('Expected all options to have a "data" field');
    }
    const commonKeys = keysList[0].filter((key) => key !== 'data' && key !== struct.def.discriminator);
    const firstOption = struct.options[0];
    if (!(firstOption instanceof z.ZodObject)) {
      throw new Error('Expected first option to be a ZodObject');
    }
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
              <Table.Td>{struct.def.discriminator}</Table.Td>
              <Table.Td>string</Table.Td>
              <Table.Td>类型区分字段</Table.Td>
            </Table.Tr>
            {commonKeys.map((key) => renderZodObjectRow(key, firstOption.shape[key]))}
            <Table.Tr>
              <Table.Td>data</Table.Td>
              <Table.Td>object</Table.Td>
              <Table.Td>与 {struct.def.discriminator} 有关</Table.Td>
            </Table.Tr>
          </tbody>
        </Table>
        <p>data 在不同 {struct.def.discriminator} 下的具体类型如下：</p>
        {struct.options.map((option) => {
          if (!(option instanceof z.ZodObject)) {
            throw new Error('Expected option to be a ZodObject');
          }
          const discriminatorValue = (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string;
          return (
            <div id={`type-${discriminatorValue}`} key={discriminatorValue} style={{ marginTop: '2rem' }}>
              <p
                className="x:text-slate-900 x:dark:text-slate-100 x:border-b nextra-border"
                style={{ fontSize: '1.75rem' }}
              >
                <b>{discriminatorValue}</b> {option.description}
              </p>
              {option.shape.data instanceof z.ZodLazy ? (
                <p style={{ marginTop: '1rem' }}>参见 {renderCommonStructName(option.shape.data.unwrap())}</p> // todo
              ) : commonStructNames.has(option.shape.data) ? (
                <p style={{ marginTop: '1rem' }}>参见 {renderCommonStructName(option.shape.data)}</p>
              ) : (
                <StructRenderer struct={option.shape.data} />
              )}
            </div>
          );
        })}
      </div>
    );
  } else {
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
        {struct.options.map((option) => {
          if (!(option instanceof z.ZodObject)) {
            throw new Error('Expected option to be a ZodObject');
          }
          const discriminatorValue = (option.shape[struct.def.discriminator] as z.ZodLiteral).value as string;
          return (
            <div id={`type-${discriminatorValue}`} key={discriminatorValue} style={{ marginTop: '2rem' }}>
              <p
                className="x:text-slate-900 x:dark:text-slate-100 x:border-b nextra-border"
                style={{ fontSize: '1.75rem' }}
              >
                <b>{discriminatorValue}</b> {option.description}
              </p>
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
                    <Table.Td>{struct.def.discriminator}</Table.Td>
                    <Table.Td>&quot;{discriminatorValue}&quot;</Table.Td>
                    <Table.Td>表示{option.description}</Table.Td>
                  </Table.Tr>
                  {Object.entries<z.ZodType>(option.shape)
                    .filter(([key]) => key !== struct.def.discriminator)
                    .map(([key, value]) => renderZodObjectRow(key, value))}
                </tbody>
              </Table>
            </div>
          );
        })}
      </div>
    );
  }
}

export default function StructRenderer(props: { struct: z.ZodType }) {
  if (props.struct instanceof z.ZodObject) {
    return renderZodObject(props.struct);
  }
  if (props.struct instanceof z.ZodDiscriminatedUnion) {
    return renderZodDiscriminatedUnion(props.struct);
  }
  return <>unsupported type</>;
}
