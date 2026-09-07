import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CourseCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  students: number;
  rating: number;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  category: string;
}

export function CourseCard({
  title,
  description,
  image,
  duration,
  students,
  rating,
  level,
  category,
}: CourseCardProps) {
  return (
    <Card className="group h-full flex flex-col rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden">
          <div className="w-full h-full transform transition-transform duration-500 group-hover:scale-105">
            <ImageWithFallback
              src={image}
              alt={`Image du cours ${title}`}
              className="h-full w-full object-cover"
            />
          </div>
          <Badge 
            className="absolute top-3 left-3 bg-background/85 backdrop-blur-md text-foreground border border-border/60 hover:bg-background shadow-sm"
            aria-label={`Catégorie: ${category}`}
          >
            {category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge 
            variant="outline"
            aria-label={`Niveau: ${level}`}
          >
            {level}
          </Badge>
          <div className="flex items-center gap-1" role="img" aria-label={`Note: ${rating} sur 5 étoiles`}>
            <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>{students.toLocaleString()} étudiants</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        
      </CardFooter>
    </Card>
  );
}
