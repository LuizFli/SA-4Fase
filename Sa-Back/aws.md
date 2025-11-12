```sh
docker compose up --d
docker ps -a
docker exec -it [id da imagem: auth_jwt_app] sh
npx prisma generate && npx prisma migrate dev
```

-> Setar o docker para nao usar sudo
```sh
    sudo groupadd docker
    sudo usermod -aG docker $USER
```