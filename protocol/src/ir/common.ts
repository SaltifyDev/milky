import {
  enumField,
  nestedUnion, 
  nestedUnionRefVariant, 
  nestedUnionStructVariant, 
  plainUnion, 
  plainUnionStructVariant,
  refField,
  scalarField,
  struct, 
} from '../builder';
import type { IR } from '../types';

const Event = nestedUnion('Event', '事件', 'event_type', [
  scalarField('time', '事件 Unix 时间戳（秒）', 'int64'),
  scalarField('self_id', '机器人 QQ 号', 'int64', { dataType: 'uin' })
], [
  nestedUnionStructVariant('bot_offline', '机器人离线事件', [
    scalarField('reason', '下线原因', 'string')
  ]),
  nestedUnionRefVariant('message_receive', '消息接收事件', 'IncomingMessage'),
  nestedUnionStructVariant('message_recall', '消息撤回事件', [
    enumField('message_scene', '消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('sender_id', '被撤回的消息的发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('display_suffix', '撤回提示的后缀文本', 'string')
  ]),
  nestedUnionStructVariant('peer_pin_change', '会话置顶变更事件', [
    enumField('message_scene', '发生改变的会话的消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '发生改变的好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('is_pinned', '是否被置顶, `false` 表示取消置顶', 'bool')
  ], { since: '1.2' }),
  nestedUnionStructVariant('friend_request', '好友请求事件', [
    scalarField('initiator_id', '申请好友的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('initiator_uid', '用户 UID', 'string'),
    scalarField('comment', '申请附加信息', 'string'),
    scalarField('via', '申请来源', 'string')
  ]),
  nestedUnionStructVariant('group_join_request', '入群请求事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '请求对应的通知序列号', 'int64'),
    scalarField('is_filtered', '请求是否被过滤（发起自风险账户）', 'bool'),
    scalarField('initiator_id', '申请入群的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('comment', '申请附加信息', 'string')
  ]),
  nestedUnionStructVariant('group_invited_join_request', '群成员邀请他人入群请求事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '请求对应的通知序列号', 'int64'),
    scalarField('initiator_id', '邀请者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('target_user_id', '被邀请者 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  nestedUnionStructVariant('group_invitation', '他人邀请自身入群事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('invitation_seq', '邀请序列号', 'int64'),
    scalarField('initiator_id', '邀请者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('source_group_id', '来源群号，如果是通过 QQ 群邀请', 'int64', { isOptional: true, since: '1.2' })
  ]),
  nestedUnionStructVariant('friend_nudge', '好友戳一戳事件', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('is_self_send', '是否是自己发送的戳一戳', 'bool'),
    scalarField('is_self_receive', '是否是自己接收的戳一戳', 'bool'),
    scalarField('display_action', '戳一戳提示的动作文本', 'string'),
    scalarField('display_suffix', '戳一戳提示的后缀文本', 'string'),
    scalarField('display_action_img_url', '戳一戳提示的动作图片 URL，用于取代动作提示文本', 'string')
  ]),
  nestedUnionStructVariant('friend_file_upload', '好友文件上传事件', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('file_name', '文件名称', 'string'),
    scalarField('file_size', '文件大小（字节）', 'int64'),
    scalarField('file_hash', '文件的 TriSHA1 哈希值', 'string'),
    scalarField('is_self', '是否是自己发送的文件', 'bool')
  ]),
  nestedUnionStructVariant('group_admin_change', '群管理员变更事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发生变更的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin', since: '1.1' }),
    scalarField('is_set', '是否被设置为管理员，`false` 表示被取消管理员', 'bool')
  ]),
  nestedUnionStructVariant('group_essence_message_change', '群精华消息变更事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '发生变更的消息序列号', 'int64'),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin', since: '1.1' }),
    scalarField('is_set', '是否被设置为精华，`false` 表示被取消精华', 'bool')
  ]),
  nestedUnionStructVariant('group_member_increase', '群成员增加事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发生变更的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '管理员 QQ 号，如果是管理员同意入群', 'int64', { isOptional: true }),
    scalarField('invitor_id', '邀请者 QQ 号，如果是邀请入群', 'int64', { isOptional: true })
  ]),
  nestedUnionStructVariant('group_member_decrease', '群成员减少事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发生变更的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '管理员 QQ 号，如果是管理员踢出', 'int64', { isOptional: true })
  ]),
  nestedUnionStructVariant('group_disband', '群解散事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin' })
  ], { since: '1.3' }),
  nestedUnionStructVariant('group_name_change', '群名称变更事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('new_group_name', '新的群名称', 'string'),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  nestedUnionStructVariant('group_message_reaction', '群消息表情回应事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发送回应者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('face_id', '表情 ID', 'string'),
    enumField('reaction_type', '收到的回应类型', ['face', 'emoji'], { since: '1.2' }),
    scalarField('is_add', '是否为添加，`false` 表示取消回应', 'bool')
  ]),
  nestedUnionStructVariant('group_mute', '群禁言事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发生变更的用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('duration', '禁言时长（秒），为 0 表示取消禁言', 'int32')
  ]),
  nestedUnionStructVariant('group_whole_mute', '群全体禁言事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '操作者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('is_mute', '是否全员禁言，`false` 表示取消全员禁言', 'bool')
  ]),
  nestedUnionStructVariant('group_nudge', '群戳一戳事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('sender_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('receiver_id', '接收者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('display_action', '戳一戳提示的动作文本', 'string'),
    scalarField('display_suffix', '戳一戳提示的后缀文本', 'string'),
    scalarField('display_action_img_url', '戳一戳提示的动作图片 URL，用于取代动作提示文本', 'string')
  ]),
  nestedUnionStructVariant('group_file_upload', '群文件上传事件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('file_name', '文件名称', 'string'),
    scalarField('file_size', '文件大小（字节）', 'int64')
  ])
]);

const FriendEntity = struct('FriendEntity', '好友实体', [
  scalarField('user_id', '用户 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('nickname', '用户昵称', 'string'),
  enumField('sex', '用户性别', ['male', 'female', 'unknown']),
  scalarField('qid', '用户 QID', 'string'),
  scalarField('remark', '好友备注', 'string'),
  refField('category', '好友分组', 'FriendCategoryEntity')
]);

const FriendCategoryEntity = struct('FriendCategoryEntity', '好友分组实体', [
  scalarField('category_id', '好友分组 ID', 'int32'),
  scalarField('category_name', '好友分组名称', 'string')
]);

const GroupEntity = struct('GroupEntity', '群实体', [
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('group_name', '群名称', 'string'),
  scalarField('member_count', '群成员数量', 'int32'),
  scalarField('max_member_count', '群容量', 'int32'),
  scalarField('remark', '群备注', 'string', { since: '1.2' }),
  scalarField('created_time', '群创建时间，Unix 时间戳（秒）', 'int64', { since: '1.2' }),
  scalarField('description', '群简介', 'string', { since: '1.2' }),
  scalarField('question', '加群验证问题', 'string', { since: '1.2' }),
  scalarField('announcement', '群公告预览', 'string', { since: '1.2' })
]);

const GroupMemberEntity = struct('GroupMemberEntity', '群成员实体', [
  scalarField('user_id', '用户 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('nickname', '用户昵称', 'string'),
  enumField('sex', '用户性别', ['male', 'female', 'unknown']),
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('card', '成员备注', 'string'),
  scalarField('title', '专属头衔', 'string'),
  scalarField('level', '群等级，注意和 QQ 等级区分', 'int32'),
  enumField('role', '权限等级', ['owner', 'admin', 'member']),
  scalarField('join_time', '入群时间，Unix 时间戳（秒）', 'int64'),
  scalarField('last_sent_time', '最后发言时间，Unix 时间戳（秒）', 'int64'),
  scalarField('shut_up_end_time', '禁言结束时间，Unix 时间戳（秒）', 'int64', { isOptional: true })
]);

const GroupAnnouncementEntity = struct('GroupAnnouncementEntity', '群公告实体', [
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('announcement_id', '公告 ID', 'string'),
  scalarField('user_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('time', 'Unix 时间戳（秒）', 'int64'),
  scalarField('content', '公告内容', 'string'),
  scalarField('image_url', '公告图片 URL', 'string', { isOptional: true })
]);

const GroupFileEntity = struct('GroupFileEntity', '群文件实体', [
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('file_id', '文件 ID', 'string'),
  scalarField('file_name', '文件名称', 'string'),
  scalarField('parent_folder_id', '父文件夹 ID', 'string'),
  scalarField('file_size', '文件大小（字节）', 'int64'),
  scalarField('uploaded_time', '上传时的 Unix 时间戳（秒）', 'int64'),
  scalarField('expire_time', '过期时的 Unix 时间戳（秒）', 'int64', { isOptional: true }),
  scalarField('uploader_id', '上传者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('downloaded_times', '下载次数', 'int32')
]);

const GroupFolderEntity = struct('GroupFolderEntity', '群文件夹实体', [
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('folder_id', '文件夹 ID', 'string'),
  scalarField('parent_folder_id', '父文件夹 ID', 'string'),
  scalarField('folder_name', '文件夹名称', 'string'),
  scalarField('created_time', '创建时的 Unix 时间戳（秒）', 'int64'),
  scalarField('last_modified_time', '最后修改时的 Unix 时间戳（秒）', 'int64'),
  scalarField('creator_id', '创建者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('file_count', '文件数量', 'int32')
]);

const FriendRequest = struct('FriendRequest', '好友请求实体', [
  scalarField('time', '请求发起时的 Unix 时间戳（秒）', 'int64'),
  scalarField('initiator_id', '请求发起者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('initiator_uid', '请求发起者 UID', 'string'),
  scalarField('target_user_id', '目标用户 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('target_user_uid', '目标用户 UID', 'string'),
  enumField('state', '请求状态', ['pending', 'accepted', 'rejected', 'ignored']),
  scalarField('comment', '申请附加信息', 'string'),
  scalarField('via', '申请来源', 'string'),
  scalarField('is_filtered', '请求是否被过滤（发起自风险账户）', 'bool')
]);

const GroupNotification = plainUnion('GroupNotification', '群通知实体', 'type', [
  plainUnionStructVariant('join_request', '用户入群请求', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '通知序列号', 'int64'),
    scalarField('is_filtered', '请求是否被过滤（发起自风险账户）', 'bool'),
    scalarField('initiator_id', '发起者 QQ 号', 'int64', { dataType: 'uin' }),
    enumField('state', '请求状态', ['pending', 'accepted', 'rejected', 'ignored']),
    scalarField('operator_id', '处理请求的管理员 QQ 号', 'int64', { isOptional: true }),
    scalarField('comment', '入群请求附加信息', 'string')
  ]),
  plainUnionStructVariant('admin_change', '群管理员变更通知', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '通知序列号', 'int64'),
    scalarField('target_user_id', '被设置/取消用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('is_set', '是否被设置为管理员，`false` 表示被取消管理员', 'bool'),
    scalarField('operator_id', '操作者（群主）QQ 号', 'int64', { dataType: 'uin' })
  ]),
  plainUnionStructVariant('kick', '群成员被移除通知', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '通知序列号', 'int64'),
    scalarField('target_user_id', '被移除用户 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('operator_id', '移除用户的管理员 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  plainUnionStructVariant('quit', '群成员退群通知', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '通知序列号', 'int64'),
    scalarField('target_user_id', '退群用户 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  plainUnionStructVariant('invited_join_request', '群成员邀请他人入群请求', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('notification_seq', '通知序列号', 'int64'),
    scalarField('initiator_id', '邀请者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('target_user_id', '被邀请用户 QQ 号', 'int64', { dataType: 'uin' }),
    enumField('state', '请求状态', ['pending', 'accepted', 'rejected', 'ignored']),
    scalarField('operator_id', '处理请求的管理员 QQ 号', 'int64', { isOptional: true })
  ])
]);

const IncomingMessage = plainUnion('IncomingMessage', '接收消息', 'message_scene', [
  plainUnionStructVariant('friend', '好友消息', [
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('sender_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('time', '消息 Unix 时间戳（秒）', 'int64'),
    refField('segments', '消息段列表', 'IncomingSegment', { isArray: true }),
    refField('friend', '好友信息', 'FriendEntity')
  ]),
  plainUnionStructVariant('group', '群消息', [
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('sender_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('time', '消息 Unix 时间戳（秒）', 'int64'),
    refField('segments', '消息段列表', 'IncomingSegment', { isArray: true }),
    refField('group', '群信息', 'GroupEntity'),
    refField('group_member', '群成员信息', 'GroupMemberEntity')
  ]),
  plainUnionStructVariant('temp', '临时会话消息', [
    scalarField('peer_id', '好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('message_seq', '消息序列号', 'int64'),
    scalarField('sender_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('time', '消息 Unix 时间戳（秒）', 'int64'),
    refField('segments', '消息段列表', 'IncomingSegment', { isArray: true }),
    refField('group', '临时会话发送者的所在的群信息', 'GroupEntity', { isOptional: true })
  ])
]);

const IncomingForwardedMessage = struct('IncomingForwardedMessage', '接收转发消息', [
  scalarField('message_seq', '消息序列号', 'int64', { since: '1.2' }),
  scalarField('sender_name', '发送者名称', 'string'),
  scalarField('avatar_url', '发送者头像 URL', 'string'),
  scalarField('time', '消息 Unix 时间戳（秒）', 'int64'),
  refField('segments', '消息段列表', 'IncomingSegment', { isArray: true })
]);

const GroupEssenceMessage = struct('GroupEssenceMessage', '群精华消息', [
  scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
  scalarField('message_seq', '消息序列号', 'int64'),
  scalarField('message_time', '消息发送时的 Unix 时间戳（秒）', 'int64'),
  scalarField('sender_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('sender_name', '发送者名称', 'string'),
  scalarField('operator_id', '设置精华的操作者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('operator_name', '设置精华的操作者名称', 'string'),
  scalarField('operation_time', '消息被设置精华时的 Unix 时间戳（秒）', 'int64'),
  refField('segments', '消息段列表', 'IncomingSegment', { isArray: true })
]);

const IncomingSegment = nestedUnion('IncomingSegment', '接收消息段', 'type', [], [
  nestedUnionStructVariant('text', '文本消息段', [
    scalarField('text', '文本内容', 'string')
  ]),
  nestedUnionStructVariant('mention', '提及消息段', [
    scalarField('user_id', '提及的 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('name', '去掉 `@` 前缀的提及的名称', 'string', { since: '1.2' })
  ]),
  nestedUnionStructVariant('mention_all', '提及全体消息段', []),
  nestedUnionStructVariant('face', '表情消息段', [
    scalarField('face_id', '表情 ID', 'string'),
    scalarField('is_large', '是否为超级表情', 'bool', { since: '1.1' })
  ]),
  nestedUnionStructVariant('reply', '回复消息段', [
    scalarField('message_seq', '被引用的消息序列号', 'int64'),
    scalarField('sender_id', '被引用的消息发送者 QQ 号', 'int64', { dataType: 'uin', since: '1.2' }),
    scalarField('sender_name', '被引用的消息发送者名称，仅在合并转发中能够获取', 'string', { isOptional: true, since: '1.2' }),
    scalarField('time', '被引用的消息的 Unix 时间戳（秒）', 'int64', { since: '1.2' }),
    refField('segments', '被引用的消息内容', 'IncomingSegment', { isArray: true, since: '1.2' })
  ]),
  nestedUnionStructVariant('image', '图片消息段', [
    scalarField('resource_id', '资源 ID', 'string'),
    scalarField('temp_url', '临时 URL', 'string'),
    scalarField('width', '图片宽度', 'int32'),
    scalarField('height', '图片高度', 'int32'),
    scalarField('summary', '图片预览文本', 'string'),
    enumField('sub_type', '图片类型', ['normal', 'sticker'])
  ]),
  nestedUnionStructVariant('record', '语音消息段', [
    scalarField('resource_id', '资源 ID', 'string'),
    scalarField('temp_url', '临时 URL', 'string'),
    scalarField('duration', '语音时长（秒）', 'int32')
  ]),
  nestedUnionStructVariant('video', '视频消息段', [
    scalarField('resource_id', '资源 ID', 'string'),
    scalarField('temp_url', '临时 URL', 'string'),
    scalarField('width', '视频宽度', 'int32'),
    scalarField('height', '视频高度', 'int32'),
    scalarField('duration', '视频时长（秒）', 'int32')
  ]),
  nestedUnionStructVariant('file', '文件消息段', [
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('file_name', '文件名称', 'string'),
    scalarField('file_size', '文件大小（字节）', 'int64'),
    scalarField('file_hash', '文件的 TriSHA1 哈希值，仅在私聊文件中存在', 'string', { isOptional: true })
  ]),
  nestedUnionStructVariant('forward', '合并转发消息段', [
    scalarField('forward_id', '合并转发 ID', 'string'),
    scalarField('title', '合并转发标题', 'string', { since: '1.1' }),
    scalarField('preview', '合并转发预览文本', 'string', { isArray: true, since: '1.1' }),
    scalarField('summary', '合并转发摘要', 'string', { since: '1.1' })
  ]),
  nestedUnionStructVariant('market_face', '市场表情消息段', [
    scalarField('emoji_package_id', '市场表情包 ID', 'int32', { since: '1.1' }),
    scalarField('emoji_id', '市场表情 ID', 'string', { since: '1.1' }),
    scalarField('key', '市场表情 Key', 'string', { since: '1.1' }),
    scalarField('summary', '市场表情预览文本', 'string', { since: '1.1' }),
    scalarField('url', '市场表情 URL', 'string')
  ]),
  nestedUnionStructVariant('light_app', '小程序消息段', [
    scalarField('app_name', '小程序名称', 'string'),
    scalarField('json_payload', '小程序 JSON 数据', 'string')
  ]),
  nestedUnionStructVariant('xml', 'XML 消息段', [
    scalarField('service_id', '服务 ID', 'int32'),
    scalarField('xml_payload', 'XML 数据', 'string')
  ]),
  nestedUnionStructVariant('markdown', 'Markdown 消息段', [
    scalarField('content', 'Markdown 内容', 'string')
  ])
]);

const OutgoingForwardedMessage = struct('OutgoingForwardedMessage', '发送转发消息', [
  scalarField('user_id', '发送者 QQ 号', 'int64', { dataType: 'uin' }),
  scalarField('sender_name', '发送者名称', 'string'),
  scalarField('time', '消息 Unix 时间戳（秒）', 'int64', { isOptional: true, since: '1.3' }),
  refField('segments', '消息段列表', 'OutgoingSegment', { isArray: true })
]);

const OutgoingSegment = nestedUnion('OutgoingSegment', '发送消息段', 'type', [], [
  nestedUnionStructVariant('text', '文本消息段', [
    scalarField('text', '文本内容', 'string')
  ]),
  nestedUnionStructVariant('mention', '提及消息段', [
    scalarField('user_id', '提及的 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  nestedUnionStructVariant('mention_all', '提及全体消息段', []),
  nestedUnionStructVariant('face', '表情消息段', [
    scalarField('face_id', '表情 ID', 'string'),
    scalarField('is_large', '是否为超级表情', 'bool', { defaultValue: false, since: '1.1' })
  ]),
  nestedUnionStructVariant('reply', '回复消息段', [
    scalarField('message_seq', '被引用的消息序列号', 'int64')
  ]),
  nestedUnionStructVariant('image', '图片消息段', [
    scalarField('uri', '文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string'),
    enumField('sub_type', '图片类型', ['normal', 'sticker'], { defaultValue: 'normal' }),
    scalarField('summary', '图片预览文本', 'string', { isOptional: true })
  ]),
  nestedUnionStructVariant('record', '语音消息段', [
    scalarField('uri', '文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string')
  ]),
  nestedUnionStructVariant('video', '视频消息段', [
    scalarField('uri', '文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string'),
    scalarField('thumb_uri', '封面图片 URI', 'string', { isOptional: true })
  ]),
  nestedUnionStructVariant('forward', '合并转发消息段', [
    refField('messages', '合并转发消息内容', 'OutgoingForwardedMessage', { isArray: true }),
    scalarField('title', '合并转发标题', 'string', { isOptional: true, since: '1.2' }),
    scalarField('preview', '合并转发预览文本，若提供，至少 1 条，至多 4 条', 'string', { isArray: true, isOptional: true, since: '1.2' }),
    scalarField('summary', '合并转发摘要', 'string', { isOptional: true, since: '1.2' }),
    scalarField('prompt', '合并转发的预览外显文本，仅对移动端 QQ 有效', 'string', { isOptional: true, since: '1.2' })
  ]),
  nestedUnionStructVariant('light_app', '小程序消息段', [
    scalarField('json_payload', '小程序 JSON 数据', 'string')
  ], { since: '1.2' })
]);

export const commonStructs: IR['commonStructs'] = [
  Event,
  FriendEntity,
  FriendCategoryEntity,
  GroupEntity,
  GroupMemberEntity,
  GroupAnnouncementEntity,
  GroupFileEntity,
  GroupFolderEntity,
  FriendRequest,
  GroupNotification,
  IncomingMessage,
  IncomingForwardedMessage,
  GroupEssenceMessage,
  IncomingSegment,
  OutgoingForwardedMessage,
  OutgoingSegment,
];
