/**
 * Utilitaires généraux pour l'application Audio Sampler
 * Conversions, calculs, helpers divers
 */

/**
 * Convertit une position en pixels vers des secondes
 * @param {number} pixel - Position en pixels
 * @param {number} duration - Durée totale en secondes
 * @param {number} canvasWidth - Largeur du canvas en pixels
 * @returns {number} Position en secondes
 */
export function pixelToSeconds(pixel, duration, canvasWidth) {
    if (canvasWidth === 0) return 0;
    const ratio = pixel / canvasWidth;
    return ratio * duration;
}

/**
 * Convertit une position en secondes vers des pixels
 * @param {number} seconds - Position en secondes
 * @param {number} duration - Durée totale en secondes
 * @param {number} canvasWidth - Largeur du canvas en pixels
 * @returns {number} Position en pixels
 */
export function secondsToPixel(seconds, duration, canvasWidth) {
    if (duration === 0) return 0;
    const ratio = seconds / duration;
    return ratio * canvasWidth;
}

/**
 * Calcule la distance euclidienne entre deux points
 * @param {number} x1 - Coordonnée x du point 1
 * @param {number} y1 - Coordonnée y du point 1
 * @param {number} x2 - Coordonnée x du point 2
 * @param {number} y2 - Coordonnée y du point 2
 * @returns {number} Distance entre les deux points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamp une valeur entre un minimum et un maximum
 * @param {number} value - Valeur à clamper
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number} Valeur clampée
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Formate un temps en secondes vers un format MM:SS.ms
 * @param {number} seconds - Temps en secondes
 * @returns {string} Temps formaté
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Encode une URL pour gérer les espaces et caractères spéciaux
 * @param {string} url - URL à encoder
 * @returns {string} URL encodée
 */
export function encodeURL(url) {
    return encodeURI(url);
}

/**
 * Construit l'URL complète d'un fichier audio depuis l'URL relative
 * @param {string} relativeUrl - URL relative (ex: "./808/Kick 808X.wav")
 * @param {string} baseUrl - URL de base (ex: "http://localhost:3000/presets")
 * @returns {string} URL complète encodée
 */
export function buildAudioURL(relativeUrl, baseUrl = 'http://localhost:3000/presets') {
    // Enlever le "./" du début si présent
    const cleanPath = relativeUrl.replace(/^\.\//, '');
    // Construire l'URL complète
    const fullUrl = `${baseUrl}/${cleanPath}`;
    // Encoder les espaces et caractères spéciaux
    return encodeURL(fullUrl);
}

/**
 * Extrait le nom du fichier depuis une URL
 * @param {string} url - URL du fichier
 * @returns {string} Nom du fichier
 */
export function getFilenameFromURL(url) {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function} Fonction debouncée
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

