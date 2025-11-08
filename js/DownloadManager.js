/**
 * DownloadManager - Gère le téléchargement des samples avec progression
 * Permet de télécharger et sauvegarder les fichiers audio
 */

import { downloadSoundWithProgress, blobToArrayBuffer, saveBlobToFile } from './soundutils.js';

/**
 * Classe pour gérer les téléchargements de samples
 */
export class DownloadManager {
    constructor() {
        this.downloads = new Map(); // Map<url, {blob, progress, status}>
        this.progressCallbacks = new Map(); // Map<url, callback>
    }

    /**
     * Télécharge un fichier avec suivi de progression
     * @param {string} url - URL du fichier
     * @param {Function} onProgress - Callback de progression (progress: 0-100)
     * @returns {Promise<Blob>} Blob téléchargé
     */
    async downloadFile(url, onProgress = null) {
        // Vérifier si déjà téléchargé
        if (this.downloads.has(url)) {
            const download = this.downloads.get(url);
            if (download.status === 'completed' && download.blob) {
                console.log(`Fichier déjà téléchargé: ${url}`);
                if (onProgress) onProgress(100);
                return download.blob;
            }
        }

        // Initialiser l'entrée de téléchargement
        this.downloads.set(url, {
            blob: null,
            progress: 0,
            status: 'downloading',
            error: null
        });

        if (onProgress) {
            this.progressCallbacks.set(url, onProgress);
        }

        try {
            // Callback interne de progression
            const progressHandler = (progress) => {
                const download = this.downloads.get(url);
                if (download) {
                    download.progress = progress;
                }
                if (onProgress) {
                    onProgress(progress);
                }
            };

            // Télécharger le fichier
            const blob = await downloadSoundWithProgress(url, progressHandler);

            // Mettre à jour l'état
            const download = this.downloads.get(url);
            if (download) {
                download.blob = blob;
                download.status = 'completed';
                download.progress = 100;
            }

            console.log(`Téléchargement terminé: ${url} (${blob.size} bytes)`);

            return blob;

        } catch (error) {
            // Enregistrer l'erreur
            const download = this.downloads.get(url);
            if (download) {
                download.status = 'error';
                download.error = error.message;
            }

            console.error(`Erreur lors du téléchargement de ${url}:`, error);
            throw error;
        }
    }

    /**
     * Télécharge plusieurs fichiers en parallèle
     * @param {Array<string>} urls - URLs des fichiers
     * @param {Function} onProgressAll - Callback de progression globale
     * @param {Function} onProgressIndividual - Callback de progression individuelle (url, progress)
     * @returns {Promise<Array>} Résultats des téléchargements
     */
    async downloadMultiple(urls, onProgressAll = null, onProgressIndividual = null) {
        console.log(`Téléchargement de ${urls.length} fichiers en parallèle...`);

        // Créer les promesses de téléchargement
        const promises = urls.map(url => {
            const progressCallback = onProgressIndividual ? 
                (progress) => onProgressIndividual(url, progress) : 
                null;

            return this.downloadFile(url, progressCallback)
                .then(blob => ({ status: 'fulfilled', value: blob, url }))
                .catch(error => ({ status: 'rejected', reason: error, url }));
        });

        // Si callback de progression globale, mettre à jour
        if (onProgressAll) {
            const checkProgress = setInterval(() => {
                const progress = this.getOverallProgress(urls);
                onProgressAll(progress);
                if (progress >= 100) {
                    clearInterval(checkProgress);
                }
            }, 100);
        }

        // Attendre tous les téléchargements
        const results = await Promise.allSettled(promises);

        // Analyser les résultats
        const fulfilled = results.filter(r => r.value?.status === 'fulfilled');
        const rejected = results.filter(r => r.value?.status === 'rejected');

        console.log(`Téléchargements terminés: ${fulfilled.length} succès, ${rejected.length} échecs`);

        if (rejected.length > 0) {
            console.warn('Fichiers en erreur:', rejected.map(r => r.value?.url));
        }

        return results;
    }

    /**
     * Calcule la progression globale pour un ensemble d'URLs
     * @param {Array<string>} urls - URLs des fichiers
     * @returns {number} Progression moyenne (0-100)
     */
    getOverallProgress(urls) {
        if (urls.length === 0) return 0;

        let totalProgress = 0;
        for (const url of urls) {
            const download = this.downloads.get(url);
            if (download) {
                totalProgress += download.progress;
            }
        }

        return Math.round(totalProgress / urls.length);
    }

    /**
     * Obtient le statut d'un téléchargement
     * @param {string} url - URL du fichier
     * @returns {Object|null} Statut du téléchargement
     */
    getDownloadStatus(url) {
        return this.downloads.get(url) || null;
    }

    /**
     * Obtient le blob téléchargé
     * @param {string} url - URL du fichier
     * @returns {Blob|null} Blob ou null si non téléchargé
     */
    getBlob(url) {
        const download = this.downloads.get(url);
        return download && download.status === 'completed' ? download.blob : null;
    }

    /**
     * Sauvegarde un blob sur le disque
     * @param {string} url - URL du fichier (pour retrouver le blob)
     * @param {string} filename - Nom du fichier à sauvegarder
     */
    saveFile(url, filename) {
        const blob = this.getBlob(url);
        
        if (!blob) {
            throw new Error('Fichier non téléchargé ou blob non disponible');
        }

        saveBlobToFile(blob, filename);
        console.log(`Fichier sauvegardé: ${filename}`);
    }

    /**
     * Sauvegarde un blob directement
     * @param {Blob} blob - Blob à sauvegarder
     * @param {string} filename - Nom du fichier
     */
    saveBlobDirect(blob, filename) {
        saveBlobToFile(blob, filename);
        console.log(`Fichier sauvegardé: ${filename}`);
    }

    /**
     * Vérifie si un fichier est déjà téléchargé
     * @param {string} url - URL du fichier
     * @returns {boolean} True si téléchargé
     */
    isDownloaded(url) {
        const download = this.downloads.get(url);
        return download && download.status === 'completed';
    }

    /**
     * Obtient la progression d'un téléchargement
     * @param {string} url - URL du fichier
     * @returns {number} Progression (0-100)
     */
    getProgress(url) {
        const download = this.downloads.get(url);
        return download ? download.progress : 0;
    }

    /**
     * Annule un téléchargement (note: ne peut pas vraiment annuler fetch, mais marque comme annulé)
     * @param {string} url - URL du fichier
     */
    cancelDownload(url) {
        const download = this.downloads.get(url);
        if (download && download.status === 'downloading') {
            download.status = 'cancelled';
            console.log(`Téléchargement annulé: ${url}`);
        }
    }

    /**
     * Efface un téléchargement du cache
     * @param {string} url - URL du fichier
     */
    clearDownload(url) {
        this.downloads.delete(url);
        this.progressCallbacks.delete(url);
    }

    /**
     * Efface tous les téléchargements du cache
     */
    clearAll() {
        this.downloads.clear();
        this.progressCallbacks.clear();
        console.log('Cache de téléchargements effacé');
    }

    /**
     * Obtient la taille totale téléchargée
     * @returns {number} Taille en bytes
     */
    getTotalSize() {
        let total = 0;
        for (const [url, download] of this.downloads) {
            if (download.blob) {
                total += download.blob.size;
            }
        }
        return total;
    }

    /**
     * Formate une taille en bytes vers un format lisible
     * @param {number} bytes - Taille en bytes
     * @returns {string} Taille formatée
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

