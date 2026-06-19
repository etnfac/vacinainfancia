import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgClass } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [NgClass, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage {
  
  // Banco de dados local
  listaVacinas = [
    { id: 1, nome: 'BCG (Tuberculose)', data: '15/01/2023', status: 'concluida' },
    { id: 2, nome: 'Poliomielite 1ª Dose', data: '15/03/2023', status: 'concluida' },
    { id: 3, nome: 'Tríplice Viral', data: '22/06/2026', status: 'pendente' },
    { id: 4, nome: 'Hepatite A', data: '10/05/2026', status: 'atrasada' }
  ];

  constructor() {
    // Registrando os ícones
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle });
  }
}