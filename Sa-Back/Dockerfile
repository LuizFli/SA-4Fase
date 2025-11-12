FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

EXPOSE 3000
CMD ["npm", "run", "dev"]
