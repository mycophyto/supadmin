
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TableField, createRecord, updateRecord } from '@/lib/supabase';
import { useTranslation } from '@/lib/translations';

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: string;
  fields: TableField[];
  record?: Record<string, any>;
  onSuccess: () => void;
}

export function FormModal({
  open,
  onOpenChange,
  tableName,
  fields,
  record,
  onSuccess
}: FormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form data with record values or empty values
  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      
      // Set default values for all fields
      fields.forEach(field => {
        // Skip primary key field if it's auto-generated
        if (field.isPrimaryKey && !record) {
          return;
        }
        
        if (record) {
          initialData[field.name] = record[field.name] || '';
        } else {
          initialData[field.name] = '';
        }
      });
      
      setFormData(initialData);
    }
  }, [open, fields, record]);
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      if (record) {
        // Update existing record
        const primaryKey = fields.find(f => f.isPrimaryKey)?.name || 'id';
        success = await updateRecord(tableName, record[primaryKey], formData);
      } else {
        // Create new record
        success = await createRecord(tableName, formData);
      }
      
      if (success) {
        onSuccess();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get visible fields (exclude auto-generated PKs for new records)
  const visibleFields = fields.filter(field => {
    if (!record && field.isPrimaryKey) {
      return false;
    }
    return true;
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-in scale-in">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {record ? t('editRecord') : t('addRecord')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {visibleFields.map(field => (
              <div key={field.name} className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor={field.name} className="text-right mt-2">
                  {field.name}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </Label>
                <div className="col-span-3">
                  {field.type === 'text' && field.name.includes('description') ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      disabled={field.isPrimaryKey}
                      required={field.required}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type === 'numeric' ? 'number' : field.type === 'timestamp' ? 'datetime-local' : 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      disabled={field.isPrimaryKey}
                      required={field.required}
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {field.type} {field.isPrimaryKey ? '(Primary Key)' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('loading') : record ? t('save') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
