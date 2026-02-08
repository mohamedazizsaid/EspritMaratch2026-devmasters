import { Users, Target, Lightbulb, Award } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useTranslation } from '../lib/i18n';

export function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Target,
      title: t('aboutPage.value1Title'),
      description: t('aboutPage.value1Desc'),
    },
    {
      icon: Users,
      title: t('aboutPage.value2Title'),
      description: t('aboutPage.value2Desc'),
    },
    {
      icon: Lightbulb,
      title: t('aboutPage.value3Title'),
      description: t('aboutPage.value3Desc'),
    },
    {
      icon: Award,
      title: t('aboutPage.value4Title'),
      description: t('aboutPage.value4Desc'),
    },
  ];

  const team = [
    {
      name: t('aboutPage.team1Name'),
      role: t('aboutPage.team1Role'),
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      bio: t('aboutPage.team1Bio'),
    },
    {
      name: t('aboutPage.team2Name'),
      role: t('aboutPage.team2Role'),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: t('aboutPage.team2Bio'),
    },
    {
      name: t('aboutPage.team3Name'),
      role: t('aboutPage.team3Role'),
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      bio: t('aboutPage.team3Bio'),
    },
    {
      name: t('aboutPage.team4Name'),
      role: t('aboutPage.team4Role'),
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      bio: t('aboutPage.team4Bio'),
    },
  ];

  const milestones = [
    { year: '2018', event: t('aboutPage.milestone1') },
    { year: '2019', event: t('aboutPage.milestone2') },
    { year: '2020', event: t('aboutPage.milestone3') },
    { year: '2022', event: t('aboutPage.milestone4') },
    { year: '2024', event: t('aboutPage.milestone5') },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6">{t('aboutPage.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('aboutPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6">{t('aboutPage.missionTitle')}</h2>
              <p className="text-lg text-foreground mb-4">
                {t('aboutPage.missionP1')}
              </p>
              <p className="text-lg text-foreground mb-4">
                {t('aboutPage.missionP2')}
              </p>
              <p className="text-lg text-foreground">
                {t('aboutPage.missionP3')}
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMzg3NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t('aboutPage.missionImgAlt')}
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
            <h2 className="mb-4">{t('aboutPage.valuesTitle')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('aboutPage.valuesSubtitle')}
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
            <h2 className="mb-4">{t('aboutPage.teamTitle')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('aboutPage.teamSubtitle')}
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
            <h2 className="mb-4">{t('aboutPage.timelineTitle')}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('aboutPage.timelineSubtitle')}
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
            <h2 className="mb-12 text-primary-foreground">{t('aboutPage.statsTitle')}</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div>
                <p className="text-5xl font-bold mb-2">25,000+</p>
                <p className="text-primary-foreground/90">{t('aboutPage.statsStudents')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">150+</p>
                <p className="text-primary-foreground/90">{t('aboutPage.statsFormations')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">200+</p>
                <p className="text-primary-foreground/90">{t('aboutPage.statsInstructors')}</p>
              </div>
              <div>
                <p className="text-5xl font-bold mb-2">95%</p>
                <p className="text-primary-foreground/90">{t('aboutPage.statsSatisfaction')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
