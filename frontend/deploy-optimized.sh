#!/bin/bash

# 3D打印前端优化版本部署脚本
# 包含性能优化配置

set -e

echo "🚀 开始部署优化版前端..."

# 进入frontend目录
cd "$(dirname "$0")"

# 停止旧容器
echo "⏹️  停止旧容器..."
docker-compose -f docker-compose.ionos.yml down || true

# 清理旧镜像（可选）
echo "🧹 清理旧镜像..."
docker image prune -f

# 构建新镜像
echo "🔨 构建优化版镜像..."
docker-compose -f docker-compose.ionos.yml build --no-cache

# 启动容器
echo "▶️  启动新容器..."
docker-compose -f docker-compose.ionos.yml up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 检查容器状态
echo "✅ 检查容器状态..."
docker-compose -f docker-compose.ionos.yml ps

# 测试健康检查
echo "🏥 测试健康检查..."
sleep 3
curl -f http://localhost/health || echo "⚠️  健康检查失败"

# 显示日志
echo "📋 容器日志（最后20行）："
docker-compose -f docker-compose.ionos.yml logs --tail=20

echo ""
echo "✨ 部署完成！"
echo "🌐 HTTP: http://localhost"
echo "🔒 HTTPS: https://maphium.de"
echo ""
echo "💡 优化内容："
echo "  - 启用 sendfile 加速文件传输"
echo "  - 优化 TCP 参数（tcp_nopush, tcp_nodelay）"
echo "  - 增加缓冲区大小适配大文件"
echo "  - 禁用 library 静态文件访问日志"
echo "  - 文件传输块大小优化至 512KB"
echo ""
echo "📊 查看实时日志："
echo "  docker-compose -f docker-compose.ionos.yml logs -f"
echo ""
echo "🔍 测试下载速度："
echo "  curl -w '\\nSpeed: %{speed_download} bytes/sec\\n' -o /dev/null https://maphium.de/assets/library/3.stl"

