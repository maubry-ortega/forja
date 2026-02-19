import React, { useState, useEffect } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonTextarea,
    IonText,
    IonList,
    IonFooter,
    IonIcon,
    IonBadge
} from '@ionic/react';
import { flash, alertCircle, checkmarkCircle } from 'ionicons/icons';
import { dayService } from '../../services/DayService';
import streakService, { Streak } from '../../services/StreakService';

interface DayClosureModalProps {
    isOpen: boolean;
    dateToClose: string;
    onClosed: () => void;
}

const DayClosureModal: React.FC<DayClosureModalProps> = ({ isOpen, dateToClose, onClosed }) => {
    const [reflection, setReflection] = useState('');
    const [stats, setStats] = useState<{ total: number; completed: number; percentage: number } | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);

    useEffect(() => {
        if (isOpen && dateToClose) {
            loadData();
        }
    }, [isOpen, dateToClose]);

    const loadData = async () => {
        const s = await dayService.getCompletionStats(dateToClose);
        const strk = await streakService.getStreak();
        setStats(s);
        setStreak(strk);
    };

    const handleForge = async () => {
        if (!reflection.trim()) return;

        try {
            await dayService.saveDailyLog({
                date: dateToClose,
                completed_count: stats?.completed || 0,
                total_count: stats?.total || 0,
                reflection: reflection
            });

            setReflection('');
            onClosed();
        } catch (error) {
            console.error('DayClosureModal: Forge failed', error);
        }
    };

    const isPerfect = stats?.total === 0 || stats?.percentage === 100;

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false} className="day-closure-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800 }}>JUICIO DEL DÍA</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
                <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
                    <IonText color="light">
                        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                            {new Date(dateToClose).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h2>
                    </IonText>

                    <div style={{ margin: '30px 0' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: isPerfect ? 'var(--ion-color-success)' : 'var(--ion-color-danger)', lineHeight: '1' }}>
                            {stats?.percentage.toFixed(0)}%
                        </div>
                        <IonText color="medium">
                            <p style={{ fontWeight: 600, marginTop: '8px', fontSize: '1.1rem' }}>
                                {stats?.completed} de {stats?.total} desafíos forjados
                            </p>
                        </IonText>
                    </div>

                    {isPerfect ? (
                        <div style={{ background: 'rgba(45, 211, 111, 0.1)', padding: '16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '1.5rem' }} />
                            <IonText color="success" style={{ fontWeight: 700 }}>VOLUNTAD INQUEBRANTABLE</IonText>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(235, 68, 90, 0.1)', padding: '16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <IonIcon icon={alertCircle} color="danger" style={{ fontSize: '1.5rem' }} />
                            <IonText color="danger" style={{ fontWeight: 700 }}>LA RACHA SE HA ROTO</IonText>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 10px' }}>
                    <IonText color="light">
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '16px', borderLeft: '4px solid var(--ion-color-primary)', paddingLeft: '12px', color: 'var(--ion-text-color)' }}>
                            AUTOREFLEXIÓN OBLIGATORIA
                        </p>
                    </IonText>
                    <IonTextarea
                        placeholder="Examina tu jornada. ¿Qué te detuvo? ¿Qué aprendiste para mañana? Sé brutalmente honesto contigo mismo..."
                        value={reflection}
                        onIonInput={(e) => setReflection(e.detail.value!)}
                        rows={8}
                        style={{
                            '--background': 'var(--ion-item-background, var(--ion-color-step-100))',
                            '--color': 'var(--ion-text-color)',
                            '--padding-start': '16px',
                            '--padding-end': '16px',
                            '--padding-top': '16px',
                            '--padding-bottom': '16px',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            lineHeight: '1.5'
                        }}
                    />
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <IonText color="medium">
                        <p style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Racha antes de este día: <IonBadge color="warning" style={{ borderRadius: '4px' }}><IonIcon icon={flash} /> {streak?.current_streak}</IonBadge>
                        </p>
                    </IonText>
                </div>
            </IonContent>
            <IonFooter className="ion-no-border">
                <div style={{ padding: '20px', background: 'var(--ion-background-color)' }}>
                    <IonButton
                        expand="block"
                        onClick={handleForge}
                        disabled={!reflection.trim() || reflection.trim().length < 5}
                        color={isPerfect ? "success" : "warning"}
                        style={{ height: '64px', fontSize: '1.2rem', fontWeight: 800, '--border-radius': '16px' }}
                    >
                        FORJAR VOLUNTAD
                    </IonButton>
                </div>
            </IonFooter>
        </IonModal>
    );
};

export default DayClosureModal;
