# 🛡️ VaciNaInfância: A Evolução Digital da Saúde Infantil

[![Ionic](https://img.shields.com/badge/Framework-Ionic%20v7-blue.svg)](https://ionicframework.com/)
[![Angular](https://img.shields.com/badge/Structure-Angular%20v17-red.svg)](https://angular.io/)
[![Firebase](https://img.shields.com/badge/Database-Firebase%20Firestore-orange.svg)](https://firebase.google.com/)
[![License](https://img.shields.com/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Uma plataforma moderna e segura para o gerenciamento de cadernetas de vacinação infantis.** O VaciNaInfância resolve o problema da perda de dados históricos de vacinação, vinculando a saúde da criança à sua identidade nacional (CPF) e centralizando o controle na nuvem.

---

## 📖 Visão Geral do Projeto

O VaciNaInfância não é apenas um app de lembrete. É um ecossistema completo que integra Responsáveis Legais e Profissionais de Saúde em uma única plataforma. A grande inovação arquitetural do projeto é o **Vínculo Eterno da Vacina pelo CPF**: mesmo que a caderneta física ou a conta do responsável sejam excluídas, o histórico de vacinas aplicadas permanece amarrado ao CPF da criança na nuvem do Firebase, sendo restaurado instantaneamente em qualquer novo cadastro.

---

## 💡 UX & UI: Design Centrado no Usuário e Acessibilidade

O desenvolvimento do VaciNaInfância seguiu rigorosos padrões de Design Thinking, focando nas dores reais de pais e médicos.

### 🧠 Abordagem de UX (User Experience)
* **Fluxo Simplificado:** Reduzimos a fricção no cadastro de crianças, permitindo que responsáveis adicionem dependentes em segundos.
* **Isolamento de Visões:** O sistema adapta sua interface dinamicamente baseada no `tipoAcesso` (Responsável ou Médico). Médicos têm acesso a uma poderosa ferramenta de busca por CPF, enquanto pais visualizam apenas seus dependentes.
* **Feedback Constante:** Uso de Toasts e Alertas nativos customizados para informar sucesso, erros de sincronização ou regras de negócio (ex: CPF já cadastrado).

### 🎨 Abordagem de UI (User Interface)
* **Identidade Visual Reativa:** Cores calmas e profissionais (Verde primary, Amarelo tertiary) alinhadas a aplicações de saúde públicas.
* **Carrossel de Campanhas:** Swiper integrado para exibição dinâmica de notícias e dicas de saúde, mantendo o usuário engajado.
* **Status Dinâmico:** Algoritmos em TypeScript calculam em tempo real se uma vacina está **Em Dia**, **No Prazo** ou **Atrasada**, usando Badges e ícones coloridos para leitura rápida.

### ♿ Acessibilidade de Ponta
Diferente de muitas aplicações, a acessibilidade no VaciNaInfância é nativa e opcional:
1.  **Menu de Acessibilidade:** Localizado no header.
3.  **Alto Contraste:** Força cores agressivas (Preto/Amarelo) para usuários com baixa visão.
4.  **Fonte Ampliada:** Aumenta proporcionalmente todos os textos da aplicação.
5.  **Libras:** VLibras.

---

## ⚙️ Engenharia e Arquitetura de Dados

O projeto utiliza uma arquitetura híbrida para maximizar desempenho e segurança.

### 🔥 Firebase Firestore (Nuvem em Tempo Real)
Utilizamos o Firebase como nosso "Banco de Dados Mestre" para os dados críticos:
* **Coleção `usuarios`:** Armazena dados de login (CPF, Nome, Telefone, Senha Criptografada em mock) de Responsáveis.
* **Coleção `criancas`:** Armazena os perfis globais (Nome, Data Nasc, CPF da Criança, CPF do Resp).
* **Coleção `vacinas`:** O core da nossa regra de negócio. Cada registro de vacina aplicada é amarrado ao **CPF da Criança** (não ao ID da coleção), garantindo a persistência histórica eterna.

### 💾 LocalStorage (Armazenamento de Sessão e Assets)
* **Gestão de Sessão:** Armazena tokens de login (`cpfLogado`, `nomeLogado`, `tipoAcesso`) para persistência de acesso sem re-autenticação.
* **Assets Pesados (Avatares):** As fotos de perfil das crianças são salvas em Base64 no LocalStorage vinculado ao ID da criança, otimizando o tráfego de rede do Firebase.

---

## 🧑‍⚕️ Área do Profissional de Saúde (SUS)

Criamos uma interface robusta para a equipe médica:
1.  **Acesso Restrito:** Login via credenciais profissionais.
2.  **Busca Poderosa por CPF:** Permite que o médico localize qualquer caderneta na base nacional do SUS digitando apenas o CPF da criança.
3.  **Registro de Vacinas:** Interface dedicada para médicos adicionarem novas vacinas (Nome da Vacina, Data, Situação) diretamente na caderneta na nuvem, com Badges dinâmicos de status.

---

## 🛠️ Stack Tecnológico

* **Core:** Ionic v7 + Angular v17 (Standalone Components)
* **Banco de Dados:** Firebase Firestore
* **Swiper Element:** Para o carrossel de campanhas.
* **Ionicons:** Para ícones vetoriais.

---

## 🚀 Próximos Passos

* [ ] Integração de Notificações Push (Avisar pais sobre vacinas atrasadas).
* [ ] Geração de Carteira de Vacinação em PDF oficial.
* [ ] Geolocalização de Postos de Saúde mais próximos.

---

<p align="center">Desenvolvido com ❤️ para Cyrrus - Desafio de Estágio</p>
