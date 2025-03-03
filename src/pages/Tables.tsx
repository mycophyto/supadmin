
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTables, type TableInfo } from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  Database, 
  Plus, 
  Search, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Tables() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const loadTables = async () => {
      setIsLoading(true);
      try {
        const tablesData = await getTables();
        setTables(tablesData);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTables();
  }, []);
  
  // Filter tables based on search query
  const filteredTables = tables.filter(
    table => table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="p-6 pt-4">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
                <p className="text-muted-foreground mt-1">
                  Browse and manage your database tables
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Button className="sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading ? (
                // Skeleton loader for tables
                Array.from({ length: 8 }).map((_, index) => (
                  <Card key={`loading-${index}`} className="transition-all duration-300 hover:shadow-elevation">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-5 w-2/3 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full rounded-md" />
                    </CardFooter>
                  </Card>
                ))
              ) : filteredTables.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No tables found</h3>
                  <p className="text-muted-foreground mt-1">
                    {searchQuery ? 'Try with a different search term' : 'Create a new table to get started'}
                  </p>
                  
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              ) : (
                filteredTables.map((table) => (
                  <Card 
                    key={table.name} 
                    className="transition-all duration-300 hover:shadow-elevation group"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{table.name}</CardTitle>
                      <CardDescription>
                        {table.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {table.recordCount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Records
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <Link to={`/tables/${table.name}`}>
                          <span>View Table</span>
                          <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
