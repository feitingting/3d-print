import zhCN from '../locales/zh-CN';
import enUS from '../locales/en-US';
import deDE from '../locales/de-DE';
import esES from '../locales/es-ES';

export type Locale = 'zh-CN' | 'en-US' | 'de-DE' | 'es-ES';

export const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'de-DE': deDE,
  'es-ES': esES,
};

export const localeNames = {
  'zh-CN': '中文',
  'en-US': 'English',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
};

// 获取当前语言
export const getCurrentLocale = (): Locale => {
  const saved = localStorage.getItem('locale');
  return (saved as Locale) || 'zh-CN';
};

// 设置当前语言
export const setCurrentLocale = (locale: Locale) => {
  localStorage.setItem('locale', locale);
  window.location.reload(); // 刷新页面应用新语言
};

// 获取翻译文本
export const t = (key: string): string => {
  const locale = getCurrentLocale();
  const messages = locales[locale];
  return messages[key] || key;
};

// React Hook: 使用翻译
export const useTranslation = () => {
  const locale = getCurrentLocale();
  
  return {
    t,
    locale,
    setLocale: setCurrentLocale,
  };
};

