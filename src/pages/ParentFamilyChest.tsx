import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function ParentFamilyChest() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [chestName, setChestName] = useState(state.familyChest?.name || 'Baú da Família');
  const [chestCost, setChestCost] = useState(state.familyChest?.cost || 500);
  const [rewards, setRewards] = useState<string[]>(state.familyChest?.rewards || []);
  const [newReward, setNewReward] = useState('');

  const addReward = () => { if (newReward.trim()) { setRewards([...rewards, newReward.trim()]); setNewReward(''); } };
  const handleSave = () => {
    dispatch({ type: 'UPDATE_FAMILY_CHEST', payload: { id: 'family-chest', name: chestName, cost: chestCost, currentPoints: state.familyChest?.currentPoints || 0, rewards, icon: '🏰' } });
  };

  const progress = state.familyChest ? Math.min(100, (state.familyChest.currentPoints / state.familyChest.cost) * 100) : 0;

  return (
    <div className="min-h-screen p-5 pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/parent')}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">←</motion.button>
          <h1 className="text-2xl font-bungee text-outline text-white">BAÚ DA FAMÍLIA</h1>
        </div>

        {/* Progress card */}
        <div className="card-brawl p-6 rounded-3xl bg-gradient-to-br from-amber-900/30 to-orange-950/40 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-6">
          <div className="text-center mb-5">
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-3 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >🏰</motion.div>
            <h2 className="text-xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-transparent">{state.familyChest?.name}</h2>
            <p className="text-amber-300/50 text-sm font-bold">Meta coletiva da família</p>
          </div>
          <div className="progress-brawl h-5 mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="progress-brawl-fill h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ color: '#f59e0b' }}
            />
          </div>
          <div className="flex justify-between text-sm font-extrabold">
            <span className="text-amber-300/70">⭐ {state.familyChest?.currentPoints || 0}</span>
            <span className="text-amber-300/50">{state.familyChest?.cost || 0} pts</span>
          </div>
        </div>

        {/* Rewards */}
        <div className="card-brawl p-5 rounded-2xl bg-purple-900/50 mb-5">
          <h3 className="text-white font-bungee text-outline-sm mb-3">🎁 RECOMPENSAS</h3>
          <div className="space-y-2 mb-3">
            {rewards.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 rounded-lg bg-purple-900/30 text-purple-200 text-sm font-bold">{r}</span>
                <button onClick={() => setRewards(rewards.filter((_, idx) => idx !== i))} className="text-red-400/60 hover:text-red-400">✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newReward} onChange={e => setNewReward(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReward()}
              placeholder="Nova recompensa" className="flex-1 px-3 py-2 rounded-lg bg-purple-900/50 border border-purple-500/30 text-white text-sm placeholder-purple-400/30 outline-none font-bold" />
            <button onClick={addReward} className="btn-3d px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-extrabold border border-amber-400/30">+</button>
          </div>
        </div>

        {/* Config */}
        <div className="card-brawl p-5 rounded-2xl bg-purple-900/50">
          <h3 className="text-white font-bungee text-outline-sm mb-3">⚙️ CONFIG</h3>
          <div className="mb-3">
            <label className="text-purple-300/60 text-sm font-bold mb-1 block">Nome</label>
            <input value={chestName} onChange={e => setChestName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white outline-none focus:border-purple-400/60 font-bold" />
          </div>
          <div className="mb-4">
            <label className="text-purple-300/60 text-sm font-bold mb-1 block">Meta (pontos)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setChestCost(Math.max(50, chestCost - 50))} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">−</button>
              <span className="text-3xl font-bungee text-yellow-400 text-outline-gold w-16 text-center">{chestCost}</span>
              <button onClick={() => setChestCost(chestCost + 50)} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">+</button>
            </div>
          </div>
          <button onClick={handleSave} className="btn-3d w-full py-3 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 text-purple-950 font-extrabold border-2 border-amber-300/40">Salvar</button>
        </div>
      </div>
    </div>
  );
}