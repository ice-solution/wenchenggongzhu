const express = require('express');
const router = express.Router();
const { upload, compressImage, saveCompressedImage } = require('../middleware/upload');
const path = require('path');

// 上傳單一圖片
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '沒有上傳檔案'
      });
    }

    console.log(`開始處理圖片: ${req.file.originalname}, 大小: ${req.file.size} bytes`);

    // 壓縮圖片
    const compressedBuffer = await compressImage(req.file.buffer, req.file.originalname);
    
    // 儲存壓縮後的圖片
    const filename = await saveCompressedImage(compressedBuffer, req.file.originalname);

    // 回傳檔案資訊
    res.json({
      success: true,
      data: {
        filename: filename,
        originalName: req.file.originalname,
        originalSize: req.file.size,
        compressedSize: compressedBuffer.length,
        compressionRatio: ((req.file.size - compressedBuffer.length) / req.file.size * 100).toFixed(1),
        url: `/uploads/events/${filename}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/events/${filename}`
      },
      message: '檔案上傳並壓縮成功'
    });
  } catch (error) {
    console.error('上傳處理錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檔案上傳失敗',
      error: error.message
    });
  }
});

// 上傳多張圖片
router.post('/images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '沒有上傳檔案'
      });
    }

    const processedFiles = [];
    
    for (const file of req.files) {
      try {
        console.log(`處理圖片: ${file.originalname}, 大小: ${file.size} bytes`);
        
        // 壓縮圖片
        const compressedBuffer = await compressImage(file.buffer, file.originalname);
        
        // 儲存壓縮後的圖片
        const filename = await saveCompressedImage(compressedBuffer, file.originalname);
        
        processedFiles.push({
          filename: filename,
          originalName: file.originalname,
          originalSize: file.size,
          compressedSize: compressedBuffer.length,
          compressionRatio: ((file.size - compressedBuffer.length) / file.size * 100).toFixed(1),
          url: `/uploads/events/${filename}`,
          fullUrl: `${req.protocol}://${req.get('host')}/uploads/events/${filename}`
        });
      } catch (error) {
        console.error(`處理檔案 ${file.originalname} 時發生錯誤:`, error);
        // 繼續處理其他檔案
      }
    }

    res.json({
      success: true,
      data: processedFiles,
      message: `成功上傳並壓縮 ${processedFiles.length} 個檔案`
    });
  } catch (error) {
    console.error('批量上傳處理錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檔案上傳失敗',
      error: error.message
    });
  }
});

// 刪除圖片
router.delete('/image/:filename', (req, res) => {
  try {
    const fs = require('fs');
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/events', filename);

    // 檢查檔案是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: '檔案刪除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '檔案不存在'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '檔案刪除失敗',
      error: error.message
    });
  }
});

// 取得所有上傳的圖片列表
router.get('/images', (req, res) => {
  try {
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../uploads/events');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: true,
        data: [],
        message: '沒有上傳的圖片'
      });
    }

    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        url: `/uploads/events/${file}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/events/${file}`
      }));

    res.json({
      success: true,
      data: files,
      message: `找到 ${files.length} 個圖片檔案`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得圖片列表失敗',
      error: error.message
    });
  }
});

module.exports = router;
