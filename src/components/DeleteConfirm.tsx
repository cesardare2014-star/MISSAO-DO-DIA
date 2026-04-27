import { motion } from 'framer-motion';

interface DeleteConfirmProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ title, message, confirmLabel = 'Excluir', onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-gradient-to-b from-[#2a1545] to-[#140d35] border-4 border-red-500/40 rounded-3xl p-6 text-center"
        style={{ boxShadow: '0 0 40px rgba(239,68,68,0.2), 0 4px 0 rgba(0,0,0,0.4)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl mb-4"
        >⚠️</motion.div>
        <h3 className="text-xl font-bungee text-red-400 text-outline mb-2">{title}</h3>
        <p className="text-purple-300/60 text-sm font-bold mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="btn-3d flex-1 py-3 rounded-xl bg-purple-900/60 border-2 border-purple-500/30 text-purple-300 font-extrabold"
          >Cancelar</motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            className="btn-3d flex-1 py-3 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-extrabold border-2 border-red-400/40"
          >{confirmLabel}</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}