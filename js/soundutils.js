/**
 * Utilitaires pour la gestion audio
 * Chargement, décodage, lecture, téléchargement avec progression
 */

/**
 * Charge et décode un fichier audio
 * @param {string} url - URL du fichier audio
 * @param {AudioContext} ctx - Contexte audio
 * @returns {Promise<AudioBuffer>} Buffer audio décodé
 */
export async function loadAndDecodeSound(url, ctx) {
    try {
        // Récupérer le fichier
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        // Récupérer l'ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        
        // Décoder l'audio
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        
        return audioBuffer;
    } catch (error) {
        console.error(`Erreur lors du chargement de ${url}:`, error);
        throw error;
    }
}

/**
 * Joue un buffer audio avec paramètres de trim
 * @param {AudioContext} ctx - Contexte audio
 * @param {AudioBuffer} buffer - Buffer audio à jouer
 * @param {number} startTime - Temps de début en secondes (défaut: 0)
 * @param {number} endTime - Temps de fin en secondes (défaut: durée totale)
 * @returns {AudioBufferSourceNode} Source node créée (pour pouvoir l'arrêter si nécessaire)
 */
export function playSound(ctx, buffer, startTime = 0, endTime = null) {
    if (!buffer) {
        throw new Error('Buffer audio invalide');
    }
    
    // Reprendre le contexte audio si nécessaire (politique autoplay)
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    
    // Créer un AudioBufferSourceNode (one-shot)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Connecter au destination
    source.connect(ctx.destination);
    
    // Calculer la durée à jouer
    const duration = endTime !== null ? endTime - startTime : buffer.duration - startTime;
    
    // Démarrer la lecture avec les paramètres de trim
    // start(when, offset, duration)
    source.start(0, startTime, duration);
    
    return source;
}

/**
 * Télécharge un fichier avec suivi de progression
 * @param {string} url - URL du fichier à télécharger
 * @param {Function} onProgress - Callback de progression (progress: 0-100)
 * @returns {Promise<Blob>} Blob du fichier téléchargé
 */
export async function downloadSoundWithProgress(url, onProgress) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        // Récupérer la taille totale
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        
        // Si on ne peut pas obtenir la taille, utiliser une approche simple
        if (!contentLength || isNaN(total)) {
            console.warn('Impossible d\'obtenir la taille du fichier, progression indisponible');
            const blob = await response.blob();
            if (onProgress) onProgress(100);
            return blob;
        }
        
        // Utiliser ReadableStream pour suivre la progression
        const reader = response.body.getReader();
        let receivedLength = 0;
        const chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            // Calculer et notifier la progression
            const progress = (receivedLength / total) * 100;
            if (onProgress) {
                onProgress(Math.round(progress));
            }
        }
        
        // Reconstruire le blob depuis les chunks
        const blob = new Blob(chunks);
        return blob;
        
    } catch (error) {
        console.error(`Erreur lors du téléchargement de ${url}:`, error);
        throw error;
    }
}

/**
 * Télécharge un fichier avec XMLHttpRequest (alternative avec progression)
 * @param {string} url - URL du fichier à télécharger
 * @param {Function} onProgress - Callback de progression (progress: 0-100)
 * @returns {Promise<Blob>} Blob du fichier téléchargé
 */
export function downloadSoundWithXHR(url, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        
        // Suivi de progression
        xhr.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(Math.round(progress));
            }
        };
        
        // Succès
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error(`Erreur HTTP: ${xhr.status} - ${xhr.statusText}`));
            }
        };
        
        // Erreur
        xhr.onerror = () => {
            reject(new Error('Erreur réseau lors du téléchargement'));
        };
        
        // Timeout
        xhr.ontimeout = () => {
            reject(new Error('Timeout lors du téléchargement'));
        };
        
        xhr.send();
    });
}

/**
 * Sauvegarde un blob sur le disque local
 * @param {Blob} blob - Blob à sauvegarder
 * @param {string} filename - Nom du fichier
 */
export function saveBlobToFile(blob, filename) {
    try {
        // Créer un URL objet
        const url = URL.createObjectURL(blob);
        
        // Créer un élément <a> temporaire
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        // Ajouter au DOM, cliquer, puis retirer
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Libérer l'URL objet après un délai
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du fichier:', error);
        throw error;
    }
}

/**
 * Convertit un Blob en ArrayBuffer
 * @param {Blob} blob - Blob à convertir
 * @returns {Promise<ArrayBuffer>} ArrayBuffer
 */
export async function blobToArrayBuffer(blob) {
    return await blob.arrayBuffer();
}

/**
 * Vérifie si le navigateur supporte Web Audio API
 * @returns {boolean} True si supporté
 */
export function isWebAudioSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
}

/**
 * Crée un AudioContext (gère les préfixes vendeurs)
 * @returns {AudioContext} Nouveau contexte audio
 */
export function createAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        throw new Error('Web Audio API non supportée par ce navigateur');
    }
    return new AudioContextClass();
}

