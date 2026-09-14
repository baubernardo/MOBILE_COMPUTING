import { Colors } from '../theme/colors';
import { OrderStatus, StockStatus, iPhoneCondition } from '../types';

export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export const formatIMEI = (imei: string | undefined): string => {
  if (!imei) return '-';
  const clean = imei.replace(/\D/g, '');
  if (clean.length === 15) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 8)} ${clean.slice(8, 14)} ${clean.slice(14)}`;
  }
  return imei;
};

export const getBatteryColor = (health: number): string => {
  if (health >= 90) return Colors.success;
  if (health >= 80) return Colors.warning;
  return Colors.danger;
};

export const getStockStatusInfo = (status: StockStatus) => {
  switch (status) {
    case 'disponivel':
      return { label: 'Disponível', color: Colors.success, bg: Colors.successMuted };
    case 'reservado':
      return { label: 'Reservado', color: Colors.warning, bg: Colors.warningMuted };
    case 'vendido':
      return { label: 'Vendido', color: Colors.textMuted, bg: 'rgba(100, 116, 139, 0.2)' };
    default:
      return { label: status, color: Colors.textSecondary, bg: 'rgba(255, 255, 255, 0.1)' };
  }
};

export const getOrderStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case 'pendente':
      return { label: 'Pendente', color: Colors.warning, bg: Colors.warningMuted };
    case 'a_caminho':
      return { label: 'A Caminho', color: Colors.primary, bg: Colors.primaryMuted };
    case 'recebido':
      return { label: 'No Estoque', color: Colors.purple, bg: Colors.purpleMuted };
    case 'entregue':
      return { label: 'Entregue / Concluído', color: Colors.success, bg: Colors.successMuted };
    case 'cancelado':
      return { label: 'Cancelado', color: Colors.danger, bg: Colors.dangerMuted };
    default:
      return { label: status, color: Colors.textSecondary, bg: 'rgba(255, 255, 255, 0.1)' };
  }
};

export const getConditionInfo = (condition: iPhoneCondition) => {
  if (condition === 'Novo / Lacrado') {
    return { label: 'Lacrado', color: Colors.gold, bg: Colors.goldMuted };
  }
  return { label: condition, color: Colors.primaryLight, bg: Colors.primaryMuted };
};
