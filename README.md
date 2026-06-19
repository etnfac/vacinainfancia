# 💉 VaciNaInfância

Bem-vindo ao repositório do **VaciNaInfância**, uma aplicação moderna desenvolvida para simplificar o acompanhamento da caderneta de vacinação infantil. Este projeto foi construído utilizando **Angular (Standalone)** e **Ionic**, com foco absoluto em *Clean Code*, Responsividade e UI/UX.

---

## 💡 1. O Conceito
A identidade visual do projeto nasceu de um estalo de design: a fusão entre as palavras "Vacina" e "Infância". Ao sobrepor o "NA" final de Vacina com o início da frase, criamos o **VACI**NA**INFÂNCIA**. Uma brincadeira tipográfica simples, mas que transmite exatamente a missão do app de forma memorável.

![Rascunho da Ideia](rascunho-nome.jpeg)
*Rascunho inicial do conceito tipográfico.*

---

## 🏗️ 2. Arquitetura e Organização
Desde a primeira linha de código, o repositório foi versionado utilizando as boas práticas de mercado para manter a linha do tempo semântica e profissional. Os commits seguem o seguinte padrão:

* **`chore:`** Manutenção, configurações de infraestrutura e instalação de bibliotecas (ações invisíveis ao usuário final).
* **`feat:`** Criação de novas funcionalidades (ex: Carrossel de campanhas, listas interativas).
* **`style:`** Ajustes estritos de UI, CSS e Design System (sem alterar lógica).
* **`fix:`** Resolução de bugs e erros de sistema.
* **`docs:`** Alterações na documentação do projeto.

---

## 🔥 3. O Desafio do Firebase
Um dos primeiros grandes obstáculos técnicos foi a integração com o banco de dados. Durante o uso do Firebase CLI, enfrentei um *loop* severo de erros de cache e tokens corrompidos no ambiente de desenvolvimento do Windows (`Authentication Error: Your credentials are no longer valid`), que bloqueavam a configuração automática via terminal.

**A Solução:**
Ao invés de depender de scripts automatizados propensos a falhas de ambiente, optei pela **Integração Manual**. Isolei as chaves do SDK Web do Firebase e as injetei diretamente no `main.ts`, utilizando os *providers* nativos do Angular. O resultado? Controle total sobre a arquitetura, contorno do erro de terminal e uma conexão com o Firestore limpa e direta.

---

## 🎨 4. UI/UX
A interface foi construída seguindo rigorosos padrões de acessibilidade. Utilizamos uma paleta de cores institucional que transmite saúde e segurança (Verdes, Laranjas e Amarelos), contrastando com tons escuros para garantir a legibilidade.

Para evitar que o aplicativo parecesse um "simulador esticado" quando aberto em telas de computador, implementei um **Web Wrapper**. Isso garante que a aplicação mantenha uma largura ideal, centralizando o conteúdo de forma elegante e preservando a experiência mobile-first em qualquer dispositivo.

![App Ganhando Forma](rascunho-processo.jpeg)
*Evolução visual.*

---

## ⚙️ 5. Funcionalidades Desenvolvidas
Até o momento, o núcleo da aplicação conta com:
* **Carrossel Nativo Turbinado:** Utilização do `Swiper.js` com *autoplay* e navegação clicável para exibição de Campanhas de Saúde.
* **Lista de Vacinas Dinâmica:** Motor lógico que analisa o status de cada vacina (`concluida`, `pendente`, `atrasada`) e altera visualmente a cor da interface (`[ngClass]`) para alertar o usuário.
* **Banco de Dados em Tempo Real:** Conexão reativa via *Services* (POO) com o Google Firestore.

---

### 👨‍💻 Autor
**Ethan Faccioli**
