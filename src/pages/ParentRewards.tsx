import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { generateId, getChestColor, getChestBorder, getChestLabel, getChestBg, getChestGlow, getChestText } from '../lib/utils';
import type { Chest } from '../types';
import DeleteConfirm from '../components/DeleteConfirm';

const RARITIES: ('bronze' | 'silver' | 'gold' | 'diamond')[] = ['bronze', 'silver', 'gold', 'diamond'];
const CHEST_ICONS = ['📦', '🎁', '👑', '💎', '🏆', '🎪'];

const rarityBg = {
  bronze: 'from-amber-900/40 to-orange-950/60',
  silver: 'from-slate-800/40 to-gray-950/60',
  gold: 'from-yellow-900/40 to-amber-950/60',
  diamond: 'from-cyan-900/40 via-blue-950/40 to-purple-950/60',
};

export default function ParentRewards() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Chest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chest | null>(null);
  const [name, setName] = useState('');
  const [rarity, setRarity] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze');
  const [cost, setCost] = useState(30);
  const [icon, setIcon] = useState('📦');
  const [rewards, setRewards] = useState<string[]>([]);
  const [newReward, setNewReward] = useState('');

  const resetForm = () => { setName(''); setRarity('common'); setCost(30); setIcon('📦'); setRewards([]); setNewReward(''); setEditing(null); setShowForm(false); };

  const openEdit = (chest: Chest) => {
    setEditing(chest);
    setName(chest.name);
    setRarity(chest.rarity);
    setCost(chest.cost);
    setIcon(chest.icon);
    setRewards([...chest.rewards]);
    setShowForm(true);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const addReward = () => { if (newReward.trim()) { setRewards([...rewards, newReward.trim()]); setNewReward(''); } };
  const removeReward = (i: number) => setRewards(rewards.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!name.trim() || rewards.length === 0) return;
    if (editing) {
      dispatch({ type: 'UPDATE_CHEST', payload: { ...editing, name: name.trim(), rarity, cost, icon, rewards } });
    } else {
      dispatch({ type: 'ADD_CHEST', payload: { id: generateId(), name: name.trim(), rarity, cost, icon, rewards } });
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_CHEST', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen p-5 pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/parent')}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">←</motion.button>
          <h1 className="text-2xl font-bungee text-outline text-white">BAÚS</h1>
          <div className="flex-1" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="btn-3d px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-violet-600 text-white font-extrabold text-sm border-2 border-purple-400/40"
          >+ Novo Baú</motion.button>
        </div>

        {/* Chests list */}
        <div className="space-y-5">
          {state.chests.map(chest => (
            <motion.div key={chest.id} layout
              className={`card-brawl rounded-3xl overflow-hidden glow-${chest.rarity} relative`}
            >
              <div className={`bg-gradient-to-br ${rarityBg[chest.rarity]} p-5`}>
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl"
                    style={{ filter: chest.rarity === 'epic' ? 'drop-shadow(0 0 20px rgba(168,85,247,0.6))' : chest.rarity === 'rare' ? 'drop-shadow(0 0 15px rgba(59,130,246,0.5))' : 'drop-shadow(0 0 10px rgba(34,197,94,0.4))' }}
                  >{chest.icon}</motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bungee text-lg text-outline-sm truncate">{chest.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold bg-gradient-to-r ${getChestColor(chest.rarity)} text-white`}>{getChestLabel(chest.rarity)}</span>
                      <span className="text-yellow-400 font-extrabold text-sm">⭐ {chest.cost}</span>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => openEdit(chest)}
                    className="btn-3d w-10 h-10 rounded-xl bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center text-lg hover:bg-blue-500/30 transition-colors"
                    title="Editar baú"
                  >✏️</motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setDeleteTarget(chest)}
                    className="btn-3d w-10 h-10 rounded-xl bg-red-500/15 border-2 border-red-500/25 flex items-center justify-center text-lg hover:bg-red-500/25 transition-colors"
                    title="Excluir baú"
                  >🗑️</motion.button>
                </div>
                <div className="space-y-1.5 pl-1">
                  {chest.rewards.map((r, i) => (
                    <p key={i} className="text-purple-200/60 text-sm font-bold flex items-center gap-2">
                      <span className="text-yellow-400/70">◆</span> {r}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
          {state.chests.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-purple-300/50 font-bold">Nenhum baú criado</p>
              <p className="text-purple-300/30 text-sm mt-1 font-bold">Toque em "+ Novo Baú" para criar</p>
            </div>
          )}
        </div>

        {/* Create/Edit modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
              onClick={() => resetForm()}
            >
              <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md bg-gradient-to-b from-[#1e1250] to-[#140d35] border-4 border-purple-400/30 rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              >
                <h3 className="text-xl font-bungee text-outline text-white mb-6">{editing ? '✏️ Editar Baú' : '➕ Novo Baú'}</h3>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Ícone</label>
                  <div className="flex flex-wrap gap-2">
                    {CHEST_ICONS.map(ic => (
                      <button key={ic} onClick={() => setIcon(ic)}
                        className={`p-3 rounded-xl text-2xl transition-all border-2 ${
                          icon === ic ? 'bg-purple-500/40 border-purple-400 scale-110' : 'bg-purple-900/30 border-transparent hover:bg-purple-800/30'
                        }`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Nome</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Baú de Fim de Semana"
                    className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white placeholder-purple-400/30 outline-none focus:border-purple-400/60 font-bold" />
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Raridade</label>
                  <div className="flex gap-2">
                    {RARITIES.map(r => (
                      <button key={r} onClick={() => setRarity(r)}
                        className={`flex-1 py-2.5 rounded-xl font-extrabold text-sm transition-all border-2 ${
                          rarity === r
                            ? `bg-gradient-to-r ${getChestColor(r)} text-white border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]`
                            : 'bg-purple-900/30 border-transparent text-purple-300/60'
                        }`}
                      >{getChestLabel(r)}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Custo (pontos)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCost(Math.max(10, cost - 10))} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">−</button>
                    <span className="text-3xl font-bungee text-yellow-400 text-outline-gold w-16 text-center">{cost}</span>
                    <button onClick={() => setCost(cost + 10)} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">+</button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Recompensas</label>
                  <div className="space-y-2 mb-3">
                    {rewards.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 rounded-lg bg-purple-900/30 text-purple-200 text-sm font-bold">{r}</span>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeReward(i)}
                          className="btn-3d w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-sm flex items-center justify-center hover:bg-red-500/25 transition-colors"
                        >✕</motion.button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newReward} onChange={e => setNewReward(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReward()}
                      placeholder="Ex: Tomar sorvete" className="flex-1 px-3 py-2 rounded-lg bg-purple-900/50 border border-purple-500/30 text-white text-sm placeholder-purple-400/30 outline-none font-bold" />
                    <button onClick={addReward} className="btn-3d px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-extrabold border border-purple-400/30">+</button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={resetForm} className="flex-1 py-3 rounded-xl bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 font-bold">Cancelar</button>
                  <button onClick={handleSave} className="btn-3d flex-1 py-3 rounded-xl bg-gradient-to-b from-purple-500 to-violet-600 text-white font-extrabold border-2 border-purple-400/40">{editing ? 'Salvar' : 'Criar'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirm
              title="EXCLUIR BAÚ"
              message={`Tem certeza que deseja excluir o "${deleteTarget.name}"? As crianças não poderão mais abrir este baú. Esta ação não pode ser desfeita.`}
              confirmLabel="Excluir Baú"
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
