import { Users, Target, Lightbulb, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function About() {
  const values = [
    {
      icon: Target,
      title: 'Excellence pédagogique',
      description: 'Nous nous engageons à fournir des formations de la plus haute qualité avec des contenus régulièrement mis à jour.',
    },
    {
      icon: Users,
      title: 'Accessibilité pour tous',
      description: 'Notre plateforme est conçue pour être accessible à tous, quel que soit le niveau ou le handicap.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation continue',
      description: 'Nous adoptons les dernières technologies et méthodes pédagogiques pour optimiser l\'apprentissage.',
    },
    {
      icon: Award,
      title: 'Réussite des étudiants',
      description: 'Notre priorité est votre succès. Nous vous accompagnons jusqu\'à l\'atteinte de vos objectifs.',
    },
  ];

  const team = [
    {
      name: 'Dr. Marie Dupont',
      role: 'Directrice Pédagogique',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      bio: '15 ans d\'expérience dans l\'enseignement supérieur et le e-learning.',
    },
    {
      name: 'Jean-Pierre Martin',
      role: 'Directeur Technique',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Expert en développement de plateformes éducatives accessibles.',
    },
    {
      name: 'Sophie Bernard',
      role: 'Responsable Qualité',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      bio: 'Spécialiste en accessibilité numérique et normes WCAG.',
    },
    {
      name: 'Thomas Rousseau',
      role: 'Responsable des Formateurs',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      bio: 'Coordination et accompagnement de notre équipe de 200+ formateurs.',
    },
  ];

  const milestones = [
    { year: '2018', event: 'Création de FormaPro avec 10 formations' },
    { year: '2019', event: '5,000 étudiants et certification WCAG 2.1 AA' },
    { year: '2020', event: 'Lancement de 50+ nouvelles formations' },
    { year: '2022', event: '15,000 étudiants diplômés' },
    { year: '2024', event: '25,000+ étudiants actifs et 150+ formations' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6">À propos de FormaPro</h1>
            <p className="text-xl text-muted-foreground">
              Depuis 2018, nous transformons l'éducation en ligne en rendant l'apprentissage 
              accessible, engageant et efficace pour tous.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6">Notre mission</h2>
              <p className="text-lg text-foreground mb-4">
                Chez FormaPro, nous croyons que l'éducation de qualité doit être accessible à tous, 
                partout et à tout moment. Notre mission est de démocratiser l'accès aux compétences 
                professionnelles à travers une plateforme d'apprentissage en ligne innovante et inclusive.
              </p>
              <p className="text-lg text-foreground mb-4">
                Nous collaborons avec des experts reconnus pour créer des formations pratiques 
                et certifiantes qui répondent aux besoins réels du marché du travail.
              </p>
              <p className="text-lg text-foreground">
                Notre engagement envers l'accessibilité WCAG 2.1 AA garantit que chaque apprenant, 
                quelles que soient ses capacités, peut profiter pleinement de nos formations.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMzg3NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Équipe de professionnels collaborant"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Nos valeurs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ces principes guident chacune de nos décisions et actions au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Notre équipe</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des experts passionnés dédiés à votre réussite.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="p-6">
                  <Avatar className="mx-auto mb-4 h-24 w-24">
                    <AvatarImage src={member.image} alt={`Photo de ${member.name}`} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4">Notre parcours</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une croissance constante depuis notre création.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 h-full w-0.5 bg-border" aria-hidden="true" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {milestone.year}
                    </div>
                    <div className="flex-1 pt-3">
                      <p className="text-lg">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
            <h2 className="mb-12 text-primary-foreground">FormaPro en chiffres</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <p className="text-5xl font-bold mb-2">25,000+</p>
                <p className="text-primary-foreground/90">Étudiants actifs</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">150+</p>
                <p className="text-primary-foreground/90">Formations</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">200+</p>
                <p className="text-primary-foreground/90">Formateurs experts</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">95%</p>
                <p className="text-primary-foreground/90">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
