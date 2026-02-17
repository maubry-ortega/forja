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
    IonIcon
} from '@ionic/react';
import { close, save } from 'ionicons/icons';
import taskService from '../services/TaskService';

interface AddTaskModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    onTaskAdded: () => void;
    date: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onDismiss, onTaskAdded, date }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState<string | undefined>(undefined);

    const handleAdd = async () => {
        if (!title.trim()) return;

        try {
            await taskService.addTask({
                title,
                completed: 0,
                date,
                due_time: time
            });
            setTitle('');
            setTime(undefined);
            onTaskAdded();
            onDismiss();
        } catch (error) {
            console.error('Failed to add task', error);
        }
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss}>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Nueva Tarea</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleAdd} disabled={!title.trim()}>
                            <IonIcon icon={save} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    <IonItem lines="full">
                        <IonLabel position="stacked">¿Qué vas a forjar?</IonLabel>
                        <IonInput
                            placeholder="Ej. Entrenar fuerza"
                            value={title}
                            onIonInput={(e) => setTitle(e.detail.value!)}
                        />
                    </IonItem>
                    <IonItem lines="full">
                        <IonLabel position="stacked">Hora (opcional)</IonLabel>
                        <IonInput
                            type="time"
                            value={time}
                            onIonInput={(e) => setTime(e.detail.value!)}
                        />
                    </IonItem>
                </IonList>
                <div className="ion-padding">
                    <IonButton expand="block" onClick={handleAdd} disabled={!title.trim()}>
                        Añadir Desafío
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default AddTaskModal;
