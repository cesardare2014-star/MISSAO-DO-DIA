import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { AVATARS } from '../types';

export default function ChildSelect() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl mb-3"
        >🎮</motion.div>
        <h2 className="text-3xl font-bungee text-outline text-white mb-1">QUEM ESTÁ JOGANDO?</h2>
        <p className="text-purple-300/40 text-sm font-bold">Escolha seu avatar</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-3 mb-10">
        {state.children.map((child, i) => {
          const avatarData = AVATARS.find(a => a.id === child.avatar);
          return (
            <motion.button
              key={child.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 12 }}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/child/${child.id}`)}
              className="card-brawl w-full p-5 rounded-2xl bg-purple-900/50 flex items-center gap-4 hover:border-purple-400/40 transition-colors"
            >
              <div className="text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">{avatarData?.emoji}</div>
              <div className="flex-1 text-left">
                <p className="text-white font-bungee text-lg text-outline-sm">{child.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-yellow-400 font-extrabold text-sm bg-yellow-500/15 px-2 py-0.5 rounded-lg border border-yellow-500/20">⭐ {child.points ?? 0}</span>
                  {child.streak > 0 && (
                    <span className="text-orange-400 font-extrabold text-sm bg-orange-500/15 px-2 py-0.5 rounded-lg border border-orange-500/20">🔥 {child.streak}</span>
                  )}
                </div>
              </div>
              <span className="text-purple-400/30 text-2xl">→</span>
            </motion.button>
          );
        })}
        {state.children.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👶</div>
            <p className="text-purple-300/50 font-bold">Nenhum perfil cadastrado</p>
            <p className="text-purple-300/30 text-sm mt-1 font-bold">Peça aos pais para criar perfis</p>
          </div>
        )}
      </div>

      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}
        className="text-purple-400/40 hover:text-purple-300 transition-colors text-sm font-bold"
      >← Voltar</motion.button>
    </div>
  );
}