import { HouseColorTheme, LandPlace, LandType, SkyDesign, TimeOfDay, TreeType, WeatherType } from '../types';

export const SAVE_GAME_STORAGE_KEY = 'dollhouse_saved_game';
export const ACTIVE_SLOT_PIN_KEY = 'dollhouse_active_slot_pin';
export const LOBBIES_INDEX_KEY = 'dollhouse_lobbies_index';
export const DEV_PASSWORD_KEY = 'dollhouse_dev_password';
export const DEFAULT_DEV_PASSWORD = '0000';

export interface SavedGameState {
  version: number;
  timestamp: number;
  slotPin?: string;
  // Sky
  customSkyColor: string | null;
  timeOfDay: TimeOfDay;
  skyDesign: SkyDesign;
  weather?: WeatherType;
  // Land & Nature
  customLandColor: string | null;
  landType: LandType;
  landPlace?: LandPlace | null;
  customWoodColor: string | null;
  customLeafColor: string | null;
  treeType?: TreeType;
  customCactusColor?: string | null;
  customBambooColor?: string | null;
  // Auto Time
  autoTimeEnabled: boolean;
  autoTimeMinutes: number;
  autoTimeSpeedMinutes: number;
  // Architecture / House Design
  houseTheme: HouseColorTheme;
  // Audio
  isSoundMuted?: boolean;
  // Player Outfit / Appearance Customization
  playerShirtColor?: string | null;
  playerPantsColor?: string | null;
  playerShoesColor?: string | null;
  playerHairColor?: string | null;
  playerSkinColor?: string | null;
  // Custom House Colors
  customHouseBlueColor?: string | null;
  customHouseWhiteColor?: string | null;
}

export function getSlotKey(pin: string): string {
  return `dollhouse_slot_${pin}`;
}

/**
 * Developer password helpers
 */
export function getDevPassword(): string {
  try {
    return localStorage.getItem(DEV_PASSWORD_KEY) || DEFAULT_DEV_PASSWORD;
  } catch {
    return DEFAULT_DEV_PASSWORD;
  }
}

export function setDevPassword(newPassword: string): boolean {
  try {
    localStorage.setItem(DEV_PASSWORD_KEY, newPassword);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to record lobby PIN into lobby index
 */
function recordLobbyPin(pin: string): void {
  try {
    const raw = localStorage.getItem(LOBBIES_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(pin)) {
      list.push(pin);
      localStorage.setItem(LOBBIES_INDEX_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

/**
 * Retrieves all registered lobby PINs with metadata.
 */
export function getAllLobbies(): {
  pin: string;
  timestamp: number;
  state: SavedGameState | null;
}[] {
  const pinsSet = new Set<string>();

  // 1. From index
  try {
    const raw = localStorage.getItem(LOBBIES_INDEX_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      list.forEach((p) => pinsSet.add(p));
    }
  } catch {
    // ignore
  }

  // 2. From localStorage keys scan
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dollhouse_slot_')) {
        const pin = key.replace('dollhouse_slot_', '');
        if (pin) pinsSet.add(pin);
      }
    }
  } catch {
    // ignore
  }

  const result: { pin: string; timestamp: number; state: SavedGameState | null }[] = [];
  pinsSet.forEach((pin) => {
    const data = loadGameSlot(pin);
    result.push({
      pin,
      timestamp: data?.timestamp || Date.now(),
      state: data,
    });
  });

  return result.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Deletes a specific lobby. Next time player joins with this PIN, it will restart fresh.
 */
export function deleteLobby(pin: string): boolean {
  try {
    localStorage.removeItem(getSlotKey(pin));

    // Remove from index
    const raw = localStorage.getItem(LOBBIES_INDEX_KEY);
    if (raw) {
      const list: string[] = JSON.parse(raw);
      const updated = list.filter((p) => p !== pin);
      localStorage.setItem(LOBBIES_INDEX_KEY, JSON.stringify(updated));
    }

    if (getActiveSlotPin() === pin) {
      setActiveSlotPin(null);
    }
    return true;
  } catch (err) {
    console.error('Failed to delete lobby:', err);
    return false;
  }
}

export const DEFAULT_SLOT_STATE: Omit<SavedGameState, 'version' | 'timestamp' | 'slotPin'> = {
  customSkyColor: null,
  timeOfDay: 'day',
  skyDesign: null,
  weather: null,
  customLandColor: null,
  landType: 'grass',
  landPlace: null,
  customWoodColor: null,
  customLeafColor: null,
  treeType: 'classic',
  customCactusColor: null,
  customBambooColor: null,
  autoTimeEnabled: false,
  autoTimeMinutes: 300,
  autoTimeSpeedMinutes: 1,
  houseTheme: 'blue',
  isSoundMuted: true,
  playerShirtColor: null,
  playerPantsColor: null,
  playerShoesColor: null,
  playerHairColor: null,
  playerSkinColor: null,
  customHouseBlueColor: null,
  customHouseWhiteColor: null,
};

/**
 * Persists settings under a specific 4-digit PIN slot in localStorage.
 */
export function saveGameSlot(
  pin: string,
  state: Omit<SavedGameState, 'version' | 'timestamp' | 'slotPin'>
): boolean {
  try {
    const payload: SavedGameState = {
      ...state,
      slotPin: pin,
      version: 2,
      timestamp: Date.now(),
    };
    localStorage.setItem(getSlotKey(pin), JSON.stringify(payload));
    localStorage.setItem(ACTIVE_SLOT_PIN_KEY, pin);
    recordLobbyPin(pin);
    return true;
  } catch (err) {
    console.error('Failed to save game slot to localStorage:', err);
    return false;
  }
}

/**
 * Loads saved state for a specific 4-digit PIN slot from localStorage.
 */
export function loadGameSlot(pin: string): SavedGameState | null {
  try {
    const raw = localStorage.getItem(getSlotKey(pin));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGameState;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.error('Failed to load game slot from localStorage:', err);
    return null;
  }
}

/**
 * Gets currently active 4-digit slot PIN.
 */
export function getActiveSlotPin(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SLOT_PIN_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets or clears the active 4-digit slot PIN.
 */
export function setActiveSlotPin(pin: string | null): void {
  try {
    if (pin) {
      localStorage.setItem(ACTIVE_SLOT_PIN_KEY, pin);
    } else {
      localStorage.removeItem(ACTIVE_SLOT_PIN_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Legacy / Default save helper.
 */
export function saveGame(state: Omit<SavedGameState, 'version' | 'timestamp'>): boolean {
  try {
    const activePin = getActiveSlotPin();
    if (activePin) {
      return saveGameSlot(activePin, state);
    }
    const payload: SavedGameState = {
      ...state,
      version: 2,
      timestamp: Date.now(),
    };
    localStorage.setItem(SAVE_GAME_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save game to localStorage:', err);
    return false;
  }
}

/**
 * Legacy / Default load helper.
 */
export function loadSavedGame(): SavedGameState | null {
  try {
    const activePin = getActiveSlotPin();
    if (activePin) {
      const slotData = loadGameSlot(activePin);
      if (slotData) return slotData;
    }
    const raw = localStorage.getItem(SAVE_GAME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGameState;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.error('Failed to load saved game from localStorage:', err);
    return null;
  }
}
