# auth_jwt
Repository for students, development jwt auth


npm install express prisma @prisma/client
npm install -D typescript @types/node @types/express ts-node nodemon

npx tsc --init

npx prisma init

npx prisma generate

npx prisma migrate dev --name init_migration

5. Nodemon Configuration and Scripts:
Configure Nodemon: Create a nodemon.json file in your project root:
Código

    // nodemon.json
    {
      "watch": ["src"],
      "ext": "ts",
      "execMap": {
        "ts": "ts-node"
      }
    }
Add Scripts to package.json.
Código

    // package.json
    {
      "name": "my-express-prisma-app",
      "version": "1.0.0",
      "main": "dist/index.js",
      "scripts": {
        "build": "npx tsc",
        "start": "node dist/index.js",
        "dev": "nodemon --exec ts-node src/index.ts"
      },
      "devDependencies": {
        // ... your dev dependencies
      },
      "dependencies": {
        // ... your dependencies
      }
    }
6. Running the Application:
npm run dev
npm run build
npm start

## Docker

Build (dev):
```
docker build -t sa-backend:dev --target dev .
docker run --env-file .env -p 4000:4000 sa-backend:dev
```

Build (prod):
```
docker build -t sa-backend:1.0.0 --target prod .
docker run --env-file .env -p 4000:4000 sa-backend:1.0.0
```

### Variáveis obrigatórias (.env)
Exemplo mínimo para desenvolvimento:
```
DATABASE_URL="mysql://root:senha@localhost:3306/salesight"
ACCESS_TOKEN_SECRET="dev_access_secret"
REFRESH_TOKEN_SECRET="dev_refresh_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="8h"
```

Se `DATABASE_URL` faltar o servidor agora aborta logo no início com uma mensagem clara (veja `prisma/prisma.js`).

### Passos de inicialização (local)
1. Criar/editar `.env` com `DATABASE_URL` válido.
2. Instalar dependências: `npm install`
3. Gerar client Prisma: `npx prisma generate`
4. Criar schema no banco (sem migrações versionadas): `npx prisma db push` ou, se usar migrações, `npx prisma migrate dev --name init`
5. Seed opcional: `npx prisma db seed`
6. Iniciar: `npm run dev` ou `npm start`

Erros comuns:
- `Environment variable not found: DATABASE_URL`: falta definir no `.env` ou não carregou (garantido agora pelo import de `dotenv` em `prisma/prisma.js`).
- Credenciais inválidas MySQL: verifique usuário/senha/host/porta e se o serviço está ativo.

Principais variáveis esperadas (exemplo `.env` – NÃO commitar) para MySQL:
```
PORT=4000
DATABASE_URL="mysql://usuario:senha@host:3306/nome_db"
JWT_SECRET="sua_chave"
```

Healthcheck disponível em `GET /health` retorna 200.

## Deploy AWS (Exemplo ECS Fargate + RDS)

1. Criar repositório ECR:
```
aws ecr create-repository --repository-name sa-backend
```

2. Login no ECR (substitua `<aws_account_id>` e `<region>`):
```
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
```

3. Build e push imagem:
```
docker build -t sa-backend:1.0.0 --target prod .
docker tag sa-backend:1.0.0 <aws_account_id>.dkr.ecr.<region>.amazonaws.com/sa-backend:1.0.0
docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/sa-backend:1.0.0
```

4. Banco: criar instância RDS MySQL e montar `DATABASE_URL`:
  - Formato: `mysql://USER:PASS@HOST:3306/DBNAME`
  - Exemplo com variáveis: `mysql://admin:Secreta123@sa-backend-db.abcd1234.us-east-1.rds.amazonaws.com:3306/appdb`
  - Certifique-se de habilitar public accessibility somente se necessário.

5. Criar Task Definition (ECS Fargate):
  - Image: `<aws_account_id>.dkr.ecr.<region>.amazonaws.com/sa-backend:1.0.0`
  - CPU/Mem conforme carga
  - Porta container: 4000
  - Health check command (ECS): `CMD-SHELL` -> `curl -f http://localhost:4000/health || exit 1`
  - Env vars: `PORT=4000`, `DATABASE_URL=...`, `JWT_SECRET=...`

6. Service (ECS):
  - Fargate, mínimo 1 task
  - Target Group HTTP na porta 4000 (health path: `/health`)
  - ALB público ou interno conforme necessidade

7. Migração / Prisma (MySQL):
  - Opcional: executar uma task única com comando:
```
docker run --rm --env-file .env sa-backend:1.0.0 npx prisma migrate deploy
```
  - Em produção use `migrate deploy` (não `db push`) para aplicar migrações versionadas.

## Alternativas de Deploy
- Elastic Beanstalk: criar Dockerrun ou usar a imagem do ECR.
- EC2 simples: instalar Docker, fazer pull da imagem e rodar com `--env-file`.
- Lightsail Container: subir diretamenta a imagem (mais simples porém menos flexível).

## Observações
- Não inclua `.env` no build da imagem; use variáveis em runtime.
- HEALTHCHECK no Dockerfile permite ECS reiniciar containers não saudáveis.
- Use `npm ci` em pipelines se quiser builds determinísticos (atualizar Dockerfile se necessário).
- Confirmado: provider Prisma configurado como `mysql` em `prisma/schema.prisma`.