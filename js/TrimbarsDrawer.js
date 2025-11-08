/**
 * TrimbarsDrawer - Classe pour gérer les trim bars interactives
 * Permet de sélectionner une région d'un sample avec deux barres draggables
 */

import { pixelToSeconds, secondsToPixel, distance, clamp } from './utils.js';

export class TrimbarsDrawer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Positions des trim bars (en pixels)
        this.leftTrimBar = 0;
        this.rightTrimBar = 0;
        
        // Durée du sample (en secondes)
        this.duration = 0;
        
        // État du drag
        this.isDragging = false;
        this.dragTarget = null; // 'left', 'right', ou null
        this.dragStartX = 0;
        
        // Paramètres visuels
        this.barWidth = 3;
        this.barColor = '#e74c3c';
        this.barHoverColor = '#c0392b';
        this.handleSize = 20;
        this.hitZone = 15; // Zone de détection de la souris
        
        // Bind des event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        // Ajouter les event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('mouseleave', this.handleMouseUp);
    }

    /**
     * Initialise les trim bars pour un nouveau sample
     * @param {number} duration - Durée du sample en secondes
     * @param {number} leftTrimSeconds - Position initiale de la barre gauche (défaut: 0)
     * @param {number} rightTrimSeconds - Position initiale de la barre droite (défaut: fin)
     */
    init(duration, leftTrimSeconds = 0, rightTrimSeconds = null) {
        this.duration = duration;
        
        if (rightTrimSeconds === null) {
            rightTrimSeconds = duration;
        }
        
        // Convertir les secondes en pixels
        this.leftTrimBar = secondsToPixel(leftTrimSeconds, duration, this.canvas.width);
        this.rightTrimBar = secondsToPixel(rightTrimSeconds, duration, this.canvas.width);
        
        // S'assurer que le canvas a la bonne taille
        this.resizeCanvas();
        
        // Dessiner
        this.draw();
    }

    /**
     * Ajuste la taille du canvas
     */
    resizeCanvas() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    /**
     * Dessine les trim bars
     */
    draw() {
        if (!this.ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Effacer le canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Dessiner la zone sombre en dehors des trim bars
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        
        // Zone avant la barre gauche
        this.ctx.fillRect(0, 0, this.leftTrimBar, height);
        
        // Zone après la barre droite
        this.ctx.fillRect(this.rightTrimBar, 0, width - this.rightTrimBar, height);
        
        // Dessiner les barres
        this.drawBar(this.leftTrimBar, 'left');
        this.drawBar(this.rightTrimBar, 'right');
    }

    /**
     * Dessine une trim bar individuelle
     * @param {number} x - Position X de la barre
     * @param {string} side - 'left' ou 'right'
     */
    drawBar(x, side) {
        const height = this.canvas.height;
        
        // Couleur de la barre
        const color = this.dragTarget === side ? this.barHoverColor : this.barColor;
        
        // Dessiner la ligne verticale
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - this.barWidth / 2, 0, this.barWidth, height);
        
        // Dessiner le handle (triangle ou rectangle en haut et en bas)
        this.ctx.fillStyle = color;
        
        // Handle du haut
        const topY = 10;
        this.ctx.beginPath();
        if (side === 'left') {
            this.ctx.moveTo(x, topY);
            this.ctx.lineTo(x + this.handleSize, topY);
            this.ctx.lineTo(x, topY + this.handleSize);
        } else {
            this.ctx.moveTo(x, topY);
            this.ctx.lineTo(x - this.handleSize, topY);
            this.ctx.lineTo(x, topY + this.handleSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Handle du bas
        const bottomY = height - 10;
        this.ctx.beginPath();
        if (side === 'left') {
            this.ctx.moveTo(x, bottomY);
            this.ctx.lineTo(x + this.handleSize, bottomY);
            this.ctx.lineTo(x, bottomY - this.handleSize);
        } else {
            this.ctx.moveTo(x, bottomY);
            this.ctx.lineTo(x - this.handleSize, bottomY);
            this.ctx.lineTo(x, bottomY - this.handleSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Gère l'événement mousedown
     * @param {MouseEvent} event 
     */
    handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        // Vérifier si on clique sur une trim bar
        if (Math.abs(x - this.leftTrimBar) < this.hitZone) {
            this.isDragging = true;
            this.dragTarget = 'left';
            this.dragStartX = x;
        } else if (Math.abs(x - this.rightTrimBar) < this.hitZone) {
            this.isDragging = true;
            this.dragTarget = 'right';
            this.dragStartX = x;
        }
        
        if (this.isDragging) {
            this.canvas.style.cursor = 'grabbing';
        }
    }

    /**
     * Gère l'événement mousemove
     * @param {MouseEvent} event 
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        if (this.isDragging && this.dragTarget) {
            // Déplacer la trim bar
            if (this.dragTarget === 'left') {
                // La barre gauche ne peut pas dépasser la barre droite
                this.leftTrimBar = clamp(x, 0, this.rightTrimBar - 10);
            } else if (this.dragTarget === 'right') {
                // La barre droite ne peut pas dépasser la barre gauche
                this.rightTrimBar = clamp(x, this.leftTrimBar + 10, this.canvas.width);
            }
            
            // Redessiner
            this.draw();
        } else {
            // Changer le curseur si on survole une trim bar
            if (Math.abs(x - this.leftTrimBar) < this.hitZone || 
                Math.abs(x - this.rightTrimBar) < this.hitZone) {
                this.canvas.style.cursor = 'grab';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    /**
     * Gère l'événement mouseup
     */
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragTarget = null;
            this.canvas.style.cursor = 'grab';
            this.draw();
        }
    }

    /**
     * Obtient les positions des trim bars en secondes
     * @returns {Object} { startTime, endTime }
     */
    getTrimTimes() {
        const startTime = pixelToSeconds(this.leftTrimBar, this.duration, this.canvas.width);
        const endTime = pixelToSeconds(this.rightTrimBar, this.duration, this.canvas.width);
        return { startTime, endTime };
    }

    /**
     * Définit les positions des trim bars en secondes
     * @param {number} startTime - Temps de début en secondes
     * @param {number} endTime - Temps de fin en secondes
     */
    setTrimTimes(startTime, endTime) {
        this.leftTrimBar = secondsToPixel(startTime, this.duration, this.canvas.width);
        this.rightTrimBar = secondsToPixel(endTime, this.duration, this.canvas.width);
        this.draw();
    }

    /**
     * Réinitialise les trim bars aux positions par défaut
     */
    reset() {
        this.leftTrimBar = 0;
        this.rightTrimBar = this.canvas.width;
        this.draw();
    }

    /**
     * Nettoie les event listeners
     */
    destroy() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    }
}

