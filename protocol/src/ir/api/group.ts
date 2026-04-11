import { api, category, enumField, refField, scalarField } from '../../builder';
import type { IRApiCategory } from '../../types';

export const groupApiCategory: IRApiCategory = category('group', '群聊 API', [
  api('set_group_name', '设置群名称', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('new_group_name', '新群名称', 'string')
  ]),
  api('set_group_avatar', '设置群头像', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('image_uri', '头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string')
  ]),
  api('set_group_member_card', '设置群名片', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被设置的群成员 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('card', '新群名片', 'string')
  ]),
  api('set_group_member_special_title', '设置群成员专属头衔', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被设置的群成员 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('special_title', '新专属头衔', 'string')
  ]),
  api('set_group_member_admin', '设置群管理员', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被设置的 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('is_set', '是否设置为管理员，`false` 表示取消管理员', 'bool', { defaultValue: true })
  ]),
  api('set_group_member_mute', '设置群成员禁言', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被设置的 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('duration', '禁言持续时间（秒），设为 `0` 为取消禁言', 'int32', { defaultValue: 0 })
  ]),
  api('set_group_whole_mute', '设置群全员禁言', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('is_mute', '是否开启全员禁言，`false` 表示取消全员禁言', 'bool', { defaultValue: true })
  ]),
  api('kick_group_member', '踢出群成员', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被踢的 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('reject_add_request', '是否拒绝加群申请，`false` 表示不拒绝', 'bool', { defaultValue: false })
  ]),
  api('get_group_announcements', '获取群公告列表', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' })
  ], [
    refField('announcements', '群公告列表', 'GroupAnnouncementEntity', { isArray: true })
  ]),
  api('send_group_announcement', '发送群公告', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('content', '公告内容', 'string'),
    scalarField('image_uri', '公告附带图像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string', { isOptional: true })
  ]),
  api('delete_group_announcement', '删除群公告', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('announcement_id', '公告 ID', 'string')
  ]),
  api('get_group_essence_messages', '获取群精华消息列表', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('page_index', '页码索引，从 0 开始', 'int32'),
    scalarField('page_size', '每页包含的精华消息数量', 'int32')
  ], [
    refField('messages', '精华消息列表', 'GroupEssenceMessage', { isArray: true }),
    scalarField('is_end', '是否已到最后一页', 'bool')
  ]),
  api('set_group_essence_message', '设置群精华消息', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('is_set', '是否设置为精华消息，`false` 表示取消精华', 'bool', { defaultValue: true })
  ]),
  api('quit_group', '退出群', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' })
  ]),
  api('send_group_message_reaction', '发送群消息表情回应', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '要回应的消息序列号', 'int64'),
    scalarField('reaction', '发送的回应的表情 ID', 'string'),
    enumField('reaction_type', '发送的回应类型', ['face', 'emoji'], { defaultValue: 'face', since: '1.2' }),
    scalarField('is_add', '是否添加表情，`false` 表示取消', 'bool', { defaultValue: true })
  ]),
  api('send_group_nudge', '发送群戳一戳', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '被戳的群成员 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  api('get_group_notifications', '获取群通知列表', [
    scalarField('start_notification_seq', '起始通知序列号', 'int64', { isOptional: true }),
    scalarField('is_filtered', '`true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知', 'bool', { defaultValue: false }),
    scalarField('limit', '获取的最大通知数量', 'int32', { defaultValue: 20 })
  ], [
    refField('notifications', '获取到的群通知（notification_seq 降序排列），序列号不一定连续', 'GroupNotification', { isArray: true }),
    scalarField('next_notification_seq', '下一页起始通知序列号', 'int64', { isOptional: true })
  ]),
  api('accept_group_request', '同意入群/邀请他人入群请求', [
    scalarField('notification_seq', '请求对应的通知序列号', 'int64'),
    enumField('notification_type', '请求对应的通知类型', ['join_request', 'invited_join_request']),
    scalarField('group_id', '请求所在的群号', 'int64', { dataType: 'uin' }),
    scalarField('is_filtered', '是否是被过滤的请求', 'bool', { defaultValue: false })
  ]),
  api('reject_group_request', '拒绝入群/邀请他人入群请求', [
    scalarField('notification_seq', '请求对应的通知序列号', 'int64'),
    enumField('notification_type', '请求对应的通知类型', ['join_request', 'invited_join_request']),
    scalarField('group_id', '请求所在的群号', 'int64', { dataType: 'uin' }),
    scalarField('is_filtered', '是否是被过滤的请求', 'bool', { defaultValue: false }),
    scalarField('reason', '拒绝理由', 'string', { isOptional: true })
  ]),
  api('accept_group_invitation', '同意他人邀请自身入群', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('invitation_seq', '邀请序列号', 'int64')
  ]),
  api('reject_group_invitation', '拒绝他人邀请自身入群', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('invitation_seq', '邀请序列号', 'int64')
  ])
]);
