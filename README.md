# GPlay Icon Finder

Plugin Figma sử dụng [google-play-scraper](https://github.com/facundoolano/google-play-scraper) giúp tìm kiếm và nhập icon ứng dụng từ Google Play Store vào Figma.

---

## 🇻🇳 Hướng dẫn cài đặt & build

### 1. Yêu cầu

- Node.js >= 16
- npm hoặc yarn

### 2. Cài đặt các thư viện

Mở terminal tại thư mục dự án và chạy:

```bash
npm install
# hoặc
yarn install
```

### 3. Thiết lập biến môi trường

Tạo file `.env` ở thư mục gốc (nếu chưa có) với nội dung:

```env
VERCEL_API_BASE_URL=your_vercel_url
FIGMA_PLUGIN_API_KEY=your_api_key
```

### 4. Build plugin

Chạy lệnh sau để build mã nguồn:

```bash
npm run build
# hoặc
yarn build
```

File build sẽ nằm trong thư mục `dist/`.

### 5. Cài đặt vào Figma

1. Mở Figma → Plugins → Development → Import plugin from manifest...
2. Chọn file `manifest.json` trong thư mục dự án.

### 6. Sử dụng

- Mở plugin trong Figma.
- Nhập tên ứng dụng cần tìm kiếm icon.
- Chọn icon và nhấn "Xuất icon vào Figma".

---

Nếu gặp lỗi hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub.

---

# GPlay Icon Finder

A Figma plugin using [google-play-scraper](https://github.com/facundoolano/google-play-scraper) to search and import app icons from Google Play Store into Figma.

---

## 🇬🇧 Setup & Build Instructions

### 1. Requirements

- Node.js >= 16
- npm or yarn

### 2. Install dependencies

Open terminal in the project folder and run:

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory (if not exists) with the following content:

```env
VERCEL_API_BASE_URL=your_vercel_url
FIGMA_PLUGIN_API_KEY=your_api_key
```

### 4. Build the plugin

Run the following command to build the source code:

```bash
npm run build
# or
yarn build
```

The build files will be in the `dist/` folder.

### 5. Install into Figma

1. Open Figma → Plugins → Development → Import plugin from manifest...
2. Select the `manifest.json` file in your project folder.

### 6. Usage

- Open the plugin in Figma.
- Enter the app name to search for icons.
- Select icons and click "Export icons to Figma".

---

If you encounter any issues or need support, please create an issue