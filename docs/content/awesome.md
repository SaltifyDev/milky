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
- **Karin** - [karin-plugin-adapter-milky](https://github.com/KarinJS/karin-plugin-adapter-milky) (GPL-3.0)

### 作为依赖库发布

- **Node.js** - [@saltify/milky-node-sdk](https://www.npmjs.com/package/@saltify/milky-node-sdk) (MIT)
- **Python** - [milky-python-sdk](https://pypi.org/project/milky-python-sdk/) (MIT)
- **Rust** - [milky-rust-sdk](https://crates.io/crates/milky-rust-sdk) (MIT **or** Apache 2.0)
- **.NET** - [Milky.Net.Client](https://www.nuget.org/packages/Milky.Net.Client) (MIT)
- **Go** - [Milky-go-sdk](https://github.com/Szzrain/Milky-go-sdk) (MIT)
- **Kotlin** - [milky-kt-sdk](https://central.sonatype.com/artifact/org.ntqqrev/milky-kt-sdk) (MIT)

### 作为独立项目发布

- [yuyubot](https://github.com/xiaoyu19960507/yuyubot) (Unlicense)

## 其他项目

### Type Definitions

以下是由 Milky 社区提供的类型定义包，可以在项目中直接引用。虽然没有直接提供实现或对接功能，但可以帮助开发者快速编写 Milky 协议的实现或 SDK。

- **TypeScript** - [@saltify/milky-types](https://www.npmjs.com/package/@saltify/milky-types) (CC0-1.0)
- **.NET** - [Milky.Net.Model](https://www.nuget.org/packages/Milky.Net.Model) (MIT)
- **Rust** - [milky-types](https://crates.io/crates/milky-types) (MIT **or** Apache 2.0)
- **Kotlin** - [milky-kt-types](https://central.sonatype.com/artifact/org.ntqqrev/milky-kt-types) (MIT)

### Type Definition 原始文件

Milky 官网在 `/raw` 端点下提供了一些语言的类型定义原始文件，方便开发者直接下载和使用，通过 CC0-1.0 许可证发布。点击以下链接可进行预览。

- [Kotlin 类型定义 (kotlinx.serialization)](/raw-preview?path=kotlin/kotlinx-serialization.txt)
- [Dart 类型定义 (freezed + json_serializable)](/raw-preview?path=dart/json_serializable.txt)

### 实用资源

以下是一些与 Milky 协议相关的实用资源，方便参考和使用，同样通过 CC0-1.0 许可证发布。

- [JSON Schema](/raw-preview?path=json-schema/schema.json)
- [OpenAPI Specification v3.1](/raw-preview?path=openapi/openapi.json)
- [Milky IR](/raw-preview?path=milky-ir/ir.json) - 更简洁、对 Codegen 更友好的 Milky API 中间表示形式
- [Roadmap](/raw-preview?path=markdown/roadmap.txt) - Markdown 格式的模板，用于规划你的 Milky 实现或 SDK 项目
