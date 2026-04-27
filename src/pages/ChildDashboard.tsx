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

  const myTasks = useMemo(() => state.tasks.filter(t => t.assignedTo.includes(childId || '')), [state.tasks, childId]);

  const todayCompletions = useMemo(() =>
    state.completions.filter(c => c.childId === childId && c.date === today),
    [state.completions, childId, today]
  );

  const pendingTaskIds = useMemo(() => todayCompletions.filter(c => c.status === 'pending').map(c => c.taskId), [todayCompletions]);
  const approvedTaskIds = useMemo(() => todayCompletions.filter(c => c.status === 'approved').map(c => c.taskId), [todayCompletions]);

  // Reset daily chests on new day (using dedicated action to avoid overwriting points)
  useEffect(() => {
    if (child && child.lastChestDate !== today) {
      dispatch({ type: 'RESET_DAILY_CHESTS', payload: { childId: child.id } });
    }
  }, [child?.id, child?.lastChestDate, today, dispatch]);

  // Confetti on newly approved
  useEffect(() => {
    const approved = todayCompletions.filter(c => c.status === 'approved');
    if (approved.length > 0) {
      const key = 'last-seen-approved-' + childId;
      const last = sessionStorage.getItem(key);
      if (last !== String(approved.length)) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#a855f7', '#eab308', '#22c55e'] });
        playSound('reward');
        sessionStorage.setItem(key, String(approved.length));
      }
    }
  }, [todayCompletions, childId]);

  // Computed: chests opened today
  const chestsOpenedToday = child?.lastChestDate === today ? (child.chestsOpenedToday || 0) : 0;
  const canOpenMore = chestsOpenedToday < MAX_CHESTS_PER_DAY;

  // Computed: approved total for mission milestone
  const totalApproved = useMemo(() =>
    state.completions.filter(c => c.childId === childId && c.status === 'approved').length,
    [state.completions, childId]
  );

  // Computed: all daily tasks done?
  const allDailyTasksDone = myTasks.length > 0 && myTasks.every(t => approvedTaskIds.includes(t.id) || pendingTaskIds.includes(t.id));

  // Computed: streak rewards available
  const streakRewardsAvailable = useMemo(() => {
    if (!child) return [];
    return STREAK_REWARDS.filter(sr => child.streak >= sr.days && !child.streakChestClaimed[String(sr.days)]);
  }, [child]);

  // Computed: mission chest available
  const missionChestAvailable = child && totalApproved >= MISSION_MILESTONE && !child.missionChestClaimed;

  // Complete task handler with surprise chest
  const handleCompleteTask = useCallback((taskId: string) => {
    if (pendingTaskIds.includes(taskId) || approvedTaskIds.includes(taskId)) return;
    dispatch({
      type: 'ADD_COMPLETION',
      payload: { id: Math.random().toString(36).substring(2, 11), taskId, childId: child!.id, date: today, status: 'pending' },
    });
    playSound('complete');
    vibrate(30);
    setStarBurst(true);
    setTimeout(() => setStarBurst(false), 600);

    // Surprise chest: 10% chance
    if (Math.random() < SURPRISE_CHANCE) {
      setTimeout(() => {
        setShowSurprise(true);
        playSound('surprise');
        vibrate([50, 50, 100]);
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ['#22c55e', '#eab308', '#a855f7'] });
      }, 500);
    }
  }, [pendingTaskIds, approvedTaskIds, dispatch, child, today]);

  // Open chest handler
  const handleOpenChest = useCallback((chestId: string, source: ChestSource) => {
    if (!child) return;
    const chest = state.chests.find(c => c.id === chestId);
    if (!chest) return;

    // Check daily limit
    if (!canOpenMore) {
      setShowLimitWarning(true);
      playSound('error');
      vibrate([30, 30, 30]);
      return;
    }

    // Check points for points-sourced chests
    if (source === 'points' && (child.points || 0) < chest.cost) return;

    setOpenChest({ id: chestId, source });
    setChestPhase('shaking');
    playSound('chest-shake');
    vibrate([20, 30, 20, 30, 20]);

    setTimeout(() => {
      setChestPhase('opening');
      playSound('chest-open');
      vibrate(100);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#a855f7', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#f97316'] });
    }, 1200);

    setTimeout(() => {
      const reward = chest.rewards[Math.floor(Math.random() * chest.rewards.length)];
      setRevealedReward(reward);
      setShowRewardRarity(chest.rarity);
      setShowRewardSource(source);
      setChestPhase('revealed');

      // Dispatch appropriate action
      if (source === 'points') {
        dispatch({ type: 'OPEN_CHEST_BY_POINTS', payload: { childId: child.id, cost: chest.cost } });
      } else {
        dispatch({ type: 'OPEN_FREE_CHEST', payload: { childId: child.id } });
      }

      // Mark streak/mission as claimed
      if (source === 'streak') {
        const streakKey = String(STREAK_REWARDS.find(sr => sr.rarity === chest.rarity && child.streak >= sr.days)?.days || '');
        if (streakKey) dispatch({ type: 'CLAIM_STREAK_CHEST', payload: { childId: child.id, streakKey } });
      }
      if (source === 'mission') {
        dispatch({ type: 'CLAIM_MISSION_CHEST', payload: { childId: child.id } });
      }

      playSound('reward');
      vibrate([50, 30, 80]);
      confetti({ particleCount: 300, spread: 160, startVelocity: 40, origin: { y: 0.4 }, colors: ['#a855f7', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#f97316', '#ef4444'] });
    }, 2400);
  }, [child, state.chests, dispatch, canOpenMore]);

  // Open surprise chest (always common, free)
  const handleOpenSurpriseChest = useCallback(() => {
    handleOpenChest('chest-common', 'surprise');
    setShowSurprise(false);
  }, [handleOpenChest]);

  const handleCloseChest = () => {
    setOpenChest(null);
    setChestPhase('idle');
    setRevealedReward(null);
  };

  const handleContributeFamily = (amount: number) => {
    if (child!.points < amount) return;
    dispatch({ type: 'CONTRIBUTE_FAMILY_CHEST', payload: { childId: child!.id, amount } });
    playSound('complete');
    vibrate(30);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#f97316'] });
  };

  const handleBuyAccessory = (accessoryId: string, cost: number) => {
    if (child!.points < cost) return;
    dispatch({ type: 'BUY_ACCESSORY', payload: { childId: child!.id, accessoryId, cost } });
    playSound('reward');
    vibrate(30);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#a855f7', '#ec4899'] });
  };

  const familyProgress = state.familyChest ? Math.min(100, (state.familyChest.currentPoints / state.familyChest.cost) * 100) : 0;

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0a0520, #150a35, #0a0520)' }}>
        <div className="text-center"><div className="text-5xl mb-4">🤔</div><p className="text-purple-300/50 font-bold">Perfil não encontrado</p>
          <button onClick={() => navigate('/child-select')} className="mt-4 text-purple-400 font-bold">Voltar</button></div>
      </div>
    );
  }

  const rc: Record<string, { gradient: string; bg: string; glow: string; text: string }> = {
    common: { gradient: 'from-green-400 to-emerald-600', bg: 'from-green-900/40 to-green-950/60', glow: 'glow-common', text: 'text-green-400' },
    rare: { gradient: 'from-blue-400 to-indigo-600', bg: 'from-blue-900/40 to-blue-950/60', glow: 'glow-rare', text: 'text-blue-400' },
    epic: { gradient: 'from-purple-400 via-pink-500 to-rose-600', bg: 'from-purple-900/40 to-pink-950/60', glow: 'glow-epic', text: 'text-purple-400' },
  };

  const sourceLabel: Record<ChestSource, string> = {
    points: '⭐ Comprado com pontos',
    streak: '🔥 Recompensa de sequência',
    mission: '🎯 Recompensa de missões',
    surprise: '🎲 Baú surpresa!',
  };

  return (
    <div className="min-h-screen pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      {/* Header */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-5">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/child-select')}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">←</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAccessoryShop(true)}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">🎩</motion.button>
        </div>

        {/* Avatar & Stats */}
        <div className="text-center mb-5">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="relative inline-block">
            <div className="text-8xl mb-1 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">{avatarData?.emoji}</div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
              {child.accessories.slice(0, 3).map(accId => {
                const acc = ACCESSORIES.find(a => a.id === accId);
                return acc ? <motion.span key={accId} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8 }} className="text-xl drop-shadow-lg">{acc.emoji}</motion.span> : null;
              })}
            </div>
          </motion.div>
          <h2 className="text-2xl font-bungee text-outline text-white mt-2">{child.name}</h2>
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <motion.div animate={starBurst ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}
              className="flex items-center gap-2 bg-yellow-500/20 px-5 py-3 rounded-2xl border-2 border-yellow-400/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <span className="text-2xl animate-star-spin">⭐</span>
              <span className="text-yellow-300 font-bungee text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">{child.points ?? 0}</span>
              <span className="text-yellow-400/50 text-xs font-bold">pontos</span>
            </motion.div>
            {child.streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-500/15 px-4 py-2 rounded-xl border-2 border-orange-500/30">
                <motion.span animate={{ scaleY: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-xl animate-fire">🔥</motion.span>
                <span className="text-orange-400 font-bungee text-xl text-outline">{child.streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-purple-500/15 px-3 py-2 rounded-xl border-2 border-purple-500/25">
              <span className="text-lg">🎁</span>
              <span className={`font-bungee text-sm ${chestsOpenedToday >= MAX_CHESTS_PER_DAY ? 'text-red-400' : 'text-purple-300'}`}>{chestsOpenedToday}/{MAX_CHESTS_PER_DAY}</span>
            </div>
          </div>
        </div>

        {/* Weekly tracker */}
        <div className="flex justify-center gap-2 mb-4">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`text-xs font-extrabold ${i === todayIndex ? 'text-yellow-400' : 'text-purple-300/30'}`}>{day}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold border-2 ${
                i === todayIndex ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                  : child.weeklyProgress[i] ? 'bg-green-500/15 border-green-500/40 text-green-400'
                  : 'bg-purple-900/30 border-purple-500/15 text-purple-300/20'
              }`}>{child.weeklyProgress[i] ? '✓' : day}</div>
            </div>
          ))}
        </div>

        {/* Streak progress bar */}
        {child.streak > 0 && (
          <div className="card-brawl p-3 rounded-2xl bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/20 mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bungee text-orange-300 text-outline-sm">🔥 SEQUÊNCIA</span>
              <span className="text-[10px] text-orange-300/50 font-bold">{child.streak}/7 dias</span>
            </div>
            <div className="flex gap-1.5">
              {[3, 5, 7].map(d => (
                <div key={d} className="flex-1">
                  <div className={`h-2 rounded-full ${child.streak >= d ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-orange-900/30'}`} />
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <span className="text-[9px] font-bold text-orange-300/50">{d}d</span>
                    {child.streak >= d && !child.streakChestClaimed[String(d)] && <span className="text-[9px]">✨</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family chest mini */}
        {state.familyChest && (
          <div className="card-brawl p-3 rounded-2xl bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/25 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bungee text-amber-300 text-outline-sm">🏰 {state.familyChest.name}</span>
              <span className="text-xs text-amber-300/50 font-bold">⭐ {state.familyChest.currentPoints}/{state.familyChest.cost}</span>
            </div>
            <div className="progress-brawl h-2.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${familyProgress}%` }}
                className="progress-brawl-fill h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="px-5 mb-4">
        <div className="flex bg-purple-900/40 rounded-2xl p-1.5 border-2 border-purple-500/15">
          {[
            { key: 'missions' as const, label: 'Missões', icon: '⚔️', badge: 0 },
            { key: 'rewards' as const, label: 'Baús', icon: '🎁', badge: streakRewardsAvailable.length + (missionChestAvailable ? 1 : 0) },
            { key: 'progress' as const, label: 'Progresso', icon: '📊', badge: 0 },
            { key: 'shop' as const, label: 'Família', icon: '🏰', badge: 0 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1 transition-all relative ${
                tab === t.key ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white border-2 border-purple-400/40 shadow-[0_2px_0_rgba(0,0,0,0.3)]' : 'text-purple-300/40'
              }`}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center border border-red-400">
                  {t.badge}
                </motion.span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          {/* ====== MISSIONS TAB ====== */}
          {tab === 'missions' && (
            <motion.div key="missions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
              {/* Daily limit warning */}
              {!canOpenMore && (
                <div className="card-brawl p-3 rounded-xl bg-red-500/10 border-red-500/25 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <p className="text-red-300/70 text-xs font-bold">Limite de {MAX_CHESTS_PER_DAY} baús por dia atingido!</p>
                </div>
              )}

              {myTasks.length === 0 ? (
                <div className="text-center py-16">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">🌟</motion.div>
                  <p className="text-purple-300/50 font-bold">Nenhuma missão atribuída</p>
                </div>
              ) : (
                myTasks.map(task => {
                  const isPending = pendingTaskIds.includes(task.id);
                  const isApproved = approvedTaskIds.includes(task.id);
                  return (
                    <motion.div key={task.id} layout
                      className={`card-brawl p-4 rounded-2xl flex items-center gap-4 transition-all ${
                        isApproved ? 'bg-green-900/30 border-green-500/30' : isPending ? 'bg-yellow-900/20 border-yellow-500/25' : 'bg-purple-900/50'
                      }`}>
                      <div className="text-3xl drop-shadow-lg">{task.icon}</div>
                      <div className="flex-1">
                        <p className={`font-extrabold text-outline-sm ${isApproved ? 'text-green-300' : isPending ? 'text-yellow-300' : 'text-white'}`}>{task.name}</p>
                        <p className={`text-sm font-bold ${isApproved ? 'text-green-400/60' : isPending ? 'text-yellow-400/60' : 'text-purple-300/50'}`}>
                          {isApproved ? 'Concluída ✅' : isPending ? 'Aguardando aprovação...' : `⭐ ${task.points} pontos`}
                        </p>
                      </div>
                      {isApproved ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-3xl">✅</motion.span>
                      ) : isPending ? (
                        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">⏳</motion.span>
                      ) : (
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                          onClick={() => handleCompleteTask(task.id)}
                          className="btn-3d w-14 h-14 rounded-xl bg-gradient-to-b from-green-400 to-emerald-600 text-white text-2xl flex items-center justify-center border-2 border-green-300/40"
                        >✓</motion.button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ====== REWARDS TAB ====== */}
          {tab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              {/* Daily limit info */}
              <div className="card-brawl p-3 rounded-xl bg-purple-900/30 flex items-center justify-between">
                <span className="text-purple-300/60 text-xs font-bold">🎁 Baús abertos hoje</span>
                <div className="flex gap-1">
                  {Array.from({ length: MAX_CHESTS_PER_DAY }).map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs border ${
                      i < chestsOpenedToday ? 'bg-yellow-500/30 border-yellow-400/50 text-yellow-300' : 'bg-purple-900/30 border-purple-500/20 text-purple-300/20'
                    }`}>{i < chestsOpenedToday ? '✓' : '○'}</div>
                  ))}
                </div>
              </div>

              {/* Streak rewards */}
              {streakRewardsAvailable.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bungee text-orange-300 text-outline-sm">🔥 RECOMPENSAS DE SEQUÊNCIA</h3>
                  {streakRewardsAvailable.map(sr => {
                    const chest = state.chests.find(c => c.rarity === sr.rarity);
                    if (!chest) return null;
                    const r = rc[sr.rarity];
                    return (
                      <motion.button key={sr.days} layout whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenChest(chest.id, 'streak')}
                        className={`card-brawl w-full p-4 rounded-2xl bg-gradient-to-r ${r.bg} ${r.glow} text-left`}>
                        <div className="flex items-center gap-3">
                          <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">{chest.icon}</motion.span>
                          <div className="flex-1">
                            <p className="text-white font-extrabold text-outline-sm">Baú {sr.rarity === 'common' ? 'Comum' : sr.rarity === 'rare' ? 'Raro' : 'Épico'} GRÁTIS!</p>
                            <p className="text-purple-200/50 text-xs font-bold">🔥 {sr.label} — Sem custo de pontos</p>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-orange-400 to-red-500 text-white font-extrabold text-xs border border-orange-300/40">RESGATAR</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Mission reward */}
              {missionChestAvailable && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bungee text-blue-300 text-outline-sm">🎯 RECOMPENSA DE MISSÕES</h3>
                  <motion.button layout whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenChest('chest-common', 'mission')}
                    className="card-brawl w-full p-4 rounded-2xl bg-gradient-to-r from-green-900/40 to-green-950/60 glow-common text-left">
                    <div className="flex items-center gap-3">
                      <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-4xl">📦</motion.span>
                      <div className="flex-1">
                        <p className="text-white font-extrabold text-outline-sm">Baú Comum GRÁTIS!</p>
                        <p className="text-purple-200/50 text-xs font-bold">🎯 {MISSION_MILESTONE} tarefas completadas — Sem custo</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-green-400 to-emerald-500 text-white font-extrabold text-xs border border-green-300/40">RESGATAR</span>
                    </div>
                  </motion.button>
                </div>
              )}

              {/* Points-based chests */}
              <h3 className="text-sm font-bungee text-yellow-300 text-outline-sm">⭐ COMPRAR COM PONTOS</h3>
              {state.chests.map(chest => {
                const canOpen = (child.points || 0) >= chest.cost && canOpenMore;
                const r = rc[chest.rarity];
                return (
                  <motion.div key={chest.id} layout
                    className={`card-brawl rounded-3xl overflow-hidden ${canOpen ? r.glow : 'opacity-60'} relative`}>
                    <div className={`bg-gradient-to-br ${r.bg} p-5`}>
                      {canOpen && <div className="absolute inset-0 shimmer-sweep" />}
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <motion.div animate={canOpen ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} className="text-5xl"
                            style={{ filter: canOpen ? `drop-shadow(0 0 15px ${chest.rarity === 'epic' ? '#a855f7' : chest.rarity === 'rare' ? '#3b82f6' : '#22c55e'})` : 'none' }}>{chest.icon}</motion.div>
                          <div className="flex-1">
                            <p className="text-white font-bungee text-lg text-outline-sm">{chest.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold bg-gradient-to-r ${r.gradient} text-white`}>{chest.rarity === 'common' ? 'Comum' : chest.rarity === 'rare' ? 'Raro' : 'Épico'}</span>
                              <span className="text-yellow-400 font-extrabold text-sm">⭐ {chest.cost}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-5 pl-1">
                          {chest.rewards.map((rw, i) => (
                            <p key={i} className="text-purple-200/50 text-sm font-bold flex items-center gap-2">
                              <span className={r.text}>◆</span> {rw}
                            </p>
                          ))}
                        </div>
                        <motion.button whileHover={canOpen ? { scale: 1.03 } : {}} whileTap={canOpen ? { scale: 0.97 } : {}}
                          onClick={() => canOpen && handleOpenChest(chest.id, 'points')}
                          className={`w-full py-3.5 rounded-xl font-bungee text-lg border-3 ${canOpen
                            ? `btn-3d bg-gradient-to-b ${r.gradient} text-white border-white/20 text-outline-sm`
                            : 'bg-purple-900/30 text-purple-300/30 cursor-not-allowed border-purple-500/10'
                          }`}>
                          {!canOpenMore ? `🚫 Limite diário atingido` : canOpen ? '🔓 ABRIR BAÚ!' : `🔒 Faltam ${chest.cost - (child.points ?? 0)} ⭐`}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ====== PROGRESS TAB ====== */}
          {tab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Streak card */}
              <div className="card-brawl p-5 rounded-3xl bg-gradient-to-br from-orange-900/25 to-red-950/30 border-orange-500/25">
                <div className="text-center mb-4">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-2">🔥</motion.div>
                  <h3 className="text-xl font-bungee text-outline text-white">SEQUÊNCIA</h3>
                  <p className="text-orange-300/50 text-sm font-bold">Dias seguidos completando tarefas</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-5xl font-bungee text-orange-400 text-outline">{child.streak}</span>
                  <span className="text-orange-300/50 font-bold">dias</span>
                </div>
                <div className="space-y-2">
                  {STREAK_REWARDS.map(sr => {
                    const achieved = child.streak >= sr.days;
                    const claimed = child.streakChestClaimed[String(sr.days)];
                    const chest = state.chests.find(c => c.rarity === sr.rarity);
                    return (
                      <div key={sr.days} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${achieved ? (claimed ? 'bg-green-500/10 border-green-500/25' : 'bg-yellow-500/10 border-yellow-500/25') : 'bg-purple-900/20 border-purple-500/10'}`}>
                        <span className="text-2xl">{chest?.icon || '📦'}</span>
                        <div className="flex-1">
                          <p className={`font-extrabold text-sm ${achieved ? 'text-white' : 'text-purple-300/40'}`}>{sr.label}</p>
                          <p className="text-xs text-purple-300/30 font-bold">Baú {sr.rarity === 'common' ? 'Comum' : sr.rarity === 'rare' ? 'Raro' : 'Épico'}</p>
                        </div>
                        {claimed ? <span className="text-green-400 text-sm font-bold">✅ Resgatado</span> : achieved ? <span className="text-yellow-400 text-sm font-bold animate-pulse">✨ Disponível!</span> : <span className="text-purple-300/20 text-sm font-bold">{sr.days - child.streak} dias</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mission progress card */}
              <div className="card-brawl p-5 rounded-3xl bg-gradient-to-br from-blue-900/25 to-indigo-950/30 border-blue-500/25">
                <div className="text-center mb-4">
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="text-6xl mb-2">🎯</motion.div>
                  <h3 className="text-xl font-bungee text-outline text-white">MISSÕES</h3>
                  <p className="text-blue-300/50 text-sm font-bold">Tarefas completadas no total</p>
                </div>
                <div className="progress-brawl h-5 mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalApproved / MISSION_MILESTONE) * 100)}%` }}
                    className="progress-brawl-fill h-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ color: '#3b82f6' }} />
                </div>
                <div className="flex justify-between text-sm font-extrabold mb-4">
                  <span className="text-blue-300/70">{totalApproved} tarefas</span>
                  <span className="text-blue-300/50">{MISSION_MILESTONE} para baú grátis</span>
                </div>
                {child.missionChestClaimed && (
                  <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/25 text-center">
                    <p className="text-green-400 text-sm font-bold">✅ Baú de missões resgatado!</p>
                  </div>
                )}

                {/* All daily tasks bonus */}
                <div className="mt-4 p-3 rounded-xl bg-purple-900/20 border border-purple-500/15">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <div className="flex-1">
                      <p className="text-white font-extrabold text-sm">Completar todas do dia</p>
                      <p className="text-purple-300/40 text-xs font-bold">Bônus: +10 pontos extra</p>
                    </div>
                    {allDailyTasksDone ? <span className="text-green-400 text-sm font-bold">✅</span> : <span className="text-purple-300/20 text-sm font-bold">{approvedTaskIds.length + pendingTaskIds.length}/{myTasks.length}</span>}
                  </div>
                </div>
              </div>

              {/* Surprise info */}
              <div className="card-brawl p-4 rounded-2xl bg-gradient-to-r from-green-900/20 to-emerald-950/25 border-green-500/20">
                <div className="flex items-center gap-3">
                  <motion.span animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="text-3xl">🎲</motion.span>
                  <div>
                    <p className="text-white font-extrabold text-sm">Baú Surpresa</p>
                    <p className="text-green-300/50 text-xs font-bold">10% de chance ao completar uma tarefa — Baú Comum grátis!</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ====== FAMILY TAB ====== */}
          {tab === 'shop' && state.familyChest && (
            <motion.div key="shop" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              <div className="card-brawl p-6 rounded-3xl bg-gradient-to-br from-amber-900/25 to-orange-950/30 border-amber-500/25 shadow-[0_0_30px_rgba(245,158,11,0.1)] text-center">
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">🏰</motion.div>
                <h3 className="text-xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-transparent mb-1">{state.familyChest.name}</h3>
                <p className="text-amber-300/50 text-sm font-bold mb-4">Meta coletiva da família</p>
                <div className="progress-brawl h-4 mb-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${familyProgress}%` }}
                    className="progress-brawl-fill h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ color: '#f59e0b' }} />
                </div>
                <p className="text-amber-300/50 text-sm font-bold mb-4">⭐ {state.familyChest.currentPoints} / {state.familyChest.cost}</p>
                <div className="space-y-1 mb-5">
                  {state.familyChest.rewards.map((r, i) => <p key={i} className="text-amber-200/50 text-sm font-bold">🎁 {r}</p>)}
                </div>
                <div className="flex gap-2">
                  {[10, 20, 50].map(amount => (
                    <motion.button key={amount} whileHover={(child.points || 0) >= amount ? { scale: 1.05 } : {}} whileTap={(child.points || 0) >= amount ? { scale: 0.95 } : {}}
                      onClick={() => handleContributeFamily(amount)} disabled={(child.points || 0) < amount}
                      className={`btn-3d flex-1 py-2.5 rounded-xl font-extrabold text-sm border-2 ${(child.points || 0) >= amount
                        ? 'bg-gradient-to-b from-amber-400 to-orange-500 text-purple-950 border-amber-300/40'
                        : 'bg-amber-900/20 text-amber-300/30 cursor-not-allowed border-amber-500/10'}`}
                    >+{amount} ⭐</motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== SURPRISE CHEST POPUP ===== */}
      <AnimatePresence>
        {showSurprise && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowSurprise(false)}>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10 }}
              onClick={e => e.stopPropagation()}
              className="card-brawl p-8 rounded-3xl bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-400/40 text-center max-w-sm"
              style={{ boxShadow: '0 0 60px rgba(34,197,94,0.3)' }}>
              <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-7xl mb-4">🎲</motion.div>
              <h2 className="text-2xl font-bungee text-outline-gold bg-gradient-to-b from-green-300 to-emerald-400 bg-clip-text text-transparent mb-2">BAÚ SURPRESA!</h2>
              <p className="text-green-200/60 text-sm font-bold mb-6">Sorte! Você ganhou um Baú Comum grátis!</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={handleOpenSurpriseChest}
                className="btn-3d px-8 py-4 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 text-white font-bungee text-lg border-2 border-green-300/40"
              >🎁 ABRIR!</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DAILY LIMIT WARNING ===== */}
      <AnimatePresence>
        {showLimitWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowLimitWarning(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="card-brawl p-6 rounded-3xl bg-gradient-to-b from-red-600/20 to-red-900/30 border-red-400/30 text-center max-w-sm">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bungee text-red-400 text-outline mb-2">LIMITE DIÁRIO</h3>
              <p className="text-red-200/60 text-sm font-bold mb-4">Você já abriu {MAX_CHESTS_PER_DAY} baús hoje. Volte amanhã para abrir mais!</p>
              <button onClick={() => setShowLimitWarning(false)}
                className="btn-3d px-6 py-3 rounded-xl bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 font-bold">Entendi</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== EPIC CHEST OPENING ANIMATION ===== */}
      <AnimatePresence>
        {openingChest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: chestPhase === 'revealed' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.9)' }}>
            {chestPhase === 'shaking' && (
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, -5, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}
                className="text-[120px] drop-shadow-[0_0_40px_rgba(234,179,8,0.6)]">
                {state.chests.find(c => c.id === openingChest.id)?.icon}
              </motion.div>
            )}
            {chestPhase === 'opening' && (
              <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.3, 0.5], rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8 }} className="text-[120px]">💥</motion.div>
            )}
            {chestPhase === 'revealed' && revealedReward && (
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 8, stiffness: 200 }} className="text-center">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="mb-4">
                  <div className="text-8xl mb-2">🎉</div>
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="text-3xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  RECOMPENSA DESBLOQUEADA!
                </motion.h2>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="text-purple-200/40 text-sm font-bold mb-4">{sourceLabel[showRewardSource]}</motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                  className="card-brawl p-8 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/40 mb-6"
                  style={{ boxShadow: '0 0 40px rgba(168,85,247,0.3), 0 0 80px rgba(236,72,153,0.15)' }}>
                  <p className="text-3xl font-bungee text-yellow-300 text-outline-gold">{revealedReward}</p>
                </motion.div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                  className="text-purple-200/50 text-sm font-bold mb-6">Peça aos pais para resgatar!</motion.p>
                <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleCloseChest}
                  className="btn-3d px-10 py-4 rounded-2xl bg-gradient-to-b from-yellow-400 to-amber-500 text-purple-950 font-bungee text-xl border-2 border-yellow-300/40"
                >YAY! 🎊</motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessory shop modal */}
      <AnimatePresence>
        {showAccessoryShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAccessoryShop(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-gradient-to-b from-[#1e1250] to-[#140d35] border-4 border-purple-400/30 rounded-3xl p-6">
              <h3 className="text-xl font-bungee text-outline text-white mb-2">🎩 LOJA</h3>
              <p className="text-purple-300/50 text-sm font-bold mb-4">Compre itens para seu avatar!</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {ACCESSORIES.map(acc => {
                  const owned = child.accessories.includes(acc.id);
                  const canBuy = (child.points || 0) >= acc.cost && !owned;
                  return (
                    <motion.button key={acc.id} whileHover={canBuy ? { scale: 1.05 } : {}} whileTap={canBuy ? { scale: 0.95 } : {}}
                      onClick={() => canBuy && handleBuyAccessory(acc.id, acc.cost)} disabled={!canBuy}
                      className={`p-4 rounded-2xl text-center transition-all border-3 ${owned ? 'bg-purple-500/20 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                        : canBuy ? 'card-brawl bg-purple-900/40 hover:border-purple-400/40' : 'bg-purple-900/15 border-purple-500/10 opacity-40'}`}>
                      <span className="text-3xl block mb-1 drop-shadow-lg">{acc.emoji}</span>
                      <span className="text-white text-xs font-extrabold block">{acc.name}</span>
                      <span className="text-yellow-400 text-xs font-extrabold block mt-1">{owned ? '✅' : `${acc.cost} ⭐`}</span>
                    </motion.button>
                  );
                })}
              </div>
              <button onClick={() => setShowAccessoryShop(false)}
                className="btn-3d w-full py-3 rounded-xl bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 font-bold">Fechar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
