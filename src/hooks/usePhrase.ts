import { useState, useCallback } from 'react';
import phraseService, { DailyPhrase } from '../services/PhraseService';

export const usePhrase = () => {
    const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);

    const loadPhrase = useCallback(async () => {
        const p = await phraseService.getDailyPhrase();
        setDailyPhrase(p);
    }, []);

    return {
        dailyPhrase,
        loadPhrase
    };
};
