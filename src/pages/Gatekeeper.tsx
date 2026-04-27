import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Gatekeeper() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      {/* Floating stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['⭐','✨','💫','⭐','✨'].map((s, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{ left: `${15 + i * 18}%`, top: `${10 + (i % 3) * 30}%` }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            {s}
          </motion.div>
        ))}
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/15 blur-[100px]" />
        <div className="absolute top-[40%] right-[-5%] w-[25%] h-[25%] rounded-full bg-yellow-500/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
        className="relative z-10 text-center mb-14"
      >
        {/* Logo star */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative inline-block mb-4"
        >
          <div className="text-8xl drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">⭐</div>
          <motion.div
            className="absolute inset-0 text-8xl"
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-3 leading-tight">
          MISSÃO
        </h1>
        <h1 className="text-5xl md:text-6xl font-bungee text-outline-gold bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent mb-4 leading-tight">
          DO DIA
        </h1>
        <p className="text-lg text-purple-200/60 font-bold tracking-wide">
          ⚡ Conquiste missões. Ganhe recompensas! ⚡
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 w-full max-w-sm space-y-5"
      >
        {/* Child button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/child-select')}
          className="btn-3d w-full py-6 px-8 rounded-2xl font-extrabold text-xl bg-gradient-to-b from-yellow-400 via-amber-400 to-amber-600 text-purple-950 border-4 border-amber-300/50 relative overflow-hidden shimmer-sweep"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="text-3xl">🎮</span>
            <span className="text-outline-sm">ENTRAR COMO CRIANÇA</span>
          </span>
        </motion.button>

        {/* Parent button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/parent-login')}
          className="btn-3d w-full py-6 px-8 rounded-2xl font-extrabold text-xl bg-gradient-to-b from-purple-500 via-purple-600 to-purple-800 text-white border-4 border-purple-400/40 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="text-3xl">🔒</span>
            <span className="text-outline-sm">ÁREA DOS PAIS</span>
          </span>
        </motion.button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 mt-12 text-sm text-purple-300/30 font-bold"
      >
        v1.0 — Feito com ❤️ para famílias
      </motion.p>
    </div>
  );
}