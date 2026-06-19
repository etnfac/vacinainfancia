import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, ToastController, IonItemSliding, IonItemOptions, IonItemOption, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline } from 'ionicons/icons';
import { register } from 'swiper/element/bundle';
import { VacinaService } from '../services/vacina.service';
import { Router } from '@angular/router';

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
  private router = inject(Router);
  private alertController = inject(AlertController);
  
  // Listas: Uma com tudo do banco, outra só com a criança selecionada
  listaTodasVacinas: any[] = []; 
  listaVacinasFiltradas: any[] = []; 

  // LISTA DINÂMICA DE CRIANÇAS
  listaCriancas: any[] = [
    { id: 'enzo', nome: 'Enzo Gabriel (3 anos)' },
    { id: 'valentina', nome: 'Valentina (8 meses)' }
  ];
  
  // Criança padrão ao abrir o app
  criancaAtual: string = 'enzo';

  novaVacina = {
    nome: '',
    data: '',
    status: 'pendente'
  };
  
  salvando: boolean = false; 

  constructor() {
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline });
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

  // --- LÓGICA DO FILTRO E CRIAÇÃO DE CRIANÇAS ---
  mudarCrianca(event: any) {
    const valorEscolhido = event.detail.value;

    if (valorEscolhido === 'NOVA_CRIANCA') {
      this.abrirAlertaNovaCrianca();
      // Volta o seletor visualmente para a criança que já estava antes
      event.target.value = this.criancaAtual; 
    } else {
      this.criancaAtual = valorEscolhido;
      this.atualizarFiltroCrianca();
    }
  }

  async abrirAlertaNovaCrianca() {
    const alert = await this.alertController.create({
      header: 'Adicionar Criança',
      message: 'Digite o nome e a idade da criança para criar uma nova caderneta.',
      inputs: [
        { name: 'nome', type: 'text', placeholder: 'Ex: Alice (1 ano)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Criar Caderneta',
          handler: (dados) => {
            if (dados.nome) {
              // Cria um ID único tirando os espaços
              const novoId = dados.nome.toLowerCase().replace(/\s/g, '');
              
              // Adiciona na lista
              this.listaCriancas.push({ id: novoId, nome: dados.nome });
              
              // Seleciona a criança nova automaticamente
              this.criancaAtual = novoId;
              this.atualizarFiltroCrianca();
            }
          }
        }
      ]
    });
    await alert.present();
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

  logout() {
    this.router.navigate(['/login']);
  }
}