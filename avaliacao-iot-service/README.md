# Avaliação Prática – Serviço Web (IoT)

Serviço web simples em Node.js/Express, executando em Docker, que expõe duas rotas:
- `POST /api/registro`: recebe JSON `{ "temperatura": number, "ar": boolean }`, guarda o último valor em memória e retorna confirmação.
- `GET /api/ultimo`: retorna o último valor recebido.

## Tecnologias
- HTTP (métodos GET/POST, status codes, JSON)
- Node.js + Express
- Docker

## Estrutura
```
avaliacao-iot-service/
  Dockerfile
  .dockerignore
  package.json
  requests.http
  postman_collection.json
  src/
    server.js
```

## Como executar localmente (sem Docker)
```powershell
# dentro da pasta avaliacao-iot-service
npm install
npm start
# Servirá em http://localhost:3000
```

## Docker: build e run
```powershell
# Build da imagem
docker build -t avaliacao-iot-service .

# Executar o container mapeando a porta 3000
docker run --name avaliacao-iot -p 3000:3000 -d avaliacao-iot-service

# Logs
docker logs -f avaliacao-iot

# Parar e remover (quando quiser)
docker stop avaliacao-iot; docker rm avaliacao-iot
```

## Testes (curl / Postman / navegador)
- Healthcheck:
```powershell
curl http://localhost:3000/
```
- GET antes de registrar:
```powershell
curl http://localhost:3000/api/ultimo
```
- POST com JSON válido:
```powershell
curl -X POST http://localhost:3000/api/registro \
  -H "Content-Type: application/json" \
  -d '{"temperatura": 20.3, "ar": true}'
```
- GET após registro:
```powershell
curl http://localhost:3000/api/ultimo
```

Você também pode usar:
- `requests.http` (VS Code REST Client) com as requisições prontas
- `postman_collection.json` para importar no Postman

### Testes com Thunder Client (VS Code)
- Crie 3 requisições:
  - `GET http://SEU_IP_PUBLICO/`
  - `POST http://SEU_IP_PUBLICO/api/registro` com Body em JSON: `{ "temperatura": 20.3, "ar": true }` e `Content-Type: application/json`
  - `GET http://SEU_IP_PUBLICO/api/ultimo`
- Dica: use uma variável de ambiente/base (ex.: `baseUrl`) para trocar entre `http://localhost:3000` e `http://SEU_IP_PUBLICO`.
- Exporte a Collection (… > Export) e anexe na entrega, junto com prints das respostas.

### PowerShell: alternativas seguras (evita alias do curl)
O `curl` no PowerShell é alias de `Invoke-WebRequest` e pode causar erros com `-H`/`-d`. Prefira:

1) `Invoke-RestMethod` (recomendado)
```powershell
Invoke-RestMethod -Method Post -Uri "http://SEU_IP_PUBLICO/api/registro" -ContentType "application/json" -Body '{"temperatura":20.3,"ar":true}'
Invoke-RestMethod -Method Get  -Uri "http://SEU_IP_PUBLICO/api/ultimo"
```

2) Usando arquivo JSON
```powershell
'{"temperatura": 22.1, "ar": false}' | Out-File -FilePath .\sensor.json -Encoding utf8
$body = Get-Content .\sensor.json -Raw
Invoke-RestMethod -Method Post -Uri "http://SEU_IP_PUBLICO/api/registro" -ContentType "application/json" -Body $body
```

3) `curl.exe` real (não o alias)
```powershell
curl.exe -X POST "http://SEU_IP_PUBLICO/api/registro" -H "Content-Type: application/json" -d "{\"temperatura\":20.3,\"ar\":true}"
curl.exe "http://SEU_IP_PUBLICO/api/ultimo"
```

## Explicação do servidor
- `src/server.js` cria um servidor Express e utiliza `express.json()` para parsear JSON.
- Armazena o último dado recebido em memória (variável `lastData`).
- Valida tipos: `temperatura` deve ser número e `ar` booleano. Caso contrário, retorna 400.
- Respostas:
  - `POST /api/registro` → 201 com `{ ok: true, recebido: ... }`
  - `GET /api/ultimo` → 200 com `{ ok: true, ultimo: ... }` ou 404 se vazio

## Deploy em EC2 (resumo)
1. Conectar via SSH na sua instância EC2 (Linux) com Docker instalado.
2. Transferir os arquivos do projeto ou usar Git.
3. Executar o build e run:
```bash
docker build -t avaliacao-iot-service .
docker run --name avaliacao-iot -p 80:3000 -d avaliacao-iot-service
```
4. Liberar a porta 80 (ou 3000) no Security Group da EC2.
5. Testar via IP público da EC2:
```
GET http://SEU_IP_PUBLICO/
GET http://SEU_IP_PUBLICO/api/ultimo
POST http://SEU_IP_PUBLICO/api/registro
```

### Alternativa via Docker Hub (opcional)
Se a imagem já estiver publicada (ex.: `joabecost/avaliacao-iot-service:latest`):
```bash
docker pull joabecost/avaliacao-iot-service:latest
docker run --name avaliacao-iot -p 80:3000 -d joabecost/avaliacao-iot-service:latest
```

## Checklist de entrega
- Documentação de HTTP/JSON/Docker e do servidor (este README)
- Dockerfile completo e funcional
- Código das rotas `/api/registro` e `/api/ultimo`
- Evidências de testes (prints do Thunder Client/Postman/curl/navegador):
  - GET `/` (200)
  - GET `/api/ultimo` antes do POST (404 esperado)
  - POST `/api/registro` com JSON e resposta 201
  - GET `/api/ultimo` após o POST (200 com último valor)
- Comandos usados (build/run/logs) documentados
