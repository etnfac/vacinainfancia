import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonButton, IonIcon, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton, IonIcon, IonItem, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  private router = inject(Router);

  cpf = '';
  senha = '';

  constructor() {
    addIcons({ lockClosedOutline, personOutline });
  }

  ngOnInit() {
    // 🥚 EASTER EGG PARA A CYRRUS
    console.log('%c🚀 ALÔ CYRRUS: Por favorrrr me escolham pro estágio, eu quero muito começar a atuar na área!!!!!', 'color: #ABC270; font-size: 16px; font-weight: bold; background: #222; padding: 10px; border-radius: 8px;');
  }

  // Função que formata o CPF
  formatarCPF(event: any) {
    let valor = event.detail.value;
    
    if (!valor) {
      this.cpf = '';
      return;
    }

    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    
    // Limita a 11 números
    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    if (valor.length > 9) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (valor.length > 6) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (valor.length > 3) {
      valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }

    this.cpf = valor;
  }

  fazerLogin() {
    if (this.cpf.length === 14 && this.senha) {
      this.router.navigate(['/home']);
    } else {
      alert('Por favor, insira um CPF válido (11 dígitos) e sua senha.');
    }
  }

  loginGov() {
    // Simula o login do Gov.br
    this.router.navigate(['/home']);
  }
}