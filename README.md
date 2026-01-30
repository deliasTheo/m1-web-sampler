# m1-web-sampler

Application web de sampler audio : chargement des presets depuis le backend, lecture des samples sur les pads, enregistrement et relecture de sons en local.

## Prérequis

- Node.js 14+
- Backend (m1-web-backend) lancé et accessible 

## Installation

```bash
npm install
```

## Lancer l’application en local

**Démarrer le frontend du sampler** :

```bash
npm start
```

Le serveur frontend écoute sur **http://localhost:8000**. Ouvrir cette URL dans le navigateur.

(Le script `npm start` exécute `node frontend-server.js`, qui sert les fichiers statiques et `index.html`.)

## Fonctionnalités implémentées

- **Chargement des presets** : liste des presets depuis l’API backend, sélection d’un preset, chargement des samples (Load All)
- **Lecture des samples** : grille de pads 4×4, clic ou raccourcis clavier (AZERTY) pour jouer les samples
- **Waveform et trim bars** : visualisation de la forme d’onde du sample sélectionné, réglage des barres pour jouer une portion du sample (Play / Espace)
- **Sauvegarde** : enregistrement du sample (ou de la zone définie par les trim bars) en fichier WAV sur la machine
- **Enregistrement** : enregistrement de sons avec le micro ; ces sons peuvent être rejoués dans le sampler **uniquement en local** (en mémoire pendant la session). Ils ne sont pas envoyés au backend ni stockés dans les presets côté API
- **Raccourcis clavier** : mapping AZERTY pour les pads (voir [GUIDE.md](GUIDE.md))

## Ce qui n’est pas fait côté backend

- **addSound** : il n’existe pas d’API pour ajouter un son à un preset. Les sons enregistrés dans le sampler restent en mémoire locale et ne sont pas persistés dans les presets du backend.

## Documentation utilisateur

Pour le détail de l’interface, des raccourcis et du dépannage, voir **[GUIDE.md](GUIDE.md)**.
