import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { languages } from '../../i18n';
import clsx from 'clsx';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find((lang) => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const baseStyles = variant === 'light'
    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    : 'text-gray-300 hover:text-white hover:bg-gray-700';

  const dropdownStyles = variant === 'light'
    ? 'bg-white border border-gray-200 shadow-lg'
    : 'bg-gray-800 border border-gray-700 shadow-lg';

  const itemStyles = variant === 'light'
    ? 'hover:bg-gray-100 text-gray-700'
    : 'hover:bg-gray-700 text-gray-200';

  const activeStyles = variant === 'light'
    ? 'bg-primary-50 text-primary-700'
    : 'bg-gray-700 text-primary-400';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors',
          baseStyles
        )}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.flag} {currentLang.nativeName}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
        <ChevronDown className={clsx('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className={clsx(
          'absolute right-0 mt-1 py-1 w-40 rounded-md z-50',
          dropdownStyles
        )}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={clsx(
                'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                itemStyles,
                i18n.language === lang.code && activeStyles
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
