import { ReactNode, useState } from "react";
import { IntlProvider } from "react-intl";
import { createContext, useContext } from "react";
import enMessages from "./messages/en";
import esMessages from "./messages/es";
import { Locale, Messages } from "./types";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

const MESSAGES = {
  en: enMessages,
  es: esMessages,
} as const;

export const I18nProvider = ({ children }: I18nProviderProps) => {
  // Get initial locale from browser or localStorage
  const getInitialLocale = (): Locale => {
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && ["en", "es"].includes(savedLocale)) {
      return savedLocale;
    }
    const browserLocale = navigator.language.split("-")[0] as Locale;
    return ["en", "es"].includes(browserLocale) ? browserLocale : "en";
  };

  const [locale, setLocale] = useState<Locale>(getInitialLocale());

  const handleSetLocale = (newLocale: Locale) => {
    localStorage.setItem("locale", newLocale);
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        messages: MESSAGES[locale],
      }}
    >
      <IntlProvider
        messages={MESSAGES[locale]}
        locale={locale}
        defaultLocale="en"
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
};
