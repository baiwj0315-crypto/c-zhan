# C斩 · 《C程序设计》百词斩学习站（纯静态）

按教材十章做知识点斩卡、做题、错题本。进度保存在**你手机浏览器的本地存储**，不需要登录，也不依赖服务器数据库。

## 手机怎么打开

**https://baiwj0315-crypto.github.io/c-zhan/**（请带尾斜杠）

也可用 hash 首页：`https://baiwj0315-crypto.github.io/c-zhan/#/`

站点使用 HashRouter，子页形如 `/c-zhan/#/quiz`，避免 GitHub Pages 对子路径返回 404（部分安卓浏览器会直接显示 404）。

用手机浏览器（Safari / Chrome 等）打开即可。建议「添加到主屏幕」方便回访。

验证建议：打开后在「知识点」里斩一张卡或做一道题，再刷新页面，进度应还在；切到「我的」能看到本机统计与知识点掌握。

## 做题能力

- 题型：四选一、判断、填空、看代码输出（选/填）
- 每日目标与综合刷题默认 **15** 题；一组题带进度条；选题优先「很久没做 / 从没做过 / 错过」，本轮不重复
- 每题关联知识点；答对累加连续正确，答错标为需复习；**连续答对 ≥6 才算「掌握」**；章节进度按掌握加权（「较熟」不再算进掌握数）
- 题库约 **230+** 题，十章尽量均衡（顺序/分支/循环略多）

## 题库来源

- 教材 PDF《C语言设计教程》为**扫描件**：用 `pdftoppm` 抽查了各章「思考题 / 习题 / 上机训练」页与附录单号答案；能辨认的已改编入库
- 同时参考杉达复习选择题/样题风格补足考点覆盖
- **未**宣称 OCR 全书每一道原题；`source` 字段标明「改编 / 练习风格 / 原题风格」

## 进度存在哪里

- 本地键名：`c-zhan-study-v1`（内部 version 字段可升级，兼容旧数据）
- 内容包括：斩卡状态、做题记录、最近作答时间、错题本、知识点掌握、连续天数、笔记
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

- React + Vite + React Router HashRouter（适配 GitHub Pages，避免子路径 404）
- Tailwind CSS，暗色、手机优先（`max-w-lg` + 底栏）
- 无后端、无登录；纯前端 localStorage
