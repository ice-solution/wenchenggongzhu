// 圖片壓縮配置
module.exports = {
  // 最大尺寸設定
  maxWidth: 1920,
  maxHeight: 1920,
  
  // 品質設定
  jpegQuality: 85,        // JPEG 品質 (1-100)
  pngQuality: 85,         // PNG 品質 (1-100)
  webpQuality: 85,        // WebP 品質 (1-100)
  
  // 壓縮選項
  progressive: true,      // 漸進式載入
  mozjpeg: true,         // 使用 mozjpeg 編碼器 (更好的壓縮)
  
  // PNG 壓縮等級 (0-9, 9 為最高壓縮)
  pngCompressionLevel: 9,
  
  // 檔案大小限制 (上傳前)
  maxFileSize: 10 * 1024 * 1024, // 10MB
  
  // 支援的格式
  supportedFormats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  
  // 預設輸出格式 (如果原始格式不支援)
  defaultFormat: 'jpeg'
};







