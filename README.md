# 💸 Money Transfer API

API REST criada para **simular transferências de dinheiro entre usuários**. Você pode rodar tudo **100 % em Docker** (recomendado) ou, se preferir, diretamente no Node.js.

Link de deploy:  
`https://money-transfer-api-c5tp.onrender.com`

---

## Sumário

1. Funcionalidades
2. Escolha seu modo de execução  
   • Docker (recomendado)  
   • Instalação local (Node.js)
3. Variáveis de ambiente
4. Scripts NPM úteis
5. Documentação de endpoints
6. Testes

---

## 1 • Funcionalidades

| Recurso  | Descrição                                                               |
| -------- | ----------------------------------------------------------------------- |
| Auth     | Cadastro (`/users/signup`) e login (`/users/signin`) com emissão de JWT |
| Users    | Listagem de usuários e seus saldos (`/users`)                           |
| Transfer | Transferência monetária entre contas (`/transfer`)                      |

---

## 2 • Escolha seu modo de execução

### 2.1 Docker (recomendado - não precisa instalar Node.js)

Pré-requisitos: **Docker 20+**

```bash
# clonar repositório
git clone https://github.com/hericlessouza/money_transfer.git
cd money_transfer

# definir variáveis de ambiente em tempo de execução
export JWT_SECRET="segredo_super_secreto"
export JWT_EXPIRES_IN="3600s"

# sobe o container
docker compose up
```

O backend sobe em `http://localhost:3000`.

### 2.2 Instalação local (Node.js)

Use apenas se precisar alterar o código fora de containers.

Requisitos: Node.js 22 LTS

```bash
git clone https://github.com/hericlessouza/money_transfer.git
cd money-transfer-api
npm ci
cp .env.example .env   # edite JWT_SECRET e JWT_EXPIRES_IN
npm run start:dev      # hot-reload em http://localhost:3000
```

---

## 3 • Variáveis de ambiente

| Nome           | Exemplo          | Obrigatório | Observação                                  |
| -------------- | ---------------- | ----------- | ------------------------------------------- |
| JWT_SECRET     | mysupersecretkey | ✅          | Usado para assinar o JWT                    |
| JWT_EXPIRES_IN | 3600s            | ✅          | Aceita notação do jsonwebtoken (`1d`, `2h`) |

No Docker Compose você pode exportar as vars (como mostrado) ou criar um arquivo `.env` – o Compose carrega automaticamente.

---

## 4 • Scripts NPM úteis

| Script            | Descrição                          |
| ----------------- | ---------------------------------- |
| npm run start     | Executa build já compilado (dist/) |
| npm run start:dev | Nest CLI + auto-reload             |
| npm run build     | Transpila TypeScript → `dist/`     |
| npm run test      | Testes unitários e de integração   |
| npm run test:cov  | Relatório de cobertura             |

---

## 5 • Documentação de endpoints

Base local: `http://localhost:3000`  
Produção: `https://money-transfer-api-c5tp.onrender.com`

Todas as rotas (exceto signup/signin) exigem:  
`Authorization: Bearer <jwt>`

### POST /users/signup

- Request

```json
{
  "username": "john_doe",
  "password": "senha123",
  "birthdate": "1990-01-01",
  "balance": 500.45
}
```

- Response 201

```json
{ "id": "uuid-gerado" }
```

### POST /users/signin

- Request

```json
{ "username": "john_doe", "password": "senha123" }
```

- Response 200

```json
{ "token": "jwt...", "expiresIn": "3600s" }
```

### GET /users

Retorna todos os usuários.

```json
[
  {
    "id": "uuid1",
    "username": "john_doe",
    "birthdate": "1990-01-01",
    "balance": 100.0
  }
]
```

### POST /transfer

- Request

```json
{ "fromId": "uuid1", "toId": "uuid2", "amount": 25.75 }
```

- Response 204 (sem corpo)

---

## 6 • Testes

### 6.1 Via Docker (usando o stage **builder**)

O runner não contém devDependencies, portanto usamos a imagem do stage builder:

```bash
# constrói até o stage builder
docker build --target builder -t money_transfer:test .

# executa testes
docker run --rm money_transfer:test npm run test
```

### 6.2 Via Node local

```bash
`npm run test`
```
