/**
 * WaveformDrawer - Classe pour dessiner la waveform d'un sample audio
 * Calcule les pics audio et les affiche dans un canvas
 */

export class WaveformDrawer {
    constructor() {
        this.buffer = null;
        this.canvas = null;
        this.ctx = null;
        this.color = '#3498db';
        this.backgroundColor = '#1a1a1a';
        this.peaks = [];
    }

    /**
     * Initialise le drawer avec un buffer audio et un canvas
     * @param {AudioBuffer} buffer - Buffer audio à visualiser
     * @param {HTMLCanvasElement} canvas - Canvas HTML5
     * @param {string} color - Couleur de la waveform (défaut: bleu)
     */
    init(buffer, canvas, color = '#3498db') {
        this.buffer = buffer;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.color = color;
        
        // Ajuster la taille du canvas
        this.resizeCanvas();
        
        // Calculer les pics
        this.calculatePeaks();
        
        // Dessiner
        this.draw();
    }

    /**
     * Ajuste la taille du canvas à son conteneur
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    /**
     * Calcule les pics de l'audio pour la visualisation
     * Réduit les données audio à un nombre de samples égal à la largeur du canvas
     */
    calculatePeaks() {
        if (!this.buffer || !this.canvas) return;
        
        const width = this.canvas.width;
        const channelData = this.buffer.getChannelData(0); // Canal gauche (mono ou stéréo)
        const samples = channelData.length;
        const samplesPerPixel = Math.floor(samples / width);
        
        this.peaks = [];
        
        for (let i = 0; i < width; i++) {
            const start = i * samplesPerPixel;
            const end = start + samplesPerPixel;
            let min = 1.0;
            let max = -1.0;
            
            // Trouver le min et max dans cette tranche
            for (let j = start; j < end && j < samples; j++) {
                const value = channelData[j];
                if (value < min) min = value;
                if (value > max) max = value;
            }
            
            this.peaks.push({ min, max });
        }
    }

    /**
     * Dessine la waveform complète
     * @param {number} startY - Position Y de départ (défaut: centré)
     * @param {number} height - Hauteur de la waveform (défaut: hauteur canvas)
     */
    draw(startY = null, height = null) {
        if (!this.ctx || !this.canvas || this.peaks.length === 0) return;
        
        const width = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Paramètres par défaut
        if (startY === null) startY = canvasHeight / 2;
        if (height === null) height = canvasHeight;
        
        // Effacer le canvas
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, canvasHeight);
        
        // Dessiner la waveform
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
        
        const amplitude = height / 2;
        
        for (let i = 0; i < this.peaks.length && i < width; i++) {
            const peak = this.peaks[i];
            
            // Calculer les hauteurs
            const minHeight = peak.min * amplitude;
            const maxHeight = peak.max * amplitude;
            
            // Dessiner une ligne verticale pour ce pixel
            const x = i;
            const y1 = startY + minHeight;
            const y2 = startY + maxHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y1);
            this.ctx.lineTo(x, y2);
            this.ctx.stroke();
        }
        
        // Ligne centrale
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, startY);
        this.ctx.lineTo(width, startY);
        this.ctx.stroke();
    }

    /**
     * Dessine une région spécifique de la waveform
     * @param {number} startPixel - Pixel de début
     * @param {number} endPixel - Pixel de fin
     */
    drawRegion(startPixel, endPixel) {
        if (!this.ctx || !this.canvas || this.peaks.length === 0) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerY = height / 2;
        const amplitude = height / 2;
        
        // Effacer
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // Dessiner toute la waveform en gris clair
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < this.peaks.length && i < width; i++) {
            const peak = this.peaks[i];
            const minHeight = peak.min * amplitude;
            const maxHeight = peak.max * amplitude;
            const y1 = centerY + minHeight;
            const y2 = centerY + maxHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(i, y1);
            this.ctx.lineTo(i, y2);
            this.ctx.stroke();
        }
        
        // Dessiner la région sélectionnée en couleur
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = this.color;
        for (let i = Math.floor(startPixel); i <= Math.ceil(endPixel) && i < this.peaks.length; i++) {
            const peak = this.peaks[i];
            const minHeight = peak.min * amplitude;
            const maxHeight = peak.max * amplitude;
            const y1 = centerY + minHeight;
            const y2 = centerY + maxHeight;
            
            this.ctx.beginPath();
            this.ctx.moveTo(i, y1);
            this.ctx.lineTo(i, y2);
            this.ctx.stroke();
        }
    }

    /**
     * Redessine la waveform (après un resize par exemple)
     */
    redraw() {
        this.resizeCanvas();
        this.calculatePeaks();
        this.draw();
    }

    /**
     * Change la couleur de la waveform
     * @param {string} color - Nouvelle couleur
     */
    setColor(color) {
        this.color = color;
        this.draw();
    }

    /**
     * Obtient les pics calculés
     * @returns {Array} Tableau des pics
     */
    getPeaks() {
        return this.peaks;
    }

    /**
     * Obtient la durée du buffer
     * @returns {number} Durée en secondes
     */
    getDuration() {
        return this.buffer ? this.buffer.duration : 0;
    }

    /**
     * Nettoie le canvas
     */
    clear() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

