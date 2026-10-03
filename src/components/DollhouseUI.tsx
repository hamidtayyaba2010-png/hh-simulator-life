import React, { useState, useEffect, useRef } from 'react';
import { TIMELINE_ENTRIES } from '../data/timelineData';
import { ambientSound } from '../utils/audioManager';
import {
  deleteLobby,
  getAllLobbies,
  getDevPassword,
  setDevPassword,
} from '../utils/saveManager';
import {
  HouseColorTheme,
  LandPlace,
  LandType,
  SettingsSubView,
  SkyDesign,
  TimelineEntry,
  TimeOfDay,
  TreeType,
  ViewPerspective,
  WeatherType,
} from '../types';

interface DollhouseUIProps {
  perspective: ViewPerspective;
  onTogglePerspective: () => void;
  onJump: () => void;
  joystickInputRef: React.MutableRefObject<{ x: number; y: number }>;
  onSelectSkyColor: (color: string | null) => void;
  onSelectLandColor: (color: string | null) => void;
  onSelectWoodColor: (color: string | null) => void;
  onSelectLeafColor: (color: string | null) => void;
  onSelectTime: (time: TimeOfDay) => void;
  timeOfDay?: TimeOfDay;
  skyDesign?: SkyDesign;
  onSelectSkyDesign: (design: SkyDesign) => void;
  weather?: WeatherType;
  onSelectWeather?: (weather: WeatherType) => void;
  tornadoSecondsLeft?: number;
  autoTimeEnabled?: boolean;
  autoTimeFormatted?: string;
  onToggleAutoTime?: () => void;
  autoTimeSpeedMinutes?: number;
  onSetTimeSpeed?: (speedInMinutes: number) => void;
  houseTheme?: HouseColorTheme;
  onSelectHouseTheme?: (theme: HouseColorTheme) => void;
  landType?: LandType;
  onSelectLandType?: (land: LandType) => void;
  landPlace?: LandPlace | null;
  onSelectLandPlace?: (place: LandPlace) => void;
  onSaveGame?: () => boolean;
  activeSlotPin?: string | null;
  onJoinSlot?: (pin: string) => { isNew: boolean };
  onDeleteLobby?: (pin: string) => void;
  treeType?: TreeType;
  onSelectTreeType?: (type: TreeType) => void;
  customTreeColor?: string | null;
  onSelectTreeColor?: (color: string | null) => void;
  onOpenPlayerSettings?: () => void;
  onOpenHouseSettings?: () => void;
  inventorySlots: (string | null)[];
  onSlotClick: (index: number) => void;
  heldItem: string | null;
  canPickupPhone: boolean;
  onHandAction: () => void;
}

const getTimeLabel = (time?: TimeOfDay): string => {
  switch (time) {
    case 'sunrise':
      return 'Sunrise';
    case 'morning':
      return 'Morning';
    case 'day':
      return 'Day';
    case 'noon':
      return 'Noon';
    case 'night':
      return 'Night';
    case 'midnight':
      return 'Midnight';
    case 'sunset':
      return 'Sunset';
    default:
      return 'Day';
  }
};

const getTimeIcon = (time?: TimeOfDay): string => {
  switch (time) {
    case 'sunrise':
      return '🌄';
    case 'morning':
      return '⛅';
    case 'day':
      return '🌅';
    case 'noon':
      return '🌤️';
    case 'night':
      return '🌌';
    case 'midnight':
      return '🌑';
    case 'sunset':
      return '🌇';
    default:
      return '🌅';
  }
};

export const DollhouseUI: React.FC<DollhouseUIProps> = ({
  perspective,
  onTogglePerspective,
  onJump,
  joystickInputRef,
  onSelectSkyColor,
  onSelectLandColor,
  onSelectWoodColor,
  onSelectLeafColor,
  onSelectTime,
  timeOfDay = 'day',
  skyDesign,
  onSelectSkyDesign,
  weather,
  onSelectWeather,
  tornadoSecondsLeft,
  autoTimeEnabled,
  autoTimeFormatted,
  onToggleAutoTime,
  autoTimeSpeedMinutes = 1,
  onSetTimeSpeed,
  houseTheme = 'blue',
  onSelectHouseTheme,
  landType = 'grass',
  onSelectLandType,
  landPlace,
  onSelectLandPlace,
  onSaveGame,
  activeSlotPin,
  onJoinSlot,
  onDeleteLobby,
  treeType = 'classic',
  onSelectTreeType,
  customTreeColor,
  onSelectTreeColor,
  onOpenPlayerSettings,
  onOpenHouseSettings,
  inventorySlots,
  onSlotClick,
  heldItem,
  canPickupPhone,
  onHandAction,
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsSubView>('main');
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [selectedTimelineEntry, setSelectedTimelineEntry] = useState<TimelineEntry | null>(null);
  const [showTimelineScreen, setShowTimelineScreen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => ambientSound.isMuted());

  // Interactive Phone Screen Overlay States
  const [isPhoneScreenOpen, setIsPhoneScreenOpen] = useState<boolean>(false);
  const [isPhoneUnlocked, setIsPhoneUnlocked] = useState<boolean>(false);
  const [phoneTouchStartY, setPhoneTouchStartY] = useState<number | null>(null);

  // Auto-close full phone screen if mobile is dropped or returned to inventory
  useEffect(() => {
    if (heldItem !== 'phone') {
      setIsPhoneScreenOpen(false);
      setIsPhoneUnlocked(false);
    }
  }, [heldItem]);

  // Time Speed Slider States
  const [sliderMinutes, setSliderMinutes] = useState<number>(() => {
    if (autoTimeSpeedMinutes && autoTimeSpeedMinutes <= 60) return autoTimeSpeedMinutes;
    return 1;
  });
  const [sliderHours, setSliderHours] = useState<number>(() => {
    if (autoTimeSpeedMinutes && autoTimeSpeedMinutes >= 60) return Math.floor(autoTimeSpeedMinutes / 60);
    return 0;
  });
  const [speedMode, setSpeedMode] = useState<'minutes' | 'hours'>(() => {
    return autoTimeSpeedMinutes && autoTimeSpeedMinutes >= 60 ? 'hours' : 'minutes';
  });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  // 4-Digit Slot / Save Game Bar State
  const [isSaveBarOpen, setIsSaveBarOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Full Screen Developer Overlay States
  const [showDevScreen, setShowDevScreen] = useState<boolean>(false);
  const [devScreenView, setDevScreenView] = useState<'auth' | 'menu' | 'change_password' | 'lobbies'>('auth');
  const [devPasswordInput, setDevPasswordInput] = useState<string>('');
  const [devError, setDevError] = useState<string | null>(null);
  const [devSuccess, setDevSuccess] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [lobbiesList, setLobbiesList] = useState<ReturnType<typeof getAllLobbies>>([]);
  const devPasswordInputRef = useRef<HTMLInputElement>(null);

  // Auto focus developer password input when auth screen opens
  useEffect(() => {
    if (showDevScreen && devScreenView === 'auth') {
      const timer = setTimeout(() => {
        devPasswordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showDevScreen, devScreenView]);

  const handleDevAuthSubmit = () => {
    const currentPassword = getDevPassword();
    if (devPasswordInput === currentPassword) {
      setDevScreenView('menu');
      setDevError(null);
      setDevPasswordInput('');
    } else {
      setDevError('Incorrect password! Please try again.');
    }
  };

  const handleChangePasswordSubmit = () => {
    if (!newPasswordInput.trim()) {
      setDevError('Please write a valid password.');
      return;
    }
    setDevPassword(newPasswordInput.trim());
    setDevSuccess('Password changed successfully!');
    setDevError(null);
    setNewPasswordInput('');
    setDevScreenView('menu');
    setTimeout(() => setDevSuccess(null), 3500);
  };

  const handleDeleteLobbyClick = (pin: string) => {
    if (onDeleteLobby) {
      onDeleteLobby(pin);
    } else {
      deleteLobby(pin);
    }
    const updated = getAllLobbies();
    setLobbiesList(updated);
    setDevSuccess(`Lobby ${pin} deleted! When joined again, it will restart from beginning.`);
    setTimeout(() => setDevSuccess(null), 3500);
  };

  // Focus input automatically on open so mobile virtual keyboard opens immediately
  useEffect(() => {
    if (isSaveBarOpen) {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
        pinInputRef.current?.select();
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [isSaveBarOpen]);

  const triggerNumberOnlyAlert = () => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setAlertMessage('Write only numbers');
    alertTimeoutRef.current = window.setTimeout(() => {
      setAlertMessage(null);
    }, 3500);
  };

  const handlePinKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Tab'
    ) {
      return;
    }
    if (e.key === 'Enter') {
      handleJoinSlotSubmit();
      return;
    }
    // If key is not a digit (0-9)
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      triggerNumberOnlyAlert();
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (/[^0-9]/.test(raw)) {
      triggerNumberOnlyAlert();
      const filtered = raw.replace(/[^0-9]/g, '').slice(0, 4);
      setPinInput(filtered);
      return;
    }
    setPinInput(raw.slice(0, 4));
  };

  const handleJoinSlotSubmit = () => {
    if (/[^0-9]/.test(pinInput) || pinInput.length === 0) {
      triggerNumberOnlyAlert();
      return;
    }
    if (pinInput.length !== 4) {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlertMessage('Write only numbers');
      alertTimeoutRef.current = window.setTimeout(() => {
        setAlertMessage(null);
      }, 3500);
      return;
    }

    if (onJoinSlot) {
      const result = onJoinSlot(pinInput);
      setIsSaveBarOpen(false);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      if (result.isNew) {
        setSuccessMessage(`Joined new lobby: ${pinInput}! Auto-saving active 🎮`);
      } else {
        setSuccessMessage(`Loaded saved settings for ${pinInput}! 💾`);
      }
      alertTimeoutRef.current = window.setTimeout(() => {
        setSuccessMessage(null);
      }, 3500);
    }
  };

  const renderSaveSlotBar = () => {
    if (!isSaveBarOpen) {
      return (
        <button
          onClick={() => {
            setIsSaveBarOpen(true);
            setPinInput(activeSlotPin || '');
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400/50 text-white shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
          title="Save or Join a 4-Digit Slot"
        >
          <span>💾</span>
          <span>{activeSlotPin ? `Slot: ${activeSlotPin}` : 'Save Game'}</span>
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-1.5 p-2 bg-slate-900/95 border border-amber-500/70 rounded-2xl shadow-2xl min-w-[200px] sm:min-w-[220px]">
        {/* Header with Title & Close button */}
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
          <span className="flex items-center gap-1">
            <span>🔢</span>
            <span>Enter 4-Digit Number</span>
          </span>
          <button
            onClick={() => setIsSaveBarOpen(false)}
            className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/90 text-xs cursor-pointer active:scale-90"
            title="Cancel"
          >
            ✕
          </button>
        </div>

        {/* 4-Digit Input Bar */}
        <div className="w-full">
          <input
            ref={pinInputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pinInput}
            onChange={handlePinChange}
            onKeyDown={handlePinKeyDown}
            placeholder="----"
            className="w-full text-center text-lg font-mono font-black tracking-[0.4em] py-1 px-3 bg-slate-950 text-amber-300 border border-slate-600 focus:border-amber-400 rounded-xl outline-none shadow-inner placeholder:tracking-[0.4em] placeholder:text-slate-600"
          />
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinSlotSubmit}
          className="w-full py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>🚀</span>
          <span>join</span>
        </button>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const handleSetSpeed = () => {
    if (!autoTimeEnabled) {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      setAlertMessage('(first on auto time)');
      alertTimeoutRef.current = window.setTimeout(() => {
        setAlertMessage(null);
      }, 3500);
      return;
    }

    const calculatedMinutes = speedMode === 'hours' && sliderHours > 0 
      ? sliderHours * 60 
      : sliderMinutes;

    if (onSetTimeSpeed) {
      onSetTimeSpeed(calculatedMinutes);
    }

    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    const speedLabel = speedMode === 'hours' && sliderHours > 0 
      ? `${sliderHours} ${sliderHours === 1 ? 'hour' : 'hours'}` 
      : `${sliderMinutes} ${sliderMinutes === 1 ? 'minute' : 'minutes'}`;
    setSuccessMessage(`Speed set to ${speedLabel} per second!`);
    alertTimeoutRef.current = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  };

  const handleToggleAudio = () => {
    const newMuted = ambientSound.toggleMute();
    setIsSoundMuted(newMuted);
  };

  const handleSaveGameAction = () => {
    if (onSaveGame) {
      const ok = onSaveGame();
      if (ok) {
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        setSuccessMessage('Game progress saved successfully! 💾');
        alertTimeoutRef.current = window.setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        setAlertMessage('Failed to save game to browser storage.');
        alertTimeoutRef.current = window.setTimeout(() => {
          setAlertMessage(null);
        }, 3000);
      }
    }
  };

  // Joystick DOM ref & state
  const joystickContainerRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);

  // JOYSTICK TOUCH & MOUSE LOGIC
  useEffect(() => {
    const container = joystickContainerRef.current;
    const knob = joystickKnobRef.current;
    if (!container || !knob) return;

    let active = false;
    let touchId: number | null = null;
    const maxRadius = 32;

    const handleMove = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      joystickInputRef.current.x = dx / maxRadius;
      joystickInputRef.current.y = dy / maxRadius;
    };

    const handleEnd = () => {
      active = false;
      touchId = null;
      knob.style.transform = `translate(0px, 0px)`;
      joystickInputRef.current.x = 0;
      joystickInputRef.current.y = 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!active && e.changedTouches.length > 0) {
        active = true;
        touchId = e.changedTouches[0].identifier;
        handleMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          handleEnd();
          break;
        }
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    // Mouse support
    let isMouseDown = false;
    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      handleMove(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown) handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        handleEnd();
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [joystickInputRef]);

  // Handlers for settings UI
  const toggleSettingsUI = () => {
    if (showSettings) {
      setShowSettings(false);
      setSettingsView('main');
    } else {
      setSettingsView('main');
      setShowSettings(true);
    }
  };

  const toggleInventoryUI = () => {
    setShowInventory((prev) => !prev);
  };

  const openTimelineScreen = () => {
    setShowTimelineScreen(true);
    setSelectedTimelineEntry(null);
  };

  const closeTimelineScreen = () => {
    setShowTimelineScreen(false);
    setSelectedTimelineEntry(null);
  };

  const openTimelineDetail = (entry: TimelineEntry) => {
    setSelectedTimelineEntry(entry);
  };

  const closeTimelineDetail = () => {
    setSelectedTimelineEntry(null);
  };

  return (
    <>
      {/* Center Crosshair Target Indicator: Visible only in First-Person View */}
      {perspective === 'first-person' && (
        <div
          id="crosshair"
          className={`pointer-events-none transition-all duration-150 ${
            canPickupPhone
              ? 'text-amber-400 font-bold scale-150 drop-shadow-[0_0_10px_rgba(251,191,36,0.95)]'
              : 'text-white/85'
          }`}
        >
          +
        </div>
      )}

      {/* Top Left Navigation Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
        {/* Main Button Row: 3 buttons only (teleport icon removed) */}
        <div className="flex items-center gap-2">
          {/* 1. Direct Camera Perspective Switch Button */}
          <button
            id="view-mode-btn"
            onClick={onTogglePerspective}
            title={perspective === 'first-person' ? 'Switch to Third Person' : 'Switch to First Person'}
            className="glass-panel px-3.5 py-2 rounded-xl text-sm font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 shadow-xl transition flex items-center justify-center cursor-pointer active:scale-95"
          >
            🎥
          </button>

          {/* 2. Bag / Inventory Toggle Button */}
          <button
            id="bag-btn"
            onClick={toggleInventoryUI}
            title="Open Inventory Hotbar"
            className="glass-panel px-3.5 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-500/40 hover:bg-red-500/20 shadow-xl transition flex items-center justify-center cursor-pointer active:scale-95"
          >
            🎒
          </button>

          {/* 3. Settings / Options Button */}
          <button
            id="settings-btn"
            onClick={toggleSettingsUI}
            title="Open Settings"
            className="glass-panel px-3.5 py-2 rounded-xl text-sm font-bold text-slate-300 border border-slate-500/40 hover:bg-slate-500/20 shadow-xl transition flex items-center justify-center cursor-pointer active:scale-95"
          >
            ⚙️
          </button>
        </div>

        {/* Auto Time Clock Display below the 3 icons */}
        {autoTimeEnabled && (
          <div
            id="auto-time-indicator"
            className="glass-panel px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-xl flex items-center gap-2 max-w-fit bg-slate-900/80 animate-fade-in"
          >
            <span className="text-sm">🕒</span>
            <span className="text-xs font-bold text-amber-300 font-mono tracking-wider">
              {autoTimeFormatted ?? '5:00 AM'}
            </span>
          </div>
        )}

        {/* Settings Bar / Control Bar */}
        {showSettings && (
          <div
            id="settings-bar"
            className="glass-panel p-2 rounded-2xl border border-slate-600/60 shadow-2xl flex flex-row flex-nowrap items-center gap-2 max-w-[90vw] w-max overflow-x-auto"
          >
            {/* 1. Main Settings Sub-View */}
            {settingsView === 'main' && (
              <div id="main-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                {/* House Settings: opens full-screen House Selection & Customization screen */}
                <button
                  onClick={() => onOpenHouseSettings ? onOpenHouseSettings() : setSettingsView('house')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                  title="Villa Selection, 3D View, Info & Customization"
                >
                  🏠 House Settings
                </button>
                {/* Player Settings: opens full-screen Player Customization studio */}
                <button
                  onClick={onOpenPlayerSettings}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                  title="Customize Player Appearance (Shirt, Pants, Shoes, Hair, Skin)"
                >
                  🧍 Player Settings
                </button>
                {/* World Settings: opens World Settings view */}
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                  title="Open World Settings"
                >
                  🌐 World settings
                </button>
              </div>
            )}

            {/* House Architectural Design Settings Sub-View */}
            {settingsView === 'house' && (
              <div id="house-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('main')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Main Settings"
                >
                  ◀
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectHouseTheme && onSelectHouseTheme('blue')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer ${
                      houseTheme === 'blue'
                        ? 'bg-blue-600/90 border-blue-400 text-white shadow-blue-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50 text-slate-200'
                    }`}
                    title="Blue Luxury Villa"
                  >
                    <span>💙</span>
                    <span>Blue Luxury</span>
                  </button>
                  <button
                    onClick={() => onSelectHouseTheme && onSelectHouseTheme('pink')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer ${
                      houseTheme === 'pink'
                        ? 'bg-pink-600/90 border-pink-400 text-white shadow-pink-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50 text-slate-200'
                    }`}
                    title="Pink Dollhouse"
                  >
                    <span>💖</span>
                    <span>Pink Dollhouse</span>
                  </button>
                  <button
                    onClick={() => onSelectHouseTheme && onSelectHouseTheme('modern')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer ${
                      houseTheme === 'modern'
                        ? 'bg-slate-700/90 border-slate-400 text-white shadow-slate-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50 text-slate-200'
                    }`}
                    title="Modern Slate Villa"
                  >
                    <span>🏢</span>
                    <span>Modern Slate</span>
                  </button>
                  <button
                    onClick={() => onSelectHouseTheme && onSelectHouseTheme('gold')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer ${
                      houseTheme === 'gold'
                        ? 'bg-amber-600/90 border-amber-400 text-white shadow-amber-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-600/50 text-slate-200'
                    }`}
                    title="Royal Gold Villa"
                  >
                    <span>👑</span>
                    <span>Royal Gold</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Game Settings Sub-View: 6 buttons in one row (Sky, Land, Trees, World, About, Save Game) */}
            {settingsView === 'game' && (
              <div id="game-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('main')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Main Settings"
                >
                  ◀
                </button>
                <button
                  onClick={() => setSettingsView('sky')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  ☁️ Sky
                </button>
                <button
                  onClick={() => setSettingsView('land')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🏡 Land
                </button>
                <button
                  onClick={() => setSettingsView('trees')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🌳 Trees
                </button>
                <button
                  onClick={() => setSettingsView('world')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                  title="Open Game Settings"
                >
                  🎮 Game
                </button>
                <button
                  onClick={() => setSettingsView('about')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  💬 About
                </button>
              </div>
            )}

            {/* 3. Sky Settings Sub-View: 3 buttons in one row (Time, Color, Design) */}
            {settingsView === 'sky' && (
              <div id="sky-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to World Settings"
                >
                  ◀
                </button>
                <button
                  onClick={() => setSettingsView('sky_time')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  ⏳ Time
                </button>
                <button
                  onClick={() => setSettingsView('sky_color')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🎨 Color
                </button>
                <button
                  onClick={() => setSettingsView('sky_design')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  💭 Design
                </button>
                <button
                  onClick={() => setSettingsView('sky_weather')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🌦️ Weather
                </button>
              </div>
            )}

            {/* Sky Weather Sub-View: 🌨️Snow fall 🌧️Rain 🌩️Thunder 🌪️Tornado 🚫Normal */}
            {settingsView === 'sky_weather' && (
              <div id="sky-weather-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('sky')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer self-stretch flex items-center justify-center"
                  title="Back to Sky Settings"
                >
                  ◀
                </button>
                <div className="flex flex-row items-center gap-1.5">
                  <button
                    onClick={() => onSelectWeather?.('snow')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                      weather === 'snow'
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                    }`}
                  >
                    🌨️ Snow fall
                  </button>
                  <button
                    onClick={() => onSelectWeather?.('rain')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                      weather === 'rain'
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                    }`}
                  >
                    🌧️ Rain
                  </button>
                  <button
                    onClick={() => onSelectWeather?.('thunder')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                      weather === 'thunder'
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                    }`}
                  >
                    🌩️ Thunder
                  </button>
                  <button
                    onClick={() => onSelectWeather?.('tornado')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                      weather === 'tornado'
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold animate-pulse'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                    }`}
                  >
                    🌪️ Tornado {tornadoSecondsLeft && tornadoSecondsLeft > 0 ? `(${tornadoSecondsLeft}s)` : ''}
                  </button>
                  <button
                    onClick={() => onSelectWeather?.('normal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                      weather === null || weather === 'normal'
                        ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                    }`}
                  >
                    🚫 Normal
                  </button>
                </div>
              </div>
            )}

            {/* Sky Design Sub-View */}
            {settingsView === 'sky_design' && (
              <div id="sky-design-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('sky')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Sky Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: ☁️Clouds ☀️Sun 🌑Moon 🌈Rainbow */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectSkyDesign('clouds')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        skyDesign === 'clouds'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      ☁️ Clouds
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('sun')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        skyDesign === 'sun'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      ☀️ Sun
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('moon')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        skyDesign === 'moon'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌑 Moon
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('rainbow')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        skyDesign === 'rainbow'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌈 Rainbow
                    </button>
                  </div>
                  {/* Row 2: ⭐Stars 🌌Galaxy 🪐Saturn 💨Clear */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectSkyDesign('stars')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      ⭐ Stars
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('galaxy')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌌 Galaxy
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('saturn')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🪐 Saturn
                    </button>
                    <button
                      onClick={() => onSelectSkyDesign('clear')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      💨 Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sky Time Sub-View */}
            {settingsView === 'sky_time' && (
              <div id="sky-time-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('sky')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Sky Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🌄Sunrise ⛅Morning 🌅Day */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTime('sunrise')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌄 Sunrise
                    </button>
                    <button
                      onClick={() => onSelectTime('morning')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      ⛅ Morning
                    </button>
                    <button
                      onClick={() => onSelectTime('day')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌅 Day
                    </button>
                  </div>
                  {/* Row 2: 🌤️Noon 🌌Night 🌑Midnight */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTime('noon')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌤️ Noon
                    </button>
                    <button
                      onClick={() => onSelectTime('night')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌌 Night
                    </button>
                    <button
                      onClick={() => onSelectTime('midnight')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌑 Midnight
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sky Color Picker Sub-View */}
            {settingsView === 'sky_color' && (
              <div id="sky-color-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('sky')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Sky Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🟥 🟧 🟨 🟩 🟦 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectSkyColor('#ef4444')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Red"
                    >
                      🟥
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#f97316')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Orange"
                    >
                      🟧
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#eab308')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Yellow"
                    >
                      🟨
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#22c55e')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Green"
                    >
                      🟩
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#3b82f6')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Blue"
                    >
                      🟦
                    </button>
                  </div>
                  {/* Row 2: 🟪 ⬛️ ⬜️ 🟫 🚫 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectSkyColor('#a855f7')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Purple"
                    >
                      🟪
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#18181b')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Black"
                    >
                      ⬛️
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#f8fafc')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="White"
                    >
                      ⬜️
                    </button>
                    <button
                      onClick={() => onSelectSkyColor('#78350f')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Brown"
                    >
                      🟫
                    </button>
                    <button
                      onClick={() => onSelectSkyColor(null)}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Reset Sky to Normal"
                    >
                      🚫
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Land Settings Sub-View: 2 buttons in one row (Place, Color) */}
            {settingsView === 'land' && (
              <div id="land-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to World Settings"
                >
                  ◀
                </button>
                <button
                  onClick={() => setSettingsView('land_place')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🗺️ Place
                </button>
                <button
                  onClick={() => setSettingsView('land_color')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🎨 Color
                </button>
              </div>
            )}

            {/* Land Color Picker Sub-View */}
            {settingsView === 'land_color' && (
              <div id="land-color-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('land')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Land Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🟥 🟧 🟨 🟩 🟦 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLandColor('#ef4444')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Red"
                    >
                      🟥
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#f97316')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Orange"
                    >
                      🟧
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#eab308')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Yellow"
                    >
                      🟨
                    </button>
                    <button
                      onClick={() => onSelectLandColor(null)}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Green (Normal State)"
                    >
                      🟩
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#3b82f6')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Blue"
                    >
                      🟦
                    </button>
                  </div>
                  {/* Row 2: 🟪 ⬛️ ⬜️ 🟫 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLandColor('#a855f7')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Purple"
                    >
                      🟪
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#18181b')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Black"
                    >
                      ⬛️
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#f8fafc')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="White"
                    >
                      ⬜️
                    </button>
                    <button
                      onClick={() => onSelectLandColor('#78350f')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Brown"
                    >
                      🟫
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Land Place (Biomes) Sub-View: 
                Row 1: 🏜️Desert  🌳Grass
                Row 2: 🏝️Island  🏔️Ice  ⛰️Mountain
            */}
            {settingsView === 'land_place' && (
              <div id="land-place-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('land')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer self-stretch flex items-center justify-center"
                  title="Back to Land Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🏜️ Desert   🌳 Grass */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLandPlace?.('desert')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        landPlace === 'desert'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🏜️ Desert
                    </button>
                    <button
                      onClick={() => onSelectLandPlace?.('grass')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        landPlace === 'grass'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌳 Grass
                    </button>
                  </div>
                  {/* Row 2: 🏝️ Island   🏔️ Ice   ⛰️ Mountain */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLandPlace?.('island')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        landPlace === 'island'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🏝️ Island
                    </button>
                    <button
                      onClick={() => onSelectLandPlace?.('ice')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        landPlace === 'ice'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🏔️ Ice
                    </button>
                    <button
                      onClick={() => onSelectLandPlace?.('mountain')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        landPlace === 'mountain'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      ⛰️ Mountain
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Trees Settings Sub-View: 
                If treeType === 'cactus' || treeType === 'bamboo', only show Color and Type buttons:
                ◀  🎨 Color  🌲 Type
                Otherwise (classic, evergreen, palm, christmas), show:
                ◀  🪵 Wood   🌿 Leaf  🌲 Type
            */}
            {settingsView === 'trees' && (
              <div id="trees-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to World Settings"
                >
                  ◀
                </button>
                {treeType === 'cactus' || treeType === 'bamboo' ? (
                  <button
                    onClick={() => setSettingsView('trees_color')}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    🎨 Color
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setSettingsView('trees_wood')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🪵 Wood
                    </button>
                    <button
                      onClick={() => setSettingsView('trees_leaf')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      🌿 Leaf
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSettingsView('trees_type')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🌲 Type
                </button>
              </div>
            )}

            {/* Tree Wood Color Picker Sub-View */}
            {settingsView === 'trees_wood' && (
              <div id="trees-wood-color-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('trees')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Trees Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🟥 🟧 🟨 🟩 🟦 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectWoodColor('#ef4444')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Red"
                    >
                      🟥
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#f97316')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Orange"
                    >
                      🟧
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#eab308')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Yellow"
                    >
                      🟨
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#22c55e')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Green"
                    >
                      🟩
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#3b82f6')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Blue"
                    >
                      🟦
                    </button>
                  </div>
                  {/* Row 2: 🟪 ⬛️ ⬜️ 🟫 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectWoodColor('#a855f7')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Purple"
                    >
                      🟪
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#18181b')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Black"
                    >
                      ⬛️
                    </button>
                    <button
                      onClick={() => onSelectWoodColor('#f8fafc')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="White"
                    >
                      ⬜️
                    </button>
                    <button
                      onClick={() => onSelectWoodColor(null)}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Brown (Normal State)"
                    >
                      🟫
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tree Leaf Color Picker Sub-View */}
            {settingsView === 'trees_leaf' && (
              <div id="trees-leaf-color-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('trees')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Trees Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🟥 🟧 🟨 🟩 🟦 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLeafColor('#ef4444')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Red"
                    >
                      🟥
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#f97316')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Orange"
                    >
                      🟧
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#eab308')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Yellow"
                    >
                      🟨
                    </button>
                    <button
                      onClick={() => onSelectLeafColor(null)}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Green (Normal State)"
                    >
                      🟩
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#3b82f6')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Blue"
                    >
                      🟦
                    </button>
                  </div>
                  {/* Row 2: 🟪 ⬛️ ⬜️ 🟫 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectLeafColor('#a855f7')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Purple"
                    >
                      🟪
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#18181b')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Black"
                    >
                      ⬛️
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#f8fafc')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="White"
                    >
                      ⬜️
                    </button>
                    <button
                      onClick={() => onSelectLeafColor('#78350f')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Brown"
                    >
                      🟫
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tree Type Selector Sub-View (2 rows: Row 1 Cactus, Evergreen, Bamboo; Row 2 Classic, Palm, Christmas) */}
            {settingsView === 'trees_type' && (
              <div id="trees-type-settings-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('trees')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer self-stretch flex items-center justify-center"
                  title="Back to Trees Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🌵 Cactus  🌲 Evergreen  🎋 Bamboo */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTreeType?.('cactus')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'cactus'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌵 Cactus
                    </button>
                    <button
                      onClick={() => onSelectTreeType?.('evergreen')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'evergreen'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌲 Evergreen
                    </button>
                    <button
                      onClick={() => onSelectTreeType?.('bamboo')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'bamboo'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🎋 Bamboo
                    </button>
                  </div>
                  {/* Row 2: 🌳 Classic  🌴 Palm  🎄 Christmas */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTreeType?.('classic')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'classic'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌳 Classic
                    </button>
                    <button
                      onClick={() => onSelectTreeType?.('palm')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'palm'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🌴 Palm
                    </button>
                    <button
                      onClick={() => onSelectTreeType?.('christmas')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer shadow-md ${
                        treeType === 'christmas'
                          ? 'bg-amber-500/25 border-2 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200'
                      }`}
                    >
                      🎄 Christmas
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tree Single Color (Cactus & Bamboo) Picker Sub-View */}
            {settingsView === 'trees_color' && (
              <div id="trees-single-color-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('trees')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to Trees Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1.5">
                  {/* Row 1: 🟥 🟧 🟨 🟩 🟦 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTreeColor?.('#ef4444')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Red"
                    >
                      🟥
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#f97316')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Orange"
                    >
                      🟧
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#eab308')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Yellow"
                    >
                      🟨
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#22c55e')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Green"
                    >
                      🟩
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#3b82f6')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Blue"
                    >
                      🟦
                    </button>
                  </div>
                  {/* Row 2: 🟪 ⬛️ ⬜️ 🌿 */}
                  <div className="flex flex-row items-center gap-1.5">
                    <button
                      onClick={() => onSelectTreeColor?.('#a855f7')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Purple"
                    >
                      🟪
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#18181b')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Black"
                    >
                      ⬛️
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.('#f8fafc')}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="White"
                    >
                      ⬜️
                    </button>
                    <button
                      onClick={() => onSelectTreeColor?.(null)}
                      className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 flex items-center justify-center text-lg active:scale-95 cursor-pointer transition"
                      title="Natural (Reset)"
                    >
                      🌿
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Settings Sub-View (opened via ⚙️ -> World settings -> Game): 2 Rows */}
            {settingsView === 'world' && (
              <div id="game-sub-settings-view" className="flex flex-row items-center gap-2">
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer self-stretch flex items-center justify-center"
                  title="Back to World Settings"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-2">
                  {/* Row 1: Sound Toggle, Auto Time Toggle, Time Speed Button */}
                  <div className="flex flex-row items-center gap-2">
                    {/* Sound Toggle (Text: only "Sound") */}
                    <button
                      onClick={handleToggleAudio}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer ${
                        isSoundMuted
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 hover:bg-rose-900/70'
                          : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/70'
                      }`}
                      title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
                    >
                      <span>Sound</span>
                      <div
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                          isSoundMuted ? 'bg-slate-700 justify-start' : 'bg-emerald-500 justify-end'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>

                    {/* Auto Time Toggle */}
                    <button
                      onClick={onToggleAutoTime}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border shadow-md transition flex items-center gap-2 active:scale-95 whitespace-nowrap cursor-pointer ${
                        !autoTimeEnabled
                          ? 'bg-slate-800/80 border-slate-600/50 text-slate-300 hover:bg-slate-700/80'
                          : 'bg-amber-950/70 border-amber-500/50 text-amber-200 hover:bg-amber-900/70'
                      }`}
                      title={autoTimeEnabled ? 'Turn Off Auto Time' : 'Turn On Auto Time'}
                    >
                      <span>Auto Time</span>
                      <div
                        className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                          !autoTimeEnabled ? 'bg-slate-700 justify-start' : 'bg-amber-500 justify-end'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                      </div>
                    </button>

                    {/* Time Speed Button */}
                    <button
                      onClick={() => setSettingsView('time_speed')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                      title="Open Time Speed Settings"
                    >
                      <span>⏱️ Time speed</span>
                    </button>
                  </div>

                  {/* Row 2: Save Button (for lobby join) & Developer Button (for manage lobbies) */}
                  <div className="flex flex-row items-center gap-2">
                    {/* 4-Digit Save Game / Join Slot Bar */}
                    {renderSaveSlotBar()}

                    {/* Developer Button (For Manage Lobbies) */}
                    <button
                      onClick={() => {
                        setShowDevScreen(true);
                        setDevScreenView('auth');
                        setDevPasswordInput('');
                        setDevError(null);
                        setDevSuccess(null);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 border border-amber-400/50 text-slate-950 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                      title="Open Developer Access (Manage Lobbies)"
                    >
                      <span>🔐</span>
                      <span>DEVELOPER</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Time Speed Bar (3 Rows: Minutes range slider, Hours range slider, Set Speed button) */}
            {settingsView === 'time_speed' && (
              <div id="time-speed-settings-view" className="flex flex-col gap-2.5 p-2 min-w-[280px] sm:min-w-[340px] max-w-sm">
                {/* Header with back navigation button */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSettingsView('world')}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                      title="Back to Game Settings"
                    >
                      ◀
                    </button>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>⏱️</span>
                      <span>Time Speed</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {speedMode === 'hours' && sliderHours > 0 ? `${sliderHours} hr / sec` : `${sliderMinutes} min / sec`}
                  </span>
                </div>

                {/* Row 1: Horizontal Range Slider for Minutes (1-60) with live counting */}
                <div className="flex flex-col gap-1 bg-slate-800/40 p-2 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>Minutes:</span>
                      {speedMode === 'minutes' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          ACTIVE
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                      {sliderMinutes} min / sec
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">1</span>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      step="1"
                      value={sliderMinutes}
                      onChange={(e) => {
                        setSliderMinutes(Number(e.target.value));
                        setSpeedMode('minutes');
                      }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">60</span>
                  </div>
                </div>

                {/* Row 2: Horizontal Range Slider for Hours (0-24) with live counting */}
                <div className="flex flex-col gap-1 bg-slate-800/40 p-2 rounded-xl border border-slate-700/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>Hours:</span>
                      {speedMode === 'hours' && sliderHours > 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                          ACTIVE
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded border border-amber-500/30">
                      {sliderHours > 0 ? `${sliderHours} hr / sec` : '0 hr (off)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">0</span>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={sliderHours}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSliderHours(val);
                        if (val > 0) {
                          setSpeedMode('hours');
                        } else {
                          setSpeedMode('minutes');
                        }
                      }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">24</span>
                  </div>
                </div>

                {/* Row 3: Button "set speed" */}
                <div className="flex items-center justify-end pt-1 border-t border-slate-700/60">
                  <button
                    onClick={handleSetSpeed}
                    className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>⚡</span>
                    <span>set speed</span>
                  </button>
                </div>
              </div>
            )}

            {/* 6. About Settings Sub-View */}
            {settingsView === 'about' && (
              <div id="about-settings-view" className="flex flex-row flex-nowrap items-center gap-2">
                <button
                  onClick={() => setSettingsView('game')}
                  className="px-2 py-2 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  title="Back to World Settings"
                >
                  ◀
                </button>
                <button
                  onClick={() => setSettingsView('developer')}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🧑‍💻 Developer
                </button>
                <button
                  onClick={openTimelineScreen}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  🕰️ Timeline
                </button>
              </div>
            )}

            {/* 7. Developer Info Sub-View */}
            {settingsView === 'developer' && (
              <div id="developer-settings-view" className="flex flex-col items-center gap-2 max-w-xs sm:max-w-sm">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setSettingsView('about')}
                    className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-700/80 hover:bg-slate-600/80 text-amber-300 transition active:scale-95 cursor-pointer"
                  >
                    ◀ Back
                  </button>
                  <span className="text-xs text-amber-300 font-bold">About the Creator</span>
                </div>
                <span className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/90 border border-amber-500/40 text-amber-200 shadow-md whitespace-normal leading-relaxed text-center block">
                  This game was an idea of Muhammad Huzaifa Hamid .He developed this game with the help of Gemini
                </span>
              </div>
            )}
          </div>
        )}

        {/* Inventory Hotbar Panel - 9 boxes (slot 2 has mobile phone initially) */}
        {showInventory && (
          <div
            id="inventory-bar"
            className="glass-panel p-2 rounded-2xl border border-slate-600/60 shadow-2xl flex items-center gap-1.5 max-w-fit"
          >
            {inventorySlots.map((item, index) => (
              <div
                key={index}
                onClick={() => onSlotClick(index)}
                className={`inventory-slot ${item === 'phone' ? 'border-amber-400/90 bg-slate-900/90' : heldItem === 'phone' ? 'border-dashed border-sky-400/70 hover:bg-sky-500/20' : ''}`}
                title={item === 'phone' ? 'Mobile Phone (Click to take out)' : heldItem === 'phone' ? 'Click to place mobile phone here' : `Empty Slot ${index + 1}`}
              >
                {item === 'phone' && (
                  <span className="text-xl select-none animate-bounce-short">📱</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Phone Mockup Above Joystick (in Off-State, Clickable to Open) */}
      {heldItem === 'phone' && !isPhoneScreenOpen && (
        <div
          id="held-phone-container"
          onClick={() => {
            setIsPhoneScreenOpen(true);
            setIsPhoneUnlocked(false);
          }}
          className="absolute z-30 pointer-events-auto select-none flex flex-col items-center cursor-pointer group active:scale-95 transition-all"
          style={{ bottom: '144px', left: '46px' }}
          title="Click to Open Mobile Phone"
        >
          {/* Modern Flagship Smartphone in Off-State */}
          <div className="relative w-[68px] h-[124px] bg-slate-950 rounded-[20px] p-[2.5px] border-2 border-slate-500/80 shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(56,189,248,0.3)] flex flex-col justify-between overflow-hidden group-hover:border-sky-400/90 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(56,189,248,0.6)] transition-all">
            {/* Screen Glass Surface (Deep Off-Black with Subtle Glare) */}
            <div className="relative w-full h-full bg-gradient-to-b from-[#090d16] via-[#04060a] to-[#0a0f1d] rounded-[17px] flex flex-col justify-between items-center py-2 px-1">
              {/* Top Dynamic Island / Camera Notch */}
              <div className="w-5 h-1.5 bg-[#141b2d] rounded-full shadow-inner border border-slate-800 flex items-center justify-end px-0.5">
                <div className="w-1 h-1 rounded-full bg-slate-900/90" />
              </div>

              {/* Diagonal Glass Reflection Glare */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent pointer-events-none rounded-[17px]" />

              {/* Subtle Screen Power Standby Glow */}
              <div className="opacity-20 flex flex-col items-center justify-center">
                <span className="text-slate-400 text-xs"></span>
              </div>

              {/* Bottom Home Gesture Bar */}
              <div className="w-7 h-[2.5px] bg-slate-600/70 rounded-full shadow-sm" />
            </div>

            {/* Subtle Side Buttons */}
            <div className="absolute -left-[3px] top-6 w-[2px] h-3 bg-slate-400 rounded-l" />
            <div className="absolute -left-[3px] top-11 w-[2px] h-3 bg-slate-400 rounded-l" />
            <div className="absolute -right-[3px] top-8 w-[2px] h-4 bg-slate-400 rounded-r" />
          </div>

          {/* Status Label Tag with Click Prompt */}
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-bold text-slate-300 shadow-md group-hover:border-sky-400 group-hover:text-sky-300 transition-colors flex items-center gap-1">
            <span>📱</span>
            <span>Click to Open</span>
          </div>
        </div>
      )}

      {/* Fullscreen Interactive Smartphone Overlay in Front of Screen */}
      {heldItem === 'phone' && isPhoneScreenOpen && (
        <div
          id="fullscreen-phone-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 select-none animate-fade-in"
          onClick={(e) => {
            // Clicking backdrop returns phone to off-state above joystick
            if (e.target === e.currentTarget) {
              setIsPhoneScreenOpen(false);
              setIsPhoneUnlocked(false);
            }
          }}
        >
          {/* Smartphone Hardware Body */}
          <div className="relative w-[340px] sm:w-[380px] h-[660px] sm:h-[720px] max-h-[92vh] bg-slate-950 rounded-[48px] p-3 border-4 border-slate-700/90 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(56,189,248,0.35)] flex flex-col overflow-hidden">
            {/* Left Hardware Side Buttons (Volume) */}
            <div className="absolute -left-[6px] top-28 w-[3px] h-10 bg-slate-500 rounded-l" />
            <div className="absolute -left-[6px] top-42 w-[3px] h-10 bg-slate-500 rounded-l" />

            {/* Right Hardware Side Button (Power button) */}
            <button
              onClick={() => {
                setIsPhoneScreenOpen(false);
                setIsPhoneUnlocked(false);
              }}
              title="Physical Power Button"
              className="absolute -right-[6px] top-32 w-[4px] h-14 bg-slate-500 rounded-r hover:bg-rose-500 cursor-pointer active:scale-95 transition-colors"
            />

            {/* Smartphone Screen Display */}
            <div
              className={`relative w-full h-full rounded-[38px] overflow-hidden flex flex-col justify-between transition-colors duration-300 ${
                isPhoneUnlocked
                  ? 'bg-[#7dd3fc]'
                  : 'bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950'
              }`}
              onTouchStart={(e) => {
                setPhoneTouchStartY(e.touches[0].clientY);
              }}
              onTouchEnd={(e) => {
                if (phoneTouchStartY !== null && !isPhoneUnlocked) {
                  const endY = e.changedTouches[0].clientY;
                  if (phoneTouchStartY - endY > 40) {
                    setIsPhoneUnlocked(true);
                  }
                }
                setPhoneTouchStartY(null);
              }}
              onMouseDown={(e) => {
                setPhoneTouchStartY(e.clientY);
              }}
              onMouseUp={(e) => {
                if (phoneTouchStartY !== null && !isPhoneUnlocked) {
                  if (phoneTouchStartY - e.clientY > 40) {
                    setIsPhoneUnlocked(true);
                  }
                }
                setPhoneTouchStartY(null);
              }}
            >
              {/* Top Status Bar & Dynamic Island */}
              <div className="w-full pt-3 px-6 flex items-center justify-between z-20 pointer-events-none">
                {/* Time Display */}
                <span
                  className={`text-xs font-bold font-mono tracking-tight flex items-center gap-1.5 ${
                    isPhoneUnlocked ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  {autoTimeEnabled ? (
                    <>
                      <span>{autoTimeFormatted ?? '5:00 AM'}</span>
                      <span className="opacity-60">•</span>
                      <span>{getTimeLabel(timeOfDay)}</span>
                    </>
                  ) : (
                    <span>{getTimeLabel(timeOfDay)}</span>
                  )}
                </span>

                {/* Dynamic Island Pill */}
                <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-blue-950" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Battery & Network Icons */}
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    isPhoneUnlocked ? 'text-slate-800' : 'text-slate-200'
                  }`}
                >
                  <span className="text-[10px]">5G</span>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* STATE 1: Lockscreen with Swipe Up to Open */}
              {!isPhoneUnlocked ? (
                <div className="flex-1 flex flex-col justify-between items-center py-8 px-6 text-white">
                  {/* Top Lock Icon & Clock / Sky Time Display */}
                  <div className="flex flex-col items-center gap-2 mt-4 text-center">
                    {autoTimeEnabled ? (
                      <>
                        <span className="text-xl opacity-80">🔒</span>
                        <h1 className="text-5xl font-light tracking-tight font-sans drop-shadow-md">
                          {autoTimeFormatted
                            ? autoTimeFormatted.replace(/ (AM|PM)/i, '')
                            : '5:00'}
                        </h1>
                        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 shadow">
                          <span className="text-base">{getTimeIcon(timeOfDay)}</span>
                          <span className="text-xs font-bold uppercase tracking-wider">{getTimeLabel(timeOfDay)}</span>
                          <span className="text-[11px] font-mono text-slate-300">
                            {autoTimeFormatted?.match(/(AM|PM)/i)?.[0] ?? ''}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl drop-shadow select-none animate-pulse">
                          {getTimeIcon(timeOfDay)}
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-sans drop-shadow-md capitalize text-white">
                          {getTimeLabel(timeOfDay)}
                        </h1>
                        <span className="text-xs font-semibold tracking-wider text-sky-300 uppercase bg-slate-900/80 px-3.5 py-1 rounded-full border border-sky-500/40 shadow">
                          Sky Time
                        </span>
                      </>
                    )}
                  </div>

                  {/* Swipe Up Button & Gesture Handle */}
                  <div className="w-full flex flex-col items-center gap-3 mb-2">
                    <button
                      onClick={() => setIsPhoneUnlocked(true)}
                      className="group flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md shadow-lg transition active:scale-95 cursor-pointer animate-pulse"
                      title="Swipe Up or Click to Open Mobile"
                    >
                      <span className="text-lg text-white font-bold group-hover:-translate-y-1 transition-transform animate-bounce">
                        ▲
                      </span>
                      <span className="text-[11px] font-bold tracking-widest text-white uppercase">
                        Swipe Up To Open
                      </span>
                    </button>

                    {/* Bottom Home Swipe Bar */}
                    <div
                      onClick={() => setIsPhoneUnlocked(true)}
                      className="w-32 h-1.5 bg-white/70 hover:bg-white rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
                      title="Swipe Up to Open"
                    />
                  </div>
                </div>
              ) : (
                /* STATE 2: Unlocked Homescreen (Fully Light Blue Wallpaper, Only "Power Off" App with 🛑 icon in Upper Left Corner) */
                <div className="flex-1 flex flex-col justify-between p-4">
                  {/* Upper-Left Corner App Grid */}
                  <div className="flex items-start justify-start pt-3 pl-2">
                    {/* The Square Shape Power Off App with 🛑 Icon */}
                    <button
                      onClick={() => {
                        // Power off mobile, return to off-state above joystick
                        setIsPhoneScreenOpen(false);
                        setIsPhoneUnlocked(false);
                      }}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-90 transition-transform"
                      title="Power Off Mobile"
                    >
                      {/* Square Shape App Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-white/95 hover:bg-white border-2 border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all group-hover:shadow-[0_10px_25px_rgba(239,68,68,0.4)] group-hover:border-red-400">
                        {/* 🛑 Icon */}
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                          🛑
                        </span>
                      </div>
                      {/* App Name: "Power Off" */}
                      <span className="text-xs font-bold text-slate-800 tracking-tight select-none drop-shadow-sm">
                        Power Off
                      </span>
                    </button>
                  </div>

                  {/* Empty Screen Space (No other apps) */}
                  <div className="flex-1" />

                  {/* Bottom Home Indicator Bar */}
                  <div className="w-full flex justify-center pb-2">
                    <div
                      onClick={() => {
                        // Power off mobile and return to off-state above joystick
                        setIsPhoneScreenOpen(false);
                        setIsPhoneUnlocked(false);
                      }}
                      className="w-32 h-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-full cursor-pointer transition-all"
                      title="Home Gesture"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Touch Virtual Joystick Container */}
      <div id="joystick-container" ref={joystickContainerRef}>
        <div id="joystick-knob" ref={joystickKnobRef} />
      </div>

      {/* Hand Action Button Above Jump Button */}
      {(heldItem === 'phone' || canPickupPhone) && (
        <button
          id="hand-action-btn"
          onClick={onHandAction}
          className="absolute z-30 w-14 h-14 rounded-full bg-slate-900/90 hover:bg-slate-800/95 border-2 border-white shadow-[0_4px_22px_rgba(0,0,0,0.85),0_0_15px_rgba(255,255,255,0.45)] flex items-center justify-center cursor-pointer active:scale-90 transition-all backdrop-blur-md"
          style={{ bottom: '108px', right: '35px' }}
          title={heldItem === 'phone' ? 'Drop Mobile Phone' : 'Pick Up Mobile Phone'}
        >
          {/* White Color Hand Icon SVG */}
          <svg
            className="w-7 h-7 text-white fill-white drop-shadow-md"
            viewBox="0 0 24 24"
          >
            <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5v6.25a.75.75 0 0 0 1.5 0V4.5a1.5 1.5 0 0 1 3 0v5.25a.75.75 0 0 0 1.5 0V6.5a1.5 1.5 0 0 1 3 0v7c0 4.97-4.03 9-9 9s-9-4.03-9-9v-3a1.5 1.5 0 0 1 3 0v3.25a.75.75 0 0 0 1.5 0V3.5A1.5 1.5 0 0 1 12 2z" />
          </svg>
        </button>
      )}

      {/* On-Screen Action Jump Button */}
      <div id="jump-btn" onClick={onJump} title="Jump / Boost">
        <span className="text-2xl select-none">⬆️</span>
      </div>

      {/* Fullscreen Timeline Screen Overlay */}
      {showTimelineScreen && !selectedTimelineEntry && (
        <div
          id="timeline-screen"
          className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl p-6 flex flex-col items-center justify-start overflow-y-auto"
        >
          {/* Top Header with Back Button */}
          <div className="w-full max-w-md flex items-center justify-between mb-8 pb-4 border-b border-slate-700/60">
            <button
              onClick={closeTimelineScreen}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              🔙 Back
            </button>
            <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
              🕰️ Timeline
            </h2>
            <div className="w-16" />
          </div>

          {/* Timeline Event Buttons List */}
          <div className="w-full max-w-md flex flex-col gap-3">
            {TIMELINE_ENTRIES.map((entry) => (
              <button
                key={entry.id}
                onClick={() => openTimelineDetail(entry)}
                className="w-full text-left px-5 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 shadow-md transition active:scale-[0.98] cursor-pointer flex items-center justify-between"
              >
                <span>
                  {entry.dateStr}, {entry.dayStr}
                </span>
                <span className="text-amber-400 text-xs">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Timeline Detail Screen Overlay (Sep 7, Sep 8, Sep 9 & beyond) */}
      {showTimelineScreen && selectedTimelineEntry && (
        <div
          id={
            selectedTimelineEntry.id === 'sep7'
              ? 'timeline-detail-screen'
              : selectedTimelineEntry.id === 'sep8'
              ? 'timeline-detail-screen-sep8'
              : 'timeline-detail-screen-sep9'
          }
          className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl p-6 flex flex-col items-center justify-start overflow-y-auto"
        >
          {/* Top Header with Back Button on Left and Date on Right */}
          <div className="w-full max-w-lg flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
            <button
              onClick={closeTimelineDetail}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600/60 text-slate-200 shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              🔙 Back
            </button>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-bold text-amber-300">
                {selectedTimelineEntry.dateStr}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {selectedTimelineEntry.dayStr}
              </div>
            </div>
          </div>

          {/* Detail Content Box */}
          <div className="w-full max-w-lg bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 border-b border-slate-700/50 pb-2">
              {selectedTimelineEntry.title}
            </h3>
            <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {selectedTimelineEntry.events.map((event, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{event}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Screen Alert message when time speed is set without auto time: (first on auto time) */}
      {alertMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce">
          <div className="glass-panel px-5 py-3 rounded-2xl border-2 border-amber-500 bg-slate-950/95 shadow-2xl flex items-center gap-3 text-amber-300">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-bold tracking-wide font-mono">
              {alertMessage}
            </span>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="glass-panel px-4 py-2.5 rounded-2xl border border-emerald-500/80 bg-slate-950/95 shadow-2xl flex items-center gap-2.5 text-emerald-300 animate-fade-in">
            <span className="text-base">⚡</span>
            <span className="text-xs font-bold tracking-wide">
              {successMessage}
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Black Developer Screen Overlay */}
      {showDevScreen && (
        <div
          id="developer-black-screen"
          className="fixed inset-0 z-50 bg-black text-white flex flex-col p-4 sm:p-8 overflow-y-auto font-sans animate-fade-in select-none"
        >
          {/* Top Bar with Back Arrow Button to return to game */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-800">
            <button
              onClick={() => {
                setShowDevScreen(false);
                setDevScreenView('auth');
                setDevPasswordInput('');
                setDevError(null);
                setDevSuccess(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700/80 shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer"
              title="Back to Game"
            >
              <span className="text-lg">←</span>
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                <span>🔐</span>
                <span>DEVELOPER ACCESS</span>
              </span>
            </div>
          </div>

          {/* Central Body View */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10">
            {/* View 1: Auth Screen (Password required: default 0000) */}
            {devScreenView === 'auth' && (
              <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
                  🔐
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Write password first to get developer access
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Enter the developer security password to continue.
                  </p>
                </div>

                {/* Password Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDevAuthSubmit();
                  }}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="relative w-full">
                    <input
                      ref={devPasswordInputRef}
                      type="password"
                      autoFocus
                      value={devPasswordInput}
                      onChange={(e) => {
                        setDevPasswordInput(e.target.value);
                        setDevError(null);
                      }}
                      placeholder="Enter password"
                      className="w-full py-3 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-center text-lg tracking-[0.3em] focus:border-amber-400 focus:outline-none transition shadow-inner placeholder:tracking-normal placeholder:text-zinc-600"
                    />
                  </div>

                  {devError && (
                    <div className="text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-500/40 py-2 px-3 rounded-lg">
                      ⚠️ {devError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Unlock Developer Access
                  </button>
                </form>
              </div>
            )}

            {/* View 2: Developer Dashboard (Change Password & Lobbies) */}
            {devScreenView === 'menu' && (
              <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚙️</span>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-white">Developer Access Granted</h2>
                      <p className="text-xs text-zinc-400">Manage security & saved player lobbies</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    ONLINE
                  </span>
                </div>

                {devSuccess && (
                  <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 py-2.5 px-3.5 rounded-xl">
                    ✓ {devSuccess}
                  </div>
                )}

                {/* Primary Action Buttons: Change Password & Lobbies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    onClick={() => {
                      setDevScreenView('change_password');
                      setNewPasswordInput('');
                      setDevError(null);
                      setDevSuccess(null);
                    }}
                    className="py-4 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-amber-400/60 text-white font-bold text-sm transition flex flex-col items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg"
                  >
                    <span className="text-2xl">🔑</span>
                    <span>Change Password</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Set custom security password</span>
                  </button>

                  <button
                    onClick={() => {
                      setDevScreenView('lobbies');
                      setLobbiesList(getAllLobbies());
                      setDevError(null);
                      setDevSuccess(null);
                    }}
                    className="py-4 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 hover:border-amber-400/60 text-white font-bold text-sm transition flex flex-col items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg"
                  >
                    <span className="text-2xl">👥</span>
                    <span>Lobbies</span>
                    <span className="text-[11px] text-zinc-400 font-normal">View & delete saved lobbies</span>
                  </button>
                </div>
              </div>
            )}

            {/* View 3: Change Password Form */}
            {devScreenView === 'change_password' && (
              <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <button
                    onClick={() => setDevScreenView('menu')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <h2 className="text-base font-bold text-white">Change Password</h2>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChangePasswordSubmit();
                  }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-300">New Developer Password</label>
                    <input
                      type="text"
                      autoFocus
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {devError && (
                    <div className="text-xs font-semibold text-rose-400 bg-rose-950/50 border border-rose-500/40 py-2 px-3 rounded-lg">
                      ⚠️ {devError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    Save New Password
                  </button>
                </form>
              </div>
            )}

            {/* View 4: Lobbies List with Trash Icon to Delete */}
            {devScreenView === 'lobbies' && (
              <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-5 max-h-[75vh]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <button
                    onClick={() => setDevScreenView('menu')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-700 flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  <div className="text-center">
                    <h2 className="text-base font-bold text-white">Saved Player Lobbies</h2>
                    <span className="text-[11px] text-zinc-400">Total: {lobbiesList.length}</span>
                  </div>
                  <button
                    onClick={() => setLobbiesList(getAllLobbies())}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 cursor-pointer active:scale-90"
                    title="Refresh Lobbies"
                  >
                    🔄
                  </button>
                </div>

                {devSuccess && (
                  <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 py-2 px-3 rounded-lg">
                    ✓ {devSuccess}
                  </div>
                )}

                {/* List of Lobbies */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
                  {lobbiesList.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-zinc-500">
                      <span className="text-3xl">📭</span>
                      <span className="text-sm font-semibold">No saved lobbies found</span>
                      <span className="text-xs text-zinc-600">
                        When players save their game with 4-digit codes, they will be listed here.
                      </span>
                    </div>
                  ) : (
                    lobbiesList.map((item) => (
                      <div
                        key={item.pin}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono font-black text-amber-400 text-base">
                            {item.pin}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Lobby #{item.pin}</span>
                              {item.state?.autoTimeEnabled && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                                  Auto-Time
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Theme: {item.state?.houseTheme || 'blue'} • Land: {item.state?.landType || 'grass'}
                            </span>
                          </div>
                        </div>

                        {/* Trash Icon Button to Delete Lobby */}
                        <button
                          onClick={() => handleDeleteLobbyClick(item.pin)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-950/40 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 hover:text-white transition active:scale-90 cursor-pointer shadow-md"
                          title={`Delete Lobby ${item.pin}`}
                        >
                          <span className="text-base">🗑️</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
