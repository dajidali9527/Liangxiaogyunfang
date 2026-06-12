export type ActivityStatus = '报名中' | '已满员' | '已结束' | '已关闭' | '草稿';
export type EnrollStatus = '已报名' | '已取消' | '已移除' | '已完成';
export type CheckInStatus = '未签到' | '已签到' | '已离场';
export type PaymentStatus = '未确认' | '已确认' | '已减免' | '已退款';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'disabled';

export interface ContentBlock {
  type: 'text' | 'image';
  content?: string;
  src?: string;
  caption?: string;
}

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
  description: ContentBlock[];
  imageUrl: string;
  payee: string;
  tags: string[];
  createdAt: string;
  isFeatured: boolean;
  featuredPoster: string;
  featuredDescription: string;
  images: string[];
  videoUrl: string;
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
    name: '用村庄养育孩子：龙潭共育生活营',
    status: '报名中',
    startDate: '2026-07-05',
    endDate: '2026-07-11',
    location: '福建省屏南县龙潭村两小云房民宿',
    price: 380,
    capacity: 30,
    enrolled: 18,
    enrollDeadline: '2026-07-01',
    enrollStartDate: '2026-06-01',
    description: [
      { type: 'text', content: 'Slogan：不是被推着，而是生命开始舒展' },
      { type: 'text', content: '这是一场为期 5 天的沉浸式乡村亲子生活营，落脚于龙潭村的山野与烟火之中，以 "村庄养育" 为核心理念，跳出快节奏的日常，让亲子在自然里松弛、在共创中联结，让生命在慢节奏里自然舒展。' },
      { type: 'text', content: '五日行程概览' },
      { type: 'text', content: 'DAY 1 入营初遇・关系开始流动\n傍晚开启开营仪式，以户外即兴游戏、狮帝卡牌互动、彩虹卡分享快速破冰，通过随机交换夏日礼物拉近距离。随后伴着晚风与音乐开启龙潭长桌宴，炭火、西瓜、欢笑相伴，在轻松的氛围里完成两小云房的初遇，让亲子间、家庭间的关系自然流动。' },
      { type: 'text', content: 'DAY 2 向内感知・重新看见生活\n清晨从山村晨息开启：晨起冥想、静心抄经，在慢节奏里唤醒身心。上午亲子同逛龙潭村，大人围坐品茶，畅聊 "为何重新寻找乡村""为何卷入生活的漩涡"；孩子在规则游戏里释放天性，一同共享地道乡村午餐。\n下午开启「两小云房生命地图」深度共创：大人围圈分享生命轨迹，孩子以写生、绘画感知乡村里的微小事物，在表达与倾听里，重新看见彼此与生活本身。\n夜晚伴着萤火开启龙潭夜聊：孩子体验桌游、探索自然夜色；大人围坐梳理生活关键词，暖光小蜡烛相伴，卸下日常的疲惫。' },
      { type: 'text', content: 'DAY 3 自然滋养・生命力重新成长\n上午亲子徒步前往四坪村，孩子在自然里玩水喂鱼，大人闲坐品茶闲谈，在山野清风里彻底松弛。\n下午开启陶艺与绘画共创，一同制作专属家庭主题杯，在手工创作里沉淀亲子协作的温度，践行 "好好吃饭、好好喝水" 的生活本真。\n夜晚全家协作做饭、烤制披萨，通过亲子雕塑、戏剧、观影等趣味游戏收获满满欢笑；大人也可选择围坐夜聊，在烟火气里感受乡村生活的治愈。' },
      { type: 'text', content: 'DAY 4 共创沉淀・看见生活的美\n上午进行亲子扎染体验，亲手为衣物染上专属色彩，把乡村的自然印记留在织物之上。\n下午全家共同布置「两小云房生活艺术展」，排演结营节目，用画作、花卉、日常物件搭建起 "看见生活的美" 主题展，在共创里沉淀四天的收获与感动。\n夜晚举办结营音乐趴，分享行程中的照片与故事，同步开启龙潭小苑开启仪式，以奖牌、纪念礼物与满满的仪式感，为这段乡村共育时光画上温暖句点。' },
      { type: 'text', content: 'DAY 5 从容告别・带着舒展前行\n上午以 "我是一棵树" 创意合影定格专属回忆，随后留给大家自由活动时间，可闲逛村落、再沐山野清风。带着被村庄滋养的生命力与舒展的状态，从容告别龙潭，回归日常。' },
      { type: 'image', src: '/images/专题活动.png' },
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beautiful%20mountain%20forest%20nature%20camping%20with%20tents%20and%20green%20trees%20summer%20day&image_size=landscape_4_3',
    payee: '两小云房（支付宝/微信均可）',
    tags: ['自然探索', '抄经', '油画', '陶艺', '扎染'],
    createdAt: '2026-05-20',
    isFeatured: true,
    featuredPoster: '/images/Haibao1.jpg',
    featuredDescription: `这个夏天，带孩子走进天目山自然保护区，开启三天两夜的自然探索之旅！

专业自然导师全程带队，深入森林生态讲解，昆虫标本制作、植物拓印、石头彩绘等手工活动精彩纷呈。夜间萤火虫观察，感受山野夜晚的神奇；帐篷露营，亲子共同搭建营地；山泉溪流戏水，感受大自然的纯净。

名额有限，快来报名吧！`,
    images: [
      '/images/Haibao2.jpg',
      '/images/Haibao3.jpg',
      '/images/Haibao4.jpg',
      '/images/专题活动.png',
    ],
    videoUrl: '',
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
    description: [
      { type: 'text', content: '一日科技探索体验活动，让孩子近距离感受前沿科技的魅力。\n\n活动内容：\n• 机器人编程入门（乐高教育套件）\n• 3D打印亲手制作专属小作品\n• VR/AR沉浸式体验区\n• 无人机飞行体验与操控\n• 科技创新交流与作品展示\n\n活动对象：6-14岁儿童及家长\n注意：活动名额已满，可联系我们登记候补' },
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kids%20learning%20robotics%20and%20coding%20with%20colorful%20LEGO%20robots%20in%20a%20modern%20tech%20classroom&image_size=landscape_4_3',
    payee: '两小云房',
    tags: ['科技', '编程', '创新'],
    createdAt: '2026-05-15',
    isFeatured: false,
    featuredPoster: '',
    featuredDescription: '',
    images: [],
    videoUrl: '',
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
    description: [
      { type: 'text', content: '走进龙井村，感受千年茶文化的底蕴。\n\n活动内容：\n• 专业茶师讲解龙井茶的历史与文化\n• 亲手采摘茶叶，体验传统炒茶工艺\n• 规范茶道礼仪学习与实践\n• 品茗与精致点心分享\n• 制作专属茶叶礼盒带回家\n\n活动地点：正宗龙井村茶园及百年茶室\n适合家庭，无年龄限制' },
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20tea%20ceremony%20in%20a%20peaceful%20green%20tea%20garden%20with%20mountains%20in%20background&image_size=landscape_4_3',
    payee: '两小云房',
    tags: ['传统文化', '茶道', '亲子'],
    createdAt: '2026-04-10',
    isFeatured: false,
    featuredPoster: '',
    featuredDescription: '',
    images: [],
    videoUrl: '',
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
    description: [
      { type: 'text', content: '专业艺术导师带领亲子家庭共同创作，发现艺术的无限可能。\n\n活动内容：\n• 水彩画入门技法趣味讲解\n• 亲子共同创作主题水彩画\n• 色彩理论互动游戏\n• 个人作品精美装裱与展示\n\n材料由我们提供，无需自备任何物品\n适合年龄：4岁以上儿童及家长' },
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Parent%20and%20child%20painting%20watercolor%20together%20in%20a%20bright%20art%20studio%20with%20colorful%20paints&image_size=landscape_4_3',
    payee: '两小云房',
    tags: ['艺术', '绘画', '亲子创作'],
    createdAt: '2026-06-01',
    isFeatured: false,
    featuredPoster: '',
    featuredDescription: '',
    images: [],
    videoUrl: '',
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
    description: [
      { type: 'text', content: '秋季农场体验活动，亲子一起感受收获的喜悦（筹备中）。' },
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Happy%20family%20harvesting%20vegetables%20in%20a%20golden%20autumn%20farm%20field%20with%20pumpkins&image_size=landscape_4_3',
    payee: '两小云房',
    tags: ['农耕体验', '秋收', '亲子'],
    createdAt: '2026-06-10',
    isFeatured: false,
    featuredPoster: '',
    featuredDescription: '',
    images: [],
    videoUrl: '',
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
