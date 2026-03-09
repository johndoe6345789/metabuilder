import { useAppSelector } from '@/store/exports'
import en from '@/config/locales/en.json'
import es from '@/config/locales/es.json'

const locales = { en, es }

export function useTranslation() {
  const locale = useAppSelector(state => state.ui.locale ?? 'en')
  return locales[locale] ?? locales.en
}
