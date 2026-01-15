const express = require('express');
const router = express.Router();
const tcb = require('@cloudbase/node-sdk');
const JSZip = require('jszip');
const axios = require('axios');

// 优先从环境变量获取
const ENV_ID = process.env.TCB_ENV;
// ... (rest of tcb init)


let app;
try {
  // 如果环境变量中有 SecretId，说明用户已手动配置或平台已注入
  if (process.env.TENCENTCLOUD_SECRETID) {
    app = tcb.init({
      env: ENV_ID,
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      secretToken: process.env.TENCENTCLOUD_SESSIONTOKEN
    });
  } else {
    // 否则尝试自动初始化
    app = tcb.init({
      env: ENV_ID
    });
  }
} catch (e) {
  console.error('TCB Init Error:', e);
}

const db = app ? app.database() : null;

// 1. 健康检查
router.get('/health', async (req, res) => {
  res.json({
    状态: '正常',
    当前时间: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    环境ID: ENV_ID,
    // 探测环境变量
    环境变量: {
      TCB_ENV: process.env.TCB_ENV,
      SECRET_ID: process.env.TENCENTCLOUD_SECRETID ? '已配置' : '未配置',
      SECRET_KEY: process.env.TENCENTCLOUD_SECRETKEY ? '已配置' : '未配置'
    },
    SDK初始化: !!app ? '成功' : '失败',
    数据库初始化: !!db ? '成功' : '失败'
  });
});

// 2. 统计信息
router.get('/stats', async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { total } = await db.collection('orders').count();
    const { total: pending } = await db.collection('orders').where({ status: 'pending' }).count();
    res.json({ total, pending });
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// 3. 更新任务状态
router.post('/tasks/:id/status', async (req, res) => {
  if (!db) return res.status(500).send('Database not initialized');
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.collection('orders').doc(id).update({
      status: status
    });
    res.redirect('/');
  } catch (err) {
    res.status(500).send('更新失败: ' + err.message);
  }
});

// 5. 批量下载订单文件
router.get('/tasks/:id/download-all', async (req, res) => {
  if (!db) return res.status(500).send('Database not initialized');
  const { id } = req.params;

  try {
    const { data: [task] } = await db.collection('orders').doc(id).get();
    if (!task || !task.files || task.files.length === 0) {
      return res.status(404).send('订单不存在或没有文件');
    }

    // 获取文件临时下载链接
    const fileList = task.files.map(f => ({
      fileID: f.fileID,
      maxAge: 3600
    }));
    const { fileList: urls } = await app.getTempFileURL({ fileList });

    const zip = new JSZip();
    
    // 下载所有文件并加入 zip
    const downloadPromises = urls.map(async (fileInfo, index) => {
      const response = await axios.get(fileInfo.tempFileURL, { responseType: 'arraybuffer' });
      const fileName = task.files[index].name;
      zip.file(fileName, response.data);
    });

    await Promise.all(downloadPromises);

    const content = await zip.generateAsync({ type: 'nodebuffer' });

    // 格式化时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zipName = `${task.pickupCode}_${timeStr}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(zipName)}`);
    res.send(content);
  } catch (err) {
    console.error('打包下载失败:', err);
    res.status(500).send('打包下载失败: ' + err.message);
  }
});

// 4. 任务列表 (根路径)
router.get('/', async (req, res) => {
  if (!db) {
    return res.status(500).render('error', { 
      message: '系统未就绪', 
      error: { status: 'INIT_FAIL', stack: 'SDK 初始化失败，请检查环境配置。' } 
    });
  }

  try {
    const { data: tasks } = await db.collection('orders')
      .orderBy('createTime', 'desc')
      .get();

    // 为每个文件的 fileID 获取临时下载链接
    for (const task of tasks) {
      if (task.files && task.files.length > 0) {
        const fileList = task.files.map(f => ({
          fileID: f.fileID,
          maxAge: 7200 // 2小时
        }));
        try {
          const { fileList: urls } = await app.getTempFileURL({ fileList });
          task.files = task.files.map((f, index) => ({
            ...f,
            downloadURL: urls[index].tempFileURL
          }));
        } catch (e) {
          console.error(`获取文件链接失败: ${task._id}`, e);
        }
      }
    }

    // 获取所有相关的 _openid
    const openids = [...new Set(tasks.map(t => t._openid).filter(id => !!id))];
    
    // 查询用户信息映射
    let userMap = {};
    if (openids.length > 0) {
      const _ = db.command;
      const { data: users } = await db.collection('users')
        .where({
          _openid: _.in(openids)
        })
        .get();
      users.forEach(u => {
        userMap[u._openid] = u.uid || '未知UID';
      });
    }

    // 将 uid 注入到任务数据中
    const tasksWithUid = tasks.map(t => ({
      ...t,
      userUid: userMap[t._openid] || '未知UID'
    }));
    
    // orders 集合中已经包含了 files 数组，无需额外查询 task_files
    res.render('admin/tasks', { tasks: tasksWithUid, title: '快印订单管理中心' });
  } catch (err) {
    res.status(500).render('error', { 
      message: '订单列表加载失败', 
      error: { 
        status: err.code || 'DB_ERROR', 
        stack: `错误详情: ${err.message}\n\n排查建议：\n1. 检查环境变量 TENCENTCLOUD_SECRETID 和 TENCENTCLOUD_SECRETKEY 是否正确配置。\n2. 确保已在微信云托管控制台开启“资源复用”。`
      } 
    });
  }
});

module.exports = router;
