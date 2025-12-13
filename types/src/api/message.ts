import { z } from 'zod';
import { ZInt32, ZInt64, ZString } from '../scalar';
import { OutgoingSegment, IncomingMessage, IncomingForwardedMessage } from '../message';

const SendMessageApiBase = z.object({
  message: z.array(z.lazy(() => OutgoingSegment)).describe('消息内容'),
});

const SendMessageApiCommonOutput = z.object({
  message_seq: ZInt64.describe('消息序列号'),
  time: ZInt64.describe('消息发送时间'),
});

export const SendPrivateMessageInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
}).extend(SendMessageApiBase.shape);

export const SendPrivateMessageOutput = SendMessageApiCommonOutput;

export const SendGroupMessageInput = z.object({
  group_id: ZInt64.describe('群号'),
}).extend(SendMessageApiBase.shape);

export const SendGroupMessageOutput = SendMessageApiCommonOutput;

export const RecallPrivateMessageInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
  message_seq: ZInt64.describe('消息序列号'),
});

export const RecallGroupMessageInput = z.object({
  group_id: ZInt64.describe('群号'),
  message_seq: ZInt64.describe('消息序列号'),
});

export const GetMessageInput = z.object({
  message_scene: z.enum(['friend', 'group', 'temp']).describe('消息场景'),
  peer_id: ZInt64.describe('好友 QQ 号或群号'),
  message_seq: ZInt64.describe('消息序列号'),
});

export const GetMessageOutput = z.object({
  message: z.lazy(() => IncomingMessage).describe('消息内容'),
});

export const GetHistoryMessagesInput = z.object({
  message_scene: z.enum(['friend', 'group', 'temp']).describe('消息场景'),
  peer_id: ZInt64.describe('好友 QQ 号或群号'),
  start_message_seq: ZInt64.nullish().describe('起始消息序列号，由此开始从新到旧查询，不提供则从最新消息开始'),
  limit: z.number()
    .int()
    .min(1)
    .max(30)
    .nullish()
    .default(20)
    .transform<number>((v) => v ?? 20)
    .meta({ scalarType: 'int32' })
    .describe('期望获取到的消息数量，最多 30 条'),
});

export const GetHistoryMessagesOutput = z.object({
  messages: z.array(z.lazy(() => IncomingMessage)).describe('获取到的消息（message_seq 升序排列），部分消息可能不存在，如撤回的消息'),
  next_message_seq: ZInt64.nullish().describe('下一页起始消息序列号'),
});

export const GetResourceTempUrlInput = z.object({
  resource_id: ZString.describe('资源 ID'),
});

export const GetResourceTempUrlOutput = z.object({
  url: ZString.describe('临时资源链接'),
});

export const GetForwardedMessagesInput = z.object({
  forward_id: ZString.describe('转发消息 ID'),
});

export const GetForwardedMessagesOutput = z.object({
  messages: z.array(z.lazy(() => IncomingForwardedMessage)).describe('转发消息内容'),
});

export const MarkMessageAsReadInput = z.object({
  message_scene: z.enum(['friend', 'group', 'temp']).describe('消息场景'),
  peer_id: ZInt64.describe('好友 QQ 号或群号'),
  message_seq: ZInt64.describe('标为已读的消息序列号，该消息及更早的消息将被标记为已读'),
});

export type SendPrivateMessageInput = z.infer<typeof SendPrivateMessageInput>;
export type SendPrivateMessageOutput = z.infer<typeof SendPrivateMessageOutput>;
export type SendGroupMessageInput = z.infer<typeof SendGroupMessageInput>;
export type SendGroupMessageOutput = z.infer<typeof SendGroupMessageOutput>;
export type RecallPrivateMessageInput = z.infer<typeof RecallPrivateMessageInput>;
export type RecallGroupMessageInput = z.infer<typeof RecallGroupMessageInput>;
export type GetMessageInput = z.infer<typeof GetMessageInput>;
export type GetMessageOutput = z.infer<typeof GetMessageOutput>;
export type GetHistoryMessagesInput = z.infer<typeof GetHistoryMessagesInput>;
export type GetHistoryMessagesOutput = z.infer<typeof GetHistoryMessagesOutput>;
export type GetResourceTempUrlInput = z.infer<typeof GetResourceTempUrlInput>;
export type GetResourceTempUrlOutput = z.infer<typeof GetResourceTempUrlOutput>;
export type GetForwardedMessagesInput = z.infer<typeof GetForwardedMessagesInput>;
export type GetForwardedMessagesOutput = z.infer<typeof GetForwardedMessagesOutput>;
export type MarkMessageAsReadInput = z.infer<typeof MarkMessageAsReadInput>;
