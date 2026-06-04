# milkygen

Milky 代码生成 CLI，用于基于 Milky IR 生成不同目标格式的规范文件。

## 安装

```bash
npm install -g milkygen
```

安装后可直接使用命令：

```bash
milkygen
```

或直接使用 npx：

```bash
npx milkygen
```

## 命令

### 生成内容

> 别名：`g`, `gen`

```
milkygen generate <generator> [--output <file>] [--version <version>]
```

示例：

```bash
milkygen generate openapi
milkygen generate json-schema -o ./dist/schema.json
milkygen generate typescript/zod --version latest --output ./generated/schema.ts
milkygen generate rust/serde --version 1.2.1
```

参数说明：

- `--output`, `-o`: 输出文件路径；若未提供，输出到标准输出。
- `--version`, `-v`: 指定使用的 Milky IR 版本，支持以下值：
  - `latest`: 默认值，使用 npm `latest` 标签对应版本的协议定义。
  - 具体版本号: **只能使用 `1.2.1` 及以上版本**，因为协议定义在 `1.2.1` 版本中才正式发布。
  - `local`: 使用当前包依赖中的本地协议定义。不建议使用，因为可能与发布版本不一致。
- `--cdn`: 指定从哪个 CDN 获取协议定义，默认为 `unpkg`。可用值请使用 `milkygen list-cdns` 命令查看。

### 查看可用 generator

> 别名：`l`

```
milkygen list
```

### 查看可用 CDN

```
milkygen list-cdns
```

### 查看 CLI 版本

```
milkygen version
```

注意这里的 version 是指 milkygen CLI 的版本，而不是 Milky IR 协议的版本。Milky IR 协议版本需要通过 `--version` 参数指定，具体说明见上文。
