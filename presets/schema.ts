import type { RingPatternConfig } from '@bauhaus/rings';

export interface Preset {
  /** Unique identifier (filename without .json) */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Pattern configuration */
  config: RingPatternConfig;
  /** When this preset was created */
  createdAt: string;
  /** Tags for organization */
  tags?: string[];
}

export type PresetFile = Omit<Preset, 'id'>;
