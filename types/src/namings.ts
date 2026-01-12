import type * as schema from '.';

export type MilkyStructName = keyof typeof schema;

export const commonStructNames: MilkyStructName[] = [
  'Event',
  'FriendEntity',
  'FriendCategoryEntity',
  'GroupEntity',
  'GroupMemberEntity',
  'GroupAnnouncementEntity',
  'GroupFileEntity',
  'GroupFolderEntity',
  'FriendRequest',
  'GroupNotification',
  'IncomingMessage',
  'IncomingForwardedMessage',
  'GroupEssenceMessage',
  'IncomingSegment',
  'OutgoingForwardedMessage',
  'OutgoingSegment',
];

export interface ApiSpecCategory {
  key: string;
  name: string;
  apiSpecs: ApiSpec[];
}

export interface ApiSpec {
  endpoint: string;
  description: string;
  inputStructName: MilkyStructName | null;
  outputStructName: MilkyStructName | null;
}

export const apiSpecCategories: ApiSpecCategory[] = [
  {
    key: 'system',
    name: '系统 API',
    apiSpecs: [
      {
        endpoint: 'get_login_info',
        description: '获取登录信息',
        inputStructName: null,
        outputStructName: 'GetLoginInfoOutput',
      },
      {
        endpoint: 'get_impl_info',
        description: '获取协议端信息',
        inputStructName: null,
        outputStructName: 'GetImplInfoOutput',
      },
      {
        endpoint: 'get_user_profile',
        description: '获取用户个人信息',
        inputStructName: 'GetUserProfileInput',
        outputStructName: 'GetUserProfileOutput',
      },
      {
        endpoint: 'get_friend_list',
        description: '获取好友列表',
        inputStructName: 'GetFriendListInput',
        outputStructName: 'GetFriendListOutput',
      },
      {
        endpoint: 'get_friend_info',
        description: '获取好友信息',
        inputStructName: 'GetFriendInfoInput',
        outputStructName: 'GetFriendInfoOutput',
      },
      {
        endpoint: 'get_group_list',
        description: '获取群列表',
        inputStructName: 'GetGroupListInput',
        outputStructName: 'GetGroupListOutput',
      },
      {
        endpoint: 'get_group_info',
        description: '获取群信息',
        inputStructName: 'GetGroupInfoInput',
        outputStructName: 'GetGroupInfoOutput',
      },
      {
        endpoint: 'get_group_member_list',
        description: '获取群成员列表',
        inputStructName: 'GetGroupMemberListInput',
        outputStructName: 'GetGroupMemberListOutput',
      },
      {
        endpoint: 'get_group_member_info',
        description: '获取群成员信息',
        inputStructName: 'GetGroupMemberInfoInput',
        outputStructName: 'GetGroupMemberInfoOutput',
      },
      {
        endpoint: 'set_avatar',
        description: '设置 QQ 账号头像',
        inputStructName: 'SetAvatarInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_nickname',
        description: '设置 QQ 账号昵称',
        inputStructName: 'SetNicknameInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_bio',
        description: '设置 QQ 账号个性签名',
        inputStructName: 'SetBioInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_custom_face_url_list',
        description: '获取自定义表情 URL 列表',
        inputStructName: null,
        outputStructName: 'GetCustomFaceUrlListOutput',
      },
      {
        endpoint: 'get_cookies',
        description: '获取 Cookies',
        inputStructName: 'GetCookiesInput',
        outputStructName: 'GetCookiesOutput',
      },
      {
        endpoint: 'get_csrf_token',
        description: '获取 CSRF Token',
        inputStructName: null,
        outputStructName: 'GetCSRFTokenOutput',
      },
    ],
  },
  {
    key: 'message',
    name: '消息 API',
    apiSpecs: [
      {
        endpoint: 'send_private_message',
        description: '发送私聊消息',
        inputStructName: 'SendPrivateMessageInput',
        outputStructName: 'SendPrivateMessageOutput',
      },
      {
        endpoint: 'send_group_message',
        description: '发送群聊消息',
        inputStructName: 'SendGroupMessageInput',
        outputStructName: 'SendGroupMessageOutput',
      },
      {
        endpoint: 'recall_private_message',
        description: '撤回私聊消息',
        inputStructName: 'RecallPrivateMessageInput',
        outputStructName: null,
      },
      {
        endpoint: 'recall_group_message',
        description: '撤回群聊消息',
        inputStructName: 'RecallGroupMessageInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_message',
        description: '获取消息',
        inputStructName: 'GetMessageInput',
        outputStructName: 'GetMessageOutput',
      },
      {
        endpoint: 'get_history_messages',
        description: '获取历史消息列表',
        inputStructName: 'GetHistoryMessagesInput',
        outputStructName: 'GetHistoryMessagesOutput',
      },
      {
        endpoint: 'get_resource_temp_url',
        description: '获取临时资源链接',
        inputStructName: 'GetResourceTempUrlInput',
        outputStructName: 'GetResourceTempUrlOutput',
      },
      {
        endpoint: 'get_forwarded_messages',
        description: '获取合并转发消息内容',
        inputStructName: 'GetForwardedMessagesInput',
        outputStructName: 'GetForwardedMessagesOutput',
      },
      {
        endpoint: 'mark_message_as_read',
        description: '标记消息为已读',
        inputStructName: 'MarkMessageAsReadInput',
        outputStructName: null,
      },
    ],
  },
  {
    key: 'friend',
    name: '好友 API',
    apiSpecs: [
      {
        endpoint: 'send_friend_nudge',
        description: '发送好友戳一戳',
        inputStructName: 'SendFriendNudgeInput',
        outputStructName: null,
      },
      {
        endpoint: 'send_profile_like',
        description: '发送名片点赞',
        inputStructName: 'SendProfileLikeInput',
        outputStructName: null,
      },
      {
        endpoint: 'delete_friend',
        description: '删除好友',
        inputStructName: 'DeleteFriendInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_friend_requests',
        description: '获取好友请求列表',
        inputStructName: 'GetFriendRequestsInput',
        outputStructName: 'GetFriendRequestsOutput',
      },
      {
        endpoint: 'accept_friend_request',
        description: '同意好友请求',
        inputStructName: 'AcceptFriendRequestInput',
        outputStructName: null,
      },
      {
        endpoint: 'reject_friend_request',
        description: '拒绝好友请求',
        inputStructName: 'RejectFriendRequestInput',
        outputStructName: null,
      },
    ],
  },
  {
    key: 'group',
    name: '群聊 API',
    apiSpecs: [
      {
        endpoint: 'set_group_name',
        description: '设置群名称',
        inputStructName: 'SetGroupNameInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_avatar',
        description: '设置群头像',
        inputStructName: 'SetGroupAvatarInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_member_card',
        description: '设置群名片',
        inputStructName: 'SetGroupMemberCardInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_member_special_title',
        description: '设置群成员专属头衔',
        inputStructName: 'SetGroupMemberSpecialTitleInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_member_admin',
        description: '设置群管理员',
        inputStructName: 'SetGroupMemberAdminInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_member_mute',
        description: '设置群成员禁言',
        inputStructName: 'SetGroupMemberMuteInput',
        outputStructName: null,
      },
      {
        endpoint: 'set_group_whole_mute',
        description: '设置群全员禁言',
        inputStructName: 'SetGroupWholeMuteInput',
        outputStructName: null,
      },
      {
        endpoint: 'kick_group_member',
        description: '踢出群成员',
        inputStructName: 'KickGroupMemberInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_group_announcements',
        description: '获取群公告列表',
        inputStructName: 'GetGroupAnnouncementsInput',
        outputStructName: 'GetGroupAnnouncementsOutput',
      },
      {
        endpoint: 'send_group_announcement',
        description: '发送群公告',
        inputStructName: 'SendGroupAnnouncementInput',
        outputStructName: null,
      },
      {
        endpoint: 'delete_group_announcement',
        description: '删除群公告',
        inputStructName: 'DeleteGroupAnnouncementInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_group_essence_messages',
        description: '获取群精华消息列表',
        inputStructName: 'GetGroupEssenceMessagesInput',
        outputStructName: 'GetGroupEssenceMessagesOutput',
      },
      {
        endpoint: 'set_group_essence_message',
        description: '设置群精华消息',
        inputStructName: 'SetGroupEssenceMessageInput',
        outputStructName: null,
      },
      {
        endpoint: 'quit_group',
        description: '退出群',
        inputStructName: 'QuitGroupInput',
        outputStructName: null,
      },
      {
        endpoint: 'send_group_message_reaction',
        description: '发送群消息表情回应',
        inputStructName: 'SendGroupMessageReactionInput',
        outputStructName: null,
      },
      {
        endpoint: 'send_group_nudge',
        description: '发送群戳一戳',
        inputStructName: 'SendGroupNudgeInput',
        outputStructName: null,
      },
      {
        endpoint: 'get_group_notifications',
        description: '获取群通知列表',
        inputStructName: 'GetGroupNotificationsInput',
        outputStructName: 'GetGroupNotificationsOutput',
      },
      {
        endpoint: 'accept_group_request',
        description: '同意入群/邀请他人入群请求',
        inputStructName: 'AcceptGroupRequestInput',
        outputStructName: null,
      },
      {
        endpoint: 'reject_group_request',
        description: '拒绝入群/邀请他人入群请求',
        inputStructName: 'RejectGroupRequestInput',
        outputStructName: null,
      },
      {
        endpoint: 'accept_group_invitation',
        description: '同意他人邀请自身入群',
        inputStructName: 'AcceptGroupInvitationInput',
        outputStructName: null,
      },
      {
        endpoint: 'reject_group_invitation',
        description: '拒绝他人邀请自身入群',
        inputStructName: 'RejectGroupInvitationInput',
        outputStructName: null,
      },
    ],
  },
  {
    key: 'file',
    name: '文件 API',
    apiSpecs: [
      {
        endpoint: 'upload_private_file',
        description: '上传私聊文件',
        inputStructName: 'UploadPrivateFileInput',
        outputStructName: 'UploadPrivateFileOutput',
      },
      {
        endpoint: 'upload_group_file',
        description: '上传群文件',
        inputStructName: 'UploadGroupFileInput',
        outputStructName: 'UploadGroupFileOutput',
      },
      {
        endpoint: 'get_private_file_download_url',
        description: '获取私聊文件下载链接',
        inputStructName: 'GetPrivateFileDownloadUrlInput',
        outputStructName: 'GetPrivateFileDownloadUrlOutput',
      },
      {
        endpoint: 'get_group_file_download_url',
        description: '获取群文件下载链接',
        inputStructName: 'GetGroupFileDownloadUrlInput',
        outputStructName: 'GetGroupFileDownloadUrlOutput',
      },
      {
        endpoint: 'get_group_files',
        description: '获取群文件列表',
        inputStructName: 'GetGroupFilesInput',
        outputStructName: 'GetGroupFilesOutput',
      },
      {
        endpoint: 'move_group_file',
        description: '移动群文件',
        inputStructName: 'MoveGroupFileInput',
        outputStructName: null,
      },
      {
        endpoint: 'rename_group_file',
        description: '重命名群文件',
        inputStructName: 'RenameGroupFileInput',
        outputStructName: null,
      },
      {
        endpoint: 'delete_group_file',
        description: '删除群文件',
        inputStructName: 'DeleteGroupFileInput',
        outputStructName: null,
      },
      {
        endpoint: 'create_group_folder',
        description: '创建群文件夹',
        inputStructName: 'CreateGroupFolderInput',
        outputStructName: 'CreateGroupFolderOutput',
      },
      {
        endpoint: 'rename_group_folder',
        description: '重命名群文件夹',
        inputStructName: 'RenameGroupFolderInput',
        outputStructName: null,
      },
      {
        endpoint: 'delete_group_folder',
        description: '删除群文件夹',
        inputStructName: 'DeleteGroupFolderInput',
        outputStructName: null,
      },
    ],
  },
];
