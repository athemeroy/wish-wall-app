# 心愿墙应用 (Wish Wall) - Next.js + Appwrite

一个功能完整的愿望分享应用，集成用户认证、朋友系统和多种可见性控制。

## ✨ 主要功能

### 🎯 核心功能
- **用户认证**: 邮箱注册和登录
- **愿望管理**: 创建、查看、分类愿望
- **互动系统**: 点赞和评论功能
- **个人资料**: 查看统计数据和使用情况

### 👥 朋友系统 (新功能)
- **朋友管理**: 添加和管理朋友关系
- **隐私控制**: 三种可见性级别
  - 🌍 **公开**: 所有人可见
  - 🔒 **私人**: 仅自己可见
  - 👥 **仅限朋友**: 仅朋友可见
- **社交互动**: 查看他人愿望、直接添加朋友
- **用户资料**: 查看特定用户的所有愿望和统计

### 📊 数据统计
- 愿望统计 (总数、公有、私有、仅朋友可见)
- 收到的互动统计 (点赞、评论)
- 朋友数量统计

## 🚀 快速开始

### 1. 环境配置
```bash
# 克隆项目
git clone <repository-url>
cd wish-wall-app

# 安装依赖
npm install

# 配置环境变量
cp env-template.txt .env.local
# 编辑 .env.local 文件，填入你的 Appwrite 配置
```

### 2. Appwrite 数据库设置

#### 必需的集合：

**1. wishes 集合** (愿望)
- `user_id` (string) - 用户ID
- `title` (string) - 愿望标题
- `content` (string) - 愿望内容
- `category` (string) - 分类
- `visibility` (string) - 可见性 (public/private/friends)
- `tags` (string) - 标签
- `like_count` (integer) - 点赞数
- `comment_count` (integer) - 评论数

**2. wish_interactions 集合** (互动)
- `wish_id` (string) - 愿望ID
- `user_id` (string) - 用户ID
- `type` (string) - 类型 (like/comment)
- `content` (string) - 评论内容

**3. follows 集合** (关注关系) ⭐ 新功能
- `follower_id` (string) - 关注者ID
- `following_id` (string) - 被关注者ID
- `created_at` (datetime) - 关注时间

### 3. 启动应用
```bash
npm run dev
```

## 🛠️ 功能使用指南

### 用户操作流程
1. **注册/登录**: 使用邮箱注册或登录账户
2. **创建愿望**: 点击 "Share Wish" 按钮创建新愿望
3. **设置可见性**: 选择公开/私人/仅朋友可见
4. **社交互动**: 在他人愿望卡片上可以直接添加朋友或查看用户
5. **管理朋友**: 点击头像 → "Friends" 添加朋友
6. **查看统计**: 点击头像 → "Profile" 查看个人统计
7. **探索用户**: 点击愿望卡片上的眼睛图标查看该用户的所有愿望

### 可见性说明
- **🌍 公开**: 所有用户都能看到
- **🔒 私人**: 只有你自己能看到
- **👥 仅限朋友**: 只有你和你的朋友能看到

### 朋友系统使用
1. 点击头像打开菜单
2. 选择 "Friends"
3. 输入朋友的邮箱地址
4. 点击 "Add" 发送朋友请求
5. 创建仅朋友可见的愿望来测试功能

## 📁 项目结构

```
src/
├── app/
│   ├── layout.js          # 主布局
│   ├── page.js            # 主页面 (愿望墙)
│   └── globals.css        # 全局样式
├── components/
│   ├── AuthModal.js       # 认证模态框
│   ├── CreateWishModal.js # 创建愿望模态框
│   ├── WishCard.js        # 愿望卡片组件
│   ├── ProfileModal.js    # 个人资料模态框 ⭐ 新功能
│   ├── FollowModal.js     # 关注管理模态框 ⭐ 新功能
│   ├── UserWishesModal.js # 用户愿望详情模态框
│   ├── WishStatistics.js  # 愿望统计组件
│   └── Header.js          # 页面头部
└── lib/
    └── appwrite.js        # Appwrite 配置
```

## 🎯 技术栈

- **前端**: Next.js 15, React, Material-UI
- **后端**: Appwrite (数据库 + 认证)
- **样式**: Material-UI + Tailwind CSS
- **状态管理**: React Hooks

## 🔧 开发和部署

### 本地开发
```bash
npm run dev          # 开发模式
npm run build        # 生产构建
npm run start        # 生产模式启动
```

### 环境变量配置
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=你的_Appwrite_端点
NEXT_PUBLIC_APPWRITE_PROJECT_ID=你的项目ID
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=你的项目名称
```

## 🚨 注意事项

- 确保 Appwrite 数据库中的集合和字段配置正确
- 关注功能需要 `follows` 集合存在才能正常工作
- 好友关系通过双向关注自动形成，无需额外配置
- 首次运行可能需要等待数据库索引建立完成

## 📄 相关文档

- [Appwrite 官方文档](https://appwrite.io/docs) - 后端服务文档
- [Next.js 文档](https://nextjs.org/docs) - 前端框架文档

---

⭐ **如果这个项目对你有帮助，请给它一个星标！**