# DESIGN.md

## 品牌

- 品牌名：LXNUYYHYI（美国注册商标）
- 定位：愿景板图片包付费下载商城

## 气质与意象

"清晨阳光洒在桌面的灵感板上" — 温暖、宁静、充满可能性。不是冷冰冰的图库网站，而是一间精心策展的灵感画廊，每个分类包都在低声诉说梦想。

## 配色方案

- 主背景：暖白 #FAFAF8（晨光透过纱帘的白墙）
- 前景文字：深炭灰 #1A1A1A（炭笔在白纸上的笔触）
- 主强调色：温暖金 #C8956C（午后阳光的铜色光斑）
- 次强调色：柔粉 #E8C4B8（干枯玫瑰花瓣）
- 柔和绿：#A8B5A0（清晨薄荷叶上的露水）
- 边框/分割：#E8E6E1（亚麻布的自然纹理）
- 卡片背景：#FFFFFF
- 按钮主色：#1A1A1A（黑色按钮，高端感）
- 价格标签：#C8956C（温暖金，呼应购买欲望）

## 字体排版

- 标题字体：Playfair Display（衬线，优雅经典，Google Fonts）
- 正文字体：Inter（无衬线，清晰易读，Google Fonts）
- 排版节奏：标题大而疏，正文小而密，留白呼吸感

## 视觉策略

- 图片风格：愿景板美学 — 柔光、自然纹理、温暖色调、梦想氛围
- 图形语言：大圆角卡片（rounded-2xl）、柔和阴影、呼吸间距
- 售卖模式：按分类包售卖，展示缩略图预览 + 整包购买

## 页面结构

- 首页：全幅 Hero → 8 分类商品卡片（4列网格）→ 信任标识
- 分类详情页：面包屑 → 缩略图预览网格 → 包含内容说明 → 整包购买按钮
- 支付成功页：居中卡片式布局 → 下载按钮醒目
- 后台管理：全中文界面 → 仪表盘/图片上传/分类管理/订单管理

## 8 大导航分类

| 导航名 | 英文全名 | 中文名 | slug |
|--------|---------|--------|------|
| Wealth | Wealth & Finance | 财富与财务 | wealth-finance |
| Travel | Travel & Adventure | 旅行与探索 | travel-adventure |
| Fitness | Health & Fitness | 健康与健身 | health-fitness |
| Career | Career & Business | 职业与事业 | career-business |
| Self-Love | Self-Love & Personal Growth | 自爱与成长 | self-love-growth |
| Family | Family & Relationship | 家庭与关系 | family-relationship |
| Home | Home & Living | 居家生活 | home-living |
| Spiritual | Spiritual & Manifestation | 灵性与显化 | spiritual-manifestation |

## 动效与交互

- 分类卡片：hover 时轻微上浮 + 阴影加深（translate-y -2px, shadow-lg）
- 页面过渡：淡入（fade-in），不用弹跳或滑动
- 按钮：hover 时背景色加深 10%，点击时 scale(0.98)
- 图片加载：skeleton 占位 → 淡入显示

## 设计禁忌

- 禁止使用科技蓝/紫渐变
- 禁止使用纯黑 #000 背景
- 禁止过重的阴影和边框
- 禁止卡片内文字过于拥挤
- 禁止使用 Comic Sans、Impact 等非正式字体
- 禁止弹窗广告或自动播放视频
