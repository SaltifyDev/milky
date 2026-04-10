# @saltify/milky-generator

Milky 代码生成 CLI，用于基于 Milky IR 生成不同目标格式的规范文件。

## 安装

```bash
npm install -g @saltify/milky-generator
```

安装后可直接使用命令：

```bash
milkygen
```

## 命令

### 查看可用 generator

```
milkygen list
```

### 生成内容

```
milkygen generate <generator> [--output <file>] [--version <version>]
```

示例：

```bash
milkygen generate openapi
milkygen generate json-schema -o ./dist/schema.json
milkygen generate typescript/zod -version latest --output ./generated/schema.ts
milkygen generate rust/serde --version 1.2.1
```

参数说明：

- `--output`, `-o`: 输出文件路径；若未提供，输出到标准输出。
- `--version`, `-v`: 指定使用的 Milky IR 版本，支持以下值：
  - `latest`: 默认值，使用 npm `latest` 标签对应版本的协议定义。
  - 具体版本号: **只能使用 `1.2.1` 及以上版本**，因为协议定义在 `1.2.1` 版本中才正式发布。
  - `local`: 使用当前包依赖中的本地协议定义。不建议使用，因为可能与发布版本不一致。

### 查看 CLI 版本

```
milkygen version
```

注意这里的 version 是指 milkygen CLI 的版本，而不是 Milky IR 协议的版本。Milky IR 协议版本需要通过 `--version` 参数指定，具体说明见上文。
