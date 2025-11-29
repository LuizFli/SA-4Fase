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
