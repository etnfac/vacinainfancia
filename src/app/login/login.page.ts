import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, IonItem, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline, arrowBackOutline, businessOutline } from 'ionicons/icons';
import { VacinaService } from '../services/vacina.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonIcon, IonItem, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  private router = inject(Router);
  private alertController = inject(AlertController);
  private vacinaService = inject(VacinaService);

  telaAtual: 'login' | 'cadastro' | 'medico' | 'cyrrus' = 'login';
  listaUsuariosFirebase: any[] = [];
  
  nome = '';
  cpf = '';
  telefone = '';
  senha = '';

  usuarioMedico = '';
  senhaMedico = '';
  
  usuarioCyrrus = '';
  senhaCyrrus = '';

  check = { tamanho: false, maiuscula: false, numero: false, especial: false };

  constructor() {
    addIcons({ lockClosedOutline, personOutline, medicalOutline, heartOutline, personAddOutline, callOutline, checkmarkCircle, ellipseOutline, arrowBackOutline, businessOutline });
  }

  // Carrega os usuários salvos no banco de dados
  ngOnInit() {
    this.vacinaService.getUsuarios().subscribe(dados => {
      this.listaUsuariosFirebase = dados;
    });
  }

  // Cria pop-up nativo customizado
  async mostrarAlerta(titulo: string, mensagem: string) {
    const alerta = await this.alertController.create({ header: titulo, message: mensagem, buttons: ['OK'] });
    await alerta.present();
  }

  // Altera a tela e limpa os inputs
  mudarTela(novaTela: 'login' | 'cadastro' | 'medico' | 'cyrrus') {
    this.telaAtual = novaTela;
    this.limparCampos();
  }

  // Zera as variáveis globais
  limparCampos() {
    this.nome = '';
    this.cpf = '';
    this.telefone = '';
    this.senha = '';
    this.usuarioMedico = '';
    this.senhaMedico = '';
    this.usuarioCyrrus = '';
    this.senhaCyrrus = '';
    this.check = { tamanho: false, maiuscula: false, numero: false, especial: false };
  }

  // Trava de letras para nome
  formatarNome(event: any) {
    let input = event.target;
    let valor = input.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    input.value = valor;
    this.nome = valor;
  }

  // Máscara de CPF
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

  // Máscara de Telefone
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

  // Expressão regular de senha
  validarSenha() {
    this.check.tamanho = this.senha.length >= 8;
    this.check.maiuscula = /[A-Z]/.test(this.senha);
    this.check.numero = /[0-9]/.test(this.senha);
    this.check.especial = /[!@#$%^&*(),.?":{}|<>]/.test(this.senha);
  }

  // Autenticação de Pai/Responsável
  fazerLoginResponsavel() {
    if (this.telaAtual === 'cadastro') {
      if (!this.nome || this.cpf.length !== 14 || this.telefone.length < 14 || !this.check.tamanho || !this.check.maiuscula || !this.check.numero || !this.check.especial) {
        this.mostrarAlerta('Atenção', 'Preencha todos os campos e regras de senha.');
        return;
      }
      if (this.listaUsuariosFirebase.find((u: any) => u.cpf === this.cpf)) {
        this.mostrarAlerta('Ops!', 'Este CPF já está cadastrado!');
        return;
      }
      const novoUsuario = { cpf: this.cpf, nome: this.nome, telefone: this.telefone, senha: this.senha, tipo: 'pai' };
      this.vacinaService.addUsuario(novoUsuario).then(() => {
        this.salvarSessao('pai', this.nome, this.telefone, this.cpf);
      });
    } else {
      const usuario = this.listaUsuariosFirebase.find((u: any) => u.cpf === this.cpf && u.senha === this.senha);
      if (!usuario) {
        this.mostrarAlerta('Acesso Negado', 'CPF ou senha incorretos.');
        return;
      }
      this.salvarSessao('pai', usuario.nome, usuario.telefone, usuario.cpf);
    }
  }

  // Autenticação de Médico
  fazerLoginMedico() {
    if (this.usuarioMedico === 'admin' && this.senhaMedico === 'admin') {
      this.salvarSessao('medico', 'Profissional de Saúde', '', '');
    } else {
      this.mostrarAlerta('Erro de Autenticação', 'Usuário ou senha incorretos para SUS.');
    }
  }

  // Autenticação Institucional Cyrrus
  fazerLoginCyrrus() {
    if (this.usuarioCyrrus === 'admin' && this.senhaCyrrus === 'admin') {
      this.salvarSessao('cyrrus', 'Equipe Cyrrus', '(00) 00000-0000', 'CYRRUS_ADMIN');
    } else {
      this.mostrarAlerta('Erro', 'Credenciais corporativas incorretas.');
    }
  }

  // Salva no storage e navega
  salvarSessao(tipo: string, nome: string, telefone: string, cpfLogado: string) {
    localStorage.setItem('tipoAcesso', tipo);
    localStorage.setItem('cpfLogado', cpfLogado);
    localStorage.setItem('nomeLogado', nome);
    localStorage.setItem('telefoneLogado', telefone);
    this.limparCampos();
    this.router.navigate(['/home']);
  }

  // Recuperação de senha com trava bloqueadora de letras no pop-up
  async esqueciSenha() {
    const alert = await this.alertController.create({
      header: 'Recuperar Senha',
      message: 'Digite seu CPF (apenas números) para receber a senha:',
      inputs: [{ 
        name: 'cpfDigitado', 
        type: 'tel', 
        placeholder: '000.000.000-00',
        attributes: {
          maxlength: 11, // Trava o tamanho máximo
          oninput: "this.value = this.value.replace(/[^0-9]/g, '')" // Expulsa qualquer letra instantaneamente
        }
      }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Solicitar SMS',
          handler: (dados) => {
            if (!dados.cpfDigitado) return;
            const cpfLimpo = dados.cpfDigitado.replace(/\D/g, '');
            const usuario = this.listaUsuariosFirebase.find((u: any) => u.cpf.replace(/\D/g, '') === cpfLimpo);
            if (usuario) {
              this.mostrarAlerta('📱 SMS RECEBIDO!', `Para: ${usuario.telefone}\n\nSua senha do VacinaInfância é: ${usuario.senha}`);
            } else {
              this.mostrarAlerta('Não Encontrado', 'CPF não localizado.');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}