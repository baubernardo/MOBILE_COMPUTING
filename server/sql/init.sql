-- ==============================================================================
-- iStock - Esquema Inicial do Banco de Dados PostgreSQL
-- ==============================================================================

-- 1. Tabela de Estoque (stock_items)
CREATE TABLE IF NOT EXISTS stock_items (
    id VARCHAR(64) PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    storage VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    battery_health INTEGER NOT NULL CHECK (battery_health >= 0 AND battery_health <= 100),
    condition VARCHAR(50) NOT NULL,
    imei VARCHAR(50) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'vendido')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_status ON stock_items (status);
CREATE INDEX IF NOT EXISTS idx_stock_model ON stock_items (model);
CREATE INDEX IF NOT EXISTS idx_stock_imei ON stock_items (imei);

-- 2. Tabela de Encomendas (pre_order_items)
CREATE TABLE IF NOT EXISTS pre_order_items (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    storage VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    agreed_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    remaining_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_arrival VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'a_caminho', 'recebido', 'entregue', 'cancelado')),
    supplier VARCHAR(100),
    notes TEXT,
    linked_stock_id VARCHAR(64) REFERENCES stock_items(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON pre_order_items (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON pre_order_items (customer_name);

-- 3. Tabela de Vendas (sale_items)
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(64) PRIMARY KEY,
    stock_item_id VARCHAR(64) REFERENCES stock_items(id) ON DELETE SET NULL,
    order_id VARCHAR(64) REFERENCES pre_order_items(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    model VARCHAR(100) NOT NULL,
    storage VARCHAR(20) NOT NULL,
    color VARCHAR(50) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    imei VARCHAR(50),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'misto')),
    installments INTEGER DEFAULT 1,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sale_items (sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_model ON sale_items (model);

-- ==============================================================================
-- DADOS INICIAIS DE DEMONSTRAÇÃO (SEED)
-- ==============================================================================

INSERT INTO stock_items (id, model, storage, color, battery_health, condition, imei, cost_price, sale_price, supplier, status, notes, created_at, updated_at)
VALUES
  ('stock-1', 'iPhone 15 Pro Max', '256GB', 'Titânio Natural', 100, 'Novo / Lacrado', '359874123456789', 5400.00, 6800.00, 'Importador Miami SP', 'disponivel', 'Garantia Apple 1 ano mundial. Lacrado.', NOW(), NOW()),
  ('stock-2', 'iPhone 15 Pro', '128GB', 'Titânio Preto', 98, 'Seminovo Grade A+', '359874123456788', 4300.00, 5200.00, 'Troca de cliente', 'disponivel', 'Impecável sem detalhes, caixa original.', NOW(), NOW()),
  ('stock-3', 'iPhone 14 Pro Max', '128GB', 'Roxo-profundo', 92, 'Seminovo Grade A', '359874123456787', 3700.00, 4600.00, 'Distribuidora Sul', 'disponivel', 'Cabo original incluso, película nova.', NOW(), NOW()),
  ('stock-4', 'iPhone 13', '128GB', 'Meia-noite', 88, 'Seminovo Grade A', '359874123456786', 2200.00, 2850.00, 'Distribuidora Sul', 'reservado', 'Reservado para Carlos (entrega sexta).', NOW(), NOW()),
  ('stock-5', 'iPhone 12', '64GB', 'Azul', 85, 'Seminovo Grade B', '359874123456785', 1400.00, 1950.00, 'Lote SP Outlet', 'disponivel', 'Pequena marca na quina inferior, tela 100% original.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO pre_order_items (id, customer_name, customer_phone, model, storage, color, condition, agreed_price, deposit_paid, remaining_amount, estimated_arrival, status, supplier, notes, created_at, updated_at)
VALUES
  ('order-1', 'Lucas Andrade', '11987654321', 'iPhone 16 Pro', '256GB', 'Titânio Deserto', 'Novo / Lacrado', 7400.00, 1500.00, 5900.00, '2026-09-22', 'a_caminho', 'Importador Miami SP', 'Cliente prefere pagar o saldo no Pix na retirada.', NOW(), NOW()),
  ('order-2', 'Mariana Costa', '11976543210', 'iPhone 14', '128GB', 'Estelar', 'Seminovo Grade A+', 3100.00, 500.00, 2600.00, '2026-09-25', 'pendente', 'Distribuidora Sul', 'Sinal pago via Pix.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO sale_items (id, customer_name, customer_phone, model, storage, color, condition, imei, cost_price, sale_price, profit, payment_method, installments, sale_date, notes)
VALUES
  ('sale-1', 'Fernanda Lima', '11965432109', 'iPhone 15', '128GB', 'Rosa', 'Novo / Lacrado', '359874123456780', 3800.00, 4800.00, 1000.00, 'cartao_credito', 10, NOW() - INTERVAL '2 days', 'Vendido em 10x sem juros.'),
  ('sale-2', 'Rodrigo Souza', '11954321098', 'iPhone 13 Pro', '256GB', 'Azul Sierra', 'Seminovo Grade A', '359874123456781', 2900.00, 3750.00, 850.00, 'pix', 1, NOW() - INTERVAL '5 days', 'Pago à vista via Pix com desconto.')
ON CONFLICT (id) DO NOTHING;
