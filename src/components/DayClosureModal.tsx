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
    IonFooter
} from '@ionic/react';
import { dayService } from '../services/DayService';
import streakService, { Streak } from '../services/StreakService';

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
            console.log('DayClosureModal: Forging day...', dateToClose);
            await dayService.saveDailyLog({
                date: dateToClose,
                completed_count: stats?.completed || 0,
                total_count: stats?.total || 0,
                reflection: reflection
            });

            console.log('DayClosureModal: Day forged successfully');
            setReflection('');
            onClosed();
        } catch (error) {
            console.error('DayClosureModal: Forge failed', error);
            alert('Error al forjar el día. Revisa la consola.');
        }
    };

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false} className="day-closure-modal">
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Forjar Día: {dateToClose}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <IonText color="medium">
                        <h1>Resumen del Día</h1>
                    </IonText>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {stats?.completed} / {stats?.total} Tareas
                    </div>
                    <IonText color={stats?.percentage === 100 ? 'success' : 'warning'}>
                        <h3>{stats?.percentage.toFixed(0)}% Completado</h3>
                    </IonText>
                </div>

                <IonList inset={true}>
                    <IonItem lines="none">
                        <IonLabel position="stacked">Reflexión Obligatoria</IonLabel>
                        <IonTextarea
                            placeholder="¿Qué aprendiste hoy? ¿Por qué no lograste todo? Forja tu voluntad..."
                            value={reflection}
                            onIonInput={(e) => setReflection(e.detail.value!)}
                            rows={6}
                            autoGrow={true}
                        />
                    </IonItem>
                </IonList>

                <div style={{ marginTop: '20px', padding: '0 10px' }}>
                    <IonText color="dark">
                        <p><strong>Racha Actual:</strong> {streak?.current_streak} días</p>
                    </IonText>
                </div>
            </IonContent>
            <IonFooter>
                <IonToolbar>
                    <IonButton
                        expand="block"
                        onClick={handleForge}
                        disabled={!reflection.trim()}
                        color="success"
                    >
                        FORJAR VOLUNTAD
                    </IonButton>
                </IonToolbar>
            </IonFooter>
        </IonModal>
    );
};

export default DayClosureModal;
