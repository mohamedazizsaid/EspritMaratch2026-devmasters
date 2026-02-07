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
    <Card className="h-full flex flex-col transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-ring">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <ImageWithFallback
            src={image}
            alt={`Image du cours ${title}`}
            className="h-full w-full object-cover"
          />
          <Badge 
            className="absolute top-3 left-3 bg-background/90 text-foreground hover:bg-background"
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
        <Button className="w-full" aria-label={`En savoir plus sur ${title}`}>
          En savoir plus
        </Button>
      </CardFooter>
    </Card>
  );
}
