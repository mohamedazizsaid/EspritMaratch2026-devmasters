import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating: number;
}

export function TestimonialCard({ name, role, content, avatar, rating }: TestimonialCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="h-full rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
      <CardContent className="p-6 relative z-10">
        {/* Rating */}
        <div className="mb-4 flex gap-1" role="img" aria-label={`Note: ${rating} sur 5 étoiles`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? 'fill-warning text-warning' : 'fill-muted text-muted'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Content */}
        <blockquote className="mb-6 text-foreground">
          <p>"{content}"</p>
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatar} alt={`Photo de ${name}`} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
