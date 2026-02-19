export interface DailyPhrase {
    phrase: string;
    author: string;
    date: string;
}

class PhraseService {
    private readonly STORAGE_KEY = 'forja_daily_phrase';

    async getDailyPhrase(): Promise<DailyPhrase | null> {
        const today = new Date().toISOString().split('T')[0];
        const cached = localStorage.getItem(this.STORAGE_KEY);

        if (cached) {
            const parsed = JSON.parse(cached) as DailyPhrase;
            if (parsed.date === today) {
                return parsed;
            }
        }

        try {
            const response = await fetch('https://www.positive-api.online/phrase/esp');
            const data = await response.json();

            // Format check (assuming the API returns { phrase: string, author: string })
            // If it returns only a string or different structure, we adapt.
            const phraseObj: DailyPhrase = {
                phrase: data.phrase || data.text || JSON.stringify(data),
                author: data.author || 'Sabiduría Komodo',
                date: today
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(phraseObj));
            return phraseObj;
        } catch (error) {
            console.error('Failed to fetch daily phrase', error);
            return null;
        }
    }
}

const phraseService = new PhraseService();
export default phraseService;
export { phraseService };
