# Projeto de Login e Lista de Chamados

Este projeto é uma aplicação em Vue.js que permite autenticação de usuários com o Firebase Authentication e exibe uma lista de chamados com base em uma cidade selecionada. Os chamados são carregados do Firebase Firestore, e há um sistema de filtragem por cidade e de exclusão de chamados.

## Tecnologias Utilizadas

- **Vue.js**: Framework JavaScript para construir interfaces de usuário.
- **Firebase**:
  - **Authentication**: Para autenticação de usuários.
  - **Firestore**: Para armazenamento dos chamados.
- **Bootstrap**: Framework de CSS para estilização.
- **Vue Router**: Gerenciamento de rotas para navegação entre páginas.
- **LocalStorage e Cookies**: Para persistência de dados de login e cidade selecionada.

## Funcionalidades

- **Autenticação de Usuários**: Tela de login que valida e autentica o usuário com o Firebase Authentication.
- **Persistência de Sessão**: Ao fazer login, o status do usuário é salvo no `localStorage` para que a sessão seja mantida mesmo após atualizar a página.
- **Lista de Chamados**: Exibe chamados com base na cidade selecionada pelo usuário no login.
- **Filtragem e Exclusão de Chamados**: O usuário pode pesquisar chamados por nome, selecionar múltiplos chamados e deletá-los.
- **Mapa**: Cada chamado pode ser visualizado no Google Maps com base em suas coordenadas.

## Estrutura do Projeto

- `src/`
  - `assets/`: Contém os arquivos estáticos, incluindo o arquivo `tokens.json` com os tokens por cidade.
  - `components/`: Componentes Vue que representam partes reutilizáveis da interface.
  - `views/`: Componentes Vue que representam as páginas principais da aplicação, como o formulário de login e a lista de chamados.
  - `domain/`: Configuração do Firebase.
  - `App.vue`: Componente principal da aplicação.
  - `main.js`: Arquivo de entrada que inicializa o Vue e configura os plugins e rotas.

## Configuração

1. **Clone o Repositório**

   ```bash
   git clone https://github.com/smaartsafe/SmartSafe-SistemadeEmergencia.git
   cd SmartSafe-SistemadeEmergencia
