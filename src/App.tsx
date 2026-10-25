import React from 'react';
import { RouterProvider, useRouter } from '@/router/RouterContext';
import { I18nProvider } from '@/context/I18nContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { DataProvider } from '@/context/DataContext';

import { Header } from '@/components/layout/Header';
import { RegulatoryBanner } from '@/components/layout/RegulatoryBanner';
import { Footer } from '@/components/layout/Footer';

import { HomePage } from '@/pages/HomePage';
import { SearchPage } from '@/pages/SearchPage';
import { DetailPage } from '@/pages/DetailPage';
import { FavouritesPage } from '@/pages/FavouritesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();

  // Route-aware document title management for non-detail pages
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    if (path === '/' || path === '') {
      document.title = 'PharmaSearch — Registre Pharmaceutique National';
    } else if (path.startsWith('/recherche')) {
      document.title = 'Recherche | PharmaSearch';
    } else if (path.startsWith('/favoris')) {
      document.title = 'Mes Favoris | PharmaSearch';
    } else if (!path.startsWith('/medicament')) {
      document.title = 'Produit ou page introuvable | PharmaSearch';
    }
  }, [path]);

  // Route matching
  let pageContent: React.ReactNode;
  if (path === '/' || path === '') {
    pageContent = <HomePage />;
  } else if (path.startsWith('/recherche')) {
    pageContent = <SearchPage />;
  } else if (path.startsWith('/medicament')) {
    pageContent = <DetailPage />;
  } else if (path.startsWith('/favoris')) {
    pageContent = <FavouritesPage />;
  } else {
    pageContent = <NotFoundPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface w-full">
      <RegulatoryBanner />
      <Header />
      <div className="flex-1 flex flex-col w-full">
        {pageContent}
      </div>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <RouterProvider>
      <I18nProvider>
        <FavouritesProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </FavouritesProvider>
      </I18nProvider>
    </RouterProvider>
  );
}

export default App;
