# 🌐 Especificação da REST API

A API do **iStock** disponibiliza endpoints REST para manipulação de estoque, encomendas sob demanda, registro de vendas e indicadores de desempenho.

* **Base URL Local:** `http://localhost:3000/api`
* **Formato de Dados:** `application/json`
* **CORS:** Ativado para todas as origens (`*`).

---

## 🔍 Sumário de Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/health` | Diagnóstico de integridade da API e conexão com PostgreSQL |
| `GET` | `/api/stock` | Listar todos os itens do estoque |
| `POST` | `/api/stock` | Cadastrar novo iPhone no estoque |
| `PUT` | `/api/stock/:id` | Atualizar dados de um item existente |
| `DELETE` | `/api/stock/:id` | Excluir item do estoque |
| `GET` | `/api/orders` | Listar todas as encomendas de clientes |
| `POST` | `/api/orders` | Registrar nova encomenda com sinal |
| `PUT` | `/api/orders/:id` | Editar dados de uma encomenda |
| `PATCH`| `/api/orders/:id/status` | Atualizar apenas o status da encomenda |
| `POST` | `/api/orders/:id/convert-to-stock` | Receber encomenda e converter em item de estoque |
| `DELETE` | `/api/orders/:id` | Excluir encomenda |
| `GET` | `/api/sales` | Listar histórico de vendas realizadas |
| `POST` | `/api/sales` | Registrar venda (com baixa automática de estoque/pedido) |
| `DELETE` | `/api/sales/:id` | Excluir registro de venda |
| `GET` | `/api/dashboard/metrics` | Métricas consolidadas calculadas em SQL |
| `POST` | `/api/admin/reset-demo` | Restaurar banco para dados de exemplo |

---

## 1. Diagnóstico do Sistema

### `GET /health`
Verifica se o servidor Express e o PostgreSQL estão operacionais.

**Resposta de Sucesso (200 OK):**
```json
{
  "status": "ok",
  "service": "istock-backend-api",
  "timestamp": "2026-09-14T20:00:00.000Z",
  "database": "connected"
}
```

---

## 2. Gestão de Estoque

### `GET /api/stock`
Retorna a lista completa de iPhones em estoque, ordenados pelos mais recentes.

### `POST /api/stock`
Cadastra um novo iPhone no estoque.

**Corpo da Requisição (JSON):**
```json
{
  "model": "iPhone 15 Pro",
  "storage": "128GB",
  "color": "Titânio Natural",
  "batteryHealth": 99,
  "condition": "Seminovo Grade A+",
  "imei": "359874123456789",
  "costPrice": 4200.00,
  "salePrice": 5100.00,
  "supplier": "Distribuidora SP",
  "status": "disponivel",
  "notes": "Aparelho impecável na caixa com cabo original."
}
```

**Resposta de Sucesso (201 Created):** Retorna o objeto `StockItem` criado com `id`, `createdAt` e `updatedAt`.

---

## 3. Controle de Encomendas

### `POST /api/orders`
Registra uma encomenda de cliente com adiantamento.

**Corpo da Requisição (JSON):**
```json
{
  "customerName": "Lucas Andrade",
  "customerPhone": "11987654321",
  "model": "iPhone 16 Pro",
  "storage": "256GB",
  "color": "Titânio Deserto",
  "condition": "Novo / Lacrado",
  "agreedPrice": 7400.00,
  "depositPaid": 1500.00,
  "estimatedArrival": "2026-09-25",
  "status": "pendente",
  "supplier": "Miami Import",
  "notes": "Cliente paga o restante na retirada."
}
```

### `POST /api/orders/:id/convert-to-stock`
Operação transacional: quando a encomenda chega do fornecedor, este endpoint cadastra o aparelho no estoque com status `'reservado'` e atualiza a encomenda para `'recebido'`.

**Corpo da Requisição (JSON):**
```json
{
  "imei": "359874123456789",
  "costPrice": 5900.00,
  "batteryHealth": 100
}
```

---

## 4. Registro de Vendas

### `POST /api/sales`
Registra uma venda realizada. Executa em transação SQL e atualiza o status do item de estoque para `'vendido'` ou da encomenda para `'entregue'`.

**Corpo da Requisição (JSON):**
```json
{
  "stockItemId": "stock-1",
  "customerName": "Mariana Souza",
  "customerPhone": "11988887777",
  "model": "iPhone 15 Pro",
  "storage": "128GB",
  "color": "Titânio Natural",
  "condition": "Seminovo Grade A+",
  "imei": "359874123456789",
  "costPrice": 4200.00,
  "salePrice": 5100.00,
  "paymentMethod": "pix",
  "installments": 1,
  "notes": "Pago à vista com desconto."
}
```

---

## 5. Dashboard de Indicadores

### `GET /api/dashboard/metrics`
Calcula todas as métricas financeiras e volumétricas diretamente no PostgreSQL com funções agregadas (`SUM`, `COUNT`, `DATE_TRUNC`).

**Resposta de Sucesso (200 OK):**
```json
{
  "totalStockItems": 15,
  "totalStockCost": 48500.00,
  "totalStockValue": 62300.00,
  "projectedProfit": 13800.00,
  "activeOrdersCount": 4,
  "totalDepositsHeld": 3200.00,
  "totalSalesCount": 42,
  "totalSalesRevenue": 156800.00,
  "totalRealizedProfit": 34200.00,
  "monthSalesRevenue": 28400.00,
  "monthRealizedProfit": 6100.00
}
```
