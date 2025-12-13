import { z } from 'zod';
import { ZInt32, ZInt64, ZBoolean, ZString, ZInt32WithDefault, ZBooleanWithDefault } from '../scalar';
import { FriendRequest } from '../common';

export const SendFriendNudgeInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
  is_self: ZBooleanWithDefault(false).describe('是否戳自己'),
});

export const SendProfileLikeInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
  count: ZInt32WithDefault(1).describe('点赞数量'),
});

export const GetFriendRequestsInput = z.object({
  limit: ZInt32WithDefault(20).describe('获取的最大请求数量'),
  is_filtered: ZBooleanWithDefault(false).describe('`true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知'),
});

export const GetFriendRequestsOutput = z.object({
  requests: z.array(z.lazy(() => FriendRequest)).describe('好友请求列表'),
});

export const AcceptFriendRequestInput = z.object({
  initiator_uid: ZString.describe('请求发起者 UID'),
  is_filtered: ZBooleanWithDefault(false).describe('是否是被过滤的请求'),
});

export const RejectFriendRequestInput = z.object({
  initiator_uid: ZString.describe('请求发起者 UID'),
  is_filtered: ZBooleanWithDefault(false).describe('是否是被过滤的请求'),
  reason: ZString.nullish().describe('拒绝理由'),
});

export type SendFriendNudgeInput = z.infer<typeof SendFriendNudgeInput>;
export type SendProfileLikeInput = z.infer<typeof SendProfileLikeInput>;
export type GetFriendRequestsInput = z.infer<typeof GetFriendRequestsInput>;
export type GetFriendRequestsOutput = z.infer<typeof GetFriendRequestsOutput>;
export type AcceptFriendRequestInput = z.infer<typeof AcceptFriendRequestInput>;
export type RejectFriendRequestInput = z.infer<typeof RejectFriendRequestInput>;
