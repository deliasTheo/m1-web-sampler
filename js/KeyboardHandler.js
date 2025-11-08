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
     */
    getDefaultKeyMap() {
        return {
            // Contrôles
            'Space': 'play',
            'Escape': 'stop',
            
            // Pads (layout QWERTY)
            '1': 12, '2': 13, '3': 14, '4': 15,  // Ligne du haut
            'Q': 8,  'W': 9,  'E': 10, 'R': 11,  // Deuxième ligne
            'A': 4,  'S': 5,  'D': 6,  'F': 7,   // Troisième ligne
            'Z': 0,  'X': 1,  'C': 2,  'V': 3    // Ligne du bas
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

        const key = event.code.replace('Key', ''); // 'KeyA' -> 'A'
        const mapping = this.keyMap[key];

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

