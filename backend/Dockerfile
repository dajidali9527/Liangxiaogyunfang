FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss=false 2>/dev/null; node --max-old-space-size=512 dist/index.js"]
