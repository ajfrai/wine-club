'use client';

import { GoogleMapsProvider } from '@/components/providers/GoogleMapsProvider';
import { PersonalInfoForm } from './PersonalInfoForm';

export const PersonalInfoWrapper: React.FC = () => {
  return (
    <GoogleMapsProvider>
      <PersonalInfoForm />
    </GoogleMapsProvider>
  );
};
