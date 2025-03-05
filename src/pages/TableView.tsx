import { DataTable } from '@/components/DataTable';
import { FormModal } from '@/components/FormModal';
import { Sidebar } from '@/components/Sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTableData,
  getTableSchema,
  type TableField
} from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';
import { useConfigStore } from '@/store/configStore';
import { ChevronLeft, Database, PlusCircle, TableProperties } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function TableView() {
  const { tableName } = useParams<{ tableName: string }>();
  const navigate = useNavigate();
  const { getTableDisplayName } = useConfigStore();
  const { t } = useTranslation();
  
  const [schema, setSchema] = useState<TableField[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!tableName) return;
    
    const loadSchemaAndData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load schema first
        const schemaData = await getTableSchema(tableName);
        setSchema(schemaData);
        
        // Then load table data
        const { data, total } = await getTableData(tableName, currentPage, pageSize);
        setData(data || []);
        setTotalCount(total || 0);
      } catch (err) {
        console.error('Error loading table data:', err);
        setError(err instanceof Error ? err.message : t('errorLoadingTable'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSchemaAndData();
  }, [tableName, currentPage, pageSize, t]);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const refreshData = async () => {
    if (!tableName) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, total } = await getTableData(tableName, currentPage, pageSize);
      setData(data || []);
      setTotalCount(total || 0);
    } catch (err) {
      console.error('Error refreshing table data:', err);
      setError(err instanceof Error ? err.message : t('errorLoadingTable'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const tableDisplayName = tableName ? getTableDisplayName(tableName) : '';
  
  if (!tableName) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col items-center justify-center h-full">
            <Database className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">{t('tableNotFound')}</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {t('tableNotFound')}
            </p>
            <Button onClick={() => navigate('/tables')}>
              {t('backToTables')}
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
                    <BreadcrumbLink href="/">{t('dashboard')}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/tables">{t('tables')}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink>{tableDisplayName}</BreadcrumbLink>
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
                  ) : error ? (
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-destructive">{tableDisplayName}</h1>
                      <p className="text-muted-foreground mt-1">
                        {error}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-3xl font-bold tracking-tight">{tableDisplayName}</h1>
                        <div className="ml-3 bg-muted px-2 py-1 rounded-md text-xs">
                          {totalCount.toLocaleString()} {t('recordsCount')}
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        {t('viewTable')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <TableProperties className="h-4 w-4 mr-2" />
                    {t('tableSchema')}
                  </Button>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t('addRecord')}
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
