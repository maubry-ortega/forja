import React, { useEffect, useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent
} from '@ionic/react';
import { close, trophy, star, calendar, flash, flame } from 'ionicons/icons';
import recapService, { AnnualRecap } from '../../services/RecapService';

interface RecapModalProps {
    isOpen: boolean;
    onDismiss: () => void;
}

const RecapModal: React.FC<RecapModalProps> = ({ isOpen, onDismiss }) => {
    const [recap, setRecap] = useState<AnnualRecap | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadRecap();
        }
    }, [isOpen]);

    const loadRecap = async () => {
        const data = await recapService.getAnnualRecap();
        setRecap(data);
    };

    if (!recap) return null;

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="recap-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="end">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle style={{ fontWeight: 800 }}>TU AÑO EN FORJA</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <IonText color="light">
                        <h2 style={{ fontSize: '1.2rem', opacity: 0.7, marginBottom: '8px' }}>RESUMEN {new Date().getFullYear()}</h2>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '32px', background: 'linear-gradient(90deg, #ffc409, #ffecb3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            HISTORIA DE PODER
                        </h1>
                    </IonText>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="12">
                                <IonCard style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <IonCardContent style={{ textAlign: 'center', padding: '32px' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
                                        <IonText color="light">
                                            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, margin: 0 }}>{recap.totalTasksCompletadas}</h2>
                                            <p style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, opacity: 0.6 }}>Tareas Forjadas</p>
                                        </IonText>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(56, 128, 255, 0.1)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(56, 128, 255, 0.2)' }}>
                                    <IonIcon icon={calendar} color="primary" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Mes Dorado</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>{recap.mesDorado}</div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{recap.mejorMesCumplimiento}%</div>
                                </div>
                            </IonCol>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(45, 211, 111, 0.1)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(45, 211, 111, 0.2)' }}>
                                    <IonIcon icon={flame} color="success" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Días Perfectos</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ion-color-success)' }}>{recap.diasPerfectos}</div>
                                    <div style={{ fontSize: '0.7rem' }}>100% CUMPLIMIENTO</div>
                                </div>
                            </IonCol>
                        </IonRow>

                        <IonRow style={{ marginTop: '20px' }}>
                            <IonCol size="12">
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(255, 196, 9, 0.1) 0%, rgba(255, 196, 9, 0.05) 100%)',
                                    padding: '24px',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255, 196, 9, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px'
                                }}>
                                    <div style={{ width: '80px', height: '80px' }}>
                                        <img src="/assets/VARKO.png" alt="Varko Recap" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase' }}>Evolución Final</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--ion-color-warning)' }}>VARKO {recap.evolucionVarko}</div>
                                        <div style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>Tu voluntad ha transformado tu camino.</div>
                                    </div>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <IonButton expand="block" fill="outline" color="light" style={{ marginTop: '40px', '--border-radius': '16px' }} onClick={onDismiss}>
                        CONTINUAR FORJANDO
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default RecapModal;
