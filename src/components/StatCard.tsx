
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatCard({ title, value, description, icon, isLoading = false }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-24" />
                {description && <Skeleton className="h-4 w-16" />}
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">{value}</p>
                {description && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </>
            )}
          </div>
          <div>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
