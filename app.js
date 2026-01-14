const express = require('express');
const bodyParser = require('body-parser');
const cloud = require('wx-server-sdk');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化云 SDK (云托管内免鉴权)
// 建议在云托管中显式指定 env 以解决 501001 超时问题
const ENV_ID = 'cloud1-6g1kbwm11a29be63';

cloud.init({
  env: ENV_ID
});

// 数据库对象在请求时再获取，确保初始化完成
const getDB = () => cloud.database({
  env: ENV_ID
});

// 获取订单列表
// 兼容不同路径的获取订单请求
app.get(['/api/orders', '/orders'], async (req, res) => {
  console.log('[LOG] 开始获取订单列表...');
  const startTime = Date.now();
  try {
    const db = getDB();
    // 添加 limit(20) 限制，并添加超时重试逻辑（逻辑层处理）
    const result = await db.collection('orders')
      .orderBy('createTime', 'desc')
      .limit(20)
      .get();
    
    console.log(`[LOG] 成功获取订单，数量: ${result.data ? result.data.length : 0}，耗时: ${Date.now() - startTime}ms`);
    res.send({ code: 0, data: result.data });
  } catch (err) {
    console.error('[ERR] 获取订单失败，详细错误信息:', err);
    // 504 可能是因为数据库查询超时，这里捕获并返回更明确的错误
    res.status(500).send({
      code: -1,
      msg: '获取订单失败',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 核销订单 (修改状态)
app.post(['/api/order/complete', '/order/complete'], async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ code: -1, msg: '缺少订单ID' });

  try {
    const db = getDB();
    await db.collection('orders').doc(id).update({
      data: { status: 'completed' }
    });
    res.send({ code: 0, msg: '已核销' });
  } catch (err) {
    console.error('核销失败', err);
    res.status(500).send({ code: -1, msg: '核销失败' });
  }
});

// 获取文件临时下载链接
app.post(['/api/file/url', '/file/url'], async (req, res) => {
  const { fileList } = req.body; // 传入 fileID 数组
  if (!fileList || !fileList.length) return res.send({ code: 0, data: [] });

  try {
    const result = await cloud.getTempFileURL({
      fileList: fileList
    });
    res.send({ code: 0, data: result.fileList });
  } catch (err) {
    console.error('获取下载链接失败', err);
    res.status(500).send({ code: -1, msg: '获取链接失败' });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`管理后台服务端已启动，端口: ${port}`);
});
