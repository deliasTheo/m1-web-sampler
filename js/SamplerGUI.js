/**
 * SamplerGUI - Interface utilisateur pour le sampler
 * Gère l'affichage, les interactions et connecte le SamplerEngine
 */

import { WaveformDrawer } from './WaveformDrawer.js';
import { TrimbarsDrawer } from './TrimbarsDrawer.js';
import { DownloadManager } from './DownloadManager.js';
import { KeyboardHandler } from './KeyboardHandler.js';
import { AudioUploader } from './AudioUploader.js';
import { NotificationManager } from './NotificationManager.js';
import { fetchPresets, buildPresetURLs } from './api.js';
import { getFilenameFromURL } from './utils.js';
import { blobToArrayBuffer } from './soundutils.js';

export class SamplerGUI {
    constructor(samplerEngine) {
        this.engine = samplerEngine;
        this.downloadManager = new DownloadManager();
        this.keyboardHandler = null;
        this.audioUploader = null;
        this.fileInput = null;
        this.notificationManager = new NotificationManager();
        
        // Références aux éléments DOM
        this.elements = {
            presetSelect: null,
            loadAllBtn: null,
            playBtn: null,
            saveBtn: null,
            padsGrid: null,
            waveformCanvas: null,
            trimbarsCanvas: null,
            statusMessage: null,
            recordStartBtn: null,
            recordStopBtn: null,
            recordTimer: null,
            uploadAudioBtn: null
        };
        
        // État
        this.presets = [];
        this.currentPreset = null;
        this.pads = [];
        this.selectedPadIndex = null;
        this.recordingInterval = null;
        
        // Visualisation
        this.waveformDrawer = null;
        this.trimbarsDrawer = null;
        
        // Nombre de pads
        this.padCount = 16; // Grille 4x4
    }

    /**
     * Initialise l'interface utilisateur
     */
    async init() {
        try {
            // Récupérer les références DOM
            this.elements.presetSelect = document.getElementById('preset-select');
            this.elements.loadAllBtn = document.getElementById('load-all-btn');
            this.elements.playBtn = document.getElementById('play-btn');
            this.elements.saveBtn = document.getElementById('save-btn');
            this.elements.padsGrid = document.getElementById('pads-grid');
            this.elements.waveformCanvas = document.getElementById('waveform-canvas');
            this.elements.trimbarsCanvas = document.getElementById('trimbars-canvas');
            this.elements.statusMessage = document.getElementById('status-message');
            this.elements.recordStartBtn = document.getElementById('record-start-btn');
            this.elements.recordStopBtn = document.getElementById('record-stop-btn');
            this.elements.recordTimer = document.getElementById('record-timer');
            this.elements.uploadAudioBtn = document.getElementById('upload-audio-btn');

            // Vérifier que tous les éléments existent
            for (const [key, element] of Object.entries(this.elements)) {
                if (!element) {
                    throw new Error(`Élément DOM manquant: ${key}`);
                }
            }

            // Initialiser les visualisations
            this.waveformDrawer = new WaveformDrawer();
            this.trimbarsDrawer = new TrimbarsDrawer(this.elements.trimbarsCanvas);

            // Initialiser le clavier
            this.keyboardHandler = new KeyboardHandler(this);

            // Initialiser l'uploader
            this.audioUploader = new AudioUploader(this.engine.getAudioContext());
            
            // Créer l'input file (caché)
            this.fileInput = this.audioUploader.createFileInput((files) => this.handleFileUpload(files), true);
            document.body.appendChild(this.fileInput);

            // Créer les pads
            this.createPadsGrid();

            // Charger les presets
            await this.loadPresets();

            // Connecter les événements
            this.connectEvents();

            // Désactiver les boutons au départ
            this.updateButtonStates();

            this.displayStatus('Sampler prêt ! Sélectionnez un preset.', 'success');
            console.log('SamplerGUI initialisé');
            console.log('Raccourcis clavier : Z-V (pads bas), A-F (pads milieu), Q-R (pads haut), 1-4 (pads top), Espace (play)');

        } catch (error) {
            console.error('Erreur lors de l\'initialisation du GUI:', error);
            this.displayStatus('Erreur lors de l\'initialisation : ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * Charge les presets depuis l'API
     */
    async loadPresets() {
        console.log('🔄 [loadPresets] Début du chargement...');
        
        try {
            this.displayStatus('Chargement des presets...', 'info');
            console.log('🔄 [loadPresets] Appel à fetchPresets()...');
            
            this.presets = await fetchPresets();
            
            console.log('✅ [loadPresets] Presets reçus:', this.presets);
            console.log('📊 [loadPresets] Nombre de presets:', this.presets.length);

            // Remplir le menu déroulant
            console.log('🔄 [loadPresets] Appel à populatePresetMenu()...');
            this.populatePresetMenu();

            this.displayStatus(`${this.presets.length} presets chargés`, 'success');
            console.log('✅ [loadPresets] Chargement terminé avec succès');
        } catch (error) {
            console.error('❌ [loadPresets] Erreur lors du chargement des presets:', error);
            this.displayStatus('⚠️ Erreur : impossible de charger les presets. Vérifiez que le serveur backend (port 3000) est lancé.', 'error');
            
            // NE PAS throw l'erreur pour permettre à l'application de continuer
            this.presets = [];
            
            // Afficher un message d'aide dans la console
            console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.warn('⚠️  SERVEUR BACKEND NON ACCESSIBLE');
            console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.warn('Pour résoudre ce problème :');
            console.warn('1. Ouvrez un terminal');
            console.warn('2. cd server');
            console.warn('3. npm start');
            console.warn('4. Rechargez cette page');
            console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    }

    /**
     * Remplit le menu déroulant avec les presets
     */
    populatePresetMenu() {
        // Vider le select (garder l'option par défaut)
        while (this.elements.presetSelect.options.length > 1) {
            this.elements.presetSelect.remove(1);
        }

        // Ajouter les presets
        this.presets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${preset.name} (${preset.type}) - ${preset.samples.length} samples`;
            this.elements.presetSelect.appendChild(option);
        });
    }

    /**
     * Crée la grille de pads 4x4
     * IMPORTANT : L'ordre est bas en haut, gauche à droite
     */
    createPadsGrid() {
        this.elements.padsGrid.innerHTML = '';
        this.pads = [];

        // Créer 16 pads dans l'ordre: bas en haut, gauche à droite
        // On crée 4 lignes (de bas en haut) et 4 colonnes (de gauche à droite)
        for (let row = 3; row >= 0; row--) { // De bas en haut (row 3 → 0)
            for (let col = 0; col < 4; col++) { // De gauche à droite
                const padIndex = (3 - row) * 4 + col; // Calcul de l'index
                const pad = this.createPad(padIndex);
                this.pads.push(pad);
                this.elements.padsGrid.appendChild(pad);
            }
        }

        console.log(`${this.padCount} pads créés`);
    }

    /**
     * Crée un pad individuel
     * @param {number} index - Index du pad
     * @returns {HTMLElement} Élément pad
     */
    createPad(index) {
        const pad = document.createElement('div');
        pad.className = 'pad';
        pad.dataset.index = index;

        // Contenu du pad
        pad.innerHTML = `
            <div class="pad-name">Pad ${index + 1}</div>
            <div class="pad-number">#${index}</div>
            <div class="pad-progress"></div>
        `;

        // Événement clic
        pad.addEventListener('click', () => this.handlePadClick(index));

        return pad;
    }

    /**
     * Gère le clic sur un pad
     * @param {number} index - Index du pad
     */
    handlePadClick(index) {
        const sample = this.engine.getSample(index);
        
        if (!sample || !sample.isLoaded) {
            this.displayStatus('Sample non chargé', 'error');
            return;
        }

        // Sélectionner le pad
        this.selectPad(index);

        // Jouer le sample
        this.playSample(index);
    }

    /**
     * Sélectionne un pad et affiche sa waveform
     * @param {number} index - Index du pad
     */
    selectPad(index) {
        // Désélectionner tous les pads
        this.pads.forEach(pad => pad.classList.remove('selected'));

        // Sélectionner le pad actuel
        if (index >= 0 && index < this.pads.length) {
            this.pads[index].classList.add('selected');
            this.selectedPadIndex = index;
            this.engine.setCurrentSample(index);

            // Afficher la waveform
            this.displayWaveform(index);

            // Mettre à jour les boutons
            this.updateButtonStates();
        }
    }

    /**
     * Affiche la waveform d'un sample
     * @param {number} index - Index du sample
     */
    displayWaveform(index) {
        const sample = this.engine.getSample(index);

        if (!sample || !sample.isLoaded || !sample.audioBuffer) {
            // Effacer les canvas
            this.waveformDrawer.clear();
            this.trimbarsDrawer.draw();
            return;
        }

        // Dessiner la waveform
        this.waveformDrawer.init(sample.audioBuffer, this.elements.waveformCanvas);

        // Initialiser les trim bars avec les positions sauvegardées
        const trimPos = sample.getTrimPositions();
        this.trimbarsDrawer.init(sample.getDuration(), trimPos.leftTrim, trimPos.rightTrim);
    }

    /**
     * Gère la sélection d'un preset
     */
    async handlePresetSelection() {
        console.log('🔄 [handlePresetSelection] Sélection d\'un preset...');
        
        const selectedIndex = this.elements.presetSelect.value;

        if (!selectedIndex || selectedIndex === '') {
            console.log('⚠️  [handlePresetSelection] Aucun preset sélectionné');
            return;
        }

        const preset = this.presets[parseInt(selectedIndex)];
        
        if (!preset) {
            console.log('❌ [handlePresetSelection] Preset non trouvé à l\'index', selectedIndex);
            return;
        }

        console.log('✅ [handlePresetSelection] Preset trouvé:', preset.name);

        // Vider l'ancien preset
        this.clearCurrentPreset();

        // Définir le nouveau preset
        this.currentPreset = buildPresetURLs(preset);
        
        console.log('✅ [handlePresetSelection] currentPreset défini:', this.currentPreset);

        // Mettre à jour l'affichage
        this.updatePadsForPreset();

        // IMPORTANT : Mettre à jour l'état des boutons
        this.updateButtonStates();
        console.log('✅ [handlePresetSelection] Boutons mis à jour');

        this.displayStatus(`Preset "${preset.name}" sélectionné. Cliquez sur "Load All" pour charger.`, 'info');
    }

    /**
     * Met à jour les pads pour le preset actuel
     */
    updatePadsForPreset() {
        if (!this.currentPreset) return;

        const samples = this.currentPreset.samples;

        // Mettre à jour les pads avec les noms des samples
        for (let i = 0; i < this.padCount; i++) {
            const pad = this.pads[i];
            const sample = samples[i];

            if (sample) {
                const nameElement = pad.querySelector('.pad-name');
                nameElement.textContent = sample.name || `Sample ${i + 1}`;
                pad.classList.remove('error', 'ready', 'loading');
            } else {
                // Pad vide
                const nameElement = pad.querySelector('.pad-name');
                nameElement.textContent = `Pad ${i + 1}`;
                pad.classList.add('error');
            }
        }
    }

    /**
     * Charge tous les samples du preset actuel
     */
    async loadAllSamples() {
        if (!this.currentPreset) {
            this.displayStatus('Aucun preset sélectionné', 'error');
            return;
        }

        try {
            this.displayStatus('Téléchargement des samples...', 'info');
            this.elements.loadAllBtn.disabled = true;

            const samples = this.currentPreset.samples;

            // Télécharger tous les fichiers avec progression
            const urls = samples.map(s => s.fullUrl);

            console.log('urls', urls);
            await this.downloadManager.downloadMultiple(
                urls,
                (overallProgress) => {
                    this.displayStatus(`Téléchargement en cours... ${overallProgress}%`, 'info');
                },
                (url, progress) => {
                    // Trouver l'index du sample
                    const index = samples.findIndex(s => s.fullUrl === url);
                    if (index >= 0) {
                        this.updatePadProgress(index, progress);
                    }
                }
            );

            this.displayStatus('Décodage des samples...', 'info');

            // Décoder tous les samples
            const samplesData = samples.map((sample, index) => ({
                url: sample.fullUrl,
                name: sample.name || `Sample ${index}`
            }));

            // Charger les blobs déjà téléchargés dans le moteur
            for (let i = 0; i < samplesData.length; i++) {
                const data = samplesData[i];
                const blob = this.downloadManager.getBlob(data.url);

                if (blob) {
                    try {
                        // Marquer comme loading
                        this.pads[i].classList.add('loading');

                        // Convertir blob en ArrayBuffer
                        const arrayBuffer = await blobToArrayBuffer(blob);

                        // Décoder
                        const audioBuffer = await this.engine.getAudioContext().decodeAudioData(arrayBuffer);

                        // Créer le sample manuellement
                        const sample = this.engine.getSample(i);
                        if (!sample) {
                            // Créer un nouveau sample dans l'engine
                            const sampleObj = {
                                url: data.url,
                                name: data.name,
                                audioBuffer: audioBuffer,
                                blob: blob,
                                isLoaded: true,
                                isDownloaded: true,
                                error: null,
                                leftTrimSeconds: 0,
                                rightTrimSeconds: audioBuffer.duration,
                                getDuration: function() { return this.audioBuffer.duration; },
                                getTrimPositions: function() { 
                                    return { leftTrim: this.leftTrimSeconds, rightTrim: this.rightTrimSeconds }; 
                                },
                                setTrimPositions: function(left, right) {
                                    this.leftTrimSeconds = left;
                                    this.rightTrimSeconds = right;
                                }
                            };
                            this.engine.samples.push(sampleObj);
                        } else {
                            sample.audioBuffer = audioBuffer;
                            sample.blob = blob;
                            sample.isLoaded = true;
                            sample.isDownloaded = true;
                            sample.rightTrimSeconds = audioBuffer.duration;
                        }

                        // Marquer comme prêt
                        this.pads[i].classList.remove('loading');
                        this.pads[i].classList.add('ready');
                        this.updatePadProgress(i, 100);

                    } catch (error) {
                        console.error(`Erreur décodage sample ${i}:`, error);
                        this.pads[i].classList.remove('loading');
                        this.pads[i].classList.add('error');
                    }
                }
            }

            this.displayStatus('Tous les samples sont chargés !', 'success');
            this.notificationManager.success(`✅ ${samplesData.length} samples chargés avec succès !`, 3000);
            this.updateButtonStates();

        } catch (error) {
            console.error('Erreur lors du chargement des samples:', error);
            this.displayStatus('Erreur lors du chargement : ' + error.message, 'error');
        } finally {
            this.elements.loadAllBtn.disabled = false;
        }
    }

    /**
     * Met à jour la barre de progression d'un pad
     * @param {number} index - Index du pad
     * @param {number} progress - Progression (0-100)
     */
    updatePadProgress(index, progress) {
        if (index >= 0 && index < this.pads.length) {
            const pad = this.pads[index];
            const progressBar = pad.querySelector('.pad-progress');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        }
    }

    /**
     * Joue le sample sélectionné
     * @param {number} index - Index du sample (optionnel, utilise le sélectionné par défaut)
     */
    playSample(index = null) {
        if (index === null) {
            index = this.selectedPadIndex;
        }

        if (index === null) {
            this.displayStatus('Aucun sample sélectionné', 'error');
            return;
        }

        const sample = this.engine.getSample(index);

        if (!sample || !sample.isLoaded) {
            this.displayStatus('Sample non chargé', 'error');
            return;
        }

        try {
            // Récupérer les positions des trim bars
            const trimTimes = this.trimbarsDrawer.getTrimTimes();
            
            // Sauvegarder les positions de trim dans le sample
            sample.setTrimPositions(trimTimes.startTime, trimTimes.endTime);

            // Jouer le sample
            this.engine.playSample(index, trimTimes.startTime, trimTimes.endTime);

            // Animation visuelle
            const pad = this.pads[index];
            pad.classList.add('playing');
            setTimeout(() => {
                pad.classList.remove('playing');
            }, 300);

            this.displayStatus(`Lecture : ${sample.name}`, 'success');

        } catch (error) {
            console.error('Erreur lors de la lecture:', error);
            this.displayStatus('Erreur lors de la lecture : ' + error.message, 'error');
        }
    }

    /**
     * Sauvegarde le sample sélectionné
     */
    saveSample() {
        if (this.selectedPadIndex === null) {
            this.displayStatus('Aucun sample sélectionné', 'error');
            return;
        }

        const sample = this.engine.getSample(this.selectedPadIndex);

        if (!sample || !sample.blob) {
            this.displayStatus('Sample non téléchargé', 'error');
            return;
        }

        try {
            // Générer un nom de fichier
            const filename = sample.name ? `${sample.name}.wav` : `sample_${this.selectedPadIndex}.wav`;
            
            // Sauvegarder
            this.downloadManager.saveBlobDirect(sample.blob, filename);
            
            this.displayStatus(`Fichier sauvegardé : ${filename}`, 'success');

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.displayStatus('Erreur lors de la sauvegarde : ' + error.message, 'error');
        }
    }

    /**
     * Vide le preset actuel
     */
    clearCurrentPreset() {
        this.engine.clearSamples();
        this.currentPreset = null;
        this.selectedPadIndex = null;
        
        // Réinitialiser les pads
        this.pads.forEach(pad => {
            pad.classList.remove('selected', 'ready', 'loading', 'error', 'playing');
            const progressBar = pad.querySelector('.pad-progress');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        });

        // Effacer les visualisations
        if (this.waveformDrawer) {
            this.waveformDrawer.clear();
        }
        if (this.trimbarsDrawer) {
            this.trimbarsDrawer.draw();
        }

        this.updateButtonStates();
    }

    /**
     * Met à jour l'état des boutons
     */
    updateButtonStates() {
        const hasPreset = this.currentPreset !== null;
        const hasSampleSelected = this.selectedPadIndex !== null;
        const sampleLoaded = hasSampleSelected && this.engine.getSample(this.selectedPadIndex)?.isLoaded;

        this.elements.loadAllBtn.disabled = !hasPreset;
        this.elements.playBtn.disabled = !sampleLoaded;
        this.elements.saveBtn.disabled = !sampleLoaded;
    }

    /**
     * Connecte tous les événements
     */
    connectEvents() {
        // Sélection de preset
        this.elements.presetSelect.addEventListener('change', () => this.handlePresetSelection());

        // Bouton Load All
        this.elements.loadAllBtn.addEventListener('click', () => this.loadAllSamples());

        // Bouton Play
        this.elements.playBtn.addEventListener('click', () => this.playSample());

        // Bouton Save
        this.elements.saveBtn.addEventListener('click', () => this.saveSample());

        // Boutons d'enregistrement
        this.elements.recordStartBtn.addEventListener('click', () => this.startRecording());
        this.elements.recordStopBtn.addEventListener('click', () => this.stopRecording());

        // Bouton d'upload
        this.elements.uploadAudioBtn.addEventListener('click', () => this.openFileDialog());

        // Note: Le support clavier est géré par KeyboardHandler

        console.log('Événements connectés');
    }

    /**
     * Ouvre le dialog de sélection de fichiers
     */
    openFileDialog() {
        this.fileInput.click();
    }

    /**
     * Gère l'upload de fichiers audio
     * @param {FileList} files - Fichiers sélectionnés
     */
    async handleFileUpload(files) {
        console.log('📁 Upload de', files.length, 'fichier(s)...');
        this.displayStatus(`📁 Chargement de ${files.length} fichier(s)...`, 'info');

        try {
            // Charger tous les fichiers
            const results = await this.audioUploader.loadMultipleFiles(files);

            let successCount = 0;
            let errorCount = 0;

            // Ajouter chaque fichier chargé au sampler
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value?.status === 'fulfilled') {
                    const fileData = result.value.value;
                    
                    // Trouver un pad libre
                    const freePadIndex = this.findFreePad();
                    
                    if (freePadIndex !== -1) {
                        // Ajouter le sample au moteur
                        this.addUploadedSample(fileData, freePadIndex);
                        successCount++;
                    } else {
                        console.warn('⚠️  Pas de pad libre pour:', fileData.filename);
                        errorCount++;
                    }
                } else {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                this.displayStatus(`✅ ${successCount} fichier(s) ajouté(s) au sampler !`, 'success');
            }
            
            if (errorCount > 0) {
                this.displayStatus(`⚠️ ${errorCount} fichier(s) en erreur ou pas de pad libre`, 'error');
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'upload:', error);
            this.displayStatus('Erreur lors de l\'upload : ' + error.message, 'error');
        }
    }

    /**
     * Trouve un pad libre (sans sample)
     * @returns {number} Index du pad libre, ou -1 si aucun
     */
    findFreePad() {
        for (let i = 0; i < this.padCount; i++) {
            const sample = this.engine.getSample(i);
            if (!sample || !sample.isLoaded) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Ajoute un sample uploadé au sampler
     * @param {Object} fileData - Données du fichier { audioBuffer, blob, filename }
     * @param {number} padIndex - Index du pad
     */
    addUploadedSample(fileData, padIndex) {
        console.log('➕ Ajout du sample uploadé au pad', padIndex, ':', fileData.filename);

        // Créer un objet sample
        const sampleName = this.audioUploader.getNameWithoutExtension(fileData.filename);
        
        const sample = {
            url: 'uploaded://' + fileData.filename,
            name: sampleName,
            audioBuffer: fileData.audioBuffer,
            blob: fileData.blob,
            isLoaded: true,
            isDownloaded: true,
            error: null,
            leftTrimSeconds: 0,
            rightTrimSeconds: fileData.audioBuffer.duration,
            getDuration: function() { return this.audioBuffer.duration; },
            getTrimPositions: function() { 
                return { leftTrim: this.leftTrimSeconds, rightTrim: this.rightTrimSeconds }; 
            },
            setTrimPositions: function(left, right) {
                this.leftTrimSeconds = left;
                this.rightTrimSeconds = right;
            }
        };

        // Ajouter au moteur
        if (this.engine.samples[padIndex]) {
            // Remplacer le sample existant
            this.engine.samples[padIndex] = sample;
        } else {
            // Ajouter à la fin et combler les trous
            while (this.engine.samples.length < padIndex) {
                this.engine.samples.push(null);
            }
            this.engine.samples[padIndex] = sample;
        }

        // Mettre à jour le pad
        const pad = this.pads[padIndex];
        if (pad) {
            const nameElement = pad.querySelector('.pad-name');
            nameElement.textContent = sampleName;
            pad.classList.remove('error', 'loading');
            pad.classList.add('ready');
            
            const progressBar = pad.querySelector('.pad-progress');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }

        console.log('✅ Sample uploadé ajouté avec succès au pad', padIndex);
    }

    /**
     * Démarre l'enregistrement de la session
     */
    startRecording() {
        try {
            console.log('🔴 Démarrage de l\'enregistrement...');
            
            // Démarrer l'enregistrement
            this.engine.recorder.startRecording();
            
            // Mettre à jour l'interface
            this.elements.recordStartBtn.disabled = true;
            this.elements.recordStartBtn.classList.add('recording');
            this.elements.recordStopBtn.disabled = false;
            
            // Démarrer le timer
            this.startRecordingTimer();
            
            this.displayStatus('🔴 Enregistrement en cours... Jouez vos samples !', 'info');
            this.notificationManager.info('🔴 Enregistrement démarré ! Jouez vos samples...', 4000);
            
        } catch (error) {
            console.error('❌ Erreur lors du démarrage de l\'enregistrement:', error);
            this.displayStatus('Erreur lors de l\'enregistrement : ' + error.message, 'error');
        }
    }

    /**
     * Arrête l'enregistrement et sauvegarde
     */
    async stopRecording() {
        try {
            console.log('🛑 Arrêt de l\'enregistrement...');
            
            // Arrêter l'enregistrement
            const blob = await this.engine.recorder.stopRecording();
            
            // Arrêter le timer
            this.stopRecordingTimer();
            
            // Mettre à jour l'interface
            this.elements.recordStartBtn.disabled = false;
            this.elements.recordStartBtn.classList.remove('recording');
            this.elements.recordStopBtn.disabled = true;
            
            if (blob) {
                // Sauvegarder automatiquement
                this.engine.recorder.saveRecording(blob);
                this.displayStatus('✅ Enregistrement sauvegardé avec succès !', 'success');
            } else {
                this.displayStatus('⚠️ Aucun enregistrement à sauvegarder', 'error');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'arrêt de l\'enregistrement:', error);
            this.displayStatus('Erreur lors de l\'arrêt : ' + error.message, 'error');
        }
    }

    /**
     * Démarre le timer d'enregistrement
     */
    startRecordingTimer() {
        this.recordingInterval = setInterval(() => {
            const duration = this.engine.recorder.getRecordingDuration();
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.elements.recordTimer.textContent = timeString;
        }, 100);
    }

    /**
     * Arrête le timer d'enregistrement
     */
    stopRecordingTimer() {
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
            this.recordingInterval = null;
        }
        this.elements.recordTimer.textContent = '00:00';
    }

    /**
     * Nettoie les ressources
     */
    destroy() {
        if (this.keyboardHandler) {
            this.keyboardHandler.destroy();
        }
        if (this.trimbarsDrawer) {
            this.trimbarsDrawer.destroy();
        }
        console.log('SamplerGUI détruit');
    }

    /**
     * Affiche un message de statut
     * @param {string} message - Message à afficher
     * @param {string} type - Type: 'info', 'success', 'error', 'warning'
     */
    displayStatus(message, type = 'info') {
        // Afficher dans la barre de statut (en bas)
        if (this.elements.statusMessage) {
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = type;
        }
        
        // Messages à ne PAS afficher en notification (trop fréquents ou peu importants)
        const skipNotification = 
            message.toLowerCase().startsWith('lecture') ||
            message.includes('Sampler prêt') ||
            message.includes('preset chargés') ||
            message.includes('Chargement des presets') ||
            message.includes('Décodage des samples');
        
        // Afficher une notification toast (en haut à droite) pour les messages importants seulement
        if (!skipNotification) {
            if (type === 'error') {
                this.notificationManager.error(message, 6000);
            } else if (type === 'success') {
                this.notificationManager.success(message, 4000);
            } else if (type === 'warning') {
                this.notificationManager.warning(message, 5000);
            }
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

