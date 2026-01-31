'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SplitPanel } from './SplitPanel';
import { FormCloseButton } from './FormCloseButton';
import { MemberForm } from './MemberForm';
import { ClubTypeSelection } from './ClubTypeSelection';
import { AuthForm } from './AuthForm';
import { ClubCreationForm } from './ClubCreationForm';
import type { MemberSignupData, ClubType } from '@/types/auth.types';
import type { ClubCreationFormData } from '@/lib/validations/club-creation.schema';

type PanelState = 'collapsed' | 'club-creation' | 'member';
type ClubCreationStep = 'club-type' | 'auth' | 'club-details';

interface SignupContainerProps {
  onAuth: (data: { fullName: string; email: string; password: string }) => Promise<void>;
  onLogin: (data: { email: string; password: string }) => Promise<void>;
  onClubCreation: (data: ClubCreationFormData) => Promise<void>;
  onMemberSignup: (data: MemberSignupData) => Promise<void>;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export const SignupContainer: React.FC<SignupContainerProps> = ({
  onAuth,
  onLogin,
  onClubCreation,
  onMemberSignup,
  isLoading = false,
  isAuthenticated = false,
}) => {
  const [panelState, setPanelState] = useState<PanelState>('collapsed');
  const [clubCreationStep, setClubCreationStep] = useState<ClubCreationStep>('club-type');
  const [selectedClubType, setSelectedClubType] = useState<ClubType | null>(null);

  const handleClubCreationClick = () => {
    console.log('[SignupContainer] Create Club panel clicked');
    setPanelState('club-creation');
    // If already authenticated, skip to club details
    if (isAuthenticated) {
      setClubCreationStep('club-type');
    } else {
      setClubCreationStep('club-type');
    }
  };

  const handleMemberClick = () => {
    console.log('[SignupContainer] Join Club panel clicked - expanding member form');
    setPanelState('member');
  };

  const handleClose = () => {
    setPanelState('collapsed');
    setClubCreationStep('club-type');
    setSelectedClubType(null);
  };

  const handleClubTypeSelect = (clubType: ClubType) => {
    console.log('[SignupContainer] Club type selected:', clubType);
    setSelectedClubType(clubType);
    if (isAuthenticated) {
      setClubCreationStep('club-details');
    } else {
      setClubCreationStep('auth');
    }
  };

  const handleAuthComplete = async (data: { fullName: string; email: string; password: string }) => {
    console.log('[SignupContainer] Auth complete, moving to club details');
    console.log('[SignupContainer] Current step before auth:', clubCreationStep);
    console.log('[SignupContainer] Selected club type:', selectedClubType);

    try {
      await onAuth(data);
      console.log('[SignupContainer] onAuth completed successfully');
      // After successful auth, move to club details step
      setClubCreationStep('club-details');
      console.log('[SignupContainer] Step changed to club-details');
    } catch (error) {
      console.error('[SignupContainer] Error in onAuth:', error);
      throw error;
    }
  };

  const handleLoginComplete = async (data: { email: string; password: string }) => {
    console.log('[SignupContainer] Login complete, moving to club details');
    console.log('[SignupContainer] Current step before login:', clubCreationStep);
    console.log('[SignupContainer] Selected club type:', selectedClubType);

    try {
      await onLogin(data);
      console.log('[SignupContainer] onLogin completed successfully');
      // After successful login, move to club details step
      setClubCreationStep('club-details');
      console.log('[SignupContainer] Step changed to club-details');
    } catch (error) {
      console.error('[SignupContainer] Error in onLogin:', error);
      throw error;
    }
  };

  const handleClubCreationComplete = async (data: ClubCreationFormData) => {
    console.log('[SignupContainer] Club creation initiated');
    console.log('[SignupContainer] Current step:', clubCreationStep);
    console.log('[SignupContainer] Selected club type:', selectedClubType);
    console.log('[SignupContainer] Club data:', data);

    try {
      await onClubCreation(data);
      console.log('[SignupContainer] onClubCreation completed successfully');
    } catch (error) {
      console.error('[SignupContainer] Error in onClubCreation:', error);
      throw error;
    }
  };

  console.log('[SignupContainer] Rendering with state:', {
    panelState,
    clubCreationStep,
    selectedClubType,
    isAuthenticated,
    isLoading,
  });

  return (
    <div className="relative h-screen w-full flex overflow-hidden">
      {/* Club Creation Panel */}
      <SplitPanel
        title="Create a Club"
        subtitle="Start your own wine club"
        gradientFrom="rgb(92, 41, 49)"
        gradientTo="rgb(127, 29, 29)"
        isExpanded={panelState === 'club-creation'}
        isHidden={panelState === 'member'}
        onClick={handleClubCreationClick}
      >
        <div className="h-full overflow-y-auto">
          {clubCreationStep === 'club-type' && (
            <>
              {console.log('[SignupContainer] Rendering ClubTypeSelection')}
              <ClubTypeSelection onSelect={handleClubTypeSelect} />
            </>
          )}
          {clubCreationStep === 'auth' && selectedClubType && (
            <>
              {console.log('[SignupContainer] Rendering AuthForm for club type:', selectedClubType)}
              <AuthForm
                clubType={selectedClubType}
                onSignup={handleAuthComplete}
                onLogin={handleLoginComplete}
                isLoading={isLoading}
              />
            </>
          )}
          {clubCreationStep === 'club-details' && selectedClubType && (
            <>
              {console.log('[SignupContainer] Rendering ClubCreationForm for club type:', selectedClubType)}
              <ClubCreationForm
                clubType={selectedClubType}
                onSubmit={handleClubCreationComplete}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </SplitPanel>

      {/* Member Panel */}
      <SplitPanel
        title="Join a Club"
        subtitle="Find a wine club near you"
        gradientFrom="rgb(220, 180, 180)"
        gradientTo="rgb(245, 140, 140)"
        isExpanded={panelState === 'member'}
        isHidden={panelState === 'club-creation'}
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
