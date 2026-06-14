import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken, authMiddleware } from '../middleware/auth';
const router = Router();
// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { account, password } = req.body;
    if (!account || !password) {
      res.status(400).json({ success: false, message: '请输入账号和密码' });
      return;
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: account }, { username: account }],
      },
    });
    if (!user) {
      res.status(401).json({ success: false, message: '账号或密码错误' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: '账号或密码错误' });
      return;
    }
    if (user.status === 'disabled') {
      res.status(403).json({ success: false, message: '账号已被禁用，请联系管理员' });
      return;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const token = generateToken({ userId: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: '登录成功', data: { user: safeUser, token } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { phone, password, nickname, email } = req.body;
    if (!phone || !password) {
      res.status(400).json({ success: false, message: '手机号和密码不能为空' });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      res.status(400).json({ success: false, message: '手机号格式不正确' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: '密码至少6位' });
      return;
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
    });
    if (exists) {
      res.status(409).json({ success: false, message: '该手机号或邮箱已注册' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: nickname || phone,
        nickname: nickname || '',
        phone,
        email: email || '',
        password: hashed,
        role: 'user',
        status: 'active',
      },
    });
    const token = generateToken({ userId: user.id, role: user.role });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: '注册成功', data: { user: safeUser, token } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/auth/password
router.put('/password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: '请输入原密码和新密码' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: '新密码至少6位' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: '原密码错误' });
      return;
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ success: true, message: '密码修改成功' });
  } catch (err) {
    console.error('[password]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
// PUT /api/auth/nickname - 修改昵称
router.put('/nickname', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;
    if (!nickname || !nickname.trim()) {
      res.status(400).json({ success: false, message: '昵称不能为空' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { nickname: nickname.trim() },
    });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: '昵称修改成功', data: safeUser });
  } catch (err) {
    console.error('[nickname]', err);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});
export default router;
