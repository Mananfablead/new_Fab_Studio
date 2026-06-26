import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addWatermarkToImage, shouldApplyWatermark } from '@/lib/watermark';

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

interface WatermarkContextType {
  watermarkEnabled: boolean;
  watermarkImage: string | null;
  watermarkText: string;
  watermarkType: 'image' | 'text';
  watermarkPosition: WatermarkPosition;
  watermarkOpacity: number;
  watermarkScale: number;
  isTiled: boolean;
  setWatermarkEnabled: (enabled: boolean) => void;
  setWatermarkImage: (image: string | null) => void;
  setWatermarkText: (text: string) => void;
  setWatermarkType: (type: 'image' | 'text') => void;
  setWatermarkPosition: (pos: WatermarkPosition) => void;
  setWatermarkOpacity: (opacity: number) => void;
  setWatermarkScale: (scale: number) => void;
  setIsTiled: (tiled: boolean) => void;
  applyWatermark: (originalImageUrl: string) => Promise<string | null>;
}

const WatermarkContext = createContext<WatermarkContextType | undefined>(undefined);

export function WatermarkProvider({ children }: { children: ReactNode }) {
  const [watermarkEnabled, setWatermarkEnabledState] = useState<boolean>(false);

  const [watermarkImage, setWatermarkImageState] = useState<string | null>(null);

  const [watermarkText, setWatermarkTextState] = useState<string>('© PhotoFab Studio');

  const [watermarkType, setWatermarkTypeState] = useState<'image' | 'text'>('image');

  const [watermarkPosition, setWatermarkPositionState] = useState<WatermarkPosition>('bottom-right');

  const [watermarkOpacity, setWatermarkOpacityState] = useState<number>(50);

  const [watermarkScale, setWatermarkScaleState] = useState<number>(20);

  const [isTiled, setIsTiledState] = useState<boolean>(false);

  // Wrapper functions that only persist to localStorage when watermark is enabled
  const setWatermarkEnabled = (enabled: boolean) => {
    setWatermarkEnabledState(enabled);
    if (enabled) {
      localStorage.setItem('watermarkEnabled', JSON.stringify(true));
    } else {
      localStorage.removeItem('watermarkEnabled');
    }
  };

  const setWatermarkText = (text: string) => {
    setWatermarkTextState(text);
    if (watermarkEnabled) {
      localStorage.setItem('watermarkText', text);
    }
  };

  const setWatermarkType = (type: 'image' | 'text') => {
    setWatermarkTypeState(type);
    if (watermarkEnabled) {
      localStorage.setItem('watermarkType', type);
    }
  };

  const setWatermarkPosition = (pos: WatermarkPosition) => {
    setWatermarkPositionState(pos);
    if (watermarkEnabled) {
      localStorage.setItem('watermarkPosition', pos);
    }
  };

  const setWatermarkOpacity = (opacity: number) => {
    setWatermarkOpacityState(opacity);
    if (watermarkEnabled) {
      localStorage.setItem('watermarkOpacity', JSON.stringify(opacity));
    }
  };

  const setWatermarkScale = (scale: number) => {
    setWatermarkScaleState(scale);
    if (watermarkEnabled) {
      localStorage.setItem('watermarkScale', JSON.stringify(scale));
    }
  };

  const setIsTiled = (tiled: boolean) => {
    setIsTiledState(tiled);
    if (watermarkEnabled) {
      localStorage.setItem('isTiled', JSON.stringify(tiled));
    }
  };

  const setWatermarkImage = (image: string | null) => {
    setWatermarkImageState(image);
    if (watermarkEnabled) {
      if (image) {
        localStorage.setItem('watermarkImage', image);
      } else {
        localStorage.removeItem('watermarkImage');
      }
    }
  };

  // Load settings from localStorage only on mount
  useEffect(() => {
    // Do NOT restore watermarkEnabled from localStorage — the group page
    // always sets the correct value based on group.enableWatermark.
    // Only restore style settings (text, type, position, etc.) which are
    // safe to pre-load regardless of enabled state.
    const savedText = localStorage.getItem('watermarkText');
    if (savedText) setWatermarkTextState(savedText);

    const savedType = localStorage.getItem('watermarkType') as 'image' | 'text';
    if (savedType) setWatermarkTypeState(savedType);

    const savedPosition = localStorage.getItem('watermarkPosition') as WatermarkPosition;
    if (savedPosition) setWatermarkPositionState(savedPosition);

    const savedOpacity = localStorage.getItem('watermarkOpacity');
    if (savedOpacity) setWatermarkOpacityState(JSON.parse(savedOpacity));

    const savedScale = localStorage.getItem('watermarkScale');
    if (savedScale) setWatermarkScaleState(JSON.parse(savedScale));

    const savedTiled = localStorage.getItem('isTiled');
    if (savedTiled) setIsTiledState(JSON.parse(savedTiled));

    const savedImage = localStorage.getItem('watermarkImage');
    if (savedImage) setWatermarkImageState(savedImage);
  }, []);

  // Function to apply watermark to an image
  const applyWatermark = async (originalImageUrl: string): Promise<string | null> => {
    if (!watermarkEnabled || (watermarkType === 'image' && !watermarkImage) || (watermarkType === 'text' && !watermarkText)) {
      return null;
    }

    try {
      const watermarkedImage = await addWatermarkToImage(
        originalImageUrl,
        watermarkType === 'image' ? watermarkImage! : watermarkText,
        {
          position: watermarkPosition,
          opacity: watermarkOpacity / 100,
          scale: watermarkScale / 100,
          isTiled,
          type: watermarkType
        }
      );
      return watermarkedImage;
    } catch (error) {
      console.error('Error applying watermark:', error);
      return null;
    }
  };

  return (
    <WatermarkContext.Provider
      value={{
        watermarkEnabled,
        watermarkImage,
        watermarkText,
        watermarkType,
        watermarkPosition,
        watermarkOpacity,
        watermarkScale,
        isTiled,
        setWatermarkEnabled,
        setWatermarkImage,
        setWatermarkText,
        setWatermarkType,
        setWatermarkPosition,
        setWatermarkOpacity,
        setWatermarkScale,
        setIsTiled,
        applyWatermark,
      }}
    >
      {children}
    </WatermarkContext.Provider>
  );
}

export function useWatermark() {
  const context = useContext(WatermarkContext);
  if (!context) throw new Error('useWatermark must be used within WatermarkProvider');
  return context;
}
