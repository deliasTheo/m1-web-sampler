/**
 * Configuration de l'application Audio Sampler
 * Centralise tous les paramètres configurables
 */

export const CONFIG = {
    // API
    api: {
        baseUrl: 'https://m1-web-backend.onrender.com',
        endpoints: {
            presets: '/api/presets',
            files: '/presets'
        }
    },

    // Audio
    audio: {
        // Qualité de lecture (48000 Hz par défaut)
        sampleRate: null, // null = utiliser la valeur par défaut du système
        
        // Nombre maximum de sources en lecture simultanée
        maxPolyphony: 16
    },

    // Interface
    ui: {
        // Nombre de pads
        padCount: 16,
        padRows: 4,
        padCols: 4,
        
        // Ordre des pads : 'bottom-top' ou 'top-bottom'
        padOrder: 'bottom-top', // bas en haut, gauche à droite (spécifié)
        
        // Couleurs
        colors: {
            primary: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c',
            waveform: '#3498db',
            trimBars: '#e74c3c'
        }
    },

    // Visualisation
    visualization: {
        // Qualité de la waveform (samples par pixel)
        waveformQuality: 'auto', // 'auto', 'low', 'medium', 'high'
        
        // Afficher la grille de temps sur la waveform
        showTimeGrid: false,
        
        // Largeur des trim bars
        trimBarWidth: 3,
        
        // Zone de détection des trim bars (en pixels)
        trimBarHitZone: 15
    },

    // Téléchargement
    download: {
        // Timeout pour les téléchargements (en ms)
        timeout: 30000,
        
        // Nombre de tentatives en cas d'erreur
        retries: 3,
        
        // Délai entre les tentatives (en ms)
        retryDelay: 1000
    },

    // Clavier
    keyboard: {
        enabled: true,
        shortcuts: {
            play: 'Space',
            stop: 'Escape',
            // Mapping des touches pour les pads (optionnel, pour plus tard)
            pads: {
                '1': 0,
                '2': 1,
                '3': 2,
                '4': 3,
                'Q': 4,
                'W': 5,
                'E': 6,
                'R': 7,
                'A': 8,
                'S': 9,
                'D': 10,
                'F': 11,
                'Z': 12,
                'X': 13,
                'C': 14,
                'V': 15
            }
        }
    },

    // MIDI (pour une future implémentation)
    midi: {
        enabled: false,
        autoConnect: true,
        // Mapping MIDI notes -> pads
        noteMapping: {
            36: 0,  // C1 -> Pad 0 (Kick)
            38: 1,  // D1 -> Pad 1 (Snare)
            // ... etc
        }
    },

    // Développement
    dev: {
        // Afficher les logs de débogage
        debug: true,
        
        // Afficher les performances
        showPerformance: false,
        
        // Mode headless (sans GUI)
        headless: false
    }
};

/**
 * Met à jour la configuration
 * @param {Object} updates - Objet avec les mises à jour
 */
export function updateConfig(updates) {
    Object.assign(CONFIG, updates);
}

/**
 * Obtient une valeur de configuration
 * @param {string} path - Chemin vers la valeur (ex: 'api.baseUrl')
 * @returns {*} Valeur de configuration
 */
export function getConfig(path) {
    const parts = path.split('.');
    let value = CONFIG;
    
    for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
            value = value[part];
        } else {
            return undefined;
        }
    }
    
    return value;
}

