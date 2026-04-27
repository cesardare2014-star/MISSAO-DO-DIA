import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function Premium() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const handleActivate = () => {
    dispatch({ type: 'SET_PREMIUM', payload: true });
    navigate('/parent/settings');
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #1a0a35 30%, #150a30 60%, #0a0520 100%)' }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-5"
          style={{ background: 'conic-gradient(from 0deg, #eab308, #a855f7, #3b82f6, #22c55e, #eab308)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-4 drop-shadow-[0_0_40px_rgba(234,179,8,0.5)]"
          >👑</motion.div>
          <h1 className="text-4xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
            PREMIUM
          </h1>
          <p className="text-purple-200/50 font-bold">Desbloqueie todo o potencial!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-brawl bg-gradient-to-br from-amber-900/20 to-purple-900/20 border-amber-500/25 rounded-3xl p-6 mb-6"
        >
          <div className="space-y-4">
            {[
              { icon: '👶', text: 'Crianças ilimitadas', desc: 'Sem limite de perfis' },
              { icon: '📋', text: 'Tarefas ilimitadas', desc: 'Crie quantas missões quiser' },
              { icon: '📊', text: 'Relatórios avançados', desc: 'Acompanhe o progresso' },
              { icon: '🏰', text: 'Baú da Família', desc: 'Metas coletivas' },
              { icon: '🎩', text: 'Acessórios de Avatar', desc: 'Personalize personagens' },
              { icon: '✨', text: 'Sugestões com IA', desc: 'Tarefas por idade' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <p className="text-white font-extrabold text-outline-sm">{feature.text}</p>
                  <p className="text-purple-300/40 text-sm font-bold">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="mb-4">
            <span className="text-purple-300/30 line-through text-lg font-bold">R$ 19,90/mês</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 to-amber-500 bg-clip-text text-transparent">R$ 9,90</span>
              <span className="text-purple-300/50 font-bold">/mês</span>
            </div>
          </div>

          <div className="card-brawl bg-green-500/10 border-green-500/25 rounded-2xl p-3 mb-6">
            <p className="text-green-400 font-extrabold text-sm">🎁 7 dias grátis — cancele quando quiser!</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleActivate}
            className="btn-3d w-full py-5 rounded-2xl bg-gradient-to-b from-yellow-400 via-amber-400 to-amber-600 text-purple-950 font-bungee text-xl border-4 border-amber-300/50 text-outline-sm shimmer-sweep relative overflow-hidden mb-4"
          >COMEÇAR TESTE GRÁTIS ✨</motion.button>

          <button onClick={() => navigate(-1)}
            className="text-purple-400/40 hover:text-purple-300 text-sm transition-colors font-bold"
          >Talvez depois</button>
        </motion.div>
      </div>
    </div>
  );
}