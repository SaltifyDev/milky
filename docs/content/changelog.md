# 更新日志

## 1.2.0

> Released on 2026-04-06

> [!important]
>
> Milky 1.2 对应用端的兼容性作出了明确要求，请根据[兼容性](./guide/compatibility.md)页面的内容检查你的项目是否符合要求，并根据需要进行调整。

### API 更改

- 增加了与好友/群置顶有关的 API via #42
  - `get_peer_pins`
  - `set_peer_pin`
- 给 `send_group_message_reaction` 增加了参数 `reaction_type`，表示回应表情的类型，分为 QQ 系统表情 `face` 和 Emoji `emoji` 两种类型 via #41

### 数据结构更改

- 给 `GroupEntity` 增加了更多元信息 via #91
  - `remark`，表示给群的备注
  - `created_time`，表示群创建的时间
  - `description`，表示群的简介
  - `question`，表示入群问题
  - `announcement`，表示群公告预览（通常是该群最近一次的群公告内容节选）
- 增加了发送的 `light_app` 消息段，包含字段 `json_payload` 表示小程序的 JSON 内容 via #39
- 给发送的 `forward` 消息段补充更多可定制的元信息 via @clansty, originally prompted in #43
  - `title` (optional)，具体解释见 [Q&A](https://github.com/SaltifyDev/milky/issues/46)
  - `preview` (optional)，同上
  - `summary` (optional)，同上
  - `prompt` (optional)，表示合并转发在消息预览中的外显文本，**但仅对移动端 QQ 有效**
- 给接收的 `reply` 消息段增加被引用（回复）的消息的具体信息 via #38
  - `sender_id`，表示被引用的消息的发送者 QQ 号
  - `sender_name` (optional)，表示被引用的消息的发送者名称，**仅在合并转发中可以获取**
  - `time`，表示被引用的消息的发送时间
  - `segments`，表示被引用的消息的内容
- 给接收的 `mention` 消息段增加 `name` 字段，表示去除 `@` 前缀的被提及者的名称 via #48
- 给 `IncomingForwardedMessage` 增加字段 `message_seq`，表示该消息在来源会话中的序列号 via #49
- 增加了事件类型 `peer_pin_change`，表示好友或群的置顶状态改变 via #42
- 给 `group_message_reaction` 事件增加了字段 `reaction_type`，含义与上述 `send_group_message_reaction` 中的 `reaction_type` 参数相同
- 给 `group_invitation` 事件增加了字段 `source_group_id` (optional)，表示邀请的来源 QQ 群群号（如果是通过 QQ 群邀请） via #93

### 其他更改

- **技术性更改**：
  - 去除了 `@saltify/milky-types/api` 的导出，代之以 `@saltify/milky-types/namings`（目前仅作内部使用，请勿在自己的项目中依赖）
  - 修改 Zod 类型定义，使之符合兼容性要求
  - 引入了 `ZRobustArray` 来表示在 `parse` 的过程中忽略所有不合法的项而不报错的 array 类型

## 1.1.0

> Released on 2026-01-10

### API 更改

- 新增有关设置个人资料的 API via LagrangeDev/acidify#8
  - `set_avatar`
  - `set_nickname`
  - `set_bio`
- 新增删除好友 API via #27
  - `delete_friend`
- 新增获取收藏表情 API via #29
  - `get_custom_face_url_list`

### 数据结构更改

- 交换发送的 `image` 消息段中 `sub_type` 和 `summary` 的位置，将 `summary` (nullable) 放在最后
- 给接收的 `market_face` 消息段补充更多元信息 via @Chzxxuanzheng
  - `emoji_package_id`
  - `emoji_id`
  - `key`
  - `summary`
- 给 `face` 增加 `is_large` 属性，用于表示是否为超级表情，且发送的 `face` 中该属性默认值为 `false` via #32
- 给发送的 `image` 的 `sub_type` 字段补充默认值 `normal`
- 给接收的 `forward` 消息段补充更多元信息
  - `title`
  - `preview`
  - `summary`
- 给 `GroupAdminChangeEvent` 和 `GroupEssenceMessageChangeEvent` 补充 `operator_id` 字段，表示操作者 QQ 号 via #37

### 其他更改

- 给 WebHook 通信方式增加基于 `Authorization` 头的鉴权 via #31
- **技术性更改**：
  - `ZInt32` 和 `ZInt64` 不再有硬性上界，同时有下界 `0`
  - 增加了 `ZUin` 用于描述 QQ 号和群号
