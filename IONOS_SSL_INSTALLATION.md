# IONOS服务器SSL证书安装指南

## 📋 前提条件

你需要准备以下证书文件：

1. **maphium.de_ssl_certificate.cer** - 主证书（你已有）
2. **私钥文件** - 通常是 `.key` 文件（生成证书时创建的）
3. **中间证书/CA Bundle** - 通常是 `ca_bundle.crt` 或 `intermediate.crt`

> ⚠️ **重要**: 如果缺少私钥文件，证书将无法使用！私钥应该在你申请证书时保存。

---

## 🔍 第一步：确认证书文件

### 检查你有哪些文件：

```bash
# 列出证书相关文件
ls -lh maphium.de*

# 查看证书内容
openssl x509 -in maphium.de_ssl_certificate.cer -text -noout
```

### 你应该有以下文件（或类似命名）：

| 文件 | 说明 | 必需 |
|------|------|------|
| `maphium.de_ssl_certificate.cer` | 域名证书 | ✅ 必需 |
| `maphium.de.key` 或 `private.key` | 私钥 | ✅ 必需 |
| `ca_bundle.crt` 或 `intermediate.crt` | 中间证书 | ✅ 推荐 |

---

## 📁 第二步：准备证书文件

### 方案A：如果你有完整的证书文件

```bash
# 1. 在本地创建证书目录
cd /Users/feitt/Desktop/workspace/maphium/3d-print/frontend
mkdir -p ssl-certs

# 2. 复制/移动你的证书文件到这个目录
# 假设你的证书文件在下载目录
cp ~/Downloads/maphium.de_ssl_certificate.cer ssl-certs/
cp ~/Downloads/maphium.de.key ssl-certs/
cp ~/Downloads/ca_bundle.crt ssl-certs/  # 如果有的话

# 3. 重命名为标准格式（方便配置）
cd ssl-certs
mv maphium.de_ssl_certificate.cer cert.pem
mv maphium.de.key privkey.pem
mv ca_bundle.crt chain.pem  # 如果有的话

# 4. 创建完整证书链（cert.pem + chain.pem）
cat cert.pem chain.pem > fullchain.pem

# 5. 设置正确的权限
chmod 600 privkey.pem
chmod 644 *.pem
```

### 方案B：如果只有 .cer 文件，缺少私钥

如果你只有证书文件没有私钥：

1. **检查IONOS控制面板**：
   - 登录 https://www.ionos.com
   - 进入 "SSL证书" 管理
   - 查找并下载完整的证书包（包括私钥）

2. **如果私钥已丢失**：
   - 需要重新生成CSR（证书签名请求）
   - 重新申请/重新签发证书

---

## 🔧 第三步：转换证书格式（如果需要）

### 如果证书是 .cer 或 .crt 格式，转换为 .pem：

```bash
# .cer 转 .pem
openssl x509 -inform DER -in maphium.de_ssl_certificate.cer -out cert.pem

# 或者（如果是PEM格式的.cer）
cp maphium.de_ssl_certificate.cer cert.pem

# 验证转换结果
openssl x509 -in cert.pem -text -noout
```

### 如果私钥是其他格式：

```bash
# .pfx 或 .p12 转换（包含证书和私钥）
openssl pkcs12 -in certificate.pfx -nocerts -out privkey.pem -nodes
openssl pkcs12 -in certificate.pfx -nokeys -out cert.pem

# .key 转 .pem（通常直接重命名即可）
cp maphium.de.key privkey.pem
```

---

## 🐳 第四步：配置Nginx和Docker

### 1. 创建Nginx SSL配置文件

创建 `frontend/nginx.ionos.conf`：

```nginx
# HTTP重定向到HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name maphium.de www.maphium.de;
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS服务器配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name maphium.de www.maphium.de;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    
    # SSL会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 设置客户端最大请求体大小
    client_max_body_size 100M;
    
    # 静态文件服务
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|stl)$ {
        root   /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*" always;
    }

    # API代理
    location /api/ {
        proxy_pass http://82.165.16.178:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. 更新Dockerfile

编辑 `frontend/Dockerfile`，修改第28行：

```dockerfile
# 使用IONOS SSL配置
COPY ./frontend/nginx.ionos.conf /etc/nginx/conf.d/default.conf
```

### 3. 创建Docker Compose配置

创建 `frontend/docker-compose.ionos.yml`：

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ..
      dockerfile: ./frontend/Dockerfile
    container_name: maphium-frontend-ssl
    ports:
      - "80:80"
      - "443:443"
    volumes:
      # 挂载SSL证书（只读）
      - ./ssl-certs:/etc/nginx/ssl:ro
      # 挂载nginx配置（只读）
      - ./frontend/nginx.ionos.conf:/etc/nginx/conf.d/default.conf:ro
    restart: unless-stopped
    networks:
      - maphium-network

networks:
  maphium-network:
    driver: bridge
```

---

## 🚀 第五步：部署到IONOS服务器

### 方法A：使用Docker部署（推荐）

```bash
# 1. 连接到IONOS服务器
ssh your-username@your-ionos-server-ip

# 2. 进入项目目录
cd /path/to/maphium/3d-print

# 3. 确保证书文件已上传到服务器
ls -lh frontend/ssl-certs/

# 4. 停止现有容器（如果有）
docker stop maphium-frontend 2>/dev/null || true
docker rm maphium-frontend 2>/dev/null || true

# 5. 构建并启动新容器
docker-compose -f frontend/docker-compose.ionos.yml up -d --build

# 6. 查看日志
docker logs -f maphium-frontend-ssl
```

### 方法B：直接在IONOS服务器的Nginx配置

如果IONOS服务器已经运行了Nginx（不用Docker）：

```bash
# 1. 上传证书到服务器
scp frontend/ssl-certs/*.pem user@ionos-server:/etc/nginx/ssl/

# 2. SSH登录服务器
ssh user@ionos-server

# 3. 设置证书权限
sudo chmod 600 /etc/nginx/ssl/privkey.pem
sudo chmod 644 /etc/nginx/ssl/*.pem

# 4. 创建Nginx配置
sudo nano /etc/nginx/sites-available/maphium.de

# 5. 粘贴上面的nginx配置内容

# 6. 启用站点
sudo ln -s /etc/nginx/sites-available/maphium.de /etc/nginx/sites-enabled/

# 7. 测试配置
sudo nginx -t

# 8. 重载Nginx
sudo systemctl reload nginx
```

---

## ✅ 第六步：验证安装

### 1. 检查证书文件

```bash
# 在服务器上
ls -lh /etc/nginx/ssl/

# 应该看到：
# -rw-r--r-- cert.pem
# -rw-r--r-- fullchain.pem
# -rw------- privkey.pem
# -rw-r--r-- chain.pem
```

### 2. 测试Nginx配置

```bash
# 在服务器上
docker exec maphium-frontend-ssl nginx -t

# 或者（非Docker）
sudo nginx -t
```

### 3. 测试HTTPS访问

```bash
# 从本地测试
curl -I https://maphium.de

# 应该看到：
# HTTP/2 200
# strict-transport-security: max-age=31536000
```

### 4. 浏览器测试

1. 访问 https://maphium.de
2. 点击地址栏的🔒图标
3. 查看证书详情：
   - 颁发给：maphium.de
   - 有效期检查
   - 证书链完整性

### 5. SSL评分测试

访问 https://www.ssllabs.com/ssltest/analyze.html?d=maphium.de

目标评分：A 或 A+

---

## 🔧 常见问题排查

### 问题1：缺少私钥文件

**症状**：只有 .cer 证书文件

**解决**：
1. 检查IONOS控制面板的证书管理
2. 下载完整的证书包
3. 如果私钥丢失，需要重新申请证书

### 问题2：证书链不完整

**症状**：浏览器显示"证书链不完整"

**解决**：
```bash
# 下载中间证书
# 从证书颁发机构网站获取中间证书
# 或使用在线工具: https://whatsmychaincert.com/

# 创建完整证书链
cat cert.pem intermediate.crt root.crt > fullchain.pem
```

### 问题3：证书格式错误

**症状**：Nginx启动失败，错误信息包含 "PEM_read_bio"

**解决**：
```bash
# 检查证书格式
openssl x509 -in cert.pem -text -noout

# 如果是DER格式，转换为PEM
openssl x509 -inform DER -in maphium.de_ssl_certificate.cer -out cert.pem
```

### 问题4：权限错误

**症状**：Nginx错误日志显示 "permission denied"

**解决**：
```bash
# 设置正确的权限
sudo chmod 600 /etc/nginx/ssl/privkey.pem
sudo chmod 644 /etc/nginx/ssl/*.pem
sudo chown root:root /etc/nginx/ssl/*
```

### 问题5：端口已被占用

**症状**：Docker启动失败，端口443已被占用

**解决**：
```bash
# 查看占用端口的进程
sudo lsof -i :443

# 停止占用的服务
sudo systemctl stop nginx  # 如果有系统nginx
sudo systemctl stop apache2  # 如果有apache
```

---

## 📤 上传证书到IONOS服务器

### 使用SCP上传

```bash
# 从本地上传证书到服务器
scp -r frontend/ssl-certs/ user@your-ionos-ip:/path/to/maphium/3d-print/frontend/

# 或者上传单个文件
scp frontend/ssl-certs/fullchain.pem user@your-ionos-ip:/etc/nginx/ssl/
scp frontend/ssl-certs/privkey.pem user@your-ionos-ip:/etc/nginx/ssl/
scp frontend/ssl-certs/chain.pem user@your-ionos-ip:/etc/nginx/ssl/
```

### 使用SFTP上传

```bash
# 使用SFTP
sftp user@your-ionos-ip

# 在SFTP会话中
put frontend/ssl-certs/fullchain.pem /path/to/destination/
put frontend/ssl-certs/privkey.pem /path/to/destination/
put frontend/ssl-certs/chain.pem /path/to/destination/
```

---

## 📋 完整部署清单

- [ ] 准备好所有证书文件（.cer, .key, ca_bundle）
- [ ] 转换证书为PEM格式
- [ ] 创建完整证书链（fullchain.pem）
- [ ] 设置正确的文件权限
- [ ] 创建nginx.ionos.conf配置文件
- [ ] 更新Dockerfile引用新配置
- [ ] 上传证书到服务器
- [ ] 构建并启动Docker容器
- [ ] 测试HTTP到HTTPS重定向
- [ ] 验证HTTPS正常访问
- [ ] 检查证书有效期
- [ ] 运行SSL Labs测试

---

## 🔄 证书续期

IONOS证书通常有效期为1-2年，到期前需要续期：

```bash
# 1. 从IONOS获取新证书
# 2. 重复上述步骤替换证书文件
# 3. 重启服务

# Docker方式
docker restart maphium-frontend-ssl

# 或非Docker方式
sudo systemctl reload nginx
```

---

## 📞 需要帮助？

1. **查看Nginx日志**：
   ```bash
   # Docker
   docker logs maphium-frontend-ssl
   
   # 非Docker
   sudo tail -f /var/log/nginx/error.log
   ```

2. **测试证书**：
   ```bash
   openssl s_client -connect maphium.de:443 -servername maphium.de
   ```

3. **IONOS支持**：
   - https://www.ionos.com/help/
   - 客服电话或在线聊天

---

**预计安装时间：** 15-30分钟（取决于证书文件准备情况）

**重要提醒：** 
- ⚠️ 务必妥善保管私钥文件
- ⚠️ 不要将私钥提交到Git仓库
- ⚠️ 定期检查证书有效期

