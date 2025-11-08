/**
 * NotificationManager - Système de notifications toast modernes
 * Affiche des messages stylés en haut à droite avec animations
 */

export class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    /**
     * Initialise le conteneur de notifications
     */
    init() {
        // Créer le conteneur si il n'existe pas
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Durée d'affichage en ms (0 = permanent)
     * @returns {HTMLElement} Élément de notification créé
     */
    show(message, type = 'info', duration = 5000) {
        // Créer la notification
        const notification = this.createNotification(message, type);
        
        // Ajouter au conteneur
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-suppression après la durée spécifiée
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Crée un élément de notification
     * @param {string} message - Message
     * @param {string} type - Type de notification
     * @returns {HTMLElement} Élément créé
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        // Icône selon le type
        const icon = this.getIcon(type);

        // Contenu
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Fermer">×</button>
        `;

        // Bouton de fermeture
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.hide(notification));

        return notification;
    }

    /**
     * Obtient l'icône selon le type
     * @param {string} type - Type de notification
     * @returns {string} Emoji/icône
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Cache une notification
     * @param {HTMLElement} notification - Notification à cacher
     */
    hide(notification) {
        if (!notification) return;

        // Animation de sortie
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Supprimer après l'animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Retirer de la liste
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Raccourcis pour les différents types
     */
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Efface toutes les notifications
     */
    clearAll() {
        this.notifications.forEach(notification => this.hide(notification));
        this.notifications = [];
    }
}

