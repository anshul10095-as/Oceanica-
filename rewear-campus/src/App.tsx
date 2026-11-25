import { lazy, Suspense, useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { StoreProvider } from './store/store';
import { ToastProvider, Skeleton } from './components/ui';
import { Header, BottomNav, Footer } from './components/Layout';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import { BagPage, CheckoutPage, ConfirmationPage } from './pages/Bag';
import PassPage from './pages/Pass';
import { PopupsPage, PopupDetail } from './pages/Popups';
import Wardrobe, { WishlistPage } from './pages/Wardrobe';
import FindMyFit from './pages/FindMyFit';
import Sustainability from './pages/Sustainability';
import Story from './pages/Story';
import { FeedbackPage, ProfilePage, DemoPage, PolicyPage, HelpPage, CreditsPage } from './pages/Misc';

// The admin portal (and its charting library) loads on demand in the deployed build.
const AdminShell = lazy(() => import('./pages/admin/AdminShell'));

function Page() {
  const { route } = useRouter();
  switch (route.page) {
    case 'explore': case 'formal': case 'ethnic': case 'occasion': case 'style': case 'search': return <Catalogue />;
    case 'product': return <ProductDetail />;
    case 'bag': return <BagPage />;
    case 'checkout': return <CheckoutPage />;
    case 'confirmation': return <ConfirmationPage />;
    case 'pass': return <PassPage />;
    case 'popups': return <PopupsPage />;
    case 'popup': return <PopupDetail />;
    case 'wardrobe': return <Wardrobe />;
    case 'wishlist': return <WishlistPage />;
    case 'fit': return <FindMyFit />;
    case 'sustainability': return <Sustainability />;
    case 'story': return <Story />;
    case 'feedback': return <FeedbackPage />;
    case 'profile': return <ProfilePage />;
    case 'demo': return <DemoPage />;
    case 'policy': return <PolicyPage />;
    case 'help': return <HelpPage />;
    case 'credits': return <CreditsPage />;
    default: return <Home />;
  }
}

function Shell() {
  const { route } = useRouter();
  useEffect(() => {
    const titles: Record<string, string> = { home: 'ReWear Campus · Rent. Wear. Return. Repeat.', pass: 'ReWear Pass · ReWear Campus', popups: 'Campus Pop-Ups · ReWear Campus', admin: 'Demo Admin · ReWear Campus' };
    document.title = titles[route.page] ?? 'ReWear Campus';
  }, [route.page]);
  if (route.page === 'admin') {
    return <Suspense fallback={<div className="p-10 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-40" /></div>}><AdminShell /></Suspense>;
  }
  return (
    <>
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-surface focus:px-4 focus:py-2 focus:rounded-lg">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none min-h-[60vh] pb-[calc(72px+env(safe-area-inset-bottom,0px))] lg:pb-0" key={route.page + route.arg}>
        <Page />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <StoreProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </StoreProvider>
    </RouterProvider>
  );
}
