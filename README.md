# Macht-Es-Euch-Schön – Wohnungsplaner

Repository: https://github.com/MNLBCK/macht-es-euch-schoen

Cloudbasierte, responsive Web-App zur gemeinsamen Planung und Priorisierung von Arbeiten in einer Wohnung. Dieser Stand setzt bewusst nur den ersten Schritt um: Datenmodell, Sicherheitsrichtlinien und ein klickbares App-Grundgerüst mit Beispieldaten.

## MVP-Startumfang dieses Commits

- Next.js App Router mit TypeScript, React und Tailwind CSS.
- Responsive Shell: Desktop/iPad-Seitenleiste und iPhone-Bottom-Navigation.
- Klickbares Dashboard mit Beispielwohnung, Räumen, Aufgaben, Quick-Win-Hinweisen, Prioritäts-Spider-Chart und Einkaufsliste.
- Fachlogik für Prioritätswert, Begründung, Aufwandsklassen und Quick-Win-Erkennung.
- Progressive-Web-App-Manifest und einfacher Service Worker für Offline-Shell-Caching.
- Supabase SQL-Migration mit Tabellen, Enums, RLS-Policies, automatischer Owner-Mitgliedschaft und Schutz gegen zyklische Aufgabenabhängigkeiten.
- Vitest-Unit-Tests für Prioritäts- und Quick-Win-Logik sowie ein Playwright-Smoke-Test.

## Lokaler Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Danach ist die App unter `http://localhost:3000` erreichbar. Für echte Supabase-Integration müssen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` gesetzt werden. Geheimnisse dürfen nicht committed werden.

## Datenbank

Die initiale Migration liegt unter `supabase/migrations/202607150001_initial_schema.sql` und enthält:

- Haushalte, Mitglieder, Räume, Aufgaben, Abhängigkeiten, Einkaufsposten, Notizen, Anhänge, Messwerte und Activity Log.
- Row Level Security für alle haushaltsbezogenen Tabellen.
- Rollen `owner` und `member`.
- Generierten Prioritätswert in PostgreSQL.
- Trigger gegen zyklische Aufgabenabhängigkeiten.
- Trigger, der den Ersteller eines Haushalts direkt als `owner` in `household_members` einträgt.
- Soft-Delete-Feld für Haushalte.

## Beispielwohnung im Entwicklungsmodus

Die Oberfläche nutzt lokale Beispieldaten für:

- Wohnzimmer: Gardinenstange neu befestigen, Kabel hinter dem Fernseher ordnen, Wand über dem Sofa streichen.
- Küche: Silikonfuge an der Arbeitsplatte erneuern, Schubladenauszug prüfen, Beleuchtung unter den Hängeschränken ergänzen.
- Badezimmer: Duschkopf entkalken, beschädigte Fuge untersuchen, zusätzlichen Handtuchhalter montieren.
- Flur: Schuhablage planen, Wand ausbessern, bessere Deckenleuchte auswählen.

## Tests

```bash
npm run test
npm run build
npm run test:e2e
```

## Offene Punkte für die nächsten Schritte

1. Supabase Auth-Flows, Einladungen und serverseitige Datenzugriffe anbinden.
2. CRUD für Räume, Aufgaben, Einkaufslisten, Fotos, Messwerte und Notizen implementieren.
3. Realtime-Synchronisation und Konflikthinweise ergänzen.
4. Clientseitige Bildverkleinerung und private Storage-Signed-URLs einbauen.
5. Offline-Queue für neue Aufgaben persistieren und nach Verbindung synchronisieren.
6. CSV-/JSON-Export und JSON-Import produktiv umsetzen.
7. Drag-and-drop Kanban, Prioritätsmatrix und Budgetauswertungen ausbauen.
