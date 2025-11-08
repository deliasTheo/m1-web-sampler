/**
 * SamplerEngine - Moteur audio pur, utilisable sans interface graphique (mode headless)
 * Gère le chargement, le décodage et la lecture des samples
 */

import { loadAndDecodeSound, playSound, createAudioContext } from './soundutils.js';
import { AudioRecorder } from './AudioRecorder.js';

/**
 * Classe représentant un sample
 */
class Sample {
    constructor(url, name) {
        this.url = url;
        this.name = name;
        this.audioBuffer = null;
        this.blob = null;
        this.isLoaded = false;
        this.isDownloaded = false;
        this.error = null;
        
        // Positions des trim bars (en secondes)
        this.leftTrimSeconds = 0;
        this.rightTrimSeconds = 0;
    }

    /**
     * Définit les positions de trim
     * @param {number} leftTrim - Position gauche en secondes
     * @param {number} rightTrim - Position droite en secondes
     */
    setTrimPositions(leftTrim, rightTrim) {
        this.leftTrimSeconds = leftTrim;
        this.rightTrimSeconds = rightTrim;
    }

    /**
     * Obtient les positions de trim
     * @returns {Object} { leftTrim, rightTrim }
     */
    getTrimPositions() {
        return {
            leftTrim: this.leftTrimSeconds,
            rightTrim: this.rightTrimSeconds
        };
    }

    /**
     * Obtient la durée du sample
     * @returns {number} Durée en secondes
     */
    getDuration() {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }
}

/**
 * Classe principale du moteur de sampler
 */
export class SamplerEngine {
    constructor() {
        this.audioContext = null;
        this.samples = [];
        this.currentSampleIndex = null;
        this.currentlyPlayingSources = [];
        this.isInitialized = false;
        this.recorder = null;
        this.masterGain = null; // Gain node pour contrôler le volume
    }

    /**
     * Initialise le moteur audio
     */
    async init() {
        try {
            // Créer l'AudioContext
            this.audioContext = createAudioContext();
            
            // Créer le gain node principal
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 1.0;
            
            // Connecter au destination
            this.masterGain.connect(this.audioContext.destination);
            
            // Initialiser le recorder
            this.recorder = new AudioRecorder(this.audioContext);
            const recorderDestination = this.recorder.init();
            
            // Connecter aussi au recorder pour pouvoir enregistrer
            this.masterGain.connect(recorderDestination);
            
            // Note: Le contexte peut être suspendu à cause de la politique autoplay
            // Il sera automatiquement repris lors de la première interaction utilisateur
            if (this.audioContext.state === 'suspended') {
                console.warn('⚠️  AudioContext suspendu (politique autoplay du navigateur)');
                console.warn('   Le contexte sera activé lors de votre première interaction (clic)');
            }
            
            this.isInitialized = true;
            console.log('✅ SamplerEngine initialisé - Sample Rate:', this.audioContext.sampleRate);
            console.log('   État du contexte:', this.audioContext.state);
            console.log('   Graphe audio: Source → MasterGain → [Destination + Recorder]');
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du SamplerEngine:', error);
            throw error;
        }
    }

    /**
     * Charge un sample depuis une URL
     * @param {string} url - URL du sample
     * @param {string} name - Nom du sample
     * @returns {Promise<number>} Index du sample chargé
     */
    async loadSample(url, name) {
        if (!this.isInitialized) {
            throw new Error('SamplerEngine non initialisé. Appelez init() d\'abord.');
        }

        try {
            // Créer l'objet Sample
            const sample = new Sample(url, name);
            const index = this.samples.length;
            this.samples.push(sample);

            // Charger et décoder le sample
            sample.audioBuffer = await loadAndDecodeSound(url, this.audioContext);
            sample.isLoaded = true;
            
            // Initialiser les trim bars à toute la durée
            sample.rightTrimSeconds = sample.getDuration();

            console.log(`Sample chargé: ${name} (${sample.getDuration().toFixed(2)}s)`);
            
            return index;
        } catch (error) {
            console.error(`Erreur lors du chargement du sample ${name}:`, error);
            // Marquer l'erreur mais ne pas crasher
            const sample = this.samples[this.samples.length - 1];
            if (sample) {
                sample.error = error.message;
            }
            throw error;
        }
    }

    /**
     * Charge plusieurs samples en parallèle avec Promise.allSettled
     * @param {Array<{url: string, name: string}>} samplesData - Tableau d'objets {url, name}
     * @returns {Promise<Array>} Résultats du chargement
     */
    async loadSamples(samplesData) {
        if (!this.isInitialized) {
            throw new Error('SamplerEngine non initialisé. Appelez init() d\'abord.');
        }

        console.log(`Chargement de ${samplesData.length} samples en parallèle...`);

        // Créer les promesses de chargement
        const promises = samplesData.map(data => 
            this.loadSample(data.url, data.name)
                .then(index => ({ status: 'fulfilled', value: index, data }))
                .catch(error => ({ status: 'rejected', reason: error, data }))
        );

        // Attendre tous les chargements (ne s'arrête pas aux erreurs)
        const results = await Promise.allSettled(promises);

        // Analyser les résultats
        const fulfilled = results.filter(r => r.value?.status === 'fulfilled');
        const rejected = results.filter(r => r.value?.status === 'rejected');

        console.log(`Chargement terminé: ${fulfilled.length} succès, ${rejected.length} échecs`);

        if (rejected.length > 0) {
            console.warn('Samples en erreur:', rejected.map(r => r.value?.data?.name));
        }

        return results;
    }

    /**
     * Joue un sample par son index
     * @param {number} index - Index du sample
     * @param {number} startTime - Temps de début (optionnel, utilise trim par défaut)
     * @param {number} endTime - Temps de fin (optionnel, utilise trim par défaut)
     * @returns {AudioBufferSourceNode} Source node créée
     */
    playSample(index, startTime = null, endTime = null) {
        if (!this.isInitialized) {
            throw new Error('SamplerEngine non initialisé.');
        }

        if (index < 0 || index >= this.samples.length) {
            throw new Error(`Index de sample invalide: ${index}`);
        }

        const sample = this.samples[index];

        if (!sample.isLoaded || !sample.audioBuffer) {
            throw new Error(`Sample ${sample.name} non chargé`);
        }

        // Utiliser les trim bars si startTime/endTime non spécifiés
        if (startTime === null) {
            startTime = sample.leftTrimSeconds;
        }
        if (endTime === null) {
            endTime = sample.rightTrimSeconds;
        }

        // Reprendre le contexte audio si nécessaire (sans attendre)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Créer la source
        const source = this.audioContext.createBufferSource();
        source.buffer = sample.audioBuffer;
        
        // Connecter au masterGain au lieu de directement au destination
        source.connect(this.masterGain);
        
        // Calculer la durée
        const duration = endTime - startTime;
        
        // Démarrer la lecture
        source.start(0, startTime, duration);
        
        // Garder une référence pour pouvoir arrêter
        this.currentlyPlayingSources.push(source);
        
        // Nettoyer la référence quand le son est fini
        source.onended = () => {
            const idx = this.currentlyPlayingSources.indexOf(source);
            if (idx > -1) {
                this.currentlyPlayingSources.splice(idx, 1);
            }
        };

        console.log(`Lecture du sample ${sample.name} (${startTime.toFixed(2)}s - ${endTime.toFixed(2)}s)`);

        return source;
    }

    /**
     * Arrête tous les samples en cours de lecture
     */
    stopAll() {
        this.currentlyPlayingSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Ignorer les erreurs si déjà arrêté
            }
        });
        this.currentlyPlayingSources = [];
        console.log('Tous les samples arrêtés');
    }

    /**
     * Définit le sample actuellement sélectionné
     * @param {number} index - Index du sample
     */
    setCurrentSample(index) {
        if (index >= 0 && index < this.samples.length) {
            this.currentSampleIndex = index;
        }
    }

    /**
     * Obtient le sample actuellement sélectionné
     * @returns {Sample|null} Sample courant
     */
    getCurrentSample() {
        if (this.currentSampleIndex !== null && this.currentSampleIndex < this.samples.length) {
            return this.samples[this.currentSampleIndex];
        }
        return null;
    }

    /**
     * Obtient un sample par index
     * @param {number} index - Index du sample
     * @returns {Sample|null} Sample
     */
    getSample(index) {
        if (index >= 0 && index < this.samples.length) {
            return this.samples[index];
        }
        return null;
    }

    /**
     * Obtient tous les samples
     * @returns {Array<Sample>} Tous les samples
     */
    getAllSamples() {
        return this.samples;
    }

    /**
     * Obtient le nombre de samples
     * @returns {number} Nombre de samples
     */
    getSampleCount() {
        return this.samples.length;
    }

    /**
     * Vide tous les samples
     */
    clearSamples() {
        this.stopAll();
        this.samples = [];
        this.currentSampleIndex = null;
        console.log('Tous les samples supprimés');
    }

    /**
     * Définit les positions de trim pour un sample
     * @param {number} index - Index du sample
     * @param {number} leftTrim - Position gauche en secondes
     * @param {number} rightTrim - Position droite en secondes
     */
    setTrimPositions(index, leftTrim, rightTrim) {
        const sample = this.getSample(index);
        if (sample) {
            sample.setTrimPositions(leftTrim, rightTrim);
        }
    }

    /**
     * Obtient les positions de trim pour un sample
     * @param {number} index - Index du sample
     * @returns {Object|null} { leftTrim, rightTrim }
     */
    getTrimPositions(index) {
        const sample = this.getSample(index);
        return sample ? sample.getTrimPositions() : null;
    }

    /**
     * Obtient l'AudioContext
     * @returns {AudioContext} Contexte audio
     */
    getAudioContext() {
        return this.audioContext;
    }

    /**
     * Vérifie si le moteur est initialisé
     * @returns {boolean} True si initialisé
     */
    isReady() {
        return this.isInitialized && this.audioContext !== null;
    }

    /**
     * Nettoie les ressources
     */
    destroy() {
        this.stopAll();
        this.clearSamples();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.isInitialized = false;
        console.log('SamplerEngine détruit');
    }
}

