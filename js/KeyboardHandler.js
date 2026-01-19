/**
 * KeyboardHandler - Gestion des raccourcis clavier
 * Permet de déclencher les pads et contrôler l'application avec le clavier
 */

export class KeyboardHandler {
    constructor(samplerGUI) {
        this.gui = samplerGUI;
        this.enabled = true;
        this.keyMap = this.getDefaultKeyMap();
        
        // Bind
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    /**
     * Obtient le mapping par défaut des touches
     * Utilise event.code pour la position physique de la touche (compatible Mac/Windows)
     */
    getDefaultKeyMap() {
        return {
            // Contrôles
            'Space': 'play',
            'Escape': 'stop',
            
            // Pads (layout AZERTY)
            // Ligne du haut (pads 0-3) : touches 1, 2, 3, 4
            // Sur Mac AZERTY, ces touches produisent &, é, ", ' sans Shift, mais event.code reste Digit1-4
            'Digit1': 0, 'Digit2': 1, 'Digit3': 2, 'Digit4': 3,
            // Support supplémentaire pour Mac AZERTY (caractères produits sans Shift)
            '&': 0, 'é': 1, '"': 2, "'": 3,
            
            // Deuxième ligne (pads 4-7) : a, z, e, r
            'a': 4, 'z': 5, 'e': 6, 'r': 7,
            
            // Troisième ligne (pads 8-11) : q, s, d, f
            'q': 8, 's': 9, 'd': 10, 'f': 11,
            
            // Ligne du bas (pads 12-15) : w, x, c, v
            'w': 12, 'x': 13, 'c': 14, 'v': 15
        };
    }

    /**
     * Gère l'événement keydown
     */
    handleKeyDown(event) {
        if (!this.enabled) return;
        
        // Ignorer si on est dans un input
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'SELECT' || 
            event.target.tagName === 'TEXTAREA') {
            return;
        }

        // Utiliser event.code pour la position physique (compatible Mac/Windows)
        // et event.key pour les caractères spéciaux sur Mac AZERTY
        const keyCode = event.code;
        const keyChar = event.key;
        
        // Chercher d'abord par code (position physique), puis par caractère
        let mapping = this.keyMap[keyCode];
        if (mapping === undefined) {
            mapping = this.keyMap[keyChar];
        }

        if (mapping === undefined) return;

        // Empêcher le comportement par défaut
        event.preventDefault();

        // Actions spéciales
        if (mapping === 'play') {
            this.gui.playSample();
            return;
        }

        if (mapping === 'stop') {
            this.gui.engine.stopAll();
            this.gui.displayStatus('Lecture arrêtée', 'info');
            return;
        }

        // Déclencher un pad
        if (typeof mapping === 'number') {
            const sample = this.gui.engine.getSample(mapping);
            if (sample && sample.isLoaded) {
                this.gui.selectPad(mapping);
                this.gui.playSample(mapping);
            }
        }
    }

    /**
     * Gère l'événement keyup
     */
    handleKeyUp(event) {
        // Pour une future implémentation (arrêt du son, etc.)
    }

    /**
     * Active ou désactive le handler
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Définit un nouveau mapping de touches
     */
    setKeyMap(keyMap) {
        this.keyMap = { ...this.keyMap, ...keyMap };
    }

    /**
     * Nettoie les event listeners
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}

