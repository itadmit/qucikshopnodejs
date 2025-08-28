/**
 * 🎨 QuickShop - Font Management Hook
 * Hook לניהול טעינה דינמית של פונטים מ-Google Fonts ו-@fontsource
 */

import { useEffect, useCallback } from 'react';
import WebFont from 'webfontloader';

// רשימת הפונטים הזמינים עם תמיכה בעברית
const AVAILABLE_FONTS = {
  'Inter': {
    name: 'Inter',
    source: 'fontsource',
    hebrewSupport: false,
    fallback: 'sans-serif'
  },
  'Heebo': {
    name: 'Heebo',
    source: 'fontsource',
    hebrewSupport: true,
    fallback: 'sans-serif'
  },
  'Assistant': {
    name: 'Assistant',
    source: 'fontsource',
    hebrewSupport: true,
    fallback: 'sans-serif'
  },
  'Rubik': {
    name: 'Rubik',
    source: 'fontsource',
    hebrewSupport: true,
    fallback: 'sans-serif'
  },
  'Noto Sans Hebrew': {
    name: 'Noto Sans Hebrew',
    source: 'google',
    hebrewSupport: true,
    fallback: 'sans-serif'
  },
  'Open Sans': {
    name: 'Open Sans',
    source: 'google',
    hebrewSupport: false,
    fallback: 'sans-serif'
  },
  'Roboto': {
    name: 'Roboto',
    source: 'google',
    hebrewSupport: false,
    fallback: 'sans-serif'
  }
};

// Cache לפונטים שכבר נטענו
const loadedFonts = new Set();

export const useFonts = () => {
  
  // טעינת פונט מ-@fontsource
  const loadFontsourceFont = useCallback(async (fontName) => {
    try {
      switch (fontName) {
        case 'Inter':
          await import('@fontsource/inter/400.css');
          await import('@fontsource/inter/500.css');
          await import('@fontsource/inter/600.css');
          await import('@fontsource/inter/700.css');
          break;
        case 'Heebo':
          await import('@fontsource/heebo/400.css');
          await import('@fontsource/heebo/500.css');
          await import('@fontsource/heebo/600.css');
          await import('@fontsource/heebo/700.css');
          break;
        case 'Assistant':
          await import('@fontsource/assistant/400.css');
          await import('@fontsource/assistant/500.css');
          await import('@fontsource/assistant/600.css');
          await import('@fontsource/assistant/700.css');
          break;
        case 'Rubik':
          await import('@fontsource/rubik/400.css');
          await import('@fontsource/rubik/500.css');
          await import('@fontsource/rubik/600.css');
          await import('@fontsource/rubik/700.css');
          break;
        case 'Noto Sans Hebrew':
          // Already loaded in main.jsx, but ensure it's marked as loaded
          break;
        default:
          console.warn(`Font ${fontName} not available in @fontsource`);
      }
      console.log(`✅ Loaded @fontsource font: ${fontName}`);
    } catch (error) {
      console.error(`❌ Failed to load @fontsource font ${fontName}:`, error);
    }
  }, []);

  // טעינת פונט מ-Google Fonts
  const loadGoogleFont = useCallback((fontName) => {
    return new Promise((resolve, reject) => {
      WebFont.load({
        google: {
          families: [`${fontName}:400,500,600,700`]
        },
        active: () => {
          console.log(`✅ Loaded Google font: ${fontName}`);
          resolve();
        },
        inactive: () => {
          console.error(`❌ Failed to load Google font: ${fontName}`);
          reject(new Error(`Failed to load ${fontName}`));
        }
      });
    });
  }, []);

  // טעינת פונט (אוטומטית בוחרת את המקור הנכון)
  const loadFont = useCallback(async (fontName) => {
    if (!fontName || loadedFonts.has(fontName)) {
      return; // כבר נטען
    }

    const fontConfig = AVAILABLE_FONTS[fontName];
    if (!fontConfig) {
      console.warn(`Font ${fontName} not found in available fonts`);
      return;
    }

    try {
      if (fontConfig.source === 'fontsource') {
        await loadFontsourceFont(fontName);
      } else if (fontConfig.source === 'google') {
        await loadGoogleFont(fontName);
      }
      
      loadedFonts.add(fontName);
    } catch (error) {
      console.error(`Failed to load font ${fontName}:`, error);
    }
  }, [loadFontsourceFont, loadGoogleFont]);

  // החלת פונט על האלמנט (סטורפרונט + קאנבס הבילדר)
  const applyFont = useCallback((fontName, targetSelector = '.storefront-content') => {
    const fontConfig = AVAILABLE_FONTS[fontName];
    if (!fontConfig) {
      console.warn(`Font ${fontName} not found`);
      return;
    }

    const fontFamily = `"${fontConfig.name}", ${fontConfig.fallback}`;
    
    // עדכון CSS custom property לסטורפרונט
    document.documentElement.style.setProperty('--storefront-font-family', fontFamily);
    
    // החלת הפונט על אלמנטים ספציפיים של הסטורפרונט והקאנבס
    const storefrontElements = document.querySelectorAll(targetSelector);
    storefrontElements.forEach(element => {
      element.style.fontFamily = fontFamily;
    });
    
    console.log(`🎨 Applied storefront font: ${fontFamily} to ${storefrontElements.length} elements`);
  }, []);

  // טעינה והחלה של פונט בפעולה אחת (רק לסטורפרונט)
  const loadAndApplyFont = useCallback(async (fontName, targetSelector = '.storefront-content') => {
    await loadFont(fontName);
    applyFont(fontName, targetSelector);
  }, [loadFont, applyFont]);

  // קבלת רשימת הפונטים הזמינים
  const getAvailableFonts = useCallback(() => {
    return Object.keys(AVAILABLE_FONTS).map(key => ({
      value: key,
      label: key,
      hebrewSupport: AVAILABLE_FONTS[key].hebrewSupport,
      source: AVAILABLE_FONTS[key].source
    }));
  }, []);

  // קבלת פונטים עם תמיכה בעברית בלבד
  const getHebrewFonts = useCallback(() => {
    return getAvailableFonts().filter(font => font.hebrewSupport);
  }, [getAvailableFonts]);

  return {
    loadFont,
    applyFont,
    loadAndApplyFont,
    getAvailableFonts,
    getHebrewFonts,
    availableFonts: AVAILABLE_FONTS,
    loadedFonts: Array.from(loadedFonts)
  };
};

export default useFonts;
