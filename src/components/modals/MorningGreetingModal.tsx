import React, { useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonText,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonFooter
} from '@ionic/react';
import { star, flame, leaf, trophy } from 'ionicons/icons';
import { Task } from '../../services/TaskService';

interface MorningGreetingModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    tasks: Task[];
    onMasterTaskSelected: (taskId: number) => void;
}

const MorningGreetingModal: React.FC<MorningGreetingModalProps> = ({ isOpen, onDismiss, tasks, onMasterTaskSelected }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    const handleConfirm = () => {
        if (selectedTaskId !== null) {
            onMasterTaskSelected(selectedTaskId);
            onDismiss();
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="morning-ritual-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800 }}>RITUAL MAÑANERO</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🌅</div>
                    <IonText>
                        <h1 style={{ fontWeight: 900, fontSize: '1.8rem', margin: '0 0 8px 0' }}>¡Buenos Días, Forjador!</h1>
                        <p style={{ opacity: 0.7, fontSize: '1rem' }}>
                            Cada día es una nueva oportunidad para templar tu voluntad. ¿Cuál será tu **Hito Maestro** hoy?
                        </p>
                    </IonText>
                </div>

                {tasks.length > 0 ? (
                    <>
                        <IonText color="medium">
                            <h3 style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                                SELECCIONA TU TAREA PRINCIPAL
                            </h3>
                        </IonText>
                        <IonList lines="none">
                            {tasks.map(task => (
                                <IonItem
                                    key={task.id}
                                    onClick={() => setSelectedTaskId(task.id!)}
                                    style={{
                                        '--background': selectedTaskId === task.id ? 'rgba(var(--ion-color-primary-rgb), 0.1)' : 'var(--ion-item-background, var(--ion-background-color))',
                                        borderRadius: '16px',
                                        marginBottom: '10px',
                                        border: selectedTaskId === task.id ? '1px solid var(--ion-color-primary)' : '1px solid transparent'
                                    }}
                                >
                                    <IonLabel>
                                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                                        <IonText color="medium" style={{ fontSize: '0.8rem' }}>{task.category}</IonText>
                                    </IonLabel>
                                    <IonCheckbox
                                        slot="start"
                                        checked={selectedTaskId === task.id}
                                        onIonChange={() => setSelectedTaskId(task.id!)}
                                    />
                                </IonItem>
                            ))}
                        </IonList>
                        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(var(--ion-color-warning-rgb), 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <IonIcon icon={trophy} color="warning" style={{ fontSize: '1.5rem' }} />
                            <IonText style={{ fontSize: '0.9rem' }}>
                                Completar tu <strong>Hito Maestro</strong> te otorgará el doble de experiencia hoy.
                            </IonText>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(0,0,0,0.05)', borderRadius: '20px' }}>
                        <IonText color="medium">
                            Aún no has añadido tareas para hoy. Cierra este ritual y añade tus objetivos primero.
                        </IonText>
                    </div>
                )}
            </IonContent>
            <IonFooter className="ion-no-border ion-padding">
                <IonButton
                    expand="block"
                    fill="solid"
                    disabled={selectedTaskId === null}
                    onClick={handleConfirm}
                    style={{ '--border-radius': '16px', fontWeight: 800, height: '56px' }}
                >
                    COMENZAR EL DÍA
                </IonButton>
                <IonButton expand="block" fill="clear" onClick={onDismiss} color="medium">
                    Omitir por ahora
                </IonButton>
            </IonFooter>
        </IonModal>
    );
};

export default MorningGreetingModal;
