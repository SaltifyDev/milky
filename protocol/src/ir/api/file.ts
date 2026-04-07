import { api, category, enumField, refField, scalarField } from '../../builder';
import type { IRApiCategory } from '../../types';

export const fileApiCategory: IRApiCategory = category('file', '文件 API', [
  api('upload_private_file', '上传私聊文件', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('file_uri', '文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string'),
    scalarField('file_name', '文件名称', 'string')
  ], [
    scalarField('file_id', '文件 ID', 'string')
  ]),
  api('upload_group_file', '上传群文件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('parent_folder_id', '目标文件夹 ID', 'string', { defaultValue: '/' }),
    scalarField('file_uri', '文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式', 'string'),
    scalarField('file_name', '文件名称', 'string')
  ], [
    scalarField('file_id', '文件 ID', 'string')
  ]),
  api('get_private_file_download_url', '获取私聊文件下载链接', [
    scalarField('user_id', '好友 QQ 号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('file_hash', '文件的 TriSHA1 哈希值', 'string')
  ], [
    scalarField('download_url', '文件下载链接', 'string')
  ]),
  api('get_group_file_download_url', '获取群文件下载链接', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string')
  ], [
    scalarField('download_url', '文件下载链接', 'string')
  ]),
  api('get_group_files', '获取群文件列表', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('parent_folder_id', '父文件夹 ID', 'string', { defaultValue: '/' })
  ], [
    refField('files', '文件列表', 'GroupFileEntity', { isArray: true }),
    refField('folders', '文件夹列表', 'GroupFolderEntity', { isArray: true })
  ]),
  api('move_group_file', '移动群文件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('parent_folder_id', '文件所在的文件夹 ID', 'string', { defaultValue: '/' }),
    scalarField('target_folder_id', '目标文件夹 ID', 'string', { defaultValue: '/' })
  ]),
  api('rename_group_file', '重命名群文件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string'),
    scalarField('parent_folder_id', '文件所在的文件夹 ID', 'string', { defaultValue: '/' }),
    scalarField('new_file_name', '新文件名称', 'string')
  ]),
  api('delete_group_file', '删除群文件', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('file_id', '文件 ID', 'string')
  ]),
  api('create_group_folder', '创建群文件夹', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('folder_name', '文件夹名称', 'string')
  ], [
    scalarField('folder_id', '文件夹 ID', 'string')
  ]),
  api('rename_group_folder', '重命名群文件夹', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('folder_id', '文件夹 ID', 'string'),
    scalarField('new_folder_name', '新文件夹名', 'string')
  ]),
  api('delete_group_folder', '删除群文件夹', [
    scalarField('group_id', '群号', 'int64', { dataType: 'uin' }),
    scalarField('folder_id', '文件夹 ID', 'string')
  ])
]);
