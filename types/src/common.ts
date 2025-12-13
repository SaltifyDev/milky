import { z } from 'zod';
import { ZInt32, ZInt64, ZString, ZBoolean } from './scalar';

const UserEntityBase = z.object({
  user_id: ZInt64.describe('用户 QQ 号'),
  nickname: ZString.describe('用户昵称'),
  sex: z.enum(['male', 'female', 'unknown']).describe('用户性别'),
}).describe('基础用户实体');

export const FriendCategoryEntity = z.object({
  category_id: ZInt32.describe('好友分组 ID'),
  category_name: ZString.describe('好友分组名称'),
}).describe('好友分组实体');

export const FriendEntity = UserEntityBase.extend({
  qid: ZString.describe('用户 QID'),
  remark: ZString.describe('好友备注'),
  category: z.lazy(() => FriendCategoryEntity).describe('好友分组'),
}).describe('好友实体');

export const GroupEntity = z.object({
  group_id: ZInt64.describe('群号'),
  group_name: ZString.describe('群名称'),
  member_count: ZInt32.describe('群成员数量'),
  max_member_count: ZInt32.describe('群容量'),
}).describe('群实体');

export const GroupMemberEntity = UserEntityBase.extend({
  group_id: ZInt64.describe('群号'),
  card: ZString.describe('成员备注'),
  title: ZString.describe('专属头衔'),
  level: ZInt32.describe('群等级，注意和 QQ 等级区分'),
  role: z.enum(['owner', 'admin', 'member']).describe('权限等级'),
  join_time: ZInt64.describe('入群时间，Unix 时间戳（秒）'),
  last_sent_time: ZInt64.describe('最后发言时间，Unix 时间戳（秒）'),
  shut_up_end_time: ZInt64.nullish().describe('禁言结束时间，Unix 时间戳（秒）'),
}).describe('群成员实体');

export const GroupAnnouncementEntity = z.object({
  group_id: ZInt64.describe('群号'),
  announcement_id: ZString.describe('公告 ID'),
  user_id: ZInt64.describe('发送者 QQ 号'),
  time: ZInt64.describe('Unix 时间戳（秒）'),
  content: ZString.describe('公告内容'),
  image_url: ZString.nullish().describe('公告图片 URL'),
}).describe('群公告实体');

export const GroupFileEntity = z.object({
  group_id: ZInt64.describe('群号'),
  file_id: ZString.describe('文件 ID'),
  file_name: ZString.describe('文件名称'),
  parent_folder_id: ZString.describe('父文件夹 ID'),
  file_size: ZInt64.describe('文件大小（字节）'),
  uploaded_time: ZInt64.describe('上传时的 Unix 时间戳（秒）'),
  expire_time: ZInt64.nullish().describe('过期时的 Unix 时间戳（秒）'),
  uploader_id: ZInt64.describe('上传者 QQ 号'),
  downloaded_times: ZInt32.describe('下载次数'),
}).describe('群文件实体');

export const GroupFolderEntity = z.object({
  group_id: ZInt64.describe('群号'),
  folder_id: ZString.describe('文件夹 ID'),
  parent_folder_id: ZString.describe('父文件夹 ID'),
  folder_name: ZString.describe('文件夹名称'),
  created_time: ZInt64.describe('创建时的 Unix 时间戳（秒）'),
  last_modified_time: ZInt64.describe('最后修改时的 Unix 时间戳（秒）'),
  creator_id: ZInt64.describe('创建者 QQ 号'),
  file_count: ZInt32.describe('文件数量'),
}).describe('群文件夹实体');

export const FriendRequest = z.object({
  time: ZInt64.describe('请求发起时的 Unix 时间戳（秒）'),
  initiator_id: ZInt64.describe('请求发起者 QQ 号'),
  initiator_uid: ZString.describe('请求发起者 UID'),
  target_user_id: ZInt64.describe('目标用户 QQ 号'),
  target_user_uid: ZString.describe('目标用户 UID'),
  state: z.enum(['pending', 'accepted', 'rejected', 'ignored']).describe('请求状态'),
  comment: ZString.describe('申请附加信息'),
  via: ZString.describe('申请来源'),
  is_filtered: ZBoolean.describe('请求是否被过滤（发起自风险账户）'),
}).describe('好友请求实体');

export const GroupNotification = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('join_request'), // internal type: 1
    group_id: ZInt64.describe('群号'),
    notification_seq: ZInt64.describe('通知序列号'),
    is_filtered: ZBoolean.describe('请求是否被过滤（发起自风险账户）'),
    initiator_id: ZInt64.describe('发起者 QQ 号'),
    state: z.enum(['pending', 'accepted', 'rejected', 'ignored']).describe('请求状态'),
    operator_id: ZInt64.nullish().describe('处理请求的管理员 QQ 号'),
    comment: ZString.describe('入群请求附加信息'),
  }).describe('用户入群请求'),
  z.object({
    type: z.literal('admin_change'), // internal type: 3 (set), 16 (unset)
    group_id: ZInt64.describe('群号'),
    notification_seq: ZInt64.describe('通知序列号'),
    target_user_id: ZInt64.describe('被设置/取消用户 QQ 号'),
    is_set: ZBoolean.describe('是否被设置为管理员，`false` 表示被取消管理员'),
    operator_id: ZInt64.describe('操作者（群主）QQ 号'),
  }).describe('群管理员变更通知'),
  z.object({
    type: z.literal('kick'), // internal type: 6, 7
    group_id: ZInt64.describe('群号'),
    notification_seq: ZInt64.describe('通知序列号'),
    target_user_id: ZInt64.describe('被移除用户 QQ 号'),
    operator_id: ZInt64.describe('移除用户的管理员 QQ 号'),
  }).describe('群成员被移除通知'),
  z.object({
    type: z.literal('quit'), // internal type: 13
    group_id: ZInt64.describe('群号'),
    notification_seq: ZInt64.describe('通知序列号'),
    target_user_id: ZInt64.describe('退群用户 QQ 号'),
  }).describe('群成员退群通知'),
  z.object({
    type: z.literal('invited_join_request'), // internal type: 22
    group_id: ZInt64.describe('群号'),
    notification_seq: ZInt64.describe('通知序列号'),
    initiator_id: ZInt64.describe('邀请者 QQ 号'),
    target_user_id: ZInt64.describe('被邀请用户 QQ 号'),
    state: z.enum(['pending', 'accepted', 'rejected', 'ignored']).describe('请求状态'),
    operator_id: ZInt64.nullish().describe('处理请求的管理员 QQ 号'),
  }).describe('群成员邀请他人入群请求'),
]).describe('群通知实体');

export type FriendCategoryEntity = z.infer<typeof FriendCategoryEntity>;
export type FriendEntity = z.infer<typeof FriendEntity>;
export type GroupEntity = z.infer<typeof GroupEntity>;
export type GroupMemberEntity = z.infer<typeof GroupMemberEntity>;
export type GroupAnnouncementEntity = z.infer<typeof GroupAnnouncementEntity>;
export type GroupFileEntity = z.infer<typeof GroupFileEntity>;
export type GroupFolderEntity = z.infer<typeof GroupFolderEntity>;
export type FriendRequest = z.infer<typeof FriendRequest>;
export type GroupNotification = z.infer<typeof GroupNotification>;
