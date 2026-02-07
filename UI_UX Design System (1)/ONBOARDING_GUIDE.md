# Guide du système d'onboarding

## Vue d'ensemble

Le système d'onboarding/tutoriel guidé a été mis en place pour aider les nouveaux utilisateurs à découvrir les fonctionnalités principales de l'application selon leur rôle (Formateur ou Responsable Formation).

## Technologies utilisées

- **driver.js** : Bibliothèque légère pour créer des tours guidés interactifs
- **React hooks** : Pour gérer l'état et le cycle de vie du tour
- **LocalStorage** : Pour mémoriser si l'utilisateur a déjà vu le tutoriel

## Architecture

### Fichiers créés

```
src/
├── app/
│   ├── lib/
│   │   └── onboarding/
│   │       ├── useOnboardingTour.ts    # Hook React personnalisé
│   │       └── tourSteps.ts            # Définition des étapes du tour
│   └── pages/
│       └── dashboards/
│           ├── InstructorDashboard.tsx # Modifié
│           └── ManagerDashboard.tsx    # Modifié
├── styles/
│   └── onboarding.css                  # Styles personnalisés
└── main.tsx                            # Import des styles ajouté
```

### 1. Hook personnalisé : `useOnboardingTour`

Ce hook gère la logique du tour guidé :

```typescript
const { startTour, resetTour } = useOnboardingTour({
  steps: instructorTourSteps,           // Étapes du tour
  localStorageKey: 'instructor-tour-completed',  // Clé de stockage
  onComplete: () => {                   // Callback de fin
    toast.success('Guide terminé!');
  },
});
```

**Fonctionnalités :**
- Auto-démarrage au premier chargement
- Mémorisation de complétion via localStorage
- Possibilité de relancer manuellement
- Callback de fin personnalisable

### 2. Étapes du tour : `tourSteps.ts`

Deux configurations d'étapes sont définies :

#### Tour Formateur (`instructorTourSteps`)
1. Message de bienvenue
2. Section statistiques
3. Onglet Formations
4. Onglet Étudiants
5. Onglet Calendrier
6. Onglet Assistant IA
7. Barre de recherche
8. Message de fin

#### Tour Responsable Formation (`managerTourSteps`)
1. Message de bienvenue
2. Vue d'ensemble (statistiques)
3. Gestion des Formations
4. Bouton Nouvelle Formation
5. Gestion des Étudiants
6. Inscriptions
7. Certifications
8. Analyses et Rapports
9. Assistant IA
10. Message de fin

### 3. Attributs data-tour

Les éléments clés de l'interface sont marqués avec des attributs `data-tour` :

```jsx
<div data-tour="stats-section">
  {/* Statistiques */}
</div>

<TabsTrigger value="courses" data-tour="formations-tab">
  Mes formations
</TabsTrigger>
```

## Utilisation

### Démarrage automatique

Le tour se lance automatiquement la première fois qu'un utilisateur visite son tableau de bord. Il ne se relancera plus ensuite.

### Relancer manuellement

Un bouton "Guide" avec une icône d'aide est disponible dans l'en-tête :

```jsx
<Button
  variant="outline"
  size="sm"
  onClick={startTour}
  className="gap-2"
>
  <HelpCircle className="h-4 w-4" />
  Guide
</Button>
```

### Réinitialiser pour un utilisateur

Pour forcer le tour à se relancer (utile pour les tests), effacer l'entrée localStorage :

```javascript
localStorage.removeItem('instructor-tour-completed');
// ou
localStorage.removeItem('manager-tour-completed');
```

## Personnalisation

### Modifier les étapes

Éditer le fichier `src/app/lib/onboarding/tourSteps.ts` :

```typescript
export const instructorTourSteps: DriveStep[] = [
  {
    element: '[data-tour="mon-element"]',  // Sélecteur CSS
    popover: {
      title: '📊 Titre',                    // Titre avec emoji
      description: 'Description détaillée', // Texte explicatif
      side: 'bottom',                       // Position: top, bottom, left, right
      align: 'start',                       // Alignement: start, center, end
    },
  },
  // Ajouter d'autres étapes...
];
```

### Ajouter un nouvel élément au tour

1. Ajouter l'attribut `data-tour` à l'élément :
```jsx
<div data-tour="nouveau-element">
  {/* Contenu */}
</div>
```

2. Ajouter l'étape correspondante dans `tourSteps.ts` :
```typescript
{
  element: '[data-tour="nouveau-element"]',
  popover: {
    title: '✨ Nouvelle fonctionnalité',
    description: 'Description de la nouvelle fonctionnalité',
    side: 'bottom',
    align: 'start',
  },
}
```

### Personnaliser les styles

Éditer le fichier `src/styles/onboarding.css` pour modifier :
- Couleurs de fond
- Tailles de police
- Border radius
- Styles des boutons
- Positions et alignements

### Changer les textes des boutons

Dans `useOnboardingTour.ts`, modifier la configuration :

```typescript
const driverConfig: Config = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  steps: steps,
  nextBtnText: 'Suivant',      // Bouton suivant
  prevBtnText: 'Précédent',    // Bouton précédent
  doneBtnText: 'Terminer',     // Bouton de fin
  progressText: '{{current}} sur {{total}}',  // Texte de progression
  // ...
};
```

## Configuration avancée

### Désactiver le démarrage automatique

Si vous souhaitez que le tour ne démarre jamais automatiquement :

```typescript
// Dans useOnboardingTour.ts, commenter ou supprimer le useEffect de démarrage automatique
```

### Ajouter des conditions de démarrage

Modifier le hook pour ajouter des conditions :

```typescript
useEffect(() => {
  const hasCompletedTour = localStorage.getItem(localStorageKey) === 'completed';
  const isFirstVisit = !localStorage.getItem('has-visited-dashboard');
  
  if (!hasCompletedTour && isFirstVisit && steps.length > 0) {
    // Démarrer le tour
    localStorage.setItem('has-visited-dashboard', 'true');
    // ...
  }
}, []);
```

### Ajouter des analytics

Tracker les événements du tour :

```typescript
const driverConfig: Config = {
  // ...
  onHighlightStarted: (element) => {
    // Tracker l'étape visualisée
    analytics.track('tour_step_viewed', { step: element });
  },
  onDestroyed: () => {
    // Tracker la complétion
    analytics.track('tour_completed');
    localStorage.setItem(localStorageKey, 'completed');
    onComplete?.();
  },
};
```

## Bonnes pratiques

1. **Garder les tours courts** : 6-10 étapes maximum
2. **Utiliser des emojis** : Rend le tour plus visuel et engageant
3. **Descriptions claires** : Expliquer le "pourquoi", pas seulement le "quoi"
4. **Tester sur différentes tailles d'écran** : S'assurer que les popovers sont bien positionnés
5. **Mettre à jour avec les nouvelles fonctionnalités** : Maintenir le tour à jour

## Dépannage

### Le tour ne démarre pas

1. Vérifier que les éléments avec `data-tour` existent dans le DOM
2. Vérifier la console pour des erreurs JavaScript
3. Vérifier que localStorage n'a pas déjà la clé de complétion
4. Attendre que le DOM soit complètement chargé (délai de 800ms défini)

### Les popovers sont mal positionnés

1. Modifier la propriété `side` : 'top', 'bottom', 'left', 'right'
2. Modifier la propriété `align` : 'start', 'center', 'end'
3. Ajuster les styles CSS si nécessaire

### Styles incohérents

1. Vérifier que `onboarding.css` est bien importé dans `main.tsx`
2. Vérifier l'ordre d'import des CSS (doit être après les autres styles)
3. Utiliser des variables CSS personnalisées pour l'intégration avec le thème

## Support et documentation

- **Driver.js Documentation** : https://driverjs.com/
- **React Documentation** : https://react.dev/

## Évolutions futures possibles

- [ ] Ajouter des vidéos dans les étapes
- [ ] Permettre de passer le tour facilement
- [ ] Ajouter des "hints" (indices) après le tour
- [ ] Créer des tours contextuels pour des fonctionnalités spécifiques
- [ ] Ajouter un système de feedback après le tour
- [ ] Multi-langues support
- [ ] Tours conditionnels selon les permissions utilisateur
