const express = require('express');
const bodyParser = require('body-parser');
const tcb = require('@cloudbase/node-sdk');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 CloudBase SDK
// 在云托管环境内，如果不传 env ID，SDK 会自动感知当前环境
// 也可以显式指定以提高稳定性
const cloud = tcb.init({
  env: 'cloud1-6g1kbwm11a29be63',
  timeout: 15000
});

const db = cloud.database();

// 内部使用的简单重试包装器
const fetchWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`[LOG] 请求失败，正在进行第 ${i + 1} 次重试... 错误: ${err.message}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// 获取订单列表
app.get(['/api/orders', '/orders'], async (req, res) => {
  console.log('[LOG] 开始获取订单列表...');
  const startTime = Date.now();
  try {
    // 使用重试逻辑获取数据
    const result = await fetchWithRetry(() =>
      db.collection('orders')
        .orderBy('createTime', 'desc')
        .limit(20)
        .get()
    );
    
    console.log(`[LOG] 成功获取订单，数量: ${result.data ? result.data.length : 0}，耗时: ${Date.now() - startTime}ms`);
    res.send({ code: 0, data: result.data });
  } catch (err) {
    console.error('[ERR] 获取订单失败，详细错误信息:', err);
    res.status(500).send({
      code: -1,
      msg: '获取订单失败',
      error: err.message
    });
  }
});

// 核销订单 (修改状态)
app.post(['/api/order/complete', '/order/complete'], async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send({ code: -1, msg: '缺少订单ID' });

  try {
    await db.collection('orders').doc(id).update({
      status: 'completed'
    });
    res.send({ code: 0, msg: '已核销' });
  } catch (err) {
    console.error('核销失败', err);
    res.status(500).send({ code: -1, msg: '核销失败', error: err.message });
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
    res.status(500).send({ code: -1, msg: '获取链接失败', error: err.message });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`管理后台服务端已启动，端口: ${port}`);
});
