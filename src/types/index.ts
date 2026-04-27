export interface Child {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  weeklyProgress: boolean[];
  accessories: string[];
  age: number;
  chestsOpenedToday: number;
  lastChestDate: string;
  totalTasksCompleted: number;
  streakChestClaimed: Record<string, boolean>;
  missionChestClaimed: boolean;
  unlockedChests: string[];
  weekPoints: number;
  weekStart: string;
}

export interface Task {
  id: string;
  icon: string;
  name: string;
  points: number;
  assignedTo: string[];
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  childId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Chest {
  id: string;
  name: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
  cost: number;
  rewards: string[];
  icon: string;
}

export interface FamilyChest {
  id: string;
  name: string;
  cost: number;
  currentPoints: number;
  rewards: string[];
  icon: string;
}

export interface AppState {
  pin: string;
  children: Child[];
  tasks: Task[];
  completions: TaskCompletion[];
  chests: Chest[];
  familyChest: FamilyChest | null;
  isPremium: boolean;
  theme: 'dark' | 'light';
}

export const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Leão' },
  { id: 'bear', emoji: '🐻', name: 'Urso' },
  { id: 'fox', emoji: '🦊', name: 'Raposa' },
  { id: 'rabbit', emoji: '🐰', name: 'Coelho' },
  { id: 'owl', emoji: '🦉', name: 'Coruja' },
  { id: 'cat', emoji: '🐱', name: 'Gato' },
  { id: 'dog', emoji: '🐶', name: 'Cachorro' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicórnio' },
  { id: 'dino', emoji: '🦕', name: 'Dinossauro' },
];

export const TASK_ICONS = [
  '🪥', '🛏️', '📚', '🧹', '🍽️', '👕', '🧸', '✏️', '🎵', '🏃',
  '💧', '🍎', '🎒', '🦷', '🌙', '🏠', '🌱', '🧴', '📝', '🎯',
];

export const TASK_TEMPLATES: Record<string, { icon: string; name: string; points: number }[]> = {
  '3-5': [
    { icon: '🧸', name: 'Guardar brinquedos', points: 5 },
    { icon: '🪥', name: 'Escovar os dentes', points: 5 },
    { icon: '👕', name: 'Guardar as roupas', points: 5 },
    { icon: '🍽️', name: 'Lavar as mãos', points: 3 },
    { icon: '🛏️', name: 'Arrumar a cama', points: 5 },
    { icon: '🍎', name: 'Comer fruta', points: 5 },
  ],
  '6-8': [
    { icon: '🪥', name: 'Escovar os dentes', points: 5 },
    { icon: '🛏️', name: 'Arrumar a cama', points: 8 },
    { icon: '📚', name: 'Ler por 20 minutos', points: 10 },
    { icon: '🧹', name: 'Varrer o quarto', points: 10 },
    { icon: '🎒', name: 'Preparar mochila', points: 8 },
    { icon: '🧸', name: 'Organizar brinquedos', points: 8 },
  ],
  '9-12': [
    { icon: '🛏️', name: 'Arrumar a cama', points: 10 },
    { icon: '📚', name: 'Estudar 30 minutos', points: 15 },
    { icon: '🧹', name: 'Limpar o quarto', points: 15 },
    { icon: '🍽️', name: 'Ajudar na cozinha', points: 12 },
    { icon: '👕', name: 'Lavar louça', points: 12 },
    { icon: '🎵', name: 'Praticar instrumento', points: 15 },
    { icon: '📝', name: 'Estudar inglês', points: 15 },
  ],
};

export const PREDEFINED_TASKS = [
  { icon: '🛏️', name: 'Arrumar a cama', points: 10 },
  { icon: '🪥', name: 'Escovar os dentes', points: 5 },
  { icon: '📝', name: 'Fazer tema', points: 15 },
  { icon: '🧸', name: 'Guardar brinquedos', points: 10 },
  { icon: '🍽️', name: 'Ajudar na mesa', points: 10 },
  { icon: '📚', name: 'Ler 15 min', points: 15 },
  { icon: '🚿', name: 'Tomar banho sem reclamar', points: 10 },
  { icon: '🎒', name: 'Organizar mochila', points: 10 },
  { icon: '🤝', name: 'Ajudar alguém', points: 15 },
  { icon: '🌙', name: 'Dormir no horário', points: 20 },
];

export const ACCESSORIES = [
  { id: 'hat', name: 'Chapéu', emoji: '🎩', cost: 30 },
  { id: 'glasses', name: 'Óculos', emoji: '🕶️', cost: 25 },
  { id: 'crown', name: 'Coroa', emoji: '👑', cost: 50 },
  { id: 'bow', name: 'Laço', emoji: '🎀', cost: 20 },
  { id: 'star', name: 'Estrela', emoji: '⭐', cost: 15 },
  { id: 'flower', name: 'Flor', emoji: '🌸', cost: 20 },
];

export const STREAK_REWARDS = [
  { days: 3, rarity: 'bronze' as const, label: '3 dias seguidos' },
  { days: 5, rarity: 'silver' as const, label: '5 dias seguidos' },
  { days: 7, rarity: 'gold' as const, label: '7 dias seguidos' },
];

export const MISSION_MILESTONE = 5;

export const MAX_CHESTS_PER_DAY = 3;

export const SURPRISE_CHANCE = 0.10;

export const WEEKEND_BONUS_MULTIPLIER = 2;

export const DEFAULT_CHESTS: Chest[] = [
  {
    id: 'chest-bronze',
    name: 'Baú Bronze',
    rarity: 'bronze',
    cost: 50,
    rewards: ['Escolher a sobremesa', '15 min a mais de tela', 'Escolher o suco', 'Pipoca na hora', 'Escolher o lanche'],
    icon: '🥉',
  },
  {
    id: 'chest-silver',
    name: 'Baú Prata',
    rarity: 'silver',
    cost: 120,
    rewards: ['Tomar sorvete', 'Escolher a janta', 'Filme à escolha', 'Parque', 'Hora do jogo'],
    icon: '🥈',
  },
  {
    id: 'chest-gold',
    name: 'Baú Ouro',
    rarity: 'gold',
    cost: 200,
    rewards: ['Dia de pizza', 'Ida ao cinema', 'Brinquedo novo', 'Passeio especial'],
    icon: '🥇',
  },
  {
    id: 'chest-diamond',
    name: 'Baú Diamante',
    rarity: 'diamond',
    cost: 350,
    rewards: ['Dia sem escola', 'Festa surpresa', 'Viagem em família', 'Super brinquedo', 'Aventura especial'],
    icon: '💎',
  },
];
