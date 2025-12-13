import { z } from 'zod';
import { ZInt64, ZString, ZStringWithDefault } from '../scalar';
import { GroupFileEntity, GroupFolderEntity } from '../common';

export const UploadPrivateFileInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
  file_uri: ZString.describe('文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式'),
  file_name: ZString.describe('文件名称'),
});

export const UploadPrivateFileOutput = z.object({
  file_id: ZString.describe('文件 ID'),
});

export const UploadGroupFileInput = z.object({
  group_id: ZInt64.describe('群号'),
  parent_folder_id: ZStringWithDefault('/').describe('目标文件夹 ID'),
  file_uri: ZString.describe('文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式'),
  file_name: ZString.describe('文件名称'),
});

export const UploadGroupFileOutput = z.object({
  file_id: ZString.describe('文件 ID'),
});

export const GetPrivateFileDownloadUrlInput = z.object({
  user_id: ZInt64.describe('好友 QQ 号'),
  file_id: ZString.describe('文件 ID'),
  file_hash: ZString.describe('文件的 TriSHA1 哈希值'),
});

export const GetPrivateFileDownloadUrlOutput = z.object({
  download_url: ZString.describe('文件下载链接'),
});

export const GetGroupFileDownloadUrlInput = z.object({
  group_id: ZInt64.describe('群号'),
  file_id: ZString.describe('文件 ID'),
});

export const GetGroupFileDownloadUrlOutput = z.object({
  download_url: ZString.describe('文件下载链接'),
});

export const GetGroupFilesInput = z.object({
  group_id: ZInt64.describe('群号'),
  parent_folder_id: ZStringWithDefault('/').describe('父文件夹 ID'),
});

export const GetGroupFilesOutput = z.object({
  files: z.array(z.lazy(() => GroupFileEntity)).describe('文件列表'),
  folders: z.array(z.lazy(() => GroupFolderEntity)).describe('文件夹列表'),
});

export const MoveGroupFileInput = z.object({
  group_id: ZInt64.describe('群号'),
  file_id: ZString.describe('文件 ID'),
  parent_folder_id: ZStringWithDefault('/').describe('文件所在的文件夹 ID'),
  target_folder_id: ZStringWithDefault('/').describe('目标文件夹 ID'),
});

export const RenameGroupFileInput = z.object({
  group_id: ZInt64.describe('群号'),
  file_id: ZString.describe('文件 ID'),
  parent_folder_id: ZStringWithDefault('/').describe('文件所在的文件夹 ID'),
  new_file_name: ZString.describe('新文件名称'),
});

export const DeleteGroupFileInput = z.object({
  group_id: ZInt64.describe('群号'),
  file_id: ZString.describe('文件 ID'),
});

export const CreateGroupFolderInput = z.object({
  group_id: ZInt64.describe('群号'),
  folder_name: ZString.describe('文件夹名称'),
});

export const CreateGroupFolderOutput = z.object({
  folder_id: ZString.describe('文件夹 ID'),
});

export const RenameGroupFolderInput = z.object({
  group_id: ZInt64.describe('群号'),
  folder_id: ZString.describe('文件夹 ID'),
  new_folder_name: ZString.describe('新文件夹名'),
});

export const DeleteGroupFolderInput = z.object({
  group_id: ZInt64.describe('群号'),
  folder_id: ZString.describe('文件夹 ID'),
});

export type UploadPrivateFileInput = z.infer<typeof UploadPrivateFileInput>;
export type UploadPrivateFileOutput = z.infer<typeof UploadPrivateFileOutput>;
export type UploadGroupFileInput = z.infer<typeof UploadGroupFileInput>;
export type UploadGroupFileOutput = z.infer<typeof UploadGroupFileOutput>;
export type GetPrivateFileDownloadUrlInput = z.infer<typeof GetPrivateFileDownloadUrlInput>;
export type GetPrivateFileDownloadUrlOutput = z.infer<typeof GetPrivateFileDownloadUrlOutput>;
export type GetGroupFileDownloadUrlInput = z.infer<typeof GetGroupFileDownloadUrlInput>;
export type GetGroupFileDownloadUrlOutput = z.infer<typeof GetGroupFileDownloadUrlOutput>;
export type GetGroupFilesInput = z.infer<typeof GetGroupFilesInput>;
export type GetGroupFilesOutput = z.infer<typeof GetGroupFilesOutput>;
export type MoveGroupFileInput = z.infer<typeof MoveGroupFileInput>;
export type RenameGroupFileInput = z.infer<typeof RenameGroupFileInput>;
export type DeleteGroupFileInput = z.infer<typeof DeleteGroupFileInput>;
export type CreateGroupFolderInput = z.infer<typeof CreateGroupFolderInput>;
export type CreateGroupFolderOutput = z.infer<typeof CreateGroupFolderOutput>;
export type RenameGroupFolderInput = z.infer<typeof RenameGroupFolderInput>;
export type DeleteGroupFolderInput = z.infer<typeof DeleteGroupFolderInput>;
