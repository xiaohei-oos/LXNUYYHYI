# AGENTS.md

## 项目概览

VisionDream - 愿景板图片付费下载平台。面向美国用户，提供高质量的愿景板图片素材，支持按类别浏览、Stripe 支付和高清图片下载打印。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Payment**: Stripe Checkout
- **Storage**: S3 兼容对象存储 (coze-coding-dev-sdk)
- **Fonts**: Playfair Display (serif) + Inter (sans)

## 目录结构

```
├── scripts/
│   └── seed.ts                # 数据库种子脚本（分类+图片）
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页（Hero + 分类 + 精选）
│   │   ├── layout.tsx         # 根布局
│   │   ├── globals.css        # 全局样式（含 Design Tokens）
│   │   ├── category/[slug]/   # 分类详情页
│   │   ├── image/[id]/        # 图片预览页
│   │   │   └── ImagePreviewClient.tsx  # 客户端购买组件
│   │   ├── checkout/
│   │   │   ├── success/       # 支付成功页（含下载）
│   │   │   └── cancel/        # 支付取消页
│   │   └── api/
│   │       ├── categories/    # 分类列表 API
│   │       ├── images/        # 图片列表/详情 API
│   │       ├── checkout/      # 支付创建/验证 API
│   │       ├── stripe/webhook # Stripe Webhook
│   │       └── download/[token] # 安全下载 API
│   ├── storage/database/
│   │   ├── supabase-client.ts # Supabase 客户端
│   │   └── shared/schema.ts   # Drizzle 数据库 Schema
│   └── components/ui/         # shadcn/ui 组件库
├── DESIGN.md                  # 设计规范
└── package.json
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，严禁使用 npm 或 yarn。

## 核心数据模型

- **categories**: 分类表（6 个分类：Health, Wealth, Love, Career, Travel, Growth）
- **vision_images**: 图片表（缩略图URL公开，高清图Key私有，需签名URL下载）
- **orders**: 订单表（Stripe Session 关联，download_token 一次性下载令牌，24h 过期，最多 3 次下载）

## 核心业务流程

1. 浏览 → 分类/首页查看图片
2. 预览 → 点击图片进入预览页（低清+水印）
3. 购买 → 点击 Buy & Download → Stripe Checkout
4. 下载 → 支付成功 → 签名 URL 下载高清图

## 开发规范

- TypeScript strict 模式，禁止隐式 any
- 字段名使用 snake_case（Supabase 规范）
- 每次数据库操作必须检查 error 并 throw
- 图片下载必须使用 fetch + blob 模式（跨域安全）
- 签名 URL 不持久化，按需生成
- 高清图 key 存数据库，URL 动态生成
