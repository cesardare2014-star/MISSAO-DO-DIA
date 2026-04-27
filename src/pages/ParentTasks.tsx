import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { TASK_ICONS, TASK_TEMPLATES, PREDEFINED_TASKS } from '../types';
import { generateId } from '../lib/utils';
import type { Task } from '../types';
import DeleteConfirm from '../components/DeleteConfirm';

const AVATARS_LIST = [
  { id: 'lion', emoji: '🦁' }, { id: 'bear', emoji: '🐻' }, { id: 'fox', emoji: '🦊' },
  { id: 'rabbit', emoji: '🐰' }, { id: 'owl', emoji: '🦉' }, { id: 'cat', emoji: '🐱' },
  { id: 'dog', emoji: '🐶' }, { id: 'panda', emoji: '🐼' }, { id: 'unicorn', emoji: '🦄' },
  { id: 'dino', emoji: '🦕' },
];

export default function ParentTasks() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🪥');
  const [points, setPoints] = useState(10);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);

  const resetForm = () => { setName(''); setIcon('🪥'); setPoints(10); setAssignedTo([]); setEditing(null); setShowForm(false); setShowTemplates(false); };

  const openEdit = (task: Task) => {
    setEditing(task);
    setName(task.name);
    setIcon(task.icon);
    setPoints(task.points);
    setAssignedTo([...task.assignedTo]);
    setShowForm(true);
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...editing, name: name.trim(), icon, points, assignedTo } });
    } else {
      if (!state.isPremium && state.tasks.length >= 5) { alert('Plano gratuito: até 5 tarefas. Ative o Premium!'); return; }
      dispatch({ type: 'ADD_TASK', payload: { id: generateId(), name: name.trim(), icon, points, assignedTo } });
    }
    resetForm();
  };

  const handleDelete = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_TASK', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const applyTemplate = (t: { icon: string; name: string; points: number }) => { setName(t.name); setIcon(t.icon); setPoints(t.points); setShowTemplates(false); };
  const toggleAssign = (childId: string) => setAssignedTo(prev => prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]);
  const getAgeGroup = (age: number) => age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12';

  const isPredefined = (task: Task) => PREDEFINED_TASKS.some(pt => pt.name === task.name && pt.icon === task.icon && pt.points === task.points);

  const handleReassignPredefined = (childId: string) => {
    PREDEFINED_TASKS.forEach(pt => {
      const existingTask = state.tasks.find(t => t.name === pt.name && t.icon === pt.icon && t.points === pt.points);
      if (existingTask) {
        if (!existingTask.assignedTo.includes(childId)) {
          dispatch({ type: 'UPDATE_TASK', payload: { ...existingTask, assignedTo: [...existingTask.assignedTo, childId] } });
        }
      } else {
        dispatch({ type: 'ADD_TASK', payload: { id: generateId(), icon: pt.icon, name: pt.name, points: pt.points, assignedTo: [childId] } });
      }
    });
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
          <h1 className="text-2xl font-bungee text-outline text-white">TAREFAS</h1>
          <div className="flex-1" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={openCreate}
            className="btn-3d px-5 py-2.5 rounded-xl bg-gradient-to-b from-blue-500 to-cyan-600 text-white font-extrabold text-sm border-2 border-blue-400/40"
          >+ Nova</motion.button>
        </div>

        {/* Re-assign predefined tasks */}
        {state.children.length > 0 && (
          <div className="card-brawl p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/20 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📋</span>
              <div className="flex-1">
                <p className="text-blue-300 font-extrabold text-sm">Re-atribuir missões padrão</p>
                <p className="text-blue-300/40 text-xs font-bold">Adicione as 10 missões pré-definidas a uma criança</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {state.children.map(child => {
                const av = AVATARS_LIST.find(a => a.id === child.avatar);
                return (
                  <motion.button key={child.id}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleReassignPredefined(child.id)}
                    className="btn-3d px-3 py-2 rounded-xl text-sm font-extrabold bg-blue-500/20 border-2 border-blue-400/30 text-blue-200 flex items-center gap-1.5 hover:bg-blue-500/30 transition-colors"
                  >{av?.emoji} {child.name}</motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks list */}
        <div className="space-y-3">
          {state.tasks.map(task => (
            <motion.div key={task.id} layout
              className="card-brawl p-4 rounded-2xl bg-purple-900/50"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl drop-shadow-lg">{task.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-extrabold text-outline-sm truncate">{task.name}</p>
                    {isPredefined(task) && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 border border-blue-400/30 text-blue-300 uppercase tracking-wider">Padrão</span>
                    )}
                  </div>
                  <p className="text-purple-300/50 text-sm font-bold">
                    ⭐ {task.points} pts • {task.assignedTo.length > 0
                      ? task.assignedTo.map(id => state.children.find(c => c.id === id)?.name).filter(Boolean).join(', ')
                      : 'Não atribuída'}
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => openEdit(task)}
                  className="btn-3d w-10 h-10 rounded-xl bg-blue-500/20 border-2 border-blue-400/30 flex items-center justify-center text-lg hover:bg-blue-500/30 transition-colors"
                  title="Editar tarefa"
                >✏️</motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => setDeleteTarget(task)}
                  className="btn-3d w-10 h-10 rounded-xl bg-red-500/15 border-2 border-red-500/25 flex items-center justify-center text-lg hover:bg-red-500/25 transition-colors"
                  title="Excluir tarefa"
                >🗑️</motion.button>
              </div>
            </motion.div>
          ))}
          {state.tasks.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-purple-300/50 font-bold">Nenhuma tarefa</p>
              <p className="text-purple-300/30 text-sm mt-1 font-bold">Toque em "+ Nova" para criar</p>
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
                <h3 className="text-xl font-bungee text-outline text-white mb-6">{editing ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}</h3>

                {!editing && state.children.length > 0 && (
                  <div className="mb-4">
                    <button onClick={() => setShowTemplates(!showTemplates)}
                      className="btn-3d w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400/50 text-amber-300 font-extrabold text-sm flex items-center justify-center gap-2"
                    >✨ Sugestões Mágicas</button>
                    <AnimatePresence>
                      {showTemplates && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                          {state.children.map(child => {
                            const ageGroup = getAgeGroup(child.age);
                            const templates = TASK_TEMPLATES[ageGroup] || [];
                            return (
                              <div key={child.id} className="mb-3">
                                <p className="text-purple-300/60 text-xs font-bold mb-2">Para {child.name} ({ageGroup} anos):</p>
                                <div className="flex flex-wrap gap-2">
                                  {templates.map((t, i) => (
                                    <button key={i} onClick={() => applyTemplate(t)}
                                      className="px-3 py-1.5 rounded-lg bg-purple-800/50 border border-purple-500/30 text-sm text-purple-200 hover:bg-purple-700/50 transition-colors font-bold"
                                    >{t.icon} {t.name}</button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Ícone</label>
                  <div className="flex flex-wrap gap-2">
                    {TASK_ICONS.map(ic => (
                      <button key={ic} onClick={() => setIcon(ic)}
                        className={`p-2 rounded-lg text-xl transition-all border-2 ${
                          icon === ic ? 'bg-blue-500/30 border-blue-400 scale-110' : 'bg-purple-900/30 border-transparent hover:bg-purple-800/30'
                        }`}
                      >{ic}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Nome da Tarefa</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Escovar os dentes"
                    className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white placeholder-purple-400/30 outline-none focus:border-purple-400/60 font-bold" />
                </div>

                <div className="mb-4">
                  <label className="text-purple-300/60 text-sm font-bold mb-2 block">Valor em Pontos</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setPoints(Math.max(1, points - 1))} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">−</button>
                    <span className="text-3xl font-bungee text-yellow-400 text-outline-gold w-14 text-center">{points}</span>
                    <button onClick={() => setPoints(points + 1)} className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 text-white font-extrabold">+</button>
                  </div>
                </div>

                {state.children.length > 0 && (
                  <div className="mb-6">
                    <label className="text-purple-300/60 text-sm font-bold mb-2 block">Atribuir para</label>
                    <div className="flex flex-wrap gap-2">
                      {state.children.map(child => {
                        const av = AVATARS_LIST.find(a => a.id === child.avatar);
                        return (
                          <button key={child.id} onClick={() => toggleAssign(child.id)}
                            className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border-2 ${
                              assignedTo.includes(child.id)
                                ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                                : 'bg-purple-900/30 border-transparent text-purple-300/60'
                            }`}
                          >{av?.emoji} {child.name}</button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={resetForm} className="flex-1 py-3 rounded-xl bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 font-bold">Cancelar</button>
                  <button onClick={handleSave} className="btn-3d flex-1 py-3 rounded-xl bg-gradient-to-b from-blue-500 to-cyan-600 text-white font-extrabold border-2 border-blue-400/40">{editing ? 'Salvar' : 'Criar'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {deleteTarget && (
            <DeleteConfirm
              title="EXCLUIR TAREFA"
              message={`Tem certeza que deseja excluir a tarefa "${deleteTarget.name}"? Os registros de conclusão desta tarefa também serão removidos. Esta ação não pode ser desfeita.`}
              confirmLabel="Excluir Tarefa"
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
