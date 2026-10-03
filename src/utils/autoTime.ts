import { SkyDesign, TimeOfDay } from '../types';

export function formatGameTime(totalMinutes: number): string {
  const norm = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(norm / 60);
  const minutes = norm % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${minStr} ${period}`;
}

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
  return `#${hex.toString(16).padStart(6, '0')}`;
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  return toHex(
    r1 + (r2 - r1) * clampedT,
    g1 + (g2 - g1) * clampedT,
    b1 + (b2 - b1) * clampedT
  );
}

export interface AutoTimeEnvironment {
  timeOfDay: TimeOfDay;
  skyColor: string;
  skyDesign: SkyDesign;
  formattedTime: string;
}

export function getAutoTimeEnvironment(minutes: number): AutoTimeEnvironment {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const formattedTime = formatGameTime(m);

  let timeOfDay: TimeOfDay = 'day';
  let skyColor = '#bfe0ff';
  let skyDesign: SkyDesign = null;

  // 1. 5:00 AM (300) to 7:00 AM (420):
  // Starts dark peach (#db7b68) and slowly/smoothly becomes light peach towards morning (#cce5ff)
  if (m >= 300 && m < 420) {
    const t = (m - 300) / 120;
    timeOfDay = 'sunrise';
    skyDesign = null;
    if (t < 0.5) {
      // dark peach to light peach
      skyColor = lerpColor('#db7b68', '#fca58f', t * 2);
    } else {
      // light peach to morning very light blue
      skyColor = lerpColor('#fca58f', '#cce5ff', (t - 0.5) * 2);
    }
  }
  // 2. 7:00 AM (420) to 12:00 PM (720):
  // Sky stays fully in morning mode (#cce5ff) with Sun visible
  else if (m >= 420 && m < 720) {
    timeOfDay = 'morning';
    skyColor = '#cce5ff';
    skyDesign = 'sun';
  }
  // 3. 12:00 PM (720) to 2:00 PM (840):
  // Smoothly darkens towards day mode (#bfe0ff)
  else if (m >= 720 && m < 840) {
    const t = (m - 720) / 120;
    skyColor = lerpColor('#cce5ff', '#bfe0ff', t);
    timeOfDay = t > 0.5 ? 'day' : 'morning';
    skyDesign = 'sun';
  }
  // 4. 2:00 PM (840) to 6:00 PM (1080):
  // Smoothly darkens towards noon mode (#1d4ed8)
  else if (m >= 840 && m < 1080) {
    const t = (m - 840) / 240;
    skyColor = lerpColor('#bfe0ff', '#1d4ed8', t);
    timeOfDay = t > 0.5 ? 'noon' : 'day';
    skyDesign = 'sun';
  }
  // 5. 6:00 PM (1080) to 8:00 PM (1200):
  // Continues smoothly darkening towards light gray (#94a3b8)
  else if (m >= 1080 && m < 1200) {
    const t = (m - 1080) / 120;
    skyColor = lerpColor('#1d4ed8', '#94a3b8', t);
    timeOfDay = 'noon';
    skyDesign = 'sun';
  }
  // 6. 8:00 PM (1200) to 10:00 PM (1320):
  // Sky light gray darkens into night mode (#374151); Moon and stars appear
  else if (m >= 1200 && m < 1320) {
    const t = (m - 1200) / 120;
    skyColor = lerpColor('#94a3b8', '#374151', t);
    timeOfDay = 'night';
    skyDesign = 'moon_stars';
  }
  // 7. 10:00 PM (1320) to 1:00 AM (60):
  // Continues darkening until 1:00 AM where it reaches full midnight (#000000)
  else if (m >= 1320 || m < 60) {
    const offset = m >= 1320 ? (m - 1320) : (m + 120);
    const t = offset / 180;
    skyColor = lerpColor('#374151', '#000000', t);
    timeOfDay = t > 0.5 ? 'midnight' : 'night';
    skyDesign = 'moon_stars';
  }
  // 8. 1:00 AM (60) to 5:00 AM (300):
  // Smoothly gets lighter from full midnight (#000000) to sunrise (#db7b68)
  else if (m >= 60 && m < 300) {
    const t = (m - 60) / 240;
    skyColor = lerpColor('#000000', '#db7b68', t);
    timeOfDay = t > 0.75 ? 'sunrise' : 'midnight';
    skyDesign = 'moon_stars';
  }

  return {
    timeOfDay,
    skyColor,
    skyDesign,
    formattedTime,
  };
}
