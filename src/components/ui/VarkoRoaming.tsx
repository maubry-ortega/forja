import React, { useEffect, useState, useRef } from 'react';
import { VarkoState } from '../../services/VarkoService';

interface VarkoRoamingProps {
    state: VarkoState | null;
}

const VarkoRoaming: React.FC<VarkoRoamingProps> = ({ state }) => {
    const [position, setPosition] = useState({ x: 50, y: 70 });
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [isWalking, setIsWalking] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!state) return;

        const moveVarko = () => {
            setIsWalking(true);
            const step = (Math.random() * 25 + 15);

            setPosition(prev => {
                const deltaX = Math.random() > 0.5 ? step : -step;
                const deltaY = Math.random() > 0.5 ? step : -step;

                const newX = Math.max(0, Math.min(90, prev.x + deltaX));
                const newY = Math.max(0, Math.min(90, prev.y + deltaY));

                setDirection(deltaX > 0 ? 'right' : 'left');
                return { x: newX, y: newY };
            });

            setTimeout(() => setIsWalking(false), 800);
        };

        const interval = setInterval(() => {
            if (Math.random() > 0.5) {
                moveVarko();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [state]);

    if (!state) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: `${position.y}%`,
            left: `${position.x}%`,
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 9999,
            transition: 'all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <img
                src="/assets/VARKO.png"
                alt="Varko Roaming"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `scaleX(${direction === 'right' ? 1 : -1}) ${isWalking ? 'translateY(-5px)' : 'none'}`,
                    transition: 'transform 0.5s ease',
                    filter: state.level === 'Cría' ? 'grayscale(0.5)' : 'none',
                }}
            />
            {isWalking && (
                <div style={{
                    fontSize: '10px',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    marginTop: '-10px',
                    whiteSpace: 'nowrap'
                }}>
                    {state.level === 'Apex' ? 'Dominando...' : 'Explorando...'}
                </div>
            )}
        </div>
    );
};

export default VarkoRoaming;
