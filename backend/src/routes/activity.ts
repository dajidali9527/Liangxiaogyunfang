import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
const router = Router();
// GET /api/activities - 公开，获取活动列表
router.get('/', async (_req: Request, res: Response) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: activities });
  } catch (err) {
    console.error('[activities list]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/activities/:id - 公开，获取活动详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { enrollments: true },
    });
    if (!activity) {
      res.status(404).json({ success: false, message: '活动不存在' });
      return;
    }
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('[activity detail]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// POST /api/activities - 管理员，创建活动
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const activity = await prisma.activity.create({ data: req.body });
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('[activity create]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/activities/:id - 管理员，更新活动
router.put('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('[activity update]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
export default router;
