# 房贷提前还款计算器 H5 版本

一个纯H5版本的房贷提前还款计算器，支持等额本息和等额本金两种还款方式。

## 功能特性

- 支持等额本息还款方式
- 支持等额本金还款方式
- 支持两种提前还款处理方式：
  - 期限不变，减少月供
  - 月供不变，缩短期限
- 实时计算结果展示
- 响应式设计，适配移动端和PC端
- 金融蓝色风格UI

## 项目结构

```
mortgage-calculator-h5/
├── index.html              # 主入口
├── test.html               # 测试页面
├── css/
│   ├── reset.css          # 样式重置
│   ├── variables.css      # CSS变量
│   ├── form.css           # 表单样式
│   ├── result.css         # 结果样式
│   └── responsive.css     # 响应式
├── js/
│   ├── utils.js           # 工具函数
│   ├── calculator.js      # 核心计算引擎
│   ├── form.js            # 表单交互
│   ├── result.js          # 结果渲染
│   └── app.js             # 应用入口
└── README.md
```

## 使用方法

### 直接使用

1. 直接在浏览器中打开 `index.html` 文件即可使用

2. 或将整个项目部署到静态服务器

### 部署方式

支持任何静态文件托管服务：

- **GitHub Pages**: 推送代码后启用 Pages 功能
- **Vercel**: 直接导入项目目录
- **阿里云OSS / 腾讯云COS**: 上传静态文件
- **Nginx / Apache**: 放置到 web 根目录

### 嵌入方式

```html
<!-- 作为 iframe 嵌入 -->
<iframe src="https://your-domain.com/mortgage-calculator/" width="100%" height="600"></iframe>
```

## 计算公式

### 等额本息

```
原月供 A = P * i * (1 + i)^N / ((1 + i)^N - 1)

剩余本金 P_remain = P * (1 + i)^k - A * ((1 + i)^k - 1) / i

新月供 A_new = P_new * i * (1 + i)^N_rem / ((1 + i)^N_rem - 1)
```

### 等额本金

```
每月本金 B = P / N

剩余本金 P_remain = P - k * B

新月供 = 新每月本金 + 剩余利息
```

## 浏览器兼容性

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)
- 移动端浏览器

## 许可证

MIT License
