# 良宵云坊 - 亲子游学活动管理（V1.1）

项目代码来源：https://github.com/dajidali9527/Liangxiaogyunfang

## 初始化

使用国内镜像安装依赖：

```bash
npm install --registry=https://registry.npmmirror.com
```

## 运行

启动开发服务器：

```bash
npm run dev -- --host 0.0.0.0
```

默认访问：http://localhost:5173/

## 测试账号

| 角色 | 手机号 | 密码 |
|---|---|---|
| 管理员 | 13800000000 | admin123 |
| 普通用户 | 13811111111 | test123 |

> 匿名报名时自动创建账号，默认密码为手机号后6位

---

## 技术栈

| 类别 | 技术 | 版本 |
|---|---|---|
| 构建工具 | Vite | 6.3.5 |
| 前端框架 | React | 18.3.1 |
| 语言 | TypeScript | - |
| CSS 方案 | Tailwind CSS | 4.1.12 |
| UI 组件库 | Radix UI + shadcn/ui 风格封装 | 多个 1.x/2.x |
| 图标库 | Lucide React | 0.487.0 |
| 图表库 | Recharts | 2.15.2 |
| 动画库 | Motion (原 Framer Motion) | 12.23.24 |
| 日期处理 | date-fns | 3.6.0 |
| 通知 | Sonner | 2.0.3 |
| 路由 | 自定义实现（Context + switch-case） | - |
| 状态管理 | React Context + useState | - |
| 路径别名 | `@` -> `./src` | - |

> 备注：项目安装了 react-router、MUI、react-hook-form 等依赖但实际未使用。项目源自 Figma Make 导出。

---

## 页面路由

项目采用自定义路由方案，通过 AppContext 中的 route 状态 + App.tsx 中的 switch-case 实现页面切换。

```typescript
export type Route =
  | { page: 'home' }
  | { page: 'activity-detail'; id: string }
  | { page: 'login'; redirect?: Route }
  | { page: 'register' }
  | { page: 'my-history' }
  | { page: 'my-activity-detail'; enrollmentId: string }
  | { page: 'admin-dashboard' }
  | { page: 'admin-activities' }
  | { page: 'admin-activity-detail'; activityId: string }
  | { page: 'admin-users' }
  | { page: 'admin-stats' };
```

---

## 页面文件对应关系

| 路由 page 值 | 组件文件 | 说明 |
|---|---|---|
| `home` | HomePage.tsx | 首页，活动列表+搜索+筛选 |
| `activity-detail` | ActivityDetailPage.tsx | 活动详情+报名（需 id 参数） |
| `login` | AuthPage.tsx (mode="login") | 登录页（可选 redirect） |
| `register` | AuthPage.tsx (mode="register") | 注册页 |
| `my-history` | MyHistoryPage.tsx | 我的报名记录 |
| `my-activity-detail` | *(未实现)* | 路由已定义但无对应 case |
| `admin-dashboard` | AdminDashboard.tsx | 管理后台概览（AdminGuard） |
| `admin-activities` | AdminActivitiesPage.tsx | 活动管理（AdminGuard） |
| `admin-activity-detail` | AdminRosterPage.tsx | 报名名单/签到/收费（需 activityId） |
| `admin-users` | AdminUsersPage.tsx | 用户管理（AdminGuard） |
| `admin-stats` | AdminStatsPage.tsx | 统计分析（AdminGuard） |

> AdminGuard：所有 admin 路由经守卫组件，要求 currentUser.role === 'admin'，否则显示"需要管理员权限"。

---

## 组件目录结构

```
src/app/components/
├── pages/                        # 前台页面组件
│   ├── HomePage.tsx              # 首页 - 活动列表+搜索+筛选
│   ├── ActivityDetailPage.tsx    # 活动详情 - 信息展示+报名弹窗
│   ├── AuthPage.tsx              # 登录/注册页（双模式）
│   └── MyHistoryPage.tsx         # 我的报名记录
├── admin/                        # 管理后台组件
│   ├── AdminLayout.tsx           # 后台布局（侧边栏+移动端适配）
│   ├── AdminDashboard.tsx        # 运营概览仪表盘
│   ├── AdminActivitiesPage.tsx   # 活动管理（CRUD+搜索）
│   ├── AdminRosterPage.tsx       # 报名名单（签到管理+收费确认）
│   ├── AdminUsersPage.tsx        # 用户管理（搜索+禁用/恢复）
│   └── AdminStatsPage.tsx        # 统计分析（图表+KPI）
├── shared/                       # 共享组件
│   ├── Header.tsx                # 顶部导航栏
│   └── StatusBadge.tsx           # 状态标签（统一配色）
├── figma/                        # Figma 导出辅助
│   └── ImageWithFallback.tsx     # 图片加载失败兜底
└── ui/                           # shadcn/ui 基础组件库（50+个）
    ├── button.tsx, card.tsx, dialog.tsx, tabs.tsx ...
    └── utils.ts                  # cn() 工具函数
```

---

## API 目录结构

项目没有 API 层。所有数据完全依赖前端 Mock，存储在 `src/app/data/mock.ts` 中，通过 `src/app/context/AppContext.tsx` 的 useState 进行状态管理。

数据操作全部通过 Context 中定义的方法：

| 方法 | 功能 |
|---|---|
| `login()` / `register()` / `logout()` | 用户认证 |
| `enroll()` | 活动报名 |
| `updateCheckIn()` / `updatePayment()` / `updateEnrollment()` | 报名状态管理 |
| `updateActivity()` / `addActivity()` | 活动管理 |
| `updateUser()` | 用户管理 |

---

## 用户登录逻辑

### 登录流程

1. 用户输入手机号 + 密码
2. 前端校验非空
3. 模拟 300ms 延迟
4. 调用 `login(phone, password)`

### 登录核心逻辑（AppContext.login）

1. 在 users 数组中查找 phone + password 匹配的用户
2. 未找到 → 返回"手机号或密码错误"
3. 用户 status === 'disabled' → 返回"账号已被禁用"
4. 成功 → setCurrentUser(user)，跳转到 redirect 路由或首页

### 注册流程

1. 填写：姓名(必填)、昵称(可选)、手机号(必填)、邮箱(可选)、密码(必填)、确认密码(必填)
2. 前端校验：手机号格式 `/^1[3-9]\d{9}$/`、密码≥6位、两次密码一致
3. 调用 register(data) → 检查手机号/邮箱是否已存在 → 创建用户（role: 'user', status: 'active'）→ 自动登录

---

## 活动报名逻辑

### 报名条件判断

| 条件 | 结果 |
|---|---|
| 活动在报名中 且 未报名过 | 显示"立即报名"按钮 |
| 活动已结束/已关闭 | 按钮禁用"活动已结束" |
| 名额已满 | 按钮禁用"名额已满" |
| 报名截止日期已过 | 按钮禁用"报名已截止" |

### 报名操作流程

1. 点击"立即报名" → 未登录则跳转登录页（带 redirect）
2. 已登录 → 打开报名弹窗
3. 填写：联系人姓名、联系手机、成人人数(+-按钮)、儿童人数(+-按钮)、备注
4. 实时计算费用：`price × (adults + children × 0.5)`（儿童半价）
5. 确认报名 → 调用 enroll()

### 报名核心逻辑（AppContext.enroll）

1. 未登录检查
2. 活动存在性 + 状态检查（已关闭/已结束不可报名）
3. 名额检查（enrolled >= capacity）
4. 重复报名检查（排除已取消/已移除）
5. 创建 Enrollment：状态"已报名"、签到"未签到"、付费"未确认"
6. 活动已报名人数 +1

---

## 管理后台逻辑

### AdminLayout（布局组件）
- 桌面端：左侧固定侧边栏
- 移动端：顶部 Header + 汉堡菜单打开侧边栏遮罩
- 侧边栏导航：概览、活动管理、用户管理、统计分析

### AdminDashboard（运营概览）
- 6 个统计卡片：进行中活动数、总报名人数、已签到、已收费确认、待收费确认、注册用户
- 最近活动列表（最多 5 条）
- 待处理事项列表（待收费确认 + 待签到，最多 5 条）

### AdminActivitiesPage（活动管理）
- 搜索：按名称/地点
- 新建活动：弹窗表单（名称、状态、日期、地点、价格、容量、封面图、收款方、标签、介绍）
- 编辑活动：同新建表单，预填数据
- 关闭活动：确认后设为 status: '已关闭'
- 查看报名列表：跳转 AdminRosterPage

### AdminRosterPage（报名名单管理）
- 顶部快速统计：已报名数、已签到数、已收费确认数
- 签到管理 Tab：搜索+筛选签到状态，操作：签到、记录离场、取消签到、管理备注
- 收费确认 Tab：搜索+筛选付费状态，操作：确认收款、减免、标记退款、管理备注

### AdminUsersPage（用户管理）
- 搜索姓名/手机号/邮箱/昵称
- 禁用/恢复用户（toggle + 确认弹窗）
- 展开详情：显示该用户所有活动参与记录

### AdminStatsPage（统计分析）
- 4 个 KPI 卡片：总报名人数、已签到率、收费确认率、已确认金额
- 柱状图：各活动报名/签到/收费确认对比
- 饼图 ×2：签到情况分布、收费状态分布
- 折线图：报名趋势（模拟数据）
- 活跃用户 TOP 5

---

## 数据模型

### Activity（活动）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识，如 act-001 |
| name | string | 活动名称 |
| status | ActivityStatus | 报名中/已满员/已结束/已关闭/草稿 |
| startDate / endDate | string | 活动日期 |
| location | string | 活动地点 |
| price | number | 人均价格（元） |
| capacity | number | 人数上限 |
| enrolled | number | 已报名人数 |
| enrollDeadline | string | 报名截止日期 |
| enrollStartDate | string | 报名开始日期 |
| description | string | 活动介绍（多行文本） |
| imageUrl | string | 封面图 URL |
| payee | string | 收款方 |
| tags | string[] | 标签数组 |
| createdAt | string | 创建日期 |
| isFeatured | boolean | 是否专题活动（V1.1新增） |
| featuredPoster | string | 专题活动海报URL（V1.1新增） |
| featuredDescription | string | 专题活动长图文介绍（V1.1新增） |
| images | string[] | 活动图集URL数组（V1.1新增） |
| videoUrl | string | 视频链接（V1.1新增） |

### AppUser（用户）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识，如 user-001 |
| name | string | 真实姓名 |
| nickname | string | 昵称 |
| phone | string | 手机号（登录凭证） |
| email | string | 邮箱 |
| role | UserRole | user / admin |
| status | UserStatus | active / disabled |
| registeredAt | string | 注册日期 |
| lastLoginAt | string | 最后登录日期 |
| password | string | 密码（明文存储） |

### Enrollment（报名记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 唯一标识，如 enr-001 |
| activityId | string | 关联活动 ID |
| userId | string | 关联用户 ID |
| enrolledAt | string | 报名时间 |
| status | EnrollStatus | 已报名/已取消/已移除/已完成 |
| checkInStatus | CheckInStatus | 未签到/已签到/已离场 |
| paymentStatus | PaymentStatus | 未确认/已确认/已减免/已退款 |
| checkInTime / checkOutTime | string? | 签到/离场时间 |
| amount | number | 费用金额 |
| adults / children | number | 成人/儿童人数 |
| contactName / contactPhone | string | 联系人信息 |
| note | string | 用户备注 |
| adminNote | string | 管理员备注 |
| confirmedBy / confirmedAt | string? | 确认人/确认时间 |

### Mock 数据量

- 5 个活动：2 个报名中、1 个已满员、1 个已结束、1 个草稿
- 6 个用户：1 个管理员、4 个普通用户、1 个已禁用用户
- 12 条报名记录：覆盖不同活动和状态组合

---

## 关键架构特征

1. **纯前端应用**：无后端、无 API、无持久化，刷新即丢失数据
2. **自定义路由**：未使用 react-router，通过 Context + switch-case 实现
3. **全局状态管理**：React Context + useState，无 Redux/Zustand
4. **费用计算**：成人全价 + 儿童半价 `price × (adults + children × 0.5)`
5. **权限控制**：仅 AdminGuard 判断 role === 'admin'，无细粒度权限
6. **安全风险**：密码明文存储、无 Token/Session 机制

---

## V1.1 更新日志

### 新增功能
- 专题活动首页展示：isFeatured + featuredPoster + featuredDescription
- 匿名报名：无需登录即可报名
- 自动创建账号：根据手机号自动注册，默认密码为手机号后6位
- 报名确认页（RegisterConfirmPage）
- 报名详情页（MyActivityDetailPage）
- 管理员手动添加报名
- 管理员移除报名用户（保留历史数据）
- 用户活动轨迹查询（报名次数、签到次数、收费确认次数）
- 活动图集（多图轮播）
- 视频介绍（iframe嵌入/外链跳转）

### 修改文件
- `src/app/data/mock.ts` - Activity 新增 isFeatured/featuredPoster/featuredDescription/images/videoUrl 字段
- `src/app/context/AppContext.tsx` - 新增路由、匿名报名、自动创建账号、manualEnroll、removeEnrollment
- `src/app/App.tsx` - 新增路由注册
- `src/app/components/pages/HomePage.tsx` - 专题活动优先展示
- `src/app/components/pages/ActivityDetailPage.tsx` - 海报轮播+图集+视频+匿名报名
- `src/app/components/pages/MyHistoryPage.tsx` - 增强字段展示
- `src/app/components/admin/AdminActivitiesPage.tsx` - 专题活动设置+图集+视频
- `src/app/components/admin/AdminRosterPage.tsx` - 手动添加+移除用户
- `src/app/components/admin/AdminUsersPage.tsx` - 活动轨迹

### 新增文件
- `src/app/components/pages/RegisterConfirmPage.tsx`
- `src/app/components/pages/MyActivityDetailPage.tsx`
