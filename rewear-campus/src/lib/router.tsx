import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

// Hash routes use plain `#name` or `#name-arg` (letters, digits, hyphens) so links survive
// sandboxed previews as well as static hosting without server rewrites.
export interface Route { page: string; arg: string }

const PAGES = ['home', 'explore', 'formal', 'ethnic', 'occasion', 'style', 'product', 'fit', 'pass', 'popups', 'popup', 'bag', 'checkout', 'confirmation', 'wardrobe', 'wishlist', 'profile', 'sustainability', 'story', 'feedback', 'policy', 'help', 'admin', 'search', 'demo', 'credits'];

export function parse(hash: string): Route {
  const h = decodeURIComponent(hash.replace(/^#/, '')).trim();
  if (!h) return { page: 'home', arg: '' };
  const page = PAGES.find((p) => h === p || h.startsWith(p + '-'));
  if (!page) return { page: 'home', arg: '' };
  return { page, arg: h.slice(page.length + 1) };
}

interface RouterCtx { route: Route; go: (to: string) => void; back: () => void }
const Ctx = createContext<RouterCtx>({ route: { page: 'home', arg: '' }, go: () => {}, back: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parse(typeof location === 'undefined' ? '' : location.hash));
  useEffect(() => {
    const on = () => { setRoute(parse(location.hash)); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((to: string) => {
    const target = '#' + to.replace(/^#/, '');
    if (location.hash === target) { setRoute(parse(target)); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    location.hash = target;
  }, []);
  const back = useCallback(() => { if (history.length > 1) history.back(); else go('home'); }, [go]);
  return <Ctx.Provider value={{ route, go, back }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function Link({ to, className, children, onClick, ...rest }: { to: string; className?: string; children: ReactNode; onClick?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return <a href={'#' + to} className={className} onClick={onClick} {...rest}>{children}</a>;
}
