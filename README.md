# Lib One — 獨立 HTML 版本

這是目前網站的 HTML 快照，與原 React／Vinext 網站各自獨立，修改不會自動同步。

## 開啟與編輯

- 雙擊 `index.html` 可直接開啟；所有字體與圖片使用相對路徑。
- 也可以在 VS Code 使用 Live Server 開啟 `index.html`。
- 首頁：`index.html`；13 個產品內頁已依目前產品文案整理檔建立，檔名使用固定產品 ID。
- SCSS 原始檔位於 `scss/`；請編輯 `scss/home.scss`、`scss/globals.scss` 與 `scss/icons.scss`。
- 品牌與介面顏色集中在 `scss/_variables.scss`，各樣式檔不直接填寫色碼。
- `css/` 是瀏覽器使用的編譯結果，請勿直接編輯。網站不需要 Node.js、npm 或 `node_modules`。
- 專案已提供 `.vscode/settings.json`。使用 VS Code 的 Live Sass Compiler 時，儲存 `scss/*.scss` 會直接輸出到 `css/`，並且不產生 source map。
- 本站不使用 Tailwind。首頁區塊 class 統一使用 `site-` 前綴。
- Hero 的字級、排列與動畫位於 `scss/home.scss`；Lucide 圖示由 `scss/icons.scss` 管理。
- 互動：`js/site.js`；Hero 說明資料：`js/data.js`。
- 圖示：Lucide SVG 已內嵌於 HTML 與 `js/icons.js`，共用尺寸在 `css/icons.css`；授權保存在 `assets/icons/lucide/LICENSE`。來源：https://github.com/lucide-icons/lucide（2026-09-15 取得）。
- 圖片及字體：`assets/`。搬移時請搬整個資料夾，不要只搬 HTML。
- 首頁設備總覽、產品 Hero 與相關產品卡片均使用各產品資料夾內的 `img/hero-product.png`。

保留 Hero 手動切換、視差、產品換圖、放大、手機滑動、場域按鈕、鍵盤與選單操作；沒有自動輪播。減少動態偏好沿用原 CSS。

## 限制

- 表單仍為預覽，不會傳送或保存資料，沒有後端。
- 保留原站的草稿／概念素材提示與 noindex，不能視為已核准公開發布。
- 原站的 production guard 不會在純 HTML 執行；正式發布前仍須核准文案及替換概念素材。
- HTML 為可編輯快照；產品頁以 `data-product-id` 與固定檔名識別，後續可依新版文案整理檔批次更新內容。
- 本版已套用 Lucide 圖示；重新從原 React 站匯出會覆蓋 HTML 的圖示修改，請勿直接重跑匯出工具。
