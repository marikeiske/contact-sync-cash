export interface Contact {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  foto?: string;
  salario_brl: number;
  salario_usd?: number;
  salario_eur?: number;
  data_criacao: string;
  data_atualizacao?: string;
}

export interface ContactFormData {
  nome: string;
  telefone: string;
  email: string;
  foto?: File | null;
  salario_brl: number;
}

export interface CurrencyRates {
  USD: number;
  EUR: number;
}

export interface ApiResponse {
  success: boolean;
  results: {
    currencies: {
      USD: {
        buy: number;
        sell: number;
        variation: number;
      };
      EUR: {
        buy: number;
        sell: number;
        variation: number;
      };
    };
  };
}