import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePhrase } from '../usePhrase';
import phraseService from '../../services/PhraseService';

vi.mock('../../services/PhraseService', () => ({
    default: {
        getDailyPhrase: vi.fn()
    }
}));

describe('usePhrase', () => {
    it('should load daily phrase', async () => {
        const mockPhrase = { phrase: 'Test Phrase', author: 'Author' };
        (phraseService.getDailyPhrase as any).mockResolvedValue(mockPhrase);

        const { result } = renderHook(() => usePhrase());

        await act(async () => {
            await result.current.loadPhrase();
        });

        expect(result.current.dailyPhrase).toEqual(mockPhrase);
    });
});
