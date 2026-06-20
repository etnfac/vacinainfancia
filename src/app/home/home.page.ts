import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { addIcons } from 'ionicons';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, ToastController, IonItemSliding, IonItemOptions, IonItemOption, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline, searchOutline } from 'ionicons/icons';
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
  listaCriancas: any[] = [];
  
  criancaAtual: string = '';
  isModalCriancaOpen: boolean = false;
  modoEdicaoCrianca: boolean = false; 
  salvando: boolean = false; 
  isProfissional: boolean = false; 
  isAltoContraste: boolean = false;
  
  cpfBusca: string = '';
  criancaBuscada: boolean = false;

  novaCriancaForm = { id: '', nome: '', cpf: '', dataNascimento: '', nomeResponsavel: '', cpfResponsavel: '', telefoneResponsavel: '' };
  novaVacina = { nome: '', data: '', status: 'pendente' };

  constructor() {
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline, searchOutline });
  }

  // Caixa de notificação nativa para a Home
  async mostrarAlerta(titulo: string, mensagem: string) {
    const alerta = await this.alertController.create({ header: titulo, message: mensagem, buttons: ['OK'] });
    await alerta.present();
  }

  ionViewWillEnter() {
    const tipo = localStorage.getItem('tipoAcesso');
    this.isProfissional = tipo === 'medico';
    this.criancaBuscada = false;
    this.cpfBusca = '';
    this.carregarCriancasDoBanco();
  }

  ngOnInit() {
    this.vacinaService.getVacinas().subscribe((dados: any[]) => {
      this.listaTodasVacinas = dados.map(v => {
        let statusTratado = v.status ? v.status.toLowerCase().trim() : 'pendente';
        statusTratado = statusTratado.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        return { ...v, status: this.calcularStatusDinamicamente(v.data, statusTratado), crianca: v.crianca || '' };
      });
      this.atualizarFiltroCrianca();
    });
  }

  carregarCriancasDoBanco() {
    const db = JSON.parse(localStorage.getItem('db_criancas') || '[]');
    const cpfLogado = localStorage.getItem('cpfLogado');
    
    if (this.isProfissional) {
      this.listaCriancas = this.criancaBuscada ? db.filter((c: any) => c.cpf === this.cpfBusca) : [];
    } else {
      this.listaCriancas = db.filter((c: any) => c.cpfResponsavel === cpfLogado);
      if (this.listaCriancas.length > 0) this.criancaAtual = this.listaCriancas[0].id;
      else this.criancaAtual = '';
    }
    
    this.listaCriancas.forEach(c => {
      const fotoSalva = localStorage.getItem('foto_' + c.id);
      if (fotoSalva) c.fotoPerfil = fotoSalva;
    });
    this.atualizarFiltroCrianca();
  }

  formatarCPFBusca(event: any) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = valor;
    this.cpfBusca = valor;
  }

  buscarPaciente() {
    const db = JSON.parse(localStorage.getItem('db_criancas') || '[]');
    const paciente = db.find((c: any) => c.cpf === this.cpfBusca);
    if (paciente) {
      this.criancaBuscada = true;
      this.carregarCriancasDoBanco();
      this.criancaAtual = paciente.id;
      this.atualizarFiltroCrianca();
    } else {
      this.mostrarAlerta('Não Encontrado', 'Paciente não localizado no SUS.');
      this.criancaBuscada = false;
    }
  }

  getCriancaAtual() {
    return this.listaCriancas.find(c => c.id === this.criancaAtual) || this.listaCriancas[0] || {};
  }

  calcularIdadeString(dataNasc: string): string {
    if (!dataNasc) return '';
    const nascimento = new Date(`${dataNasc}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) { anos--; meses += 12; }
    if (anos > 0) return anos === 1 ? '1 ano' : `${anos} anos`;
    else if (meses > 0) return meses === 1 ? '1 mês' : `${meses} meses`;
    else return 'Recém-nascido';
  }

  calcularStatusDinamicamente(dataVacina: string, statusCadastrado: string): string {
    if (statusCadastrado === 'concluida') return 'concluida';
    const partesData = dataVacina.split('/');
    if (partesData.length !== 3) return statusCadastrado; 
    const dataAgendada = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    return (dataAgendada < hoje) ? 'atrasada' : 'pendente';
  }

  formatarData(dataISO: string): string {
    if (!dataISO) return '';
    const partes = dataISO.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  formatarCPFCrianca(event: any) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = valor;
    this.novaCriancaForm.cpf = valor;
  }

  carregarFotoPerfil(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo && this.criancaAtual) {
      const leitor = new FileReader();
      leitor.onload = (e: any) => {
        localStorage.setItem('foto_' + this.criancaAtual, e.target.result);
        this.carregarCriancasDoBanco();
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  mudarCrianca(event: any) {
    const valorEscolhido = event.detail.value;
    if (valorEscolhido === 'NOVA_CRIANCA') {
      this.modoEdicaoCrianca = false; 
      this.novaCriancaForm = { 
        id: '', nome: '', cpf: '', dataNascimento: '', 
        nomeResponsavel: localStorage.getItem('nomeLogado') || '', 
        cpfResponsavel: localStorage.getItem('cpfLogado') || '',
        telefoneResponsavel: localStorage.getItem('telefoneLogado') || ''
      };
      this.isModalCriancaOpen = true;
      event.target.value = this.criancaAtual; 
    } else {
      this.criancaAtual = valorEscolhido;
      this.atualizarFiltroCrianca();
    }
  }

  fecharModalCrianca() { this.isModalCriancaOpen = false; }

  async gerenciarCrianca() {
    const crianca = this.getCriancaAtual();
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Gerenciando: ${crianca.nome}`,
      buttons: [
        { text: 'Editar Perfil', icon: 'create-outline', handler: () => this.abrirModalEdicao(crianca) },
        { text: 'Excluir Caderneta', role: 'destructive', icon: 'trash-outline', handler: () => this.excluirCriancaAtual(crianca) },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  abrirModalEdicao(crianca: any) {
    this.modoEdicaoCrianca = true;
    this.novaCriancaForm = { ...crianca };
    this.isModalCriancaOpen = true;
  }

  async excluirCriancaAtual(crianca: any) {
    if (this.listaCriancas.length <= 1) {
      this.mostrarAlerta('Atenção', 'Você precisa manter pelo menos uma caderneta ativa!');
      return;
    }
    let db = JSON.parse(localStorage.getItem('db_criancas') || '[]');
    db = db.filter((c: any) => c.id !== crianca.id);
    localStorage.setItem('db_criancas', JSON.stringify(db));
    localStorage.removeItem('foto_' + crianca.id);
    this.carregarCriancasDoBanco();
  }

  salvarNovaCrianca() {
    if (!this.novaCriancaForm.nome || !this.novaCriancaForm.dataNascimento || !this.novaCriancaForm.cpf) {
      this.mostrarAlerta('Atenção', 'Preencha os campos obrigatórios!');
      return;
    }
    
    let db = JSON.parse(localStorage.getItem('db_criancas') || '[]');

    if (this.modoEdicaoCrianca) {
      const index = db.findIndex((c: any) => c.id === this.novaCriancaForm.id);
      if (index !== -1) {
        db[index] = { ...this.novaCriancaForm, primeiroNome: this.novaCriancaForm.nome.split(' ')[0], labelIdade: this.calcularIdadeString(this.novaCriancaForm.dataNascimento) };
      }
    } else {
      if (db.find((c: any) => c.cpf === this.novaCriancaForm.cpf)) {
        this.mostrarAlerta('Ops!', 'Criança já registrada no SUS!');
        return;
      }
      const novoId = this.novaCriancaForm.nome.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000);
      db.push({ 
        ...this.novaCriancaForm, id: novoId, primeiroNome: this.novaCriancaForm.nome.split(' ')[0], 
        labelIdade: this.calcularIdadeString(this.novaCriancaForm.dataNascimento), fotoPerfil: 'https://ionicframework.com/docs/img/demos/avatar.svg'
      });
      this.criancaAtual = novoId;
    }
    
    localStorage.setItem('db_criancas', JSON.stringify(db));
    this.carregarCriancasDoBanco();
    this.isModalCriancaOpen = false;
  }

  atualizarFiltroCrianca() {
    this.listaVacinasFiltradas = this.listaTodasVacinas.filter(v => v.crianca === this.criancaAtual);
  }

  salvarVacina(modal: any) {
    if (this.novaVacina.nome === '' || this.novaVacina.data === '') {
      this.mostrarAlerta('Atenção', 'Preencha todos os campos da vacina!');
      return;
    }
    this.salvando = true;
    const [ano, mes, dia] = this.novaVacina.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const pacote = { nome: this.novaVacina.nome, data: dataFormatada, status: this.novaVacina.status, crianca: this.criancaAtual };

    this.vacinaService.addVacina(pacote).then(async () => {
      this.novaVacina = { nome: '', data: '', status: 'pendente' };
      modal.dismiss();
      this.salvando = false; 
      const toast = await this.toastController.create({ message: 'Vacina registrada no SUS.', duration: 2500, color: 'success', position: 'bottom', icon: 'checkmark-circle' });
      await toast.present();
    }).catch(erro => { 
      this.salvando = false; 
      this.mostrarAlerta('Erro', 'Erro de sincronização com o banco de dados.'); 
    });
  }

  async deletarVacina(id: string) {
    try {
      await this.vacinaService.deletarVacina(id);
      const toast = await this.toastController.create({ message: 'Registro removido.', duration: 2000, color: 'danger', position: 'bottom', icon: 'trash-outline' });
      await toast.present();
    } catch (erro) { 
      this.mostrarAlerta('Erro', 'Erro ao excluir o registro.'); 
    }
  }

  toggleAcessibilidade(tipo: string) { 
    document.body.classList.toggle(tipo === 'contraste' ? 'alto-contraste' : 'fonte-ampliada'); 
    if (tipo === 'contraste') this.isAltoContraste = document.body.classList.contains('alto-contraste');
  }
  
  logout() { 
    localStorage.removeItem('tipoAcesso');
    this.router.navigate(['/login']); 
  }
}