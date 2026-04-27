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

  const [openingChest, setOpenChest] = useState<{ id: string; source: ChestSource } | null>(null);
  const [chestPhase, setChestPhase] = useState<'idle' | 'shaking' | 'opening' | 'revealed'>('idle');
  const [revealedReward, setRevealedReward] = useState<string | null>(null);

  const child = state.children.find(c => c.id === childId);
  const today = getToday();

  // 🔥 MAPA DE SEGURANÇA DE RARIDADE
  const rc = {
    common: { glow: 'glow-common' },
    rare: { glow: 'glow-rare' },
    epic: { glow: 'glow-epic' }
  };

  const rarityMap: Record<string, 'common' | 'rare' | 'epic'> = {
    bronze: 'common',
    silver: 'rare',
    gold: 'epic',
    diamond: 'epic'
  };

  const getSafeRarity = (rarity: string): 'common' | 'rare' | 'epic' => {
    if (rc[rarity]) return rarity as any;
    if (rarityMap[rarity]) return rarityMap[rarity];
    return 'common';
  };

  const handleOpenChest = useCallback((chestId: string, source: ChestSource) => {
    if (!child) return;

    const chest = state.chests.find(c => c.id === chestId);
    if (!chest) return;

    const safeRarity = getSafeRarity(chest.rarity);

    setOpenChest({ id: chestId, source });
    setChestPhase('shaking');

    setTimeout(() => {
      setChestPhase('opening');
    }, 1000);

    setTimeout(() => {
      const reward = chest.rewards[Math.floor(Math.random() * chest.rewards.length)];
      setRevealedReward(reward);
      setChestPhase('revealed');

      dispatch({
        type: source === 'points' ? 'OPEN_CHEST_BY_POINTS' : 'OPEN_FREE_CHEST',
        payload: { childId: child.id }
      });

      confetti();
    }, 2000);
  }, [child, state.chests, dispatch]);

  if (!child) {
    return <div>Perfil não encontrado</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{child.name}</h1>

      {/* LISTA DE BAÚS */}
      {state.chests.map(chest => {
        const safeRarity = getSafeRarity(chest.rarity);
        const r = rc[safeRarity];

        return (
          <div key={chest.id} style={{ marginBottom: 20 }}>
            <h3>{chest.name}</h3>
            <p>Raridade: {safeRarity}</p>

            <button onClick={() => handleOpenChest(chest.id, 'points')}>
              Abrir Baú
            </button>
          </div>
        );
      })}

      {/* ANIMAÇÃO DO BAÚ */}
      <AnimatePresence>
        {openingChest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {chestPhase === 'shaking' && <div>🎁 Sacudindo...</div>}
            {chestPhase === 'opening' && <div>💥 Abrindo...</div>}
            {chestPhase === 'revealed' && (
              <div>
                <h2>Recompensa:</h2>
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
