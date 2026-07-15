import { AppShell } from '@/components/AppShell';
import { PriorityRadar } from '@/components/PriorityRadar';
import { enrichedTasks, rooms, shoppingItems } from '@/lib/sample-data';

const openTasks = enrichedTasks.filter((task) => !['Erledigt','Verworfen'].includes(task.status));
const quickWins = enrichedTasks.filter((task) => task.quickWin);
const totalEstimate = enrichedTasks.reduce((sum, task) => sum + (task.estimatedCostLikely ?? 0), 0);

export default function HomePage() {
  return <AppShell>
    <section className="grid gap-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-clay to-moss p-6 text-white md:p-8">
        <p className="text-sm uppercase tracking-[0.25em] opacity-80">Klickbares MVP-Grundgerüst</p>
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto]"><div><h2 className="text-3xl font-semibold md:text-5xl">Beispielwohnung gemeinsam planen.</h2><p className="mt-3 max-w-2xl text-white/85">Dashboard, Räume, Aufgaben, Priorität, Einkauf und Abendrunde sind als responsive Startoberfläche angelegt. Supabase-Schema und RLS liegen als Migration bereit.</p></div><button className="rounded-2xl bg-white px-6 py-4 font-semibold text-clay">+ Aufgabe in 30 Sek.</button></div>
      </div>
      <div id="dashboard" className="grid gap-4 md:grid-cols-4"><Metric label="Offene Aufgaben" value={openTasks.length}/><Metric label="Quick Wins" value={quickWins.length}/><Metric label="Schätzung gesamt" value={`${totalEstimate} €`}/><Metric label="Ohne Kostenschätzung" value={enrichedTasks.filter((task)=>!task.estimatedCostLikely).length}/></div>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div id="aufgaben" className="card"><div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">Dringendste Aufgaben</h3><select className="rounded-xl border px-3"><option>Priorität</option><option>Raum</option><option>Status</option></select></div><div className="mt-4 grid gap-3">{enrichedTasks.sort((a,b)=>b.priority-a.priority).slice(0,6).map((task)=><article key={task.id} className="grid gap-3 rounded-2xl bg-stone-50 p-4 sm:grid-cols-[1fr_auto]"><div><p className="font-semibold">{task.title}</p><p className="text-sm text-stone-600">{rooms.find((room)=>room.id===task.roomId)?.name} · {task.status} · {task.category}</p><p className="mt-2 text-sm">{task.explanation}</p></div><div className="flex items-center gap-3"><PriorityRadar input={task}/><div><p className="text-2xl font-bold text-clay">{task.priority}</p><p className="text-xs">manuell {task.manualImportance ?? '—'}</p></div></div></article>)}</div></div>
        <div id="abendrunde" className="card"><h3 className="text-xl font-semibold">Begehung / Abendrunde</h3><p className="mt-2 text-stone-600">Reduzierter Ablauf: Raum wählen, bestehende Ideen prüfen, Titel und Kategorie erfassen, optional Foto und Einkauf ergänzen.</p><form className="mt-4 grid gap-3"><select className="rounded-2xl border p-3">{rooms.map((room)=><option key={room.id}>{room.name}</option>)}</select><input className="rounded-2xl border p-3" placeholder="Neue Aufgabe, z. B. lockere Leiste befestigen"/><button className="rounded-2xl bg-clay px-5 py-3 font-semibold text-white">Als Idee speichern</button></form><p className="mt-3 text-sm text-stone-500">Offline-Entwurf: wird im Service Worker Cache vorbereitet und später synchronisiert.</p></div>
      </section>
      <section id="räume" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{rooms.map((room)=><article key={room.id} className="card"><p className="text-sm text-moss">{room.type}</p><h3 className="text-xl font-semibold">{room.name}</h3><p className="mt-2 text-sm text-stone-600">{room.notes}</p><p className="mt-4 font-semibold">{enrichedTasks.filter((task)=>task.roomId===room.id).length} Aufgaben · {enrichedTasks.filter((task)=>task.roomId===room.id).reduce((sum, task)=>sum+(task.estimatedCostLikely??0),0)} €</p></article>)}</section>
      <section id="einkauf" className="card"><h3 className="text-xl font-semibold">Einkaufsliste nach Anbieter</h3><div className="mt-4 grid gap-3 md:grid-cols-3">{shoppingItems.map((item)=><label key={item.id} className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4"><input type="checkbox" className="mt-1 h-5 w-5"/><span><strong>{item.name}</strong><br/><span className="text-sm text-stone-600">{item.quantity} {item.unit} · {item.vendor} · {item.materialType} · {item.estimatedUnitPrice} €</span></span></label>)}</div></section>
    </section>
  </AppShell>;
}
function Metric({ label, value }: { label: string; value: string | number }) { return <div className="card"><p className="text-sm text-stone-500">{label}</p><p className="mt-2 text-3xl font-bold text-clay">{value}</p></div>; }
