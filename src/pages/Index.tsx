
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Table2, 
  FileText, 
  Clock,
  BarChart 
} from 'lucide-react';
import { getDatabaseStats, getTables, setupDatabaseFunctions } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart as Chart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTables: 0,
    totalRecords: 0,
    storageUsed: '',
    lastUpdated: ''
  });
  
  const [tableStats, setTableStats] = useState<{ name: string; records: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      
      // Try to set up any required database functions
      await setupDatabaseFunctions();
      
      // Load database stats and tables
      const dbStats = await getDatabaseStats();
      setStats(dbStats);
      
      const tables = await getTables();
      setTableStats(tables.map(table => ({
        name: table.name,
        records: table.recordCount
      })));
      
      setIsLoading(false);
    };
    
    loadStats();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="p-6 pt-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(stats.lastUpdated)}
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Tables" 
                value={stats.totalTables} 
                icon={<Table2 className="h-5 w-5 text-primary" />} 
                isLoading={isLoading}
              />
              <StatCard 
                title="Total Records" 
                value={stats.totalRecords.toLocaleString()} 
                icon={<FileText className="h-5 w-5 text-primary" />} 
                isLoading={isLoading}
              />
              <StatCard 
                title="Storage Used" 
                value={stats.storageUsed} 
                icon={<Database className="h-5 w-5 text-primary" />} 
                isLoading={isLoading}
              />
              <StatCard 
                title="Last Activity" 
                value={formatDate(stats.lastUpdated).split(',')[0]} 
                description={formatDate(stats.lastUpdated).split(',')[1]} 
                icon={<Clock className="h-5 w-5 text-primary" />} 
                isLoading={isLoading}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-medium">
                    <BarChart className="h-5 w-5 mr-2" />
                    Records by Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoading ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <Chart
                          data={tableStats}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 30,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={(value) => 
                              value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value
                            }
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} records`, 'Records']}
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                          />
                          <Bar dataKey="records" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </Chart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg font-medium">
                    <Database className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="flex items-center">
                      <div className="mr-4 bg-primary/10 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">New record created</p>
                        <p className="text-xs text-muted-foreground">In table: users</p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">2 min ago</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-4 bg-amber-500/10 p-2 rounded-full">
                        <LayoutDashboard className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Table schema updated</p>
                        <p className="text-xs text-muted-foreground">In table: products</p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-4 bg-emerald-500/10 p-2 rounded-full">
                        <Database className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Records updated</p>
                        <p className="text-xs text-muted-foreground">In table: orders</p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">3 hours ago</div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-4 bg-destructive/10 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Records deleted</p>
                        <p className="text-xs text-muted-foreground">In table: categories</p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
