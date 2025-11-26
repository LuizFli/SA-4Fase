############################
# Imagem de Produção Única
############################
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# Instala somente dependências necessárias em runtime
RUN npm install --omit=dev \
    && npm cache clean --force
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Converte quebras de linha Windows (CRLF) para Linux (LF) e dá permissão de execução
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "require('http').get('http://localhost:4000/health',r=>{if(r.statusCode!==200)process.exit(1)}).on('error',()=>process.exit(1))"
EXPOSE 4000
CMD ["node", "src/app.js"]

# Build da imagem:
# docker build -t sa-backend:1.0.0 .
# Executar local:
# docker run --env-file .env -p 4000:4000 sa-backend:1.0.0
# Multi-arch (exemplo):
# docker buildx build --platform linux/amd64,linux/arm64 -t <usuario>/sa-backend:1.0.0 --push .


