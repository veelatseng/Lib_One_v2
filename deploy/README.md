# 正式站網址設定

本 repo 是純靜態網站，不包含收件後端，也不會因提交 PR 自動變更網域設定。

## HTTPS 與主機名稱

公開回應顯示 lib-one.com 位於 Cloudflare 後方。`cloudflare-https-redirect.json` 是一條可加入既有 Single Redirect 的規則，不是整份 ruleset；請維護者加入現有規則，不要取代或刪除其他規則。

- 僅匹配 `lib-one.com`、`www.lib-one.com` 的 HTTP，或 `www.lib-one.com`。
- 以 308 導向 `https://lib-one.com`，保留原始路徑與 query。
- 不匹配 localhost、預覽網域或其他網站；不變更 DNS、TLS 模式、權限。
- 若已有相同主機的轉址規則，整合為單一規則，避免重複及迴圈。

## 舊頁網址

發布目錄內的 `_redirects` 為 Cloudflare Pages／Workers 靜態資產支援的 301 規則。它將 15 個 `.html` 網址導向現行無副檔名網址，並保留原有 query。網址 fragment 由瀏覽器保留，伺服器不會收到它。

若現行主機沒有讀取 `_redirects`，須將同一份對照表套用到該主機的轉址設定，不能只上傳檔案便視為完成。不要加入把未知網址全部導向首頁的 catch-all；找不到的頁面仍須為 404。

## 上線後唯讀驗收

```sh
curl -I 'http://lib-one.com/workstation?source=redirect-check'
curl -I 'https://www.lib-one.com/workstation?source=redirect-check'
curl -I 'https://lib-one.com/workstation.html?source=redirect-check'
curl -I 'https://lib-one.com/workstation'
curl -I 'https://lib-one.com/sitemap.xml'
curl -I 'https://lib-one.com/not-a-real-page'
```

前兩項應為 308 並保留路徑／query；舊 HTML 頁應為 301；最終內容與 sitemap 為 200，未知頁為 404。HTTP 舊 HTML 可能先統一主機再轉無副檔名，最多兩次轉址。

PR 僅提供設定與檔案。實際套用前，不宣稱已修復線上 HTTP 回應。

官方依據：[Cloudflare Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/)、[靜態資產轉址](https://developers.cloudflare.com/workers/static-assets/redirects/)。
