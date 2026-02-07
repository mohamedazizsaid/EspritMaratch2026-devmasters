import type { DriveStep } from 'driver.js';

// Tour steps for Instructor/Formateur role
export const instructorTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎉 Bienvenue sur votre tableau de bord Formateur!',
      description: 'Laissez-nous vous présenter rapidement les fonctionnalités principales pour gérer vos formations et vos étudiants.',
    },
  },
  {
    element: '[data-tour="stats-section"]',
    popover: {
      title: '📊 Statistiques',
      description: 'Visualisez en un coup d\'œil le nombre d\'étudiants, de formations, et le taux de progression global.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="formations-tab"]',
    popover: {
      title: '📚 Vos Formations',
      description: 'Retrouvez ici toutes vos formations. Cliquez sur une formation pour accéder aux niveaux et séances.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="students-tab"]',
    popover: {
      title: '👥 Vos Étudiants',
      description: 'Consultez la liste complète de vos étudiants avec leurs informations, statuts et progression.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="calendar-tab"]',
    popover: {
      title: '📅 Calendrier',
      description: 'Gérez votre agenda avec le calendrier des séances à venir pour mieux organiser votre temps.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="chatbot-tab"]',
    popover: {
      title: '🤖 Assistant IA',
      description: 'Utilisez l\'assistant IA pour créer des contenus pédagogiques, poser des questions sur vos formations ou obtenir de l\'aide.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: '✅ Vous êtes prêt!',
      description: 'Vous pouvez maintenant commencer à utiliser votre tableau de bord. Vous pouvez relancer ce guide à tout moment via le bouton Guide.',
    },
  },
];

// Tour steps for Manager/Responsable Formation role
export const managerTourSteps: DriveStep[] = [
  {
    popover: {
      title: '🎉 Bienvenue Responsable Formation!',
      description: 'Découvrez votre tableau de bord complet pour gérer les formations, les étudiants, les inscriptions et bien plus encore.',
    },
  },
  {
    element: '[data-tour="stats-section"]',
    popover: {
      title: '📊 Vue d\'ensemble',
      description: 'Suivez les indicateurs clés : nombre d\'étudiants, taux de complétion, formations actives et certifications délivrées.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="formations-tab"]',
    popover: {
      title: '📚 Gestion des Formations',
      description: 'Créez, modifiez et supprimez des formations. Gérez les niveaux, séances et contenus pédagogiques.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="students-tab"]',
    popover: {
      title: '👥 Gestion des Étudiants',
      description: 'Ajoutez, modifiez ou supprimez des étudiants. Consultez leurs profils et suivez leurs inscriptions.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="inscriptions-tab"]',
    popover: {
      title: '📝 Inscriptions',
      description: 'Gérez les inscriptions des étudiants aux formations. Suivez les statuts et validez les inscriptions.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="certifications-tab"]',
    popover: {
      title: '🏆 Certifications',
      description: 'Délivrez et gérez les certifications pour les formations complétées avec succès.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="analytics-tab"]',
    popover: {
      title: '📈 Analyses et Rapports',
      description: 'Visualisez des graphiques et statistiques détaillées pour prendre des décisions éclairées.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="chatbot-tab"]',
    popover: {
      title: '🤖 Assistant IA',
      description: 'L\'assistant intelligent vous aide à analyser les données, générer des rapports et répondre à vos questions.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title: '✅ Tout est prêt!',
      description: 'Vous avez maintenant toutes les cartes en main pour gérer efficacement vos formations. Bon travail!',
    },
  },
];
