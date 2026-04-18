# Deploy no Render

## Passo a Passo

### 1. Criar conta no Render
- Acesse: https://render.com
- Faça login com sua conta do GitHub

### 2. Criar novo Web Service
1. No Dashboard, clique em **"New +"**
2. Selecione **"Web Service"**
3. Conecte seu repositório: `moasampaio15-hub/bioritmo-plus`
4. Clique em **"Connect"**

### 3. Configurar o serviço

**Nome:** `bioritmo-plus`

**Runtime:** Node

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Plan:** Free

### 4. Configurar variáveis de ambiente

Clique em **"Advanced"** e adicione:

| Key | Value | Observação |
|-----|-------|------------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render usa esta porta |
| `GEMINI_API_KEY` | (sua chave) | Obter em: makersuite.google.com |
| `STRIPE_SECRET_KEY` | (sua chave) | Obter em: dashboard.stripe.com |
| `STRIPE_PUBLISHABLE_KEY` | (sua chave) | Obter em: dashboard.stripe.com |
| `FIREBASE_API_KEY` | (sua chave) | Configurações do Firebase |
| `FIREBASE_AUTH_DOMAIN` | (seu domínio) | |
| `FIREBASE_PROJECT_ID` | (seu projeto) | |
| `JWT_SECRET` | (gerar aleatório) | Use: openssl rand -base64 32 |

### 5. Criar banco de dados (opcional)

O SQLite já está configurado para usar disco persistente.

### 6. Deploy

Clique em **"Create Web Service"**

Aguarde o build (pode levar 5-10 minutos).

### 7. Acessar o app

URL será: `https://bioritmo-plus.onrender.com`

---

## Solução de Problemas

### Build falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs no Render Dashboard

### App não inicia
- Verifique se a porta está configurada como `10000`
- Verifique se `npm start` está correto

### Banco de dados
- O SQLite usa disco persistente no Render
- Dados são mantidos entre deploys

---

## Após o Deploy

1. Teste o login/cadastro
2. Teste o check-in
3. Verifique se o dashboard carrega
4. Teste em diferentes dispositivos

---

## Atualizações

Para atualizar o app:
1. Faça push para o GitHub
2. O Render faz deploy automático
