/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*EyeTrackingContext' {
  import React from 'react';

  export interface CursorPosition {
    x: number;
    y: number;
  }

  export interface EyeStatus {
    left: string;
    right: string;
  }

  export interface EyeTrackingContextType {
    isEnabled: boolean;
    setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    cursorPos: CursorPosition;
    eyeStatus: EyeStatus;
    isLoading: boolean;
    error: string | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    selectedEye: string;
    setSelectedEye: (eye: string) => void;
    isEyeClosed: (eye: 'left' | 'right') => boolean;
  }

  export interface EyeTrackingProviderProps {
    children: React.ReactNode;
    trackedEye?: 'left' | 'right';
  }

  export const EyeTrackingProvider: React.FC<EyeTrackingProviderProps>;
  export const useEyeTracking: () => EyeTrackingContextType;
  export default EyeTrackingProvider;
}
