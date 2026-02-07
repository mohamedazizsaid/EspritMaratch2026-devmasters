import { Card, CardContent } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold mb-1">{value}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  }`}
                  aria-label={`${trend.isPositive ? 'Augmentation' : 'Diminution'} de ${trend.value}`}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
                <span className="text-sm text-muted-foreground">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
