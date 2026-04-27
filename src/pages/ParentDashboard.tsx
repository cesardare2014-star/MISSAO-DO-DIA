import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const menuItems = [
  { icon: '👶', label: 'Filhos', path: '/parent/children', gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/20' },
  { icon: '📋', label: 'Tarefas', path: '/parent/tasks', gradient: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/20' },
  { icon: '🎁', label: 'Recompensas', path: '/parent/rewards', gradient: 'from-purple-500 to-violet-600', glow: 'shadow-purple-500/20' },
  { icon: '✅', label: 'Aprovações', path: '/parent/approvals', gradient: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/20' },
  { icon: '🏰', label: 'Baú Família', path: '/parent/family-chest', gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
  { icon: '⚙️', label: 'Config', path: '/parent/settings', gradient: 'from-gray-500 to-slate-600', glow: 'shadow-gray-500/20' },
];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const pendingCount = state.completions.filter(c => c.status === 'pending').length;

  return (
    <div className="min-h-screen p-5 pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bungee text-outline text-white">ÁREA DOS PAIS</h1>
            <p className="text-purple-300/40 text-sm font-bold">Gerencie a família ⚡</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300 hover:bg-purple-700/60 transition-colors"
          >
            ✕
          </motion.button>
        </div>

        {/* Pending alert */}
        {pendingCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/parent/approvals')}
            className="btn-3d w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 border-4 border-green-400/40 flex items-center gap-3"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl"
            >
              🔔
            </motion.span>
            <div className="text-left">
              <p className="text-white font-extrabold text-outline-sm">{pendingCount} tarefa{pendingCount > 1 ? 's' : ''} aguardando!</p>
              <p className="text-green-200/70 text-sm font-bold">Toque para aprovar →</p>
            </div>
          </motion.button>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', damping: 12 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`btn-3d relative p-6 rounded-2xl bg-gradient-to-br ${item.gradient} border-4 border-white/15 overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
              <div className="relative z-10">
                <span className="text-4xl block mb-3 drop-shadow-lg">{item.icon}</span>
                <span className="text-white font-bungee text-sm text-outline-sm">{item.label}</span>
                {item.path === '/parent/approvals' && pendingCount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500 text-white text-xs font-extrabold flex items-center justify-center border-2 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  >
                    {pendingCount}
                  </motion.span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}