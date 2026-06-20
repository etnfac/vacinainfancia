import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, IonItem, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline } from 'ionicons/icons';

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

  isCadastro = false; 
  nome = '';
  cpf = '';
  telefone = '';
  senha = '';

  // Variáveis do checklist da senha
  check = { tamanho: false, maiuscula: false, numero: false, especial: false };

  constructor() {
    addIcons({ lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline });
  }

  // Troca entre entrar e cadastrar
  toggleCadastro() {
    this.isCadastro = !this.isCadastro;
  }

  // Trava implacável contra letras no CPF
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

  // Formata telefone dinamicamente
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

  // Valida regras da senha em tempo real
  validarSenha() {
    this.check.tamanho = this.senha.length >= 8;
    this.check.maiuscula = /[A-Z]/.test(this.senha);
    this.check.numero = /[0-9]/.test(this.senha);
    this.check.especial = /[!@#$%^&*(),.?":{}|<>]/.test(this.senha);
  }

  // Cria a conta ou valida login
  fazerLogin(tipoAcesso: string) {
    const dbUsuarios = JSON.parse(localStorage.getItem('db_usuarios') || '[]');

    if (this.isCadastro) {
      if (!this.nome || this.cpf.length !== 14 || this.telefone.length < 14 || !this.check.tamanho || !this.check.maiuscula || !this.check.numero || !this.check.especial) {
        return alert('Preencha todos os campos e siga as regras de senha.');
      }
      if (dbUsuarios.find((u: any) => u.cpf === this.cpf)) return alert('Este CPF já está cadastrado!');
      
      dbUsuarios.push({ cpf: this.cpf, nome: this.nome, telefone: this.telefone, senha: this.senha, tipo: tipoAcesso });
      localStorage.setItem('db_usuarios', JSON.stringify(dbUsuarios));
      this.salvarSessao(tipoAcesso, this.nome, this.telefone);

    } else {
      if (tipoAcesso === 'medico') {
        this.salvarSessao('medico', 'Profissional de Saúde', '');
      } else {
        const usuario = dbUsuarios.find((u: any) => u.cpf === this.cpf && u.senha === this.senha);
        if (!usuario) return alert('CPF ou senha incorretos.');
        this.salvarSessao('pai', usuario.nome, usuario.telefone);
      }
    }
  }

  // Grava acesso e entra
  salvarSessao(tipo: string, nome: string, telefone: string) {
    localStorage.setItem('tipoAcesso', tipo);
    localStorage.setItem('cpfLogado', this.cpf);
    localStorage.setItem('nomeLogado', nome);
    localStorage.setItem('telefoneLogado', telefone);
    this.router.navigate(['/home']);
  }

  // Prompt com CPF para recuperar senha
  async esqueciSenha() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: 'Digite seu CPF para receber as instruções:',
      inputs: [{ name: 'cpfDigitado', type: 'tel', placeholder: '000.000.000-00' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: (dados) => {
            if (dados.cpfDigitado) window.alert('As instruções foram enviadas para o telefone cadastrado!');
          }
        }
      ]
    });
    await alert.present();
  }
}