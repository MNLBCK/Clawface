import { calculatePriority, isQuickWin, priorityExplanation, type Difficulty, type EffortClass, type TaskCategory, type TaskStatus } from './domain';

export type Room = { id: string; name: string; type: string; notes: string; displayOrder: number };
export type Task = { id: string; roomId: string; title: string; status: TaskStatus; category: TaskCategory; urgency: number; benefit: number; delayRisk: number; disturbanceFrequency: number; dependencyImpact: number; manualImportance?: number; effortClass: EffortClass; difficulty: Difficulty; estimatedCostLikely?: number; actualCost?: number };
export type ShoppingItem = { id: string; taskId?: string; name: string; quantity: number; unit: string; vendor: string; status: 'benötigt'|'recherchieren'|'ausgewählt'|'bestellt'|'gekauft'|'nicht mehr benötigt'; materialType: 'Werkzeug'|'Verbrauchsmaterial'; estimatedUnitPrice: number };

export const rooms: Room[] = [
  { id:'living', name:'Wohnzimmer', type:'Wohnen', notes:'Gemütlicher Fokusraum mit Medienwand.', displayOrder:1 },
  { id:'kitchen', name:'Küche', type:'Küche', notes:'Arbeitsflächen, Licht und Fugen prüfen.', displayOrder:2 },
  { id:'bath', name:'Badezimmer', type:'Bad', notes:'Feuchte Stellen und Komfort priorisieren.', displayOrder:3 },
  { id:'hall', name:'Flur', type:'Durchgang', notes:'Stauraum und freundlicher Empfang.', displayOrder:4 },
];

export const tasks: Task[] = [
  ['t1','living','Gardinenstange neu befestigen','Idee','Reparatur',4,4,3,4,2,4,'30–60 Minuten','einfach',25],
  ['t2','living','Kabel hinter dem Fernseher ordnen','Geplant','Organisation',3,4,1,5,1,3,'1–2 Stunden','sehr einfach',18],
  ['t3','living','Wand über dem Sofa streichen','Zu prüfen','Renovierung',2,5,1,3,2,undefined,'halber Tag','mittel',90],
  ['t4','kitchen','Silikonfuge an der Arbeitsplatte erneuern','Einkauf notwendig','Sanitär',5,4,5,4,3,5,'1–2 Stunden','mittel',35],
  ['t5','kitchen','Schubladenauszug prüfen','Idee','Reparatur',3,3,3,3,2,undefined,'30–60 Minuten','einfach',20],
  ['t6','kitchen','Beleuchtung unter den Hängeschränken ergänzen','Geplant','Beleuchtung',3,5,2,4,2,4,'halber Tag','anspruchsvoll',120],
  ['t7','bath','Duschkopf entkalken','Zur Umsetzung bereit','Reinigung',4,3,2,4,1,undefined,'unter 15 Minuten','sehr einfach',3],
  ['t8','bath','beschädigte Fuge untersuchen','Zu prüfen','Sanitär',5,3,5,3,4,5,'30–60 Minuten','mittel',15],
  ['t9','bath','zusätzlichen Handtuchhalter montieren','Idee','Einrichtung',2,3,1,3,1,undefined,'30–60 Minuten','einfach',22],
  ['t10','hall','Schuhablage planen','Idee','Möbel',2,4,1,4,2,undefined,'1–2 Stunden','einfach',60],
  ['t11','hall','Wand ausbessern','Wartet','Renovierung',3,3,2,3,2,undefined,'1–2 Stunden','mittel',15],
  ['t12','hall','bessere Deckenleuchte auswählen','Einkauf notwendig','Beleuchtung',3,4,2,4,1,4,'30–60 Minuten','einfach',75],
].map(([id, roomId, title, status, category, urgency, benefit, delayRisk, disturbanceFrequency, dependencyImpact, manualImportance, effortClass, difficulty, estimatedCostLikely]) => ({ id, roomId, title, status, category, urgency, benefit, delayRisk, disturbanceFrequency, dependencyImpact, manualImportance, effortClass, difficulty, estimatedCostLikely })) as Task[];

export const shoppingItems: ShoppingItem[] = [
  { id:'s1', taskId:'t4', name:'Sanitär-Silikon weiß', quantity:1, unit:'Kartusche', vendor:'Baumarkt', status:'benötigt', materialType:'Verbrauchsmaterial', estimatedUnitPrice:9 },
  { id:'s2', taskId:'t1', name:'Dübel und Schrauben', quantity:1, unit:'Set', vendor:'Baumarkt', status:'ausgewählt', materialType:'Verbrauchsmaterial', estimatedUnitPrice:8 },
  { id:'s3', taskId:'t12', name:'Deckenleuchte warmweiß', quantity:1, unit:'Stück', vendor:'Online', status:'recherchieren', materialType:'Werkzeug', estimatedUnitPrice:75 },
];

export const enrichedTasks = tasks.map((task) => ({ ...task, priority: calculatePriority(task), explanation: priorityExplanation(task), quickWin: isQuickWin(task) }));
