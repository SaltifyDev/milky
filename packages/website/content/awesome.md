# 🕶️ Awesome Milky 🥛

Milky 作为一个新生的应用接口标准，得到了来自社区的广泛关注和积极贡献。

如果你想要将自己的项目加入以下列表，欢迎在 [Milky 的 GitHub 仓库](https://github.com/SaltifyDev/milky)提出 Pull Request。

## 协议实现

以下项目实现了 Milky 协议，提供了与 QQ 平台交互的能力。

- [Lagrange.Milky](https://github.com/LagrangeDev/LagrangeV2/tree/main/Lagrange.Milky) (GPL-3.0)
- [Yogurt](https://acidify.ntqqrev.org/yogurt/start) (GPL-3.0)
- [tanebi-milky](https://github.com/SaltifyDev/tanebi/tree/v2/packages/milky) (GPL-3.0)
- [LuckyLilliaBot](https://github.com/LLOneBot/LLOneBot) (GPL-2.0)

## 协议 SDK

以下项目提供了 Milky 协议的简便对接方式，帮助 Bot 应用开发者快速接入 Milky 协议。

### 作为框架适配器发布

- **NoneBot** - [adapter-milky](https://github.com/nonebot/adapter-milky) (MIT)
- **Koishi** - [koishi-plugin-adapter-milky](https://github.com/idranme/koishi-plugin-adapter-milky) (MIT)
- **Karin** - [karin-plugin-adapter-milky](https://github.com/KarinJS/karin-plugin-adapter-milky) (MIT)

### 作为独立项目发布

- **Node.js** - [@saltify/milky-node-sdk](https://www.npmjs.com/package/@saltify/milky-node-sdk) (CC0-1.0)
- **Rust** - [milky-rust-sdk](https://crates.io/crates/milky-rust-sdk) (MIT **or** Apache 2.0)
- **.NET** - [Milky.Net.Client](https://www.nuget.org/packages/Milky.Net.Client) (MIT)
- **Go** - [Milky-go-sdk](https://github.com/Szzrain/Milky-go-sdk) (MIT)
- **Kotlin** - [milky-kt-sdk](https://central.sonatype.com/artifact/org.ntqqrev/milky-kt-sdk) (MIT)

## 其他项目

### Type Definitions

以下是由 Milky 社区提供的类型定义包，可以在项目中直接引用。虽然没有直接提供实现或对接功能，但可以帮助开发者快速编写 Milky 协议的实现或 SDK。

- **TypeScript** - [@saltify/milky-types](https://www.npmjs.com/package/@saltify/milky-types) (CC0-1.0)
- **.NET** - [Milky.Net.Model](https://www.nuget.org/packages/Milky.Net.Model) (MIT)
- **Rust** - [milky-types](https://crates.io/crates/milky-types) (MIT **or** Apache 2.0)
- **Kotlin** - [milky-kt-types](https://central.sonatype.com/artifact/org.ntqqrev/milky-kt-types) (MIT)

以下是未发布到中心仓库的类型定义代码，可以直接从 `/raw` 端点下获取，同样可用于编写协议实现或 SDK，通过 CC0-1.0 许可发布。

- **JSON Schema** - [`/raw/json-schema/schema.json`](/raw/json-schema/schema.json.txt)
- **Kotlin** - [`/raw/kotlin/kotlinx-serialization.txt`](/raw/kotlin/kotlinx-serialization.txt.txt)

请注意，以上由社区工具生成的类型定义是**实验性**的。如对生成的类型定义有疑问，请以文档提供的定义为准，并且及时反馈。

### Roadmap

Milky 官网在 `/raw` 端点下还提供了一个 [Markdown 格式的 Roadmap 模板](/raw/markdown/roadmap.txt.txt)，用于帮助社区成员规划和自查项目对 Milky 协议的支持进度，通过 CC0-1.0 许可发布。
