import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { authMiddleware, generateToken } from '../middleware/auth';
const router = Router();
// POST /api/enrollments - 报名（支持匿名）
router.post('/', async (req: Request, res: Response) => {
  try {
    const { activityId, contactPhone, contactName, adults, children, note, participants } = req.body;
    if (!activityId || !contactPhone) {
      res.status(400).json({ success: false, message: '活动ID和联系手机不能为空' });
      return;
    }
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) {
      res.status(404).json({ success: false, message: '活动不存在' });
      return;
    }
    if (activity.status === '已关闭' || activity.status === '已结束') {
      res.status(400).json({ success: false, message: '活动已关闭，无法报名' });
      return;
    }
    if (activity.enrolled >= activity.capacity) {
      res.status(400).json({ success: false, message: '活动名额已满' });
      return;
    }
    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { phone: contactPhone } });
    let autoCreated = false;
    let autoPassword = '';
    if (!user) {
      const defaultPwd = contactPhone.slice(-6);
      const hashed = await bcrypt.hash(defaultPwd, 10);
      user = await prisma.user.create({
        data: {
          name: contactName || contactPhone,
          nickname: contactName || contactPhone,
          phone: contactPhone,
          password: hashed,
          role: 'user',
          status: 'active',
        },
      });
      autoCreated = true;
      autoPassword = defaultPwd;
    }
    if (user.status === 'disabled') {
      res.status(403).json({ success: false, message: '账号已被禁用' });
      return;
    }
    // 已有用户昵称为空时，用手机号补上
    if (!user.nickname) {
      await prisma.user.update({
        where: { id: user.id },
        data: { nickname: contactName || user.phone },
      });
      user = { ...user, nickname: contactName || user.phone };
    }
    // 检查重复报名
    const existing = await prisma.enrollment.findFirst({
      where: {
        activityId,
        userId: user.id,
        status: { notIn: ['已取消', '已移除'] },
      },
    });
    if (existing) {
      res.status(409).json({ success: false, message: '您已报名此活动' });
      return;
    }
    const amount = activity.price * ((adults || 1) + (children || 0) * 0.5);
    const enrollment = await prisma.enrollment.create({
      data: {
        activityId,
        userId: user.id,
        adults: adults || 1,
        children: children || 0,
        contactName: contactName || '',
        contactPhone,
        note: note || '',
        amount,
        participants: participants || [],
      },
    });
    await prisma.activity.update({
      where: { id: activityId },
      data: { enrolled: { increment: 1 } },
    });
    const token = generateToken({ userId: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      message: '报名成功！',
      data: {
        enrollment,
        user: safeUser,
        token,
        autoCreated,
        password: autoCreated ? autoPassword : undefined,
      },
    });
  } catch (err) {
    console.error('[enroll]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/enrollments/my - 获取我的报名记录
router.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.userId, status: { notIn: ['已移除'] } },
      include: { activity: true },
      orderBy: { enrolledAt: 'desc' },
    });
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error('[my enrollments]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/enrollments/:id - 获取报名详情
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: req.params.id as string },
      include: { activity: true, user: true },
    });
    if (!enrollment) {
      res.status(404).json({ success: false, message: '报名记录不存在' });
      return;
    }
    const enrollmentWithUser = enrollment as any;
    const { password: _, ...safeUser } = enrollmentWithUser.user;
    const { ...safeEnrollment } = { ...enrollment, user: safeUser };
    res.json({ success: true, data: safeEnrollment });
  } catch (err) {
    console.error('[enrollment detail]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/enrollments/:id - 更新报名信息
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: req.params.id as string } });
    if (!enrollment) {
      res.status(404).json({ success: false, message: '报名记录不存在' });
      return;
    }
    if (enrollment.userId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: '无权限修改' });
      return;
    }
    const updated = await prisma.enrollment.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[enrollment update]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
export default router;
