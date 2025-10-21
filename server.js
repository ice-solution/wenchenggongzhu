const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// 引入路由
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const userRoutes = require('./routes/userRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// 連接資料庫
connectDB();

// 中介軟體
app.use(cors());

// Stripe Webhook 路由 (必須在 JSON 解析中介軟體之前)
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 服務 HTML 檔案
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/image-manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'image-manager.html'));
});

app.get('/test-images', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-images.html'));
});

app.get('/test-navigation', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-navigation.html'));
});

app.get('/test-portrait-images', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-portrait-images.html'));
});

app.get('/test-layout', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-layout.html'));
});

app.get('/test-spacing', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-spacing.html'));
});

app.get('/test-final-design', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-final-design.html'));
});

app.get('/test-event-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-event-details.html'));
});

app.get('/debug-event-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-event-details.html'));
});

app.get('/purchase-manager', (req, res) => {
  res.sendFile(path.join(__dirname, 'purchase-manager.html'));
});

app.get('/test-purchase-flow', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-purchase-flow.html'));
});

app.get('/test-purchase-fix', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-purchase-fix.html'));
});

app.get('/test-purchase-poster', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-purchase-poster.html'));
});

app.get('/test-vertical-poster', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-vertical-poster.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-dashboard.html'));
});

app.get('/user-register', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-register.html'));
});

app.get('/test-user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-user-dashboard.html'));
});

app.get('/test-footer-links', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-footer-links.html'));
});

app.get('/status/:uniqueId', (req, res) => {
  res.sendFile(path.join(__dirname, 'status.html'));
});

app.get('/test-complete-system', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-complete-system.html'));
});

app.get('/test-purchase-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-purchase-success.html'));
});

app.get('/debug-purchase', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-purchase.html'));
});

app.get('/test-success-fail-pages', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-success-fail-pages.html'));
});

app.get('/test-status-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-status-page.html'));
});

app.get('/test-print-layout', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-print-layout.html'));
});

app.get('/test-frontend-status', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-frontend-status.html'));
});

// API 路由
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stripe', stripeRoutes);

// 服務前端靜態檔案
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// 錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
});
