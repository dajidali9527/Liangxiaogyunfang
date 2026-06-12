export type ActivityStatus = '报名中' | '已满员' | '已结束' | '已关闭' | '草稿';
export type EnrollStatus = '已报名' | '已取消' | '已移除' | '已完成';
export type CheckInStatus = '未签到' | '已签到' | '已离场';
export type PaymentStatus = '未确认' | '已确认' | '已减免' | '已退款';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled';

export interface Activity {
  id: string;
  name: string;
  status: ActivityStatus;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  capacity: number;
  enrolled: number;
  enrollDeadline: string;
  enrollStartDate: string;
  description: string;
  imageUrl: string;
  payee: string;
  tags: string[];
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  lastLoginAt: string;
  password: string;
}

export interface Enrollment {
  id: string;
  activityId: string;
  userId: string;
  enrolledAt: string;
  status: EnrollStatus;
  checkInStatus: CheckInStatus;
  paymentStatus: PaymentStatus;
  checkInTime?: string;
  checkOutTime?: string;
  amount: number;
  adults: number;
  children: number;
  contactName: string;
  contactPhone: string;
  note: string;
  adminNote: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'act-001',
    name: '云房自然探索营 · 山野篇',
    status: '报名中',
    startDate: '2026-07-05',
    endDate: '2026-07-07',
    location: '杭州市余杭区天目山自然保护区',
    price: 380,
    capacity: 30,
    enrolled: 18,
    enrollDeadline: '2026-06-25',
    enrollStartDate: '2026-06-01',
    description: `本次活动带领亲子家庭走进天目山自然保护区，开展为期三天的自然探索之旅。

活动亮点：
• 专业自然导师带队，深入森林生态讲解
• 昆虫标本制作、植物拓印、石头彩绘等手工活动
• 夜间萤火虫观察，感受山野夜晚的神奇
• 帐篷露营，亲子共同搭建营地
• 山泉溪流戏水，感受大自然的纯净

活动费用包含：餐食（6正餐2早餐）、住宿（帐篷）、保险、导师费、物料费

适合年龄：5-12岁儿童（须有家长陪同）`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231-7444f18907db?w=800&h=500&fit=crop&auto=format',
    payee: '两小云房（支付宝/微信均可）',
    tags: ['自然探索', '户外露营', '亲子'],
    createdAt: '2026-05-20',
  },
  {
    id: 'act-002',
    name: '亲子科技探索日',
    status: '已满员',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    location: '杭州未来科技城 · 科技体验馆',
    price: 260,
    capacity: 25,
    enrolled: 25,
    enrollDeadline: '2026-06-15',
    enrollStartDate: '2026-05-25',
    description: `一日科技探索体验活动，让孩子近距离感受前沿科技的魅力。

活动内容：
• 机器人编程入门（乐高教育套件）
• 3D打印亲手制作专属小作品
• VR/AR沉浸式体验区
• 无人机飞行体验与操控
• 科技创新交流与作品展示

活动对象：6-14岁儿童及家长
注意：活动名额已满，可联系我们登记候补`,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop&auto=format',
    payee: '两小云房',
    tags: ['科技', '编程', '创新'],
    createdAt: '2026-05-15',
  },
  {
    id: 'act-003',
    name: '传统文化游学 · 茶道篇',
    status: '已结束',
    startDate: '2026-05-10',
    endDate: '2026-05-10',
    location: '杭州西湖区龙井村',
    price: 320,
    capacity: 20,
    enrolled: 20,
    enrollDeadline: '2026-05-05',
    enrollStartDate: '2026-04-20',
    description: `走进龙井村，感受千年茶文化的底蕴。

活动内容：
• 专业茶师讲解龙井茶的历史与文化
• 亲手采摘茶叶，体验传统炒茶工艺
• 规范茶道礼仪学习与实践
• 品茗与精致点心分享
• 制作专属茶叶礼盒带回家

活动地点：正宗龙井村茶园及百年茶室
适合家庭，无年龄限制`,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47028f64f4?w=800&h=500&fit=crop&auto=format',
    payee: '两小云房',
    tags: ['传统文化', '茶道', '亲子'],
    createdAt: '2026-04-10',
  },
  {
    id: 'act-004',
    name: '亲子绘画创作工坊',
    status: '报名中',
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    location: '杭州滨江区文化艺术中心',
    price: 180,
    capacity: 15,
    enrolled: 6,
    enrollDeadline: '2026-07-10',
    enrollStartDate: '2026-06-15',
    description: `专业艺术导师带领亲子家庭共同创作，发现艺术的无限可能。

活动内容：
• 水彩画入门技法趣味讲解
• 亲子共同创作主题水彩画
• 色彩理论互动游戏
• 个人作品精美装裱与展示

材料由我们提供，无需自备任何物品
适合年龄：4岁以上儿童及家长`,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop&auto=format',
    payee: '两小云房',
    tags: ['艺术', '绘画', '亲子创作'],
    createdAt: '2026-06-01',
  },
  {
    id: 'act-005',
    name: '亲子农场体验 · 秋收篇',
    status: '草稿',
    startDate: '2026-10-05',
    endDate: '2026-10-05',
    location: '杭州临安区生态农场',
    price: 220,
    capacity: 25,
    enrolled: 0,
    enrollDeadline: '2026-09-28',
    enrollStartDate: '2026-09-01',
    description: '秋季农场体验活动，亲子一起感受收获的喜悦（筹备中）。',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&h=500&fit=crop&auto=format',
    payee: '两小云房',
    tags: ['农耕体验', '秋收', '亲子'],
    createdAt: '2026-06-10',
  },
];

export const USERS: AppUser[] = [
  {
    id: 'user-admin',
    name: '云房管理员',
    nickname: '管理员',
    phone: '13800000000',
    email: 'admin@yunfang.com',
    role: 'admin',
    status: 'active',
    registeredAt: '2025-01-01',
    lastLoginAt: '2026-06-12',
    password: 'admin123',
  },
  {
    id: 'user-001',
    name: '李小明',
    nickname: '小明爸爸',
    phone: '13811111111',
    email: 'lixm@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2026-03-15',
    lastLoginAt: '2026-06-10',
    password: 'test123',
  },
  {
    id: 'user-002',
    name: '王大华',
    nickname: '大华妈妈',
    phone: '13822222222',
    email: 'wangdh@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2026-02-20',
    lastLoginAt: '2026-06-08',
    password: 'test123',
  },
  {
    id: 'user-003',
    name: '张晓敏',
    nickname: '晓敏',
    phone: '13833333333',
    email: 'zhangxm@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2026-04-05',
    lastLoginAt: '2026-06-05',
    password: 'test123',
  },
  {
    id: 'user-004',
    name: '陈志远',
    nickname: '志远爸爸',
    phone: '13844444444',
    email: 'chenzhy@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2026-05-10',
    lastLoginAt: '2026-06-01',
    password: 'test123',
  },
  {
    id: 'user-005',
    name: '刘雯雯',
    nickname: '雯雯妈',
    phone: '13855555555',
    email: 'liuww@example.com',
    role: 'user',
    status: 'disabled',
    registeredAt: '2026-03-22',
    lastLoginAt: '2026-05-15',
    password: 'test123',
  },
];

export const ENROLLMENTS: Enrollment[] = [
  // act-003 茶道篇 (已结束)
  {
    id: 'enr-001',
    activityId: 'act-003',
    userId: 'user-001',
    enrolledAt: '2026-04-22 14:20',
    status: '已完成',
    checkInStatus: '已离场',
    paymentStatus: '已确认',
    checkInTime: '2026-05-10 09:15',
    checkOutTime: '2026-05-10 16:30',
    amount: 320,
    adults: 1,
    children: 1,
    contactName: '李小明',
    contactPhone: '13811111111',
    note: '孩子对茶文化很感兴趣',
    adminNote: '参与积极，表现很好',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-05-10 10:00',
  },
  {
    id: 'enr-002',
    activityId: 'act-003',
    userId: 'user-002',
    enrolledAt: '2026-04-25 10:05',
    status: '已完成',
    checkInStatus: '已离场',
    paymentStatus: '已确认',
    checkInTime: '2026-05-10 09:30',
    checkOutTime: '2026-05-10 16:15',
    amount: 640,
    adults: 2,
    children: 0,
    contactName: '王大华',
    contactPhone: '13822222222',
    note: '',
    adminNote: '',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-05-10 09:45',
  },
  {
    id: 'enr-003',
    activityId: 'act-003',
    userId: 'user-003',
    enrolledAt: '2026-04-28 16:40',
    status: '已完成',
    checkInStatus: '已离场',
    paymentStatus: '已减免',
    checkInTime: '2026-05-10 09:00',
    checkOutTime: '2026-05-10 16:00',
    amount: 0,
    adults: 1,
    children: 1,
    contactName: '张晓敏',
    contactPhone: '13833333333',
    note: '申请老学员优惠',
    adminNote: '老学员减免全额',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-05-10 09:00',
  },
  // act-002 科技探索日 (已满员)
  {
    id: 'enr-004',
    activityId: 'act-002',
    userId: 'user-001',
    enrolledAt: '2026-05-26 11:00',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 260,
    adults: 1,
    children: 1,
    contactName: '李小明',
    contactPhone: '13811111111',
    note: '孩子很期待VR体验',
    adminNote: '',
  },
  {
    id: 'enr-005',
    activityId: 'act-002',
    userId: 'user-002',
    enrolledAt: '2026-05-27 09:30',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '已确认',
    amount: 260,
    adults: 1,
    children: 1,
    contactName: '王大华',
    contactPhone: '13822222222',
    note: '',
    adminNote: '',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-05-28 10:00',
  },
  {
    id: 'enr-006',
    activityId: 'act-002',
    userId: 'user-003',
    enrolledAt: '2026-05-28 14:20',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 520,
    adults: 1,
    children: 2,
    contactName: '张晓敏',
    contactPhone: '13833333333',
    note: '带两个小朋友参加',
    adminNote: '',
  },
  {
    id: 'enr-007',
    activityId: 'act-002',
    userId: 'user-004',
    enrolledAt: '2026-05-30 16:00',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '已确认',
    amount: 520,
    adults: 2,
    children: 2,
    contactName: '陈志远',
    contactPhone: '13844444444',
    note: '两个家庭一起参加',
    adminNote: '',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-06-01 09:00',
  },
  // act-001 自然探索营 (报名中)
  {
    id: 'enr-008',
    activityId: 'act-001',
    userId: 'user-001',
    enrolledAt: '2026-06-05 10:30',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 760,
    adults: 2,
    children: 1,
    contactName: '李小明',
    contactPhone: '13811111111',
    note: '希望安排靠近水边的营地',
    adminNote: '',
  },
  {
    id: 'enr-009',
    activityId: 'act-001',
    userId: 'user-002',
    enrolledAt: '2026-06-06 14:00',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '已确认',
    amount: 380,
    adults: 1,
    children: 1,
    contactName: '王大华',
    contactPhone: '13822222222',
    note: '',
    adminNote: '',
    confirmedBy: '云房管理员',
    confirmedAt: '2026-06-07 09:00',
  },
  {
    id: 'enr-010',
    activityId: 'act-001',
    userId: 'user-003',
    enrolledAt: '2026-06-08 09:00',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 380,
    adults: 1,
    children: 1,
    contactName: '张晓敏',
    contactPhone: '13833333333',
    note: '',
    adminNote: '',
  },
  // act-004 绘画工坊 (报名中)
  {
    id: 'enr-011',
    activityId: 'act-004',
    userId: 'user-003',
    enrolledAt: '2026-06-10 11:00',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 360,
    adults: 1,
    children: 1,
    contactName: '张晓敏',
    contactPhone: '13833333333',
    note: '孩子喜欢水彩画',
    adminNote: '',
  },
  {
    id: 'enr-012',
    activityId: 'act-004',
    userId: 'user-004',
    enrolledAt: '2026-06-11 15:30',
    status: '已报名',
    checkInStatus: '未签到',
    paymentStatus: '未确认',
    amount: 180,
    adults: 1,
    children: 1,
    contactName: '陈志远',
    contactPhone: '13844444444',
    note: '',
    adminNote: '',
  },
];
