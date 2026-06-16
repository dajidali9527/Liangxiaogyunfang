import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import cors from 'cors';
import multer from 'multer';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activity';
import enrollmentRoutes from './routes/enrollment';
import adminRoutes from './routes/admin';
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.resolve(__dirname, '../../../23zeroSoloDeploy/uploads');
const UPLOAD_YUN = path.join(UPLOAD_ROOT, 'yun');
// multer 配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const fs = require('fs');
    if (!fs.existsSync(UPLOAD_YUN)) fs.mkdirSync(UPLOAD_YUN, { recursive: true });
    cb(null, UPLOAD_YUN);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    cb(null, `${Date.now()}_${name}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只允许上传图片文件'));
  },
});
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));
// 静态文件服务（本地开发时 Vite 代理 /uploads 到此处）
app.use('/uploads', express.static(UPLOAD_ROOT));
// 文件上传接口
app.post('/api/upload', upload.array('files', 10), (req: express.Request, res: express.Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: '未收到文件' });
    return;
  }
  const urls = files.map(f => `/uploads/yun/${f.filename}`);
  res.json({ success: true, data: urls });
});
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[服务器错误]', err.message || err);
  if (err.type === 'entity.too.large') {
    res.status(413).json({ success: false, message: '请求数据过大' });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ success: false, message: '请求数据格式错误' });
    return;
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ success: false, message: '文件大小超过10MB限制' });
    return;
  }
  res.status(500).json({ success: false, message: '服务器内部错误' });
});
app.listen(PORT, () => {
  console.log(`[两小云房 API] running on port ${PORT}`);
  console.log(`[Upload] 目录: ${UPLOAD_YUN}`);
  console.log(`[Routes] /api/auth /api/activities /api/enrollments /api/admin /api/upload`);
});
export default app;
