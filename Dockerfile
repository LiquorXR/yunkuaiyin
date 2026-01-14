# 二开推荐阅读[如何提高项目构建效率](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/scene/build/speed.html)
FROM alpine:3.13

# 安装依赖包，如需其他依赖包，请到alpine依赖包管理(https://pkgs.alpinelinux.org/packages?name=php8*imagick*&branch=v3.13)查找。
# 选用国内镜像源以提高下载速度
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories \
&& apk add --update --no-cache nodejs npm

# 容器默认时区为UTC，如需使用上海时间请启用以下时区设置命令
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo Asia/Shanghai > /etc/timezone

# 使用 HTTPS 协议访问容器云调用证书安装
RUN apk add ca-certificates

# 配置环境变量
ENV TENCENTCLOUD_SECRETID=yunkuaiyin
ENV TENCENTCLOUD_SECRETKEY=eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJhdWQiOiJjbG91ZDEtNmcxa2J3bTExYTI5YmU2MyIsImV4cCI6MjUzNDAyMzAwNzk5LCJpYXQiOjE3NjgzODg5MzAsImF0X2hhc2giOiJCTUlSRHhYM1JIeUdkN0FZWml6Wm13IiwicHJvamVjdF9pZCI6ImNsb3VkMS02ZzFrYndtMTFhMjliZTYzIiwibWV0YSI6eyJwbGF0Zm9ybSI6IkFwaUtleSJ9LCJhZG1pbmlzdHJhdG9yX2lkIjoiMjAwOTU3MjcwODQxNzk3MDE3OCIsInVzZXJfdHlwZSI6IiIsImNsaWVudF90eXBlIjoiY2xpZW50X3NlcnZlciIsImlzX3N5c3RlbV9hZG1pbiI6dHJ1ZX0.NPLxwKyBBEqP92cC3GiWp-c2rEMOO4UAY4wf2T1jILKJ9SoU3WLtHXr_jOGnb0FaFYBjj4jW-1lvTpD75agZ8FWSyI0ZuCSQh7rcKK6br8kCEAtI-OpWcmYNdVchdDzcQRA11yUDj5m_Ysvq2rnIHcx1K9vw-fjk9OCzkjWkyTqeqyiKMQm_FleiIzIuNxd0k4G1sGq-4C3rDWOfQm7rqhJYFrjJcCvMPC6Jd7OtlQa4wujxWcygYQpccJhEHhSctVUlcMLiEVn3ASzA1ERRFmKRy94tR2G2S_aKBZN84BbyKROCGdF6dVop2VGqADeS_Jl2KP8SAE0UkPGIrQmZtA
ENV TCB_ENV=cloud1-6g1kbwm11a29be63

# # 指定工作目录
WORKDIR /app

# 拷贝包管理文件
COPY package*.json /app/

# npm 源，选用国内镜像源以提高下载速度
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/
# RUN npm config set registry https://registry.npm.taobao.org/

# npm 安装依赖
RUN npm install

# 将当前目录（dockerfile所在目录）下所有文件都拷贝到工作目录下（.dockerignore中文件除外）
COPY . /app

# 执行启动命令
# 写多行独立的CMD命令是错误写法！只有最后一行CMD命令会被执行，之前的都会被忽略，导致业务报错。
# 请参考[Docker官方文档之CMD命令](https://docs.docker.com/engine/reference/builder/#cmd)
CMD ["npm", "start"]
