FROM nginx:latest

# Diretório padrão do Nginx para arquivos estáticos
WORKDIR /usr/share/nginx/html

# Copia a saída estática do Next (out/) para o diretório do Nginx
COPY ./out /usr/share/nginx/html

# Copia o arquivo de configuração nginx gerado para o container
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

