/**
 * 🎨 QuickShop - Global Styles Management Hook
 * Hook לניהול צבעים וסגנונות גלובליים במערכת
 */

import { useEffect, useCallback, useState } from 'react';
import { useFonts } from './useFonts';

// צבעי ברירת מחדל
const DEFAULT_COLORS = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderColor: '#e5e7eb'
};

// הגדרות ברירת מחדל
const DEFAULT_SETTINGS = {
  fontFamily: 'Noto Sans Hebrew',
  rtl: true,
  ...DEFAULT_COLORS
};

export const useGlobalStyles = (initialSettings = {}) => {
  const [globalSettings, setGlobalSettings] = useState({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });
  
  const { loadAndApplyFont, getAvailableFonts } = useFonts();

  // החלת צבעים על CSS Custom Properties
  const applyColors = useCallback((colors) => {
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // המרה לשמות CSS variables
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
        
        // הוספת וריאציות של הצבע (lighter, darker)
        if (key === 'primaryColor' || key === 'secondaryColor') {
          const rgb = hexToRgb(value);
          if (rgb) {
            // גרסה בהירה יותר (opacity 10%)
            root.style.setProperty(`${cssVarName}-light`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
            // גרסה בהירה יותר (opacity 20%)
            root.style.setProperty(`${cssVarName}-lighter`, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
            // גרסה כהה יותר
            root.style.setProperty(`${cssVarName}-dark`, darkenColor(value, 20));
          }
        }
      }
    });
    
    console.log('🎨 Applied global colors:', colors);
  }, []);

  // החלת הגדרות RTL
  const applyRTL = useCallback((isRTL) => {
    const root = document.documentElement;
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    root.style.setProperty('--text-direction', isRTL ? 'rtl' : 'ltr');
    
    console.log(`🌐 Applied RTL: ${isRTL}`);
  }, []);

  // החלת כל ההגדרות הגלובליות
  const applyGlobalStyles = useCallback(async (settings) => {
    const newSettings = { ...globalSettings, ...settings };
    
    // החלת צבעים
    const colors = {
      primaryColor: newSettings.primaryColor,
      secondaryColor: newSettings.secondaryColor,
      accentColor: newSettings.accentColor,
      backgroundColor: newSettings.backgroundColor,
      textColor: newSettings.textColor,
      borderColor: newSettings.borderColor
    };
    applyColors(colors);
    
    // החלת פונט
    if (newSettings.fontFamily) {
      await loadAndApplyFont(newSettings.fontFamily);
    }
    
    // החלת RTL
    if (typeof newSettings.rtl === 'boolean') {
      applyRTL(newSettings.rtl);
    }
    
    setGlobalSettings(newSettings);
    
    console.log('✅ Applied all global styles:', newSettings);
  }, [globalSettings, applyColors, loadAndApplyFont, applyRTL]);

  // עדכון הגדרה בודדת
  const updateSetting = useCallback(async (key, value) => {
    const newSettings = { ...globalSettings, [key]: value };
    await applyGlobalStyles(newSettings);
  }, [globalSettings, applyGlobalStyles]);

  // איפוס להגדרות ברירת מחדל
  const resetToDefaults = useCallback(async () => {
    await applyGlobalStyles(DEFAULT_SETTINGS);
  }, [applyGlobalStyles]);

  // קבלת CSS class עבור צבע ראשי
  const getPrimaryColorClass = useCallback((type = 'bg') => {
    switch (type) {
      case 'bg':
        return 'bg-[var(--primary-color)]';
      case 'text':
        return 'text-[var(--primary-color)]';
      case 'border':
        return 'border-[var(--primary-color)]';
      case 'bg-light':
        return 'bg-[var(--primary-color-light)]';
      default:
        return 'bg-[var(--primary-color)]';
    }
  }, []);

  // קבלת CSS class עבור צבע משני
  const getSecondaryColorClass = useCallback((type = 'bg') => {
    switch (type) {
      case 'bg':
        return 'bg-[var(--secondary-color)]';
      case 'text':
        return 'text-[var(--secondary-color)]';
      case 'border':
        return 'border-[var(--secondary-color)]';
      case 'bg-light':
        return 'bg-[var(--secondary-color-light)]';
      default:
        return 'bg-[var(--secondary-color)]';
    }
  }, []);

  // החלת הגדרות ראשוניות בטעינה
  useEffect(() => {
    applyGlobalStyles(globalSettings);
  }, []); // רק בטעינה הראשונה

  return {
    globalSettings,
    applyGlobalStyles,
    updateSetting,
    resetToDefaults,
    applyColors,
    applyRTL,
    getPrimaryColorClass,
    getSecondaryColorClass,
    availableFonts: getAvailableFonts(),
    defaultSettings: DEFAULT_SETTINGS
  };
};

// פונקציות עזר
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 - percent) / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default useGlobalStyles;
