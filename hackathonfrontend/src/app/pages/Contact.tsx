import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contactPage.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contactPage.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contactPage.emailInvalid');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contactPage.subjectRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contactPage.messageRequired');
    } else if (formData.message.length < 10) {
      newErrors.message = t('contactPage.messageMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulation d'envoi
      console.log('Form submitted:', formData);
      toast.success(t('contactPage.successMessage'));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setErrors({});
    } else {
      toast.error(t('contactPage.errorMessage'));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t('contactPage.emailLabel'),
      value: 'contact@formapro.tn',
      href: 'mailto:contact@formapro.tn',
    },
    {
      icon: Phone,
      label: t('contactPage.phoneLabel'),
      value: '+216 72 123 456',
      href: 'tel:+21672123456',
    },
    {
      icon: MapPin,
      label: t('contactPage.addressLabel'),
      value: t('contactPage.addressValue'),
      href: null,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-6">{t('contactPage.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('contactPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contactPage.formTitle')}</CardTitle>
                  <CardDescription>
                    {t('contactPage.formSubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('contactPage.fullName')} <span className="text-destructive" aria-label={t('contactPage.required')}>*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        className={errors.name ? 'border-destructive' : ''}
                        placeholder={t('contactPage.namePlaceholder')}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-sm text-destructive" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t('contactPage.email')} <span className="text-destructive" aria-label={t('contactPage.required')}>*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={errors.email ? 'border-destructive' : ''}
                        placeholder={t('contactPage.emailPlaceholder')}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-sm text-destructive" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone (optional) */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('contactPage.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder={t('contactPage.phonePlaceholder')}
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        {t('contactPage.subject')} <span className="text-destructive" aria-label={t('contactPage.required')}>*</span>
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                        className={errors.subject ? 'border-destructive' : ''}
                        placeholder={t('contactPage.subjectPlaceholder')}
                      />
                      {errors.subject && (
                        <p id="subject-error" className="text-sm text-destructive" role="alert">
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {t('contactPage.message')} <span className="text-destructive" aria-label={t('contactPage.required')}>*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        aria-required="true"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        className={errors.message ? 'border-destructive' : ''}
                        rows={6}
                        placeholder={t('contactPage.messagePlaceholder')}
                      />
                      {errors.message && (
                        <p id="message-error" className="text-sm text-destructive" role="alert">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2">
                      <Send className="h-5 w-5" aria-hidden="true" />
                      {t('contactPage.sendButton')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('contactPage.contactInfoTitle')}</CardTitle>
                  <CardDescription>
                    {t('contactPage.contactInfoSubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">{info.label}</p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('contactPage.hoursTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contactPage.monFri')}</span>
                    <span className="font-medium">9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contactPage.sat')}</span>
                    <span className="font-medium">10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contactPage.sun')}</span>
                    <span className="font-medium">{t('contactPage.closed')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="mb-4">{t('contactPage.locationTitle')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('contactPage.locationSubtitle')}
            </p>
          </div>
          
          {/* Interactive Map */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.8787458953935!2d10.236334!3d36.752098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd34c8c0e6e6e5%3A0x1234567890abcdef!2sBen%20Arous%2C%20Tunisia!5e0!3m2!1sfr!2stn!4v1234567890"
            width="100%"
            height="500"
            style={{ border: 0, borderRadius: '0.5rem' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={t('contactPage.mapTitle')}
            aria-label={t('contactPage.mapAria')}
            className="rounded-lg"
          />
        </div>
      </section>
    </div>
  );
}
