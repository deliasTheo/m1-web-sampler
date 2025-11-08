/**
 * AudioUploader - Gère l'upload de fichiers audio depuis l'ordinateur
 * Permet d'ajouter des samples personnalisés au sampler
 */

export class AudioUploader {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    /**
     * Charge un fichier audio depuis l'ordinateur
     * @param {File} file - Fichier audio
     * @returns {Promise<Object>} { audioBuffer, blob, filename }
     */
    async loadAudioFile(file) {
        console.log('📂 Chargement du fichier:', file.name, '(', this.formatFileSize(file.size), ')');

        try {
            // Vérifier que c'est bien un fichier audio
            if (!file.type.startsWith('audio/')) {
                throw new Error('Le fichier doit être un fichier audio (WAV, MP3, OGG, etc.)');
            }

            // Lire le fichier comme ArrayBuffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);

            // Décoder l'audio
            console.log('🔄 Décodage du fichier audio...');
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            console.log('✅ Fichier décodé avec succès');
            console.log('   - Durée:', audioBuffer.duration.toFixed(2), 's');
            console.log('   - Canaux:', audioBuffer.numberOfChannels);
            console.log('   - Sample Rate:', audioBuffer.sampleRate, 'Hz');

            // Créer un blob pour pouvoir sauvegarder plus tard
            const blob = new Blob([arrayBuffer], { type: file.type });

            return {
                audioBuffer,
                blob,
                filename: file.name,
                originalFile: file
            };

        } catch (error) {
            console.error('❌ Erreur lors du chargement du fichier:', error);
            throw error;
        }
    }

    /**
     * Lit un fichier comme ArrayBuffer
     * @param {File} file - Fichier à lire
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Charge plusieurs fichiers en parallèle
     * @param {FileList|Array<File>} files - Liste de fichiers
     * @returns {Promise<Array>} Résultats des chargements
     */
    async loadMultipleFiles(files) {
        console.log(`📂 Chargement de ${files.length} fichiers...`);

        const promises = Array.from(files).map(file =>
            this.loadAudioFile(file)
                .then(result => ({ status: 'fulfilled', value: result }))
                .catch(error => ({ status: 'rejected', reason: error, filename: file.name }))
        );

        const results = await Promise.allSettled(promises);

        const fulfilled = results.filter(r => r.value?.status === 'fulfilled');
        const rejected = results.filter(r => r.value?.status === 'rejected');

        console.log(`✅ Chargement terminé: ${fulfilled.length} succès, ${rejected.length} échecs`);

        if (rejected.length > 0) {
            console.warn('Fichiers en erreur:', rejected.map(r => r.value?.filename));
        }

        return results;
    }

    /**
     * Formate une taille de fichier
     * @param {number} bytes - Taille en bytes
     * @returns {string} Taille formatée
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Extrait le nom du fichier sans extension
     * @param {string} filename - Nom du fichier
     * @returns {string} Nom sans extension
     */
    getNameWithoutExtension(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }

    /**
     * Vérifie si un fichier est supporté
     * @param {File} file - Fichier à vérifier
     * @returns {boolean} True si supporté
     */
    isAudioFileSupported(file) {
        const supportedTypes = [
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/mpeg',
            'audio/mp3',
            'audio/ogg',
            'audio/webm',
            'audio/aac',
            'audio/m4a',
            'audio/flac'
        ];

        return supportedTypes.some(type => file.type === type) || 
               file.name.match(/\.(wav|mp3|ogg|webm|m4a|aac|flac)$/i);
    }

    /**
     * Crée un input file pour sélectionner des fichiers
     * @param {Function} onFilesSelected - Callback quand des fichiers sont sélectionnés
     * @param {boolean} multiple - Permettre la sélection multiple (défaut: false)
     * @returns {HTMLInputElement} Input file créé
     */
    createFileInput(onFilesSelected, multiple = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'audio/*';
        input.multiple = multiple;
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                onFilesSelected(files);
            }
            // Réinitialiser l'input pour permettre de sélectionner le même fichier
            input.value = '';
        });

        return input;
    }
}

