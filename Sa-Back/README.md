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

## Build Process

For development (hot reload, real-time changes):
```
  docker build -t auth_jwt:dev --target dev .
```

For production (compiled code, production-only dependencies):
```
docker build -t auth_jwt:prod --target prod .
docker run -p 3000:3000 auth_jwt:prod
```