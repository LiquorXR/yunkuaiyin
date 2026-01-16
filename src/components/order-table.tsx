'use client';

import React from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  MoreHorizontal, 
  Printer, 
  Archive,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/types';

interface OrderTableProps {
  orders: Order[];
  onStatusChange: (id: string, status: 'pending' | 'completed') => void;
  onDownloadAll: (id: string) => void;
}

export default function OrderTable({ orders, onStatusChange, onDownloadAll }: OrderTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
              <th className="px-6 py-4">订单信息</th>
              <th className="px-6 py-4">规格参数</th>
              <th className="px-6 py-4">文件列表</th>
              <th className="px-6 py-4">备注</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* 订单信息 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-slate-900 tracking-tight">
                        {order.pickupCode}
                      </span>
                      <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(order.createTime), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                  </td>

                  {/* 规格参数 */}
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase",
                          order.color === '彩色' ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {order.color}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase">
                          {order.sides}
                        </span>
                        {order.needsBinding && (
                          <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-[10px] font-semibold uppercase">
                            装订
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Printer size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{order.copies} 份</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        UID: {order.userUid || '匿名'}
                      </div>
                    </div>
                  </td>

                  {/* 文件列表 */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 max-w-[200px]">
                      {order.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file.downloadURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors group"
                        >
                          <FileText size={14} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                          <span className="truncate" title={file.name}>{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </td>

                  {/* 备注 */}
                  <td className="px-6 py-4">
                    {order.remark ? (
                      <p className="text-xs text-slate-500 italic max-w-[150px] line-clamp-2" title={order.remark}>
                        "{order.remark}"
                      </p>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 状态 */}
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                      order.status === 'pending' 
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-emerald-100 text-emerald-700"
                    )}>
                      {order.status === 'pending' ? (
                        <><Clock size={12} /> 待处理</>
                      ) : (
                        <><CheckCircle2 size={12} /> 已完成</>
                      )}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onDownloadAll(order._id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="打包下载"
                          >
                            <Archive size={18} />
                          </button>
                          <button
                            onClick={() => onStatusChange(order._id, 'completed')}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                            title="完成订单"
                          >
                            <Check size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <ClipboardList className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-medium">暂无订单数据</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}
