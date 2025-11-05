# Git Push 超时问题解决方案

## 问题原因
GitHub 的 HTTPS 端口（443）在国内访问可能被阻断，导致 push 超时。

## 解决方案

### 方案 1：使用 SSH（推荐，最稳定）

#### 步骤 1：检查是否已有 SSH 密钥
```powershell
Test-Path $env:USERPROFILE\.ssh\id_rsa.pub
```

#### 步骤 2：如果没有，生成 SSH 密钥
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
# 按回车使用默认路径，设置密码（可选）
```

#### 步骤 3：复制公钥
```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```

#### 步骤 4：添加到 GitHub
1. 打开 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥，保存

#### 步骤 5：修改 Git 远程地址为 SSH
```powershell
git remote set-url origin git@github.com:psyche3/link.git
git push -u origin gh-pages
```

---

### 方案 2：配置系统代理（如果你有代理）

#### 方法 A：使用 Git 全局代理配置
```powershell
# HTTP 代理（替换为你的代理地址和端口）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 只对 GitHub 使用代理
git config --global http.https://github.com.proxy http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890

# 恢复原始地址
git remote set-url origin https://github.com/psyche3/link.git
git push -u origin gh-pages
```

#### 方法 B：取消代理（如果配置错误）
```powershell
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

### 方案 3：修改 DNS（临时方案）

#### Windows 修改 DNS
1. 打开 "网络和共享中心" → "更改适配器设置"
2. 右键你的网络连接 → "属性"
3. 选择 "Internet 协议版本 4 (TCP/IPv4)" → "属性"
4. 使用以下 DNS：
   - 首选：`8.8.8.8` (Google DNS)
   - 备用：`114.114.114.114` (114 DNS)
5. 重启网络连接
6. 恢复原始地址并推送：
```powershell
git remote set-url origin https://github.com/psyche3/link.git
git push -u origin gh-pages
```

---

### 方案 4：使用 Git 配置增加超时时间

```powershell
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# 恢复原始地址
git remote set-url origin https://github.com/psyche3/link.git
git push -u origin gh-pages
```

---

### 方案 5：使用 GitHub Desktop 或 VS Code Git 扩展

这些工具通常会自动处理连接问题，可以尝试使用图形界面推送。

---

## 当前状态

当前远程地址已修改为：
- `https://mirror.ghproxy.com/https://github.com/psyche3/link.git`

如果代理不可用，请使用上述方案之一。

## 推荐

**最推荐使用 SSH 方案**，因为：
- 最稳定可靠
- 不受网络波动影响
- 安全性更高
- 一次配置，长期使用

