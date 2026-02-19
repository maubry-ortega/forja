import React, { useEffect, useState, useRef, useCallback } from 'react';
import { VarkoState } from '../../services/VarkoService';
import { IonText } from '@ionic/react';

interface VarkoRoamingProps {
    state: VarkoState | null;
}

const VARKO_MESSAGES: Record<string, string[]> = {
    'Cansado': ['¡Necesitamos movernos!', '¿Una tarea más?', 'Me siento pesado...', 'No te rindas ahora.'],
    'Neutral': ['Te observo.', 'El camino es largo.', 'Paso a paso.', '¿Qué sigue?'],
    'Motivado': ['¡Buen ritmo!', 'Siento la fuerza.', '¡A por todas!', '¡Increíble!'],
    'Feroz': ['¡SOY INVENCIBLE!', '¡Siente el poder!', '¡NADA ME DETIENE!', '¡FUEGO EN LA SANGRE!']
};

const VarkoRoaming: React.FC<VarkoRoamingProps> = ({ state }) => {
    const [position, setPosition] = useState({ x: 50, y: 70 });
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [isWalking, setIsWalking] = useState(false);
    const [activeMessage, setActiveMessage] = useState<string | null>(null);
    const [isBouncing, setIsBouncing] = useState(false);

    const moveVarko = useCallback(() => {
        setIsWalking(true);
        const step = (Math.random() * 25 + 15);

        setPosition(prev => {
            const deltaX = Math.random() > 0.5 ? step : -step;
            const deltaY = Math.random() > 0.5 ? step : -step;

            const newX = Math.max(5, Math.min(85, prev.x + deltaX));
            const newY = Math.max(10, Math.min(80, prev.y + deltaY));

            setDirection(deltaX > 0 ? 'right' : 'left');
            return { x: newX, y: newY };
        });

        setTimeout(() => setIsWalking(false), 800);
    }, []);

    useEffect(() => {
        if (!state) return;

        const interval = setInterval(() => {
            if (Math.random() > 0.6) {
                moveVarko();
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [state, moveVarko]);

    const handleTap = () => {
        if (!state) return;

        setIsBouncing(true);
        const moodMessages = VARKO_MESSAGES[state.mood] || VARKO_MESSAGES['Neutral'];
        const randomMsg = moodMessages[Math.floor(Math.random() * moodMessages.length)];
        setActiveMessage(randomMsg);

        setTimeout(() => {
            setIsBouncing(false);
            setActiveMessage(null);
        }, 2000);
    };

    if (!state) return null;

    const getMoodColor = () => {
        switch (state.mood) {
            case 'Feroz': return 'rgba(255, 68, 68, 0.4)';
            case 'Motivado': return 'rgba(45, 211, 111, 0.4)';
            case 'Cansado': return 'rgba(146, 148, 156, 0.4)';
            default: return 'transparent';
        }
    };

    return (
        <div
            onClick={handleTap}
            style={{
                position: 'fixed',
                bottom: `${position.y}%`,
                left: `${position.x}%`,
                width: '100px',
                height: '100px',
                zIndex: 9999,
                transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}
        >
            {activeMessage && (
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    background: 'var(--ion-card-background, #fff)',
                    color: 'var(--ion-text-color, #000)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap',
                    animation: 'fadeIn 0.3s ease-out',
                    border: `2px solid ${getMoodColor() !== 'transparent' ? getMoodColor() : 'var(--ion-color-primary)'}`
                }}>
                    {activeMessage}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        background: 'inherit',
                        borderRight: 'inherit',
                        borderBottom: 'inherit'
                    }} />
                </div>
            )}

            <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '60px',
                    height: '20px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '50%',
                    bottom: '5px',
                    filter: 'blur(4px)',
                    transform: isWalking ? 'scale(0.8)' : 'scale(1)',
                    transition: 'transform 0.4s ease'
                }} />
                <img
                    src="/assets/VARKO.png"
                    alt="Varko Roaming"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `scaleX(${direction === 'right' ? 1 : -1}) ${isWalking || isBouncing ? 'translateY(-10px)' : 'none'}`,
                        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        filter: state.level === 'Cría' ? 'grayscale(0.5)' :
                            state.mood === 'Feroz' ? 'drop-shadow(0 0 8px rgba(255,0,0,0.5))' : 'none',
                    }}
                />
            </div>

            {!activeMessage && isWalking && (
                <div style={{
                    fontSize: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    marginTop: '-5px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none'
                }}>
                    {state.level === 'Apex' ? 'Dominando...' : 'Explorando...'}
                </div>
            )}
        </div>
    );
};

export default VarkoRoaming;
