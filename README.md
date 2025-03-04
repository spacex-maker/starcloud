# MyStorageX 云存储系统

MyStorageX 是一个现代化的云存储解决方案，提供安全可靠的文件存储、加密和管理功能。

## 🌟 主要特性

- 📁 文件管理
  - 支持文件夹创建、删除、重命名
  - 文件拖拽上传、文件夹上传
  - 支持大文件分片上传
  - 支持断点续传
  - 文件进度管理和实时反馈

- 🔐 安全性
  - AES-256-CBC 端到端加密
  - 本地文件加密/解密
  - 多重身份验证
  - 安全的文件传输机制

- 🌍 国际化
  - 支持多语言（中文、英文、日文等11种语言）
  - 完整的 i18n 支持

- 🎨 用户界面
  - 响应式设计，支持移动端
  - 深色/浅色主题切换
  - 现代化 UI 组件
  - 流畅的动画效果

- ⚡ 性能优化
  - 文件分块上传/下载
  - 智能内存管理
  - 高效的文件处理机制

## 🛠️ 技术栈

- 前端框架：React
- UI 组件：Ant Design
- 样式解决方案：Styled Components
- 状态管理：React Hooks
- 国际化：react-intl
- 文件加密：CryptoJS
- 网络请求：Axios
- 对象存储：腾讯云 COS

## 📦 安装

```bash
# 克隆项目
git clone [repository-url]

# 安装依赖
yarn install

# 启动开发服务器
yarn start

# 构建生产版本
yarn build
```

## 🚀 快速开始

1. 确保已安装 Node.js (>= 14.0.0) 和 Yarn
2. 克隆项目并安装依赖
3. 配置环境变量（参考 .env.example）
4. 启动开发服务器

## 📚 项目结构

```
src/
├── api/          # API 接口
├── components/   # 通用组件
├── contexts/     # React Context
├── hooks/        # 自定义 Hooks
├── locales/      # 国际化文件
├── models/       # 数据模型
├── pages/        # 页面组件
├── services/     # 服务层
├── styles/       # 全局样式
└── utils/        # 工具函数
```

## 🔧 配置说明

### 环境变量

创建 .env 文件并配置以下变量：

```env
REACT_APP_API_URL=你的API地址
REACT_APP_COS_REGION=对象存储区域
REACT_APP_COS_BUCKET=存储桶名称
```

### 国际化配置

国际化文件位于 `src/locales` 目录，支持以下语言：

- 简体中文 (zh_CN)
- 英文 (en_US)
- 日文 (ja_JP)
- 韩文 (ko_KR)
- 德文 (de_DE)
- 法文 (fr_FR)
- 西班牙文 (es_ES)
- 意大利文 (it_IT)
- 葡萄牙文 (pt_PT)
- 俄文 (ru_RU)
- 阿拉伯文 (ar_SA)

## 📝 开发指南

### 添加新功能

1. 在相应目录创建组件
2. 添加国际化文本
3. 实现组件逻辑
4. 添加到路由配置

### 样式开发

- 使用 Styled Components 进行样式开发
- 遵循项目现有的样式规范
- 确保深色模式兼容性

### 国际化开发

- 在 `src/locales` 中添加翻译文本
- 使用 `FormattedMessage` 组件或 `useIntl` Hook

## 🔐 安全功能

### 文件加密

- 使用 AES-256-CBC 加密算法
- 支持本地加密/解密
- 加密过程在客户端完成

### 文件传输

- HTTPS 传输
- 文件完整性校验
- 传输过程加密

## 📈 性能优化

- 大文件分片上传
- 智能内存管理
- 缓存优化
- 按需加载

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 📄 许可证

© 2024 ProTX Team. All rights reserved.

## 🆘 支持

- 提交 Issue
- 查看文档
- 联系技术支持
