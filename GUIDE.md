# Guide d'Utilisation - Audio Sampler Web 🎵

## Table des Matières

1. [Installation](#installation)
2. [Démarrage](#démarrage)
3. [Interface Utilisateur](#interface-utilisateur)
4. [Utilisation Basique](#utilisation-basique)
5. [Fonctionnalités Avancées](#fonctionnalités-avancées)
6. [Raccourcis Clavier](#raccourcis-clavier)
7. [Résolution de Problèmes](#résolution-de-problèmes)
8. [FAQ](#faq)

---

## Installation

### Prérequis

- **Node.js 14+** installé sur votre système
- Un **navigateur moderne** (Chrome, Firefox, Edge - dernières versions)
- Fichiers audio au format WAV (recommandé) ou tout format supporté par Web Audio API

### Étapes d'Installation

1. **Télécharger le projet**
   ```bash
   git clone [url-du-projet]
   # ou extraire l'archive ZIP
   ```

2. **Installer les dépendances du serveur**
   ```bash
   cd server
   npm install
   ```

3. **Préparer les fichiers audio**
   
   Créez un dossier `presets` dans le répertoire `server/` :
   ```
   server/
   └── presets/
       ├── 808/
       │   ├── Kick 808X.wav
       │   ├── Snare 808 1.wav
       │   └── ...
       ├── 909/
       │   └── ...
       └── acoustic/
           └── ...
   ```

---

## Démarrage

### 1. Démarrer le Serveur REST

Dans le dossier `server/` :
```bash
npm start
```

Le serveur démarre sur **http://localhost:3000**

Vous devriez voir :
```
========================================
Audio Sampler Web - Serveur REST
========================================
Serveur démarré sur: http://localhost:3000
API Presets: http://localhost:3000/api/presets
Fichiers audio: http://localhost:3000/presets/
========================================
✓ Dossier presets trouvé
```

### 2. Ouvrir l'Application

**Option A : Ouvrir directement le fichier HTML**
- Double-cliquer sur `index.html`
- Fonctionne avec certains navigateurs (Chrome peut avoir des restrictions CORS)

**Option B : Utiliser un serveur local (recommandé)**

Avec Python 3 :
```bash
python -m http.server 8000
```

Avec Node.js :
```bash
npx http-server -p 8000
```

Puis ouvrez **http://localhost:8000** dans votre navigateur

---

## Interface Utilisateur

### Vue d'Ensemble

L'interface est divisée en plusieurs sections :

```
┌─────────────────────────────────────────┐
│         Audio Sampler Web               │
├─────────────────────────────────────────┤
│ Preset: [▼ Sélectionner]  [Load All]   │
├─────────────────────────────────────────┤
│                                         │
│         Visualisation Waveform          │
│         + Trim Bars                     │
│                                         │
│         [Play] [Save]                   │
├─────────────────────────────────────────┤
│                                         │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│    │ 13│ │ 14│ │ 15│ │ 16│   Ligne 4  │
│    └───┘ └───┘ └───┘ └───┘            │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│    │ 9 │ │ 10│ │ 11│ │ 12│   Ligne 3  │
│    └───┘ └───┘ └───┘ └───┘            │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│    │ 5 │ │ 6 │ │ 7 │ │ 8 │   Ligne 2  │
│    └───┘ └───┘ └───┘ └───┘            │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐            │
│    │ 1 │ │ 2 │ │ 3 │ │ 4 │   Ligne 1  │
│    └───┘ └───┘ └───┘ └───┘            │
│                                         │
├─────────────────────────────────────────┤
│         Message de statut               │
└─────────────────────────────────────────┘
```

### Éléments de l'Interface

1. **Menu Preset** : Sélection du kit de samples
2. **Bouton "Load All"** : Télécharge tous les samples du preset
3. **Visualisation Waveform** : Affiche la forme d'onde du sample sélectionné
4. **Trim Bars** : Barres rouges pour sélectionner la région à jouer
5. **Bouton "Play"** : Joue le sample avec les trim bars
6. **Bouton "Save"** : Sauvegarde le sample sur le disque
7. **Grille de Pads 4x4** : 16 pads cliquables pour jouer les samples
8. **Barre de Statut** : Affiche les messages et l'état du sampler

---

## Utilisation Basique

### Charger et Jouer un Preset

1. **Sélectionner un preset**
   - Cliquez sur le menu déroulant "Preset"
   - Choisissez un preset (ex: "808 (Drumkit) - 12 samples")

2. **Charger les samples**
   - Cliquez sur le bouton **"Load All"**
   - Les pads affichent des barres de progression pendant le téléchargement
   - Une fois chargés, les pads ont une bordure verte (état "ready")

3. **Jouer un sample**
   - Cliquez sur un pad pour le sélectionner et le jouer
   - Le pad sélectionné a une bordure bleue
   - Le pad "pulse" visuellement quand il joue

### Utiliser les Trim Bars

1. **Sélectionner un pad** pour afficher sa waveform

2. **Ajuster les trim bars**
   - Survolez les barres rouges (gauche ou droite)
   - Le curseur change en "grab"
   - Cliquez et glissez pour déplacer la barre
   - La zone en dehors des barres est assombrie

3. **Jouer avec les trim bars**
   - Cliquez sur le bouton **"Play"** ou appuyez sur **Espace**
   - Seule la région entre les deux barres est jouée

### Sauvegarder un Sample

1. **Sélectionner un pad** chargé
2. Cliquez sur le bouton **"Save"**
3. Le fichier est téléchargé sur votre ordinateur
4. Le nom du fichier est basé sur le nom du sample (ex: "Kick.wav")

---

## Fonctionnalités Avancées

### Ordre des Pads

⚠️ **Important** : Les pads suivent un ordre spécial !

Les samples du preset sont assignés **de bas en haut, de gauche à droite** :

```
Ordre dans le preset:     Grille de pads:
[0] Premier sample    →   Pad 1 (bas gauche)
[1] Deuxième sample   →   Pad 2 (bas, 2ème colonne)
[2] Troisième sample  →   Pad 3 (bas, 3ème colonne)
[3] Quatrième sample  →   Pad 4 (bas droite)
[4] Cinquième sample  →   Pad 5 (2ème ligne gauche)
...
```

Grille complète :
```
Ligne 4:  [12] [13] [14] [15]
Ligne 3:  [ 8] [ 9] [10] [11]
Ligne 2:  [ 4] [ 5] [ 6] [ 7]
Ligne 1:  [ 0] [ 1] [ 2] [ 3]
```

### Gestion des Erreurs

Le sampler utilise **Promise.allSettled** pour charger les samples :
- Si un fichier échoue, les autres continuent à se charger
- Les pads en erreur ont une bordure rouge et sont grisés
- Le message d'erreur s'affiche dans la console

### Mode Headless (Test sans Interface)

Le moteur audio peut fonctionner sans interface :

1. Ouvrez la console du navigateur (F12)
2. Tapez : `testHeadless()`
3. Le moteur charge et joue des samples sans utiliser l'interface

```javascript
// Exemple de code headless
const engine = new SamplerEngine();
await engine.init();
await engine.loadSample('url-du-sample', 'Mon Sample');
engine.playSample(0);
```

---

## Raccourcis Clavier

### Contrôles Généraux

| Touche | Action |
|--------|--------|
| `Espace` | Jouer le sample sélectionné |
| `Échap` | Arrêter tous les samples |

### Pads (Layout QWERTY)

```
┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │  Ligne 4 (Pads 12-15)
├───┼───┼───┼───┤
│ Q │ W │ E │ R │  Ligne 3 (Pads 8-11)
├───┼───┼───┼───┤
│ A │ S │ D │ F │  Ligne 2 (Pads 4-7)
├───┼───┼───┼───┤
│ Z │ X │ C │ V │  Ligne 1 (Pads 0-3)
└───┴───┴───┴───┘
```

**Exemple :**
- Appuyez sur `Z` pour jouer le Pad 1 (bas gauche)
- Appuyez sur `Q` pour jouer le Pad 5 (2ème ligne gauche)
- Appuyez sur `4` pour jouer le Pad 16 (haut droit)

---

## Résolution de Problèmes

### Le serveur ne démarre pas

**Erreur : "Cannot find module 'express'"**
```bash
cd server
npm install
```

**Erreur : "Port 3000 already in use"**
- Un autre serveur utilise déjà le port 3000
- Fermez l'autre application ou changez le port dans `server/server.js`

### Les presets ne se chargent pas

**Erreur : "Failed to fetch"**
- Vérifiez que le serveur est bien démarré
- Vérifiez que l'URL dans `js/api.js` est correcte : `http://localhost:3000`
- Ouvrez http://localhost:3000/api/presets dans votre navigateur pour tester

**Dossier "presets" non trouvé**
- Créez le dossier `server/presets/`
- Ajoutez les sous-dossiers (808/, 909/, etc.)
- Ajoutez les fichiers audio

### Les fichiers audio ne se téléchargent pas

**Erreur 404 sur les fichiers**
- Vérifiez que les fichiers existent dans `server/presets/`
- Vérifiez que les noms de fichiers correspondent (attention aux espaces)
- Les logs du serveur affichent les requêtes reçues

**Progression bloquée à 0%**
- Certains navigateurs bloquent le téléchargement
- Essayez avec Chrome ou Firefox
- Vérifiez la console pour les erreurs

### Pas de son

**Contexte audio suspendu**
- Cliquez sur un pad ou le bouton Play
- Le navigateur nécessite une interaction utilisateur pour démarrer l'audio

**Erreur Web Audio API**
- Vérifiez que votre navigateur supporte Web Audio API
- Utilisez Chrome, Firefox ou Edge (dernières versions)

---

## FAQ

### Quels formats audio sont supportés ?

Le sampler supporte tous les formats décodables par Web Audio API :
- **WAV** (recommandé) - Haute qualité, sans compression
- **MP3** - Compressé, plus petit
- **OGG** - Alternative libre
- **M4A/AAC** - Selon le navigateur

### Combien de samples peuvent être chargés ?

- **Théoriquement** : Illimité
- **En pratique** : Limité par la mémoire RAM du navigateur
- Recommandé : 16-32 samples par preset

### Les samples sont-ils sauvegardés ?

- Les samples téléchargés restent en **mémoire** pendant la session
- Quand vous changez de preset, les samples précédents sont effacés
- Utilisez le bouton "Save" pour sauvegarder sur le disque

### Peut-on ajouter des effets ?

Actuellement, le sampler joue les samples sans effets. 

Pour ajouter des effets :
1. Modifiez `SamplerEngine.js`
2. Ajoutez des nodes d'effet (reverb, delay, filter, etc.)
3. Connectez-les dans le graphe audio

### Peut-on utiliser MIDI ?

Le support MIDI est prévu mais pas encore implémenté.

Une base existe dans `js/config.js` :
```javascript
midi: {
    enabled: false,
    autoConnect: true,
    noteMapping: { ... }
}
```

### Comment ajouter de nouveaux presets ?

1. Créez un dossier dans `server/presets/` (ex: `my-kit/`)
2. Ajoutez vos fichiers audio dans ce dossier
3. Modifiez `server/server.js`, section `presets` :

```javascript
{
    name: 'My Kit',
    type: 'Drumkit',
    isFactoryPresets: false,
    samples: [
        { url: './my-kit/sample1.wav', name: 'Sample 1' },
        { url: './my-kit/sample2.wav', name: 'Sample 2' }
    ]
}
```

4. Redémarrez le serveur

---

## Support et Contribution

### Rapporter un Bug

Ouvrez un ticket avec :
- Description du problème
- Étapes pour reproduire
- Console logs (F12 → Console)
- Navigateur et version

### Contribuer

Contributions bienvenues ! Zones d'amélioration :
- Support MIDI
- Effets audio
- Export de patterns
- Enregistrement de sessions
- Mode multi-pistes

---

**Bon sampling ! 🎵🎹**

