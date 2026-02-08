import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { formationApi, type FormationDetailed } from '../../services/formationApi';

export function Home() {
  const { t } = useTranslation();

  const [formations, setFormations] = useState<FormationDetailed[]>([]);
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalEleves: 0,
    totalFormateurs: 0,
    tauxReussite: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await formationApi.getAllFormationsDetailed();
        setFormations(data.slice(0, 3));

        // Calculer les stats réelles
        const totalFormations = data.length;
        const totalEleves = data.reduce((acc, f) => acc + (f.totalEleves || 0), 0);
        const totalSeances = data.reduce((acc, f) => acc + (f.totalSeances || 0), 0);
        const seancesValidees = data.reduce((acc, f) => acc + (f.seancesValidees || 0), 0);
        const tauxReussite = totalSeances > 0 ? Math.round((seancesValidees / totalSeances) * 100) : 0;

        const statsRes = await formationApi.getFormationStats();

        setStats({
          totalFormations,
          totalEleves,
          totalFormateurs: statsRes.totalInstructors,
          tauxReussite,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Images par défaut pour les formations
  const defaultImages = [
    'https://images.unsplash.com/photo-1593720213681-e9a8778330a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1622784043149-82f7c74f8678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
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

  const statsDisplay = [
    { icon: Users, value: `${stats.totalEleves}`, label: t('homePage.activeStudents') },
    { icon: BookOpen, value: `${stats.totalFormations}`, label: t('homePage.availableCourses') },
    { icon: Award, value: `${stats.totalFormateurs}`, label: t('homePage.satisfactionRate') },
    { icon: TrendingUp, value: `${stats.tauxReussite}%`, label: t('homePage.successRate') },
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
            {statsDisplay.map((stat) => (
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 z-flow-grid">
            {loading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Chargement des formations...
              </div>
            ) : formations.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucune formation disponible pour le moment.
              </div>
            ) : (
              formations.map((formation, index) => (
                <CourseCard
                  key={formation._id}
                  title={formation.nom_formation}
                  description={formation.description || 'Formation professionnelle'}
                  image={defaultImages[index % defaultImages.length]}
                  duration={`${formation.totalNiveaux || 0} niveaux · ${formation.totalSeances || 0} séances`}
                  students={formation.totalEleves || 0}
                  rating={formation.seancesValidees && formation.totalSeances ? Math.round((formation.seancesValidees / formation.totalSeances) * 50) / 10 : 4.5}
                  level={formation.totalNiveaux >= 3 ? 'Avancé' : formation.totalNiveaux === 2 ? 'Intermédiaire' : 'Débutant'}
                  category={formation.statut === 'active' ? 'Active' : 'Inactive'}
                />
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/Login">
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
   
    </div>
  );
}
