# C斩 · 《C程序设计》百词斩学习站（纯静态）

按教材十章做知识点斩卡、做题、错题本。进度保存在**你手机浏览器的本地存储**，不需要登录，也不依赖服务器数据库。

## 手机怎么打开

**https://baiwj0315-crypto.github.io/c-zhan/**

用手机浏览器（Safari / Chrome 等）打开即可。建议「添加到主屏幕」方便回访。

验证建议：打开后在「知识点」里斩一张卡或做一道题，再刷新页面，进度应还在；切到「我的」能看到本机统计。

## 进度存在哪里

- 本地键名：`c-zhan-study-v1`
- 内容包括：斩卡状态、做题记录、错题本、连续天数、笔记
- 在「我的」页可以点「清除本地进度」

请注意：

1. **清浏览器缓存 / 站点数据会丢进度**
2. **换浏览器或换手机不同步**（各自一份本地数据）
3. 暂时没有云端备份；以后若要跨设备同步，再另开后端

## 本地开发

```bash
npm install
npm run dev
```

正式构建的 `base` 是 `/c-zhan/`（对应 GitHub project pages）：

```bash
npm run build
cp dist/index.html dist/404.html
npm run preview
```

## 部署说明

源码在 `main` 分支。静态产物推到 `gh-pages` 分支，GitHub Pages 从该分支根目录发布。

更新站点时：

```bash
npm run build && cp dist/index.html dist/404.html
# 将 dist 内容推到 gh-pages 分支
```

## 技术说明

- React + Vite + React Router（客户端路由）
- Tailwind CSS，暗色、手机优先（`max-w-lg` + 底栏）
- 无后端、无登录；纯前端 localStorage
