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

export function formatDocComment(text: string, prefix = '/// '): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `${prefix}${line}`);
}
