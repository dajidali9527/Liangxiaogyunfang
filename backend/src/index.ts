import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activity';
import enrollmentRoutes from './routes/enrollment';
import adminRoutes from './routes/admin';
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
app.use(cors());
app.use(express.json({ limit: '50mb' }), (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err) {
    console.error('[JSON解析错误]', err.message);
    res.status(400).json({ success: false, message: '请求数据格式错误' });
    return;
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
  console.error('[服务器错误]', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});
app.listen(PORT, () => {
  console.log(`[两小云房 API] running on port ${PORT}`);
  console.log(`[Routes] /api/auth /api/activities /api/enrollments /api/admin`);
});
export default app;
