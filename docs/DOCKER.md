# 🐳 Guia de Execução com Docker & PostgreSQL

Este guia explica como inicializar e gerenciar o ambiente de banco de dados PostgreSQL e a API REST do **iStock** utilizando Docker Compose ou execução local.

---

## 🚀 1. Inicialização Rápida

### Opção A: Subir tudo via Docker Compose (Recomendado para Produção/Staging)

Na raiz do projeto, execute:

```bash
# Sobe os containers em background (PostgreSQL, Backend API e Adminer)
docker compose up -d
```

Para verificar o status dos serviços:
```bash
docker compose ps
```

Para visualizar os logs em tempo real:
```bash
docker compose logs -f api
```

Para encerrar o ambiente:
```bash
docker compose down
```

---

### Opção B: Executar a API Localmente com PostgreSQL no Docker (Ideal para Desenvolvimento)

Se você já tiver um container PostgreSQL rodando ou preferir rodar a API com hot-reload local:

1. **Certifique-se de que o PostgreSQL está rodando**:
   O banco `istock_db` já está configurado no PostgreSQL local na porta `5432` com usuário `postgres`.

2. **Inicie a API em modo desenvolvimento**:
   ```bash
   cd server
   npm run dev
   # ou na raiz: npm --prefix server run dev
   ```

3. **Verifique se a API está conectada**:
   Acesse no seu navegador: `http://localhost:3000/health`.
   A resposta esperada é:
   ```json
   {
     "status": "ok",
     "service": "istock-backend-api",
     "database": "connected"
   }
   ```

---

## 📱 2. Como Conectar o Aplicativo Móvel (Expo Go)

Por questões de rede e segurança, o endereço IP utilizado pelo aplicativo mobile varia dependendo de onde ele está sendo executado:

| Plataforma do App | Endereço da API | Onde configurar |
| :--- | :--- | :--- |
| **Navegador Web** (`npm run web`) | `http://localhost:3000/api` | Automático |
| **Simulador iOS** (Mac) | `http://localhost:3000/api` | Automático |
| **Emulador Android** | `http://10.0.2.2:3000/api` | Automático |
| **Celular Físico (Expo Go via Wi-Fi)** | `http://<SEU_IP_LOCAL>:3000/api` | Em `src/services/api.ts` |

### 📲 Configurando no Celular Físico:
1. Descubra o IP do seu computador na rede Wi-Fi local:
   * **macOS:** Acesse *Ajustes do Sistema ➔ Wi-Fi ➔ Detalhes* ou execute `ipconfig getifaddr en0` no terminal (ex: `192.168.1.15`).
2. Abra o arquivo [`src/services/api.ts`](../src/services/api.ts) e configure a constante:
   ```typescript
   export const API_CONFIG = {
     LOCAL_NETWORK_IP: '192.168.1.15', // Substitua pelo seu IP local
     PORT: 3000,
     // ...
   };
   ```
3. Certifique-se de que o computador e o celular estão conectados na **mesma rede Wi-Fi**.

---

## 🖥️ 3. Visualizador de Banco de Dados Web (Adminer)

O Docker Compose inclui o **Adminer**, uma interface web leve para inspecionar e editar tabelas do PostgreSQL no navegador:

* **URL de Acesso:** [http://localhost:8080](http://localhost:8080)
* **Sistema:** `PostgreSQL`
* **Servidor:** `postgres` (se rodando via Docker) ou `localhost` (se acessando direto)
* **Usuário:** `postgres`
* **Senha:** `postgres` (ou `admin@admin`)
* **Base de Dados:** `istock_db`

---

## 🛠️ 4. Variáveis de Ambiente (`.env`)

Você pode customizar portas e credenciais criando um arquivo `.env` na raiz:

```ini
# Configurações do PostgreSQL
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=istock_db
DB_PORT=5433

# Configurações da API
API_PORT=3000

# Interface Adminer
ADMINER_PORT=8080
```

> **Nota sobre Portas:** Por padrão, o PostgreSQL no `docker-compose.yml` mapeia a porta `5433:5432` no host para nunca colidir com outros bancos de dados que você já tenha instalado rodando na porta padrão `5432`.
