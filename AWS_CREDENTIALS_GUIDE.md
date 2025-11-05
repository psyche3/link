# AWS S3 凭证获取指南

本指南将帮助你获取 AWS 访问凭证，以便将数据存储到 S3。

## 📋 前提条件

1. 已登录 AWS 控制台（你已经可以看到 S3 存储桶 `ceshi19484781`）
2. 有创建 IAM 用户或访问密钥的权限

---

## 🚀 方法一：通过 IAM 创建访问密钥（推荐）

### 步骤 1：打开 IAM 服务

1. 在 AWS 控制台顶部搜索框输入 **"IAM"**
2. 点击 **"IAM"** 服务（Identity and Access Management）

### 步骤 2：创建新用户（或使用现有用户）

#### 选项 A：创建新用户（推荐，更安全）

1. 在左侧菜单点击 **"用户"** (Users)
2. 点击右上角 **"创建用户"** (Create user)
3. 输入用户名，例如：`s3-link-storage-user`
4. 点击 **"下一步"**

#### 选项 B：使用当前用户

1. 在左侧菜单点击 **"用户"** (Users)
2. 点击你的用户名（例如：`psyche3`）

### 步骤 3：分配 S3 权限

#### 如果是新用户：

1. 在 **"设置权限"** 页面，选择 **"直接附加策略"** (Attach policies directly)
2. 搜索并选择以下策略之一：
   - **`AmazonS3FullAccess`**（完全访问，适合测试）
   - 或者创建自定义策略（见下方）

#### 如果是现有用户：

1. 点击 **"权限"** (Permissions) 标签
2. 点击 **"添加权限"** (Add permissions)
3. 选择 **"直接附加策略"**
4. 搜索并选择 `AmazonS3FullAccess`

### 步骤 4：创建访问密钥

1. 在用户详情页面，点击 **"安全凭证"** (Security credentials) 标签
2. 滚动到 **"访问密钥"** (Access keys) 部分
3. 点击 **"创建访问密钥"** (Create access key)
4. 选择使用场景：
   - **"本地代码"** (Local code) 或 **"其他"** (Other)
   - 输入描述（可选）：`用于链接存储项目`
5. 点击 **"下一步"**，然后点击 **"创建访问密钥"**

### 步骤 5：保存凭证（重要！）

**⚠️ 重要：** 访问密钥只会显示一次，请立即保存！

你会看到：
- **访问密钥 ID** (Access key ID)：类似 `AKIAIOSFODNN7EXAMPLE`
- **私有访问密钥** (Secret access key)：类似 `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**请立即复制并保存这两个值！**

---

## 🔒 方法二：使用环境变量（更安全）

如果你不想在代码中硬编码凭证，可以使用环境变量：

### Windows PowerShell：

```powershell
# 设置环境变量（仅当前会话有效）
$env:AWS_ACCESS_KEY_ID = "你的访问密钥ID"
$env:AWS_SECRET_ACCESS_KEY = "你的私有访问密钥"

# 然后启动服务器
pnpm server
```

### Windows CMD：

```cmd
set AWS_ACCESS_KEY_ID=你的访问密钥ID
set AWS_SECRET_ACCESS_KEY=你的私有访问密钥
pnpm server
```

### 永久设置（Windows）：

1. 右键 **"此电脑"** → **"属性"**
2. 点击 **"高级系统设置"**
3. 点击 **"环境变量"**
4. 在 **"用户变量"** 中点击 **"新建"**
5. 添加两个变量：
   - 变量名：`AWS_ACCESS_KEY_ID`，值：你的访问密钥ID
   - 变量名：`AWS_SECRET_ACCESS_KEY`，值：你的私有访问密钥

---

## 📝 配置项目

### 方法 A：使用配置文件（简单）

1. 复制示例配置文件：
   ```bash
   # Windows PowerShell
   Copy-Item server/s3-config.example.js server/s3-config.js
   
   # 或 Windows CMD
   copy server\s3-config.example.js server\s3-config.js
   ```

2. 编辑 `server/s3-config.js`：
   ```javascript
   module.exports = {
     enabled: true,  // 启用 S3
     bucket: 'ceshi19484781',
     region: 'ap-east-1',  // 亚太地区(香港)
     key: 'db.json',
     credentials: {
       accessKeyId: '你的访问密钥ID',  // 替换这里
       secretAccessKey: '你的私有访问密钥',  // 替换这里
     },
   };
   ```

3. 启动服务器：
   ```bash
   pnpm server
   ```

### 方法 B：使用环境变量（推荐）

如果已设置环境变量，配置文件中的 `credentials` 会被忽略，自动使用环境变量。

---

## 🛡️ 最小权限策略（可选，更安全）

如果你不想使用 `AmazonS3FullAccess`，可以创建自定义策略，只允许访问特定存储桶：

1. 在 IAM 控制台，点击 **"策略"** (Policies)
2. 点击 **"创建策略"** (Create policy)
3. 切换到 **"JSON"** 标签
4. 粘贴以下内容：

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
      "Resource": "arn:aws:s3:::ceshi19484781"
    }
  ]
}
```

5. 点击 **"下一步"**，输入策略名称，例如：`S3LinkStorageReadWrite`
6. 创建策略后，将策略附加到你的用户

---

## ✅ 验证配置

启动服务器后，检查控制台输出：

- ✅ 如果看到 `S3 存储已启用: ceshi19484781/db.json`，说明配置成功
- ❌ 如果看到 `使用本地文件存储: data/db.json`，说明 S3 未启用或配置有误

---

## 🔍 常见问题

### Q: 凭证在哪里查看？

A: 在 IAM → 用户 → 选择用户 → 安全凭证 → 访问密钥

### Q: 访问密钥丢失了怎么办？

A: 无法恢复，只能删除旧密钥并创建新的。

### Q: 如何删除旧的访问密钥？

A: 在 IAM → 用户 → 安全凭证 → 访问密钥，点击密钥旁边的 "删除"。

### Q: 凭证泄露了怎么办？

A: 立即删除泄露的访问密钥，创建新的，并更新配置。

---

## 📚 相关链接

- [AWS IAM 用户指南](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/)
- [AWS S3 文档](https://docs.aws.amazon.com/zh_cn/s3/)
- [访问密钥最佳实践](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/best-practices.html)

