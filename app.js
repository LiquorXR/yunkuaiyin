const express = require('express');
const bodyParser = require('body-parser');
const tcb = require('@cloudbase/node-sdk');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 SDK
console.log('[LOG] 正在初始化 SDK...');
const cloud = tcb.init({
  env: 'cloud1-6g1kbwm11a29be63',
  timeout: 15000 // 适当增加超时时间，给数据库更多机会
});
const db = cloud.database();

app.get('/ping', (req, res) => res.send('pong'));

app.get(['/api/orders', '/orders'], async (req, res) => {
  console.log('[LOG] 收到订单请求');
  try {
    console.log('[LOG] 准备执行数据库查询...');
    
    // 使用 Promise.race 防止无限挂死，并利用索引优化查询
    const queryPromise = db.collection('orders')
      .orderBy('createTime', 'desc')
      .limit(10)
      .get();
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
