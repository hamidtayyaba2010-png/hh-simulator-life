import { useState, useRef, useCallback, useEffect } from 'react';
import { DollhouseCanvas } from './components/DollhouseCanvas';
import { DollhouseUI } from './components/DollhouseUI';
import { HouseColorTheme, LandPlace, LandType, SkyDesign, TimeOfDay, TreeType, ViewPerspective, WeatherType, DroppedPhoneData } from './types';
import { PlayerCustomizerModal, PlayerCustomizerColors } from './components/PlayerCustomizerModal';
import { HouseSettingsModal, HouseCustomColors } from './components/HouseSettingsModal';
import { getAutoTimeEnvironment } from './utils/autoTime';
import {
  DEFAULT_SLOT_STATE,
  deleteLobby,
  getActiveSlotPin,
  loadGameSlot,
  loadSavedGame,
  saveGameSlot,
  setActiveSlotPin,
} from './utils/saveManager';
import { ambientSound } from './utils/audioManager';

export default function App() {
  const savedStateRef = useRef(loadSavedGame());
  const saved = savedStateRef.current;

  const [activeSlotPin, setActiveSlotPinState] = useState<string | null>(() => getActiveSlotPin());

  const [perspective, setPerspective] = useState<ViewPerspective>('third-person');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(saved?.timeOfDay ?? 'day');
  const [landType, setLandType] = useState<LandType>(saved?.landType ?? 'grass');
  const [landPlace, setLandPlace] = useState<LandPlace | null>(saved?.landPlace ?? null);
  const [houseTheme, setHouseTheme] = useState<HouseColorTheme>(saved?.houseTheme ?? 'blue');
  const [playerSpeedMultiplier] = useState<number>(1);
  const [customSkyColor, setCustomSkyColor] = useState<string | null>(saved?.customSkyColor ?? null);
  const [customLandColor, setCustomLandColor] = useState<string | null>(saved?.customLandColor ?? null);
  const [customWoodColor, setCustomWoodColor] = useState<string | null>(saved?.customWoodColor ?? null);
  const [customLeafColor, setCustomLeafColor] = useState<string | null>(saved?.customLeafColor ?? null);
  const [treeType, setTreeType] = useState<TreeType>(saved?.treeType ?? 'classic');
  const [customCactusColor, setCustomCactusColor] = useState<string | null>(saved?.customCactusColor ?? null);
  const [customBambooColor, setCustomBambooColor] = useState<string | null>(saved?.customBambooColor ?? null);
  const [playerShirtColor, setPlayerShirtColor] = useState<string | null>(saved?.playerShirtColor ?? null);
  const [playerPantsColor, setPlayerPantsColor] = useState<string | null>(saved?.playerPantsColor ?? null);
  const [playerShoesColor, setPlayerShoesColor] = useState<string | null>(saved?.playerShoesColor ?? null);
  const [playerHairColor, setPlayerHairColor] = useState<string | null>(saved?.playerHairColor ?? null);
  const [playerSkinColor, setPlayerSkinColor] = useState<string | null>(saved?.playerSkinColor ?? null);
  const [showPlayerCustomizer, setShowPlayerCustomizer] = useState<boolean>(false);
  const [customHouseBlueColor, setCustomHouseBlueColor] = useState<string | null>(saved?.customHouseBlueColor ?? null);
  const [customHouseWhiteColor, setCustomHouseWhiteColor] = useState<string | null>(saved?.customHouseWhiteColor ?? null);
  const [showHouseSettings, setShowHouseSettings] = useState<boolean>(false);
  const [skyDesign, setSkyDesign] = useState<SkyDesign>(saved?.skyDesign ?? null);
  const [weather, setWeather] = useState<WeatherType>(saved?.weather ?? null);
  const [tornadoSecondsLeft, setTornadoSecondsLeft] = useState<number>(0);
  const tornadoTimerRef = useRef<number | null>(null);

  // Auto Time States (starts at 5:00 AM = 300 minutes, 1 minute per second default)
  const [autoTimeEnabled, setAutoTimeEnabled] = useState<boolean>(saved?.autoTimeEnabled ?? false);
  const [autoTimeMinutes, setAutoTimeMinutes] = useState<number>(saved?.autoTimeMinutes ?? 300);
  const [autoTimeFormatted, setAutoTimeFormatted] = useState<string>(() => {
    if (saved?.autoTimeEnabled && typeof saved.autoTimeMinutes === 'number') {
      return getAutoTimeEnvironment(saved.autoTimeMinutes).formattedTime;
    }
    return '5:00 AM';
  });
  const [autoTimeSpeedMinutes, setAutoTimeSpeedMinutes] = useState<number>(saved?.autoTimeSpeedMinutes ?? 1);

  const jumpRef = useRef<(() => void) | null>(null);
  const joystickInputRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mobile Phone & Inventory States (Slot 2 index 1 has phone initially)
  const [inventorySlots, setInventorySlots] = useState<(string | null)[]>([
    null,
    'phone',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [heldItem, setHeldItem] = useState<string | null>(null);
  const [droppedPhone, setDroppedPhone] = useState<DroppedPhoneData | null>(null);
  const [canPickupPhone, setCanPickupPhone] = useState<boolean>(false);
  const dropCoordsRef = useRef<(() => DroppedPhoneData) | null>(null);

  const handleSlotClick = useCallback((index: number) => {
    setInventorySlots((prev) => {
      const itemInSlot = prev[index];
      if (itemInSlot === 'phone') {
        // Take mobile out of this box, box becomes empty, mobile appears above joystick
        const updated = [...prev];
        updated[index] = null;
        setHeldItem('phone');
        return updated;
      } else if (itemInSlot === null && heldItem === 'phone') {
        // Place mobile into this empty box, remove from above joystick
        const updated = [...prev];
        updated[index] = 'phone';
        setHeldItem(null);
        return updated;
      }
      return prev;
    });
  }, [heldItem]);

  const handleHandAction = useCallback(() => {
    if (heldItem === 'phone') {
      // Drop mobile phone on the land in front of player
      if (dropCoordsRef.current) {
        const coords = dropCoordsRef.current();
        setDroppedPhone(coords);
      }
      setHeldItem(null);
    } else if (canPickupPhone) {
      // Pick up mobile phone from land
      setDroppedPhone(null);
      setCanPickupPhone(false);
      setHeldItem('phone');
    }
  }, [heldItem, canPickupPhone]);

  const handleTogglePerspective = useCallback(() => {
    setPerspective((prev) => (prev === 'first-person' ? 'third-person' : 'first-person'));
  }, []);

  const handleJump = useCallback(() => {
    if (jumpRef.current) {
      jumpRef.current();
    }
  }, []);

  const handleSelectTime = useCallback((newTime: TimeOfDay) => {
    setTimeOfDay(newTime);
    setCustomSkyColor(null);
  }, []);

  const handleSelectSkyDesign = useCallback((design: SkyDesign) => {
    setSkyDesign(design === 'clear' ? null : design);
  }, []);

  const handleSelectLandPlace = useCallback((place: LandPlace) => {
    setLandPlace(place);
    if (place === 'desert') {
      setLandType('sand');
      setCustomLandColor('#d97706');
      setTimeOfDay('day');
      setSkyDesign('sun');
      setTreeType('cactus');
    } else if (place === 'grass') {
      setLandType('grass');
      setCustomLandColor(null);
      setSkyDesign(null);
      setTreeType('classic');
    } else if (place === 'ice') {
      setLandType('snow');
      setCustomLandColor('#f8fafc');
      setSkyDesign('clouds');
      setTreeType('christmas');
    } else if (place === 'mountain') {
      setLandType('grass');
      setCustomLandColor('#451a03'); // Dark brown earth
    } else if (place === 'island') {
      setLandType('sand');
      setCustomLandColor('#fed7aa'); // Light peach
      setTreeType('palm');
    }
  }, []);

  const handleSelectWeather = useCallback((selectedWeather: WeatherType) => {
    if (selectedWeather === 'normal') {
      setWeather(null);
      setTornadoSecondsLeft(0);
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
        tornadoTimerRef.current = null;
      }
      return;
    }

    if (selectedWeather === 'snow') {
      setWeather('snow');
      setTornadoSecondsLeft(0);
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
        tornadoTimerRef.current = null;
      }
    } else if (selectedWeather === 'rain') {
      setWeather('rain');
      setSkyDesign('clouds'); // Clouds automatically activate
      setTornadoSecondsLeft(0);
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
        tornadoTimerRef.current = null;
      }
    } else if (selectedWeather === 'thunder') {
      setWeather('thunder');
      setSkyDesign('clouds'); // Clouds automatically activate
      setTornadoSecondsLeft(0);
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
        tornadoTimerRef.current = null;
      }
    } else if (selectedWeather === 'tornado') {
      setWeather('tornado');
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
      }
      setTornadoSecondsLeft(10);
      tornadoTimerRef.current = window.setInterval(() => {
        setTornadoSecondsLeft((prev) => {
          if (prev <= 1) {
            if (tornadoTimerRef.current) {
              window.clearInterval(tornadoTimerRef.current);
              tornadoTimerRef.current = null;
            }
            setWeather(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, []);

  // Cleanup tornado timer on unmount
  useEffect(() => {
    return () => {
      if (tornadoTimerRef.current) {
        window.clearInterval(tornadoTimerRef.current);
      }
    };
  }, []);

  const handleToggleAutoTime = useCallback(() => {
    setAutoTimeEnabled((prev) => {
      const next = !prev;
      if (next) {
        // Start from 5:00 AM immediately
        const initialMin = 300;
        setAutoTimeMinutes(initialMin);
        const env = getAutoTimeEnvironment(initialMin);
        setAutoTimeFormatted(env.formattedTime);
        setTimeOfDay(env.timeOfDay);
        setCustomSkyColor(env.skyColor);
        setSkyDesign(env.skyDesign);
      } else {
        // Reset everything back to normal state
        setTimeOfDay('day');
        setCustomSkyColor(null);
        setSkyDesign(null);
        setAutoTimeMinutes(300);
        setAutoTimeFormatted('5:00 AM');
        setAutoTimeSpeedMinutes(1);
      }
      return next;
    });
  }, []);

  // Auto Time Tick Effect (1 second real time = autoTimeSpeedMinutes in-game minutes)
  useEffect(() => {
    if (!autoTimeEnabled) return;

    const intervalId = window.setInterval(() => {
      setAutoTimeMinutes((prev) => {
        const next = (prev + autoTimeSpeedMinutes) % 1440;
        const env = getAutoTimeEnvironment(next);
        setAutoTimeFormatted(env.formattedTime);
        setTimeOfDay(env.timeOfDay);
        setCustomSkyColor(env.skyColor);
        setSkyDesign(env.skyDesign);
        return next;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoTimeEnabled, autoTimeSpeedMinutes]);

  // Handle joining a 4-digit PIN slot
  const handleJoinSlot = useCallback((pin: string): { isNew: boolean } => {
    setActiveSlotPinState(pin);
    setActiveSlotPin(pin);

    const existing = loadGameSlot(pin);
    if (existing) {
      // Restore saved game settings from this 4-digit slot
      setTimeOfDay(existing.timeOfDay);
      setCustomSkyColor(existing.customSkyColor);
      setSkyDesign(existing.skyDesign);
      setCustomLandColor(existing.customLandColor);
      setLandType(existing.landType);
      setLandPlace(existing.landPlace ?? null);
      setCustomWoodColor(existing.customWoodColor);
      setCustomLeafColor(existing.customLeafColor);
      setTreeType(existing.treeType ?? 'classic');
      setCustomCactusColor(existing.customCactusColor ?? null);
      setCustomBambooColor(existing.customBambooColor ?? null);
      setHouseTheme(existing.houseTheme);
      setWeather(existing.weather ?? null);
      setPlayerShirtColor(existing.playerShirtColor ?? null);
      setPlayerPantsColor(existing.playerPantsColor ?? null);
      setPlayerShoesColor(existing.playerShoesColor ?? null);
      setPlayerHairColor(existing.playerHairColor ?? null);
      setPlayerSkinColor(existing.playerSkinColor ?? null);
      setCustomHouseBlueColor(existing.customHouseBlueColor ?? null);
      setCustomHouseWhiteColor(existing.customHouseWhiteColor ?? null);
      setAutoTimeEnabled(existing.autoTimeEnabled);
      setAutoTimeMinutes(existing.autoTimeMinutes);
      setAutoTimeSpeedMinutes(existing.autoTimeSpeedMinutes);
      if (existing.autoTimeEnabled) {
        const env = getAutoTimeEnvironment(existing.autoTimeMinutes);
        setAutoTimeFormatted(env.formattedTime);
      } else {
        setAutoTimeFormatted('5:00 AM');
      }
      if (existing.isSoundMuted !== undefined) {
        ambientSound.setMuted(existing.isSoundMuted);
      }
      return { isNew: false };
    } else {
      // Start a fresh lobby for this new 4-digit number
      setTimeOfDay(DEFAULT_SLOT_STATE.timeOfDay);
      setCustomSkyColor(DEFAULT_SLOT_STATE.customSkyColor);
      setSkyDesign(DEFAULT_SLOT_STATE.skyDesign);
      setCustomLandColor(DEFAULT_SLOT_STATE.customLandColor);
      setLandType(DEFAULT_SLOT_STATE.landType);
      setLandPlace(DEFAULT_SLOT_STATE.landPlace ?? null);
      setCustomWoodColor(DEFAULT_SLOT_STATE.customWoodColor);
      setCustomLeafColor(DEFAULT_SLOT_STATE.customLeafColor);
      setTreeType(DEFAULT_SLOT_STATE.treeType ?? 'classic');
      setCustomCactusColor(DEFAULT_SLOT_STATE.customCactusColor ?? null);
      setCustomBambooColor(DEFAULT_SLOT_STATE.customBambooColor ?? null);
      setHouseTheme(DEFAULT_SLOT_STATE.houseTheme);
      setWeather(null);
      setPlayerShirtColor(null);
      setPlayerPantsColor(null);
      setPlayerShoesColor(null);
      setPlayerHairColor(null);
      setPlayerSkinColor(null);
      setCustomHouseBlueColor(null);
      setCustomHouseWhiteColor(null);
      setAutoTimeEnabled(DEFAULT_SLOT_STATE.autoTimeEnabled);
      setAutoTimeMinutes(DEFAULT_SLOT_STATE.autoTimeMinutes);
      setAutoTimeSpeedMinutes(DEFAULT_SLOT_STATE.autoTimeSpeedMinutes);
      setAutoTimeFormatted('5:00 AM');
      ambientSound.setMuted(true);

      // Save initial fresh state to this pin slot
      saveGameSlot(pin, DEFAULT_SLOT_STATE);
      return { isNew: true };
    }
  }, []);

  // Auto-Save whenever settings change while joined in a 4-digit slot
  useEffect(() => {
    if (!activeSlotPin) return;

    saveGameSlot(activeSlotPin, {
      customSkyColor,
      timeOfDay,
      skyDesign,
      weather,
      customLandColor,
      landType,
      landPlace,
      customWoodColor,
      customLeafColor,
      treeType,
      customCactusColor,
      customBambooColor,
      autoTimeEnabled,
      autoTimeMinutes,
      autoTimeSpeedMinutes,
      houseTheme,
      isSoundMuted: ambientSound.isMuted(),
      playerShirtColor,
      playerPantsColor,
      playerShoesColor,
      playerHairColor,
      playerSkinColor,
      customHouseBlueColor,
      customHouseWhiteColor,
    });
  }, [
    activeSlotPin,
    customSkyColor,
    timeOfDay,
    skyDesign,
    weather,
    customLandColor,
    landType,
    landPlace,
    customWoodColor,
    customLeafColor,
    treeType,
    customCactusColor,
    customBambooColor,
    autoTimeEnabled,
    autoTimeMinutes,
    autoTimeSpeedMinutes,
    houseTheme,
    playerShirtColor,
    playerPantsColor,
    playerShoesColor,
    playerHairColor,
    playerSkinColor,
    customHouseBlueColor,
    customHouseWhiteColor,
  ]);

  const handleApplyHouseColors = useCallback((colors: HouseCustomColors) => {
    setCustomHouseBlueColor(colors.blue);
    setCustomHouseWhiteColor(colors.white);

    const pin = activeSlotPin ?? getActiveSlotPin();
    if (pin) {
      saveGameSlot(pin, {
        customSkyColor,
        timeOfDay,
        skyDesign,
        weather,
        customLandColor,
        landType,
        landPlace,
        customWoodColor,
        customLeafColor,
        treeType,
        customCactusColor,
        customBambooColor,
        autoTimeEnabled,
        autoTimeMinutes,
        autoTimeSpeedMinutes,
        houseTheme,
        isSoundMuted: ambientSound.isMuted(),
        playerShirtColor,
        playerPantsColor,
        playerShoesColor,
        playerHairColor,
        playerSkinColor,
        customHouseBlueColor: colors.blue,
        customHouseWhiteColor: colors.white,
      });
    }
  }, [
    activeSlotPin,
    customSkyColor,
    timeOfDay,
    skyDesign,
    weather,
    customLandColor,
    landType,
    landPlace,
    customWoodColor,
    customLeafColor,
    treeType,
    customCactusColor,
    customBambooColor,
    autoTimeEnabled,
    autoTimeMinutes,
    autoTimeSpeedMinutes,
    houseTheme,
    playerShirtColor,
    playerPantsColor,
    playerShoesColor,
    playerHairColor,
    playerSkinColor,
  ]);

  const handleApplyPlayerColors = useCallback((colors: PlayerCustomizerColors) => {
    setPlayerShirtColor(colors.shirt);
    setPlayerPantsColor(colors.pants);
    setPlayerShoesColor(colors.shoes);
    setPlayerHairColor(colors.hair);
    setPlayerSkinColor(colors.skin);

    const pin = activeSlotPin ?? getActiveSlotPin();
    if (pin) {
      saveGameSlot(pin, {
        customSkyColor,
        timeOfDay,
        skyDesign,
        weather,
        customLandColor,
        landType,
        landPlace,
        customWoodColor,
        customLeafColor,
        treeType,
        customCactusColor,
        customBambooColor,
        autoTimeEnabled,
        autoTimeMinutes,
        autoTimeSpeedMinutes,
        houseTheme,
        isSoundMuted: ambientSound.isMuted(),
        playerShirtColor: colors.shirt,
        playerPantsColor: colors.pants,
        playerShoesColor: colors.shoes,
        playerHairColor: colors.hair,
        playerSkinColor: colors.skin,
        customHouseBlueColor,
        customHouseWhiteColor,
      });
    }
  }, [
    activeSlotPin,
    customSkyColor,
    timeOfDay,
    skyDesign,
    weather,
    customLandColor,
    landType,
    landPlace,
    customWoodColor,
    customLeafColor,
    treeType,
    customCactusColor,
    customBambooColor,
    autoTimeEnabled,
    autoTimeMinutes,
    autoTimeSpeedMinutes,
    houseTheme,
    customHouseBlueColor,
    customHouseWhiteColor,
  ]);

  const handleSaveGame = useCallback((): boolean => {
    const pin = activeSlotPin ?? getActiveSlotPin();
    if (pin) {
      return saveGameSlot(pin, {
        customSkyColor,
        timeOfDay,
        skyDesign,
        weather,
        customLandColor,
        landType,
        landPlace,
        customWoodColor,
        customLeafColor,
        treeType,
        customCactusColor,
        customBambooColor,
        autoTimeEnabled,
        autoTimeMinutes,
        autoTimeSpeedMinutes,
        houseTheme,
        isSoundMuted: ambientSound.isMuted(),
        playerShirtColor,
        playerPantsColor,
        playerShoesColor,
        playerHairColor,
        playerSkinColor,
        customHouseBlueColor,
        customHouseWhiteColor,
      });
    }
    return false;
  }, [
    activeSlotPin,
    customSkyColor,
    timeOfDay,
    skyDesign,
    weather,
    customLandColor,
    landType,
    landPlace,
    customWoodColor,
    customLeafColor,
    treeType,
    customCactusColor,
    customBambooColor,
    autoTimeEnabled,
    autoTimeMinutes,
    autoTimeSpeedMinutes,
    houseTheme,
    playerShirtColor,
    playerPantsColor,
    playerShoesColor,
    playerHairColor,
    playerSkinColor,
    customHouseBlueColor,
    customHouseWhiteColor,
  ]);

  const handleDeleteLobby = useCallback((pin: string) => {
    deleteLobby(pin);
    if (activeSlotPin === pin) {
      setActiveSlotPinState(null);
      setActiveSlotPin(null);
    }
  }, [activeSlotPin]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none text-white font-sans">
      {/* 3D Canvas Layer */}
      <DollhouseCanvas
        perspective={perspective}
        onJumpRef={jumpRef}
        joystickInputRef={joystickInputRef}
        timeOfDay={timeOfDay}
        landType={landType}
        landPlace={landPlace}
        houseTheme={houseTheme}
        playerSpeedMultiplier={playerSpeedMultiplier}
        teleportTarget={null}
        onTeleportComplete={() => {}}
        customSkyColor={customSkyColor}
        customLandColor={customLandColor}
        customWoodColor={customWoodColor}
        customLeafColor={customLeafColor}
        skyDesign={skyDesign}
        weather={weather}
        treeType={treeType}
        customCactusColor={customCactusColor}
        customBambooColor={customBambooColor}
        playerShirtColor={playerShirtColor}
        playerPantsColor={playerPantsColor}
        playerShoesColor={playerShoesColor}
        playerHairColor={playerHairColor}
        playerSkinColor={playerSkinColor}
        customHouseBlueColor={customHouseBlueColor}
        customHouseWhiteColor={customHouseWhiteColor}
        droppedPhone={droppedPhone}
        onDropCoordsRef={dropCoordsRef}
        onAimAtPhoneChange={setCanPickupPhone}
      />

      {/* Interactive UI Overlays, Controls & Timeline */}
      <DollhouseUI
        perspective={perspective}
        onTogglePerspective={handleTogglePerspective}
        onJump={handleJump}
        joystickInputRef={joystickInputRef}
        onSelectSkyColor={setCustomSkyColor}
        onSelectLandColor={setCustomLandColor}
        onSelectWoodColor={setCustomWoodColor}
        onSelectLeafColor={setCustomLeafColor}
        treeType={treeType}
        onSelectTreeType={setTreeType}
        customTreeColor={treeType === 'cactus' ? customCactusColor : treeType === 'bamboo' ? customBambooColor : null}
        onSelectTreeColor={(color) => {
          if (treeType === 'cactus') {
            setCustomCactusColor(color);
          } else if (treeType === 'bamboo') {
            setCustomBambooColor(color);
          }
        }}
        onSelectTime={handleSelectTime}
        timeOfDay={timeOfDay}
        skyDesign={skyDesign}
        onSelectSkyDesign={handleSelectSkyDesign}
        weather={weather}
        onSelectWeather={handleSelectWeather}
        tornadoSecondsLeft={tornadoSecondsLeft}
        autoTimeEnabled={autoTimeEnabled}
        autoTimeFormatted={autoTimeFormatted}
        onToggleAutoTime={handleToggleAutoTime}
        autoTimeSpeedMinutes={autoTimeSpeedMinutes}
        onSetTimeSpeed={setAutoTimeSpeedMinutes}
        houseTheme={houseTheme}
        onSelectHouseTheme={setHouseTheme}
        landType={landType}
        onSelectLandType={setLandType}
        landPlace={landPlace}
        onSelectLandPlace={handleSelectLandPlace}
        onSaveGame={handleSaveGame}
        activeSlotPin={activeSlotPin}
        onJoinSlot={handleJoinSlot}
        onDeleteLobby={handleDeleteLobby}
        onOpenPlayerSettings={() => setShowPlayerCustomizer(true)}
        onOpenHouseSettings={() => setShowHouseSettings(true)}
        inventorySlots={inventorySlots}
        onSlotClick={handleSlotClick}
        heldItem={heldItem}
        canPickupPhone={canPickupPhone}
        onHandAction={handleHandAction}
      />

      {/* Full-Screen House Selection, 3D View, Info & Color Customization Screen */}
      <HouseSettingsModal
        isOpen={showHouseSettings}
        onClose={() => setShowHouseSettings(false)}
        onApplyColors={handleApplyHouseColors}
        currentColors={{
          blue: customHouseBlueColor,
          white: customHouseWhiteColor,
        }}
        skyColor={customSkyColor}
        landColor={customLandColor}
      />

      {/* Full-Screen Black Player Customization Studio */}
      <PlayerCustomizerModal
        isOpen={showPlayerCustomizer}
        onClose={() => setShowPlayerCustomizer(false)}
        onApply={handleApplyPlayerColors}
        initialColors={{
          shirt: playerShirtColor,
          pants: playerPantsColor,
          shoes: playerShoesColor,
          hair: playerHairColor,
          skin: playerSkinColor,
        }}
      />
    </div>
  );
}
