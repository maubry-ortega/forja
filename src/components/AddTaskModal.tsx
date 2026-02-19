import React, { useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonButtons,
    IonIcon,
    IonText,
    IonSelect,
    IonSelectOption
} from '@ionic/react';
import { close, flash, briefcase, fitness, school, person, list } from 'ionicons/icons';
import taskService from '../services/TaskService';

interface AddTaskModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    onTaskAdded: () => void;
    date: string;
}

const CATEGORIES = [
    { label: 'Trabajo', value: 'Trabajo', icon: briefcase },
    { label: 'Salud', value: 'Salud', icon: fitness },
    { label: 'Estudio', value: 'Estudio', icon: school },
    { label: 'Personal', value: 'Personal', icon: person },
    { label: 'Otros', value: 'Otros', icon: list },
];

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onDismiss, onTaskAdded, date }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState('Otros');

    const handleAdd = async () => {
        if (!title.trim()) return;

        try {
            await taskService.addTask({
                title,
                completed: 0,
                category,
                date,
                due_time: time
            });
            setTitle('');
            setTime(undefined);
            setCategory('Otros');
            onTaskAdded();
            onDismiss();
        } catch (error) {
            console.error('Failed to add task', error);
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="add-task-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                    <IonTitle style={{ fontWeight: 700 }}>Nuevo Desafío</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleAdd} disabled={!title.trim()} color="primary" style={{ fontWeight: 700 }}>
                            LISTO
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" style={{ '--background': 'var(--ion-background-color)' }}>
                <div style={{ padding: '20px 0' }}>
                    <IonText color="medium">
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', marginLeft: '12px', marginBottom: '12px' }}>FORJANDO VOLUNTAD</p>
                    </IonText>

                    <IonList lines="none" style={{ background: 'transparent' }}>
                        <IonItem style={{
                            '--background': 'var(--ion-color-step-100, #f4f4f4)',
                            '--border-radius': '16px',
                            '--padding-start': '16px',
                            marginBottom: '16px',
                            '--box-shadow': '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <IonLabel position="stacked" color="primary" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>NOMBRE DEL DESAFÍO</IonLabel>
                            <IonInput
                                placeholder="¿Qué vas a conquistar hoy?"
                                value={title}
                                onIonInput={(e) => setTitle(e.detail.value!)}
                                style={{ fontSize: '1.2rem', fontWeight: 500, '--padding-top': '8px', '--padding-bottom': '12px' }}
                            />
                        </IonItem>

                        <IonItem style={{
                            '--background': 'var(--ion-color-step-100, #f4f4f4)',
                            '--border-radius': '16px',
                            '--padding-start': '16px',
                            marginBottom: '16px',
                            '--box-shadow': '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <IonLabel position="stacked" color="primary" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>CATEGORÍA</IonLabel>
                            <IonSelect
                                value={category}
                                interface="popover"
                                onIonChange={(e) => setCategory(e.detail.value)}
                                style={{ width: '100%', '--padding-top': '8px', '--padding-bottom': '12px' }}
                            >
                                {CATEGORIES.map(cat => (
                                    <IonSelectOption key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                        <IonItem style={{
                            '--background': 'var(--ion-color-step-100, #f4f4f4)',
                            '--border-radius': '16px',
                            '--padding-start': '16px',
                            '--box-shadow': '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <IonLabel position="stacked" color="primary" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
                                <IonIcon icon={flash} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                HORA PROGRAMADA
                            </IonLabel>
                            <IonInput
                                type="time"
                                value={time}
                                onIonInput={(e) => setTime(e.detail.value!)}
                                style={{ fontSize: '1.2rem', fontWeight: 500, '--padding-top': '8px', '--padding-bottom': '12px' }}
                            />
                        </IonItem>
                    </IonList>
                </div>

                <div style={{ marginTop: '32px', padding: '0 12px' }}>
                    <IonButton expand="block" onClick={handleAdd} disabled={!title.trim()} style={{ height: '60px', '--border-radius': '16px', fontWeight: 800, fontSize: '1.2rem', '--box-shadow': '0 8px 16px rgba(56, 128, 255, 0.3)' }} color="primary">
                        Añadir al Plan
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>

    );
};

export default AddTaskModal;
