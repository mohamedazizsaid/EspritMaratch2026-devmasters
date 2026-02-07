# Système de Notification des Retards des Formateurs

## Overview

Ce système vérifie automatiquement les retards des formateurs (supérieurs à 15 minutes) et leur envoie des notifications par email pour les alerter à prendre des mesures correctives.

## Architecture

### 1. Service de Mailing (`src/auth/mailing.service.ts`)
- **Nouvelle méthode**: `sendFormatorDelayNotification()`
- Envoie un email HTML au formateur avec:
  - Le nombre de minutes de retard
  - Le titre de la séance
  - Un message d'alerte pour contacter l'administration en cas d'absence

### 2. Service de Formation (`src/formation/formation.service.ts`)
- **Nouvelle méthode**: `checkFormatorDelay()`
- Cherche toutes les séances avec une date prévue
- Combine `date_prevue` + `heure_debut` pour calculer l'heure de démarrage exacte
- Vérifie si l'heure actuelle > heure de démarrage + 15 minutes
- Récupère les infos du formateur via la relation Niveau → Formation → id_formateur
- Envoie les notifications et retourne le nombre de notifications envoyées et d'erreurs

### 3. Contrôleur (`src/formation/formation.controller.ts`)
- **Nouvel endpoint**: `POST /formation/check-formator-delays`
- Déclenche manuellement la vérification des retards
- Retourne: `{ notified: number, errors: number }`

### 4. Scheduler (`src/formation/formation.scheduler.ts`)
- Exécute automatiquement `checkFormatorDelay()` toutes les **5 minutes**
- Facilement configurable pour d'autres intervalles (voir commentaires dans le fichier)
- Alternatives disponibles: quotidienne, hebdomadaire, etc.

## Utilisation

### Option 1: Vérification Manuelle via API

Déclencher la vérification des retards via un appel HTTP:

```bash
curl -X POST http://localhost:3000/formation/check-formator-delays \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "notified": 2,
  "errors": 0
}
```

### Option 2: Vérification Automatique (Scheduler)

Le système vérifie automatiquement les retards toutes les 5 minutes si activé dans `formation.scheduler.ts`.

**Pour désactiver le scheduler**: Commenter ou supprimer le décorateur `@Cron()` dans `formation.scheduler.ts`

## Configuration

### Email SMTP (Obligatoire)

Variables d'environnement requises dans `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password
SMTP_FROM_EMAIL=noreply@hackathon.com
```

### Intervalles de Vérification

Modifier `formation.scheduler.ts` pour changer la fréquence:

```typescript
// Toutes les 5 minutes (défaut)
@Cron(CronExpression.EVERY_5_MINUTES)

// Alternative: Chaque jour à 8h
@Cron('0 8 * * *')

// Alternative: Toutes les heures
@Cron(CronExpression.EVERY_HOUR)
```

## Entités Impliquées

```
Séance (seance.entity.ts)
├── date_prevue: Date
├── heure_debut: string (format "HH:MM")
└── id_niveau: Référence Niveau

Niveau (niveau.entity.ts)
└── id_formation: Référence Formation

Formation (formation.entity.ts)
└── id_formateur: Référence User

User (user.entity.ts)
├── email: string
├── nom: string
└── prenom: string
```

## Logique de Détection

La séance est considérée comme en retard si:

```
maintenant > date_prevue + heure_debut + 15 minutes
```

**Exemple**:
- Séance prévue: 10h00 le 7 février 2026
- Seuil d'alerte: 10h15
- Si maintenant ≥ 10h15 → Email envoyé

## Messages d'Email

### Sujet
`⚠️ Notification de retard - Action requise`

### Contenu

Le formateur reçoit un email avec:
1. **Notification du retard**: minutes de retard calculées
2. **Infos de la séance**: titre de la séance
3. **Actions requises**:
   - Contacter l'administration immédiatement en cas d'absence
   - Renseigner le statut de présence dans l'application

### Template HTML
Voir `src/auth/mailing.service.ts` - méthode `sendFormatorDelayNotification()`

## Gestion des Erreurs

Le système gère les cas suivants:

- ✅ Séances sans date_prevue → Ignorées
- ✅ Séances sans formateur → Logged mais ignorées
- ✅ Erreurs d'envoi d'email → Comptabilisées dans `errors`
- ✅ Mauvais format d'heure → Heure non prise en compte

## Logs

Les opérations génèrent des logs détaillés en format:

```
🕐 Démarrage de la vérification des retards...
📋 X séances trouvées avec date_prevue
📌 RETARD DETECTE: {formateur, email, seance, minutesDelay, date}
✅ Notification envoyée à FORMATEUR (email@example.com)
✨ Vérification terminée - N formateurs notifiés, E erreurs
```

## Intégrations Disponibles

Le système peut être déclenché par:

1. **Cron Jobs** (automatique, défaut)
2. **API REST** (manuel)
3. **Webhooks** (intégrations tierces possibles)
4. **Événements NestJS** (modules métier)

## Dépendances Ajoutées

```typescript
// Modules
ScheduleModule.forRoot()        // Configuration des cron jobs
AuthModule                       // Export du MailingService

// Packages (à installer si nécessaire)
@nestjs/schedule                 // Cron jobs
nodemailer                       // Emails
```

## Installation des Dépendances

Si `@nestjs/schedule` n'est pas installé:

```bash
npm install @nestjs/schedule
```

## Tests

### Test Manuel API

```bash
# Déclencher la vérification
curl -X POST http://localhost:3000/formation/check-formator-delays \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Sortie attendue:
# {"notified": 0, "errors": 0}  (si pas de retards)
# {"notified": 2, "errors": 0}  (si 2 formateurs en retard)
```

### Test des Variables d'Environnement

Vérifier que SMTP est correctement configuré:

```bash
# Dans les logs du démarrage
🔧 Initialisation du service SMTP...
Configuration: smtp.gmail.com:587 (secure: false)
```

## Troubleshooting

### Les emails ne sont pas envoyés

✅ Vérifier les variables d'environnement SMTP
✅ Vérifier que `SMTP_USER` et `SMTP_PASSWORD` sont corrects
✅ Pour Gmail, utiliser une "App Password", pas le mot de passe du compte

### Scheduler ne se déclenche pas

✅ Vérifier que `ScheduleModule.forRoot()` est importé dans `AppModule`
✅ Vérifier que `FormationScheduler` est un provider dans `FormationModule`
✅ Vérifier les logs du serveur pour voir si le scheduler s'est initialisé

### Pas de retards détectés

✅ Vérifier que les séances ont une `date_prevue` renseignée
✅ Vérifier le format de `heure_debut` (doit être "HH:MM")
✅ Vérifier que les séances ont un formateur associé (via nivau → formation)

## Futures Améliorations

- [ ] Mémoriser les retards pour éviter les doublons d'emails
- [ ] Ajouter des rapports de retards (dashboard admin)
- [ ] Configurable: délai avant notification (actuellement 15 min fixe)
- [ ] Escalade: 2e email après 30 min, contact admin après 45 min
- [ ] Webhook pour intégrations tierces
