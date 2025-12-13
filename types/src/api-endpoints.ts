import type * as types from '.';
type TypeName = keyof typeof types;

export const commonStructs: TypeName[] = [
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

export interface Api {
  endpoint: string;
  description: string;
  inputStruct: TypeName | null;
  outputStruct: TypeName | null;
}

export interface ApiCategory {
  name: string;
  apis: Api[];
}

export const apiCategories: Record<string, ApiCategory> = {
  system: {
    name: '系统 API',
    apis: [
      {
        endpoint: 'get_login_info',
        description: '获取登录信息',
        inputStruct: null,
        outputStruct: 'GetLoginInfoOutput',
      },
      {
        endpoint: 'get_impl_info',
        description: '获取协议端信息',
        inputStruct: null,
        outputStruct: 'GetImplInfoOutput',
      },
      {
        endpoint: 'get_user_profile',
        description: '获取用户个人信息',
        inputStruct: 'GetUserProfileInput',
        outputStruct: 'GetUserProfileOutput',
      },
      {
        endpoint: 'get_friend_list',
        description: '获取好友列表',
        inputStruct: 'GetFriendListInput',
        outputStruct: 'GetFriendListOutput',
      },
      {
        endpoint: 'get_friend_info',
        description: '获取好友信息',
        inputStruct: 'GetFriendInfoInput',
        outputStruct: 'GetFriendInfoOutput',
      },
      {
        endpoint: 'get_group_list',
        description: '获取群列表',
        inputStruct: 'GetGroupListInput',
        outputStruct: 'GetGroupListOutput',
      },
      {
        endpoint: 'get_group_info',
        description: '获取群信息',
        inputStruct: 'GetGroupInfoInput',
        outputStruct: 'GetGroupInfoOutput',
      },
      {
        endpoint: 'get_group_member_list',
        description: '获取群成员列表',
        inputStruct: 'GetGroupMemberListInput',
        outputStruct: 'GetGroupMemberListOutput',
      },
      {
        endpoint: 'get_group_member_info',
        description: '获取群成员信息',
        inputStruct: 'GetGroupMemberInfoInput',
        outputStruct: 'GetGroupMemberInfoOutput',
      },
      {
        endpoint: 'get_cookies',
        description: '获取 Cookies',
        inputStruct: 'GetCookiesInput',
        outputStruct: 'GetCookiesOutput',
      },
      {
        endpoint: 'get_csrf_token',
        description: '获取 CSRF Token',
        inputStruct: null,
        outputStruct: 'GetCSRFTokenOutput',
      },
    ],
  },
  message: {
    name: '消息 API',
    apis: [
      {
        endpoint: 'send_private_message',
        description: '发送私聊消息',
        inputStruct: 'SendPrivateMessageInput',
        outputStruct: 'SendPrivateMessageOutput',
      },
      {
        endpoint: 'send_group_message',
        description: '发送群聊消息',
        inputStruct: 'SendGroupMessageInput',
        outputStruct: 'SendGroupMessageOutput',
      },
      {
        endpoint: 'recall_private_message',
        description: '撤回私聊消息',
        inputStruct: 'RecallPrivateMessageInput',
        outputStruct: null,
      },
      {
        endpoint: 'recall_group_message',
        description: '撤回群聊消息',
        inputStruct: 'RecallGroupMessageInput',
        outputStruct: null,
      },
      {
        endpoint: 'get_message',
        description: '获取消息',
        inputStruct: 'GetMessageInput',
        outputStruct: 'GetMessageOutput',
      },
      {
        endpoint: 'get_history_messages',
        description: '获取历史消息列表',
        inputStruct: 'GetHistoryMessagesInput',
        outputStruct: 'GetHistoryMessagesOutput',
      },
      {
        endpoint: 'get_resource_temp_url',
        description: '获取临时资源链接',
        inputStruct: 'GetResourceTempUrlInput',
        outputStruct: 'GetResourceTempUrlOutput',
      },
      {
        endpoint: 'get_forwarded_messages',
        description: '获取合并转发消息内容',
        inputStruct: 'GetForwardedMessagesInput',
        outputStruct: 'GetForwardedMessagesOutput',
      },
      {
        endpoint: 'mark_message_as_read',
        description: '标记消息为已读',
        inputStruct: 'MarkMessageAsReadInput',
        outputStruct: null,
      },
    ],
  },
  friend: {
    name: '好友 API',
    apis: [
      {
        endpoint: 'send_friend_nudge',
        description: '发送好友戳一戳',
        inputStruct: 'SendFriendNudgeInput',
        outputStruct: null,
      },
      {
        endpoint: 'send_profile_like',
        description: '发送名片点赞',
        inputStruct: 'SendProfileLikeInput',
        outputStruct: null,
      },
      {
        endpoint: 'get_friend_requests',
        description: '获取好友请求列表',
        inputStruct: 'GetFriendRequestsInput',
        outputStruct: 'GetFriendRequestsOutput',
      },
      {
        endpoint: 'accept_friend_request',
        description: '同意好友请求',
        inputStruct: 'AcceptFriendRequestInput',
        outputStruct: null,
      },
      {
        endpoint: 'reject_friend_request',
        description: '拒绝好友请求',
        inputStruct: 'RejectFriendRequestInput',
        outputStruct: null,
      },
    ],
  },
  group: {
    name: '群聊 API',
    apis: [
      {
        endpoint: 'set_group_name',
        description: '设置群名称',
        inputStruct: 'SetGroupNameInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_avatar',
        description: '设置群头像',
        inputStruct: 'SetGroupAvatarInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_member_card',
        description: '设置群名片',
        inputStruct: 'SetGroupMemberCardInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_member_special_title',
        description: '设置群成员专属头衔',
        inputStruct: 'SetGroupMemberSpecialTitleInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_member_admin',
        description: '设置群管理员',
        inputStruct: 'SetGroupMemberAdminInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_member_mute',
        description: '设置群成员禁言',
        inputStruct: 'SetGroupMemberMuteInput',
        outputStruct: null,
      },
      {
        endpoint: 'set_group_whole_mute',
        description: '设置群全员禁言',
        inputStruct: 'SetGroupWholeMuteInput',
        outputStruct: null,
      },
      {
        endpoint: 'kick_group_member',
        description: '踢出群成员',
        inputStruct: 'KickGroupMemberInput',
        outputStruct: null,
      },
      {
        endpoint: 'get_group_announcements',
        description: '获取群公告列表',
        inputStruct: 'GetGroupAnnouncementsInput',
        outputStruct: 'GetGroupAnnouncementsOutput',
      },
      {
        endpoint: 'send_group_announcement',
        description: '发送群公告',
        inputStruct: 'SendGroupAnnouncementInput',
        outputStruct: null,
      },
      {
        endpoint: 'delete_group_announcement',
        description: '删除群公告',
        inputStruct: 'DeleteGroupAnnouncementInput',
        outputStruct: null,
      },
      {
        endpoint: 'get_group_essence_messages',
        description: '获取群精华消息列表',
        inputStruct: 'GetGroupEssenceMessagesInput',
        outputStruct: 'GetGroupEssenceMessagesOutput',
      },
      {
        endpoint: 'set_group_essence_message',
        description: '设置群精华消息',
        inputStruct: 'SetGroupEssenceMessageInput',
        outputStruct: null,
      },
      {
        endpoint: 'quit_group',
        description: '退出群',
        inputStruct: 'QuitGroupInput',
        outputStruct: null,
      },
      {
        endpoint: 'send_group_message_reaction',
        description: '发送群消息表情回应',
        inputStruct: 'SendGroupMessageReactionInput',
        outputStruct: null,
      },
      {
        endpoint: 'send_group_nudge',
        description: '发送群戳一戳',
        inputStruct: 'SendGroupNudgeInput',
        outputStruct: null,
      },
      {
        endpoint: 'get_group_notifications',
        description: '获取群通知列表',
        inputStruct: 'GetGroupNotificationsInput',
        outputStruct: 'GetGroupNotificationsOutput',
      },
      {
        endpoint: 'accept_group_request',
        description: '同意入群/邀请他人入群请求',
        inputStruct: 'AcceptGroupRequestInput',
        outputStruct: null,
      },
      {
        endpoint: 'reject_group_request',
        description: '拒绝入群/邀请他人入群请求',
        inputStruct: 'RejectGroupRequestInput',
        outputStruct: null,
      },
      {
        endpoint: 'accept_group_invitation',
        description: '同意他人邀请自身入群',
        inputStruct: 'AcceptGroupInvitationInput',
        outputStruct: null,
      },
      {
        endpoint: 'reject_group_invitation',
        description: '拒绝他人邀请自身入群',
        inputStruct: 'RejectGroupInvitationInput',
        outputStruct: null,
      },
    ],
  },
  file: {
    name: '文件 API',
    apis: [
      {
        endpoint: 'upload_private_file',
        description: '上传私聊文件',
        inputStruct: 'UploadPrivateFileInput',
        outputStruct: 'UploadPrivateFileOutput',
      },
      {
        endpoint: 'upload_group_file',
        description: '上传群文件',
        inputStruct: 'UploadGroupFileInput',
        outputStruct: 'UploadGroupFileOutput',
      },
      {
        endpoint: 'get_private_file_download_url',
        description: '获取私聊文件下载链接',
        inputStruct: 'GetPrivateFileDownloadUrlInput',
        outputStruct: 'GetPrivateFileDownloadUrlOutput',
      },
      {
        endpoint: 'get_group_file_download_url',
        description: '获取群文件下载链接',
        inputStruct: 'GetGroupFileDownloadUrlInput',
        outputStruct: 'GetGroupFileDownloadUrlOutput',
      },
      {
        endpoint: 'get_group_files',
        description: '获取群文件列表',
        inputStruct: 'GetGroupFilesInput',
        outputStruct: 'GetGroupFilesOutput',
      },
      {
        endpoint: 'move_group_file',
        description: '移动群文件',
        inputStruct: 'MoveGroupFileInput',
        outputStruct: null,
      },
      {
        endpoint: 'rename_group_file',
        description: '重命名群文件',
        inputStruct: 'RenameGroupFileInput',
        outputStruct: null,
      },
      {
        endpoint: 'delete_group_file',
        description: '删除群文件',
        inputStruct: 'DeleteGroupFileInput',
        outputStruct: null,
      },
      {
        endpoint: 'create_group_folder',
        description: '创建群文件夹',
        inputStruct: 'CreateGroupFolderInput',
        outputStruct: 'CreateGroupFolderOutput',
      },
      {
        endpoint: 'rename_group_folder',
        description: '重命名群文件夹',
        inputStruct: 'RenameGroupFolderInput',
        outputStruct: null,
      },
      {
        endpoint: 'delete_group_folder',
        description: '删除群文件夹',
        inputStruct: 'DeleteGroupFolderInput',
        outputStruct: null,
      },
    ],
  },
};
