import type { RingPatternConfig } from '@bauhaus/rings';

export interface Preset {
  id: string;
  name: string;
  description?: string;
  config: RingPatternConfig;
  createdAt: string;
  tags?: string[];
}

// Load all preset JSON files from the presets directory
const presetModules = import.meta.glob<{
  name: string;
  description?: string;
  config: RingPatternConfig;
  createdAt: string;
  tags?: string[];
}>('../../../presets/*.json', { eager: true });

// Convert to Preset array with IDs derived from filenames
export const builtInPresets: Preset[] = Object.entries(presetModules).map(
  ([path, module]) => {
    const filename = path.split('/').pop()?.replace('.json', '') || 'unknown';
    return {
      id: filename,
      name: module.name,
      description: module.description,
      config: module.config,
      createdAt: module.createdAt,
      tags: module.tags,
    };
  }
);

/**
 * Save a preset to the presets directory (dev mode only)
 */
export async function savePreset(preset: Omit<Preset, 'id'>): Promise<{ id: string } | { error: string }> {
  // Generate ID from name
  const id = preset.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  try {
    const response = await fetch('/api/presets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, preset }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { error };
    }

    return { id };
  } catch (err) {
    return { error: String(err) };
  }
}
