'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplitPanel } from './SplitPanel';
import { FormCloseButton } from './FormCloseButton';
import { HostForm } from './HostForm';
import { MemberForm } from './MemberForm';
import type { HostSignupData, MemberSignupData } from '@/types/auth.types';

type PanelState = 'collapsed' | 'host' | 'member';

interface SignupContainerProps {
  onHostSignup: (data: HostSignupData) => Promise<void>;
  onMemberSignup: (data: MemberSignupData) => Promise<void>;
  isLoading?: boolean;
}

export const SignupContainer: React.FC<SignupContainerProps> = ({
  onHostSignup,
  onMemberSignup,
  isLoading = false,
}) => {
  const [panelState, setPanelState] = useState<PanelState>('collapsed');

  const handleHostClick = () => {
    setPanelState('host');
  };

  const handleMemberClick = () => {
    setPanelState('member');
  };

  const handleClose = () => {
    setPanelState('collapsed');
  };

  return (
    <div className="relative h-screen w-full flex overflow-hidden">
      {/* Host Panel */}
      <SplitPanel
        title="Become a Host"
        subtitle="Start your own wine club"
        gradientFrom="rgb(92, 41, 49)"
        gradientTo="rgb(127, 29, 29)"
        isExpanded={panelState === 'host'}
        isHidden={panelState === 'member'}
        onClick={handleHostClick}
      >
        <HostForm onSubmit={onHostSignup} isLoading={isLoading} />
      </SplitPanel>

      {/* Member Panel */}
      <SplitPanel
        title="Become a Member"
        subtitle="Join a wine club near you"
        gradientFrom="rgb(232, 213, 213)"
        gradientTo="rgb(254, 202, 202)"
        isExpanded={panelState === 'member'}
        isHidden={panelState === 'host'}
        onClick={handleMemberClick}
      >
        <MemberForm onSubmit={onMemberSignup} isLoading={isLoading} />
      </SplitPanel>

      {/* Close Button */}
      <AnimatePresence>
        {panelState !== 'collapsed' && (
          <FormCloseButton onClick={handleClose} />
        )}
      </AnimatePresence>
    </div>
  );
};
