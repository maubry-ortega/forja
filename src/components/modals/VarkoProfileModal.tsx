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
    IonBadge,
    IonProgressBar,
    IonGrid,
    IonRow,
    IonCol
} from '@ionic/react';
import { close, star, flash, flame, trophy, briefcase, fitness, school, person, list } from 'ionicons/icons';
import { VarkoState } from '../../services/VarkoService';
import statsService, { CategoryStats } from '../../services/StatsService';

interface VarkoProfileModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    state: VarkoState | null;
}

const CATEGORY_ICONS: Record<string, string> = {
    'Trabajo': briefcase,
    'Salud': fitness,
    'Estudio': school,
    'Personal': person,
    'Otros': list
};

const VarkoProfileModal: React.FC<VarkoProfileModalProps> = ({ isOpen, onDismiss, state }) => {
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadCategoryStats();
        }
    }, [isOpen]);

    const loadCategoryStats = async () => {
        const stats = await statsService.getCategoryStats();
        setCategoryStats(stats);
    };

    if (!state) return null;

    const getMoodBadge = () => {
        switch (state.mood) {
            case 'Feroz': return { color: 'danger', icon: flame };
            case 'Motivado': return { color: 'success', icon: star };
            case 'Cansado': return { color: 'medium', icon: flash };
            default: return { color: 'primary', icon: flash };
        }
    };

    const moodBadge = getMoodBadge();
    const nextLevelExp = state.level === 'Apex' ? state.stats.total_exp : (state.level === 'Dominante' ? 1000 : (state.level === 'Cazador' ? 500 : 150));
    const prevLevelExp = state.level === 'Apex' ? 1000 : (state.level === 'Dominante' ? 500 : (state.level === 'Cazador' ? 150 : 0));
    const progressValue = Math.min(1, Math.max(0, (state.stats.total_exp - prevLevelExp) / (nextLevelExp - prevLevelExp)));

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="varko-profile-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800 }}>ESTADO DE VARKO</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ textAlign: 'center' }}>
                <div style={{ padding: '20px 0' }}>
                    <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px auto' }}>
                        <img
                            src="/assets/VARKO.png"
                            alt="Varko Mascot"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: state.mood === 'Feroz' ? 'drop-shadow(0 0 15px rgba(255,68,68,0.6))' :
                                    state.mood === 'Motivado' ? 'drop-shadow(0 0 15px rgba(45,211,111,0.6))' : 'none'
                            }}
                        />
                        <div style={{ position: 'absolute', bottom: '-5px', right: '0' }}>
                            <IonBadge color={moodBadge.color} style={{ padding: '6px 10px', borderRadius: '10px', fontSize: '0.75rem' }}>
                                <IonIcon icon={moodBadge.icon} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                {state.mood}
                            </IonBadge>
                        </div>
                    </div>

                    <IonText>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
                            VARKO {state.level}
                        </h2>
                        <p style={{ fontSize: '1rem', fontStyle: 'italic', opacity: 0.7, marginBottom: '24px', padding: '0 20px' }}>
                            "{state.message}"
                        </p>
                    </IonText>

                    <div style={{ marginBottom: '32px' }}>
                        <IonText>
                            <h3 style={{ fontWeight: 800, fontSize: '0.8rem', textAlign: 'left', padding: '0 16px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>
                                DOMINIO POR CATEGORÍA
                            </h3>
                        </IonText>
                        <IonGrid>
                            <IonRow>
                                {categoryStats.map(cat => (
                                    <IonCol size="4" key={cat.name}>
                                        <div style={{
                                            background: 'rgba(var(--ion-color-step-100-rgb), 0.05)',
                                            padding: '10px',
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            border: `1px solid ${cat.color}22`
                                        }}>
                                            <IonIcon icon={CATEGORY_ICONS[cat.name] || list} style={{ color: cat.color, fontSize: '1.4rem', marginBottom: '2px' }} />
                                            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>{cat.name}</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800 }}>Nvl {cat.level}</div>
                                        </div>
                                    </IonCol>
                                ))}
                            </IonRow>
                        </IonGrid>
                    </div>

                    <div style={{ textAlign: 'left', padding: '0 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <IonText style={{ fontWeight: 700, fontSize: '0.9rem' }}>EXPERIENCIA TOTAL</IonText>
                            <IonText color="primary" style={{ fontWeight: 800 }}>{state.stats.total_exp} XP</IonText>
                        </div>
                        <IonProgressBar value={progressValue} color="primary" style={{ height: '10px', borderRadius: '5px' }} />
                        <IonText color="medium" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block', textAlign: 'right' }}>
                            {state.level === 'Apex' ? 'Nivel Máximo' : `Próximo nivel en ${nextLevelExp - state.stats.total_exp} XP`}
                        </IonText>
                    </div>
                </div>

                <div style={{ padding: '20px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '20px', marginTop: '16px', textAlign: 'left' }}>
                    <IonText>
                        <h4 style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: '0.9rem' }}>SOBRE ESTA FORMA</h4>
                        <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem' }}>{state.description}</p>
                    </IonText>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default VarkoProfileModal;
