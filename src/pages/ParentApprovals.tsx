import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import DeleteConfirm from '../components/DeleteConfirm';
import type { TaskCompletion } from '../types';

const AVATAR_MAP: Record<string, string> = {
  lion: '🦁', bear: '🐻', fox: '🦊', rabbit: '🐰', owl: '🦉',
  cat: '🐱', dog: '🐶', panda: '🐼', unicorn: '🦄', dino: '🦕',
};

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all';

export default function ParentApprovals() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [deleteTarget, setDeleteTarget] = useState<TaskCompletion | null>(null);

  const filtered = filter === 'all'
    ? state.completions
    : state.completions.filter(c => c.status === filter);

  const pending = state.completions.filter(c => c.status === 'pending');

  const handleApprove = (id: string) => {
    dispatch({ type: 'APPROVE_COMPLETION', payload: id });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a855f7', '#eab308', '#22c55e', '#3b82f6'] });
  };

  const handleReject = (id: string) => {
    dispatch({ type: 'REJECT_COMPLETION', payload: id });
  };

  const handleBatchApprove = () => {
    const ids = pending.map(c => c.id);
    dispatch({ type: 'BATCH_APPROVE', payload: ids });
    confetti({ particleCount: 250, spread: 120, origin: { y: 0.5 }, colors: ['#a855f7', '#eab308', '#22c55e', '#3b82f6', '#ec4899', '#f97316'] });
  };

  const handleDeleteCompletion = () => {
    if (deleteTarget) {
      dispatch({ type: 'DELETE_COMPLETION', payload: deleteTarget.id });
      setDeleteTarget(null);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: '⏳ Aguardando',
    approved: '✅ Aprovada',
    rejected: '❌ Rejeitada',
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
    approved: 'bg-green-500/15 border-green-500/30 text-green-400',
    rejected: 'bg-red-500/15 border-red-500/30 text-red-400',
  };

  return (
    <div className="min-h-screen p-5 pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/parent')}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">←</motion.button>
          <h1 className="text-2xl font-bungee text-outline text-white">APROVAÇÕES</h1>
          {pending.length > 0 && (
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
              className="px-3 py-1 rounded-full bg-yellow-500 text-purple-950 text-sm font-extrabold">{pending.length}</motion.span>
          )}
        </div>

        {/* Batch approve */}
        {pending.length > 1 && filter === 'pending' && (
          <motion.button
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleBatchApprove}
            className="btn-3d w-full mb-5 py-4 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 text-white font-bungee text-lg border-4 border-green-300/40 text-outline-sm"
          >✅ APROVAR TODAS ({pending.length})</motion.button>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {([
            { key: 'pending' as const, label: '⏳ Aguardando', count: state.completions.filter(c => c.status === 'pending').length },
            { key: 'approved' as const, label: '✅ Aprovadas', count: state.completions.filter(c => c.status === 'approved').length },
            { key: 'rejected' as const, label: '❌ Rejeitadas', count: state.completions.filter(c => c.status === 'rejected').length },
            { key: 'all' as const, label: '📋 Todas', count: state.completions.length },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border-2 flex items-center gap-1.5 ${
                filter === f.key
                  ? 'bg-purple-500/30 border-purple-400/50 text-white'
                  : 'bg-purple-900/20 border-purple-500/15 text-purple-300/40'
              }`}
            >{f.label} <span className="text-[10px] opacity-60">({f.count})</span></button>
          ))}
        </div>

        {/* Completions list */}
        <div className="space-y-3">
          {filtered.map(comp => {
            const child = state.children.find(c => c.id === comp.childId);
            const task = state.tasks.find(t => t.id === comp.taskId);
            const avatar = child ? AVATAR_MAP[child.avatar] || '🦁' : '🦁';

            return (
              <motion.div key={comp.id} layout
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="card-brawl p-4 rounded-2xl bg-purple-900/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl drop-shadow-lg">{avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-extrabold text-outline-sm truncate">{child?.name || 'Criança removida'}</p>
                    <p className="text-purple-300/50 text-sm font-bold truncate">{task?.icon} {task?.name || 'Tarefa removida'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${statusColor[comp.status]}`}>
                      {statusLabel[comp.status]}
                    </span>
                    {task && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-extrabold bg-yellow-500/15 border border-yellow-500/25 text-yellow-400">
                        +{task.points} ⭐
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {comp.status === 'pending' && (
                    <>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(comp.id)}
                        className="btn-3d flex-1 py-2.5 rounded-xl bg-gradient-to-b from-green-400 to-emerald-600 text-white font-extrabold border-2 border-green-300/40 text-sm"
                      >✅ Aprovar</motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(comp.id)}
                        className="btn-3d flex-1 py-2.5 rounded-xl bg-purple-900/50 border-2 border-red-500/30 text-red-400 font-extrabold text-sm"
                      >❌ Rejeitar</motion.button>
                    </>
                  )}
                  {comp.status === 'rejected' && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(comp.id)}
                      className="btn-3d flex-1 py-2.5 rounded-xl bg-gradient-to-b from-green-400 to-emerald-600 text-white font-extrabold border-2 border-green-300/40 text-sm"
                    >✅ Aprovar Mesmo Assim</motion.button>
                  )}
                  <motion.button whileTap={{ scale: 0.85 }}
                    onClick={() => setDeleteTarget(comp)}
                    className="btn-3d w-10 h-10 rounded-xl bg-red-500/15 border-2 border-red-500/25 flex items-center justify-center text-lg hover:bg-red-500/25 transition-colors shrink-0"
                    title="Excluir registro"
                  >🗑️</motion.button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-4">{filter === 'pending' ? '🎉' : filter === 'approved' ? '✅' : filter === 'rejected' ? '📭' : '📋'}</motion.div>
              <p className="text-purple-300/50 font-bungee text-lg">
                {filter === 'pending' ? 'Tudo em dia!' : filter === 'approved' ? 'Nenhuma aprovada' : filter === 'rejected' ? 'Nenhuma rejeitada' : 'Nenhum registro'}
              </p>
              <p className="text-purple-300/30 text-sm mt-1 font-bold">
                {filter === 'pending' ? 'Nenhuma tarefa aguardando aprovação' : 'Altere o filtro para ver outros registros'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            title="EXCLUIR REGISTRO"
            message="Tem certeza que deseja excluir este registro de conclusão? Esta ação não pode ser desfeita e os pontos já creditados não serão removidos automaticamente."
            confirmLabel="Excluir Registro"
            onConfirm={handleDeleteCompletion}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
