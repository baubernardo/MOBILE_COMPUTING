# 📱 iStock - Gestão de Estoque, Encomendas e Vendas de iPhone

Aplicativo em **React Native** com **Expo Go (SDK 52)** projetado especialmente para lojas de iPhone, assistência técnica e revendedores Apple.

---

## 🚀 Como Executar no Expo Go

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm start
   ```

3. **Abra no seu celular**:
   - **iOS**: Abra a câmera nativa do iPhone e aponte para o QR Code gerado no terminal.
   - **Android**: Abra o aplicativo **Expo Go** e escaneie o QR Code.

---

## ✨ Funcionalidades Principais

### 1. 📦 Gestão de Estoque Atual
- Cadastro completo de iPhones:
  - Modelo (do iPhone 11 ao iPhone 16 Pro Max)
  - Capacidade de Armazenamento (64GB, 128GB, 256GB, 512GB, 1TB)
  - Cores originais Apple (Titânio Deserto, Titânio Natural, Meia-noite, etc.)
  - Saúde da Bateria (%) com indicador visual colorido inteligente
  - Condição do aparelho (Novo / Lacrado, Seminovo Grade A+, Grade A, Grade B)
  - IMEI / Número de Série
  - Preço de Custo, Preço de Venda e Margem de Lucro prevista
  - Fornecedor e Observações detalhadas
- Filtros rápidos: Todos, Disponíveis, Reservados e Vendidos.
- Filtro por condição (Lacrados vs Seminovos).
- Busca em tempo real por Modelo, IMEI, Cor ou Fornecedor.
- Ação rápida de **Vender**, **Editar**, **Excluir** e **Compartilhar Oferta no WhatsApp**.

### 2. 🚚 Controle de Encomendas (Pre-orders)
- Registro de pedidos sob demanda com adiantamento/sinal:
  - Nome e WhatsApp do Cliente (com atalho direto para conversar no WhatsApp)
  - Modelo, Capacidade, Cor e Condição solicitada
  - Valor Total Acordado, Sinal Pago e Saldo Restante calculado automaticamente
  - Previsão de Entrega e Fornecedor/Rastreio
- Fluxo de Status:
  - `Pendente` ➜ `A Caminho` ➜ `No Estoque (Recebido)` ➜ `Entregue ao Cliente`
- Botão direto para **Receber no Estoque** (transfere automaticamente o aparelho para a aba de Estoque).
- Botão para **Concluir Venda/Entrega**.

### 3. 💰 Registro de Vendas & Lucro Líquido
- Histórico completo de vendas realizadas.
- Métricas de faturamento total, lucro realizado e ticket médio.
- Formas de pagamento: Pix, Cartão de Crédito (com parcelamento em até 18x), Débito, Dinheiro e Misto.
- **Gerador de Comprovante / Recibo de Venda** compartilhável diretamente via WhatsApp ou redes sociais.

### 4. 📊 Dashboard de Indicadores
- Valuation total do estoque (Preço de Custo vs Valor de Venda esperado).
- Lucro projetado no estoque atual.
- Total de sinais de clientes retidos em caixa.
- Gráfico de distribuição de modelos mais frequentes no estoque.
- Distribuição de saúde de bateria dos iPhones em estoque (100%, 90-99%, <90%).
- Botão para restaurar os dados de exemplo/demonstração a qualquer momento.

---

## 🛠️ Tecnologias Utilizadas

- **Expo SDK 57**
- **React Native 0.86 / React 19**
- **TypeScript**
- **AsyncStorage** para persistência 100% offline
- **React Native Safe Area Context**
- **Expo Vector Icons** (Ionicons)
- **Expo Sharing**
