import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AVATARS, PREDEFINED_TASKS } from '../types';
import { generateId } from '../lib/utils';
import type { Child } from '../types';
import DeleteConfirm from '../components/DeleteConfirm';

export default function ParentChildren() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Child | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('lion');
  const [age, setAge] = useState(6);

  const resetForm = () => { setName(''); setAvatar('lion'); setAge(6); setEditing(null); setShowForm(false); };

  const openEdit = (child: Child) => {
    setEditing(child);
    setName(child.name);
    setAvatar(child.avatar);
    setAge(child.age);
    setShowForm(true);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const assignPredefinedTasks = (childId: string) => {
    PREDEFINED_TASKS.forEach(pt => {
      const existingTask = state.tasks.find(t => t.name === pt.name && t.icon === pt.icon && t.points === pt.points);
      if (existingTask) {
        if (!existingTask.assignedTo.includes(childId)) {
          dispatch({
            type: 'UPDATE_TASK',
            payload: { ...existingTask, assignedTo: [...existingTask.assignedTo, childId] },
          });
        }
      } else {
        dispatch({
          type: 'ADD_TASK',
          payload: { id: generateId(), icon: pt.icon, name: pt.name, points: pt.points, assignedTo: [childId] },
        });
      }
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_CHILD', payload: { ...editing, name: name.trim(), avatar, age } });
    } else {
      if (!state.isPremium && state.children.length >= 2) {
        alert('Plano gratuito: até 2 crianças. Ative o Premium!');
        return;
      }
      const newChildId = generateId();
      dispatch({
        type: 'ADD_CHILD',
        payload: {
          id: newChildId,
          name: name.trim(),
          avatar,
          age,
          points: 0,
          streak: 0,
          weeklyProgress: [false, false, false, false, false, false, false],
          accessories: [],
          chestsOpenedToday: 0,
          lastChestDate: '',
          totalTasksCompleted: 0,
          streakChestClaimed: {},
          missionChestClaimed: false,
          unlockedChests: [],
          weekPoints: 0,
          weekStart: '',
        },
      });
      assignPredefinedTasks(newChildId);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_CHILD', payload: deleteTarget.id });
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
          <h1 className="text-2xl font-bungee text-outline text-white">FILHOS</h1>
          <div className="flex-1" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="btn-3d px-5 py-2.5 rounded-xl bg-gradient-to-b from-pink-500 to-rose-600 text-white font-extrabold text-sm border-2 border-pink-400/40"
          >+ Adicionar</motion.button>
        </div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-brawl p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/25 mb-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">📋</span>
            <div>
              <p className="text-blue-300 font-extrabold text-sm">10 missões pré-definidas</p>
              <p className="text-blue-300/50 text-xs font-bold mt-0.5">Ao adicionar uma criança, as missões padrão são criadas automaticamente para ela. Você pode editar ou excluir depois.</p>
            </div>
          </div>
        </motion.div>

        {/* Children list */}
        <div className="space-y-3">
          {state.children.map(child => {
            const avatarData = AVATARS.find(a => a.id === child.avatar);
            const childTaskCount = state.tasks.filter(t => t.assignedTo.includes(child.id)).length;
            return (
              <motion.div key={child.id} layout
                className="card-brawl p-4 rounded-2xl bg-purple-900/50"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl drop-shadow-lg">{avatarData?.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-extrabold text-outline-sm truncate">{child.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-purple-300/50 text-sm font-bold">{child.age} anos</span>
                      <span className="text-purple-500/30">•</span>
                      <span className="text-yellow-400/70 text-sm font-bold">⭐ {child.points ?? 0}</span>
                      <span className="text-purple-500/30">•</span>
                      <span className="text-blue-400/70 text-sm font-bold">⚔️ {childTaskCount} missões</span>
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => openEdit(child)}
                    className="btn-3d w-10 h-10 rounded-xl bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center text-lg hover:bg-blue-500/30 transition-colors"
                    title="Editar perfil"
                  >✏️</motion.button>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setDeleteTarget(child)}
                    className="btn-3d w-10 h-10 rounded-xl bg-red-500/15 border-2 border-red-500/25 flex items-center justify-center text-lg hover:bg-red-500/25 transition-colors"
                    title="Excluir perfil"
                  >🗑️</motion.button>
                </div>
              </motion.div>
            );
          })}
          {state.children.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👶</div>
              <p className="text-purple-300/50 font-bold">Nenhum perfil cadastrado</p>
              <p className="text-purple-300/30 text-sm mt-1 font-bold">Toque em "+ Adicionar" para começar</p>
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
                className="w-full max-w-md bg-gradient-to-b from-[#1e1250] to-[#140d35] border-4 border-purple-400/30 rounded-3xl p-6"
              >
                <h3 className="text-xl font-bungee text-outline text-white mb-4">
                  {editing ? '✏️ Editar Perfil' : '➕ Novo Perfil'}
                </h3>

                {!editing && (
                  <div className="card-brawl p-3 rounded-xl bg-blue-500/10 border-blue-400/20 mb-5">
                    <p className="text-blue-300/70 text-xs font-bold leading-relaxed">
                      📋 Ao criar o perfil, <span className="text-blue-300">10 missões pré-definidas</span> serão automaticamente atribuídas:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PREDEFINED_TASKS.map((t, i) => (
                        <span key={i} className="text-xs font-bold text-blue-200/50 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {t.icon} {t.name} <span className="text-yellow-400/60">({t.points})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Nome</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da criança"
                    className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white placeholder-purple-400/30 outline-none focus:border-purple-400/60 font-bold" />
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Idade</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAge(Math.max(2, age - 1))} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">−</button>
                    <span className="text-3xl font-bungee text-yellow-400 text-outline w-14 text-center">{age}</span>
                    <button onClick={() => setAge(Math.min(15, age + 1))} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">+</button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-purple-300/60 text-sm font-bold mb-3 block">Avatar</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATARS.map(a => (
                      <button key={a.id} onClick={() => setAvatar(a.id)}
                        className={`p-3 rounded-xl text-2xl transition-all border-2 ${
                          avatar === a.id
                            ? 'bg-purple-500/40 border-purple-400 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                            : 'bg-purple-900/30 border-transparent hover:bg-purple-800/30'
                        }`}
                      >{a.emoji}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={resetForm}
                    className="flex-1 py-3 rounded-xl bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 font-bold">Cancelar</button>
                  <button onClick={handleSave}
                    className="btn-3d flex-1 py-3 rounded-xl bg-gradient-to-b from-pink-500 to-rose-600 text-white font-extrabold border-2 border-pink-400/40">{editing ? 'Salvar' : 'Criar'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirm
              title="EXCLUIR PERFIL"
              message={`Tem certeza que deseja excluir o perfil de "${deleteTarget.name}"? As missões atribuídas apenas a esta criança serão removidas. Esta ação não pode ser desfeita.`}
              confirmLabel="Excluir Perfil"
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
