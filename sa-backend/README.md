Backend for SA-4Fase

Quick start (Windows PowerShell):

1. Install dependencies:

```powershell
npm install
```

2. Generate Prisma client and run migration (SQLite):

```powershell
npm run prisma:generate
npm run prisma:migrate
```

3. Start server:

```powershell
npm run dev
```

Default server: http://localhost:4000

Endpoints:
- GET /health
- POST /auth/register { name, email, password, role }
- POST /auth/login { email, password }
