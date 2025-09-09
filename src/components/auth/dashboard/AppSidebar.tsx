import { Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import OnelabLogo from "@/components/shared/OnelabLogo";

const AppSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  // Get user display name and email (commented out user profile section)
  // const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User';
  // const userEmail = user?.email || 'user@example.com';
  // const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';
  const isAdmin = user?.is_admin;

  const mainNavigation = [
    // { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "All Meetings", href: "/auth/meetings?view=all", icon: Users },
    { name: "My Meetings", href: "/auth/meetings?view=my", icon: Calendar },
  ];

  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (query) {
      const urlParams = new URLSearchParams(query);
      const currentParams = new URLSearchParams(location.search);
      return location.pathname === path && urlParams.get('view') === currentParams.get('view');
    }
    return location.pathname === href;
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-border flex flex-col shadow-sm`}>
      {/* Header with Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        {!isCollapsed && (
          <OnelabLogo size="lg" />
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <OnelabLogo size="lg" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center h-8 hover:bg-surface text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNavigation.map((item) => {
          if (!isAdmin && item.name === "All Meetings") {
            return null;
          }
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      {/* {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AppSidebar;