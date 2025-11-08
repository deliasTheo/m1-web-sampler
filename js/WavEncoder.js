/**
 * WavEncoder - Encode un AudioBuffer en fichier WAV
 * Permet d'enregistrer en format WAV non compressé
 */

export class WavEncoder {
    /**
     * Encode un AudioBuffer en WAV
     * @param {AudioBuffer} audioBuffer - Buffer audio à encoder
     * @returns {Blob} Blob WAV
     */
    static encodeWAV(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        // Récupérer les données audio de tous les canaux
        const channels = [];
        for (let i = 0; i < numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        // Interleave les canaux (pour stéréo)
        const interleaved = this.interleave(channels);

        // Convertir en Int16
        const dataLength = interleaved.length * (bitDepth / 8);
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        // Écrire l'en-tête WAV
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Taille du chunk fmt
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * (bitDepth / 8), true); // Byte rate
        view.setUint16(32, numberOfChannels * (bitDepth / 8), true); // Block align
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Écrire les données audio
        this.floatTo16BitPCM(view, 44, interleaved);

        return new Blob([buffer], { type: 'audio/wav' });
    }

    /**
     * Interleave les canaux audio (pour stéréo/multi-canal)
     * @param {Array<Float32Array>} channels - Tableaux de données par canal
     * @returns {Float32Array} Données entrelacées
     */
    static interleave(channels) {
        const length = channels[0].length;
        const numberOfChannels = channels.length;
        const result = new Float32Array(length * numberOfChannels);

        let offset = 0;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                result[offset++] = channels[channel][i];
            }
        }

        return result;
    }

    /**
     * Convertit des Float32 en Int16 PCM
     * @param {DataView} output - Vue de sortie
     * @param {number} offset - Offset de départ
     * @param {Float32Array} input - Données d'entrée
     */
    static floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    /**
     * Écrit une chaîne dans un DataView
     * @param {DataView} view - Vue de sortie
     * @param {number} offset - Offset
     * @param {string} string - Chaîne à écrire
     */
    static writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

