
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
}

export function EditableCell({ value, onChange, type = 'text' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 animate-in slide-in">
        <Input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 py-1"
        />
        <div className="flex items-center">
          <button
            onClick={handleSave}
            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center">
      <div className={cn("flex-1 text-sm", !value && "text-muted-foreground italic")}>
        {value || 'Empty'}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="ml-2 p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full transition-all"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
