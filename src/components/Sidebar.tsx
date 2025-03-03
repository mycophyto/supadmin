
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Table2,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getTables, type TableInfo } from '@/lib/supabase';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useConfigStore } from '@/store/configStore';
import { useTranslation } from '@/lib/translations';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const location = useLocation();
  const { getTableDisplayName, language } = useConfigStore();
  const { t } = useTranslation();

  useEffect(() => {
    const loadTables = async () => {
      const tablesData = await getTables();
      setTables(tablesData);
    };
    
    loadTables();
  }, []);

  return (
    <div 
      className={cn(
        "h-screen border-r relative transition-all duration-300 ease-in-out bg-sidebar shadow-subtle z-30",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="py-6 px-4 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">AdminDB</span>
            </div>
          )}
          {collapsed && <Database className="h-6 w-6 text-primary mx-auto" />}
          
          <Button 
            onClick={() => setCollapsed(!collapsed)} 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-full p-1 hover:bg-sidebar-accent transition-all", 
              collapsed && "absolute -right-3 top-7 bg-background border"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 text-muted-foreground text-xs">
              <Globe className="h-3 w-3" />
              <span>{language === 'en' ? 'English' : 'Français'}</span>
            </div>
          </div>
        )}
        
        <ScrollArea className="flex-1 overflow-auto">
          <div className={cn("px-2 py-2", collapsed && "flex flex-col items-center")}>
            <nav className="space-y-1">
              <NavItem
                to="/"
                icon={<LayoutDashboard className="h-5 w-5" />}
                label={t('dashboard')}
                collapsed={collapsed}
                active={location.pathname === '/'}
              />
              
              <NavItem
                to="/tables"
                icon={<Table2 className="h-5 w-5" />}
                label={t('tables')}
                collapsed={collapsed}
                active={location.pathname === '/tables'}
              />
            </nav>
            
            {!collapsed && <Separator className="my-4" />}
            
            {!collapsed && tables.length > 0 && (
              <div className="mt-3">
                <div className="px-3 mb-2 text-xs font-medium text-muted-foreground">
                  {t('tables')}
                </div>
                <nav className="space-y-1">
                  {tables.map(table => (
                    <NavItem
                      key={table.name}
                      to={`/tables/${table.name}`}
                      icon={<Database className="h-4 w-4" />}
                      label={getTableDisplayName(table.name)}
                      collapsed={collapsed}
                      active={location.pathname === `/tables/${table.name}`}
                      count={table.recordCount}
                    />
                  ))}
                </nav>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className={cn("p-2 border-t", collapsed && "flex justify-center")}>
          <nav className="space-y-1">
            <NavItem
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label={t('settings')}
              collapsed={collapsed}
              active={location.pathname === '/settings'}
            />
            
            <NavItem
              to="/help"
              icon={<HelpCircle className="h-5 w-5" />}
              label={t('help')}
              collapsed={collapsed}
              active={location.pathname === '/help'}
            />
          </nav>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  count?: number;
}

function NavItem({ to, icon, label, collapsed, active, count }: NavItemProps) {
  const { t } = useTranslation();
  
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        collapsed && "justify-center px-2"
      )}
    >
      <span className={cn("shrink-0", collapsed ? "" : "mr-3")}>{icon}</span>
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
      {!collapsed && count !== undefined && (
        <span className="ml-auto bg-muted px-1.5 py-0.5 rounded-md text-xs font-medium">
          {count > 999 ? '999+' : count}
        </span>
      )}
    </NavLink>
  );
}
