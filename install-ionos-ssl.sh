#!/bin/bash

# IONOS SSL证书安装脚本
# 用于快速配置已有的SSL证书

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   IONOS SSL证书安装配置工具          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}\n"

# 证书目录
CERT_DIR="frontend/ssl-certs"

# 检查是否在正确的目录
if [ ! -d "frontend" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 创建证书目录
mkdir -p $CERT_DIR

echo -e "${BLUE}步骤 1/5: 准备证书文件${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 询问证书文件路径
echo -e "\n${YELLOW}请提供以下文件的路径：${NC}"
echo ""

# 证书文件
read -p "1️⃣  域名证书文件路径 (.cer 或 .crt): " cert_file
if [ ! -f "$cert_file" ]; then
    echo -e "${RED}错误: 证书文件不存在: $cert_file${NC}"
    exit 1
fi

# 私钥文件
read -p "2️⃣  私钥文件路径 (.key): " key_file
if [ ! -f "$key_file" ]; then
    echo -e "${RED}错误: 私钥文件不存在: $key_file${NC}"
    echo -e "${YELLOW}提示: 私钥文件是申请证书时生成的，通常命名为 private.key 或 maphium.de.key${NC}"
    exit 1
fi

# 中间证书（可选）
read -p "3️⃣  中间证书/CA Bundle路径 (.crt/.pem，可选，直接回车跳过): " ca_bundle

echo -e "\n${BLUE}步骤 2/5: 转换和验证证书格式${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检测并转换证书格式
echo "检测证书格式..."
if openssl x509 -inform PEM -in "$cert_file" -noout 2>/dev/null; then
    echo "✓ 证书已是PEM格式"
    cp "$cert_file" "$CERT_DIR/cert.pem"
elif openssl x509 -inform DER -in "$cert_file" -noout 2>/dev/null; then
    echo "⚠ 证书是DER格式，转换为PEM..."
    openssl x509 -inform DER -in "$cert_file" -out "$CERT_DIR/cert.pem"
    echo "✓ 转换完成"
else
    echo -e "${RED}错误: 无法识别证书格式${NC}"
    exit 1
fi

# 处理私钥
echo "处理私钥文件..."
cp "$key_file" "$CERT_DIR/privkey.pem"
echo "✓ 私钥文件已复制"

# 处理中间证书
if [ -n "$ca_bundle" ] && [ -f "$ca_bundle" ]; then
    echo "处理中间证书..."
    cp "$ca_bundle" "$CERT_DIR/chain.pem"
    echo "✓ 中间证书已复制"
    
    # 创建完整证书链
    echo "创建完整证书链..."
    cat "$CERT_DIR/cert.pem" "$CERT_DIR/chain.pem" > "$CERT_DIR/fullchain.pem"
    echo "✓ 完整证书链已创建"
else
    echo "⚠ 未提供中间证书，仅使用域名证书"
    cp "$CERT_DIR/cert.pem" "$CERT_DIR/fullchain.pem"
fi

echo -e "\n${BLUE}步骤 3/5: 验证证书${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 显示证书信息
echo -e "\n${YELLOW}证书信息：${NC}"
openssl x509 -in "$CERT_DIR/cert.pem" -noout -subject -issuer -dates | while IFS= read -r line; do
    echo "  $line"
done

# 验证私钥和证书匹配
echo -e "\n验证私钥和证书是否匹配..."
cert_modulus=$(openssl x509 -in "$CERT_DIR/cert.pem" -noout -modulus | openssl md5)
key_modulus=$(openssl rsa -in "$CERT_DIR/privkey.pem" -noout -modulus 2>/dev/null | openssl md5)

if [ "$cert_modulus" = "$key_modulus" ]; then
    echo -e "${GREEN}✓ 私钥和证书匹配${NC}"
else
    echo -e "${RED}✗ 错误: 私钥和证书不匹配！${NC}"
    exit 1
fi

echo -e "\n${BLUE}步骤 4/5: 设置文件权限${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

chmod 600 "$CERT_DIR/privkey.pem"
chmod 644 "$CERT_DIR"/*.pem
echo "✓ 文件权限已设置"

echo -e "\n${BLUE}步骤 5/5: 准备部署${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n${GREEN}✅ SSL证书准备完成！${NC}\n"

echo "证书文件位置："
ls -lh "$CERT_DIR"/*.pem | awk '{print "  " $9 " (" $5 ")"}'

echo -e "\n${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}下一步操作：${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}\n"

echo "1️⃣  更新 Dockerfile"
echo "   编辑: frontend/Dockerfile"
echo "   修改第28行为: COPY ./frontend/nginx.ionos.conf /etc/nginx/conf.d/default.conf"
echo ""

echo "2️⃣  本地测试（可选）"
echo "   docker-compose -f frontend/docker-compose.ionos.yml up --build"
echo ""

echo "3️⃣  上传证书到IONOS服务器"
echo "   scp -r $CERT_DIR your-user@your-ionos-ip:/path/to/maphium/3d-print/frontend/"
echo ""

echo "4️⃣  部署到服务器"
echo "   ssh your-user@your-ionos-ip"
echo "   cd /path/to/maphium/3d-print"
echo "   docker-compose -f frontend/docker-compose.ionos.yml up -d --build"
echo ""

echo "5️⃣  验证HTTPS"
echo "   浏览器访问: https://maphium.de"
echo "   命令行测试: curl -I https://maphium.de"
echo "   SSL评分: https://www.ssllabs.com/ssltest/analyze.html?d=maphium.de"
echo ""

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}配置完成！祝部署顺利！${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

# 提示查看详细文档
echo -e "${BLUE}💡 查看详细文档:${NC}"
echo "   cat IONOS_SSL_INSTALLATION.md"
echo ""

