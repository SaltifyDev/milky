export type LineWriter = {
  lines: string[];
  line: (value?: string) => void;
  toString: () => string;
};

export function createLineWriter(): LineWriter {
  const lines: string[] = [];

  return {
    lines,
    line(value: string = '') {
      lines.push(value);
    },
    toString() {
      return lines.join('\n');
    },
  };
}

export function indentLines(text: string, indent: string = '    '): string {
  return text
    .split('\n')
    .map((line) => (line.trim() ? indent + line : line))
    .join('\n');
}

function getDocLines(text: string | undefined, since?: string): string[] {
  const lines = (text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (since !== undefined) {
    lines.push(`@since ${since}`);
  }

  return lines;
}

export function formatDocText(text: string | undefined, since?: string): string {
  return getDocLines(text, since).join('\n');
}

export function formatDocComment(text: string | undefined, prefix = '/// ', since?: string): string[] {
  return getDocLines(text, since).map((line) => `${prefix}${line}`);
}

export function formatBlockDocComment(text: string | undefined, since?: string, indent = ''): string[] {
  const lines = getDocLines(text, since);

  if (lines.length === 0) {
    return [];
  }

  if (lines.length === 1) {
    return [`${indent}/** ${lines[0]} */`];
  }

  return [`${indent}/**`, ...lines.map((line) => `${indent} * ${line}`), `${indent} */`];
}
