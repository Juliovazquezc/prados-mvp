import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useI18n();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "es" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative !-ml-1"
      aria-label={locale === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
    >
      <Languages className="h-5 w-5" />
      <span className="absolute -bottom-1 -right-1 text-xs font-bold">
        {locale.toUpperCase()}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
