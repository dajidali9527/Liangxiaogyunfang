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
      where: { id: req.params.id as string },
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
    const body = req.body;
    const data = {
      name: body.name,
      status: body.status || '草稿',
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      location: body.location || '',
      price: Number(body.price) || 0,
      capacity: Number(body.capacity) || 0,
      enrolled: Number(body.enrolled) || 0,
      enrollDeadline: body.enrollDeadline || '',
      enrollStartDate: body.enrollStartDate || '',
      description: body.description || [],
      imageUrl: body.imageUrl || '',
      payee: body.payee || '',
      tags: body.tags || [],
      isFeatured: body.isFeatured || false,
      featuredPoster: body.featuredPoster || '',
      featuredDescription: body.featuredDescription || '',
      featuredPosters: body.featuredPosters || [],
      images: body.images || [],
      videoUrl: body.videoUrl || '',
    };
    const activity = await prisma.activity.create({ data });
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('[activity create]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/activities/:id - 管理员，更新活动
router.put('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const allowedFields = [
      'name', 'status', 'startDate', 'endDate', 'location', 'price', 'capacity',
      'enrolled', 'enrollDeadline', 'enrollStartDate', 'description', 'imageUrl',
      'payee', 'tags', 'isFeatured', 'featuredPoster', 'featuredDescription',
      'featuredPosters', 'images', 'videoUrl',
    ];
    const data: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    if (data.price !== undefined) data.price = Number(data.price) || 0;
    if (data.capacity !== undefined) data.capacity = Number(data.capacity) || 0;
    if (data.enrolled !== undefined) data.enrolled = Number(data.enrolled) || 0;
    const activity = await prisma.activity.update({
      where: { id: req.params.id as string },
      data,
    });
    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('[activity update]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// DELETE /api/activities/:id - 管理员，删除草稿状态的活动
router.delete('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id as string },
    });
    if (!activity) {
      res.status(404).json({ success: false, message: '活动不存在' });
      return;
    }
    if (activity.status !== '草稿') {
      res.status(400).json({ success: false, message: '只能删除草稿状态的活动' });
      return;
    }
    await prisma.enrollment.deleteMany({ where: { activityId: req.params.id as string } });
    await prisma.activity.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: '活动已删除' });
  } catch (err) {
    console.error('[activity delete]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
export default router;
