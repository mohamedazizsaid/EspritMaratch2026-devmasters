import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { TestimonialCard } from '../components/TestimonialCard';
import { ScrollReveal } from '../components/ScrollReveal';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Shield,
  Eye,
  Mic,
  Brain,
  Play,
  Star,
  Zap,
  ArrowUpRight,
  Compass
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { formationApi, type FormationDetailed } from '../../services/formationApi';

export function Home() {
  const { t } = useTranslation();

  const [formations, setFormations] = useState<FormationDetailed[]>([]);
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalEleves: 0,
    totalFormateurs: 0,
    tauxReussite: 96,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await formationApi.getAllFormationsDetailed();
        setFormations(data.slice(0, 3));

        const totalFormations = data.length;
        const totalEleves = data.reduce((acc, f) => acc + (f.totalEleves || 0), 0);
        const totalSeances = data.reduce((acc, f) => acc + (f.totalSeances || 0), 0);
        const seancesValidees = data.reduce((acc, f) => acc + (f.seancesValidees || 0), 0);
        const tauxReussite = totalSeances > 0 ? Math.round((seancesValidees / totalSeances) * 100) : 96;

        let totalFormateurs = 12;
        try {
          const statsRes = await formationApi.getFormationStats();
          if (statsRes?.totalInstructors) {
            totalFormateurs = statsRes.totalInstructors;
          }
        } catch {
          // stats fallback
        }

        setStats({
          totalFormations: totalFormations || 8,
          totalEleves: totalEleves || 340,
          totalFormateurs,
          tauxReussite: tauxReussite || 96,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setStats({
          totalFormations: 12,
          totalEleves: 450,
          totalFormateurs: 18,
          tauxReussite: 98,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const defaultImages = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
  ];

  const features = [
    {
      icon: Brain,
      title: 'IA Pédagogique & Assistance',
      desc: 'Assistance intelligente en direct, suggestions adaptatives de révision et chatbot dédié pour chaque formation.',
      tag: 'Innovation IA',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      icon: Eye,
      title: 'Accessibilité Universelle',
      desc: 'Technologie d’eye-tracking, navigation par commande vocale et contrastes dynamiques pour tous les apprenants.',
      tag: 'Inclusion totale',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Shield,
      title: 'Présence & Sécurité Face-ID',
      desc: 'Validation biométrique sécurisée des présences en séance et certification infalsifiable avec QR code.',
      tag: 'Sécurité & Confiance',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      icon: TrendingUp,
      title: 'Parcours Modulaires par Niveaux',
      desc: 'Progression pas-à-pas avec déblocage séquentiel des séances et métriques de réussite en temps réel.',
      tag: 'Pédagogie active',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Profil Pédagogique Adapté',
      desc: 'Accédez à votre espace configuré avec vos préférences d’accessibilité (voix, eye-tracking, confort visuel).',
      icon: Users,
    },
    {
      step: '02',
      title: 'Séances Interactives & Pratiques',
      desc: 'Suivez vos modules par niveaux, validez vos présences instantanément et échangez avec l’assistant IA.',
      icon: BookOpen,
    },
    {
      step: '03',
      title: 'Certifications Officielles Sécurisées',
      desc: 'Complétez les séances requises et générez votre certificat officiel avec QR code vérifié et infalsifiable.',
      icon: Award,
    },
  ];

  const testimonials = [
    {
      name: t('homePage.testimonial1Name') || 'Sarah B.',
      role: t('homePage.testimonial1Role') || 'Formatrice Certifiée',
      content: t('homePage.testimonial1Content') || 'La plateforme a révolutionné ma façon d’animer les séances. Le suivi de présence et le dashboard sont d’une fluidité remarquable.',
      rating: 5,
    },
    {
      name: t('homePage.testimonial2Name') || 'Karim M.',
      role: t('homePage.testimonial2Role') || 'Responsable Formation',
      content: t('homePage.testimonial2Content') || 'L’accessibilité inclusive et le pilotage analytique nous permettent d’accompagner 100% de nos collaborateurs sans exception.',
      rating: 5,
    },
    {
      name: t('homePage.testimonial3Name') || 'Yasmine T.',
      role: t('homePage.testimonial3Role') || 'Étudiante Développeuse',
      content: t('homePage.testimonial3Content') || 'L’assistant vocal et la validation étape par étape rendent l’apprentissage motivant et extrêmement intuitif.',
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] -z-10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-secondary/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Action */}
            <ScrollReveal direction="up" duration={0.6} className="lg:col-span-7 text-left space-y-6">
              {/* Animated Live Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wide shadow-sm hover:bg-primary/15 transition-all cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plateforme de Formation Hybride & Inclusive</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Apprenez sans limites,{' '}
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  propulsé par l'IA
                </span>{' '}
                et l'accessibilité.
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Une expérience pédagogique complète combinant suivi en temps réel, commandes vocales, eye-tracking adaptatif et certifications numériques sécurisées.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2.5 px-7 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group">
                    Devenir Formateur
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-6 py-6 text-base border-border/80 hover:bg-muted/60 hover:-translate-y-0.5 transition-all">
                    Se connecter
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">4.9/5</span>
                  <span>(500+ avis vérifiés)</span>
                </div>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Conforme normes RGPD & WCAG 2.1</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Right Column: High-tech Interactive Preview Card */}
            <ScrollReveal direction="zoom" delay={0.2} duration={0.7} className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Glass Showcase Box */}
                <div className="relative rounded-2xl border border-border/80 bg-card/90 p-6 shadow-2xl backdrop-blur-md transition-all hover:shadow-primary/10 hover:border-primary/40">
                  
                  {/* Top Bar simulating session status */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-primary-foreground font-bold shadow-md">
                        FP
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Session Pédagogique Active</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          En direct · Niveau 2 / Séance 4
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                      IA Active
                    </span>
                  </div>

                  {/* Course Graphic representation */}
                  <div className="relative rounded-xl overflow-hidden aspect-video mb-5 shadow-inner">
                    <img
                      src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                      alt="Interface de formation"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-xs font-medium text-primary-foreground/80">Architecture Web Moderne</span>
                      <p className="font-semibold text-sm">Validation des compétences en direct</p>
                    </div>
                  </div>

                  {/* Live Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Progression de la formation</span>
                      <span className="text-primary font-bold">85%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-primary to-indigo-500 rounded-full" />
                    </div>
                  </div>

                  {/* Active features pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/60 border border-border/40">
                      <Eye className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-foreground">Eye-Tracking OK</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/60 border border-border/40">
                      <Mic className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-foreground">Assistant Vocal</span>
                    </div>
                  </div>
                </div>

                {/* Floating Certificate Badge */}
                <div className="absolute -bottom-6 -left-6 rounded-xl border border-border/80 bg-background/95 p-3.5 shadow-xl backdrop-blur-md flex items-center gap-3 animate-bounce [animation-duration:5s]">
                  <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Certificat Validé</p>
                    <p className="text-[11px] text-muted-foreground">Signature QR vérifiable</p>
                  </div>
                </div>

                {/* Floating Active Learners Badge */}
                <div className="absolute -top-5 -right-5 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="Apprenant" />
                    <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="Apprenant" />
                    <img className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="Apprenant" />
                  </div>
                  <span className="text-xs font-semibold text-foreground">+24 en ligne</span>
                </div>

              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── Real-Time Stats Strip (Scroll Animated) ─────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/40 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            
            <ScrollReveal direction="up" delay={0.1} className="text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {stats.totalEleves}+
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Apprenants Inscrits</p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2} className="text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-transform group-hover:scale-110">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {stats.totalFormations}
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Formations Disponibles</p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3} className="text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
                <Award className="h-6 w-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {stats.totalFormateurs}
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Formateurs Experts</p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4} className="text-center group">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {stats.tauxReussite}%
              </p>
              <p className="text-sm text-muted-foreground font-medium mt-1">Taux de Réussite Global</p>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── Innovation Pillars / Features Grid (Scroll Animated) ─────────────── */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="h-3.5 w-3.5" />
              Avantages Clés
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Une technologie conçue pour propulser votre réussite
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Découvrez les piliers d'une plateforme qui réinvente l'apprentissage professionnel moderne en combinant intelligence artificielle et inclusion.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 0.1}
                className="group relative rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 flex flex-col justify-between"
              >
                <div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <feat.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-primary mb-1 block">
                    {feat.tag}
                  </span>
                  <h3 className="text-lg font-bold text-foreground mb-2.5">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Workflow Section (Scroll Animated) ──────────────────────────────── */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Comment ça fonctionne ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Un parcours clair et structuré en 3 étapes simples vers votre montée en compétences.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((step, idx) => (
              <ScrollReveal
                key={idx}
                direction="up"
                delay={idx * 0.15}
                className="relative bg-card rounded-2xl border border-border/60 p-8 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-primary/30 tracking-tight">
                    {step.step}
                  </span>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Formations Catalogue Preview (Scroll Animated) ──────────────────── */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Explorez l'excellence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-1">
                Formations populaires à l'affiche
              </h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Des programmes complets, dispensés par des formateurs certifiés et validés par des séances pratiques.
              </p>
            </div>

            <Link to="/login">
              <Button variant="outline" className="gap-2 font-semibold self-start md:self-auto">
                Consulter tout le catalogue
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </ScrollReveal>

          {/* Formations Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-16 text-muted-foreground flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Chargement des formations disponibles...</span>
              </div>
            ) : formations.length === 0 ? (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                Aucune formation active trouvée pour le moment.
              </div>
            ) : (
              formations.map((formation, index) => (
                <ScrollReveal key={formation._id} direction="up" delay={index * 0.12} className="transition-transform duration-300 hover:-translate-y-1">
                  <CourseCard
                    title={formation.nom_formation}
                    description={formation.description || 'Formation professionnelle de haute qualité avec suivi individuel.'}
                    image={defaultImages[index % defaultImages.length]}
                    duration={`${formation.totalNiveaux || 1} niveaux · ${formation.totalSeances || 4} séances`}
                    students={formation.totalEleves || 15}
                    rating={formation.seancesValidees && formation.totalSeances ? Math.round((formation.seancesValidees / formation.totalSeances) * 50) / 10 : 4.8}
                    level={formation.totalNiveaux >= 3 ? 'Avancé' : formation.totalNiveaux === 2 ? 'Intermédiaire' : 'Débutant'}
                    category={formation.statut === 'active' ? 'Active' : 'Certifiante'}
                  />
                </ScrollReveal>
              ))
            )}
          </div>

        </div>
      </section>

      {/* ─── Testimonials Section (Scroll Animated) ──────────────────────────── */}
      <section className="py-20 bg-muted/40 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Ce que disent nos utilisateurs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Retours d'expérience authentiques d'apprenants et formateurs qui transforment leur quotidien avec FormaPro.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.15} className="transition-all hover:shadow-lg">
                <TestimonialCard {...testimonial} />
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ─── High-Conversion CTA Banner (Scroll Animated) ────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom" duration={0.65}>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-indigo-700 to-purple-800 px-6 py-16 sm:px-12 sm:py-20 text-center shadow-2xl text-white">
              
              {/* Ambient pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  Rejoignez la nouvelle ère de la formation
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Prêt à digitaliser et sublimer vos parcours d'apprentissage ?
                </h2>

                <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Rejoignez dès aujourd'hui des centaines de formateurs et d'étudiants sur notre plateforme interactive certifiée.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                      Créer un compte Formateur
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>

                  <Link to="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/50 text-white hover:bg-white/10 hover:-translate-y-0.5 font-semibold px-8 py-6 transition-all">
                      Se connecter
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
