# 🧩 两小云房后端接入升级方案（V1.0）

## 🎯 升级目标
前端Mock → 后端API → PostgreSQL

---

## 🧱 后端技术栈
Node.js + NestJS + Prisma + PostgreSQL + JWT

---

## 🧱 后端结构
backend/
  modules/
    auth/
    user/
    activity/
    enrollment/

---

## 🗄 数据库（来自TengXunYun）

shared_schema:
- users
- roles
- sessions

yun_schema:
- activities
- enrollments
- activity_logs

---

## 🔐 API设计

/auth/login
/auth/register

/activities
/enrollments

/admin/dashboard

---

## 🧠 业务必须后端化

必须迁移：
- 报名逻辑
- 名额控制
- 重复报名校验
- 用户创建
- 状态流转

---

## 💻 前端改造

src/api/
- user.api.ts
- activity.api.ts
- enrollment.api.ts

禁止直接使用mock扩展业务

---

## ☁️ 部署依赖TengXunYun

- Nginx
- Docker
- PostgreSQL
- docker-compose

---

## ⚠️ 强制规则

- 禁止mock继续扩展业务
- 所有核心逻辑必须后端化
- 数据必须入PostgreSQL

---

## 🚀 架构最终形态

Frontend → Backend → PostgreSQL → Docker → Nginx
