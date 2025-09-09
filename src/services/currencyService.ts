import { CurrencyRates, ApiResponse } from '@/types/contact';

const HG_BRASIL_API_URL = 'https://api.hgbrasil.com/finance';

export class CurrencyService {
  private static rates: CurrencyRates | null = null;
  private static lastFetch: Date | null = null;
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  static async getRates(): Promise<CurrencyRates> {
    // Verifica se tem cache válido
    if (this.rates && this.lastFetch && 
        (Date.now() - this.lastFetch.getTime()) < this.CACHE_DURATION) {
      return this.rates;
    }

    try {
      const response = await fetch(`${HG_BRASIL_API_URL}?format=json-cors&key=`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      this.rates = {
        USD: data.results.currencies.USD.buy,
        EUR: data.results.currencies.EUR.buy
      };
      
      this.lastFetch = new Date();
      return this.rates;
      
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      
      // Fallback para taxas fixas em caso de erro
      this.rates = {
        USD: 5.50, // Taxa aproximada BRL -> USD
        EUR: 6.00  // Taxa aproximada BRL -> EUR
      };
      
      return this.rates;
    }
  }

  static async convertCurrency(amountBRL: number): Promise<{ usd: number; eur: number }> {
    const rates = await this.getRates();
    
    return {
      usd: Number((amountBRL / rates.USD).toFixed(2)),
      eur: Number((amountBRL / rates.EUR).toFixed(2))
    };
  }

  static formatCurrency(amount: number, currency: 'BRL' | 'USD' | 'EUR'): string {
    const formatters = {
      BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
    };

    return formatters[currency].format(amount);
  }
}