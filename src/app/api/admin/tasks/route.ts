import { NextResponse } from 'next/server';
import { db, tcbApp } from '@/lib/tcb';

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
  }

  try {
    const { data: tasks } = await db.collection('orders')
      .orderBy('createTime', 'desc')
      .get();

    // 为每个文件的 fileID 获取临时下载链接
    for (const task of tasks) {
      if (task.files && task.files.length > 0) {
        const fileList = task.files.map((f: any) => ({
          fileID: f.fileID,
          maxAge: 7200
        }));
        try {
          const { fileList: urls } = await tcbApp.getTempFileURL({ fileList });
          task.files = task.files.map((f: any, index: number) => ({
            ...f,
            downloadURL: urls[index].tempFileURL
          }));
        } catch (e) {
          console.error(`获取文件链接失败: ${task._id}`, e);
        }
      }
    }

    // 获取所有相关的 _openid
    const openids = [...new Set(tasks.map((t: any) => t._openid).filter((id: any) => !!id))];
    
    // 查询用户信息映射
    let userMap: Record<string, string> = {};
    if (openids.length > 0) {
      const _ = db.command;
      const { data: users } = await db.collection('users')
        .where({
          _openid: _.in(openids)
        })
        .get();
      users.forEach((u: any) => {
        userMap[u._openid] = u.uid || '未知UID';
      });
    }

    const tasksWithUid = tasks.map((t: any) => ({
      ...t,
      userUid: userMap[t._openid] || '未知UID'
    }));
    
    return NextResponse.json({ tasks: tasksWithUid });
  } catch (err: any) {
    console.error('Fetch tasks failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
