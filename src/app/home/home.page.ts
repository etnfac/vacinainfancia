import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { addIcons } from 'ionicons';
import { register } from 'swiper/element/bundle';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonAvatar, IonSelect, IonSelectOption, IonItem, IonButtons, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonLabel, IonBadge, IonFab, IonFabButton, IonModal, IonInput, ToastController, IonItemSliding, IonItemOptions, IonItemOption, AlertController, ActionSheetController } from '@ionic/angular/standalone';
import { personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline, searchOutline, contrastOutline, textOutline } from 'ionicons/icons';
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
  listaCriancasCompleta: any[] = [];
  listaCriancasExibidas: any[] = [];
  
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
    addIcons({ personCircleOutline, checkmarkCircle, timeOutline, alertCircle, add, close, trashOutline, medicalOutline, logOutOutline, cameraOutline, settingsOutline, createOutline, searchOutline, contrastOutline, textOutline });
  }

  async mostrarAlerta(titulo: string, mensagem: string) {
    const alerta = await this.alertController.create({ header: titulo, message: mensagem, buttons: ['OK'] });
    await alerta.present();
  }

  ionViewWillEnter() {
    const tipo = localStorage.getItem('tipoAcesso');
    this.isProfissional = tipo === 'medico';
    this.criancaBuscada = false;
    this.cpfBusca = '';
    this.isAltoContraste = document.body.classList.contains('alto-contraste');
  }

  ngOnInit() {
    this.vacinaService.getCriancas().subscribe(criancas => {
      this.listaCriancasCompleta = criancas.map(c => ({
        ...c,
        primeiroNome: c.nome.split(' ')[0],
        labelIdade: this.calcularIdadeString(c.dataNascimento)
      }));
      this.filtrarAcessoEPerfil();
    });

    this.vacinaService.getVacinas().subscribe((dados: any[]) => {
      this.listaTodasVacinas = dados.map(v => {
        let statusTratado = v.status ? v.status.toLowerCase().trim() : 'pendente';
        statusTratado = statusTratado.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        return { ...v, status: this.calcularStatusDinamicamente(v.data, statusTratado), crianca: v.crianca || '' };
      });
      this.atualizarFiltroVacinas();
    });
  }

  filtrarAcessoEPerfil() {
    const cpfLogado = localStorage.getItem('cpfLogado');
    const tipoAcesso = localStorage.getItem('tipoAcesso');
    
    if (this.isProfissional) {
      this.listaCriancasExibidas = this.criancaBuscada ? this.listaCriancasCompleta.filter((c: any) => c.cpf === this.cpfBusca) : [];
    } else {
      this.listaCriancasExibidas = this.listaCriancasCompleta.filter((c: any) => c.cpfResponsavel === cpfLogado);
      
      // AUTO-CRIAÇÃO NO FIREBASE: Se for a Cyrrus e não houver criança, cria direto no banco!
      if (tipoAcesso === 'cyrrus' && this.listaCriancasExibidas.length === 0) {
        if (this.salvando) return; // Evita duplicação
        this.salvando = true;
        
        const cyrrusOficial = {
          nome: 'Cyrrus Next Systems Ltda',
          cpf: '999.999.999-99',
          dataNascimento: '2025-03-11',
          nomeResponsavel: 'Paula Raquel',
          cpfResponsavel: 'CYRRUS_ADMIN',
          telefoneResponsavel: '(11) 97288-3895'
        };
        
        this.vacinaService.addCrianca(cyrrusOficial).then(() => {
          this.salvando = false;
        });
        return; // Retorna e aguarda o Firebase recarregar a tela automaticamente
      }

      if (this.listaCriancasExibidas.length > 0 && !this.criancaAtual) {
        this.criancaAtual = this.listaCriancasExibidas[0].id;
      } else if (this.listaCriancasExibidas.length === 0) {
        this.criancaAtual = '';
      }
    }
    
    this.listaCriancasExibidas.forEach(c => {
      const fotoSalva = localStorage.getItem('foto_' + c.id);
      if (fotoSalva) c.fotoPerfil = fotoSalva;
    });
    this.atualizarFiltroVacinas();
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
    const paciente = this.listaCriancasCompleta.find((c: any) => c.cpf === this.cpfBusca);
    if (paciente) {
      this.criancaBuscada = true;
      this.criancaAtual = paciente.id;
      this.filtrarAcessoEPerfil();
    } else {
      this.mostrarAlerta('Não Encontrado', 'Paciente não localizado no SUS.');
      this.criancaBuscada = false;
    }
  }

  getCriancaAtual() {
    return this.listaCriancasExibidas.find(c => c.id === this.criancaAtual) || this.listaCriancasExibidas[0] || {};
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
        this.vacinaService.atualizarCrianca(this.criancaAtual, { fotoPerfil: e.target.result }).then(() => {
          this.filtrarAcessoEPerfil();
        });
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
      this.atualizarFiltroVacinas();
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
    this.vacinaService.deletarCrianca(crianca.id).then(() => {
      localStorage.removeItem('foto_' + crianca.id);
      this.criancaAtual = '';
      this.filtrarAcessoEPerfil();
    });
  }

  salvarNovaCrianca() {
    if (!this.novaCriancaForm.nome || !this.novaCriancaForm.dataNascimento || !this.novaCriancaForm.cpf) {
      this.mostrarAlerta('Atenção', 'Preencha os campos obrigatórios!');
      return;
    }
    if (this.modoEdicaoCrianca) {
      this.vacinaService.atualizarCrianca(this.novaCriancaForm.id, this.novaCriancaForm).then(() => {
        this.isModalCriancaOpen = false;
        this.filtrarAcessoEPerfil();
      });
    } else {
      if (this.listaCriancasCompleta.find((c: any) => c.cpf === this.novaCriancaForm.cpf)) {
        this.mostrarAlerta('Ops!', 'Criança já registrada no SUS!');
        return;
      }
      this.vacinaService.addCrianca(this.novaCriancaForm).then((ref) => {
        this.criancaAtual = ref.id;
        this.isModalCriancaOpen = false;
        this.filtrarAcessoEPerfil();
      });
    }
  }

  atualizarFiltroVacinas() {
    const criancaAtiva = this.getCriancaAtual();
    if (criancaAtiva && criancaAtiva.cpf) {
      this.listaVacinasFiltradas = this.listaTodasVacinas.filter(v => v.crianca === criancaAtiva.cpf);
    } else {
      this.listaVacinasFiltradas = [];
    }
  }

  salvarVacina(modal: any) {
    if (this.novaVacina.nome === '' || this.novaVacina.data === '') {
      this.mostrarAlerta('Atenção', 'Preencha todos os campos da vacina!');
      return;
    }
    this.salvando = true;
    const [ano, mes, dia] = this.novaVacina.data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const pacote = { nome: this.novaVacina.nome, data: dataFormatada, status: this.novaVacina.status, crianca: this.getCriancaAtual().cpf };

    this.vacinaService.addVacina(pacote).then(async () => {
      this.novaVacina = { nome: '', data: '', status: 'pendente' };
      modal.dismiss();
      this.salvando = false; 
      const toast = await this.toastController.create({ message: 'Vacina registrada no SUS.', duration: 2500, color: 'success', position: 'bottom', icon: 'checkmark-circle' });
      await toast.present();
    }).catch(erro => { 
      this.salvando = false; 
      this.mostrarAlerta('Erro', 'Erro de sincronização.'); 
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
    if (tipo === 'contraste') {
      document.body.classList.toggle('alto-contraste');
      this.isAltoContraste = document.body.classList.contains('alto-contraste');
    } else if (tipo === 'fonte') {
      document.body.classList.toggle('fonte-ampliada');
    }
  }
  
  logout() { 
    localStorage.removeItem('tipoAcesso');
    this.router.navigate(['/login']); 
  }
}