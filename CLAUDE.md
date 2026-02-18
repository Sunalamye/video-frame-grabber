# Video Frame Grabber

純前端 Vite + vanilla JS 影片截幀工具。

## 開發指令

```bash
npm run dev          # 啟動 dev server (127.0.0.1:5713)
npm run build        # 產出 dist/index.html (單一 HTML，vite-plugin-singlefile)
npm run preview      # 預覽 build 產出
```

## 完成功能修改後的驗證流程

每次修改程式碼後，務必依序確認：

1. **Vite build** — `npm run build`，確認無錯誤且 `dist/index.html` 存在
2. **Docker build** — `docker build -t video-frame-grabber .`，確認 image 建置成功
3. **離線版** — build 產出的單一 HTML 即為離線版基礎；頁面內 `INITIAL_HTML` 在模組載入時擷取 `document.documentElement.outerHTML`，確保新增的 DOM 元素都寫在 `index.html` 中（不要純用 JS 動態建立永久 UI 元素）

## 架構重點

- 11 個 JS 模組 (`src/modules/`) + 1 個 CSS (`src/styles/global.css`)
- `vite-plugin-singlefile` 將 JS/CSS 全部內聯進單一 HTML (約 37KB / gzip 12KB)
- 離線版下載功能依賴 `INITIAL_HTML = document.documentElement.outerHTML`
- 模組初始化函式需支援重複呼叫（換影片時會再次觸發 `onVideoLoaded`），用 `initialized` flag 防止重複綁定事件監聽器

## 部署

- **GitHub Pages**: `gh-pages` 分支，base path `/video-frame-grabber/`
- **Docker**: `docker run -p 127.0.0.1:5713:80 video-frame-grabber`
- **綁定規則**: 所有服務一律綁 `127.0.0.1`，不用 `0.0.0.0`

## UI/UX 設計系統

- Cinema Dark + Soft UI Evolution 風格
- 圖標全部使用 SVG，不用 emoji
- 藥丸型按鈕、Glassmorphism 效果
- 響應式斷點：768px (tablet) + 480px (mobile)
