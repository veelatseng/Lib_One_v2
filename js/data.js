/**
 * 首頁目前實際使用的資料
 *
 * products：Header 產品下拉選單與 Hero 說明浮層共用的產品資料。
 * ├─ id：產品唯一識別碼；供 JavaScript 查找及 Hero 配對。
 * ├─ path：產品詳細頁路徑；用來產生產品連結。
 * ├─ nameEn：產品英文名稱。
 * ├─ nameZh：產品中文名稱。
 * ├─ sceneSlug：所屬場域；entry＝出入館、borrow＝借還書、
 * │              space＝空間設備服務、staff＝館務作業。
 * └─ description：Hero 選取產品時顯示的簡短說明。
 *
 * heroScenes：依首頁 Hero 卡片順序，將卡片連到 products 的資料。
 * └─ productId：對應 products 裡的 id。
 *
 * Hero 的人物、設備圖層及位置目前已直接寫在 index.html，
 * 因此這裡不再保留重複的圖層、座標與素材狀態設定。
 */
window.LIB_ONE_DATA = {
  "products": [
    {
      "id": "access-gate",
      "path": "/products/access-gate",
      "nameEn": "Access Gate",
      "nameZh": "智慧閘門",
      "sceneSlug": "entry",
      "description": "驗證讀者身分，將通行狀態帶入清楚的入館動線。"
    },
    {
      "id": "smart-checkout-gate",
      "path": "/products/smart-checkout-gate",
      "nameEn": "Smart Checkout Gate",
      "nameZh": "智慧借閱通關系統",
      "sceneSlug": "entry",
      "description": "把讀者辨識、館藏借閱與離館引導，安排在同一段通行體驗中。"
    },
    {
      "id": "self-service-kiosk",
      "path": "/products/self-service-kiosk",
      "nameEn": "Self-Service Kiosk",
      "nameZh": "直立式自助借還書機",
      "sceneSlug": "borrow",
      "description": "以直立操作台承接日常借還流程，讓讀者在清楚引導下自助完成服務。"
    },
    {
      "id": "desktop-self-service-kiosk",
      "path": "/products/desktop-self-service-kiosk",
      "nameEn": "Desktop Self-Service Kiosk",
      "nameZh": "桌上型自助借還書機",
      "sceneSlug": "borrow",
      "description": "將自助借還功能帶進既有服務櫃台或桌面配置。"
    },
    {
      "id": "smart-reserved-book-pickup-locker",
      "path": "/products/smart-reserved-book-pickup-locker",
      "nameEn": "Smart Reserved Book Pickup Locker",
      "nameZh": "智慧預約取書櫃",
      "sceneSlug": "borrow",
      "description": "讓預約館藏的取用流程延伸到自助服務時段。"
    },
    {
      "id": "hypass-self-service-registration-kiosk",
      "path": "/products/hypass-self-service-registration-kiosk",
      "nameEn": "HyPass Self-Service Registration Kiosk",
      "nameZh": "HyPass 圖書館智慧辦證服務站",
      "sceneSlug": "borrow",
      "description": "整合證件辨識、資格查核與借閱證開卡，讓讀者自助完成辦證與展延。"
    },
    {
      "id": "space-kiosk",
      "path": "/products/space-kiosk",
      "nameEn": "Space Kiosk",
      "nameZh": "直立式空間座位預約機",
      "sceneSlug": "space",
      "description": "讓座位與空間服務出現在讀者容易抵達的位置，形成清楚的查詢與報到節點。"
    },
    {
      "id": "desktop-space-kiosk",
      "path": "/products/desktop-space-kiosk",
      "nameEn": "Desktop Space Kiosk",
      "nameZh": "桌上型空間座位預約機",
      "sceneSlug": "space",
      "description": "以桌上型配置承接空間查詢、預約與現場報到。"
    },
    {
      "id": "display",
      "path": "/products/display",
      "nameEn": "Display",
      "nameZh": "電子紙／數位資訊顯示設備",
      "sceneSlug": "space",
      "description": "將館藏、活動與空間資訊安排在合適的閱讀節點。"
    },
    {
      "id": "hyread-kiosk",
      "path": "/products/hyread-kiosk",
      "nameEn": "HyRead Kiosk",
      "nameZh": "HyRead 行動圖書館",
      "sceneSlug": "space",
      "description": "以觸控展示、主題書展與 QR Code 串接，讓讀者在館內探索並延伸閱讀電子書。"
    },
    {
      "id": "multifunction-device-charging-cabinet",
      "path": "/products/multifunction-device-charging-cabinet",
      "nameEn": "Multifunction Device Charging Cabinet",
      "nameZh": "多功能設備充電櫃",
      "sceneSlug": "space",
      "description": "在閱讀空間中提供可被管理的裝置充電服務。"
    },
    {
      "id": "workstation",
      "path": "/products/workstation",
      "nameEn": "Workstation",
      "nameZh": "館員工作站",
      "sceneSlug": "staff",
      "description": "把館員的流通作業集中在一個安靜、清楚、容易維護的桌面節點。"
    },
    {
      "id": "rfid-workstation",
      "path": "/products/rfid-workstation",
      "nameEn": "RFID Workstation",
      "nameZh": "RFID工作站",
      "sceneSlug": "staff",
      "description": "支援館藏標籤與資料處理的桌面作業節點。"
    }
  ],
  "heroScenes": [
    { "productId": "smart-checkout-gate" },
    { "productId": "self-service-kiosk" },
    { "productId": "desktop-self-service-kiosk" },
    { "productId": "space-kiosk" },
    { "productId": "workstation" }
  ]
};
