import { Users, Target, Lightbulb, Award, Sparkles, CheckCircle2, HeartHandshake, ShieldCheck, Compass, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollReveal } from '../components/ScrollReveal';
import { useTranslation } from '../lib/i18n';

export function About() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Target,
      title: t('aboutPage.value1Title') || 'Excellence Pédagogique',
      description: t('aboutPage.value1Desc') || 'Des programmes rigoureux élaborés pour répondre aux exigences réelles du marché professionnel.',
      color: 'from-blue-500/15 to-indigo-500/15 text-blue-600 dark:text-blue-400',
    },
    {
      icon: HeartHandshake,
      title: t('aboutPage.value2Title') || 'Inclusion Universelle',
      description: t('aboutPage.value2Desc') || 'Une technologie adaptative conçue pour donner les mêmes chances d\'apprentissage à chaque profil.',
      color: 'from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Lightbulb,
      title: t('aboutPage.value3Title') || 'Innovation Continue',
      description: t('aboutPage.value3Desc') || 'Intégration de pointe de l\'intelligence artificielle, de la reconnaissance vocale et de l\'eye-tracking.',
      color: 'from-amber-500/15 to-orange-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      icon: Award,
      title: t('aboutPage.value4Title') || 'Certification Vérifiée',
      description: t('aboutPage.value4Desc') || 'Des compétences validées séance après séance et attestées par des certificats sécurisés infalsifiables.',
      color: 'from-purple-500/15 to-pink-500/15 text-purple-600 dark:text-purple-400',
    },
  ];

  const team = [
    {
      name: t('aboutPage.team1Name') || 'Dr. Amira Khemir',
      role: t('aboutPage.team1Role') || 'Directrice Pédagogique & Innovation',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      bio: t('aboutPage.team1Bio') || '15 ans d\'expérience dans l\'enseignement supérieur et l\'ingénierie des technologies éducatives.',
    },
    {
      name: t('aboutPage.team2Name') || 'Mehdi Ben Salem',
      role: t('aboutPage.team2Role') || 'Responsable IA & Accessibilité',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: t('aboutPage.team2Bio') || 'Expert en vision par ordinateur, modèles génératifs et interfaces homme-machine adaptatives.',
    },
    {
      name: t('aboutPage.team3Name') || 'Sonia Trabelsi',
      role: t('aboutPage.team3Role') || 'Coordinatrice Qualité & Certification',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      bio: t('aboutPage.team3Bio') || 'Pilote des standards d\'évaluation continue, conformité RGPD et validation des parcours certifiants.',
    },
    {
      name: t('aboutPage.team4Name') || 'Youssef Gharbi',
      role: t('aboutPage.team4Role') || 'Architecte Solutions Numériques',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      bio: t('aboutPage.team4Bio') || 'Spécialiste de la haute disponibilité et des architectures pédagogiques temps réel.',
    },
  ];

  const milestones = [
    { year: '2022', event: t('aboutPage.milestone1') || 'Lancement de l\'initiative FormaPro dédiée à la formation professionnelle hybride.' },
    { year: '2023', event: t('aboutPage.milestone2') || 'Intégration du module d\'accessibilité universelle et de la reconnaissance biométrique.' },
    { year: '2024', event: t('aboutPage.milestone3') || 'Déploiement du moteur d\'IA générative et assistance pédagogique adaptative.' },
    { year: '2025', event: t('aboutPage.milestone4') || 'Extension à l\'international et certification de plus de 15 000 professionnels.' },
    { year: '2026', event: t('aboutPage.milestone5') || 'Plateforme 2.0 unifiée avec traçabilité blockchain et audit continu.' },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5" />
              Notre Vision & Histoire
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {t('aboutPage.title') || 'Redéfinir l\'apprentissage pour chaque individu'}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t('aboutPage.subtitle') || 'FormaPro combine pédagogie de pointe, technologies d\'assistance et intelligence artificielle pour rendre la formation d\'excellence accessible à tous.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Mission Section ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            
            <ScrollReveal direction="left" className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Target className="h-4 w-4" />
                Notre Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {t('aboutPage.missionTitle') || 'Créer une passerelle concrète vers les compétences du futur'}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {t('aboutPage.missionP1') || 'Notre conviction profonde est que la formation ne doit pas être un parcours rigide ou exclusif. Chaque apprenant possède son rythme, ses méthodes et ses besoins spécifiques.'}
                </p>
                <p>
                  {t('aboutPage.missionP2') || 'En dotant les formateurs d\'outils analytiques avancés et les apprenants d\'interfaces adaptatives (commande vocale, eye-tracking, confort cognitif), nous transformons la transmission du savoir en une expérience stimulante.'}
                </p>
                <p>
                  {t('aboutPage.missionP3') || 'Chaque séance validée est une étape certifiable vers un avenir professionnel accompli.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-border/70 bg-card">
                  <span className="text-2xl font-black text-primary">100%</span>
                  <p className="text-xs font-semibold text-foreground mt-1">Inclusif & Universel</p>
                </div>
                <div className="p-4 rounded-xl border border-border/70 bg-card">
                  <span className="text-2xl font-black text-primary">98%</span>
                  <p className="text-xs font-semibold text-foreground mt-1">Satisfaction certifiée</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/70 group">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt={t('aboutPage.missionImgAlt') || 'Équipe professionnelle'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold tracking-wider uppercase text-primary-foreground/90">Engagement Collectif</p>
                  <p className="text-lg font-bold">Un écosystème centré sur l'humain et la réussite</p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── Values Section ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t('aboutPage.valuesTitle') || 'Nos Valeurs Fondatrices'}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('aboutPage.valuesSubtitle') || 'Les principes directeurs qui guident chaque développement et interaction au sein de notre communauté.'}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, idx) => (
              <ScrollReveal
                key={value.title}
                direction="up"
                delay={idx * 0.1}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${value.color}`}>
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Team Section ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t('aboutPage.teamTitle') || 'L\'Équipe Pédagogique & Technique'}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('aboutPage.teamSubtitle') || 'Des experts passionnés par la transmission de compétences et les technologies inclusives.'}
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, idx) => (
              <ScrollReveal
                key={member.name}
                direction="up"
                delay={idx * 0.12}
                className="group rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
              >
                <Avatar className="mx-auto mb-5 h-28 w-28 ring-4 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={member.image} alt={`Photo de ${member.name}`} className="object-cover" />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">{member.role}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Timeline Section ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t('aboutPage.timelineTitle') || 'Notre Parcours'}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t('aboutPage.timelineSubtitle') || 'Les grandes étapes de l\'évolution de la plateforme.'}
            </p>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-border" aria-hidden="true" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <ScrollReveal
                    key={index}
                    direction="left"
                    delay={index * 0.1}
                    className="relative flex items-center gap-6"
                  >
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-primary-foreground font-black text-lg shadow-lg shadow-primary/25 z-10">
                      {milestone.year}
                    </div>
                    <div className="flex-1 p-5 rounded-2xl border border-border/70 bg-card shadow-sm">
                      <p className="text-sm sm:text-base font-medium text-foreground">{milestone.event}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Global Stats Banner ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="rounded-3xl bg-gradient-to-r from-primary via-indigo-700 to-purple-800 px-8 py-16 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 tracking-tight text-white">
                  {t('aboutPage.statsTitle') || 'FormaPro en quelques chiffres clés'}
                </h2>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  <div>
                    <p className="text-4xl sm:text-5xl font-black mb-2">25,000+</p>
                    <p className="text-sm font-medium text-white/80">{t('aboutPage.statsStudents') || 'Apprenants formés'}</p>
                  </div>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black mb-2">150+</p>
                    <p className="text-sm font-medium text-white/80">{t('aboutPage.statsFormations') || 'Modules de formation'}</p>
                  </div>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black mb-2">200+</p>
                    <p className="text-sm font-medium text-white/80">{t('aboutPage.statsInstructors') || 'Formateurs agréés'}</p>
                  </div>
                  <div>
                    <p className="text-4xl sm:text-5xl font-black mb-2">98%</p>
                    <p className="text-sm font-medium text-white/80">{t('aboutPage.statsSatisfaction') || 'Taux de satisfaction'}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
