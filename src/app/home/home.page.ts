import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, ToastController, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { VacinaService } from '../services/vacina.service';

register();

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [NgClass, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  
  private vacinaService = inject(VacinaService);
  private toastController = inject(ToastController);
  
  // Listas: Uma com tudo do banco, outra só com a criança selecionada
  listaTodasVacinas: any[] = []; 
  listaVacinasFiltradas: any[] = []; 
  
  // Criança padrão ao abrir o app
  criancaAtual: string = 'enzo';

  novaVacina = {
    nome: '',
    data: '',
    status: 'pendente'
  };
  
  salvando: boolean = false; 

  constructor() {
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline });
  }

  ngOnInit() {
    this.vacinaService.getVacinas().subscribe((dados: any[]) => {
      this.listaTodasVacinas = dados.map(v => {
        let statusTratado = v.status ? v.status.toLowerCase().trim() : 'pendente';
        statusTratado = statusTratado.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        
        let donoDaVacina = v.crianca ? v.crianca : 'enzo';

        return { ...v, status: statusTratado, crianca: donoDaVacina };
      });
      
      this.atualizarFiltroCrianca();
    });
  }

  // FILTRO DE CRIANÇAS
  mudarCrianca(event: any) {
    this.criancaAtual = event.detail.value;
    this.atualizarFiltroCrianca();
  }

  atualizarFiltroCrianca() {
    this.listaVacinasFiltradas = this.listaTodasVacinas.filter(v => v.crianca === this.criancaAtual);
  }

  salvarVacina(modal: any) {
    if (this.novaVacina.nome === '' || this.novaVacina.data === '') {
      alert('Por favor, preencha o Nome e a Data da vacina!');
      return;
    }

    this.salvando = true;

    const dataQuebrada = this.novaVacina.data.split('-');
    const dataFormatada = `${dataQuebrada[2]}/${dataQuebrada[1]}/${dataQuebrada[0]}`;

    const pacoteParaSalvar = {
      nome: this.novaVacina.nome,
      data: dataFormatada,
      status: this.novaVacina.status,
      crianca: this.criancaAtual
    };

    this.vacinaService.addVacina(pacoteParaSalvar).then(async () => {
      this.novaVacina = { nome: '', data: '', status: 'pendente' };
      modal.dismiss();
      this.salvando = false; 

      const toast = await this.toastController.create({
        message: 'Vacina salva com sucesso!',
        duration: 2500,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-circle'
      });
      await toast.present();

    }).catch(erro => {
      console.error("Erro ao salvar:", erro);
      this.salvando = false; 
      alert('Ocorreu um erro ao salvar a vacina no Firebase.');
    });
  }

  // Apagar a vacina
  async deletarVacina(id: string) {
    try {
      await this.vacinaService.deletarVacina(id);
      
      const toast = await this.toastController.create({
        message: 'Vacina removida da caderneta.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'trash-outline'
      });
      await toast.present();
    } catch (erro) {
      console.error("Erro ao deletar:", erro);
      alert('Erro ao excluir a vacina.');
    }
  }

  trocarIdioma() {
    alert('🌐 A tradução será ativada na Fase de Internacionalização!');
  }

  toggleAcessibilidade(tipo: string) {
    if (tipo === 'contraste') {
      document.body.classList.toggle('alto-contraste');
    } else if (tipo === 'fonte') {
      document.body.classList.toggle('fonte-ampliada');
    }
  }
}