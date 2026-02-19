import React, { useState, useEffect } from 'react';
import { IonText, IonIcon } from '@ionic/react';
import { sunny } from 'ionicons/icons';
import './MorningGreeting.css';

const FULL_TEXT = "BUENOS DÍAS";
const PHRASE = "Hoy es un gran día para forjar tu voluntad.";

const MorningGreeting: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        const checkGreeting = () => {
            const now = new Date();
            const hour = now.getHours();
            const today = now.toISOString().split('T')[0];
            const lastShown = localStorage.getItem('last_morning_greeting');

            // Show if it's between 5 AM and 12 PM and not already shown today
            if (hour >= 5 && hour < 12 && lastShown !== today) {
                setIsVisible(true);
                localStorage.setItem('last_morning_greeting', today);
                startTypewriter();
            }
        };

        checkGreeting();
    }, []);

    const startTypewriter = () => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < FULL_TEXT.length) {
                const char = FULL_TEXT[index];
                setDisplayText(prev => prev + char);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 150);
    };

    if (!isVisible) return null;

    return (
        <div className="morning-greeting-overlay" onClick={() => setIsVisible(false)}>
            <div className="morning-greeting-content">
                <IonIcon icon={sunny} className="morning-icon" />
                <h1 className="typewriter-text">{displayText}</h1>
                <IonText color="medium">
                    <p className="morning-phrase">{PHRASE}</p>
                </IonText>
                <div className="morning-hint">Toca para continuar</div>
            </div>
        </div>
    );
};

export default MorningGreeting;
