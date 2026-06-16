import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
const router = Router();
// 所有管理员路由都需要认证+管理员权限
router.use(authMiddleware, adminMiddleware);
// GET /api/admin/dashboard - 运营概览
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const [activeActivities, totalEnrollments, checkedIn, paidConfirmed, pendingPayment, totalUsers] = await Promise.all([
      prisma.activity.count({ where: { status: '报名中' } }),
      prisma.enrollment.count({ where: { status: { notIn: ['已取消', '已移除'] } } }),
      prisma.enrollment.count({ where: { checkInStatus: '已签到' } }),
      prisma.enrollment.count({ where: { paymentStatus: '已确认' } }),
      prisma.enrollment.count({ where: { paymentStatus: '未确认', status: { notIn: ['已取消', '已移除'] } } }),
      prisma.user.count({ where: { role: 'user' } }),
    ]);
    const recentActivities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    const pendingItemsRaw = await prisma.enrollment.findMany({
      where: {
        OR: [
          { paymentStatus: '未确认', status: { notIn: ['已取消', '已移除'] } },
          { checkInStatus: '未签到', status: { notIn: ['已取消', '已移除'] } },
        ],
      },
      include: { activity: true, user: true },
      take: 5,
      orderBy: { enrolledAt: 'desc' },
    });
    const pendingItems = pendingItemsRaw.map(e => {
      const { password: _, ...safeUser } = e.user;
      const { enrollments: _enrollments, ...safeActivity } = e.activity as any;
      return { ...e, user: safeUser, activity: safeActivity };
    });
    res.json({
      success: true,
      data: {
        stats: { activeActivities, totalEnrollments, checkedIn, paidConfirmed, pendingPayment, totalUsers },
        recentActivities,
        pendingItems,
      },
    });
  } catch (err) {
    console.error('[dashboard]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/admin/users - 用户列表
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where = search
      ? { OR: [{ name: { contains: String(search) } }, { phone: { contains: String(search) } }, { email: { contains: String(search) } }, { nickname: { contains: String(search) } }] }
      : {};
    const users = await prisma.user.findMany({ where, orderBy: { registeredAt: 'desc' } });
    const usersWithCount = await Promise.all(users.map(async (u) => {
      const { password: _, ...safeUser } = u;
      const enrollmentCount = await prisma.enrollment.count({
        where: { userId: u.id, status: { notIn: ['已取消', '已移除'] } },
      });
      return { ...safeUser, enrollmentCount };
    }));
    res.json({ success: true, data: usersWithCount });
  } catch (err) {
    console.error('[admin users]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/admin/users/:id - 更新用户
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    console.error('[admin user update]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// POST /api/admin/users/:id/reset-password - 重置密码
router.post('/users/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    const defaultPwd = user.phone.slice(-6);
    const hashed = await bcrypt.hash(defaultPwd, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ success: true, message: '密码已重置为手机号后6位' });
  } catch (err) {
    console.error('[reset password]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// DELETE /api/admin/users/:id - 删除用户（无报名记录才可删除）
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    if (user.role === 'admin') {
      res.status(400).json({ success: false, message: '不能删除管理员' });
      return;
    }
    const enrollmentCount = await prisma.enrollment.count({
      where: { userId: req.params.id as string },
    });
    if (enrollmentCount > 0) {
      res.status(400).json({ success: false, message: '该用户有报名记录，无法删除' });
      return;
    }
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: '用户已删除' });
  } catch (err) {
    console.error('[delete user]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/admin/enrollments - 获取某活动的报名列表（或某用户的报名记录）
router.get('/enrollments', async (req: Request, res: Response) => {
  try {
    const { activityId, userId } = req.query;
    if (!activityId && !userId) {
      res.status(400).json({ success: false, message: '缺少activityId或userId' });
      return;
    }
    const where: any = {};
    if (activityId) where.activityId = String(activityId);
    if (userId) where.userId = String(userId);
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: { user: true, activity: true },
      orderBy: { enrolledAt: 'desc' },
    });
    const safeData = enrollments.map(e => {
      const { password: _, ...safeUser } = e.user;
      const { enrollments: _enrollments, ...safeActivity } = e.activity as any;
      return { ...e, user: safeUser, activity: safeActivity };
    });
    res.json({ success: true, data: safeData });
  } catch (err) {
    console.error('[admin enrollments]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// POST /api/admin/enrollments/manual - 后台报名
router.post('/enrollments/manual', async (req: Request, res: Response) => {
  try {
    const { activityId, contactPhone, contactName, adults, children, amount, note, participants } = req.body;
    if (!activityId || !contactPhone) {
      res.status(400).json({ success: false, message: '活动ID和联系手机不能为空' });
      return;
    }
    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { phone: contactPhone } });
    if (!user) {
      const defaultPwd = contactPhone.slice(-6);
      const hashed = await bcrypt.hash(defaultPwd, 10);
      user = await prisma.user.create({
        data: {
          name: contactName || contactPhone,
          nickname: contactName || '',
          phone: contactPhone,
          password: hashed,
          role: 'user',
          status: 'active',
        },
      });
    }
    // 检查重复
    const existing = await prisma.enrollment.findFirst({
      where: { activityId, userId: user.id, status: { notIn: ['已取消', '已移除'] } },
    });
    if (existing) {
      res.status(409).json({ success: false, message: '该用户已报名此活动' });
      return;
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        activityId,
        userId: user.id,
        adults: adults || 1,
        children: children || 0,
        contactName: contactName || '',
        contactPhone,
        amount: amount || 0,
        note: note || '',
        adminNote: '管理员后台报名',
        participants: participants || [],
      },
    });
    await prisma.activity.update({
      where: { id: activityId },
      data: { enrolled: { increment: 1 } },
    });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('[manual enroll]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/admin/enrollments/:id/checkin - 签到管理
router.put('/enrollments/:id/checkin', async (req: Request, res: Response) => {
  try {
    const { checkInStatus, checkInTime, checkOutTime } = req.body;
    const updateData: any = { checkInStatus };
    if (checkInStatus === '已签到') updateData.checkInTime = checkInTime || new Date().toLocaleString('zh-CN');
    if (checkInStatus === '已离场') updateData.checkOutTime = checkOutTime || new Date().toLocaleString('zh-CN');
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.id as string },
      data: updateData,
    });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('[checkin]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/admin/enrollments/:id/payment - 收费管理
router.put('/enrollments/:id/payment', async (req: Request, res: Response) => {
  try {
    const { paymentStatus, adminNote } = req.body;
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.id as string },
      data: {
        paymentStatus,
        adminNote: adminNote !== undefined ? adminNote : undefined,
        confirmedBy: req.user!.userId,
        confirmedAt: new Date().toLocaleString('zh-CN'),
      },
    });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('[payment]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/admin/enrollments/:id/remove - 移除报名
router.put('/enrollments/:id/remove', async (req: Request, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.update({
      where: { id: req.params.id as string },
      data: { status: '已移除' },
    });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    console.error('[remove enrollment]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/admin/stats - 统计分析
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalEnrollments, checkedIn, paidConfirmed, totalAmount] = await Promise.all([
      prisma.enrollment.count({ where: { status: { notIn: ['已取消', '已移除'] } } }),
      prisma.enrollment.count({ where: { checkInStatus: { in: ['已签到', '已离场'] } } }),
      prisma.enrollment.count({ where: { paymentStatus: '已确认' } }),
      prisma.enrollment.aggregate({ where: { paymentStatus: '已确认' }, _sum: { amount: true } }),
    ]);
    const checkInRate = totalEnrollments > 0 ? (checkedIn / totalEnrollments * 100).toFixed(1) : '0';
    const paymentRate = totalEnrollments > 0 ? (paidConfirmed / totalEnrollments * 100).toFixed(1) : '0';
    // 各活动统计
    const activitiesRaw = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const activities = await Promise.all(activitiesRaw.map(async (a) => {
      const [enrolled, checkedIn, paidConfirmed] = await Promise.all([
        prisma.enrollment.count({ where: { activityId: a.id, status: { notIn: ['已取消', '已移除'] } } }),
        prisma.enrollment.count({ where: { activityId: a.id, checkInStatus: { in: ['已签到', '已离场'] } } }),
        prisma.enrollment.count({ where: { activityId: a.id, paymentStatus: { in: ['已确认', '已减免'] } } }),
      ]);
      return { ...a, enrolled, checkedIn, paidConfirmed };
    }));
    // 签到分布
    const checkInDist = await prisma.enrollment.groupBy({ by: ['checkInStatus'], where: { status: { notIn: ['已取消', '已移除'] } }, _count: true });
    // 收费分布
    const paymentDist = await prisma.enrollment.groupBy({ by: ['paymentStatus'], where: { status: { notIn: ['已取消', '已移除'] } }, _count: true });
    // 活跃用户 TOP5
    const topUsers = await prisma.enrollment.groupBy({
      by: ['userId'],
      where: { status: { notIn: ['已取消', '已移除'] } },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 5,
    });
    const topUsersWithInfo = await Promise.all(
      topUsers.map(async (t) => {
        const user = await prisma.user.findUnique({ where: { id: t.userId } });
        return { ...t, user: user ? { name: user.name, nickname: user.nickname, phone: user.phone } : null };
      })
    );
    res.json({
      success: true,
      data: {
        kpi: { totalEnrollments, checkInRate, paymentRate, confirmedAmount: totalAmount._sum.amount || 0 },
        activities,
        checkInDist,
        paymentDist,
        topUsers: topUsersWithInfo,
      },
    });
  } catch (err) {
    console.error('[stats]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
export default router;
