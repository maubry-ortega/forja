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
    IonFooter,
    IonIcon,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { flash, alertCircle, checkmarkCircle, star, fitness, trophy, school } from 'ionicons/icons';
import { dayService } from '../../services/DayService';
import streakService, { Streak } from '../../services/StreakService';
import { varkoService, VarkoState } from '../../services/VarkoService';

interface DayClosureModalProps {
    isOpen: boolean;
    dateToClose: string;
    onClosed: () => void;
}

const DayClosureModal: React.FC<DayClosureModalProps> = ({ isOpen, dateToClose, onClosed }) => {
    const [reflection, setReflection] = useState('');
    const [stats, setStats] = useState<{ total: number; completed: number; percentage: number } | null>(null);
    const [streak, setStreak] = useState<Streak | null>(null);
    const [varko, setVarko] = useState<VarkoState | null>(null);

    useEffect(() => {
        if (isOpen && dateToClose) {
            loadData();
        }
    }, [isOpen, dateToClose]);

    const loadData = async () => {
        const s = await dayService.getCompletionStats(dateToClose);
        const strk = await streakService.getStreak();
        const vState = await varkoService.getVarkoState();
        setStats(s);
        setStreak(strk);
        setVarko(vState);
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

    const isPerfect = stats?.total === 0 || (stats?.percentage || 0) >= 90;

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false} className="day-closure-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800 }}>JUICIO DEL DÍA</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
                <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
                    <IonText color="light">
                        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6 }}>
                            {new Date(dateToClose).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                        </h2>
                    </IonText>

                    <div style={{ margin: '20px 0' }}>
                        <div style={{ fontSize: '4.5rem', fontWeight: 900, color: isPerfect ? 'var(--ion-color-success)' : 'var(--ion-color-danger)', lineHeight: '1', textShadow: '0 0 20px rgba(var(--ion-color-primary-rgb), 0.2)' }}>
                            {stats?.percentage.toFixed(0)}%
                        </div>
                        <IonText color="medium">
                            <p style={{ fontWeight: 700, marginTop: '8px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Cumplimiento de Voluntad
                            </p>
                        </IonText>
                    </div>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(var(--ion-color-step-100-rgb), 0.1)', padding: '12px', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Desafíos</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{stats?.completed}/{stats?.total}</div>
                                </div>
                            </IonCol>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(var(--ion-color-warning-rgb), 0.1)', padding: '12px', borderRadius: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase' }}>Humor Varko</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ion-color-warning)' }}>{varko?.mood}</div>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {isPerfect ? (
                        <div style={{ background: 'linear-gradient(90deg, rgba(45, 211, 111, 0.2), rgba(45, 211, 111, 0.1))', padding: '12px 20px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', border: '1px solid rgba(45, 211, 111, 0.3)' }}>
                            <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '1.5rem' }} />
                            <IonText color="success" style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>VOLUNTAD INQUEBRANTABLE</IonText>
                        </div>
                    ) : (
                        <div style={{ background: 'linear-gradient(90deg, rgba(235, 68, 90, 0.2), rgba(235, 68, 90, 0.1))', padding: '12px 20px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', border: '1px solid rgba(235, 68, 90, 0.3)' }}>
                            <IonIcon icon={alertCircle} color="danger" style={{ fontSize: '1.5rem' }} />
                            <IonText color="danger" style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.5px' }}>LA FORJA SE DEBILITA</IonText>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <IonText color="light">
                            <p style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', margin: 0, borderLeft: '4px solid var(--ion-color-primary)', paddingLeft: '12px' }}>
                                Examen de Conciencia
                            </p>
                        </IonText>
                        <IonBadge color="medium" style={{ opacity: 0.6, fontSize: '0.7rem' }}>OBLIGATORIO</IonBadge>
                    </div>
                    <IonTextarea
                        placeholder="¿Qué te detuvo hoy? ¿Qué fue lo más difícil? Sé brutalmente honesto..."
                        value={reflection}
                        onIonInput={(e) => setReflection(e.detail.value!)}
                        rows={6}
                        style={{
                            '--background': 'rgba(var(--ion-color-step-100-rgb), 0.1)',
                            '--color': 'var(--ion-text-color)',
                            '--padding-start': '16px',
                            '--padding-end': '16px',
                            '--padding-top': '16px',
                            '--padding-bottom': '16px',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            lineHeight: '1.5',
                            border: '1px solid rgba(var(--ion-text-color-rgb), 0.1)'
                        }}
                    />
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <IonText color="medium">
                        <p style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600 }}>
                            Racha actual: <IonBadge color="warning" style={{ borderRadius: '6px', padding: '4px 8px' }}><IonIcon icon={flash} /> {streak?.current_streak} DÍAS</IonBadge>
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
                        style={{ height: '60px', fontSize: '1.1rem', fontWeight: 800, '--border-radius': '16px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                    >
                        {isPerfect ? 'FORJAR DÍA' : 'ACEPTAR JUICIO'}
                    </IonButton>
                </div>
            </IonFooter>
        </IonModal>
    );
};

export default DayClosureModal;
