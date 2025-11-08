# Audio Sampler Web 🎵

Un **sampler audio web** professionnel construit avec Web Audio API. Ce projet suit une architecture propre avec séparation complète entre le moteur audio (headless) et l'interface graphique.

## ✨ Fonctionnalités

- ✅ **Moteur audio headless** (SamplerEngine) utilisable sans interface
- ✅ **Interface graphique moderne** avec grille de pads 4x4 (style Akai MPC)
- ✅ **Téléchargement de samples** avec barres de progression
- ✅ **Visualisation waveform** en temps réel sur canvas HTML5
- ✅ **Trim bars interactives** pour sélectionner la région à jouer
- ✅ **API REST** pour gérer les presets
- ✅ **Sauvegarde de fichiers** sur le disque local
- ✅ **Chargement parallèle** avec Promise.allSettled
- ✅ **Support clavier** (espace pour jouer)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 14+ installé
- Un navigateur moderne (Chrome, Firefox, Edge)

### Installation

1. **Cloner le projet** (ou extraire l'archive)

2. **Installer le serveur**
```bash
cd server
npm install
```

3. **Ajouter des fichiers audio**

Créez un dossier `presets` dans `server/` et ajoutez vos fichiers audio :
```
server/presets/
├── 808/
│   ├── Kick 808X.wav
│   ├── Snare 808 1.wav
│   └── ...
├── 909/
│   └── ...
└── acoustic/
    └── ...
```

4. **Démarrer le serveur**
```bash
npm start
```

Le serveur démarre sur http://localhost:3000

5. **Ouvrir l'application**

Ouvrez `index.html` dans votre navigateur, ou utilisez un serveur local :
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server -p 8000
```

Puis ouvrez http://localhost:8000

## 📖 Utilisation

1. **Sélectionner un preset** dans le menu déroulant
2. **Cliquer sur "Load All"** pour télécharger tous les samples
3. **Cliquer sur un pad** pour sélectionner et jouer un sample
4. **Ajuster les trim bars** pour sélectionner la région à jouer
5. **Cliquer sur "Play"** pour jouer avec les trim bars
6. **Cliquer sur "Save"** pour sauvegarder le fichier sur le disque

### Raccourcis clavier

- `Espace` : Jouer le sample sélectionné

## 🏗️ Architecture

### Séparation GUI / Engine

Le projet suit le pattern de séparation entre le moteur et l'interface :

- **SamplerEngine** : Moteur audio pur, testable sans GUI (mode headless)
- **SamplerGUI** : Interface utilisateur qui utilise le SamplerEngine

### Structure des fichiers

```
projet-sampler/
├── index.html                 # Page principale
├── css/
│   └── styles.css            # Styles modernes
├── js/
│   ├── main.js               # Point d'entrée
│   ├── SamplerEngine.js      # Moteur audio (headless)
│   ├── SamplerGUI.js         # Interface utilisateur
│   ├── WaveformDrawer.js     # Visualisation waveform
│   ├── TrimbarsDrawer.js     # Gestion des trim bars
│   ├── DownloadManager.js    # Téléchargement avec progression
│   ├── api.js                # Client API REST
│   ├── soundutils.js         # Utilitaires audio
│   ├── utils.js              # Utilitaires généraux
│   └── test-headless.js      # Tests headless
└── server/
    ├── server.js             # Serveur Express
    ├── package.json          # Dépendances
    └── presets/              # Fichiers audio
```

## 🧪 Tests Headless

Pour tester le moteur sans interface :

1. Ouvrir la console du navigateur
2. Taper : `testHeadless()`

Le test charge des samples et les joue sans utiliser l'interface graphique.

## 🎨 Design

Interface inspirée des samplers professionnels (Akai MPC, Native Instruments) :
- Pads avec effet de pression visuel
- Animations fluides
- Feedback visuel pour toutes les actions
- Design responsive

## 🔧 Technologies

- **Web Audio API** : Lecture et manipulation audio
- **Canvas HTML5** : Visualisation waveform et trim bars
- **ES6 Modules** : Architecture modulaire
- **Express.js** : Serveur REST
- **Fetch API** : Téléchargement avec progression

## 📝 Notes Importantes

1. **Téléchargement vs Lecture** : Les fichiers sont TÉLÉCHARGÉS (avec progression) avant d'être joués
2. **Ordre des pads** : Bas en haut, gauche à droite (comme spécifié)
3. **Séparation Engine/GUI** : Le moteur est testable sans interface
4. **Trim bars persistants** : Chaque sample mémorise ses positions
5. **Gestion d'erreurs** : Utilise Promise.allSettled pour ne pas crasher si un fichier échoue

## 📚 Documentation Technique Complète

Voir les sections suivantes pour la documentation détaillée des spécifications.

---

# SPÉCIFICATIONS TECHNIQUES ORIGINALES

## CONTEXTE DU PROJET

Tu dois créer un **sampler audio web** (un instrument de musique numérique qui permet de jouer des échantillons sonores). Le projet doit être inspiré d'un plugin WAM Sampler et doit suivre une architecture propre avec séparation entre le moteur audio et l'interface graphique.

## SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES

### 1. ARCHITECTURE REQUISE

**IMPORTANT : Séparation GUI / Engine**
- Créer une classe `SamplerEngine` : moteur audio pur, utilisable SANS interface graphique (mode "headless")
- Créer une classe `SamplerGUI` : interface utilisateur qui utilise le `SamplerEngine`
- Le sampler doit pouvoir fonctionner en mode test sans GUI
- Utiliser le pattern de design Composite/Adapter (comme les AudioNodes de Web Audio API)

### 2. CHARGEMENT DES SAMPLES

**CRITIQUE : Téléchargement des fichiers, pas juste lecture en mémoire**

Les samples doivent être **téléchargés** sur le disque de l'utilisateur avec :
- **Barres de progression** pour chaque fichier pendant le téléchargement
- **Bouton "Download All"** pour télécharger tous les samples d'un preset
- **Bouton "Save" individuel** par sample pour sauvegarder un fichier
- Utiliser `fetch` avec suivi de progression (ou `XMLHttpRequest` pour le suivi de progression si nécessaire)
- Les fichiers téléchargés doivent ensuite être chargés en mémoire pour la lecture

**Source des données :**
- Récupérer les presets via une API REST : `http://localhost:3000/api/presets`
- Le serveur Node.js/Express doit être lancé avec `npm run start` ou `npm run dev`
- Format de réponse JSON : liste de presets, chaque preset contient un tableau `samples` avec `url` et `name`
- Exemple de structure JSON :
```json
{
  "name": "808",
  "type": "Drumkit",
  "isFactoryPresets": true,
  "samples": [
    { "url": "./808/Kick 808X.wav", "name": "kick" },
    { "url": "./808/Snare 808 1.wav", "name": "snare1" }
  ]
}
```

**Construction des URLs :**
- Les URLs des fichiers audio sont relatives : `./808/Kick 808X.wav`
- Construire les URLs complètes : `http://localhost:3000/presets/808/Kick%20808X.wav`
- Utiliser `encodeURI()` pour encoder les espaces et caractères spéciaux

**Chargement en parallèle :**
- Utiliser `Promise.allSettled` (pas `Promise.all`) pour charger tous les samples en parallèle
- `Promise.allSettled` ne s'arrête pas à la première erreur et produit un rapport à la fin
- Afficher les erreurs de chargement pour les fichiers qui échouent

### 3. INTERFACE UTILISATEUR

**Menu déroulant de presets :**
- Créer un `<select>` avec tous les noms de presets disponibles
- Quand un preset est sélectionné, charger les samples de ce preset
- Vider l'interface avant de charger un nouveau preset

**Pads de sampler (matrice 4x4) :**
- Créer 16 pads cliquables disposés en grille 4x4 (style Akai MPC)
- **ORDRE IMPORTANT** : Les samples suivent l'ordre des URLs dans le tableau, mais sont assignés aux pads de **bas en haut, de gauche à droite**
- Exemple : pad[0] = premier sample (bas gauche), pad[4] = cinquième sample (deuxième ligne, première colonne)
- Chaque pad doit afficher :
  - Le nom du sample (ou un numéro si pas de nom)
  - Une barre de progression pendant le téléchargement
  - Un indicateur visuel quand le sample est prêt
  - Un effet visuel au clic (feedback tactile)

**Visualisation waveform :**
- Utiliser un canvas HTML5 pour afficher la waveform de chaque sample
- Quand un pad est sélectionné/cliqué, afficher sa waveform
- Créer une classe `WaveformDrawer` similaire à celle des exemples
- La waveform doit être calculée à partir des données audio décodées

**Trim bars :**
- Deux barres verticales (gauche et droite) sur un canvas overlay positionné au-dessus de la waveform
- Permettre de sélectionner la zone du sample à jouer (start/end)
- Les trim bars doivent être draggables avec la souris
- **Stockage des positions** : Chaque sample doit mémoriser ses positions de trim bars
- Quand on change de sample, restaurer les positions de trim bars sauvegardées
- Créer une classe `TrimbarsDrawer` pour gérer l'affichage et l'interaction
- Convertir les positions en pixels vers secondes pour la lecture

**Boutons de contrôle :**
- Bouton "Load All" : démarre le téléchargement de tous les samples
- Bouton "Play" : joue le sample sélectionné avec les trim bars
- Bouton "Save" : sauvegarde le sample téléchargé sur le disque local

### 4. WEB AUDIO API

**AudioContext :**
- Créer un `AudioContext` unique pour toute l'application
- Gérer l'état "suspended" (politique autoplay) : appeler `audioContext.resume()` si nécessaire

**Lecture des samples :**
- Décoder les fichiers audio téléchargés avec `audioContext.decodeAudioData(arrayBuffer)`
- Stocker les `AudioBuffer` décodés en mémoire
- Créer un `AudioBufferSourceNode` pour chaque lecture (one-shot, "fire and forget")
- Connecter au `audioContext.destination`
- Utiliser `bufferSource.start(0, startTime, endTime)` pour jouer avec les trim bars
- Gérer les paramètres : `startTime` et `endTime` en secondes, calculés depuis les positions des trim bars

**Graphe audio :**
- Construire un graphe audio simple mais extensible
- Possibilité d'ajouter des effets plus tard (reverb, delay, etc.)

### 5. STRUCTURE DES FICHIERS

Organiser le projet en modules ES6 :

```
projet-sampler/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js              (point d'entrée)
│   ├── SamplerEngine.js      (moteur audio, sans GUI)
│   ├── SamplerGUI.js         (interface utilisateur)
│   ├── WaveformDrawer.js    (dessin de waveform)
│   ├── TrimbarsDrawer.js    (gestion des trim bars)
│   ├── soundutils.js         (utilitaires audio : load, decode, play)
│   └── utils.js              (utilitaires généraux : conversions, etc.)
```

**Utiliser les modules ES6 :**
- `import/export` dans tous les fichiers JavaScript
- Ajouter `type="module"` à la balise `<script>` dans le HTML

### 6. FONCTIONNALITÉS DÉTAILLÉES

**Gestion des samples :**
- Classe `Sample` ou objet pour représenter un sample avec :
  - URL source
  - Nom
  - AudioBuffer décodé
  - Positions des trim bars (leftTrim, rightTrim)
  - État de téléchargement
  - Blob téléchargé (pour sauvegarde)

**Téléchargement avec progression :**
- Utiliser `fetch` avec `ReadableStream` pour suivre la progression
- Ou utiliser `XMLHttpRequest` si le suivi de progression avec fetch n'est pas bien supporté
- Calculer le pourcentage : `(loaded / total) * 100`
- Mettre à jour les barres de progression en temps réel

**Sauvegarde de fichiers :**
- Utiliser `URL.createObjectURL(blob)` pour créer un lien de téléchargement
- Créer un élément `<a>` avec `download` attribute
- Ou utiliser File System Access API si supporté par le navigateur

**Gestion d'état :**
- Suivre quels samples sont chargés
- Suivre quels samples sont téléchargés
- Suivre quel sample est actuellement sélectionné
- Gérer les erreurs de chargement gracieusement

### 7. DESIGN ET UX

**Interface moderne :**
- Design inspiré des samplers professionnels (Akai MPC, Native Instruments)
- Pads avec effet de pression visuel
- Animations fluides
- Feedback visuel pour toutes les actions
- Responsive design (s'adapter à différentes tailles d'écran)

**Accessibilité :**
- Support clavier pour déclencher les pads
- Support MIDI optionnel (pour plus tard)

## PLAN D'IMPLÉMENTATION ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Structure de base et setup
1. Créer la structure de dossiers
2. Créer `index.html` avec structure de base
3. Créer `css/styles.css` avec styles de base
4. Configurer les modules ES6 dans le HTML
5. Vérifier que le serveur REST fonctionne (`npm run start` dans le dossier du serveur)

### ÉTAPE 2 : Utilitaires de base
1. Créer `js/utils.js` avec fonctions utilitaires :
   - `pixelToSeconds(pixel, duration, canvasWidth)` : conversion pixel → secondes
   - `secondsToPixel(seconds, duration, canvasWidth)` : conversion secondes → pixels
   - `distance(x1, y1, x2, y2)` : calcul de distance (pour trim bars)
2. Créer `js/soundutils.js` avec :
   - `loadAndDecodeSound(url, ctx)` : charge et décode un fichier audio
   - `playSound(ctx, buffer, startTime, endTime)` : joue un buffer avec trim
   - `downloadSoundWithProgress(url, onProgress)` : télécharge avec progression

### ÉTAPE 3 : Classes de visualisation
1. Créer `js/WaveformDrawer.js` :
   - Classe pour dessiner la waveform dans un canvas
   - Méthode `init(buffer, canvas, color)`
   - Méthode `drawWave(startY, height)`
   - Méthode `getPeaks()` pour calculer les pics audio
2. Créer `js/TrimbarsDrawer.js` :
   - Classe pour gérer les trim bars
   - Propriétés : `leftTrimBar`, `rightTrimBar`
   - Méthodes : `draw()`, `moveTrimBars(mousePos)`, `startDrag()`, `stopDrag()`
   - Gestion des événements souris

### ÉTAPE 4 : SamplerEngine (moteur audio)
1. Créer `js/SamplerEngine.js` :
   - Classe `SamplerEngine`
   - Propriétés : `audioContext`, `samples[]`, `currentSample`
   - Méthode `init()` : initialise l'AudioContext
   - Méthode `loadSample(url, name)` : charge un sample
   - Méthode `loadSamples(urls[])` : charge plusieurs samples en parallèle
   - Méthode `playSample(index, startTime, endTime)` : joue un sample
   - Méthode `stopAll()` : arrête toutes les lectures
   - **Testable sans GUI** : doit pouvoir être utilisé en mode headless

### ÉTAPE 5 : Intégration API REST
1. Dans `js/main.js` ou `SamplerGUI.js` :
   - Fonction `fetchPresets()` : récupère la liste des presets depuis `/api/presets`
   - Fonction `buildPresetMenu(presets)` : crée le menu déroulant
   - Fonction `onPresetSelected(preset)` : gère la sélection d'un preset
   - Construction des URLs complètes pour les fichiers audio

### ÉTAPE 6 : Téléchargement avec progression
1. Implémenter le téléchargement avec barres de progression :
   - Fonction `downloadFile(url, onProgress)` retourne une Promise
   - Afficher une barre de progression par sample
   - Stocker les Blobs téléchargés
   - Bouton "Download All" qui télécharge tous les samples
2. Implémenter la sauvegarde :
   - Fonction `saveSample(blob, filename)` : sauvegarde un fichier
   - Bouton "Save" par sample

### ÉTAPE 7 : SamplerGUI (interface)
1. Créer `js/SamplerGUI.js` :
   - Classe `SamplerGUI`
   - Propriété : `engine` (instance de SamplerEngine)
   - Méthode `init()` : initialise l'interface
   - Méthode `createPadsGrid()` : crée la grille 4x4 de pads
   - Méthode `displayWaveform(sampleIndex)` : affiche la waveform
   - Méthode `updateProgressBar(sampleIndex, progress)` : met à jour la progression
   - Gestion des événements : clics sur pads, sélection de preset, etc.

### ÉTAPE 8 : Intégration complète
1. Dans `js/main.js` :
   - Créer une instance de `SamplerEngine`
   - Créer une instance de `SamplerGUI` avec l'engine
   - Initialiser au chargement de la page
   - Connecter tous les événements
2. Tester le flux complet :
   - Sélectionner un preset
   - Télécharger les samples
   - Voir les waveforms
   - Ajuster les trim bars
   - Jouer les samples

### ÉTAPE 9 : Améliorations et polish
1. Gestion des erreurs : afficher les erreurs de chargement
2. États de chargement : désactiver les pads pendant le téléchargement
3. Animations : effets visuels sur les pads
4. Stockage des trim bars : sauvegarder/restaurer les positions
5. Tests en mode headless : tester le SamplerEngine sans GUI

## RESSOURCES ET RÉFÉRENCES

**Web Audio API :**
- AudioContext : https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
- AudioBufferSourceNode : https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
- decodeAudioData : https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData

**Fetch API avec progression :**
- Utiliser ReadableStream ou XMLHttpRequest pour le suivi de progression
- MDN : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

**Canvas HTML5 :**
- Drawing : https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Animation : utiliser `requestAnimationFrame()`

**Promise.allSettled :**
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled

## NOTES IMPORTANTES

1. **Téléchargement vs Lecture** : Les fichiers doivent être TÉLÉCHARGÉS (avec progression) avant d'être joués, pas juste chargés en mémoire directement
2. **Ordre des pads** : Bas en haut, gauche à droite (pas séquentiel)
3. **Séparation Engine/GUI** : Le moteur doit être testable sans interface
4. **Trim bars persistants** : Chaque sample mémorise ses positions de trim bars
5. **Gestion d'erreurs** : Utiliser Promise.allSettled pour ne pas tout casser si un fichier échoue

## DÉMARRAGE

1. Commence par créer un plan détaillé de chaque étape
2. Avance étape par étape, en testant à chaque fois
3. Ne passe à l'étape suivante que quand l'étape actuelle fonctionne
4. Documente ton code avec des commentaires
5. Teste régulièrement dans le navigateur avec la console ouverte

Bon courage !