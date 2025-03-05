import { FormModal } from '@/components/FormModal';
import { Sidebar } from '@/components/Sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { deleteRecord, getTableSchema, supabase } from '@/lib/supabase';
import {
  AlertCircle,
  ChevronLeft,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RecordDetail() {
  const { tableName, id } = useParams<{ tableName: string; id: string }>();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schema, setSchema] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    if (!tableName || !id) return;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get schema first
        const schemaData = await getTableSchema(tableName);
        setSchema(schemaData);
        
        // Fetch the specific record from Supabase
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setRecord(data);
      } catch (error) {
        console.error('Error loading record:', error);
        // Don't set record to null here, let the UI handle the error state
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [tableName, id]);
  
  const handleDelete = async () => {
    if (!tableName || !id) return;
    
    try {
      await deleteRecord(tableName, id);
      navigate(`/tables/${tableName}`);
    } catch (error) {
      console.error('Error deleting record:', error);
      // You might want to show an error toast here
    }
  };
  
  const handleEditSuccess = () => {
    // Reload the record after editing
    setIsLoading(true);
    // In a real implementation, you would re-fetch the record
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  if (!tableName || !id) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto p-6">
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Record not found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              The requested record does not exist
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
                    <BreadcrumbLink href={`/tables/${tableName}`}>{tableName}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink>Record {id.substring(0, 8)}...</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/tables/${tableName}`)}
                    className="mr-2 md:mr-4"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  {isLoading ? (
                    <div>
                      <Skeleton className="h-8 w-48 mb-1" />
                      <Skeleton className="h-5 w-72" />
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        Record Details
                      </h1>
                      <p className="text-muted-foreground mt-1">
                        Viewing record {id.substring(0, 8)}... from {tableName}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Record
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="json">JSON View</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Record Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={`skeleton-${index}`} className="flex flex-col space-y-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : record ? (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        {Object.entries(record).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {key}
                            </h3>
                            <div className="p-3 bg-muted/40 rounded-md">
                              {typeof value === 'boolean' ? (
                                <span className={value ? 'text-emerald-500' : 'text-rose-500'}>
                                  {value ? 'True' : 'False'}
                                </span>
                              ) : value === null ? (
                                <span className="text-muted-foreground italic">null</span>
                              ) : key.includes('date') || key.includes('_at') ? (
                                new Date(value as string).toLocaleString()
                              ) : (
                                <div className="break-all">{value as string}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Record not found</h3>
                        <p className="text-muted-foreground mt-1">
                          The requested record does not exist or has been deleted
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="json" className="space-y-4">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>JSON Representation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-64 w-full" />
                    ) : record ? (
                      <pre className="bg-muted/40 p-4 rounded-md overflow-auto text-sm">
                        {JSON.stringify(record, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Record not found</h3>
                        <p className="text-muted-foreground mt-1">
                          The requested record does not exist or has been deleted
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle>Modification History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton key={`history-skeleton-${index}`} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative pl-6 pb-6 before:absolute before:left-[7px] before:top-[5px] before:h-full before:w-[2px] before:bg-muted">
                          <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-primary"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Record updated</p>
                              <p className="text-sm text-muted-foreground">Price changed from $24.99 to $29.99</p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Today, 3:45 PM</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative pl-6 pb-6 before:absolute before:left-[7px] before:top-[5px] before:h-full before:w-[2px] before:bg-muted">
                          <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent-foreground"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Record updated</p>
                              <p className="text-sm text-muted-foreground">Status changed from 'pending' to 'active'</p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Yesterday, 10:23 AM</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative pl-6">
                          <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-accent-foreground"></div>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Record created</p>
                              <p className="text-sm text-muted-foreground">Initial record creation</p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>3 days ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="animate-in scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {record && (
        <FormModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          tableName={tableName}
          fields={schema}
          record={record}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
