# 两小云房 - 亲子游学活动管理系统（V2.0）

项目代码来源：https://github.com/dajidali9527/Liangxiaogyunfang

## 快速开始

### 前端

```bash
# 安装依赖（国内镜像）
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器（支持局域网访问）
npm run dev
```

- 本机访问：http://localhost:5173/
- 局域网访问：http://你的IP:5173/

### 后端

```bash
cd backend

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 生成 Prisma Client
npm run db:generate

# 推送数据库结构（首次）
npm run db:push

# 导入种子数据（首次）
npm run db:seed

# 启动开发服务器
npm run dev
```

- 后端 API：http://localhost:3001/api/
- 健康检查：http://localhost:3001/api/health

### 管理员账号

| 登录方式 | 账号 | 密码 |
|---|---|---|
| 用户名登录 | liangxiaoyunfang | admin123 |
| 手机号登录 | 13800000000 | admin123 |

> 注册按钮已隐藏，用户通过报名自动创建账号并登录，默认密码为手机号后6位，可登录后自行修改

---

## 1. 技术栈

### 前端

| 类别 | 技术 | 版本 | 说明 |
|---|---|---|---|
| **构建工具** | Vite | 6.3.5 | 开发服务器 + 生产构建 + proxy 代理 |
| **前端框架** | React | 18.3.1 | 函数组件 + Hooks |
| **语言** | TypeScript | - | 类型安全 |
| **CSS 方案** | Tailwind CSS | 4.1.12 | 原子化 CSS |
| **UI 组件库** | Radix UI + shadcn/ui | 多个 1.x/2.x | 无障碍 UI 原语 + 封装组件 |
| **图标库** | Lucide React | 0.487.0 | SVG 图标 |
| **图表库** | Recharts | 2.15.2 | 管理后台统计图表 |
| **Excel 导出** | xlsx | 0.18.5 | 报名列表导出 |
| **动画库** | Motion | 12.23.24 | 交互动画 |
| **日期处理** | date-fns | 3.6.0 | 日期格式化 |
| **通知** | Sonner | 2.0.3 | Toast 提示 |
| **路由** | 自定义实现 | - | Context + switch-case |
| **状态管理** | React Context + useState | - | 全局状态 + API 调用 |

### 后端

| 类别 | 技术 | 版本 | 说明 |
|---|---|---|---|
| **运行时** | Node.js | 20+ | 后端运行环境 |
| **框架** | Express | 4.21+ | RESTful API |
| **ORM** | Prisma | 6.0+ | 数据库 ORM |
| **数据库** | PostgreSQL | 16 | yun_schema 专用模式 |
| **认证** | JWT + bcryptjs | - | Token 认证 + 密码加密 |
| **文件上传** | Multer | 2.1+ | 图片上传到 /uploads/yun/，Nginx 直接服务 |
| **开发工具** | tsx | 4.0+ | TypeScript 执行 + 热重载 |

---

## 2. 项目结构

```
22LiangXiaoYunFang/
├── src/app/                          # 前端源码
│   ├── api/                          # API 调用层
│   │   ├── client.ts                 # HTTP 客户端（fetch + token 管理）
│   │   ├── auth.api.ts               # 认证 API
│   │   ├── activity.api.ts           # 活动 API
│   │   ├── enrollment.api.ts         # 报名 API
│   │   ├── admin.api.ts              # 管理后台 API
│   │   └── index.ts                  # 统一导出
│   ├── context/
│   │   └── AppContext.tsx            # 全局状态 + API 调用
│   ├── data/
│   │   └── mock.ts                   # 类型定义 + Mock 数据（仅类型使用）
│   ├── components/
│   │   ├── pages/                    # 前台页面
│   │   ├── admin/                    # 管理后台
│   │   ├── shared/                   # 共享组件
│   │   └── ui/                       # shadcn/ui 组件库
│   └── App.tsx                       # 根组件
├── backend/                          # 后端源码
│   ├── src/
│   │   ├── index.ts                  # Express 入口
│   │   ├── config/
│   │   │   └── database.ts           # Prisma 客户端
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT 认证中间件
│   │   └── routes/
│   │       ├── auth.ts               # 认证路由
│   │       ├── activity.ts           # 活动路由
│   │       ├── enrollment.ts         # 报名路由
│   │       └── admin.ts              # 管理后台路由
│   ├── prisma/
│   │   ├── schema.prisma             # 数据模型
│   │   └── seed.ts                   # 种子数据
│   ├── .env                          # 环境变量
│   ├── Dockerfile                    # Docker 构建
│   ├── package.json
│   └── tsconfig.json
└── vite.config.ts                    # Vite 配置（含 proxy）
```

---

## 3. API 端点

### 认证 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/api/auth/login` | 登录（手机号/用户名 + 密码） | 无 |
| POST | `/api/auth/register` | 注册 | 无 |
| GET | `/api/auth/me` | 获取当前用户 | JWT |
| PUT | `/api/auth/password` | 修改密码 | JWT |

### 活动 `/api/activities`

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| GET | `/api/activities` | 活动列表 | 无 |
| GET | `/api/activities/:id` | 活动详情 | 无 |
| POST | `/api/activities` | 创建活动 | Admin |
| PUT | `/api/activities/:id` | 更新活动 | Admin |
| DELETE | `/api/activities/:id` | 删除草稿活动 | Admin |

### 报名 `/api/enrollments`

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| POST | `/api/enrollments` | 报名（匿名，自动创建账号） | 无 |
| GET | `/api/enrollments/my` | 我的报名记录 | JWT |
| GET | `/api/enrollments/:id` | 报名详情 | JWT |
| PUT | `/api/enrollments/:id` | 更新报名 | JWT |

### 管理后台 `/api/admin`

| 方法 | 路径 | 说明 | 认证 |
|---|---|---|---|
| GET | `/api/admin/dashboard` | 运营概览 | Admin |
| GET | `/api/admin/users` | 用户列表 | Admin |
| PUT | `/api/admin/users/:id` | 更新用户 | Admin |
| POST | `/api/admin/users/:id/reset-password` | 重置密码 | Admin |
| GET | `/api/admin/enrollments?activityId=` | 报名列表 | Admin |
| POST | `/api/admin/enrollments/manual` | 后台报名 | Admin |
| PUT | `/api/admin/enrollments/:id/checkin` | 签到管理 | Admin |
| PUT | `/api/admin/enrollments/:id/payment` | 收费管理 | Admin |
| PUT | `/api/admin/enrollments/:id/remove` | 移除报名 | Admin |
| GET | `/api/admin/stats` | 统计分析 | Admin |

---

## 4. 数据模型（Prisma Schema）

### User（用户）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id @default(cuid()) | 唯一标识 |
| name | String | 姓名 |
| nickname | String | 昵称 |
| phone | String @unique | 手机号 |
| email | String | 邮箱 |
| username | String? | 用户名（管理员） |
| password | String | 密码（bcrypt 加密） |
| role | String | user / admin |
| status | String | active / disabled |
| registeredAt | DateTime | 注册时间 |
| lastLoginAt | DateTime | 最后登录 |

### Activity（活动）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id @default(cuid()) | 唯一标识 |
| name | String | 活动名称 |
| status | String | 报名中/已满员/已结束/已关闭/草稿 |
| startDate / endDate | String | 活动日期 |
| location | String | 活动地点 |
| price | Float | 人均价格 |
| capacity / enrolled | Int | 名额/已报名 |
| enrollDeadline / enrollStartDate | String | 报名截止/开始日期 |
| description | Json | ContentBlock[] 图文混排 |
| imageUrl | String | 封面图 |
| tags | Json | 标签数组 |
| isFeatured | Boolean | 是否专题活动 |
| featuredPosters | Json | 专题海报数组 |
| images | Json | 图集数组 |
| videoUrl | String | 视频链接 |

### Enrollment（报名记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | String @id @default(cuid()) | 唯一标识 |
| activityId / userId | String | 关联活动/用户 |
| status | String | 已报名/已取消/已移除/已完成 |
| checkInStatus | String | 未签到/已签到/已离场 |
| paymentStatus | String | 未确认/已确认/已减免/已退款 |
| adults / children | Int | 成人/儿童人数 |
| contactName / contactPhone | String | 联系人信息 |
| amount | Float | 费用金额 |
| note / adminNote | String | 备注/管理员备注 |
| participants | Json | 参与者明细 |

---

## 5. 本地开发

前端 Vite 开发服务器配置了 proxy，自动将 `/api` 请求代理到后端 `localhost:3001`：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

启动顺序：
1. 先启动后端：`cd backend && npm run dev`
2. 再启动前端：`npm run dev`

---

## 6. 生产部署

部署统一在 `23zeroSoloDeploy` 项目管理。

### 部署架构

```
用户 → Nginx(HTTPS) → 前端静态文件(/opt/www/yun/)
                    → 后端API(backend-api:3001/api/)
                    → PostgreSQL(yun_schema)
```

### 部署步骤

```bash
# 1. 构建前端
cd 22LiangXiaoYunFang
npm run build

# 2. 拷贝前端产物
cp -r dist/* ../23zeroSoloDeploy/www/yun/

# 3. 启动服务
cd ../23zeroSoloDeploy
docker compose -f docker-compose.prod.yml up -d --build
```

### 环境变量

- 开发环境：`23zeroSoloDeploy/env/.env.dev`
- 生产环境：`23zeroSoloDeploy/env/.env.prod`
- 关键变量：`DATABASE_URL`、`JWT_SECRET`、`JWT_EXPIRES_IN`

---

## 7. 关键架构特征

1. **前后端分离**：React 前端 + Express 后端 + PostgreSQL 数据库
2. **JWT 认证**：Token 存储在 localStorage，自动附加到请求头
3. **匿名报名机制**：不强制登录，报名时自动创建账号（手机号后6位为默认密码）
4. **图文混排**：活动介绍支持 ContentBlock[]（文字块+图片块交替排列）
5. **隐私合规**：报名需勾选隐私协议，弹窗说明数据收集范围
6. **Excel 导出**：管理后台支持导出活动报名列表为 .xlsx 文件
7. **自定义路由**：未使用 react-router，通过 Context + switch-case 实现
8. **API 层封装**：前端 `src/app/api/` 统一管理 HTTP 请求
9. **局域网访问**：Vite 配置 `host: '0.0.0.0'`，支持同 WiFi 设备访问
10. **Docker 部署**：后端 Dockerfile + docker-compose 编排

---

## V2.0 更新日志

### 架构升级
- 新增 Node.js + Express 后端 API 服务
- 新增 Prisma ORM + PostgreSQL 数据库（yun_schema）
- 新增 JWT + bcryptjs 认证体系
- 前端 AppContext 从内存操作改为 API 调用（所有方法变为 async）
- 新增前端 API 层（src/app/api/）：client.ts、auth.api.ts、activity.api.ts、enrollment.api.ts、admin.api.ts
- Vite 配置 proxy 代理 /api 到后端 3001 端口
- 新增后端 Dockerfile + .dockerignore
- 新增 Prisma seed 脚本（5个活动+6个用户+12条报名记录）
- 更新 23zeroSoloDeploy 部署配置（docker-compose、nginx、env）
- AppContext 新增 loading 状态、fetchXxx 方法、changePassword、resetPassword
- 活动管理新增删除草稿活动功能（2次确认弹窗，仅草稿状态可删除）
- 图片上传从 Base64 改为 Multer 文件上传，图片存储在 /uploads/yun/，Nginx 直接服务
- 新增 POST /api/upload 接口（multipart/form-data，最多10张，单张≤10MB）
- 前端 API client 新增 upload 方法支持 FormData 上传
