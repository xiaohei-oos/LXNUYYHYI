# AGENTS.md

## 项目概览

LXNUYYHYI - 愿景板图片包付费下载商城。面向美国用户，按分类包售卖愿景板高清图片素材，支持 PayPal 支付和 ZIP 压缩包下载。

### 商业模式

- **售卖单元**：分类图片包（非单张图片）
- 用户浏览 8 大分类 → 预览缩略图 → 支付固定金额 → 下载整个分类的 ZIP 压缩包

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Payment**: PayPal
- **Storage**: S3 兼容对象存储 (coze-coding-dev-sdk)
- **Fonts**: Playfair Display (serif) + Inter (sans)

## 目录结构

```
├── scripts/
│   └── seed.ts                # 数据库种子脚本（8分类+24图片）
├── src/
│   ├── app/
│   │   ├── page.tsx           # 首页（Hero + 8分类商品卡片）
│   │   ├── layout.tsx         # 根布局（LXNUYYHYI品牌）
│   │   ├── globals.css        # 全局样式（含 Design Tokens）
│   │   ├── category/[slug]/   # 分类详情页（预览+整包购买）
│   │   ├── blog/
│   │   │   ├── page.tsx       # 博客列表页（分类筛选+分页）
│   │   │   └── [slug]/        # 博客详情页（Markdown渲染+SEO）
│   │   ├── checkout/
│   │   │   ├── success/       # 支付成功页（含下载）
│   │   │   └── cancel/        # 支付取消页
│   │   ├── xiaoheiduo9898/    # 全中文后台管理面板（需登录验证）
│   │   └── api/
│   │       ├── categories/    # 分类列表 API
│   │       ├── images/        # 图片列表 API
│   │       ├── blog/          # 博客公开 API（列表+详情）
│   │       ├── checkout/      # 支付创建/验证 API
│   │       ├── stripe/webhook # Legacy webhook endpoint (PayPal uses capture flow)
│   │       ├── download/[token] # 安全下载 API
│   │       ├── admin/         # 后台管理 API
│   │       └── xiaoheiduo9898/ # 后台管理 API（含 blog CRUD）
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

- **categories**: 分类表（= 商品，8 个分类，含价格、ZIP文件Key、中英文名称）
- **vision_images**: 图片表（属于分类，缩略图URL公开，高清图Key私有）
- **orders**: 订单表（关联分类包，PayPal Order ID（存于stripe_session_id字段），download_token 一次性下载令牌，24h 过期，最多 3 次下载）
- **blog_posts**: 博客文章表（SEO文章，含 slug/meta_description/meta_keywords/tags/cover_image/Markdown正文/category/status/author）

## 中英文分类映射

| 英文（前台） | 中文（后台） | slug |
|-------------|------------|------|
| Wealth & Finance | 财富与财务 | wealth-finance |
| Travel & Adventure | 旅行与探索 | travel-adventure |
| Health & Fitness | 健康与健身 | health-fitness |
| Career & Business | 职业与事业 | career-business |
| Self-Love & Personal Growth | 自爱与成长 | self-love-growth |
| Family & Relationship | 家庭与关系 | family-relationship |
| Home & Living | 居家生活 | home-living |
| Spiritual & Manifestation | 灵性与显化 | spiritual-manifestation |

## 核心业务流程

1. 浏览 → 首页查看 8 大分类商品卡片
2. 预览 → 点击分类 → 查看该分类下图片缩略图
3. 购买 → 点击 Buy Now → PayPal Checkout
4. 下载 → 支付成功 → 签名 URL 下载分类 ZIP 包

## 后台管理

- 访问路径：`/xiaoheiduo9898`
- 登录验证：用户名 `xysales`，密码环境变量 `ADMIN_PASSWORD`
- 全中文界面
- 功能：仪表盘、图片管理、图片上传（直传S3）、分类管理（改价格）、订单管理

## 开发规范

- TypeScript strict 模式，禁止隐式 any
- 字段名使用 snake_case（Supabase 规范）
- 每次数据库操作必须检查 error 并 throw
- 下载必须使用签名 URL 重定向，不经过 Vercel 传输大文件
- 高清图 key 存数据库，URL 动态生成
- 后台 API 路径统一为 `/api/xiaoheiduo9898/*`
