import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 z-30 w-full border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Spacer for Sidebar on large screens */}
          <div className="hidden w-64 lg:block"></div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Painel Administrativo
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center gap-3 border-l pl-4 dark:border-gray-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Liderança</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
