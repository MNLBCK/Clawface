import type { PriorityInput } from '@/lib/domain';
const axes: [keyof PriorityInput, string][] = [['urgency','Dringlichkeit'],['benefit','Nutzen'],['delayRisk','Risiko'],['disturbanceFrequency','Häufigkeit'],['dependencyImpact','Abhängigkeit']];
export function PriorityRadar({ input }: { input: PriorityInput }) {
  const points = axes.map(([key], index) => { const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length; const radius = 16 + input[key] * 7; return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`; }).join(' ');
  return <svg viewBox="0 0 100 100" role="img" aria-label="Spider Chart der Priorität" className="h-28 w-28"><polygon points="50,10 88,38 74,84 26,84 12,38" fill="none" stroke="#ded2c2"/><polygon points={points} fill="#b86f5240" stroke="#b86f52" strokeWidth="2"/><circle cx="50" cy="50" r="2" fill="#6d7b59"/></svg>;
}
