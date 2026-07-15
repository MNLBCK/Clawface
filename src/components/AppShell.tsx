import { ClipboardList, Home, LayoutDashboard, ShoppingBasket, Sparkles } from 'lucide-react';
const nav = [{ label:'Dashboard', icon:LayoutDashboard },{ label:'Räume', icon:Home },{ label:'Aufgaben', icon:ClipboardList },{ label:'Einkauf', icon:ShoppingBasket },{ label:'Abendrunde', icon:Sparkles }];
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen pb-24 md:pb-0 md:grid md:grid-cols-[17rem_1fr]">
    <aside className="hidden md:flex md:flex-col gap-4 border-r border-stone-200 bg-sand/70 p-6">
      <div><p className="text-sm uppercase tracking-[0.2em] text-clay">Wohnungsplaner</p><h1 className="text-2xl font-semibold">Macht-Es-Euch-Schön</h1></div>
      <nav className="grid gap-2">{nav.map(({label, icon:Icon}) => <a key={label} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-white" href={`#${label.toLowerCase()}`}><Icon size={20}/>{label}</a>)}</nav>
      <p className="mt-auto rounded-2xl bg-white/70 p-4 text-sm text-stone-600">Sync: bereit · Offline-Entwürfe werden lokal vorgemerkt.</p>
    </aside>
    <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-stone-200 bg-white/95 md:hidden">{nav.map(({label, icon:Icon}) => <a key={label} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs" href={`#${label.toLowerCase()}`}><Icon size={20}/>{label}</a>)}</nav>
  </div>;
}
