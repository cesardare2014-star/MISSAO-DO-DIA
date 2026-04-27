import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

export default function ParentLogin() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { state } = useApp();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
    if (newPin.every(d => d !== '') && newPin.join('') === state.pin) {
      navigate('/parent');
    } else if (newPin.every(d => d !== '')) {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setPin(['', '', '', '']);
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="relative z-10 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          🔐
        </motion.div>
        <h2 className="text-3xl font-bungee text-outline text-white mb-2">ÁREA DOS PAIS</h2>
        <p className="text-purple-300/50 font-bold mb-8">Digite o PIN secreto</p>

        <motion.div
          animate={shake ? { x: [0, -15, 15, -15, 15, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="flex gap-4 justify-center mb-6"
        >
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="tel"
              maxLength={1}
              value={digit ? '●' : ''}
              onChange={e => handleChange(i, e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-16 h-20 text-center text-3xl font-extrabold rounded-2xl border-4 transition-all outline-none backdrop-blur-sm ${
                error
                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : digit
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-purple-900/30 border-purple-500/30 text-white'
              }`}
              autoFocus={i === 0}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm font-bold"
          >
            ❌ PIN incorreto!
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="mt-8 text-purple-400/50 hover:text-purple-300 transition-colors text-sm font-bold"
        >
          ← Voltar
        </motion.button>
      </motion.div>
    </div>
  );
}