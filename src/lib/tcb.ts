import tcb from '@cloudbase/node-sdk';

const ENV_ID = process.env.TCB_ENV;

let app: any;

try {
  if (process.env.TENCENTCLOUD_SECRETID) {
    app = tcb.init({
      env: ENV_ID,
      secretId: process.env.TENCENTCLOUD_SECRETID,
      secretKey: process.env.TENCENTCLOUD_SECRETKEY,
      secretToken: process.env.TENCENTCLOUD_SESSIONTOKEN
    });
  } else {
    app = tcb.init({
      env: ENV_ID
    });
  }
} catch (e) {
  console.error('TCB Init Error:', e);
}

export const db = app ? app.database() : null;
export const tcbApp = app;
