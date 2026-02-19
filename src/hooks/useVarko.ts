import { useState, useCallback } from 'react';
import varkoService, { VarkoState } from '../services/VarkoService';

export const useVarko = () => {
    const [varkoState, setVarkoState] = useState<VarkoState | null>(null);

    const loadVarko = useCallback(async () => {
        const state = await varkoService.getVarkoState();
        setVarkoState(state);
    }, []);

    return {
        varkoState,
        loadVarko
    };
};
