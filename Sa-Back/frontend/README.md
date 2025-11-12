# Frontend - Aplicação React com JWT

Frontend React criado com Vite para integração com a API de autenticação JWT.

## Funcionalidades

- ✅ Login de usuário
- ✅ Registro de novos usuários
- ✅ Dashboard protegido
- ✅ Autenticação JWT com Access Token e Refresh Token
- ✅ Interceptor do Axios para renovação automática de tokens
- ✅ Rotas protegidas
- ✅ Context API para gerenciamento de autenticação

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx    # Componente para rotas protegidas
│   ├── config/
│   │   └── axios.ts               # Configuração do Axios com interceptors
│   ├── contexts/
│   │   └── AuthContext.tsx       # Context de autenticação
│   ├── hooks/
│   │   └── useAuth.ts             # Hook customizado para autenticação
│   ├── pages/
│   │   ├── Login.tsx              # Tela de login
│   │   ├── Register.tsx           # Tela de registro
│   │   ├── Dashboard.tsx          # Tela principal protegida
│   │   ├── Auth.css               # Estilos para telas de auth
│   │   └── Dashboard.css          # Estilos para dashboard
│   ├── types/
│   │   └── auth.ts                # Tipos TypeScript
│   ├── App.tsx                    # Componente principal com rotas
│   └── main.tsx                   # Ponto de entrada
```

## Como Funciona a Autenticação

### 1. Login/Register
- O usuário faz login ou se registra
- A API retorna `accessToken` e `refreshToken`
- Os tokens são salvos no `localStorage`
- Os dados do usuário são salvos no context

### 2. Interceptor de Requisições
- Todas as requisições HTTP incluem automaticamente o header `Authorization: Bearer <accessToken>`
- O token é obtido do `localStorage`

### 3. Interceptor de Respostas
- Quando uma requisição retorna 401 (não autorizado):
  1. O interceptor tenta renovar o token usando o `refreshToken`
  2. Faz uma requisição para `/refresh` com o refresh token
  3. Se bem-sucedido, atualiza o `accessToken` no localStorage
  4. Reexecuta a requisição original com o novo token
  5. Se falhar, limpa os tokens e redireciona para `/login`

### 4. Rotas Protegidas
- O componente `ProtectedRoute` verifica se o usuário está autenticado
- Se não estiver, redireciona para `/login`
- Se estiver, renderiza o componente protegido

## Como Executar

### Instalar dependências
```bash
npm install
```

### Executar em desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para produção
```bash
npm run build
```

## Configuração

### URL da API

A URL base da API está configurada em `src/config/axios.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000';
```

Se sua API estiver em outra porta ou URL, atualize essa constante.

## Endpoints Utilizados

- `POST /register` - Registro de usuário
- `POST /login` - Login de usuário
- `POST /refresh` - Renovação do access token
- `POST /logout` - Logout do usuário

## Tecnologias Utilizadas

- **React 19** - Biblioteca para interface de usuário
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP
- **React Router DOM** - Roteamento
- **Context API** - Gerenciamento de estado de autenticação

## Uso Didático

Este projeto demonstra:
- Integração de frontend React com backend JWT
- Uso de interceptors do Axios para renovação automática de tokens
- Proteção de rotas com React Router
- Context API para gerenciamento de estado global
- Hooks customizados para reutilização de lógica
- TypeScript para type safety
