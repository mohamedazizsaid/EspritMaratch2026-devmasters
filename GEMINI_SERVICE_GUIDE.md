# Guide d'utilisation du Service Gemini - Assistant Intelligent

## Vue d'ensemble

Le service Gemini est un assistant intelligent conçu pour les formateurs et les responsables de formation. Il utilise l'API Google Gemini 2.5 Flash Lite pour fournir des conseils pédagogiques personnalisés basés sur le contexte de chaque utilisateur.

## Fonctionnalités principales

### 1. **Assistance pédagogique contextuelle**
- Pose de questions avec contexte automatique du formateur et de sa formation
- Prompt intelligent incluant le nom, rôle et email du formateur
- Suggestions pratiques et actionables

### 2. **Analyse d'images**
- Analyse de documents, tableaux, supports pédagogiques
- Recommandations basées sur le contenu analysé
- Support des images en base64 ou URL Cloudinary

### 3. **Upload et analyse d'images**
- Upload d'images vers Cloudinary
- Analyse automatique avec Gemini
- Intégration complète du workflow

### 4. **Historique de conversation**
- Sauvegarde automatique de tous les échanges
- Récupération de l'historique global ou par formation
- Suppression sécurisée des enregistrements

## Configuration requise

### Variables d'environnement

Configurer les variables suivantes dans le fichier `.env`:

```env
# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Installation des dépendances

Le projet nécessite les packages suivants (déjà inclus):
- `@google/generative-ai` - Client Gemini
- `cloudinary` - Service d'upload
- `@nestjs/platform-express` - Multer pour l'upload de fichiers

## Endpoints API

### 1. **POST /chatbot/ask** - Poser une question

**Description**: Envoie une question à l'assistant Gemini

**Authentification**: Requise (JWT Bearer Token)

**Body**:
```json
{
  "message": "Comment puis-je améliorer l'engagement de mes élèves?",
  "formationId": "60d5ec49c1234567890abc00",
  "context": "J'enseigne la programmation à des débutants"
}
```

**Réponse (200)**:
```json
{
  "reponse": "Basé sur votre expérience en tant que formateur, voici quelques suggestions pour améliorer l'engagement...",
  "metadata": {
    "formateur": "Prénom Nom",
    "formation": "Nom de la formation",
    "timestamp": "2025-07-30T10:30:00Z",
    "modelUsed": "gemini-2.5-flash"
  }
}
```

### 2. **POST /chatbot/analyze-image** - Analyser une image

**Description**: Analyse une image fournie en base64 ou URL

**Authentification**: Requise (JWT Bearer Token)

**Body**:
```json
{
  "message": "Analyse cette présentation pédagogique pour moi",
  "imageData": "https://cloudinary.com/image.jpg",
  "formationId": "60d5ec49c1234567890abc00"
}
```

**Réponse (200)**:
```json
{
  "analyse": "Cette présentation contient...",
  "recommandations": [
    "Améliorer la lisibilité des textes",
    "Ajouter plus d'exemples concrets",
    "Revérifier l'ordre des diapositives"
  ],
  "metadata": {
    "formateur": "Prénom Nom",
    "formation": "Nom de la formation",
    "timestamp": "2025-07-30T10:30:00Z",
    "modelUsed": "gemini-2.5-flash",
    "imageUrl": "https://cloudinary.com/image.jpg"
  }
}
```

### 3. **POST /chatbot/upload-and-analyze** - Upload et analyser une image

**Description**: Upload une image vers Cloudinary et la fait analyser par Gemini

**Authentification**: Requise (JWT Bearer Token)

**Content-Type**: multipart/form-data

**Parameters**:
- `image` (file, required): L'image à uploader
- `message` (query, required): Message d'accompagnement
- `formationId` (query, optional): ID de la formation

**Exemple cURL**:
```bash
curl -X POST http://localhost:3000/chatbot/upload-and-analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "message=Analyse cette photo du tableau"
```

### 4. **GET /chatbot/history** - Récupérer l'historique global

**Description**: Récupère les dernières conversations avec Gemini

**Authentification**: Requise (JWT Bearer Token)

**Query Parameters**:
- `limit` (optional, default: 20): Nombre de résultats maximum

**Réponse (200)**:
```json
[
  {
    "_id": "650f2c1a5c1234567890def0",
    "userMessage": "Comment améliorer la pédagogie?",
    "assistantResponse": "Voici quelques suggestions...",
    "type": "text",
    "modelUsed": "gemini-2.5-flash",
    "createdAt": "2025-07-30T10:30:00Z"
  }
]
```

### 5. **GET /chatbot/history/:formationId** - Historique par formation

**Description**: Récupère les conversations liées à une formation spécifique

**Authentification**: Requise (JWT Bearer Token)

**Path Parameters**:
- `formationId`: ID de la formation

**Query Parameters**:
- `limit` (optional, default: 20): Nombre de résultats maximum

### 6. **DELETE /chatbot/history/:recordId** - Supprimer un enregistrement

**Description**: Supprime un enregistrement de chat spécifique

**Authentification**: Requise (JWT Bearer Token)

**Path Parameters**:
- `recordId`: ID de l'enregistrement à supprimer

**Réponse (204)**: No Content

## Modèle Gemini utilisé

- **Modèle**: `gemini-2.5-flash`
- **Raison du choix**: 
  - Performance optimale pour les réponses rapides
  - Excellent pour l'analyse de texte et d'images
  - Coût-efficacité
  - Fiabilité et précision élevées

## Prompt système

Le service construit automatiquement un prompt contextuel pour chaque requête:

```
Tu es un assistant intelligent pour les formateurs et responsables de formation. 
Tu aides à améliorer les méthodes pédagogiques, l'organisation des formations et les stratégies d'enseignement.

Informations du formateur/responsable:
- Nom: [Nom du formateur]
- Rôle: [Formateurs/Admin/responsableformation]
- Email: [Email]

Informations sur la formation:
- Nom: [Nom de la formation]
- Description: [Description]
- Statut: [active/inactive]

Instructions:
- Réponds toujours en français
- Sois concis mais complet
- Fournis des conseils pratiques et actionnables
- [... autres instructions]
```

## Gestion des erreurs

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `GEMINI_API_KEY is not set` | Clé API manquante | Ajouter `GEMINI_API_KEY` au `.env` |
| `Utilisateur non trouvé` | User ID invalide | Vérifier le JWT token |
| `Format d'image invalide` | Image corrompue ou format incorrect | Utiliser JPEG/PNG en base64 ou URL valide |
| `Enregistrement non trouvé` | Mauvais ID de record | Vérifier l'ID de l'enregistrement |

## Exemples d'utilisation

### Exemple 1: Demander des conseils pédagogiques

```bash
curl -X POST http://localhost:3000/chatbot/ask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mes élèves n'"'"'arrivent pas à comprendre les boucles for. Comment puis-je expliquer cela plus simplement?",
    "formationId": "60d5ec49c1234567890abc00",
    "context": "Classe débutante en programmation Python"
  }'
```

### Exemple 2: Analyser une image de tableau

```bash
curl -X POST http://localhost:3000/chatbot/analyze-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Est-ce que mon explication au tableau est claire?",
    "imageData": "https://cloudinary.com/image123.jpg",
    "formationId": "60d5ec49c1234567890abc00"
  }'
```

### Exemple 3: Récupérer l'historique

```bash
curl -X GET "http://localhost:3000/chatbot/history?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes importantes

1. **Authentification**: Tous les endpoints nécessitent un JWT Bearer Token valide
2. **Confidentialité**: Les données de chat sont stockées sécurisément dans MongoDB
3. **Rate limiting**: Aucune limite actuellement, mais recommandé de l'implémenter en production
4. **Contexte intelligent**: Le service enrichit automatiquement chaque requête avec le contexte de l'utilisateur
5. **Historique**: Tous les échanges sont sauvegardés pour une meilleure UX

## Limitation actuelle

- Maximum 20 enregistrements par défaut dans l'historique (configurable via le paramètre `limit`)
- Images: Formats supportés - JPEG, PNG, GIF, WebP
- Taille maximale d'image: Dépend de Cloudinary (recommandé: < 10MB)
