import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, IonItem, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonIcon, IonItem, CommonModule, FormsModule]
})
export class LoginPage {
  private router = inject(Router);
  private alertController = inject(AlertController);

  telaAtual: 'login' | 'cadastro' | 'medico' = 'login';
  
  nome = '';
  cpf = '';
  telefone = '';
  senha = '';

  usuarioMedico = '';
  senhaMedico = '';

  check = { tamanho: false, maiuscula: false, numero: false, especial: false };

  constructor() {
    addIcons({ lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline, arrowBackOutline });
  }

  // Caixa de notificação com a identidade visual do app
  async mostrarAlerta(titulo: string, mensagem: string) {
    const alerta = await this.alertController.create({ header: titulo, message: mensagem, buttons: ['OK'] });
    await alerta.present();
  }

  mudarTela(novaTela: 'login' | 'cadastro' | 'medico') {
    this.telaAtual = novaTela;
    this.limparCampos();
  }

  limparCampos() {
    this.nome = '';
    this.cpf = '';
    this.telefone = '';
    this.senha = '';
    this.usuarioMedico = '';
    this.senhaMedico = '';
    this.check = { tamanho: false, maiuscula: false, numero: false, especial: false };
  }

  formatarNome(event: any) {
    let input = event.target;
    let valor = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    input.value = valor;
    this.nome = valor;
  }

  formatarCPF(event: any) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, ''); 
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 9) valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (valor.length > 6) valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (valor.length > 3) valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = valor; 
    this.cpf = valor;
  }

  formatarTelefone(event: any) {
    let input = event.target;
    let valor = input.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.substring(0, 11);
    if (valor.length > 10) valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    else if (valor.length > 6) valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (valor.length > 2) valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    input.value = valor;
    this.telefone = valor;
  }

  validarSenha() {
    this.check.tamanho = this.senha.length >= 8;
    this.check.maiuscula = /[A-Z]/.test(this.senha);
    this.check.numero = /[0-9]/.test(this.senha);
    this.check.especial = /[!@#$%^&*(),.?":{}|<>]/.test(this.senha);
  }

  fazerLoginResponsavel() {
    const dbUsuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');

    if (this.telaAtual === 'cadastro') {
      if (!this.nome || this.cpf.length !== 14 || this.telefone.length < 14 || !this.check.tamanho || !this.check.maiuscula || !this.check.numero || !this.check.especial) {
        this.mostrarAlerta('Atenção', 'Preencha todos os campos e siga as regras de senha.');
        return;
      }
      if (dbUsuarios.find((u: any) => u.cpf === this.cpf)) {
        this.mostrarAlerta('Ops!', 'Este CPF já está cadastrado!');
        return;
      }
      
      dbUsuarios.push({ cpf: this.cpf, nome: this.nome, telefone: this.telefone, senha: this.senha, tipo: 'pai' });
      localStorage.setItem('db_usuarios', JSON.stringify(dbUsuarios));
      this.salvarSessao('pai', this.nome, this.telefone, this.cpf);

    } else {
      const usuario = dbUsuarios.find((u: any) => u.cpf === this.cpf && u.senha === this.senha);
      if (!usuario) {
        this.mostrarAlerta('Acesso Negado', 'CPF ou senha incorretos.');
        return;
      }
      this.salvarSessao('pai', usuario.nome, usuario.telefone, usuario.cpf);
    }
  }

  fazerLoginMedico() {
    if (this.usuarioMedico === 'admin' && this.senhaMedico === 'admin') {
      this.salvarSessao('medico', 'Profissional de Saúde', '', '');
    } else {
      this.mostrarAlerta('Erro de Autenticação', 'Usuário ou senha incorretos para o sistema SUS.');
    }
  }

  salvarSessao(tipo: string, nome: string, telefone: string, cpfLogado: string) {
    localStorage.setItem('tipoAcesso', tipo);
    localStorage.setItem('cpfLogado', cpfLogado);
    localStorage.setItem('nomeLogado', nome);
    localStorage.setItem('telefoneLogado', telefone);
    this.limparCampos();
    this.router.navigate(['/home']);
  }

  async esqueciSenha() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: 'Digite seu CPF (apenas números) para receber a senha via SMS:',
      inputs: [{ name: 'cpfDigitado', type: 'tel', placeholder: '00000000000' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Solicitar SMS',
          handler: (dados) => {
            if (!dados.cpfDigitado) return;
            const dbUsuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');
            const cpfLimpo = dados.cpfDigitado.replace(/\D/g, '');
            const usuario = dbUsuarios.find((u: any) => u.cpf.replace(/\D/g, '') === cpfLimpo);
            
            if (usuario) {
              this.mostrarAlerta('📱 SMS RECEBIDO!', `Para: ${usuario.telefone}\n\nMensagem: Olá ${usuario.nome.split(' ')[0]}, sua senha do VacinaInfância é: ${usuario.senha}`);
            } else {
              this.mostrarAlerta('Não Encontrado', 'CPF não encontrado no sistema.');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}