# 🕶️ Awesome Milky 🥛

Milky 作为一个新生的应用接口标准，得到了来自社区的广泛关注和积极贡献。

如果你想要将自己的项目加入以下列表，欢迎在 [Milky 的 GitHub 仓库](https://github.com/SaltifyDev/milky)提出 Pull Request。

## 协议实现

以下项目实现了 Milky 协议，提供了与 QQ 平台交互的能力。

- [Lagrange.Milky](https://github.com/LagrangeDev/LagrangeV2/tree/main/Lagrange.Milky) (GPL-3.0)
- [Yogurt](https://acidify.ntqqrev.org/yogurt/start) (GPL-3.0)
- [LuckyLilliaBot](https://github.com/LLOneBot/LLOneBot) (GPL-2.0)

## 协议 SDK

以下项目提供了 Milky 协议的简便对接方式，帮助 Bot 应用开发者快速接入 Milky 协议。

### 作为框架适配器发布

- **NoneBot** - [adapter-milky](https://github.com/nonebot/adapter-milky) (MIT)
- **Koishi** - [koishi-plugin-adapter-milky](https://github.com/idranme/koishi-plugin-adapter-milky) (MIT)
- **Karin** - [karin-plugin-adapter-milky](https://github.com/KarinJS/karin-plugin-adapter-milky) (MIT)

### 作为依赖库发布

- **Node.js** - [@saltify/milky-tea](https://www.npmjs.com/package/@saltify/milky-tea) (MIT)
- **Python** - [milky-python-sdk](https://pypi.org/project/milky-python-sdk/) (MIT)
- **Rust** - [milky-rust-sdk](https://crates.io/crates/milky-rust-sdk) (MIT **or** Apache 2.0)
- **.NET** - [Milky.Net.Client](https://www.nuget.org/packages/Milky.Net.Client) (MIT)
- **.NET** - [Sora](https://www.nuget.org/packages/HoshikawaKaguya.Sora) (Apache 2.0)
- **Go** - [Milky-go-sdk](https://github.com/Szzrain/Milky-go-sdk) (MIT)
- **Kotlin** - [saltify-core](https://central.sonatype.com/artifact/org.ntqqrev/saltify-core) (MIT)

### 作为独立项目发布

- [yuyubot](https://github.com/xiaoyu19960507/yuyubot) (Unlicense)

## 其他项目

Milky 的协议内容以 Milky IR 的形式发布在 npm 包 [@saltify/milky-protocol](https://www.npmjs.com/package/@saltify/milky-protocol) 中，提供了 Milky IR 的原始文件和 TypeScript 导出。Milky IR 本身为 JSON 格式的协议定义，包含了 Milky 协议的所有细节内容，具体格式与介绍见上述包的 README 文件。

[milkygen](https://www.npmjs.com/package/milkygen) (MIT) 是基于 Milky IR 的代码生成 CLI，支持生成多种目标格式的类型定义，并且可以指定版本号，方便开发者根据需要生成不同版本的 Milky 协议定义。

### Type Definitions

以下是由 Milky 社区提供的类型定义包，可以在项目中直接引用。虽然没有直接提供实现或对接功能，但可以帮助开发者快速编写 Milky 协议的实现或 SDK。

- **.NET** - [Milky.Net.Model](https://www.nuget.org/packages/Milky.Net.Model) (MIT)
- **Rust** - [milky-types](https://crates.io/crates/milky-types) (MIT **or** Apache 2.0)

### 原始文件与实用资源

Milky 官网在 `/raw` 端点下提供了一些语言的类型定义原始文件和实用资源，方便开发者直接下载和使用，通过 MIT 许可证发布。点击以下链接可进行预览。所有原始文件均基于代码库的最新 commit。

- [Milky IR](/preview?path=milky-ir/ir.json)
- [Dart 类型定义 (freezed + json_serializable)](/preview?path=dart/json_serializable.txt)
- [Kotlin 类型定义 (kotlinx.serialization)](/preview?path=kotlin/kotlinx-serialization.txt)
- [Rust 类型定义 (serde)](/preview?path=rust/serde.txt)
- [TypeScript 类型定义 (仅接口)](/preview?path=typescript/static.txt)
- [TypeScript 类型定义 (Zod)](/preview?path=typescript/zod.txt)
- [JSON Schema](/preview?path=json-schema/schema.json)
- [OpenAPI Specification v3.1](/preview?path=openapi/openapi.json)
- [Markdown Roadmap](/preview?path=markdown/roadmap.txt)
