# @saltify/milky-types

这是 Milky 协议的 TypeScript 类型定义包，使用 [Zod](https://zod.dev/) 进行运行时类型验证。

## 安装

```bash
npm install @saltify/milky-types
```

## 使用方法

### 进行运行时类型验证

```typescript
import { FriendEntity } from '@saltify/milky-types';

const friend1 = FriendEntity.parse({
  user_id: 123456789,
  nickname: 'Alice',
  sex: 'female',
  qid: 'Saltify',
  remark: 'Best friend',
  category: {
    id: 1,
    name: 'Close Friends',
  },
}); // 成功解析，friend1 的类型为 FriendEntity

const friend2 = FriendEntity.parse({
  user_id: 'not a number',
  nickname: 'Bob',
}); // 解析失败，抛出 ZodError 错误
```

### 获取 TypeScript 类型定义

```typescript
import { FriendEntity } from '@saltify/milky-types';

const friend1: FriendEntity = {
  user_id: 123456789,
  nickname: 'Alice',
  sex: 'female',
  qid: 'Saltify',
  remark: 'Best friend',
  category: {
    id: 1,
    name: 'Close Friends',
  },
}; // friend1 的类型为 FriendEntity

const friend2: FriendEntity = {
  user_id: 'not a number',
  nickname: 'Bob',
}; // TypeScript 编译错误，user_id 应为 number 类型，并且缺少 sex、qid、remark 和 category 字段
```
