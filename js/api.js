/**
 * Module API pour récupérer les presets depuis le serveur REST
 */

import { buildAudioURL } from './utils.js';

/**
 * URL de base de l'API
 */
const API_BASE_URL = 'https://m1-web-backend-n06t.onrender.com';

/**
 * Récupère la liste des presets depuis l'API REST
 * @returns {Promise<Array>} Liste des presets
 */
export async function fetchPresets() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/presets`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const presets = await response.json();
        
        console.log(`${presets.length} presets récupérés depuis l'API`);
        
        return presets;
    } catch (error) {
        console.error('Erreur lors de la récupération des presets:', error);
        throw error;
    }
}

/**
 * Construit les URLs complètes pour les samples d'un preset
 * @param {Object} preset - Objet preset contenant les samples
 * @returns {Object} Preset avec URLs complètes
 */
export function buildPresetURLs(preset) {
    if (!preset || !preset.samples) {
        return preset;
    }
    
    // Cloner le preset pour ne pas modifier l'original
    const presetWithURLs = { ...preset };

    // Construire les URLs complètes pour chaque sample
    presetWithURLs.samples = preset.samples.map(sample => ({
        ...sample,
        fullUrl: buildAudioURL(sample.url, `${API_BASE_URL}`)
    }));
    
    return presetWithURLs;
}

/**
 * Récupère un preset spécifique par son nom
 * @param {string} presetName - Nom du preset
 * @returns {Promise<Object>} Preset avec URLs complètes
 */
export async function fetchPresetByName(presetName) {
    try {
        const presets = await fetchPresets();
        const preset = presets.find(p => p.name === presetName);
        
        if (!preset) {
            throw new Error(`Preset "${presetName}" non trouvé`);
        }
        
        return buildPresetURLs(preset);
    } catch (error) {
        console.error(`Erreur lors de la récupération du preset ${presetName}:`, error);
        throw error;
    }
}

/**
 * Teste la connexion à l'API
 * @returns {Promise<boolean>} True si l'API est accessible
 */
export async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/presets`, {
            method: 'HEAD'
        });
        return response.ok;
    } catch (error) {
        console.error('API non accessible:', error);
        return false;
    }
}

/**
 * Récupère les métadonnées d'un preset sans charger les samples
 * @param {Array} presets - Liste des presets
 * @returns {Array} Liste des métadonnées (nom, type, nombre de samples)
 */
export function getPresetsMetadata(presets) {
    return presets.map(preset => ({
        name: preset.name,
        type: preset.type,
        isFactoryPresets: preset.isFactoryPresets,
        sampleCount: preset.samples ? preset.samples.length : 0
    }));
}

