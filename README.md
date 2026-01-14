# cloudrun-express

## 快速开始

前往 [腾讯云托管快速开始页面](https://tcb.cloud.tencent.com/dev?envId=lowcode-9gms1m53798f7294#/platform-run),选择相应语言的模版，根据引导完成部署。

## 本地调试

1. clone 项目到本地，[项目地址](https://github.com/TencentCloudBase/tcbr-templates)
   
2. 安装依赖
   
```bash
npm install
# or
yarn install
```

3. 运行dev命令

```bash
npm run start
# or
yarn start
```

浏览器访问：[http://localhost:3000](http://localhost:3000) 进行开发调试。

## Dockerfile 最佳实践

请参考 [优化容器镜像](https://docs.cloudbase.net/run/develop/image-optimization)

## 目录结构说明

```
├─ cloudrun-express         
│  ├─ Dockerfile            # docker 镜像配置
│  ├─ README.md             # 项目说明
│  ├─ app.js                # express 配置
│  ├─ bin
│  │  └─ www                # express 启动文件
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public                # 静态资源
│  │  ├─ images
│  │  ├─ javascripts
│  │  └─ stylesheets
│  │     └─ style.css
│  ├─ routes                # 路由处理程序
│  │  ├─ index.js
│  │  └─ users.js
│  └─ views                 # 视图文件
│     ├─ error.hbs
│     ├─ index.hbs
│     └─ layout.hbs
```