import { api, category, enumField, refField, scalarField } from '../../builder';
import type { IRApiCategory } from '../../types';

export const messageApiCategory: IRApiCategory = category('message', '消息 API', [
  api('send_private_message', '发送私聊消息', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    refField('message', '消息内容', 'OutgoingSegment', { isArray: true })
  ], [
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('time', '消息发送时间', 'int64')
  ]),
  api('send_group_message', '发送群聊消息', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    refField('message', '消息内容', 'OutgoingSegment', { isArray: true })
  ], [
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('time', '消息发送时间', 'int64')
  ]),
  api('recall_private_message', '撤回私聊消息', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64')
  ]),
  api('recall_group_message', '撤回群聊消息', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64')
  ]),
  api('get_message', '获取消息', [
    enumField('message_scene', '消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64')
  ], [
    refField('message', '消息内容', 'IncomingMessage')
  ]),
  api('get_history_messages', '获取历史消息列表', [
    enumField('message_scene', '消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('start_message_seq', '起始消息序列号，由此开始从新到旧查询，不提供则从最新消息开始', 'int64', { isOptional: true }),
    scalarField('limit', '期望获取到的消息数量，最多 30 条', 'int32', { defaultValue: 20 })
  ], [
    refField('messages', '获取到的消息（message_seq 升序排列），部分消息可能不存在，如撤回的消息', 'IncomingMessage', { isArray: true }),
    scalarField('next_message_seq', '下一页起始消息序列号', 'int64', { isOptional: true })
  ]),
  api('get_resource_temp_url', '获取临时资源链接', [
    scalarField('resource_id', '资源 ID', 'string')
  ], [
    scalarField('url', '临时资源链接', 'string')
  ]),
  api('get_forwarded_messages', '获取合并转发消息内容', [
    scalarField('forward_id', '转发消息 ID', 'string')
  ], [
    refField('messages', '转发消息内容', 'IncomingForwardedMessage', { isArray: true })
  ]),
  api('mark_message_as_read', '标记消息为已读', [
    enumField('message_scene', '消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '标为已读的消息序列号，该消息及更早的消息将被标记为已读', 'int64')
  ])
]);
