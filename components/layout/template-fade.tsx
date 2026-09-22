'use client';
import { motion } from 'framer-motion';

/** Transição suave entre páginas (uma única entrada orquestrada, sem efeitos espalhados). */
export const TemplateFade = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>{children}</motion.div>
);
