# Multi-stage build pour NestJS
# Stage 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm ci

# Copier le reste du code source
COPY . .

# Build de production
RUN npm run build

# Stage 2 : Image finale légère
FROM node:20-alpine AS production

WORKDIR /app

# Définir l'environnement de production
ENV NODE_ENV=production

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier le build depuis le stage builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Utiliser un utilisateur non-root pour la sécurité
USER node

# Démarrer l'application
CMD ["node", "dist/main"]
