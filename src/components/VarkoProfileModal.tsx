import React from 'react';
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
    IonProgressBar
} from '@ionic/react';
import { close, trophy, flash, heart, star } from 'ionicons/icons';
import { VarkoState } from '../services/VarkoService';

interface VarkoProfileModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    state: VarkoState | null;
}

const VarkoProfileModal: React.FC<VarkoProfileModalProps> = ({ isOpen, onDismiss, state }) => {
    if (!state) return null;

    const getLevelColor = () => {
        switch (state.level) {
            case 'Apex': return 'var(--ion-color-warning)';
            case 'Dominante': return 'var(--ion-color-secondary)';
            case 'Cazador': return 'var(--ion-color-success)';
            default: return 'var(--ion-color-medium)';
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="varko-profile-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar color="dark">
                    <IonButtons slot="start">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle style={{ fontWeight: 800 }}>PERFIL DE VARKO</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': '#121212' }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                        width: '160px',
                        height: '160px',
                        margin: '0 auto 24px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: getLevelColor(),
                            opacity: 0.15,
                            borderRadius: '50%',
                            filter: 'blur(20px)'
                        }} />
                        <img
                            src="/assets/VARKO.png"
                            alt="Varko Large"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: state.level === 'Cría' ? 'grayscale(0.5)' : 'none'
                            }}
                        />
                    </div>

                    <IonText color="light">
                        <h1 style={{ fontWeight: 900, fontSize: '2.2rem', margin: '0 0 8px 0' }}>VARKO</h1>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            background: getLevelColor(),
                            color: '#000',
                            borderRadius: '20px',
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            marginBottom: '16px'
                        }}>
                            {state.level}
                        </div>
                        <p style={{ fontStyle: 'italic', opacity: 0.8, fontSize: '1.1rem', maxWidth: '80%', margin: '0 auto 32px' }}>
                            "{state.message}"
                        </p>
                    </IonText>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                                    <IonIcon icon={trophy} color="warning" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ÍNDICE FORJA</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{state.index}</div>
                                </div>
                            </IonCol>
                            <IonCol size="6">
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                                    <IonIcon icon={flash} color="warning" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>RACHA ACTUAL</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{state.streak}</div>
                                </div>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <div style={{ marginTop: '32px', textAlign: 'left', padding: '0 16px' }}>
                        <IonText color="light">
                            <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IonIcon icon={star} color="warning" />
                                PROGRESO DE EVOLUCIÓN
                            </h3>
                        </IonText>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <IonText color="medium">Maestría de Voluntad</IonText>
                                <IonText color="light">{state.index}%</IonText>
                            </div>
                            <IonProgressBar value={state.index / 100} color="warning" style={{ height: '8px', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default VarkoProfileModal;
