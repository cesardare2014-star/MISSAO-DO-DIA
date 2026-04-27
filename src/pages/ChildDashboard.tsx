import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AVATARS, ACCESSORIES, STREAK_REWARDS, MISSION_MILESTONE, MAX_CHESTS_PER_DAY, SURPRISE_CHANCE } from '../types';
import { getWeekDays, getWeekDay, getToday } from '../lib/utils';
import { playSound, vibrate } from '../lib/sounds';
import confetti from 'canvas-confetti';

type ChestSource = 'points' | 'streak' | 'mission' | 'surprise';

export default function ChildDashboard() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const [showReward, setShowReward] = useState<string | null>(null);
  const [showRewardRarity, setShowRewardRarity] = useState<'common' | 'rare' | 'epic'>('common');
  const [showRewardSource, setShowRewardSource] = useState<ChestSource>('points');
  const [showAccessoryShop, setShowAccessoryShop] = useState(false);
  const [tab, setTab] = useState<'missions' | 'rewards' | 'progress' | 'shop'>('missions');
  const [openingChest, setOpenChest] = useState<{ id: string; source: ChestSource } | null>(null);
  const [chestPhase, setChestPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle');
  const [revealedReward, setRevealedReward] = useState<string | null>(null);
  const [starBurst, setStarBurst] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const child = state.children.find(c => c.id === childId);
  const avatarData = AVATARS.find(a => a.id === child?.avatar);
  const weekDays = getWeekDays();
  const todayIndex = getWeekDay();
  const today = getToday();

  // 🔥 CORREÇÃO GLOBAL DE RARIDADE
  const rarityMap: Record<string, 'common' | 'rare' | 'epic'> = {
    bronze: 'common',
    silver: 'rare',
    gold: 'epic',
    diamond: 'epic',
  };

  const getSafeRarity = (rarity: string, rc: any): 'common' | 'rare' | 'epic' => {
    if (rc[rarity]) return rarity;
    if (rarityMap[rarity]) return rarityMap[rarity];
    return 'common';
  };

  const myTasks = useMemo(() => state.tasks.filter(t => t.assignedTo.includes(childId || '')), [state.tasks, childId]);

  const todayCompletions = useMemo(() =>
    state.completions.filter(c => c.childId === childId && c.date === today),
    [state.completions, childId, today]
  );

  const pendingTaskIds = useMemo(() => todayCompletions.filter(c => c.status === 'pending').map(c => c.taskId), [todayCompletions]);
  const approvedTaskIds = useMemo(() => todayCompletions.filter(c => c.status === 'approved').map(c => c.taskId), [todayCompletions]);

  useEffect(() => {
    if (child && child.lastChestDate !== today) {
      dispatch({ type: 'RESET_DAILY_CHESTS', payload: { childId: child.id } });
    }
  }, [child?.id, child?.lastChestDate, today, dispatch]);

  const chestsOpenedToday = child?.lastChestDate === today ? (child.chestsOpenedToday || 0) : 0;
  const canOpenMore = chestsOpenedToday < MAX_CHESTS_PER_DAY;

  const handleOpenChest = useCallback((chestId: string, source: ChestSource) => {
    if (!child) return;
    const chest = state.chests.find(c => c.id === chestId);
    if (!chest) return;

    const safeRarity = getSafeRarity(chest.rarity, rc);

    setOpenChest({ id: chestId, source });
    setChestPhase('shaking');

    setTimeout(() => {
      setChestPhase('opening');
    }, 1000);

    setTimeout(() => {
      const reward = chest.rewards[Math.floor(Math.random() * chest.rewards.length)];
      setRevealedReward(reward);
      setShowRewardRarity(safeRarity);
      setChestPhase('revealed');

      dispatch({
        type: source === 'points' ? 'OPEN_CHEST_BY_POINTS' : 'OPEN_FREE_CHEST',
        payload: { childId: child.id }
      });

      confetti();
    }, 2000);
  }, [child, state.chests, dispatch]);

  const rc: Record<string, any> = {
    common: { glow: 'glow-common' },
    rare: { glow: 'glow-rare' },
    epic: { glow: 'glow-epic' }
  };

  if (!child) return <div>Perfil não encontrado</div>;

  return (
    <div>
      {state.chests.map(chest => {
        const safeRarity = getSafeRarity(chest.rarity, rc);
        const r = rc[safeRarity];

        return (
          <div key={chest.id}>
            <p>{chest.name}</p>
            <button onClick={() => handleOpenChest(chest.id, 'points')}>
              Abrir Baú
            </button>
          </div>
        );
      })}

      <AnimatePresence>
        {openingChest && (
          <motion.div>
            {chestPhase === 'shaking' && <div>🎁</div>}
            {chestPhase === 'opening' && <div>💥</div>}
            {chestPhase === 'revealed' && (
              <div>
                <p>{revealedReward}</p>
                <button onClick={() => setOpenChest(null)}>Fechar</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
