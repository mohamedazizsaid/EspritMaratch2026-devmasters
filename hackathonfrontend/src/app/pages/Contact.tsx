import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';
import { toast } from 'sonner';
import { useTranslation } from '../lib/i18n';

export function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contactPage.nameRequired') || 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contactPage.emailRequired') || 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contactPage.emailInvalid') || 'Format d\'email invalide';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contactPage.subjectRequired') || 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contactPage.messageRequired') || 'Le message est requis';
    } else if (formData.message.length < 10) {
      newErrors.message = t('contactPage.messageMinLength') || 'Le message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success(t('contactPage.successMessage') || 'Votre message a été envoyé avec succès! Notre équipe vous répondra sous 24h.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setErrors({});
      }, 800);
    } else {
      toast.error(t('contactPage.errorMessage') || 'Veuillez renseigner tous les champs obligatoires.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contactPage.emailLabel') || 'Email de contact',
      value: 'contact@formapro.tn',
      href: 'mailto:contact@formapro.tn',
      badge: 'Réponse sous 24h',
    },
    {
      icon: Phone,
      label: t('contactPage.phoneLabel') || 'Téléphone support',
      value: '+216 72 123 456',
      href: 'tel:+21672123456',
      badge: 'Du Lun au Ven',
    },
    {
      icon: MapPin,
      label: t('contactPage.addressLabel') || 'Siège & Campus',
      value: t('contactPage.addressValue') || 'Technopôle Ghazela / ESPRIT, Tunis, Tunisie',
      href: null,
      badge: 'Accueil sur RDV',
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden">
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[130px] -z-10 rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Échangez avec nous
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {t('contactPage.title') || 'Contactez notre équipe pédagogique'}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {t('contactPage.subtitle') || 'Une question sur nos parcours, nos technologies d\'accessibilité ou un partenariat ? Nous sommes là pour vous accompagner.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Contact Section ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-background border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            
            {/* Contact Form */}
            <ScrollReveal direction="up" className="lg:col-span-7">
              <Card className="border-border/80 shadow-xl backdrop-blur-md bg-card/95">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {t('contactPage.formTitle') || 'Envoyez-nous un message'}
                  </CardTitle>
                  <CardDescription>
                    {t('contactPage.formSubtitle') || 'Remplissez ce formulaire et notre équipe vous recontactera rapidement.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('contactPage.fullName') || 'Nom complet'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={errors.name ? 'border-destructive' : ''}
                        placeholder={t('contactPage.namePlaceholder') || 'Votre nom et prénom'}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive font-medium">{errors.name}</p>
                      )}
                    </div>

                    {/* Email & Phone grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {t('contactPage.email') || 'Email professionnel'} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={errors.email ? 'border-destructive' : ''}
                          placeholder={t('contactPage.emailPlaceholder') || 'vous@exemple.com'}
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive font-medium">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">{t('contactPage.phone') || 'Téléphone (optionnel)'}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder={t('contactPage.phonePlaceholder') || '+216 -- --- ---'}
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        {t('contactPage.subject') || 'Objet du message'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        className={errors.subject ? 'border-destructive' : ''}
                        placeholder={t('contactPage.subjectPlaceholder') || 'Renseignements, inscription, assistance...'}
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive font-medium">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t('contactPage.message') || 'Votre message'} <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        className={errors.message ? 'border-destructive' : ''}
                        rows={5}
                        placeholder={t('contactPage.messagePlaceholder') || 'Décrivez votre demande en détail...'}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive font-medium">{errors.message}</p>
                      )}
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 font-semibold shadow-md" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t('contactPage.sendButton') || 'Envoyer le message'}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Contact Info & Hours */}
            <ScrollReveal direction="up" delay={0.2} className="lg:col-span-5 space-y-6">
              <Card className="border-border/80 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{t('contactPage.contactInfoTitle') || 'Nos Coordonnées'}</CardTitle>
                  <CardDescription>
                    {t('contactPage.contactInfoSubtitle') || 'Plusieurs canaux directs à votre disposition'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4 p-3.5 rounded-xl border border-border/60 bg-muted/30">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground">{info.label}</p>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {info.badge}
                          </span>
                        </div>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium break-all block mt-0.5"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Hours Card */}
              <Card className="border-border/80 shadow-lg bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t('contactPage.hoursTitle') || 'Horaires de disponibilité'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">{t('contactPage.monFri') || 'Lundi – Vendredi'}</span>
                    <span className="font-semibold text-foreground">08h30 – 18h00</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">{t('contactPage.sat') || 'Samedi'}</span>
                    <span className="font-semibold text-foreground">09h00 – 13h00</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">{t('contactPage.sun') || 'Dimanche'}</span>
                    <span className="font-medium text-destructive">{t('contactPage.closed') || 'Fermé'}</span>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── Map Section ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30 border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up" className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
              {t('contactPage.locationTitle') || 'Notre Implantation'}
            </h2>
            <p className="text-muted-foreground">
              {t('contactPage.locationSubtitle') || 'Venez échanger avec nos conseillers pédagogiques dans nos locaux.'}
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="zoom" delay={0.1}>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border/70">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.8787458953935!2d10.236334!3d36.752098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd34c8c0e6e6e5%3A0x1234567890abcdef!2sBen%20Arous%2C%20Tunisia!5e0!3m2!1sfr!2stn!4v1234567890"
                width="100%"
                height="440"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contactPage.mapTitle') || 'Carte de localisation'}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
