# Line 貼圖自動化助手 (Line Sticker Factory) ![Version](https://img.shields.io/badge/version-1.0.1-06C755?style=flat-square)

這是一個專為 LINE 貼圖創作者設計的自動化工具，旨在簡化從 AI 生圖到最終貼圖打包的流程。透過本工具，您可以輕鬆將一張 4x3 的 AI 生成角色網格圖，自動切割、去背並打包成符合 LINE 官方規範的貼圖包。

## ✨ 主要功能

*   **🎨 AI 提示詞大師 (Prompt Helper)**
    *   內建多種主題（日常、節日、迷因...）與風格（Q版、寫實、3D...）的 Prompt 產生器。
    *   專門優化用於生成 "4x3 網格" 的角色貼圖集，確保角色一致性與正確的圖片結構。

*   **✂️ 智能切割 (Smart Slicing)**
    *   自動將上傳的 4x3 網格圖精準切割為 12 張獨立貼圖。
    *   即時預覽切割結果。

*   **🪄 專業去背 (Background Removal)**
    *   **綠幕/黑底去背**：針對 AI 生圖常用的綠底或黑底進行優化。
    *   **進階調整**：
        *   **色彩容許度 (Tolerance)**：精準控制去背範圍。
        *   **邊緣柔化 (Smoothness)**：消除鋸齒邊緣。
        *   **溢色去除 (Despill)**：移除邊緣殘留的綠色/黑色光暈。
        *   **裁切縮放**：微調單張貼圖大小，去除不必要的黑邊。

*   **📦 一鍵打包 (One-Click Packaging)**
    *   自動調整圖片尺寸至 LINE 規定的 `370x320` px。
    *   支援選取並自動生成 `Main` (240x240) 與 `Tab` (96x74) 圖片。
    *   **智慧檔名編號**：可自訂起始編號（例如第二組貼圖從 13 開始），下載後的 ZIP 檔內檔案會自動排序，方便管理。

*   **💎 核心美學 (Premium UI/UX)**
    *   **玻璃擬物化設計 (Glassmorphism)**：現代化的透明磨砂質感。
    *   **品牌化視覺**：深度整合 LINE 品牌色彩與 Outfit/Inter 字體。
    *   **流暢動畫**：包含滑入、微彈跳與漸變效果，提升創作體驗。

## 🛠️ 技術疊棧 (Tech Stack)

*   [React](https://react.dev/) - 前端框架
*   [Vite](https://vitejs.dev/) - 建置工具
*   [Tailwind CSS](https://tailwindcss.com/) - 樣式設計
*   [JSZip](https://stuk.github.io/jszip/) - 檔案壓縮打包
*   [FileSaver.js](https://github.com/eligrey/FileSaver.js) - 檔案下載處理
*   [Lucide React](https://lucide.dev/) - 圖標庫

## 🚀 快速開始 (Getting Started)

若您希望在本地端運行此專案，請參考以下步驟：

### 1. 環境需求
確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v16 以上)。

### 2. 安裝依賴
Clone 專案後，進入專案目錄並安裝套件：

```bash
npm install
```

### 3. 啟動開發伺服器
執行以下指令開啟本地開發環境：

```bash
npm run dev
```
啟動後，瀏覽器通常會自動開啟 `http://localhost:5173`。

### 4. 建置生產版本
若要部署至伺服器：

```bash
npm run build
```
建置後的檔案將位於 `dist` 資料夾中。

## 📖 使用教學

1.  **生成圖片**：
    *   在首頁展開「AI 提示詞大師」，選擇喜歡的主題與畫風。
    *   複製 Prompt 到您習慣的 AI 生圖工具 (如 Gemini, Midjourney, DALL-E 3) 生成圖片。
2.  **上傳與切割**：
    *   將生成的 4x3 圖片 (建議尺寸 2560x1664 px) 上傳至工具。
    *   點擊「開始切割」。
3.  **去背處理**：
    *   使用「綠幕去背」或「黑底去背」預設值。
    *   若邊緣不乾淨，展開「進階設定」調整容許度或柔化數值。
4.  **打包下載**：
    *   選擇一張最滿意的圖作為 Main (主圖) 和 Tab (標籤圖)。
    *   設定起始編號 (預設為 01)。
    *   點擊「下載完整 ZIP」，即可獲得準備好上傳 LINE Creators Market 的檔案包！

## 📝 更新日誌
### v1.0.1 (2026-02-18)
*   **✨ 功能優化**：修復 Prompt 複製功能，確保「所見即所得」，複製內容與 UI 顯示完全同步。
*   **🎨 UI/UX 改進**：優化整體佈局與玻璃擬物化 (Glassmorphism) 視覺效果。
*   **🔧 問題修復**：修正部分字體顯示與間距跑版問題。

---
Built with ❤️ for Creators
