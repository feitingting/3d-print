# 完整的构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# 添加 OpenSSL 兼容性选项
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80