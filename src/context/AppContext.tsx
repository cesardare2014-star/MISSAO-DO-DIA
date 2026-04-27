import React, { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react';
import type { AppState, Child, Task, TaskCompletion, Chest, FamilyChest } from '../types';
import { DEFAULT_CHESTS } from '../types';
import { getToday, getWeekStart } from '../lib/utils';

function safeChild(c: any): Child {
  return {
    id: c.id || '',
    name: c.name || '',
    avatar: c.avatar || 'lion',
    points: typeof c.points === 'number' ? c.points : 0,
    streak: typeof c.streak === 'number' ? c.streak : 0,
    weeklyProgress: Array.isArray(c.weeklyProgress) && c.weeklyProgress.length === 7 ? c.weeklyProgress : [false, false, false, false, false, false, false],
    accessories: Array.isArray(c.accessories) ? c.accessories : [],
    age: typeof c.age === 'number' ? c.age : 6,
    chestsOpenedToday: typeof c.chestsOpenedToday === 'number' ? c.chestsOpenedToday : 0,
    lastChestDate: typeof c.lastChestDate === 'string' ? c.lastChestDate : '',
    totalTasksCompleted: typeof c.totalTasksCompleted === 'number' ? c.totalTasksCompleted : 0,
    streakChestClaimed: c.streakChestClaimed && typeof c.streakChestClaimed === 'object' ? c.streakChestClaimed : {},
    missionChestClaimed: typeof c.missionChestClaimed === 'boolean' ? c.missionChestClaimed : false,
    unlockedChests: Array.isArray(c.unlockedChests) ? c.unlockedChests : [],
    weekPoints: typeof c.weekPoints === 'number' ? c.weekPoints : 0,
    weekStart: typeof c.weekStart === 'string' ? c.weekStart : '',
  };
}

const initialState: AppState = {
  pin: '1234',
  children: [],
  tasks: [],
  completions: [],
  chests: DEFAULT_CHESTS,
  familyChest: {
    id: 'family-chest', name: 'Baú da Família', cost: 500,
    currentPoints: 0, rewards: ['Passeio ao parque de diversões', 'Dia de diversão em família', 'Viagem especial'], icon: '🏰',
  },
  isPremium: false,
  theme: 'dark',
};

type Action =
  | { type: 'SET_PIN'; payload: string }
  | { type: 'ADD_CHILD'; payload: Child }
  | { type: 'UPDATE_CHILD'; payload: Child }
  | { type: 'DELETE_CHILD'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_COMPLETION'; payload: TaskCompletion }
  | { type: 'APPROVE_COMPLETION'; payload: string }
  | { type: 'REJECT_COMPLETION'; payload: string }
  | { type: 'BATCH_APPROVE'; payload: string[] }
  | { type: 'DELETE_COMPLETION'; payload: string }
  | { type: 'ADD_CHEST'; payload: Chest }
  | { type: 'UPDATE_CHEST'; payload: Chest }
  | { type: 'DELETE_CHEST'; payload: string }
  | { type: 'UPDATE_FAMILY_CHEST'; payload: FamilyChest }
  | { type: 'BUY_ACCESSORY'; payload: { childId: string; accessoryId: string; cost: number } }
  | { type: 'OPEN_PROGRESSIVE_CHEST'; payload: { childId: string; chestId: string } }
  | { type: 'CONTRIBUTE_FAMILY_CHEST'; payload: { childId: string; amount: number } }
  | { type: 'CLAIM_STREAK_CHEST'; payload: { childId: string; streakKey: string } }
  | { type: 'CLAIM_MISSION_CHEST'; payload: { childId: string } }
  | { type: 'RESET_DAILY_CHESTS'; payload: { childId: string } }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_PREMIUM'; payload: boolean }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; payload: AppState };

function checkWeekReset(c: Child): Partial<Child> {
  const currentWeek = getWeekStart();
  if (c.weekStart !== currentWeek) {
    return { weekPoints: 0, weekStart: currentWeek, unlockedChests: [], streakChestClaimed: {}, missionChestClaimed: false };
  }
  return {};
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_PIN':
      return { ...state, pin: action.payload };
    case 'ADD_CHILD':
      return { ...state, children: [...state.children, safeChild(action.payload)] };
    case 'UPDATE_CHILD':
      return { ...state, children: state.children.map(c => c.id === action.payload.id ? safeChild(action.payload) : c) };
    case 'DELETE_CHILD':
      return {
        ...state,
        children: state.children.filter(c => c.id !== action.payload),
        tasks: state.tasks.map(t => ({ ...t, assignedTo: t.assignedTo.filter(id => id !== action.payload) })),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_COMPLETION':
      return { ...state, completions: [...state.completions, action.payload] };
    case 'APPROVE_COMPLETION': {
      const completion = state.completions.find(c => c.id === action.payload);
      if (!completion) return state;
      const task = state.tasks.find(t => t.id === completion.taskId);
      const points = task?.points || 0;
      const today = getToday();
      return {
        ...state,
        completions: state.completions.map(c => c.id === action.payload ? { ...c, status: 'approved' as const } : c),
        children: state.children.map(c => {
          if (c.id !== completion.childId) return c;
          const isNewDay = c.lastChestDate !== today;
          const weekReset = checkWeekReset(c);
          return {
            ...c,
            ...weekReset,
            points: (c.points || 0) + points,
            weekPoints: ((weekReset.weekPoints !== undefined ? 0 : c.weekPoints) || 0) + points,
            totalTasksCompleted: (c.totalTasksCompleted || 0) + 1,
            chestsOpenedToday: isNewDay ? 0 : (c.chestsOpenedToday || 0),
            lastChestDate: isNewDay ? today : c.lastChestDate,
          };
        }),
      };
    }
    case 'REJECT_COMPLETION':
      return { ...state, completions: state.completions.map(c => c.id === action.payload ? { ...c, status: 'rejected' as const } : c) };
    case 'BATCH_APPROVE': {
      const completionsToApprove = state.completions.filter(c => action.payload.includes(c.id));
      const pointsMap = new Map<string, number>();
      const countMap = new Map<string, number>();
      completionsToApprove.forEach(comp => {
        const task = state.tasks.find(t => t.id === comp.taskId);
        const pts = task?.points || 0;
        pointsMap.set(comp.childId, (pointsMap.get(comp.childId) || 0) + pts);
        countMap.set(comp.childId, (countMap.get(comp.childId) || 0) + 1);
      });
      const today = getToday();
      return {
        ...state,
        completions: state.completions.map(c => action.payload.includes(c.id) ? { ...c, status: 'approved' as const } : c),
        children: state.children.map(c => {
          const pts = pointsMap.get(c.id) || 0;
          const cnt = countMap.get(c.id) || 0;
          if (pts === 0 && cnt === 0) return c;
          const isNewDay = c.lastChestDate !== today;
          const weekReset = checkWeekReset(c);
          return {
            ...c,
            ...weekReset,
            points: (c.points || 0) + pts,
            weekPoints: ((weekReset.weekPoints !== undefined ? 0 : c.weekPoints) || 0) + pts,
            totalTasksCompleted: (c.totalTasksCompleted || 0) + cnt,
            chestsOpenedToday: isNewDay ? 0 : (c.chestsOpenedToday || 0),
            lastChestDate: isNewDay ? today : c.lastChestDate,
          };
        }),
      };
    }
    case 'DELETE_COMPLETION':
      return { ...state, completions: state.completions.filter(c => c.id !== action.payload) };
    case 'ADD_CHEST':
      return { ...state, chests: [...state.chests, action.payload] };
    case 'UPDATE_CHEST':
      return { ...state, chests: state.chests.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CHEST':
      return { ...state, chests: state.chests.filter(c => c.id !== action.payload) };
    case 'UPDATE_FAMILY_CHEST':
      return { ...state, familyChest: action.payload };
    case 'BUY_ACCESSORY':
      return { ...state, children: state.children.map(c => c.id === action.payload.childId ? { ...c, points: (c.points || 0) - action.payload.cost, accessories: [...c.accessories, action.payload.accessoryId] } : c) };
    case 'OPEN_PROGRESSIVE_CHEST': {
      const today = getToday();
      return {
        ...state,
        children: state.children.map(c => {
          if (c.id !== action.payload.childId) return c;
          const isNewDay = c.lastChestDate !== today;
          const currentOpened = isNewDay ? 0 : (c.chestsOpenedToday || 0);
          const alreadyUnlocked = (c.unlockedChests || []).includes(action.payload.chestId);
          return {
            ...c,
            chestsOpenedToday: currentOpened + 1,
            lastChestDate: isNewDay ? today : c.lastChestDate,
            unlockedChests: alreadyUnlocked ? c.unlockedChests : [...(c.unlockedChests || []), action.payload.chestId],
          };
        }),
      };
    }
    case 'CLAIM_STREAK_CHEST':
      return {
        ...state,
        children: state.children.map(c => {
          if (c.id !== action.payload.childId) return c;
          return { ...c, streakChestClaimed: { ...(c.streakChestClaimed || {}), [action.payload.streakKey]: true } };
        }),
      };
    case 'CLAIM_MISSION_CHEST':
      return { ...state, children: state.children.map(c => c.id === action.payload.childId ? { ...c, missionChestClaimed: true } : c) };
    case 'RESET_DAILY_CHESTS': {
      const today = getToday();
      return {
        ...state,
        children: state.children.map(c => {
          if (c.id !== action.payload.childId) return c;
          if (c.lastChestDate === today) return c;
          return { ...c, chestsOpenedToday: 0, lastChestDate: today };
        }),
      };
    }
    case 'CONTRIBUTE_FAMILY_CHEST': {
      const newFamilyPoints = (state.familyChest?.currentPoints || 0) + action.payload.amount;
      return {
        ...state,
        children: state.children.map(c => c.id === action.payload.childId ? { ...c, points: Math.max(0, (c.points || 0) - action.payload.amount) } : c),
        familyChest: state.familyChest ? { ...state.familyChest, currentPoints: newFamilyPoints } : null,
      };
    }
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };
    case 'SET_PREMIUM':
      return { ...state, isPremium: action.payload };
    case 'RESET_PROGRESS':
      return {
        ...state,
        children: state.children.map(c => safeChild({ id: c.id, name: c.name, avatar: c.avatar, age: c.age })),
        completions: [],
        familyChest: state.familyChest ? { ...state.familyChest, currentPoints: 0 } : null,
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function migrateState(saved: any): AppState {
  const merged = { ...initialState, ...saved };
  merged.children = (merged.children || []).map((c: any) => safeChild(c));
  // Migrate old chest IDs to new ones
  merged.chests = (merged.chests || []).map((c: any) => {
    if (c.id === 'chest-common') return DEFAULT_CHESTS[0];
    if (c.id === 'chest-rare') return DEFAULT_CHESTS[1];
    if (c.id === 'chest-epic') return DEFAULT_CHESTS[2];
    return c;
  });
  // Ensure we have the diamond chest
  if (!merged.chests.find((c: any) => c.id === 'chest-diamond')) {
    merged.chests = [...merged.chests, DEFAULT_CHESTS[3]];
  }
  return merged;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = localStorage.getItem('missao-do-dia-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: migrateState(parsed) });
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    localStorage.setItem('missao-do-dia-state', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
