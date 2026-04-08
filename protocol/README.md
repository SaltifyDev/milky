# @saltify/milky-protocol

这是 Milky 协议的定义包，包含了以 Milky IR 形式定义的协议结构。

## 安装与使用

可以通过 npm 等包管理工具安装：

```bash
npm install @saltify/milky-protocol
```

安装后，可以在项目中导入协议定义：

```typescript
import ir from '@saltify/milky-protocol';
```

此外，也可以直接通过 CDN 获取 JSON 格式的协议定义：

```
https://cdn.jsdelivr.net/npm/@saltify/milky-protocol/dist/protocol.json
```

## Milky IR 介绍

Milky IR 是 Milky 提供的一种中间表示（Intermediate Representation），主要目的是以更少的歧义、更稳定的结构向代码生成器提供一份足够简洁的类型定义模型。一个生成器即使不理解完整的 OpenAPI 或 JSON Schema 规范，也能通过 Milky IR 来生成可用的模型和接口代码。

Milky IR 主要包含两大部分：

- 公共结构体（Common Structs）：定义了协议中使用的各种数据结构，包括普通结构体和联合类型。
- API 分类（API Categories）：按照功能划分的 API 列表，每个类别下包含相关的 API 定义。

以下是部分核心概念的介绍，并没有覆盖 IR 中的所有概念，完整类型定义可参考源代码中的 `types.ts` 文件。

### 字段（Field）

字段本身只保留实现层最常用的信息，例如：

- 字段类型
- 字段名
- 字段描述
- 是否为数组
- 是否可选
- 默认值

其中字段类型有三种：

- `scalar`：基础标量类型，如 `int32`、`int64`、`string`、`bool`
- `enum`：枚举值列表
- `ref`：对其他公共结构体的引用

此外还有字段数据类型（Data Type）的概念，主要用于标记某个字段属于特殊的数据类型。目前 Milky IR 定义了如下数据类型：

- `uin`：一种特殊的 `int64`，用于表示 QQ 号或群号。

### 联合类型（Union Struct）

联合类型往往是代码生成中最麻烦的部分之一，也是 Milky IR 相比通用描述格式更有针对性的地方。Milky IR 将联合类型分为两类：

- `plain`：当一个联合类型的各个分支本身就是彼此独立的结构时，IR 会将其表示为 `plain` union。每个分支都有自己的判别值和字段集合，适合直接映射为不同语言中的枚举变体、sealed class、tagged union 等形式。典型的例子是 `GroupNotification`。
- `withData`：当一个联合类型具有稳定的公共字段，并通过 `data` 字段承载具体分支内容时，IR 会将其表示为 `withData` union。此时公共字段会单独提取为 `baseFields`，各个分支则以派生类型的形式记录。典型的例子是 `IncomingSegment` 和 `Event`，它们沿用了 OneBot 11 的设计。
