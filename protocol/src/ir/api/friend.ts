import { api, category, enumField, refField, scalarField } from '../../builder';
import type { IRApiCategory } from '../../types';

export const friendApiCategory: IRApiCategory = category('friend', '好友 API', [
  api('send_friend_nudge', '发送好友戳一戳', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('is_self', '是否戳自己', 'bool', { defaultValue: false })
  ]),
  api('send_profile_like', '发送名片点赞', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('count', '点赞数量', 'int32', { defaultValue: 1 })
  ]),
  api('delete_friend', '删除好友', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' })
  ]),
  api('get_friend_requests', '获取好友请求列表', [
    scalarField('limit', '获取的最大请求数量', 'int32', { defaultValue: 20 }),
    scalarField('is_filtered', '`true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知', 'bool', { defaultValue: false })
  ], [
    refField('requests', '好友请求列表', 'FriendRequest', { isArray: true })
  ]),
  api('accept_friend_request', '同意好友请求', [
    scalarField('initiator_uid', '请求发起者 UID', 'string'),
    scalarField('is_filtered', '是否是被过滤的请求', 'bool', { defaultValue: false })
  ]),
  api('reject_friend_request', '拒绝好友请求', [
    scalarField('initiator_uid', '请求发起者 UID', 'string'),
    scalarField('is_filtered', '是否是被过滤的请求', 'bool', { defaultValue: false }),
    scalarField('reason', '拒绝理由', 'string', { isOptional: true })
  ])
]);
