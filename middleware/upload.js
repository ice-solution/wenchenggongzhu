const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const compressionConfig = require('../config/imageCompression');

// 設定檔案儲存 - 使用記憶體儲存以便壓縮
const storage = multer.memoryStorage();

// 檔案過濾器
const fileFilter = (req, file, cb) => {
  // 只允許圖片檔案
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允許上傳圖片檔案！'), false);
  }
};

// 設定 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: compressionConfig.maxFileSize,
  }
});

// 圖片壓縮函數
const compressImage = async (buffer, filename) => {
  try {
    // 取得圖片資訊
    const metadata = await sharp(buffer).metadata();
    console.log(`原始圖片: ${metadata.width}x${metadata.height}, 大小: ${buffer.length} bytes`);
    
    // 設定壓縮參數
    const maxWidth = compressionConfig.maxWidth;
    const maxHeight = compressionConfig.maxHeight;
    
    let sharpInstance = sharp(buffer);
    
    // 調整大小 (保持比例)
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 根據原始格式進行壓縮
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      sharpInstance = sharpInstance.jpeg({ 
        quality: compressionConfig.jpegQuality,
        progressive: compressionConfig.progressive,
        mozjpeg: compressionConfig.mozjpeg
      });
    } else if (metadata.format === 'png') {
      sharpInstance = sharpInstance.png({ 
        quality: compressionConfig.pngQuality,
        compressionLevel: compressionConfig.pngCompressionLevel,
        progressive: compressionConfig.progressive
      });
    } else if (metadata.format === 'webp') {
      sharpInstance = sharpInstance.webp({ 
        quality: compressionConfig.webpQuality
      });
    } else {
      // 其他格式轉為預設格式
      if (compressionConfig.defaultFormat === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ 
          quality: compressionConfig.jpegQuality,
          progressive: compressionConfig.progressive
        });
      } else {
        sharpInstance = sharpInstance.png({ 
          quality: compressionConfig.pngQuality,
          compressionLevel: compressionConfig.pngCompressionLevel
        });
      }
    }
    
    // 執行壓縮
    const compressedBuffer = await sharpInstance.toBuffer();
    
    console.log(`壓縮後: 大小: ${compressedBuffer.length} bytes, 節省: ${((buffer.length - compressedBuffer.length) / buffer.length * 100).toFixed(1)}%`);
    
    return compressedBuffer;
  } catch (error) {
    console.error('圖片壓縮失敗:', error);
    throw error;
  }
};

// 儲存壓縮後的圖片
const saveCompressedImage = async (buffer, originalName) => {
  const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName).toLowerCase();
  
  // 確保副檔名
  const finalExt = compressionConfig.supportedFormats.some(format => ext === `.${format}`) ? ext : `.${compressionConfig.defaultFormat}`;
  const filename = 'event_' + uniqueSuffix + finalExt;
  
  const filePath = path.join(__dirname, '../uploads/events', filename);
  
  // 確保目錄存在
  const fs = require('fs');
  const uploadDir = path.dirname(filePath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // 寫入檔案
  fs.writeFileSync(filePath, buffer);
  
  return filename;
};

module.exports = { upload, compressImage, saveCompressedImage };
