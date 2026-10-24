import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Share2, Bell, User } from 'lucide-react';

export const UserBottomNav: React.FC<{ unreadCount?: number }> = ({ unreadCount = 2 }) => {
  const navItems = [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Donors', to: '/app/donors', icon: Users },
    { label: 'Refer', to: '/app/referrals', icon: Share2 },
    { label: 'Alerts', to: '/app/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile', to: '/app/profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line-border shadow-lg safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-center relative transition-colors ${
                  isActive
                    ? 'text-brand-500 font-bold'
                    : 'text-ink-secondary hover:text-ink-main'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute -top-1.5 -right-2 bg-status-error text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] mt-1 leading-none tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
