# 心愿墙应用 (Wish Wall) - Next.js + Appwrite

一个功能完整的愿望分享应用，采用创新的关注系统和智能隐私控制，打造个性化社交体验。

## ✨ 主要功能

### 🎯 核心功能
- **用户认证**: 邮箱注册和登录
- **愿望管理**: 创建、查看、分类愿望
- **互动系统**: 点赞和评论功能
- **个人资料**: 查看统计数据和使用情况

### 👥 关注系统 (核心创新)
- **智能朋友关系**: 双向关注自动成为朋友，无需额外确认
- **个性化内容流**: 根据关注关系智能推荐内容
- **隐私分层控制**: 三级可见性精确管理
  - 🌍 **公开**: 所有用户可见
  - 🔒 **私人**: 仅自己可见
  - 👥 **仅限朋友**: 仅双向关注的朋友可见
- **社交探索**: 发现有趣的用户并建立连接
- **用户洞察**: 查看其他用户的完整愿望和统计数据

### 📊 数据统计
- 愿望统计 (按可见性分类)
- 互动统计 (收到的点赞和评论)
- 关注关系统计 (关注者/被关注者/朋友数量)

---

# Wish Wall - Next.js + Appwrite

A comprehensive wish-sharing application featuring an innovative following system and intelligent privacy controls for personalized social experiences.

## ✨ Key Features

### 🎯 Core Features
- **User Authentication**: Email registration and login
- **Wish Management**: Create, view, and categorize wishes
- **Interaction System**: Like and comment functionality
- **Personal Profile**: View statistics and usage data

### 👥 Following System (Core Innovation)
- **Smart Friendship**: Mutual following automatically creates friendships without additional confirmation
- **Personalized Content Feed**: Intelligent content recommendations based on following relationships
- **Privacy Layer Control**: Three-tier visibility with precise management
  - 🌍 **Public**: Visible to all users
  - 🔒 **Private**: Visible only to yourself
  - 👥 **Friends Only**: Visible only to mutual followers (friends)
- **Social Discovery**: Discover interesting users and establish connections
- **User Insights**: View complete wish collections and statistics of other users

### 📊 Data Analytics
- Wish statistics (categorized by visibility)
- Interaction statistics (received likes and comments)
- Relationship statistics (followers/following/friends count)

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Clone the project
git clone https://github.com/athemeroy/wish-wall-app.git
cd wish-wall-app

# Install dependencies
npm install

# Configure environment variables
cp env-template.txt .env.local
# Edit .env.local with your Appwrite configuration
```

### 2. Appwrite Database Setup

#### Required Collections:

**1. wishes Collection**
- `user_id` (string) - User ID
- `title` (string) - Wish title
- `content` (string) - Wish content
- `category` (string) - Category
- `visibility` (string) - Visibility (public/private/friends)
- `tags` (string) - Tags
- `like_count` (integer) - Like count
- `comment_count` (integer) - Comment count

**2. wish_interactions Collection**
- `wish_id` (string) - Wish ID
- `user_id` (string) - User ID
- `type` (string) - Type (like/comment)
- `content` (string) - Comment content

**3. follows Collection** ⭐ Core Feature
- `follower_id` (string) - Follower ID
- `following_id` (string) - Following ID
- `created_at` (datetime) - Follow time

### 3. Start the Application
```bash
npm run dev
```

## 🛠️ Usage Guide

### User Journey
1. **Sign Up/Login**: Register or login with your email
2. **Create Wishes**: Click "Share Wish" to create new wishes
3. **Set Visibility**: Choose public/private/friends-only visibility
4. **Social Interaction**: Follow interesting users from their wish cards
5. **Manage Relationships**: Click avatar → "Friends" to manage following
6. **View Statistics**: Click avatar → "Profile" to see personal analytics
7. **Explore Users**: Click eye icon on wish cards to view user's complete collection

### Visibility Explained
- **🌍 Public**: Everyone can see your wishes
- **🔒 Private**: Only you can see your wishes
- **👥 Friends Only**: Only mutual followers (friends) can see your wishes

### Following System Usage
1. Click avatar to open menu
2. Select "Friends" to manage relationships
3. Browse public wishes and follow interesting users
4. Mutual following automatically creates friendships
5. Create friends-only wishes to share with your network

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js          # Main layout
│   ├── page.js            # Main page (wish wall)
│   └── theme-provider.js  # Theme provider
├── components/
│   ├── AuthModal.js       # Authentication modal
│   ├── CreateWishModal.js # Create wish modal
│   ├── WishCard.js        # Wish card component
│   ├── FollowModal.js     # Following management modal ⭐
│   ├── UserWishesModal.js # User wishes detail modal
│   ├── WishStatistics.js  # Wish statistics component
│   ├── ModalManager.js    # Modal state manager
│   └── Header.js          # Page header
├── hooks/
│   ├── useAuth.js         # Authentication hook
│   ├── useFollowing.js    # Following system hook ⭐
│   └── useWishes.js       # Wishes management hook
├── lib/
│   └── appwrite.js        # Appwrite configuration
└── utils/
    └── wishQueries.js     # Wish query utilities
```

## 🎯 Technology Stack

- **Frontend**: Next.js 15, React 19, Material-UI
- **Backend**: Appwrite (Database + Authentication)
- **Styling**: Material-UI + Tailwind CSS
- **State Management**: React Hooks

## 🔧 Development & Deployment

### Local Development
```bash
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production start
```

### Environment Variables
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=your_project_name
```

## 🚨 Important Notes

- Ensure Appwrite database collections and fields are configured correctly
- Following system requires `follows` collection to function properly
- Friendships are automatically created through mutual following
- First run may require waiting for database indexes to be built

## 📄 Related Documentation

- [Appwrite Official Docs](https://appwrite.io/docs) - Backend service documentation
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework documentation

---

⭐ **If this project helps you, please give it a star!**