import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import DeleteConfirm from '../components/DeleteConfirm';

export default function ParentSettings() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChangePin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) { setPinMsg('PIN deve ter 4 dígitos'); return; }
    if (newPin !== confirmPin) { setPinMsg('PINs não conferem'); return; }
    dispatch({ type: 'SET_PIN', payload: newPin });
    setPinMsg('PIN alterado com sucesso! ✅'); setNewPin(''); setConfirmPin('');
    setTimeout(() => setPinMsg(''), 3000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_PROGRESS' });
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen p-5 pb-8 bg-pattern stripes-pattern"
      style={{ background: 'linear-gradient(160deg, #0a0520 0%, #150a35 30%, #0d0830 60%, #0a0520 100%)' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/parent')}
            className="btn-3d w-11 h-11 rounded-xl bg-purple-800/60 border-2 border-purple-500/30 flex items-center justify-center text-purple-300">←</motion.button>
          <h1 className="text-2xl font-bungee text-outline text-white">CONFIG</h1>
        </div>

        <div className="space-y-5">
          {/* Theme */}
          <div className="card-brawl p-5 rounded-2xl bg-purple-900/50">
            <h3 className="text-white font-bungee text-outline-sm mb-3">🎨 TEMA</h3>
            <div className="flex gap-3">
              <button onClick={() => state.theme === 'light' && dispatch({ type: 'TOGGLE_THEME' })}
                className={`btn-3d flex-1 py-3 rounded-xl font-extrabold text-sm border-2 ${
                  state.theme === 'dark' ? 'bg-gradient-to-b from-purple-500 to-purple-700 text-white border-purple-400/40' : 'bg-purple-900/30 border-purple-500/20 text-purple-300/60'
                }`}>🌙 Escuro</button>
              <button onClick={() => state.theme === 'dark' && dispatch({ type: 'TOGGLE_THEME' })}
                className={`btn-3d flex-1 py-3 rounded-xl font-extrabold text-sm border-2 ${
                  state.theme === 'light' ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white border-amber-300/40' : 'bg-purple-900/30 border-purple-500/20 text-purple-300/60'
                }`}>☀️ Claro</button>
            </div>
          </div>

          {/* PIN */}
          <div className="card-brawl p-5 rounded-2xl bg-purple-900/50">
            <h3 className="text-white font-bungee text-outline-sm mb-3">🔐 ALTERAR PIN</h3>
            <div className="space-y-3">
              <input type="tel" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Novo PIN (4 dígitos)" className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white placeholder-purple-400/30 outline-none focus:border-purple-400/60 font-bold" />
              <input type="tel" maxLength={4} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirmar PIN" className="w-full px-4 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-white placeholder-purple-400/30 outline-none focus:border-purple-400/60 font-bold" />
              {pinMsg && <p className={`text-sm font-bold ${pinMsg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{pinMsg}</p>}
              <button onClick={handleChangePin} className="btn-3d w-full py-3 rounded-xl bg-gradient-to-b from-purple-500 to-violet-600 text-white font-extrabold border-2 border-purple-400/40">Alterar PIN</button>
            </div>
          </div>

          {/* Premium */}
          <div className="card-brawl p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bungee text-outline-sm">⭐ PREMIUM</h3>
                <p className="text-amber-300/60 text-sm font-bold mt-1">{state.isPremium ? 'Ativo ✅' : 'Gratuito — até 2 crianças e 5 tarefas'}</p>
              </div>
              {!state.isPremium && (
                <button onClick={() => navigate('/premium')} className="btn-3d px-4 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 text-purple-950 font-extrabold text-sm border-2 border-amber-300/40">Upgrade</button>
              )}
            </div>
          </div>

          {/* Reset */}
          <div className="card-brawl p-5 rounded-2xl bg-red-900/15 border-red-500/25">
            <h3 className="text-red-400 font-bungee text-outline-sm mb-2">⚠️ ZONA DE PERIGO</h3>
            <p className="text-red-300/40 text-sm font-bold mb-3">Resetar todo o progresso das crianças (pontos, streaks, acessórios). Perfis e tarefas NÃO serão excluídos.</p>
            <button onClick={() => setShowResetConfirm(true)}
              className="btn-3d w-full py-3 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-extrabold">Resetar Progresso</button>
          </div>
        </div>
      </div>

      {/* Reset confirmation */}
      <AnimatePresence>
        {showResetConfirm && (
          <DeleteConfirm
            title="RESETAR PROGRESSO"
            message="Tem certeza que deseja resetar TODO o progresso? Todos os pontos, streaks, acessórios das crianças e registros de conclusão serão apagados. Os perfis e tarefas serão mantidos. Esta ação NÃO pode ser desfeita."
            confirmLabel="Resetar Tudo"
            onConfirm={handleReset}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
