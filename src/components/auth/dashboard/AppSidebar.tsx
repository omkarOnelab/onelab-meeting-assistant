import { Calendar, Users, Home } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import OnelabLogo from "@/components/shared/OnelabLogo";

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isAdmin = user?.is_admin;

  const mainNavigation = [
    { name: "Dashboard", href: "/auth/dashboard", icon: Home },
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
    <div className={`'w-64'} transition-all duration-300 bg-white border-r border-border flex flex-col shadow-sm`}>
      {/* Header with Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
          <OnelabLogo size="md" />        
      </div>
      {/* Toggle Button */}
      <div className="p-3"> 
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
                ${''}
              `}
            >
              <Icon className={`w-4 h-4 ${'mr-3'}`} />
              {<span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>


    </div>
  );
};

export default AppSidebar;