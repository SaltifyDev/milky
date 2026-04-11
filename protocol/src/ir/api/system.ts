import { api, category, enumField, refField, scalarField } from '../../builder';
import type { IRApiCategory } from '../../types';

export const systemApiCategory: IRApiCategory = category('system', '系统 API', [
  api('get_login_info', '获取登录信息', undefined, [
    scalarField('uin', '登录 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('nickname', '登录昵称', 'string')
  ]),
  api('get_impl_info', '获取协议端信息', undefined, [
    scalarField('impl_name', '协议端名称', 'string'),
    scalarField('impl_version', '协议端版本', 'string'),
    scalarField('qq_protocol_version', '协议端使用的 QQ 协议版本', 'string'),
    enumField('qq_protocol_type', '协议端使用的 QQ 协议平台', [
      'windows',
      'linux',
      'macos',
      'android_pad',
      'android_phone',
      'ipad',
      'iphone',
      'harmony',
      'watch'
    ]),
    scalarField('milky_version', '协议端实现的 Milky 协议版本，目前为 "1.2"', 'string')
  ]),
  api('get_user_profile', '获取用户个人信息', [
    scalarField('user_id', '用户 QQ 号', 'int64', { dataType: 'uin' })
  ], [
    scalarField('nickname', '昵称', 'string'),
    scalarField('qid', 'QID', 'string'),
    scalarField('age', '年龄', 'int32'),
    enumField('sex', '性别', ['male', 'female', 'unknown']),
    scalarField('remark', '备注', 'string'),
    scalarField('bio', '个性签名', 'string'),
    scalarField('level', 'QQ 等级', 'int32'),
    scalarField('country', '国家或地区', 'string'),
    scalarField('city', '城市', 'string'),
    scalarField('school', '学校', 'string')
  ]),
  api('get_friend_list', '获取好友列表', [
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('friends', '好友列表', 'FriendEntity', { isArray: true })
  ]),
  api('get_friend_info', '获取好友信息', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('friend', '好友信息', 'FriendEntity')
  ]),
  api('get_group_list', '获取群列表', [
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('groups', '群列表', 'GroupEntity', { isArray: true })
  ]),
  api('get_group_info', '获取群信息', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('group', '群信息', 'GroupEntity')
  ]),
  api('get_group_member_list', '获取群成员列表', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('members', '群成员列表', 'GroupMemberEntity', { isArray: true })
  ]),
  api('get_group_member_info', '获取群成员信息', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('user_id', '群成员 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('no_cache', '是否强制不使用缓存', 'bool', { defaultValue: false })
  ], [
    refField('member', '群成员信息', 'GroupMemberEntity')
  ]),
  api('get_peer_pins', '获取置顶的好友和群列表', undefined, [
    refField('friends', '置顶的好友列表', 'FriendEntity', { isArray: true }),
    refField('groups', '置顶的群列表', 'GroupEntity', { isArray: true })
  ], { since: '1.2' }),
  api('set_peer_pin', '设置好友或群的置顶状态', [
    enumField('message_scene', '要设置的会话的消息场景', ['friend', 'group', 'temp']),
    scalarField('peer_id', '要设置的好友 QQ 号或群号', 'int64', { dataType: 'uin' }),
    scalarField('is_pinned', '是否置顶, `false` 表示取消置顶', 'bool', { defaultValue: true })
  ], undefined, { since: '1.2' }),
  api('set_avatar', '设置 QQ 账号头像', [
    scalarField('uri', '头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string')
  ], undefined, { since: '1.1' }),
  api('set_nickname', '设置 QQ 账号昵称', [
    scalarField('new_nickname', '新昵称', 'string')
  ], undefined, { since: '1.1' }),
  api('set_bio', '设置 QQ 账号个性签名', [
    scalarField('new_bio', '新个性签名', 'string')
  ], undefined, { since: '1.1' }),
  api('get_custom_face_url_list', '获取自定义表情 URL 列表', undefined, [
    scalarField('urls', '自定义表情 URL 列表', 'string', { isArray: true })
  ], { since: '1.1' }),
  api('get_cookies', '获取 Cookies', [
    scalarField('domain', '需要获取 Cookies 的域名', 'string')
  ], [
    scalarField('cookies', '域名对应的 Cookies 字符串', 'string')
  ]),
  api('get_csrf_token', '获取 CSRF Token', undefined, [
    scalarField('csrf_token', 'CSRF Token', 'string')
  ])
]);
