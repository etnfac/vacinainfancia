import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { addIcons } from 'ionicons';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, ToastController, IonItemSliding, IonItemOptions, IonItemOption, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline } from 'ionicons/icons';
import { VacinaService } from '../services/vacina.service';

register();

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [NgClass, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, IonItemSliding, IonItemOptions, IonItemOption],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  
  private vacinaService = inject(VacinaService);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private router = inject(Router);

  listaTodasVacinas: any[] = []; 
  listaVacinasFiltradas: any[] = []; 
  
  listaCriancas: any[] = [
    { id: 'enzo', nome: 'Enzo Gabriel (3 anos)' },
    { id: 'valentina', nome: 'Valentina (8 meses)' }
  ];

  criancaAtual: string = 'enzo';
  fotoPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  isModalCriancaOpen: boolean = false;
  novaCriancaForm = { nome: '', idade: null as number | null, tipoIdade: 'anos' };

  novaVacina = { nome: '', data: '', status: 'pendente' };
  salvando: boolean = false; 

  constructor() {
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline});
  }

  ngOnInit() {
    const fotoSalva = localStorage.getItem('fotoPerfilCaderneta');
    if (fotoSalva) {
      this.fotoPerfil = fotoSalva;
    }

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

  carregarFotoPerfil(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (e: any) => {
        this.fotoPerfil = e.target.result;
        localStorage.setItem('fotoPerfilCaderneta', this.fotoPerfil);
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  mudarCrianca(event: any) {
    const valorEscolhido = event.detail.value;

    if (valorEscolhido === 'NOVA_CRIANCA') {
      this.isModalCriancaOpen = true;
      event.target.value = this.criancaAtual; 
    } else {
      this.criancaAtual = valorEscolhido;
      this.atualizarFiltroCrianca();
    }
  }

  fecharModalCrianca() {
    this.isModalCriancaOpen = false;
  }

  // GERENCIAR CRIANÇA (EDITAR/EXCLUIR)
  async gerenciarCrianca() {
    const crianca = this.listaCriancas.find(c => c.id === this.criancaAtual);
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Gerenciando: ${crianca.nome}`,
      buttons: [
        { text: 'Editar Nome/Idade', icon: 'create-outline', handler: () => this.renomearCriancaAtual(crianca) },
        { text: 'Excluir Caderneta', role: 'destructive', icon: 'trash-outline', handler: () => this.excluirCriancaAtual(crianca) },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async renomearCriancaAtual(crianca: any) {
    const alert = await this.alertController.create({
      header: 'Editar Criança',
      inputs: [ { name: 'novoNome', type: 'text', value: crianca.nome, placeholder: 'Ex: Lucas (4 anos)' } ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (dados) => {
            if (dados.novoNome) crianca.nome = dados.novoNome;
          }
        }
      ]
    });
    await alert.present();
  }

  async excluirCriancaAtual(crianca: any) {
    if (this.listaCriancas.length <= 1) {
      return alert('Atenção: Você precisa manter pelo menos uma criança cadastrada!');
    }
    // Remove da lista
    this.listaCriancas = this.listaCriancas.filter(c => c.id !== crianca.id);
    this.criancaAtual = this.listaCriancas[0].id;
    this.atualizarFiltroCrianca();
  }

  salvarNovaCrianca() {
    if (!this.novaCriancaForm.nome || this.novaCriancaForm.idade === null) {
      return alert('Preencha o nome e a idade!');
    }
    if (this.novaCriancaForm.tipoIdade === 'anos' && this.novaCriancaForm.idade > 18) {
      return alert('O sistema é focado na infância (até 18 anos).');
    }
    if (this.novaCriancaForm.tipoIdade === 'meses' && this.novaCriancaForm.idade > 11) {
      return alert('A partir de 12 meses, por favor selecione "Anos".');
    }

    const nomeFormatado = `${this.novaCriancaForm.nome} (${this.novaCriancaForm.idade} ${this.novaCriancaForm.tipoIdade})`;
    const novoId = this.novaCriancaForm.nome.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);

    this.listaCriancas.push({ id: novoId, nome: nomeFormatado });
    this.criancaAtual = novoId;
    this.atualizarFiltroCrianca();
    
    this.novaCriancaForm = { nome: '', idade: null, tipoIdade: 'anos' };
    this.fecharModalCrianca();
  }

  atualizarFiltroCrianca() {
    this.listaVacinasFiltradas = this.listaTodasVacinas.filter(v => v.crianca === this.criancaAtual);
  }

  salvarVacina(modal: any) {
    if (this.novaVacina.nome === '' || this.novaVacina.data === '') return alert('Preencha os campos!');
    this.salvando = true;
    const [ano, mes, dia] = this.novaVacina.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const pacote = { nome: this.novaVacina.nome, data: dataFormatada, status: this.novaVacina.status, crianca: this.criancaAtual };

    this.vacinaService.addVacina(pacote).then(async () => {
      this.novaVacina = { nome: '', data: '', status: 'pendente' };
      modal.dismiss();
      this.salvando = false; 
      const toast = await this.toastController.create({ message: 'Vacina salva com sucesso!', duration: 2500, color: 'success', position: 'bottom', icon: 'checkmark-circle' });
      await toast.present();
    }).catch(erro => {
      this.salvando = false; alert('Erro ao salvar no Firebase.');
    });
  }

  async deletarVacina(id: string) {
    try {
      await this.vacinaService.deletarVacina(id);
      const toast = await this.toastController.create({ message: 'Vacina removida.', duration: 2000, color: 'danger', position: 'bottom', icon: 'trash-outline' });
      await toast.present();
    } catch (erro) { alert('Erro ao excluir a vacina.'); }
  }

  trocarIdioma() { alert('🌐 A tradução será ativada na Fase de Internacionalização!'); }
  toggleAcessibilidade(tipo: string) { document.body.classList.toggle(tipo === 'contraste' ? 'alto-contraste' : 'fonte-ampliada'); }
  logout() { this.router.navigate(['/login']); }
}