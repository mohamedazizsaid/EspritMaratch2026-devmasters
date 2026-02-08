import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export function Home() {
  const { t } = useTranslation();

  const courses = [
    {
      title: t('homePage.courseWebDev'),
      description: t('homePage.courseWebDevDesc'),
      image: 'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHByb2dyYW1taW5nfGVufDF8fHx8MTc3MDQwMTE4NXww&ixlib=rb-4.1.0&q=80&w=1080',
      duration: `12 ${t('homePage.weeks')}`,
      students: 2450,
      rating: 4.8,
      level: t('homePage.intermediate') as 'Intermédiaire' | 'Avancé' | 'Débutant',
      category: t('homePage.development'),
    },
    {
      title: t('homePage.courseDataScience'),
      description: t('homePage.courseDataScienceDesc'),
      image: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NzAyOTc5NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: `16 ${t('homePage.weeks')}`,
      students: 1890,
      rating: 4.9,
      level: t('homePage.advanced') as 'Intermédiaire' | 'Avancé' | 'Débutant',
      category: t('homePage.dataScience'),
    },
    {
      title: t('homePage.courseDesign'),
      description: t('homePage.courseDesignDesc'),
      image: 'https://images.unsplash.com/photo-1622784043149-82f7c74f8678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzcwMzk0MTk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: `10 ${t('homePage.weeks')}`,
      students: 3120,
      rating: 4.7,
      level: t('homePage.beginner') as 'Intermédiaire' | 'Avancé' | 'Débutant',
      category: t('homePage.design'),
    },
    {
      title: t('homePage.courseMarketing'),
      description: t('homePage.courseMarketingDesc'),
      image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwc3RyYXRlZ3l8ZW58MXx8fHwxNzcwMzgxMjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      duration: `8 ${t('homePage.weeks')}`,
      students: 2780,
      rating: 4.6,
      level: t('homePage.intermediate') as 'Intermédiaire' | 'Avancé' | 'Débutant',
      category: t('homePage.marketing'),
    },
  ];

  const testimonials = [
    {
      name: t('homePage.testimonial1Name'),
      role: t('homePage.testimonial1Role'),
      content: t('homePage.testimonial1Content'),
      rating: 5,
    },
    {
      name: t('homePage.testimonial2Name'),
      role: t('homePage.testimonial2Role'),
      content: t('homePage.testimonial2Content'),
      rating: 5,
    },
    {
      name: t('homePage.testimonial3Name'),
      role: t('homePage.testimonial3Role'),
      content: t('homePage.testimonial3Content'),
      rating: 5,
    },
  ];

  const stats = [
    { icon: Users, value: '25,000+', label: t('homePage.activeStudents') },
    { icon: BookOpen, value: '150+', label: t('homePage.availableCourses') },
    { icon: Award, value: '95%', label: t('homePage.satisfactionRate') },
    { icon: TrendingUp, value: '85%', label: t('homePage.successRate') },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20 md:py-32" role="region" aria-label={t('common.home')}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h1 className="mb-6">
                {t('homePage.heroTitle')}
              </h1>
              <p className="mb-8 text-xl text-muted-foreground">
                {t('homePage.heroSubtitle')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    {t('homePage.startFree')}
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {t('homePage.learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnRzJTIwbGFwdG9wfGVufDF8fHx8MTc3MDQxNzc3OXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t('homePage.heroImgAlt')}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 z-flow-grid">
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
            <h2 className="mb-4">{t('homePage.popularCourses')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('homePage.popularCoursesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 z-flow-grid">
            {courses.map((course) => (
              <CourseCard key={course.title} {...course} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/courses">
              <Button variant="outline" size="lg" className="gap-2">
                {t('homePage.viewAll')}
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
            <h2 className="mb-4">{t('homePage.testimonials')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('homePage.testimonialsDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 z-flow-grid">
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
              {t('homePage.ctaTitle')}
            </h2>
            <p className="mb-8 text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              {t('homePage.ctaDesc')}
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="gap-2"
              >
                {t('homePage.ctaButton')}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
