/**
 * Serveur simple pour servir le frontend de l'Audio Sampler
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Servir tous les fichiers statiques depuis la racine
app.use(express.static(__dirname));

// Route pour la page principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log('========================================');
    console.log('Audio Sampler Web - Frontend Server');
    console.log('========================================');
    console.log(`Serveur frontend démarré sur: http://localhost:${PORT}`);
    console.log(`\nAssurez-vous que le serveur backend est aussi lancé sur http://localhost:3000`);
    console.log('\nAppuyez sur Ctrl+C pour arrêter');
    console.log('========================================');
});

