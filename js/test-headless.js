/**
 * Test headless du SamplerEngine
 * Démontre que le moteur peut fonctionner sans interface graphique
 * 
 * Pour exécuter ce test :
 * 1. Ouvrir la console du navigateur
 * 2. Importer ce module
 * 3. Appeler testHeadless()
 */

import { SamplerEngine } from './SamplerEngine.js';

/**
 * Test headless du SamplerEngine
 */
export async function testHeadless() {
    console.log('========================================');
    console.log('Test Headless du SamplerEngine');
    console.log('========================================');

    try {
        // 1. Créer et initialiser le moteur
        console.log('\n1. Initialisation du moteur...');
        const engine = new SamplerEngine();
        await engine.init();
        console.log('✓ Moteur initialisé');
        console.log(`   - Sample Rate: ${engine.getAudioContext().sampleRate} Hz`);
        console.log(`   - État: ${engine.getAudioContext().state}`);

        // 2. Charger un sample (remplacer par une vraie URL)
        console.log('\n2. Chargement d\'un sample...');
        const testUrl = 'https://m1-web-backend.onrender.com/presets/808/Kick%20808X.wav';
        
        try {
            const index = await engine.loadSample(testUrl, 'Test Kick');
            console.log(`✓ Sample chargé à l'index ${index}`);
            
            const sample = engine.getSample(index);
            console.log(`   - Nom: ${sample.name}`);
            console.log(`   - Durée: ${sample.getDuration().toFixed(3)} secondes`);
            console.log(`   - Channels: ${sample.audioBuffer.numberOfChannels}`);
            console.log(`   - Sample Rate: ${sample.audioBuffer.sampleRate} Hz`);

            // 3. Définir les trim bars
            console.log('\n3. Configuration des trim bars...');
            const duration = sample.getDuration();
            engine.setTrimPositions(index, 0, duration * 0.5); // Première moitié
            const trim = engine.getTrimPositions(index);
            console.log(`✓ Trim configuré: ${trim.leftTrim.toFixed(3)}s - ${trim.rightTrim.toFixed(3)}s`);

            // 4. Jouer le sample
            console.log('\n4. Lecture du sample...');
            engine.playSample(index);
            console.log('✓ Lecture démarrée (première moitié)');

            // Attendre 2 secondes
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Jouer le sample entier
            console.log('\n5. Lecture du sample entier...');
            engine.setTrimPositions(index, 0, duration);
            engine.playSample(index);
            console.log('✓ Lecture du sample entier');

            // 6. Informations sur le moteur
            console.log('\n6. Informations du moteur:');
            console.log(`   - Nombre de samples: ${engine.getSampleCount()}`);
            console.log(`   - Sample actuel: ${engine.getCurrentSample()?.name || 'aucun'}`);
            console.log(`   - Sources en lecture: ${engine.currentlyPlayingSources.length}`);

        } catch (error) {
            console.error('✗ Erreur lors du chargement du sample:', error);
            console.log('Note: Assurez-vous que le serveur est lancé et que l\'URL est valide');
        }

        // 7. Test de chargement multiple
        console.log('\n7. Test de chargement multiple...');
        const samples = [
            { url: 'https://m1-web-backend.onrender.com/presets/808/Kick 808X.wav', name: 'kick' },
            { url: 'https://m1-web-backend.onrender.com/presets/808/Snare 808 1.wav', name: 'snare1' }
        ];

        try {
            const results = await engine.loadSamples(samples);
            console.log(`✓ Chargement multiple terminé`);
            console.log(`   - Nombre total de samples: ${engine.getSampleCount()}`);
        } catch (error) {
            console.error('✗ Erreur lors du chargement multiple:', error);
        }

        console.log('\n========================================');
        console.log('Test Headless terminé avec succès !');
        console.log('========================================');

        return engine;

    } catch (error) {
        console.error('\n✗ Erreur lors du test headless:', error);
        throw error;
    }
}

/**
 * Test rapide du moteur
 */
export async function quickTest() {
    console.log('Test rapide du SamplerEngine...');
    
    const engine = new SamplerEngine();
    await engine.init();
    
    console.log('✓ Moteur prêt');
    console.log(`  Sample Rate: ${engine.getAudioContext().sampleRate} Hz`);
    console.log(`  État: ${engine.isReady() ? 'Prêt' : 'Non prêt'}`);
    
    return engine;
}

// Exposer les fonctions globalement pour faciliter les tests dans la console
window.testHeadless = testHeadless;
window.quickTest = quickTest;

console.log('Module de test headless chargé. Utilisez testHeadless() ou quickTest() dans la console.');

