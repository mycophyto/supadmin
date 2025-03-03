
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EditableCell } from '@/components/EditableCell';
import { 
  Plus, 
  Trash2, 
  Search,
  RefreshCw, 
  MoreHorizontal 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { updateRecord, deleteRecord } from '@/lib/supabase';
import { type TableField } from '@/lib/supabase';

interface DataTableProps {
  tableName: string;
  data: any[];
  fields: TableField[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onAddNew: () => void;
}

export function DataTable({
  tableName,
  data,
  fields,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onRefresh,
  onAddNew
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const handleCellChange = async (id: string, field: string, value: string) => {
    await updateRecord(tableName, id, { [field]: value });
    onRefresh();
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteRecord(tableName, id);
      onRefresh();
    }
  };
  
  // Filter visible columns (hide technical fields if needed)
  const visibleFields = fields.filter(field => !field.name.startsWith('_'));
  
  // Get the primary key field
  const primaryKeyField = fields.find(field => field.isPrimaryKey)?.name || 'id';
  
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleFields.map((field) => (
                  <TableHead key={field.name} className="whitespace-nowrap font-medium">
                    {field.name}
                    {field.isPrimaryKey && <span className="ml-1 text-xs text-muted-foreground">(PK)</span>}
                    {field.required && !field.isPrimaryKey && <span className="ml-1 text-xs text-muted-foreground">*</span>}
                  </TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    {visibleFields.map((field) => (
                      <TableCell key={`loading-${index}-${field.name}`}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleFields.length + 1} className="h-32 text-center text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row[primaryKeyField]} className="group">
                    {visibleFields.map((field) => (
                      <TableCell key={`${row[primaryKeyField]}-${field.name}`} className="py-2">
                        {field.isPrimaryKey ? (
                          <span className="text-sm font-medium">{row[field.name]}</span>
                        ) : (
                          <EditableCell
                            value={String(row[field.name] || '')}
                            onChange={(value) => handleCellChange(row[primaryKeyField], field.name, value)}
                            type={field.type === 'numeric' ? 'number' : field.type === 'timestamp' ? 'date' : 'text'}
                          />
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="w-12 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDelete(row[primaryKeyField])} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <Pagination className="justify-center py-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNumber: number;
              
              // Logic to display limited page numbers
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
