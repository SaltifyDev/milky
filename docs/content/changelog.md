# 更新日志

## 1.1.0

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
