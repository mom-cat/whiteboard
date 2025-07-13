# Excalidraw 项目功能标注清单

## 项目概述

Excalidraw 是一个开源的虚拟手绘风格白板应用，支持协作和端到端加密。项目采用 monorepo 架构，包含多个包和应用。

## 目录结构功能标注

### 🏠 根目录

```
/[TypeScript] Argument of type '{ elements: ExcalidrawElement[]; appState: { viewBackgroundColor: string; name: string | null; zoom: Readonly<{ value: NormalizedZoomValue; }>; ... 82 more ...; followedBy: Set<...>; } | null; }' is not assignable to parameter of type 'readonly ExcalidrawElement[]'. Type '{ elements: ExcalidrawElement[]; appState: { viewBackgroundColor: string; name: string | null; zoom: Readonly<{ value: NormalizedZoomValue; }>; ... 82 more ...; followedBy: Set<...>; } | null; }' is missing the following properties from type 'readonly ExcalidrawElement[]': length, concat, join, slice, and 19 more.
/workspaces/whiteboard/excalidraw-app/App.tsx:233:30
    276 |               const sceneData = JSON.parse(decryptedText);
    277 |               
  > 278 |               scene = restore(sceneData, null, localDataState);
        |                                                ^^^^^^^^^^^^^^
    279 |             }
    280 |           } catch (error) {
    281 |             console.error("Error loading excalidraw scene:", error);
├── 📄 README.md                    # 项目主要说明文档
├── 📄 package.json                 # Monorepo 主配置文件
├── 📄 CONTRIBUTING.md              # 贡献指南
├── 📄 LICENSE                      # MIT 开源许可证
├── 📄 tsconfig.json               # TypeScript 全局配置
├── 📄 vitest.config.mts           # Vitest 测试配置
├── 📄 docker-compose.yml          # Docker 编排配置
├── 📄 Dockerfile                  # Docker 镜像构建文件
└── 📄 vercel.json                 # Vercel 部署配置
```

### 🎨 核心应用 - excalidraw-app/

```
excalidraw-app/                     # 🌐 主要的 Web 应用
├── 📄 App.tsx                     # 主应用组件
├── 📄 index.tsx                   # 应用入口点
├── 📄 index.html                  # HTML 模板
├── 📄 package.json                # 应用依赖配置
├── 📄 vite.config.mts             # Vite 构建配置
├── 🎯 app-jotai.ts                # Jotai 状态管理
├── 🎯 app_constants.ts            # 应用常量定义
├── 🎯 sentry.ts                   # 错误监控配置
├── 🎯 useHandleAppTheme.ts        # 主题处理钩子
├── 📁 app-language/               # 🌍 国际化语言处理
├── 📁 collab/                     # 🤝 实时协作功能
├── 📁 components/                 # 🧩 应用级组件
├── 📁 data/                       # 💾 数据管理层
├── 📁 share/                      # 🔗 分享功能
└── 📁 tests/                      # 🧪 应用测试
```

### 📦 核心包 - packages/

```
packages/                          # 📚 可复用的核心包
├── 📄 eslintrc.base.json          # ESLint 基础配置
├── 📄 tsconfig.base.json          # TypeScript 基础配置
├── 📁 excalidraw/                 # 🎨 主要的 React 组件包
├── 📁 common/                     # 🔧 通用工具和常量
├── 📁 element/                    # 🔷 元素操作和管理
├── 📁 math/                       # 📐 数学计算工具
└── 📁 utils/                      # 🛠️ 实用工具函数
```

#### 📁 packages/excalidraw/ - 主要组件包

```
packages/excalidraw/
├── 📄 index.tsx                   # 主要导出文件
├── 📄 package.json                # 包配置和依赖
├── 📄 CHANGELOG.md               # 版本变更日志
├── 🎯 analytics.ts                # 分析和跟踪
├── 🎯 appState.ts                 # 应用状态管理
├── 🎯 clipboard.ts                # 剪贴板操作
├── 🎯 cursor.ts                   # 光标处理
├── 🎯 history.ts                  # 历史记录管理
├── 🎯 i18n.ts                     # 国际化支持
├── 🎯 snapping.ts                 # 对齐和吸附
├── 🎯 types.ts                    # TypeScript 类型定义
├── 📁 actions/                    # ⚡ 用户操作处理
├── 📁 components/                 # 🧩 UI 组件库
├── 📁 css/                        # 🎨 样式文件
├── 📁 data/                       # 💾 数据处理
├── 📁 fonts/                      # 🔤 字体资源
├── 📁 hooks/                      # 🪝 React Hooks
├── 📁 locales/                    # 🌍 多语言文件
├── 📁 renderer/                   # 🖼️ 渲染引擎
├── 📁 scene/                      # 🎬 场景管理
└── 📁 tests/                      # 🧪 测试文件
```

#### 📁 packages/common/ - 通用工具

```
packages/common/src/
├── 🎯 constants.ts                # 全局常量
├── 🎯 colors.ts                   # 颜色处理
├── 🎯 utils.ts                    # 通用工具函数
├── 🎯 keys.ts                     # 键盘事件处理
├── 🎯 points.ts                   # 点坐标处理
├── 🎯 random.ts                   # 随机数生成
├── 🎯 url.ts                      # URL 处理
├── 🎯 binary-heap.ts              # 二叉堆数据结构
├── 🎯 emitter.ts                  # 事件发射器
├── 🎯 font-metadata.ts            # 字体元数据
├── 🎯 promise-pool.ts             # Promise 池管理
└── 🎯 queue.ts                    # 队列数据结构
```

#### 📁 packages/element/ - 元素管理

```
packages/element/src/
├── 🎯 bounds.ts                   # 边界计算
├── 🎯 collision.ts                # 碰撞检测
├── 🎯 selection.ts                # 选择处理
├── 🎯 newElement.ts               # 新元素创建
├── 🎯 mutateElement.ts            # 元素变更
├── 🎯 renderElement.ts            # 元素渲染
├── 🎯 resizeElements.ts           # 元素调整大小
├── 🎯 dragElements.ts             # 元素拖拽
├── 🎯 duplicate.ts                # 元素复制
├── 🎯 groups.ts                   # 元素分组
├── 🎯 frame.ts                    # 框架元素
├── 🎯 textElement.ts              # 文本元素
├── 🎯 image.ts                    # 图像元素
├── 🎯 shape.ts                    # 形状元素
├── 🎯 binding.ts                  # 元素绑定
├── 🎯 align.ts                    # 对齐功能
├── 🎯 distribute.ts               # 分布功能
└── 🎯 typeChecks.ts               # 类型检查
```

#### 📁 packages/math/ - 数学工具

```
packages/math/src/
├── 🎯 point.ts                    # 点数学运算
├── 🎯 vector.ts                   # 向量运算
├── 🎯 line.ts                     # 直线数学
├── 🎯 curve.ts                    # 曲线数学
├── 🎯 ellipse.ts                  # 椭圆数学
├── 🎯 rectangle.ts                # 矩形数学
├── 🎯 polygon.ts                  # 多边形数学
├── 🎯 triangle.ts                 # 三角形数学
├── 🎯 segment.ts                  # 线段数学
├── 🎯 angle.ts                    # 角度计算
├── 🎯 range.ts                    # 范围计算
└── 🎯 utils.ts                    # 数学工具函数
```

#### 📁 packages/utils/ - 实用工具

```
packages/utils/src/
├── 🎯 export.ts                   # 导出功能
├── 🎯 bbox.ts                     # 边界框计算
├── 🎯 shape.ts                    # 形状工具
├── 🎯 withinBounds.ts             # 边界检测
├── 🎯 visualdebug.ts              # 可视化调试
└── 🎯 test-utils.ts               # 测试工具
```

### 📚 文档 - dev-docs/

```
dev-docs/                          # 📖 开发者文档站点
├── 📄 docusaurus.config.js        # Docusaurus 配置
├── 📄 package.json                # 文档站点依赖
├── 📄 sidebars.js                 # 侧边栏配置
├── 📁 docs/                       # 📝 文档内容
│   ├── 📁 @excalidraw/            # API 文档
│   ├── 📁 codebase/               # 代码库文档
│   └── 📁 introduction/           # 介绍文档
├── 📁 src/                        # 🎨 文档站点源码
└── 📁 static/                     # 📁 静态资源
```

### 🧪 示例 - examples/

```
examples/                          # 💡 集成示例
├── 📁 with-nextjs/                # Next.js 集成示例
│   ├── 📄 package.json            # Next.js 项目配置
│   ├── 📄 next.config.js          # Next.js 配置
│   └── 📁 src/                    # 示例源码
└── 📁 with-script-in-browser/     # 浏览器脚本示例
    ├── 📄 index.html              # HTML 示例
    ├── 📄 package.json            # 项目配置
    ├── 📄 vite.config.mts         # Vite 配置
    └── 📁 components/             # 示例组件
```

### 🔧 构建脚本 - scripts/

```
scripts/                           # 🛠️ 构建和发布脚本
├── 📄 build-node.js               # Node.js 构建
├── 📄 build-version.js            # 版本构建
├── 📄 buildPackage.js             # 包构建
├── 📄 buildUtils.js               # 构建工具
├── 📄 buildWasm.js                # WebAssembly 构建
├── 📄 release.js                  # 发布脚本
├── 📄 build-locales-coverage.js   # 本地化覆盖率
├── 📄 locales-coverage-description.js # 本地化描述
├── 📄 updateChangelog.js          # 更新日志
├── 📁 wasm/                       # WebAssembly 文件
└── 📁 woff2/                      # 字体处理工具
```

### 🔥 Firebase 项目 - firebase-project/

```
firebase-project/                  # ☁️ Firebase 后端配置
├── 📄 firebase.json               # Firebase 配置
├── 📄 .firebaserc                 # Firebase 项目配置
├── 📄 firestore.indexes.json      # Firestore 索引
├── 📄 firestore.rules             # Firestore 安全规则
└── 📄 storage.rules               # Storage 安全规则
```

### 🤖 CI/CD - .github/

```
.github/                           # 🔄 GitHub 配置
├── 📄 FUNDING.yml                 # 赞助配置
├── 📄 copilot-instructions.md     # Copilot 指令
├── 📁 assets/                     # 资源文件
└── 📁 workflows/                  # GitHub Actions
    ├── 📄 autorelease-excalidraw.yml # 自动发布
    ├── 📄 build-docker.yml        # Docker 构建
    ├── 📄 lint.yml                # 代码检查
    ├── 📄 test.yml                # 测试流程
    ├── 📄 test-coverage-pr.yml    # 测试覆盖率
    └── 📄 size-limit.yml          # 包大小限制
```

### 🌐 公共资源 - public/

```
public/                            # 🌍 静态公共资源
├── 📄 favicon.svg                 # 网站图标
├── 📄 robots.txt                  # 搜索引擎配置
├── 📄 service-worker.js           # PWA Service Worker
└── 📄 _headers                    # HTTP 头配置
```

### 🐳 容器化 - .devcontainer/

```
.devcontainer/                     # 📦 开发容器配置
├── 📄 devcontainer.json           # VS Code 开发容器配置
└── 📄 Dockerfile                  # 开发环境 Docker 文件
```

## 🎯 核心功能模块

### 🎨 绘图功能

- **基础形状**: 矩形、圆形、菱形、箭头、直线
- **自由绘制**: 手绘风格的自由画笔
- **文本编辑**: 支持多种字体的文本元素
- **图像支持**: 图片插入和编辑
- **橡皮擦**: 元素擦除功能

### 🤝 协作功能

- **实时协作**: 多用户同时编辑
- **端到端加密**: 安全的数据传输
- **用户光标**: 显示其他用户的操作
- **冲突解决**: 自动处理编辑冲突

### 💾 数据管理

- **本地存储**: 浏览器本地数据保存
- **云端同步**: Firebase 云端存储
- **导入导出**: 支持多种格式
- **版本历史**: 撤销/重做功能

### 🎨 界面功能

- **深色模式**: 主题切换
- **响应式设计**: 移动端适配
- **工具栏**: 丰富的工具选项
- **快捷键**: 键盘快捷操作
- **网格模式**: 辅助对齐功能

### 🌍 国际化

- **多语言支持**: 40+ 种语言
- **RTL 支持**: 右到左语言支持
- **本地化**: 完整的界面翻译

### 🔧 开发者功能

- **React 组件**: 可嵌入的 React 组件
- **API 接口**: 丰富的编程接口
- **插件系统**: 可扩展的架构
- **TypeScript**: 完整的类型支持

## 📊 技术栈

### 前端技术

- **React 19**: 用户界面框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速构建工具
- **Jotai**: 状态管理
- **Sass**: CSS 预处理器

### 后端服务

- **Firebase**: 云端数据库和存储
- **WebRTC**: 实时通信
- **Socket.io**: WebSocket 通信

### 开发工具

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试框架
- **Husky**: Git 钩子管理
- **Docker**: 容器化部署

### 构建和部署

- **Vercel**: 前端部署平台
- **GitHub Actions**: CI/CD 流水线
- **Sentry**: 错误监控
- **Crowdin**: 国际化管理

---

_生成时间: $(date)_ _项目版本: Excalidraw v0.18.0_
