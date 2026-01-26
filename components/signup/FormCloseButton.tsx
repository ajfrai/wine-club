'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FormCloseButtonProps {
  onClick: () => void;
}

export const FormCloseButton: React.FC<FormCloseButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="fixed top-6 right-6 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 group"
      aria-label="Close form"
    >
      <ChevronDown className="w-6 h-6 text-sunburst-600 group-hover:text-sunburst-700 transition-colors" />
    </motion.button>
  );
};
