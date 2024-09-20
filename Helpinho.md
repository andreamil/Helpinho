# Helpinho

Helpinho é uma plataforma projetada para conectar pessoas que precisam de ajuda com aquelas dispostas a oferecer apoio. Os usuários podem criar "helpinhos" (pequenos pedidos de ajuda ou campanhas), seguir helpinhos de seu interesse e fazer doações para apoiá-los.

A aplicação está disponível online após um **deploy realizado com Amplify**, podendo ser acessada no seguinte link:

[**Helpinho - Acesse Aqui**](https://dev.dggo914qauj7k.amplifyapp.com/)

Principais funcionalidades estão implementadas, incluindo a criação de helpinhos, doações e perfil do usuário. Após o login, um novo helpinho pode ser criado ao acessar a página do usuário, que fica na rota /me e pode ser acessada clicando no nome do usuário logado.

## Índice

- [Helpinho](#helpinho)
  - [Índice](#índice)
  - [Funcionalidades Implementadas](#funcionalidades-implementadas)
    - [**Autenticação de Usuário**](#autenticação-de-usuário)
    - [**Helpinhos**](#helpinhos)
    - [**Página de Perfil do Usuário**](#página-de-perfil-do-usuário)
    - [**Validação de Formulários**](#validação-de-formulários)
    - [**Design Responsivo**](#design-responsivo)
    - [**Pesquisa Avançada**](#pesquisa-avançada)
  - [Funcionalidades Pendentes](#funcionalidades-pendentes)
  - [Melhorias Possíveis](#melhorias-possíveis)
  - [Pré-requisitos](#pré-requisitos)
  - [Instruções de Configuração](#instruções-de-configuração)
    - [**Backend**](#backend)
    - [**Frontend**](#frontend)
  - [Executando o Projeto](#executando-o-projeto)
- [Rotas do Backend (Serverless.yml)](#rotas-do-backend-serverlessyml)
  - [**Usuários**](#usuários)
  - [**Helpinhos**](#helpinhos-1)
  - [**Doações**](#doações)
  - [**Seguir Helpinhos**](#seguir-helpinhos)
  - [**Autenticação**](#autenticação)
  - [Rotas do Frontend](#rotas-do-frontend)
  - [Notas Adicionais](#notas-adicionais)

---

## Funcionalidades Implementadas

### **Autenticação de Usuário**
- **Cadastro com Email e Senha**: Permite o registro de novos usuários, com verificação de email.
- **Login com Email e Senha**: Permite que usuários existentes façam login.
- **Login com Google**: Autenticação via Google usando AWS Cognito.
- **Esqueci a Senha**: Redefinição de senha via email.

### **Helpinhos**
- **Criar Helpinhos**: Usuários podem criar novos helpinhos com foto, título, descrição, meta e informações bancárias.
- **Visualizar Helpinhos**: Exibição dos detalhes do helpinho com dados do criador e valores arrecadados.
- **Doar para Helpinhos**: Realizar doações para um helpinho específico.
- **Seguir Helpinhos**: Usuários podem seguir e deixar de seguir campanhas.
- **Pesquisa e Filtro**: Pesquisa por título e descrição, com filtros por categoria e meta.
- **Ordenação**: Ordenar helpinhos por data de criação, meta ou valor arrecadado.

### **Página de Perfil do Usuário**
- **Visualizar e Editar Perfil**: Nome, email, CPF, telefone e data de nascimento.
- **Estatísticas**: Exibe o total doado, helpinhos criados e seguidos.
- **Helpinhos Criados e Seguidos**: Exibição de campanhas criadas e seguidas pelo usuário.

### **Validação de Formulários**
- **Formulários com Validação**: Campos obrigatórios como título, descrição, meta e informações bancárias são validados.
- **Feedback para Usuários**: Exibição de mensagens de erro e confirmação de sucesso nas operações.

### **Design Responsivo**
- **Interface Responsiva**: Desenvolvido com Tailwind CSS para garantir compatibilidade em dispositivos móveis.

### **Pesquisa Avançada**
- **Filtros Adicionais**: Filtros de pesquisa por categoria, meta mínima/máxima e prazo.

---

## Funcionalidades Pendentes
- **Integração com Gateway de Pagamentos**: Atualmente, a funcionalidade de doação é simulada. A integração real com gateways de pagamento (como Stripe ou PayPal) ainda não foi implementada.
- **Notificações**: Não há sistema de notificações em tempo real para updates dos helpinhos seguidos.
- **Painel Administrativo**: Um painel para gerenciamento dos usuários e campanhas ainda não foi implementado.

---

## Melhorias Possíveis
- **Otimização de Performance**: Implementar estratégias de cache e melhorar a performance das consultas ao banco de dados.
- **Segurança**: Melhorar a validação de dados no backend e garantir a segurança na transmissão de informações sensíveis.
- **Experiência do Usuário**: Melhorar o design das telas, adicionar animações e fornecer mensagens de erro mais amigáveis.
- **Testes Automatizados**: Implementar testes unitários e de integração para garantir a robustez do código.

---

## Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **Angular CLI** (versão 17 ou superior)
- **Conta AWS** com permissões para utilizar Cognito, Lambda, API Gateway e DynamoDB.
- **Serverless Framework**
- **AWS Amplify CLI**

---

## Instruções de Configuração

### **Backend**
1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/andreamil/Helpinho.git
   cd helpinho/backend
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar Credenciais AWS**:
   Certifique-se de configurar suas credenciais AWS usando o AWS CLI:
   ```bash
   aws configure
   ```

4. **Configurar Variáveis de Ambiente**:
   Crie um arquivo `.env` com as seguintes variáveis de ambiente:
   ```bash
    COGNITO_USER_POOL_ID=seu-user-pool-id
    COGNITO_DOMAIN=service-example.auth.sa-east-1.amazoncognito.com/
    COGNITO_APP_CLIENT_ID=client-id
    COGNITO_CALLBACK_URL=https://dev.exemplo.amplifyapp.com/
   ```

5. **Implantar o Backend**:
   Use o Serverless Framework para implantar as funções e recursos AWS:
   ```bash
   serverless deploy
   ```

### **Frontend**
1. **Navegar para o Diretório do Frontend**:
   ```bash
   cd ../frontend
   ```

2. **Instalar Dependências**:
   ```bash
   npm install
   ```

3. **Configurar AWS Amplify**:
   Crie o arquivo `src/aws-exports.js` com a configuração do AWS Amplify:
   ```javascript
   const awsmobile = {
     aws_project_region: 'sa-east-1',
     aws_cognito_region: 'sa-east-1',
     aws_user_pools_id: 'seu-user-pool-id',
     aws_user_pools_web_client_id: 'seu-client-id',
   };

   export default awsmobile;
   ```

4. **Executar a Aplicação**:
   ```bash
   ng serve
   ```

---

## Executando o Projeto

1. **Certifique-se de que o Backend está Ativo**: Verifique se os serviços backend estão funcionando corretamente.
2. **Inicie a Aplicação Frontend**:
   ```bash
   ng serve
   ```
   Acesse a aplicação em `http://localhost:4200/`.
3. **Explore a Aplicação**: Crie e siga helpinhos, doe para campanhas e edite seu perfil.

---

# Rotas do Backend (Serverless.yml)

## **Usuários**

- **POST** `/users` - Criar novo usuário.
- **GET** `/users/{id}` - Obter informações de um usuário.
- **GET** `/users/{id}/statistics` - Obter estatísticas de um usuário.
- **GET** `/users/{id}/helps` - Listar doações feitas por um usuário.
- **GET** `/users/{id}/helpinhos` - Listar helpinhos criados por um usuário.
- **GET** `/users/{id}/followed-helpinhos` - Listar helpinhos seguidos por um usuário.

## **Helpinhos**

- **POST** `/helpinhos` - Criar um novo helpinho.
- **GET** `/helpinhos` - Listar helpinhos com filtros e paginação.
- **GET** `/helpinhos/{id}` - Obter detalhes de um helpinho.
- **PUT** `/helpinhos/{id}` - Atualizar um helpinho.
- **DELETE** `/helpinhos/{id}` - Excluir um helpinho.

## **Doações**

- **POST** `/helps` - Fazer uma doação para um helpinho.
- **GET** `/helpinhos/{id}/helps` - Listar doações feitas para um helpinho.

## **Seguir Helpinhos**

- **POST** `/helpinhos/{id}/follow` - Seguir um helpinho.
- **POST** `/helpinhos/{id}/unfollow` - Deixar de seguir um helpinho.

## **Autenticação**

- **GET** `/callback` - Callback para autenticação Cognito.

---

## Rotas do Frontend

- **`/`** - Página inicial com listagem de helpinhos.
- **`/login`** - Página de login.
- **`/register`** - Página de registro.
- **`/forgot-password`** - Página para o Esqueci a senha.
- **`/helpinho/create`** - Página de criação de helpinho.
- **`/helpinho/:id`** - Detalhes do helpinho.
- **`/me`** - Página de perfil do usuário.
- **`/pesquisa`** - Pesquisa avançada.

---

## Notas Adicionais

- **AWS Utilizado**: Cognito, Lambda, DynamoDB e S3 para armazenamento de imagens.
- **Tecnologias**: Angular 17, Tailwind CSS, Serverless Framework, AWS Amplify.

---
