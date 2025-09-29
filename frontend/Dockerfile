# 多阶段构建优化版本
FROM --platform=linux/amd64 node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV NODE_ENV=production

# 复制package文件（利用Docker层缓存）
COPY package*.json ./

# 安装所有依赖（包括devDependencies，构建需要）
RUN npm ci --registry=https://registry.npmmirror.com && \
    npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM --platform=linux/amd64 nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制nginx配置
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]