import React from 'react';
import { LayoutDashboard, ClipboardList, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemHealth } from './system-health';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axios.delete('/api/auth/login');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { name: '仪表盘', icon: LayoutDashboard, href: '/dashboard' },
    { name: '订单管理', icon: ClipboardList, href: '/' },
    { name: '系统设置', icon: Settings, href: '/settings' },
  ];

  const currentTitle = navItems.find(item => item.href === pathname)?.name || '管理后台';

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="bg-blue-600 text-white p-1 rounded">快</span>
            快印管理后台
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-4">
          <SystemHealth />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">{currentTitle}</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 text-right">
              <p className="font-medium text-slate-900">管理员</p>
              <p>最后登录: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200" />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
