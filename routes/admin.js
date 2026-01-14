const express = require('express');
const router = express.Router();
const tcb = require('@cloudbase/node-sdk');

const app = tcb.init({
  env: tcb.SYMBOL_CURRENT_ENV
});
const db = app.database();
const _ = db.command;

// 获取任务列表
router.get('/tasks', async (req, res) => {
  try {
    const { data: tasks } = await db.collection('print_tasks')
      .orderBy('createTime', 'desc')
      .get();
    
    // 获取关联文件
    for (let task of tasks) {
      const { data: files } = await db.collection('task_files')
        .where({
          printTask: task._id
        }).get();
      task.files = files;
    }

    res.render('admin/tasks', { tasks, title: '打印订单管理' });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

// 更新任务状态
router.post('/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.collection('print_tasks').doc(id).update({
      status: parseInt(status)
    });
    res.redirect('/admin/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('更新失败');
  }
});

// 健康检查与环境探测
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.TCB_ENV || 'unknown',
    service: process.env.TCB_SERVICE || 'unknown',
    hasKeys: !!(process.env.TENCENTCLOUD_SECRETID && process.env.TENCENTCLOUD_SECRETKEY)
  });
});

// 获取统计信息
router.get('/stats', async (req, res) => {
  try {
    const { total } = await db.collection('print_tasks').count();
    const { total: pending } = await db.collection('print_tasks').where({ status: 0 }).count();
    res.json({ total, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
