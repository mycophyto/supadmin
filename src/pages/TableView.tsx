
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getTableSchema, 
  getTableData, 
  type TableField
} from '@/lib/supabase';
import { Sidebar } from '@/components/Sidebar';
import { DataTable } from '@/components/DataTable';
import { FormModal } from '@/components/FormModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlusCircle, Database, TableProperties } from 'lucide-react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

export default function TableView() {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  
  const [schema, setSchema] = useState<TableField[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    if (!tableName) return;
    
    const loadSchemaAndData = async () => {
      setIsLoading(true);
      
      try {
        // Load schema first
        const schemaData = await getTableSchema(tableName);
        setSchema(schemaData);
        
        // Then load table data
        const { data, count } = await getTableData(tableName, currentPage, pageSize);
        setData(data);
        setTotalCount(count);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchemaAndData();
  }, [tableName, currentPage, pageSize]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const refreshData = async () => {
    if (!tableName) return;
    
    setIsLoading(true);
    try {
      const { data, count } = await getTableData(tableName, currentPage, pageSize);
      setData(data);
      setTotalCount(count);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!tableName) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col items-center justify-center h-full">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Table not found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              The requested table does not exist
            </p>
            <Button onClick={() => navigate('/tables')}>
              Back to Tables
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <main className="p-6 pt-4">
          <div className="space-y-6">
            <div>
              <Breadcrumb className="mb-2">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/tables">Tables</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink>{tableName}</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/tables')}
                    className="mr-2 md:mr-4"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  {isLoading && !data.length ? (
                    <div>
                      <Skeleton className="h-8 w-48 mb-1" />
                      <Skeleton className="h-5 w-72" />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-3xl font-bold tracking-tight">{tableName}</h1>
                        <div className="ml-3 bg-muted px-2 py-1 rounded-md text-xs">
                          {totalCount.toLocaleString()} records
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        View and edit records
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <TableProperties className="h-4 w-4 mr-2" />
                    Table Schema
                  </Button>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </div>
            </div>
            
            <DataTable
              tableName={tableName}
              data={data}
              fields={schema}
              isLoading={isLoading}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onRefresh={refreshData}
              onAddNew={() => setIsFormOpen(true)}
            />
          </div>
        </main>
      </div>

      <FormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tableName={tableName}
        fields={schema}
        onSuccess={refreshData}
      />
    </div>
  );
}
