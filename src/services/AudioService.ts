class AudioService {
    private audio: HTMLAudioElement | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
            this.audio.loop = true;
        }
    }

    async playAlarm() {
        if (!this.audio) return;

        try {
            // Un audio motivacional genérico o campanas de inicio
            this.audio.src = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // Campanas suaves motivacionales
            await this.audio.play();
        } catch (error) {
            console.error('Failed to play alarm audio', error);
        }
    }

    stopAlarm() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }
}

const audioService = new AudioService();
export default audioService;
export { audioService };
