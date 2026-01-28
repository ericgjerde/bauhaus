import { create } from 'zustand';
import { DEFAULT_CONFIG, type RingPatternConfig } from '@bauhaus/rings';
import { DEFAULT_SQUARE_CONFIG, type SquarePatternConfig } from '@bauhaus/squares';
import { DEFAULT_POLYGON_CONFIG, type PolygonPatternConfig } from '@bauhaus/polygons';
import { DEFAULT_SPIRAL_CONFIG, type SpiralPatternConfig } from '@bauhaus/spirals';

export type PatternType = 'rings' | 'squares' | 'polygons' | 'spirals';

interface PatternState {
  // Current pattern type
  patternType: PatternType;

  // Pattern configurations (one for each type)
  ringConfig: RingPatternConfig;
  squareConfig: SquarePatternConfig;
  polygonConfig: PolygonPatternConfig;
  spiralConfig: SpiralPatternConfig;

  // Export settings
  kerfAllowance: number;
  exportUnit: 'inches' | 'mm';

  // UI state - zoom >= 1 (fit to screen minimum)
  zoom: number;
  panX: number;
  panY: number;

  // Actions
  setPatternType: (type: PatternType) => void;
  setRingConfig: (updates: Partial<RingPatternConfig>) => void;
  setSquareConfig: (updates: Partial<SquarePatternConfig>) => void;
  setPolygonConfig: (updates: Partial<PolygonPatternConfig>) => void;
  setSpiralConfig: (updates: Partial<SpiralPatternConfig>) => void;
  setKerfAllowance: (kerf: number) => void;
  setExportUnit: (unit: 'inches' | 'mm') => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  resetConfig: () => void;

  // Legacy compatibility
  config: RingPatternConfig;
  setConfig: (updates: Partial<RingPatternConfig>) => void;
}

export const usePatternStore = create<PatternState>((set, get) => ({
  patternType: 'rings',

  ringConfig: { ...DEFAULT_CONFIG },
  squareConfig: { ...DEFAULT_SQUARE_CONFIG },
  polygonConfig: { ...DEFAULT_POLYGON_CONFIG },
  spiralConfig: { ...DEFAULT_SPIRAL_CONFIG },

  kerfAllowance: 0,
  exportUnit: 'inches',
  zoom: 1,
  panX: 0,
  panY: 0,

  setPatternType: (patternType) => set({ patternType }),

  setRingConfig: (updates) =>
    set((state) => ({
      ringConfig: { ...state.ringConfig, ...updates },
    })),

  setSquareConfig: (updates) =>
    set((state) => ({
      squareConfig: { ...state.squareConfig, ...updates },
    })),

  setPolygonConfig: (updates) =>
    set((state) => ({
      polygonConfig: { ...state.polygonConfig, ...updates },
    })),

  setSpiralConfig: (updates) =>
    set((state) => ({
      spiralConfig: { ...state.spiralConfig, ...updates },
    })),

  setKerfAllowance: (kerfAllowance) => set({ kerfAllowance }),

  setExportUnit: (exportUnit) => set({ exportUnit }),

  // Minimum zoom is 1 (fit to screen), max is 5
  setZoom: (zoom) => set({ zoom: Math.max(1, Math.min(5, zoom)) }),

  setPan: (panX, panY) => set({ panX, panY }),

  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),

  resetConfig: () => {
    const patternType = get().patternType;
    switch (patternType) {
      case 'rings':
        set({ ringConfig: { ...DEFAULT_CONFIG } });
        break;
      case 'squares':
        set({ squareConfig: { ...DEFAULT_SQUARE_CONFIG } });
        break;
      case 'polygons':
        set({ polygonConfig: { ...DEFAULT_POLYGON_CONFIG } });
        break;
      case 'spirals':
        set({ spiralConfig: { ...DEFAULT_SPIRAL_CONFIG } });
        break;
    }
  },

  // Legacy compatibility - maps to ringConfig
  get config() {
    return get().ringConfig;
  },

  setConfig: (updates) =>
    set((state) => ({
      ringConfig: { ...state.ringConfig, ...updates },
    })),
}));
