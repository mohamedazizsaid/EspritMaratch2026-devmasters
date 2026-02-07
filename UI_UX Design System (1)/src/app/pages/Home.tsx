import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export function Home() {
  const courses = [
    {
      title: 'Développement Web Full-Stack',
      description: 'Apprenez à créer des applications web modernes avec React, Node.js et les meilleures pratiques du développement.',
      image: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc3MDQwMTE4NXww&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '12 semaines',
      students: 2450,
      rating: 4.8,
      level: 'Intermédiaire' as const,
      category: 'Développement',
    },
    {
      title: 'Data Science et Intelligence Artificielle',
      description: 'Maîtrisez Python, le machine learning et l\'analyse de données pour devenir un expert en data science.',
      image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzAyOTc5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '16 semaines',
      students: 1890,
      rating: 4.9,
      level: 'Avancé' as const,
      category: 'Data Science',
    },
    {
      title: 'Design Graphique et UX/UI',
      description: 'Créez des designs exceptionnels et des expériences utilisateur mémorables avec Adobe Creative Suite et Figma.',
      image: 'https://images.unsplash.com/photo-1622784043149-82f7c74f8678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzcwMzk0MTk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '10 semaines',
      students: 3120,
      rating: 4.7,
      level: 'Débutant' as const,
      category: 'Design',
    },
    {
      title: 'Marketing Digital et Stratégie',
      description: 'Développez vos compétences en marketing digital, SEO, réseaux sociaux et stratégie de contenu.',
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwc3RyYXRlZ3l8ZW58MXx8fHwxNzcwMzgxMjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: '8 semaines',
      students: 2780,
      rating: 4.6,
      level: 'Intermédiaire' as const,
      category: 'Marketing',
    },
  ];

  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'Développeuse Web',
      content: 'FormaPro m\'a permis de changer de carrière en 6 mois. Les cours sont excellents et les instructeurs sont très disponibles.',
      rating: 5,
    },
    {
      name: 'Thomas Dubois',
      role: 'Data Analyst',
      content: 'La qualité des formations et l\'accompagnement personnalisé font de FormaPro une plateforme exceptionnelle.',
      rating: 5,
    },
    {
      name: 'Marie Laurent',
      role: 'Designer UX/UI',
      content: 'J\'ai énormément progressé grâce aux projets pratiques et aux retours détaillés des formateurs.',
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, value: '25,000+', label: 'Étudiants actifs' },
    { icon: BookOpen, value: '150+', label: 'Cours disponibles' },
    { icon: Award, value: '95%', label: 'Taux de satisfaction' },
    { icon: TrendingUp, value: '85%', label: 'Taux de réussite' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h1 className="mb-6">
                Développez vos compétences avec FormaPro
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Plateforme de formation en ligne professionnelle et accessible. 
                Apprenez à votre rythme avec des experts et obtenez des certifications reconnues.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    Commencer gratuitement
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnRzJTIwbGFwdG9wfGVufDF8fHx8MTc3MDQxNzc3OXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Étudiants utilisant la plateforme de formation en ligne"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Nos formations populaires</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos cours les plus appréciés par nos étudiants et commencez votre parcours d'apprentissage dès aujourd'hui.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.title} {...course} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/courses">
              <Button variant="outline" size="lg" className="gap-2">
                Voir toutes les formations
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Ce que disent nos étudiants</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rejoignez des milliers d'apprenants satisfaits qui ont transformé leur carrière grâce à FormaPro.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
            <h2 className="mb-4 text-primary-foreground">
              Prêt à commencer votre parcours ?
            </h2>
            <p className="mb-8 text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Inscrivez-vous gratuitement et accédez à nos formations d'essai. 
              Aucune carte de crédit requise.
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
              >
                Créer un compte gratuit
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
