import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { NotificationToast } from './NotificationToast';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        <Topbar />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <NotificationToast />
      </div>
    </div>
  );
};
