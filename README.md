# Lib One — 獨立 HTML 版本

這是 lib-one.com 的純靜態 HTML 網站，與原 React／Vinext 網站各自獨立。正式網站不需要 Node.js 或收件後端；開發工具只用於編譯樣式、測試及本機預覽。

## 開啟與編輯

目前站內連結採無副檔名網址，請用支援 clean routes 的預覽方式，不再以雙擊 HTML 或一般檔案伺服器測試完整導覽。開發工具需要 Node.js 22.22.2+（22 系列）、24.15+（24 系列）或 26+：

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run preview
```

開啟 `http://127.0.0.1:4173/`。本機預覽加上 noindex HTTP 標頭，不會強制導向正式網域。正式發布目錄為 `dist/`，僅包含 HTML、CSS、JS、圖片、字體、robots、sitemap 及靜態轉址規則；不要將整個 repo、node_modules 或部署文件設為公開目錄。


- 首頁：`index.html`；13 個產品內頁已依目前產品文案整理檔建立，檔名使用固定產品 ID。
- SCSS 原始檔位於 `scss/`；請編輯 `scss/home.scss`、`scss/globals.scss` 與 `scss/icons.scss`。
- 品牌與介面顏色集中在 `scss/_variables.scss`，各樣式檔不直接填寫色碼。
- `css/` 是瀏覽器使用的編譯結果，請勿直接編輯。修改 SCSS 後執行 `npm run styles`，並將 CSS 及 source map 一起提交。新增的選型表、問答與諮詢按鈕樣式位於 `scss/_seo.scss`。
- 專案已提供 `.vscode/settings.json`。使用 VS Code 的 Live Sass Compiler 時，儲存 `scss/*.scss` 會直接輸出到 `css/`，並同步產生對應的 `.css.map` source map。
- 本站不使用 Tailwind。首頁區塊 class 統一使用 `site-` 前綴。
- Hero 的字級、排列與動畫位於 `scss/home.scss`；Lucide 圖示由 `scss/icons.scss` 管理。
- 互動：`js/site.js`；Hero 說明資料：`js/data.js`。
- 圖示：Lucide SVG 已內嵌於 HTML 與 `js/icons.js`，共用尺寸在 `css/icons.css`；授權保存在 `assets/icons/lucide/LICENSE`。來源：https://github.com/lucide-icons/lucide（2026-09-15 取得）。
- 圖片及字體：`assets/`。搬移時請搬整個資料夾，不要只搬 HTML。
- 產品圖片位於各產品資料夾的 `img/`。首頁設備總覽使用 `overview-product` 素材；產品 Hero 與相關產品卡片使用 `hero-product` 素材，副檔名依採用版本而定。
- 替換產品圖時，須同步檢查首頁設備總覽、內頁 Hero、相關產品卡片及 JSON-LD。借還書機、空間座位預約機與館員工作站已提供 `*-no-cameras.webp` 的圖片，應引用對應的去鏡頭版本，避免相關產品卡片沿用舊圖。充電櫃與智慧預約取書櫃保留原有鏡頭，使用原始圖片。

保留 Hero 手動切換、視差、產品換圖、放大、手機滑動、場域按鈕、鍵盤與選單操作；沒有自動輪播。減少動態偏好沿用原 CSS。

## 諮詢方式

- 這是純靜態網站，沒有 `/api/contact` 收件端點；不在前端放置寄信密鑰，也不呼叫未知服務。
- 導覽連到 `/contact`，13 個產品的諮詢按鈕會帶入設備選項，包含 HyPass。
- 「以 Email 傳送需求」只準備 `service@hyweb.com.tw` 的郵件草稿，必須由使用者在郵件軟體確認並寄出；畫面不宣稱已寄信或已收件。
- 沒有預設郵件軟體、需求較長或 Clipboard API 不可用時，仍可從畫面手動複製完整需求內容；填寫資料不會清空。
- JavaScript 未載入時，按鈕維持停用並提供直接 Email 連結；不會把資料 POST 到不存在的後端。

## SEO 與主機設定

- 正式 canonical 為 `https://lib-one.com/` 及無副檔名內頁；`sitemap.xml` 列出 15 頁，並由 `robots.txt` 宣告。
- 公司、品牌及產品 JSON-LD 使用固定的絕對識別與圖片網址。修改產品介紹時，需同步其 Product description；`npm test` 會核對畫面與資料一致。
- 館員工作站、RFID 工作站、桌上型自助借還書機提供選型比較與可見問答。內容依既有規格整理，不代表未確認的配置保證。
- `_redirects` 提供舊 HTML／尾斜線的永久轉址；主機需支援此檔案。HTTP → HTTPS 的 Cloudflare 規則與實際上線驗收在 [deploy/README.md](deploy/README.md)，須由現行主機維護者套用；PR 不會自動修改主機規則。
- 正式頁保留 index 設定；非正式預覽應於主機另加 noindex 或限制存取，不要把正式站 robots 一起改為阻擋。

## 素材與維護

- 草稿／概念素材是否可公開，依專案的文案與素材核准紀錄確認。
- 原站的 production guard 不會在純 HTML 執行；正式發布前仍須核准文案及替換概念素材。
- HTML 為可編輯快照；產品頁以 `data-product-id` 與固定檔名識別，後續可依新版文案整理檔批次更新內容。
- 本版已套用 Lucide 圖示；重新從原 React 站匯出會覆蓋 HTML 的圖示修改，請勿直接重跑匯出工具。
