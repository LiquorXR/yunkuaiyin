# 使用 Node.js 18 镜像以获得更好的性能和支持
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制所有源代码
COPY . .

# 暴露端口 (云托管默认 80)
EXPOSE 80

# 启动服务
CMD ["npm", "start"]
