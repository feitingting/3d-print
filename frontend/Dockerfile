# 多阶段构建优化版本
FROM --platform=linux/amd64 node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_ENV=development

# 先复制package文件（利用Docker缓存）
COPY package.json package-lock.json* ./

# 清理npm缓存并安装依赖
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 设置生产环境并构建
ENV NODE_ENV=production
RUN npm run build

# 生产阶段
FROM --platform=linux/amd64 nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx主配置（性能优化）
# COPY ./frontend/nginx.conf /etc/nginx/nginx.conf

# 复制server配置
COPY ./frontend/nginx.ionos.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80 443

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]