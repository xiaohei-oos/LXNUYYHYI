# LXNUYYHYI Image Upload Tool

本地图片上传工具，直接将图片传到阿里云 OSS 并同步到 Supabase 数据库。

## 安装

```bash
cd tools/upload
npm install
```

## 配置

复制 `.env.example` 为 `.env`，填入你的密钥（已预填好，一般不需要改）：

```env
OSS_ACCESS_KEY_ID=你的AccessKey ID
OSS_SECRET_ACCESS_KEY=你的AccessKey Secret
OSS_BUCKET_NAME=yuanjingban
OSS_REGION=us-west-1
OSS_ENDPOINT=oss-us-west-1.aliyuncs.com
```

## 使用方法

### 1. 准备图片

在 `tools/upload/images/` 下按分类创建文件夹，把图片放进去：

```
tools/upload/
├── images/
│   ├── wealth-finance/          ← 文件夹名 = 分类 slug
│   │   ├── abundance-01.jpg
│   │   ├── prosperity-02.jpg
│   │   └── ...
│   ├── travel-adventure/
│   ├── health-fitness/
│   └── ...
├── upload.js
├── package.json
└── .env
```

### 2. 上传图片

```bash
# 上传某个分类
node upload.js --category wealth-finance --dir ./images/wealth-finance/

# 上传所有分类（自动扫描 images/ 下的子文件夹）
node upload.js --all
```

### 3. 创建 ZIP 压缩包（用户购买后下载的文件）

```bash
# 为某个分类创建 ZIP
node upload.js --zip wealth-finance

# 为所有分类创建 ZIP
node upload.js --zip-all
```

### 4. 其他命令

```bash
# 查看所有分类和图片数量
node upload.js --list

# 删除某张图片
node upload.js --delete wealth-finance --image-id xxx
```

## 分类对照表

| 文件夹名 | 英文名 | 中文名 |
|---------|--------|--------|
| wealth-finance | Wealth & Finance | 财富与财务 |
| travel-adventure | Travel & Adventure | 旅行与探索 |
| health-fitness | Health & Fitness | 健康与健身 |
| career-business | Career & Business | 职业与事业 |
| self-love-growth | Self-Love & Personal Growth | 自爱与成长 |
| family-relationship | Family & Relationship | 家庭与关系 |
| home-living | Home & Living | 居家生活 |
| spiritual-manifestation | Spiritual & Manifestation | 灵性与显化 |

## 注意事项

- 上传完成后网站**自动同步**，无需手动操作
- 缩略图由 OSS 图片处理自动生成，无需手动制作
- 上传新图片不会删除已有图片
- ZIP 压缩包包含该分类下所有高清原图
