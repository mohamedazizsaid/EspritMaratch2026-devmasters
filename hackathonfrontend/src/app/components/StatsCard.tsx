import { Card, CardContent } from './ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
      {/* Subtle ambient glow top right */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-primary/15 to-indigo-500/5 rounded-full blur-2xl group-hover:bg-primary/25 transition-all duration-500" />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90 mb-1.5 truncate">
              {title}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground mb-1">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
            {trend && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    trend.isPositive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  }`}
                  aria-label={`${trend.isPositive ? 'Augmentation' : 'Diminution'} de ${trend.value}`}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {trend.value}
                </span>
                <span className="text-xs text-muted-foreground/80">vs mois dernier</span>
              </div>
            )}
          </div>
          <div className="flex h-13 w-13 p-3 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-indigo-500/10 text-primary border border-primary/25 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
            <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

