const express = require('express');
const bodyParser = require('body-parser');
const tcb = require('@cloudbase/node-sdk');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 延迟初始化
let db = null;
const getDB = () => {
  if (!db) {
    console.log('[LOG] 正在延迟初始化 SDK...');
    const cloud = tcb.init({
      env: 'cloud1-6g1kbwm11a29be63',
      timeout: 10000 // 缩短 SDK 内部超时，避免挂死
    });
    db = cloud.database();
  }
  return db;
};

app.get('/ping', (req, res) => res.send('pong'));

app.get(['/api/orders', '/orders'], async (req, res) => {
  console.log('[LOG] 收到订单请求');
  try {
    const database = getDB();
    console.log('[LOG] 准备执行数据库查询...');
    
    // 使用 Promise.race 防止无限挂死
    const queryPromise = database.collection('orders').limit(10).get();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Internal Database Timeout')), 8000)
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    console.log(`[LOG] 查询完成, 数量: ${result.data.length}`);
    res.send({ code: 0, data: result.data });
  } catch (err) {
    console.error('[ERR] 错误:', err.message);
    res.status(500).send({ code: -1, msg: err.message });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on ${port}`));
