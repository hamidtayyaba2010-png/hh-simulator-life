export type ViewPerspective = 'third-person' | 'first-person';

export type TreeType = 'cactus' | 'evergreen' | 'bamboo' | 'classic' | 'palm' | 'christmas';

export type WeatherType = 'snow' | 'rain' | 'thunder' | 'tornado' | 'normal' | null;

export type SettingsSubView = 
  | 'none'
  | 'main' 
  | 'house'
  | 'game' 
  | 'sky' 
  | 'sky_time'
  | 'sky_color'
  | 'sky_design'
  | 'sky_weather'
  | 'land' 
  | 'land_color'
  | 'land_place'
  | 'trees'
  | 'trees_wood'
  | 'trees_leaf'
  | 'trees_type'
  | 'trees_color'
  | 'world'
  | 'time_speed'
  | 'about' 
  | 'developer';

export type SkyDesign = 'clouds' | 'sun' | 'moon' | 'stars' | 'galaxy' | 'saturn' | 'rainbow' | 'clear' | 'moon_stars' | null;

export type TimeOfDay = 'day' | 'sunset' | 'night' | 'sunrise' | 'morning' | 'noon' | 'midnight';
export type LandType = 'grass' | 'sand' | 'snow';
export type LandPlace = 'desert' | 'grass' | 'island' | 'ice' | 'mountain';
export type HouseColorTheme = 'blue' | 'pink' | 'modern' | 'gold';

export interface TimelineEntry {
  id: string;
  dateStr: string;
  dayStr: string;
  title: string;
  events: string[];
}

export interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface DroppedPhoneData {
  x: number;
  y: number;
  z: number;
  rotationY: number;
}
