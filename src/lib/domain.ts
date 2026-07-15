export const taskStatuses = ['Idee','Zu prüfen','Geplant','Einkauf notwendig','Zur Umsetzung bereit','In Arbeit','Wartet','Erledigt','Verworfen'] as const;
export const taskCategories = ['Reparatur','Renovierung','Einrichtung','Organisation','Reinigung','Beleuchtung','Elektrik','Sanitär','Möbel','Dekoration','Sicherheit','Energie','Sonstiges'] as const;
export const effortClasses = ['unter 15 Minuten','15–30 Minuten','30–60 Minuten','1–2 Stunden','halber Tag','ganzer Tag','mehrere Tage','noch unbekannt'] as const;
export const difficulties = ['sehr einfach','einfach','mittel','anspruchsvoll','Fachbetrieb erforderlich'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskCategory = (typeof taskCategories)[number];
export type EffortClass = (typeof effortClasses)[number];
export type Difficulty = (typeof difficulties)[number];

export type PriorityInput = {
  urgency: number;
  benefit: number;
  delayRisk: number;
  disturbanceFrequency: number;
  dependencyImpact: number;
};

const weights = { urgency: 0.3, benefit: 0.2, delayRisk: 0.25, disturbanceFrequency: 0.15, dependencyImpact: 0.1 } satisfies Record<keyof PriorityInput, number>;

export function normalizeRating(value: number) {
  const clamped = Math.min(5, Math.max(1, value));
  return ((clamped - 1) / 4) * 100;
}

export function calculatePriority(input: PriorityInput) {
  return Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + normalizeRating(input[key as keyof PriorityInput]) * weight, 0));
}

export function priorityExplanation(input: PriorityInput) {
  const reasons = [
    input.urgency >= 4 && 'Dringlichkeit',
    input.delayRisk >= 4 && 'möglicher Folgeschäden',
    input.benefit >= 4 && 'großen Nutzens',
    input.disturbanceFrequency >= 4 && 'häufiger Beeinträchtigung',
    input.dependencyImpact >= 4 && 'blockierter Folgearbeiten',
  ].filter(Boolean);
  return reasons.length ? `Hohe Priorität wegen ${reasons.join(' und ')}.` : 'Ausgewogene Priorität ohne dominierenden Risikofaktor.';
}

export function effortToHours(effort: EffortClass) {
  return ({'unter 15 Minuten':0.25,'15–30 Minuten':0.5,'30–60 Minuten':1,'1–2 Stunden':2,'halber Tag':4,'ganzer Tag':8,'mehrere Tage':24,'noch unbekannt':Infinity} as const)[effort];
}

export function isQuickWin(task: PriorityInput & { effortClass: EffortClass; difficulty: Difficulty; hasOpenDependencies?: boolean }) {
  return calculatePriority(task) >= 60 && effortToHours(task.effortClass) <= 2 && task.difficulty !== 'Fachbetrieb erforderlich' && !task.hasOpenDependencies;
}
