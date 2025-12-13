import { z } from 'zod';
import { ZInt64, ZString, ZBoolean, ZInt32, ZInt32WithDefault, ZInt64WithDefault, ZBooleanWithDefault } from '../scalar';
import { GroupAnnouncementEntity, GroupNotification } from '../common';
import { GroupEssenceMessage } from '../message';

export const SetGroupNameInput = z.object({
  group_id: ZInt64.describe('群号'),
  new_group_name: ZString.describe('新群名称'),
});

export const SetGroupAvatarInput = z.object({
  group_id: ZInt64.describe('群号'),
  image_uri: ZString.describe('头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式'),
});

export const SetGroupMemberCardInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被设置的群成员 QQ 号'),
  card: ZString.describe('新群名片'),
});

export const SetGroupMemberSpecialTitleInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被设置的群成员 QQ 号'),
  special_title: ZString.describe('新专属头衔'),
});

export const SetGroupMemberAdminInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被设置的 QQ 号'),
  is_set: ZBooleanWithDefault(true).describe('是否设置为管理员，`false` 表示取消管理员'),
});

export const SetGroupMemberMuteInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被设置的 QQ 号'),
  duration: ZInt64WithDefault(0).describe('禁言持续时间（秒），设为 `0` 为取消禁言'),
});

export const SetGroupWholeMuteInput = z.object({
  group_id: ZInt64.describe('群号'),
  is_mute: ZBooleanWithDefault(true).describe('是否开启全员禁言，`false` 表示取消全员禁言'),
});

export const KickGroupMemberInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被踢的 QQ 号'),
  reject_add_request: ZBooleanWithDefault(false).describe('是否拒绝加群申请，`false` 表示不拒绝'),
});

export const GetGroupAnnouncementsInput = z.object({
  group_id: ZInt64.describe('群号'),
});

export const GetGroupAnnouncementsOutput = z.object({
  announcements: z.array(z.lazy(() => GroupAnnouncementEntity)).describe('群公告列表'),
});

export const SendGroupAnnouncementInput = z.object({
  group_id: ZInt64.describe('群号'),
  content: ZString.describe('公告内容'),
  image_uri: ZString.nullish().describe('公告附带图像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式'),
});

export const DeleteGroupAnnouncementInput = z.object({
  group_id: ZInt64.describe('群号'),
  announcement_id: ZString.describe('公告 ID'),
});

export const GetGroupEssenceMessagesInput = z.object({
  group_id: ZInt64.describe('群号'),
  page_index: ZInt32.describe('页码索引，从 0 开始'),
  page_size: ZInt32.describe('每页包含的精华消息数量'),
});

export const GetGroupEssenceMessagesOutput = z.object({
  messages: z.array(z.lazy(() => GroupEssenceMessage)).describe('精华消息列表'),
  is_end: ZBoolean.describe('是否已到最后一页'),
});

export const SetGroupEssenceMessageInput = z.object({
  group_id: ZInt64.describe('群号'),
  message_seq: ZInt64.describe('消息序列号'),
  is_set: ZBooleanWithDefault(true).describe('是否设置为精华消息，`false` 表示取消精华'),
});

export const QuitGroupInput = z.object({
  group_id: ZInt64.describe('群号'),
});

export const SendGroupMessageReactionInput = z.object({
  group_id: ZInt64.describe('群号'),
  message_seq: ZInt64.describe('要回应的消息序列号'),
  reaction: ZString.describe('表情 ID'),
  is_add: ZBooleanWithDefault(true).describe('是否添加表情，`false` 表示取消'),
});

export const SendGroupNudgeInput = z.object({
  group_id: ZInt64.describe('群号'),
  user_id: ZInt64.describe('被戳的群成员 QQ 号'),
});

export const GetGroupNotificationsInput = z.object({
  start_notification_seq: ZInt64.nullish().describe('起始通知序列号'),
  is_filtered: ZBooleanWithDefault(false).describe('`true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知'),
  limit: ZInt32WithDefault(20).describe('获取的最大通知数量'),
});

export const GetGroupNotificationsOutput = z.object({
  notifications: z.array(z.lazy(() => GroupNotification)).describe('获取到的群通知（notification_seq 降序排列），序列号不一定连续'),
  next_notification_seq: ZInt64.nullish().describe('下一页起始通知序列号'),
});

export const AcceptGroupRequestInput = z.object({
  notification_seq: ZInt64.describe('请求对应的通知序列号'),
  notification_type: z.enum(['join_request', 'invited_join_request']).describe('请求对应的通知类型'),
  group_id: ZInt64.describe('请求所在的群号'),
  is_filtered: ZBooleanWithDefault(false).describe('是否是被过滤的请求'),
});

export const RejectGroupRequestInput = z.object({
  notification_seq: ZInt64.describe('请求对应的通知序列号'),
  notification_type: z.enum(['join_request', 'invited_join_request']).describe('请求对应的通知类型'),
  group_id: ZInt64.describe('请求所在的群号'),
  is_filtered: ZBooleanWithDefault(false).describe('是否是被过滤的请求'),
  reason: ZString.nullish().describe('拒绝理由'),
});

export const AcceptGroupInvitationInput = z.object({
  group_id: ZInt64.describe('群号'),
  invitation_seq: ZInt64.describe('邀请序列号'),
});

export const RejectGroupInvitationInput = z.object({
  group_id: ZInt64.describe('群号'),
  invitation_seq: ZInt64.describe('邀请序列号'),
});

export type SetGroupNameInput = z.infer<typeof SetGroupNameInput>;
export type SetGroupAvatarInput = z.infer<typeof SetGroupAvatarInput>;
export type SetGroupMemberCardInput = z.infer<typeof SetGroupMemberCardInput>;
export type SetGroupMemberSpecialTitleInput = z.infer<typeof SetGroupMemberSpecialTitleInput>;
export type SetGroupMemberAdminInput = z.infer<typeof SetGroupMemberAdminInput>;
export type SetGroupMemberMuteInput = z.infer<typeof SetGroupMemberMuteInput>;
export type SetGroupWholeMuteInput = z.infer<typeof SetGroupWholeMuteInput>;
export type KickGroupMemberInput = z.infer<typeof KickGroupMemberInput>;
export type GetGroupAnnouncementsInput = z.infer<typeof GetGroupAnnouncementsInput>;
export type GetGroupAnnouncementsOutput = z.infer<typeof GetGroupAnnouncementsOutput>;
export type SendGroupAnnouncementInput = z.infer<typeof SendGroupAnnouncementInput>;
export type DeleteGroupAnnouncementInput = z.infer<typeof DeleteGroupAnnouncementInput>;
export type GetGroupEssenceMessagesInput = z.infer<typeof GetGroupEssenceMessagesInput>;
export type GetGroupEssenceMessagesOutput = z.infer<typeof GetGroupEssenceMessagesOutput>;
export type SetGroupEssenceMessageInput = z.infer<typeof SetGroupEssenceMessageInput>;
export type QuitGroupInput = z.infer<typeof QuitGroupInput>;
export type SendGroupMessageReactionInput = z.infer<typeof SendGroupMessageReactionInput>;
export type SendGroupNudgeInput = z.infer<typeof SendGroupNudgeInput>;
export type GetGroupNotificationsInput = z.infer<typeof GetGroupNotificationsInput>;
export type GetGroupNotificationsOutput = z.infer<typeof GetGroupNotificationsOutput>;
export type AcceptGroupRequestInput = z.infer<typeof AcceptGroupRequestInput>;
export type RejectGroupRequestInput = z.infer<typeof RejectGroupRequestInput>;
export type AcceptGroupInvitationInput = z.infer<typeof AcceptGroupInvitationInput>;
export type RejectGroupInvitationInput = z.infer<typeof RejectGroupInvitationInput>;
