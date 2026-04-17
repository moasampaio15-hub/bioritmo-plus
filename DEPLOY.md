# 🚀 Deploy do BIORITMO+ no Render.com

## Passo a Passo

### 1. Criar conta no Render.com
- Acesse: https://render.com
- Cadastre-se com email do consultório
- Verifique o email

### 2. Conectar GitHub
- No dashboard do Render, clique em "New +"
- Selecione "Web Service"
- Conecte sua conta GitHub
- Autorize o Render a acessar seus repositórios

### 3. Configurar o Deploy

**Nome do serviço:** `bioritmo-plus`

**Runtime:** Node

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server.js
```

**Plano:** Free

### 4. Variáveis de Ambiente

Adicione estas variáveis:

```
NODE_ENV=production
JWT_SECRET=(gerar um valor aleatório forte)
PORT=10000
```

### 5. Disk (Persistência de dados)

- Nome: `bioritmo-data`
- Mount Path: `/opt/render/project/src/data`
- Size: 1 GB

### 6. Deploy

Clique em "Create Web Service"

Aguarde 2-3 minutos para o deploy completar.

### 7. URL do App

Após o deploy, você receberá uma URL como:
```
https://bioritmo-plus.onrender.com
```

### 8. Configurar Domínio Próprio (Opcional)

Se quiser usar `bioritmo.sampaiodiagnostico.com.br`:

1. No Render, vá em Settings > Custom Domains
2. Adicione seu domínio
3. Configure o DNS na Cloudflare/registro.br
4. Aguarde propagação (até 24h)

---

## 📱 Acesso dos Pacientes

Após o deploy, envie este link para seus pacientes:

```
https://bioritmo-plus.onrender.com
```

**Painel Médico:**
```
https://bioritmo-plus.onrender.com/medico/
```

---

## ⚠️ Limitações do Plano Free

- App "dorme" após 15 minutos de inatividade
- Demora ~30 segundos para "acordar" no primeiro acesso
- Banco SQLite (não recomendado para +1000 usuários)

**Para produção com muitos usuários, upgrade para plano pago ($7/mês)**

---

## 🔧 Comandos Úteis

**Ver logs:**
- Dashboard do Render > Logs

**Reiniciar serviço:**
- Manual Deploy > Deploy Latest Commit

**Atualizar:**
- Push para GitHub > Deploy automático

---

## 📞 Suporte

Render Docs: https://render.com/docs
