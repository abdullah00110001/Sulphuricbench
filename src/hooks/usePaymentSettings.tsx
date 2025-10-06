import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

interface PaymentSettings {
  sslcommerz_enabled: boolean
  bkash_manual_enabled: boolean
  bkash_merchant_number: string
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      try {
        // Try to get from payment_settings table first
        const { data: paymentSettings, error: paymentError } = await supabase
          .from('payment_settings')
          .select('*')
          .single()

        if (!paymentError && paymentSettings) {
          return {
            sslcommerz_enabled: paymentSettings.sslcommerz_enabled,
            bkash_manual_enabled: paymentSettings.bkash_enabled,
            bkash_merchant_number: '01309878503'
          }
        }

        // Fallback to site_settings table
        const { data, error } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['sslcommerz_enabled', 'bkash_manual_enabled', 'bkash_merchant_number'])

        console.log('Payment settings data:', data)

        // Default settings - both enabled for now
        const settings: PaymentSettings = {
          sslcommerz_enabled: true,
          bkash_manual_enabled: true,
          bkash_merchant_number: '01309878503'
        }

        // Override with database values if they exist
        if (data && !error) {
          data.forEach(setting => {
            console.log('Processing setting:', setting)
            
            if (setting.key === 'sslcommerz_enabled') {
              // Parse JSON string value
              const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
              settings.sslcommerz_enabled = String(value).toLowerCase() === 'true'
            } else if (setting.key === 'bkash_manual_enabled') {
              const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
              settings.bkash_manual_enabled = String(value).toLowerCase() === 'true'
            } else if (setting.key === 'bkash_merchant_number') {
              const value = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value
              settings.bkash_merchant_number = String(value) || '01309878503'
            }
          })
        }

        console.log('Final payment settings:', settings)
        return settings
      } catch (error) {
        console.error('Error loading payment settings:', error)
        // Return defaults if database query fails
        return {
          sslcommerz_enabled: true,
          bkash_manual_enabled: true,
          bkash_merchant_number: '01309878503'
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })
}