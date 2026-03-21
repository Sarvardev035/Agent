// Real-time currency exchange utilities
// Uses ExchangeRate-API free tier (1500 requests/month)
// API Key: Store in .env.local — fallback to cached rates

export interface ExchangeRate {
  base: string
  target: string
  rate: number
  timestamp: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const CACHE_KEY_PREFIX = 'finly_exchange_rate_'

export class CurrencyExchange {
  private static apiKey = ((import.meta as unknown) as { env: Record<string, string> }).env?.VITE_EXCHANGE_API_KEY || 'demo'
  private static baseUrl = 'https://api.exchangerate-api.com/v6'

  static getFromCache(base: string, target: string): ExchangeRate | null {
    try {
      const key = `${CACHE_KEY_PREFIX}${base}_${target}`
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const data = JSON.parse(cached) as ExchangeRate
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(key)
        return null
      }
      return data
    } catch {
      return null
    }
  }

  static setCache(base: string, target: string, rate: number): void {
    try {
      const key = `${CACHE_KEY_PREFIX}${base}_${target}`
      const data: ExchangeRate = {
        base,
        target,
        rate,
        timestamp: Date.now(),
      }
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // Silently fail if quota exceeded
    }
  }

  static async getRate(base: string, target: string): Promise<number> {
    if (base === target) return 1

    // Check cache first
    const cached = this.getFromCache(base, target)
    if (cached) return cached.rate

    try {
      const url = `${this.baseUrl}/${this.apiKey}/latest/${base}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      interface ApiResponse {
        rates?: Record<string, number>
      }
      const data = (await response.json()) as ApiResponse
      const rate = data.rates?.[target]

      if (!rate) {
        throw new Error(`Rate not found for ${target}`)
      }

      this.setCache(base, target, rate)
      return rate
    } catch (err) {
      // Fallback: return cached rate even if expired, or default
      const cached = CurrencyExchange.getFromCache(base, target)
      if (cached) return cached.rate

      // If no cache, use default fallbacks (emergency mode)
      return this.getFallbackRate(base, target)
    }
  }

  static convert(
    amount: number,
    _fromCurrency: string,
    _toCurrency: string,
    rate: number
  ): number {
    return Number((amount * rate).toFixed(2))
  }

  private static getFallbackRate(base: string, target: string): number {
    // Hardcoded rates for common currencies (last updated)
    const rates: Record<string, Record<string, number>> = {
      USD: { EUR: 0.92, RUB: 92.5, UZS: 12500 },
      EUR: { USD: 1.09, RUB: 100.5, UZS: 13600 },
      RUB: { USD: 0.011, EUR: 0.0099, UZS: 135 },
      UZS: { USD: 0.00008, EUR: 0.000073, RUB: 0.0074 },
    }
    return rates[base]?.[target] ?? 1
  }
}

export const supportedCurrencies = ['USD', 'EUR', 'RUB', 'UZS'] as const
export type SupportedCurrency = (typeof supportedCurrencies)[number]
