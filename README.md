# C斩 · 《C程序设计》百词斩学习站（纯静态）

按教材十章做知识点斩卡、做题、错题本。进度保存在**你手机浏览器的本地存储**，不需要登录，也不依赖服务器数据库。

## 手机怎么打开

部署后的地址：

**https://baiwj0315-crypto.github.io/c-zhan/**

用手机浏览器（Safari / Chrome 等）打开即可。建议「添加到主屏幕」方便回访。

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

开发服务器默认在根路径；正式构建的 `base` 是 `/c-zhan/`（对应 GitHub project pages）。

```bash
npm run build
npm run preview
```

预览时请用带 `/c-zhan/` 前缀的地址。

## 技术说明

- React + Vite + React Router（客户端路由）
- Tailwind CSS，暗色、手机优先（`max-w-lg` + 底栏）
- GitHub Actions 构建并发布到 GitHub Pages
