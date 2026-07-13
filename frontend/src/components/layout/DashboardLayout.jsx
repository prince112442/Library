import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-parchment">
      <Sidebar />

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-navy-dark/50" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 z-10 rounded-sm p-1.5 text-parchment/70 hover:bg-white/10"
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
