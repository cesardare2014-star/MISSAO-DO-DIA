export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekDay(): number {
  return new Date().getDay();
}

export function getWeekDays(): string[] {
  return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
}

export function getWeekDaysFull(): string[] {
  return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
}

export function isWeekend(): boolean {
  const d = new Date().getDay();
  return d === 0 || d === 6;
}

export function isWeekday(): boolean {
  const d = new Date().getDay();
  return d >= 1 && d <= 5;
}

export function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getChestColor(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'from-amber-600 to-orange-700';
    case 'silver': return 'from-slate-300 to-gray-500';
    case 'gold': return 'from-yellow-400 to-amber-500';
    case 'diamond': return 'from-cyan-300 via-blue-400 to-purple-500';
  }
}

export function getChestBg(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'from-amber-900/40 to-orange-950/60';
    case 'silver': return 'from-slate-800/40 to-gray-950/60';
    case 'gold': return 'from-yellow-900/40 to-amber-950/60';
    case 'diamond': return 'from-cyan-900/40 via-blue-950/40 to-purple-950/60';
  }
}

export function getChestGlow(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'shadow-[0_0_25px_rgba(217,119,6,0.3)]';
    case 'silver': return 'shadow-[0_0_25px_rgba(148,163,184,0.3)]';
    case 'gold': return 'shadow-[0_0_30px_rgba(234,179,8,0.4)]';
    case 'diamond': return 'shadow-[0_0_35px_rgba(59,130,246,0.4)]';
  }
}

export function getChestText(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'text-amber-400';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-yellow-300';
    case 'diamond': return 'text-cyan-300';
  }
}

export function getChestBorder(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'border-amber-500/40';
    case 'silver': return 'border-slate-400/40';
    case 'gold': return 'border-yellow-400/50';
    case 'diamond': return 'border-cyan-400/50';
  }
}

export function getChestLabel(rarity: 'bronze' | 'silver' | 'gold' | 'diamond'): string {
  switch (rarity) {
    case 'bronze': return 'Bronze';
    case 'silver': return 'Prata';
    case 'gold': return 'Ouro';
    case 'diamond': return 'Diamante';
  }
}

export function getRarityColor(rarity: 'common' | 'rare' | 'epic'): string {
  switch (rarity) {
    case 'common': return 'from-green-500 to-emerald-600';
    case 'rare': return 'from-blue-500 to-indigo-600';
    case 'epic': return 'from-purple-500 to-pink-600';
  }
}

export function getRarityBorder(rarity: 'common' | 'rare' | 'epic'): string {
  switch (rarity) {
    case 'common': return 'border-green-500/40';
    case 'rare': return 'border-blue-500/40';
    case 'epic': return 'border-purple-500/40';
  }
}

export function getRarityLabel(rarity: 'common' | 'rare' | 'epic'): string {
  switch (rarity) {
    case 'common': return 'Comum';
    case 'rare': return 'Raro';
    case 'epic': return 'Épico';
  }
}

export function getAvatarEmoji(avatarId: string, avatars: { id: string; emoji: string }[]): string {
  return avatars.find(a => a.id === avatarId)?.emoji || '🦁';
}

export function getAccessoryEmoji(accessoryId: string, accessories: { id: string; emoji: string }[]): string {
  return accessories.find(a => a.id === accessoryId)?.emoji || '';
}

export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
