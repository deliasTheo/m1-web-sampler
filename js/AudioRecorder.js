/**
 * AudioRecorder - Enregistre l'audio joué dans le sampler
 * Permet de capturer une session et de la sauvegarder
 */

import { WavEncoder } from './WavEncoder.js';

export class AudioRecorder {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.destination = null;
        this.startTime = null;
        this.recordedBlob = null;
    }

    /**
     * Initialise le recorder
     * Crée un MediaStreamDestination pour capturer l'audio
     */
    init() {
        try {
            // Créer une destination pour capturer l'audio
            this.destination = this.audioContext.createMediaStreamDestination();
            
            console.log('✅ AudioRecorder initialisé');
            return this.destination;
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du recorder:', error);
            throw error;
        }
    }

    /**
     * Démarre l'enregistrement
     */
    startRecording() {
        if (this.isRecording) {
            console.warn('⚠️  Enregistrement déjà en cours');
            return;
        }

        if (!this.destination) {
            this.init();
        }

        try {
            // Réinitialiser les chunks
            this.audioChunks = [];

            // Créer le MediaRecorder
            const options = { mimeType: 'audio/webm' };
            
            // Vérifier si le type est supporté, sinon utiliser le défaut
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.warn('⚠️  audio/webm non supporté, utilisation du format par défaut');
                this.mediaRecorder = new MediaRecorder(this.destination.stream);
            } else {
                this.mediaRecorder = new MediaRecorder(this.destination.stream, options);
            }

            // Event: réception de données
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                    console.log('📊 Chunk audio reçu:', event.data.size, 'bytes');
                }
            };

            // Event: arrêt de l'enregistrement
            this.mediaRecorder.onstop = () => {
                console.log('🛑 Enregistrement arrêté');
                console.log('📊 Total chunks:', this.audioChunks.length);
            };

            // Event: erreur
            this.mediaRecorder.onerror = (event) => {
                console.error('❌ Erreur d\'enregistrement:', event.error);
            };

            // Démarrer l'enregistrement
            this.mediaRecorder.start(1000); // Collecter toutes les 1 seconde
            this.isRecording = true;
            this.startTime = Date.now();

            console.log('🔴 Enregistrement démarré');

        } catch (error) {
            console.error('❌ Erreur lors du démarrage de l\'enregistrement:', error);
            throw error;
        }
    }

    /**
     * Arrête l'enregistrement et encode en WAV
     */
    async stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            console.warn('⚠️  Aucun enregistrement en cours');
            return null;
        }

        return new Promise((resolve, reject) => {
            this.mediaRecorder.onstop = async () => {
                this.isRecording = false;
                
                const duration = (Date.now() - this.startTime) / 1000;
                console.log('🛑 Enregistrement arrêté - Durée:', duration.toFixed(2), 's');
                console.log('📊 Chunks collectés:', this.audioChunks.length);

                try {
                    // Créer le blob WebM temporaire
                    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
                    const webmBlob = new Blob(this.audioChunks, { type: mimeType });
                    
                    console.log('🔄 Conversion WebM → WAV...');
                    
                    // Convertir en WAV
                    const wavBlob = await this.convertToWAV(webmBlob);
                    
                    console.log('✅ Fichier converti en WAV:', wavBlob.size, 'bytes');
                    
                    this.recordedBlob = wavBlob;
                    resolve(wavBlob);
                    
                } catch (error) {
                    console.error('❌ Erreur lors de la conversion:', error);
                    reject(error);
                }
            };

            this.mediaRecorder.onerror = (event) => {
                reject(event.error);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Convertit un blob WebM en WAV
     * @param {Blob} webmBlob - Blob WebM à convertir
     * @returns {Promise<Blob>} Blob WAV
     */
    async convertToWAV(webmBlob) {
        try {
            // Lire le blob comme ArrayBuffer
            const arrayBuffer = await webmBlob.arrayBuffer();
            
            // Décoder l'audio
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Encoder en WAV
            const wavBlob = WavEncoder.encodeWAV(audioBuffer);
            
            return wavBlob;
            
        } catch (error) {
            console.error('❌ Erreur lors de la conversion WebM → WAV:', error);
            throw error;
        }
    }

    /**
     * Sauvegarde l'enregistrement
     * @param {Blob} blob - Blob audio à sauvegarder
     * @param {string} filename - Nom du fichier (optionnel)
     */
    saveRecording(blob, filename = null) {
        if (!blob) {
            console.error('❌ Pas de blob à sauvegarder');
            return;
        }

        // Générer un nom de fichier si non fourni
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            // Toujours utiliser .wav maintenant
            filename = `sampler-recording-${timestamp}.wav`;
        }

        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Libérer l'URL après un délai
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);

        console.log('💾 Enregistrement sauvegardé:', filename);
    }

    /**
     * Obtient la destination audio pour connecter les sources
     * @returns {MediaStreamAudioDestinationNode}
     */
    getDestination() {
        if (!this.destination) {
            this.init();
        }
        return this.destination;
    }

    /**
     * Vérifie si un enregistrement est en cours
     * @returns {boolean}
     */
    isCurrentlyRecording() {
        return this.isRecording;
    }

    /**
     * Obtient la durée de l'enregistrement en cours (en secondes)
     * @returns {number}
     */
    getRecordingDuration() {
        if (!this.isRecording || !this.startTime) return 0;
        return (Date.now() - this.startTime) / 1000;
    }

    /**
     * Nettoie les ressources
     */
    destroy() {
        if (this.isRecording) {
            this.stopRecording();
        }
        this.audioChunks = [];
        this.mediaRecorder = null;
        this.destination = null;
        console.log('🗑️  AudioRecorder détruit');
    }
}

