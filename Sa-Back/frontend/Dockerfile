FROM node:25-alpine

# 2) Define o diretório de trabalho dentro do container
WORKDIR /app

# 3) Copia os arquivos de configuração de dependências
COPY package*.json ./

# 4) Instala as dependências do backend
RUN npm install

# 5) Copia o restante do código do backend para dentro da imagem
COPY . .

# 6) Gera o Prisma Client (necessário para usar o Prisma no código)
RUN npx prisma generate

# 7) Expõe a porta que o servidor Express usa dentro do container
EXPOSE 4000

# 8) Define o comando padrão que será executado quando o container iniciar
CMD ["npm", "start"]