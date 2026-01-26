'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

interface SplitPanelProps {
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  isExpanded: boolean;
  isHidden: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const panelVariants: Variants = {
  collapsed: {
    width: '50%',
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  expanded: {
    width: '100%',
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
  hidden: {
    width: '0%',
    opacity: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const formVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.3 },
  },
};

export const SplitPanel: React.FC<SplitPanelProps> = ({
  title,
  subtitle,
  gradientFrom,
  gradientTo,
  isExpanded,
  isHidden,
  onClick,
  children,
}) => {
  const variant = isHidden ? 'hidden' : isExpanded ? 'expanded' : 'collapsed';

  return (
    <motion.div
      variants={panelVariants}
      animate={variant}
      initial="collapsed"
      className={`relative h-full overflow-hidden ${isHidden ? 'pointer-events-none' : ''}`}
      style={{
        background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      {/* Collapsed View - Click Target */}
      {!isExpanded && !isHidden && (
        <div
          onClick={onClick}
          className="h-full w-full flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-lg md:text-xl text-white text-opacity-90">
              {subtitle}
            </p>
          </motion.div>
        </div>
      )}

      {/* Expanded View - Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="h-full w-full overflow-y-auto p-8 md:p-12"
          >
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {title}
                </h2>
                <p className="text-lg text-white text-opacity-90">
                  {subtitle}
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
