# AVALIAÇÃO PRÁTICA – INTERNET DAS COISAS

**Curso Técnico em Desenvolvimento de Sistemas**  
**Unidade Curricular:** Internet das Coisas  
**Turma:** T DESI 2024/1 N1  
**Docente:** Fernando Costenaro Silva  
**Data:** 18/11/2025

---

## 📋 INTEGRANTES DA EQUIPE

- **Joabe Costa**
- **Luiz Filipe**
- **Abilio Francisco**
- **Wallace Oliveira**

---

## 📝 DESCRIÇÃO DO PROJETO

Este projeto consiste no desenvolvimento de um **microserviço IoT** para coleta e disponibilização de dados de sensores via protocolo HTTP. O serviço foi desenvolvido em **Node.js com Express**, containerizado com **Docker** e hospedado em uma instância **AWS EC2**.

### Objetivo
Criar um serviço web capaz de:
- Receber dados de sensores (temperatura e status do ar-condicionado) via requisição POST
- Armazenar o último valor recebido em memória
- Disponibilizar consulta ao último valor via requisição GET
- Executar de forma isolada em container Docker na nuvem AWS

### Contexto
O projeto simula um cenário real de **modernização de infraestrutura industrial**, migrando sistemas legados para uma arquitetura baseada em microserviços, comunicação via APIs RESTful e deploy em containers na nuvem.

---

## 🏗️ ESTRUTURA DO CÓDIGO

### Arquitetura do Projeto
```
avaliacao-iot-service/
├── Dockerfile              # Configuração do container
├── .dockerignore          # Arquivos ignorados no build
├── package.json           # Dependências Node.js
├── requests.http          # Testes REST Client
├── src/
│   └── server.js          # Servidor Express (rotas e lógica)
└── docs/
    ├── ENTREGA.md         # Documento de entrega
    └── Screenshots/       # Prints dos testes
```

### 📄 Dockerfile Comentado

```dockerfile
# Dockerfile para avaliacao-iot-service
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instala apenas produção (imagem menor). Usamos npm install pois não há lockfile.
RUN npm install --omit=dev

# Copia o restante do código
COPY . .

# Expõe a porta do serviço
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

**Explicação linha a linha:**
- `FROM node:20-alpine`: Usa imagem oficial do Node.js 20 na versão Alpine (apenas 40MB, otimizada)
- `WORKDIR /app`: Define `/app` como diretório padrão para execução dos comandos
- `COPY package*.json ./`: Copia arquivos de dependências antes do código (aproveita cache do Docker)
- `RUN npm install --omit=dev`: Instala apenas dependências de produção (não instala nodemon e ferramentas de dev)
- `COPY . .`: Copia todo o código-fonte restante
- `EXPOSE 3000`: Documenta que o container escuta na porta 3000
- `CMD ["npm", "start"]`: Executa `node src/server.js` ao iniciar o container

### 📄 server.js – Código Completo

```javascript
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let lastData = null;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'avaliacao-iot-service', 
    routes: ['/api/registro (POST)', '/api/ultimo (GET)'] 
  });
});

app.post('/api/registro', (req, res) => {
  const { temperatura, ar } = req.body || {};

  if (typeof temperatura !== 'number' || typeof ar !== 'boolean') {
    return res.status(400).json({
      ok: false,
      message: 'Payload inválido. Envie {"temperatura": number, "ar": boolean}'
    });
  }

  lastData = { temperatura, ar, recebidoEm: new Date().toISOString() };

  return res.status(201).json({ ok: true, recebido: lastData });
});

app.get('/api/ultimo', (req, res) => {
  if (!lastData) {
    return res.status(404).json({ 
      ok: false, 
      message: 'Nenhum dado registrado ainda.' 
    });
  }
  return res.json({ ok: true, ultimo: lastData });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://0.0.0.0:${PORT}`);
});
```

**Estrutura do código:**
- **Inicialização:** Cria servidor Express na porta 3000
- **Middleware:** `express.json()` faz parsing automático de JSON no body das requisições
- **Armazenamento:** Variável `lastData` guarda em memória o último valor recebido
- **Validação:** Verifica tipos de dados antes de armazenar (temperatura numérica, ar booleano)

---

## 🔌 EXPLICAÇÃO DA API

### Rotas Implementadas

#### 1️⃣ `GET /`
**Função:** Healthcheck e documentação básica  
**Resposta:** 200 OK
```json
{
  "status": "ok",
  "service": "avaliacao-iot-service",
  "routes": ["/api/registro (POST)", "/api/ultimo (GET)"]
}
```

#### 2️⃣ `POST /api/registro`
**Função:** Receber e armazenar dados de sensores  
**Content-Type:** `application/json`  
**Body esperado:**
```json
{
  "temperatura": 20.3,
  "ar": true
}
```

**Validações:**
- `temperatura` deve ser do tipo `number`
- `ar` deve ser do tipo `boolean`
- Retorna **400 Bad Request** se validação falhar

**Resposta de sucesso (201 Created):**
```json
{
  "ok": true,
  "recebido": {
    "temperatura": 20.3,
    "ar": true,
    "recebidoEm": "2025-11-19T01:30:45.123Z"
  }
}
```

#### 3️⃣ `GET /api/ultimo`
**Função:** Consultar o último valor registrado  
**Resposta (200 OK) quando há dados:**
```json
{
  "ok": true,
  "ultimo": {
    "temperatura": 20.3,
    "ar": true,
    "recebidoEm": "2025-11-19T01:30:45.123Z"
  }
}
```

**Resposta (404 Not Found) quando vazio:**
```json
{
  "ok": false,
  "message": "Nenhum dado registrado ainda."
}
```

### Códigos de Status HTTP Utilizados

| Código | Significado | Uso na API |
|--------|-------------|------------|
| 200 | OK | GET bem-sucedido com dados |
| 201 | Created | POST bem-sucedido, recurso criado |
| 400 | Bad Request | Dados inválidos no POST |
| 404 | Not Found | GET quando não há dados armazenados |

---

## 🖼️ PRINTS ORGANIZADOS

### 1. Execução Local (PowerShell)

#### Build da imagem Docker localmente
![PowerShell - Criação Dockerfile (1)](Screenshots/Poweshell%20da%20criação%20do%20%20dockerfile%20(1).png)
![PowerShell - Criação Dockerfile (2)](Screenshots/Poweshell%20da%20criação%20do%20%20dockerfile%20(2).png)
![PowerShell - Criação Dockerfile (3)](Screenshots/Poweshell%20da%20criação%20do%20%20dockerfile%20(3).png)
![PowerShell - Criação Dockerfile (4)](Screenshots/Poweshell%20da%20criação%20do%20%20dockerfile%20(4).png)

**Comandos executados:**
```powershell
# Build da imagem
docker build -t avaliacao-iot-service .

# Executar container localmente
docker run --name avaliacao-iot -p 3000:3000 -d avaliacao-iot-service

# Verificar logs
docker logs -f avaliacao-iot
```

### 2. Push para Docker Hub

**Comandos executados:**
```powershell
# Tag da imagem
docker tag avaliacao-iot-service joabecost/avaliacao-iot-service:latest

# Login no Docker Hub
docker login

# Push da imagem
docker push joabecost/avaliacao-iot-service:latest
```

**Imagem disponível em:** `joabecost/avaliacao-iot-service:latest`

### 3. Execução na AWS EC2

#### Terminal da EC2 – Pull e execução
![Terminal EC2 (1)](Screenshots/Terminal%20da%20EC2.png)
![Terminal EC2 (2)](Screenshots/Terminal%20da%20EC2%20(2).png)

**Comandos executados na EC2:**
```bash
# Pull da imagem do Docker Hub
sudo docker pull joabecost/avaliacao-iot-service:latest

# Executar container mapeando porta 80 (HTTP pública) → 3000 (app)
sudo docker run --name avaliacao-iot -p 80:3000 -d joabecost/avaliacao-iot-service:latest

# Verificar status
sudo docker ps

# Ver logs
sudo docker logs -f avaliacao-iot
```

#### Configuração da EC2
![Prints EC2 (1)](Screenshots/Prints%20da%20EC2%20(1).png)
![Prints EC2 (2)](Screenshots/Prints%20da%20EC2%20(2).png)
![Prints EC2 (3)](Screenshots/Prints%20da%20EC2%20(3).png)

**Configurações aplicadas:**
- **Instância:** t2.micro (Free Tier)
- **AMI:** Amazon Linux 2023
- **Security Group:** Porta 80 (HTTP) aberta para 0.0.0.0/0
- **IP Público:** `44.197.115.40`

### 4. Testes via Thunder Client

**Ferramenta utilizada:** Thunder Client (extensão do VS Code)  
**Motivo da escolha:** Interface visual intuitiva, integração nativa com o ambiente de desenvolvimento e facilidade para salvar/exportar requisições.

#### GET `/` – Healthcheck
![Teste GET raiz](Screenshots/Teste%20GET.png)

**Resultado:** Status 200 OK, retornando informações do serviço e rotas disponíveis.

#### GET `/api/ultimo` – Antes de qualquer POST
![Teste GET /api/ultimo (antes)](Screenshots/Teste%20GET%20api%20ultimo%20antes.png)

**Resultado:** Status 404 Not Found, mensagem "Nenhum dado registrado ainda" (comportamento esperado).

#### POST `/api/registro` – Envio de dados do sensor
![Teste POST /api/registro](Screenshots/Teste%20POST%20apiregistro.png)

**Body enviado:**
```json
{
  "temperatura": 20.3,
  "ar": true
}
```

**Resultado:** Status 201 Created, confirmação do recebimento com timestamp.

#### GET `/api/ultimo` – Após o POST
![Teste GET /api/ultimo (depois)](Screenshots/Teste%20GET%20api%20ultimo%20depois.png)

**Resultado:** Status 200 OK, retornando o último valor registrado com temperatura 20.3, ar true e timestamp.

---

## 🔧 TECNOLOGIAS E CONCEITOS UTILIZADOS

### Protocolo HTTP
- **GET:** Método para leitura de recursos (idempotente, não altera estado)
- **POST:** Método para envio de dados e criação de recursos
- **Headers:** `Content-Type: application/json` indica formato JSON no body
- **Status Codes:**
  - 2xx (sucesso): 200 OK, 201 Created
  - 4xx (erro do cliente): 400 Bad Request, 404 Not Found
  - 5xx (erro do servidor): não implementado neste projeto (servidor estável)

### JSON (JavaScript Object Notation)
JSON (JavaScript Object Notation) é um formato leve de intercâmbio de dados, legível por humanos e facilmente interpretado por máquinas. Baseado em um subconjunto da linguagem JavaScript, é amplamente utilizado em APIs RESTful para estruturar dados em pares chave-valor.

**Características:**
- Formato texto (string)
- Suporta tipos: string, number, boolean, array, object, null
- Independente de linguagem
- Sintaxe simples: `{"chave": "valor"}`

**Exemplo usado no projeto:**
```json
{
  "temperatura": 20.3,
  "ar": true
}
```

**Uso na API:**
- O cliente (Thunder Client) envia JSON no body do POST
- O servidor parseia com `express.json()` middleware
- A resposta também é JSON (padrão REST)

### Docker
- **Container:** Ambiente isolado que empacota aplicação + dependências
- **Imagem:** Template read-only usado para criar containers
- **Dockerfile:** Receita para construir a imagem
- **Docker Hub:** Registry público para compartilhar imagens

**Benefícios:**
- Portabilidade (roda igual em qualquer ambiente)
- Isolamento (não conflita com outras aplicações)
- Eficiência (containers são mais leves que VMs)

### Node.js + Express
- **Node.js:** Runtime JavaScript server-side, assíncrono e eficiente
- **Express:** Framework web minimalista para criação de APIs REST
- **Middleware:** Funções que processam requisições (ex: `express.json()`)

### AWS EC2 (Elastic Compute Cloud)
- **Instância:** Servidor virtual na nuvem AWS
- **Security Group:** Firewall virtual para controlar tráfego de entrada/saída
- **IP Público:** Endereço acessível pela internet

---

## 📊 FUNCIONAMENTO DAS ROTAS

### Fluxo de dados – POST /api/registro

```mermaid
Cliente (Thunder Client)
    ↓ POST /api/registro
    ↓ Body: {"temperatura": 20.3, "ar": true}
    ↓
Express Middleware (express.json())
    ↓ Parseia JSON → req.body
    ↓
Validação (server.js)
    ↓ Verifica tipos de temperatura e ar
    ↓
Armazenamento (variável lastData)
    ↓ lastData = { temperatura, ar, recebidoEm }
    ↓
Resposta 201 Created
    ↓ {"ok": true, "recebido": {...}}
    ↓
Cliente recebe confirmação
```

### Fluxo de dados – GET /api/ultimo

```mermaid
Cliente (Thunder Client)
    ↓ GET /api/ultimo
    ↓
Verificação (server.js)
    ↓ lastData === null ?
    ↓
Se vazio:
    → Resposta 404 Not Found
    → {"ok": false, "message": "Nenhum dado registrado ainda."}
    
Se preenchido:
    → Resposta 200 OK
    → {"ok": true, "ultimo": {...}}
```

---

## 📚 REFERÊNCIAS

- Express.js Documentation: https://expressjs.com/
- Docker Official Documentation: https://docs.docker.com/
- Node.js Documentation: https://nodejs.org/docs/
- AWS EC2 User Guide: https://docs.aws.amazon.com/ec2/
- HTTP Status Codes (MDN): https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- REST API Best Practices: https://restfulapi.net/
- JSON Specification: https://www.json.org/
- Thunder Client (VS Code): https://www.thunderclient.com/

---

**Documento elaborado em:** 19/11/2025  
**Repositório GitHub:** https://github.com/LuizFli/SA-4Fase  
**Imagem Docker Hub:** joabecost/avaliacao-iot-service:latest  
**Endpoint AWS:** http://44.197.115.40
