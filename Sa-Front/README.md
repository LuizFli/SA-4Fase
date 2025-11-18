# Sa-Front

Frontend Next.js (App Router) para a aplicação.

## Configuração

Crie um arquivo `.env.local` na raiz com a URL do backend:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Observação: em desenvolvimento, o Next pode subir em `http://localhost:3001` se a porta 3000 estiver ocupada. O backend já permite CORS para `3000` e `3001`.

## Rodar localmente

```bash
# instalar deps
pnpm install

# modo dev
pnpm dev
```

Faça login em `/login` com um usuário válido do backend. O dashboard, estoque e status são protegidos por middleware e exigem autenticação.

## Fluxos implementados

- Login/logout com tokens em cookies (`accessToken`/`refreshToken`).
- Listagem de produtos (estoque) via `/produtos`.
- Pedir produto: cria `produto` e envia `N` `pedidos` associados.
- Status: lista pedidos do usuário e atualiza status chamando `/pedidos/:id/status`.
- Movimentações de estoque:
	- Aumentar: cria pedido e finaliza automaticamente (`/pedidos/:id` com `status=FINALIZADO`), incrementando o estoque no banco.
	- Diminuir: atualiza o `estoque` do produto via `PUT /produtos/:id`.
	- Editar: atualiza campos do produto via `PUT /produtos/:id`.
	- Excluir: remove o produto via `DELETE /produtos/:id`.
