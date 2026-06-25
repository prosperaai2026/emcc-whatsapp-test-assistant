'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Send,
  Home
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Visitantes', href: '/visitors', icon: Users },
  { name: 'Pedidos de Oração', href: '/prayer-requests', icon: MessageSquare },
  { name: 'Base de Conhecimento', href: '/knowledge-base', icon: BookOpen },
  { name: 'Comunicados', href: '/announcements', icon: Send },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform dark:bg-gray-800 dark:border-gray-700">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Home size={20} />
          </div>
          <span className="ml-3 text-xl font-bold dark:text-white">PROSPERA AI</span>
        </div>
        
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg p-2 transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-auto rounded-lg bg-blue-50 p-4 dark:bg-gray-700">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            Igreja EMCC
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Plano Standard
          </p>
        </div>
      </div>
    </aside>
  );
}
