import React, { useState } from 'react';
import { Pill, Globe, Menu, X, Star } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useFavourites } from '@/context/FavouritesContext';
import { cn } from '@/utils/cn';

interface HeaderProps {
  currentLang?: 'fr' | 'ar';
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, onToggleLang }) => {
  const i18n = useI18n();
  const { path, navigate } = useRouter();
  const { favouritesCount } = useFavourites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lang = currentLang ?? i18n.language;
  const isAr = lang === 'ar';
  const handleToggleLang = onToggleLang ?? i18n.toggleLanguage;

  const handleNav = (targetPath: string) => {
    navigate(targetPath);
    setMobileMenuOpen(false);
  };

  const isHome = path === '/';
  const isSearch = path.startsWith('/recherche') || path.startsWith('/medicament');
  const isFavs = path === '/favoris';

  return (
    <header className="w-full bg-surface-container-lowest border-b border-outline-variant/40 sticky top-0 z-40 shadow-xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:bg-primary-container transition-colors">
            <Pill className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-on-surface group-hover:text-primary transition-colors">
                PharmaSearch
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-container text-primary border border-outline-variant/30">
                DZ
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-normal leading-tight hidden sm:block">
              {isAr ? 'السجل الوطني للمنتجات الصيدلانية' : 'Nomenclature Nationale des Produits Pharmaceutiques'}
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          <nav
            aria-label={isAr ? 'التنقل الرئيسي' : 'Navigation principale'}
            className="hidden md:flex items-center gap-5 text-xs font-semibold text-on-surface-variant"
          >
            <button
              type="button"
              onClick={() => handleNav('/')}
              className={cn(
                'py-1.5 px-2 rounded-md transition-colors',
                isHome
                  ? 'text-primary font-bold bg-surface-container'
                  : 'hover:text-primary hover:bg-surface-container-low'
              )}
            >
              {isAr ? 'الرئيسية' : 'Accueil'}
            </button>

            <button
              type="button"
              onClick={() => handleNav('/recherche')}
              className={cn(
                'py-1.5 px-2 rounded-md transition-colors',
                isSearch
                  ? 'text-primary font-bold bg-surface-container'
                  : 'hover:text-primary hover:bg-surface-container-low'
              )}
            >
              {isAr ? 'السجل والبحث' : 'Registre & Recherche'}
            </button>

            <button
              type="button"
              onClick={() => handleNav('/favoris')}
              className={cn(
                'inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-md transition-colors',
                isFavs
                  ? 'text-primary font-bold bg-surface-container'
                  : 'hover:text-primary hover:bg-surface-container-low'
              )}
            >
              <Star
                className={cn('w-3.5 h-3.5', favouritesCount > 0 ? 'text-amber-500 fill-amber-500' : '')}
                aria-hidden="true"
              />
              <span>{isAr ? 'المفضلة' : 'Favoris'}</span>
              {favouritesCount > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-on-primary text-[10px] font-bold">
                  {favouritesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={handleToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors text-xs font-semibold text-on-surface cursor-pointer shadow-xs"
            aria-label={isAr ? 'Changer de langue vers le français' : 'تغيير اللغة إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>{isAr ? 'Français' : 'العربية'}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-3 space-y-2 shadow-lg">
          <button
            type="button"
            onClick={() => handleNav('/')}
            className={cn(
              'w-full text-start py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              isHome ? 'bg-surface-container text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'
            )}
          >
            {isAr ? 'الرئيسية' : 'Accueil'}
          </button>

          <button
            type="button"
            onClick={() => handleNav('/recherche')}
            className={cn(
              'w-full text-start py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              isSearch ? 'bg-surface-container text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'
            )}
          >
            {isAr ? 'السجل والبحث' : 'Registre & Recherche'}
          </button>

          <button
            type="button"
            onClick={() => handleNav('/favoris')}
            className={cn(
              'w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              isFavs ? 'bg-surface-container text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'
            )}
          >
            <div className="flex items-center gap-2">
              <Star
                className={cn('w-4 h-4', favouritesCount > 0 ? 'text-amber-500 fill-amber-500' : '')}
                aria-hidden="true"
              />
              <span>{isAr ? 'المفضلة' : 'Favoris'}</span>
            </div>
            {favouritesCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-on-primary text-xs font-bold">
                {favouritesCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
