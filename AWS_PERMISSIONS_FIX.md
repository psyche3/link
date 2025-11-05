# AWS S3 权限修复指南

## 🔴 问题

你的 IAM 用户 `s3-link-storage-user` 没有权限访问 S3 存储桶，导致以下错误：
- `s3:ListBucket` - 无法列出存储桶内容
- `s3:PutObject` - 无法上传/写入文件

## ✅ 解决方案：添加 S3 权限

### 方法一：使用 AWS 预置策略（最简单）

1. **打开 AWS IAM 控制台**
   - 在顶部搜索框输入 "IAM"，点击进入

2. **找到你的用户**
   - 点击左侧菜单 **"用户"** (Users)
   - 找到并点击用户 `s3-link-storage-user`

3. **添加权限**
   - 在用户详情页面，点击 **"权限"** (Permissions) 标签
   - 点击 **"添加权限"** (Add permissions) 按钮
   - 选择 **"直接附加策略"** (Attach policies directly)

4. **选择策略**
   - 在搜索框输入 `AmazonS3FullAccess`
   - 勾选 **`AmazonS3FullAccess`** 策略
   - 点击 **"下一步"**，然后点击 **"添加权限"**

5. **完成**
   - 现在用户应该有了完整的 S3 访问权限

### 方法二：使用最小权限策略（更安全，推荐）

如果你只想给用户访问特定存储桶的权限：

1. **创建自定义策略**
   - 在 IAM 控制台，点击左侧菜单 **"策略"** (Policies)
   - 点击 **"创建策略"** (Create policy)
   - 切换到 **"JSON"** 标签

2. **粘贴以下策略**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::ceshi19484781/db.json"
       },
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket"
         ],
         "Resource": "arn:aws:s3:::ceshi19484781",
         "Condition": {
           "StringLike": {
             "s3:prefix": [
               "db.json"
             ]
           }
         }
       }
     ]
   }
   ```

3. **配置策略详情**
   - 点击 **"下一步"**
   - 输入策略名称：`S3LinkStorageAccess`
   - 输入描述（可选）：`允许访问 S3 存储桶 ceshi19484781 的 db.json 文件`
   - 点击 **"创建策略"**

4. **附加策略到用户**
   - 回到 IAM → 用户 → `s3-link-storage-user`
   - 点击 **"权限"** 标签
   - 点击 **"添加权限"** → **"直接附加策略"**
   - 搜索 `S3LinkStorageAccess`
   - 勾选并点击 **"添加权限"**

## 🧪 验证权限

完成权限配置后，重启服务器：

```powershell
# 停止当前服务器（Ctrl+C）
pnpm server
```

如果看到以下信息，说明配置成功：
```
S3 存储已启用: ceshi19484781/db.json
Local API server listening on http://localhost:4000
```

**不应该再看到权限错误了！**

## 📋 需要的权限列表

你的用户需要以下权限才能正常工作：

| 权限 | 用途 | 资源 |
|------|------|------|
| `s3:ListBucket` | 列出存储桶内容（检查文件是否存在） | `arn:aws:s3:::ceshi19484781` |
| `s3:GetObject` | 读取文件 | `arn:aws:s3:::ceshi19484781/db.json` |
| `s3:PutObject` | 写入/更新文件 | `arn:aws:s3:::ceshi19484781/db.json` |

## 🔍 常见问题

### Q: 添加权限后还是报错？
A: 
1. 等待 1-2 分钟让权限生效（AWS 权限传播需要时间）
2. 确认策略已正确附加到用户
3. 检查存储桶名称是否正确（`ceshi19484781`）
4. 检查区域是否正确（`ap-east-1`）

### Q: 如何检查权限是否生效？
A: 在 IAM 控制台 → 用户 → `s3-link-storage-user` → 权限标签，应该能看到附加的策略。

### Q: 权限策略显示"已附加"但仍有错误？
A: 尝试：
1. 删除并重新附加策略
2. 等待几分钟后重试
3. 检查策略的 JSON 是否正确

