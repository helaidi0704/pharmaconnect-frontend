# PharmaConnect Frontend

Interface web React pour la gestion des réclamations pharmaceutiques.

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 20.0.0
- npm >= 10.0.0
- Backend PharmaConnect en cours d'exécution sur http://localhost:3001

### Installation

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 📦 Scripts disponibles

```bash
npm run dev      # Lancer en mode développement
npm run build    # Build pour la production
npm run preview  # Prévisualiser le build de production
npm run lint     # Linter le code
```

## 🎨 Fonctionnalités

### ✅ Implémenté

- **Authentication**
  - Connexion / Inscription
  - Gestion de session JWT
  - Rafraîchissement automatique des tokens
  - Déconnexion

- **Dashboard**
  - Statistiques des réclamations
  - Graphiques (par statut et par type)
  - Vue d'ensemble

- **Gestion des réclamations**
  - Liste avec filtres (statut, type, priorité)
  - Pagination
  - Création de réclamation (pharmacies)
  - Visualisation des détails
  - Suppression (pharmacies, statut "créé" uniquement)

- **Navigation**
  - Menu responsive
  - Protection des routes
  - Redirection automatique

### 🚧 À développer

- Détails complets d'une réclamation
- Modification de réclamation
- Changement de statut (dépôt/labo)
- Gestion du stock (pharmacies)
- Chat en temps réel
- Notifications
- Upload de fichiers/photos
- Profil utilisateur
- Historique des modifications

## 🎯 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   └── Navbar.jsx      # Barre de navigation
├── contexts/           # Contextes React
│   └── AuthContext.jsx # Gestion de l'authentification
├── pages/              # Pages de l'application
│   ├── Login.jsx       # Page de connexion
│   ├── Register.jsx    # Page d'inscription
│   ├── Dashboard.jsx   # Tableau de bord
│   ├── ClaimsList.jsx  # Liste des réclamations
│   └── ClaimForm.jsx   # Formulaire de création
├── services/           # Services API
│   └── api.js          # Configuration axios
├── App.jsx             # Composant principal
└── main.jsx            # Point d'entrée
```

## 🔐 Rôles utilisateurs

### Pharmacie
- Créer des réclamations
- Voir ses réclamations
- Modifier/Supprimer (statut "créé" uniquement)
- Gérer son stock

### Gestionnaire de Dépôt
- Voir toutes les réclamations
- Changer le statut des réclamations
- Ajouter des notes

### Laboratoire
- Voir les réclamations le concernant
- Changer le statut
- Résoudre/Rejeter les réclamations

## 🎨 Technologies utilisées

- **React 18** - Framework UI
- **React Router** - Navigation
- **Material-UI (MUI)** - Composants UI
- **Axios** - Requêtes HTTP
- **Recharts** - Graphiques
- **Notistack** - Notifications toast
- **React Hook Form** - Gestion de formulaires
- **date-fns** - Manipulation de dates
- **Vite** - Build tool

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:3001/api
```

### Proxy API

Le fichier `vite.config.js` configure automatiquement un proxy vers le backend :

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

## 🧪 Tests

Pour tester l'application :

### 1. Créer un compte

- Allez sur http://localhost:3000/register
- Remplissez le formulaire
- Choisissez un rôle (Pharmacie, Dépôt, Laboratoire)
- Cliquez sur "S'inscrire"

### 2. Se connecter

- Email et mot de passe créés précédemment
- Vous serez redirigé vers le dashboard

### 3. Créer une réclamation (Pharmacie)

- Menu "Réclamations" > "Nouvelle réclamation"
- Remplissez le formulaire
- Soumettez

### 4. Visualiser les statistiques

- Tableau de bord
- Graphiques mis à jour en temps réel

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à :
- 📱 Mobile (< 600px)
- 📱 Tablette (600px - 960px)
- 💻 Desktop (> 960px)

## 🐛 Debugging

### Backend non accessible

Vérifiez que le backend tourne sur le port 3001 :
```bash
curl http://localhost:3001/health
```

### CORS Errors

Le backend doit autoriser les requêtes depuis http://localhost:3000.
Vérifiez la configuration CORS dans le backend.

### Token expiré

Le frontend rafraîchit automatiquement les tokens.
Si problème, videz le localStorage :
```javascript
localStorage.clear();
```

## 📝 Prochaines étapes

1. ✅ Implémenter la page de détails de réclamation
2. ✅ Ajouter le changement de statut pour dépôt/labo
3. ✅ Implémenter la gestion du stock
4. ✅ Ajouter le chat en temps réel (Socket.io)
5. ✅ Notifications en temps réel
6. ✅ Upload de photos/documents

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT
