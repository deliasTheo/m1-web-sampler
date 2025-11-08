/**
 * Point d'entrée principal de l'application Audio Sampler
 * Initialise le SamplerEngine et le SamplerGUI
 */

import { SamplerEngine } from './SamplerEngine.js';
import { SamplerGUI } from './SamplerGUI.js';
import { isWebAudioSupported } from './soundutils.js';

// Variables globales
let samplerEngine;
let samplerGUI;

/**
 * Initialisation de l'application
 */
async function init() {
    console.log('===================================');
    console.log('Audio Sampler Web - Initialisation');
    console.log('===================================');
    
    try {
        // Vérifier le support Web Audio API
        if (!isWebAudioSupported()) {
            throw new Error('Web Audio API non supportée par ce navigateur');
        }
        
        console.log('✓ Web Audio API supportée');
        
        // Créer le SamplerEngine
        console.log('🔄 Création du SamplerEngine...');
        samplerEngine = new SamplerEngine();
        await samplerEngine.init();
        console.log('✓ SamplerEngine initialisé');
        
        // Créer le SamplerGUI
        console.log('🔄 Création du SamplerGUI...');
        samplerGUI = new SamplerGUI(samplerEngine);
        await samplerGUI.init();
        console.log('✓ SamplerGUI initialisé');
        
        console.log('===================================');
        console.log('Audio Sampler prêt à l\'emploi !');
        console.log('===================================');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        displayStatus('Erreur lors de l\'initialisation : ' + error.message, 'error');
        
        // Afficher une alerte pour les erreurs critiques
        if (!isWebAudioSupported()) {
            alert('Votre navigateur ne supporte pas Web Audio API. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Edge).');
        }
    }
}

/**
 * Affiche un message de statut
 */
function displayStatus(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = type;
    }
}

/**
 * Gestion du redimensionnement de la fenêtre
 */
function handleResize() {
    if (samplerGUI && samplerGUI.waveformDrawer && samplerGUI.trimbarsDrawer) {
        // Redimensionner les canvas
        samplerGUI.waveformDrawer.redraw();
        samplerGUI.trimbarsDrawer.resizeCanvas();
        samplerGUI.trimbarsDrawer.draw();
    }
}

// Démarrer l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', init);

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', handleResize);

// Exposer les objets globalement pour le débogage (optionnel)
window.samplerEngine = samplerEngine;
window.samplerGUI = samplerGUI;

