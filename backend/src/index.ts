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
// 统一文件服务对接（附件上传代理到 file.zerosolo.xyz）
const FILE_SERVICE_URL = process.env.FILE_SERVICE_URL || 'https://file.zerosolo.xyz/api/upload';
const FILE_SERVICE_TOKEN = process.env.FILE_SERVICE_TOKEN || 'fs_yun_2026';
// multer 配置（memoryStorage 不落本地磁盘，转发到统一文件服务）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('只允许上传图片文件'));
  },
});
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// 静态文件服务（旧附件仍在 /uploads/yun/，本地开发与历史数据访问保留）
app.use('/uploads', express.static(UPLOAD_ROOT));
// 文件上传接口（代理转发到统一文件服务，返回绝对 URL 数组，前端契约不变）
app.post('/api/upload', upload.array('files', 10), async (req: express.Request, res: express.Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: '未收到文件' });
    return;
  }
  try {
    const form = new FormData();
    for (const f of files) {
      form.append('files', new Blob([new Uint8Array(f.buffer)], { type: f.mimetype }), f.originalname);
    }
    const resp = await fetch(FILE_SERVICE_URL, {
      method: 'POST',
      headers: { 'X-File-Token': FILE_SERVICE_TOKEN },
      body: form,
    });
    const json: any = await resp.json();
    if (!resp.ok || !json.success) {
      res.status(resp.status || 500).json({ success: false, message: json.message || '文件服务上传失败' });
      return;
    }
    const urls: string[] = (json.data || []).map((d: any) => d.url);
    res.json({ success: true, data: urls });
  } catch (e) {
    console.error('[upload] 转发文件服务失败:', (e as Error).message);
    res.status(502).json({ success: false, message: '文件服务不可用' });
  }
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
  console.log(`[FileService] ${FILE_SERVICE_URL}`);
  console.log(`[Routes] /api/auth /api/activities /api/enrollments /api/admin /api/upload`);
});
export default app;
