import express from 'express';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';
import { Store } from '../models/Store.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * קבלת הגדרות פיקסלים לחנות
 */
router.get('/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    // קבלת הגדרות הפיקסלים
    const pixelSettings = await prisma.store.findUnique({
      where: { id: parseInt(storeId) },
      select: {
        facebookPixelId: true,
        facebookAccessToken: true,
        googleTagManagerId: true,
        googleAnalyticsId: true,
        pixelSettings: true
      }
    });

    res.json({
      success: true,
      data: pixelSettings
    });

  } catch (error) {
    console.error('Error fetching pixel settings:', error);
    res.status(500).json({
      error: 'Failed to fetch pixel settings',
      message: error.message
    });
  }
});

/**
 * עדכון הגדרות פיקסלים לחנות
 */
router.put('/:storeId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const {
      facebookPixelId,
      facebookAccessToken,
      googleTagManagerId,
      googleAnalyticsId,
      pixelSettings
    } = req.body;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    // ולידציה של הפיקסלים
    const validationErrors = [];

    if (facebookPixelId && !/^\d{15,16}$/.test(facebookPixelId)) {
      validationErrors.push('Facebook Pixel ID must be 15-16 digits');
    }

    if (googleAnalyticsId && !/^G-[A-Z0-9]{10}$/.test(googleAnalyticsId)) {
      validationErrors.push('Google Analytics ID must be in format G-XXXXXXXXXX');
    }

    if (googleTagManagerId && !/^GTM-[A-Z0-9]{7}$/.test(googleTagManagerId)) {
      validationErrors.push('Google Tag Manager ID must be in format GTM-XXXXXXX');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: validationErrors
      });
    }

    // עדכון ההגדרות
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(storeId) },
      data: {
        facebookPixelId: facebookPixelId || null,
        facebookAccessToken: facebookAccessToken || null,
        googleTagManagerId: googleTagManagerId || null,
        googleAnalyticsId: googleAnalyticsId || null,
        pixelSettings: pixelSettings || null
      },
      select: {
        facebookPixelId: true,
        facebookAccessToken: true,
        googleTagManagerId: true,
        googleAnalyticsId: true,
        pixelSettings: true
      }
    });

    res.json({
      success: true,
      message: 'Pixel settings updated successfully',
      data: updatedStore
    });

  } catch (error) {
    console.error('Error updating pixel settings:', error);
    res.status(500).json({
      error: 'Failed to update pixel settings',
      message: error.message
    });
  }
});

/**
 * בדיקת תקינות הגדרות פיקסל
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const {
      facebookPixelId,
      googleAnalyticsId,
      googleTagManagerId
    } = req.body;

    const validationResults = {
      facebookPixel: { isValid: true, errors: [] },
      googleAnalytics: { isValid: true, errors: [] },
      googleTagManager: { isValid: true, errors: [] }
    };

    // בדיקת Facebook Pixel
    if (facebookPixelId) {
      if (!/^\d{15,16}$/.test(facebookPixelId)) {
        validationResults.facebookPixel.isValid = false;
        validationResults.facebookPixel.errors.push('Facebook Pixel ID must be 15-16 digits');
      }
    }

    // בדיקת Google Analytics
    if (googleAnalyticsId) {
      if (!/^G-[A-Z0-9]{10}$/.test(googleAnalyticsId)) {
        validationResults.googleAnalytics.isValid = false;
        validationResults.googleAnalytics.errors.push('Google Analytics ID must be in format G-XXXXXXXXXX');
      }
    }

    // בדיקת Google Tag Manager
    if (googleTagManagerId) {
      if (!/^GTM-[A-Z0-9]{7}$/.test(googleTagManagerId)) {
        validationResults.googleTagManager.isValid = false;
        validationResults.googleTagManager.errors.push('Google Tag Manager ID must be in format GTM-XXXXXXX');
      }
    }

    const allValid = Object.values(validationResults).every(result => result.isValid);

    res.json({
      success: true,
      isValid: allValid,
      results: validationResults
    });

  } catch (error) {
    console.error('Error validating pixel settings:', error);
    res.status(500).json({
      error: 'Failed to validate pixel settings',
      message: error.message
    });
  }
});

/**
 * בדיקת חיבור לפיקסל Facebook (אם יש access token)
 */
router.post('/test-facebook/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    const storeData = await prisma.store.findUnique({
      where: { id: parseInt(storeId) },
      select: {
        facebookPixelId: true,
        facebookAccessToken: true
      }
    });

    if (!storeData.facebookPixelId) {
      return res.status(400).json({
        error: 'Facebook Pixel ID not configured'
      });
    }

    // כאן ניתן להוסיף בדיקה אמיתית מול Facebook API
    // אם יש access token
    if (storeData.facebookAccessToken) {
      // TODO: בדיקה מול Facebook Marketing API
      // const response = await fetch(`https://graph.facebook.com/v18.0/${storeData.facebookPixelId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${storeData.facebookAccessToken}`
      //   }
      // });
    }

    res.json({
      success: true,
      message: 'Facebook Pixel configuration appears valid',
      pixelId: storeData.facebookPixelId,
      hasAccessToken: !!storeData.facebookAccessToken
    });

  } catch (error) {
    console.error('Error testing Facebook pixel:', error);
    res.status(500).json({
      error: 'Failed to test Facebook pixel',
      message: error.message
    });
  }
});

/**
 * קבלת דוגמאות קוד להטמעה ידנית
 */
router.get('/code-examples/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    const storeData = await prisma.store.findUnique({
      where: { id: parseInt(storeId) },
      select: {
        facebookPixelId: true,
        googleTagManagerId: true,
        googleAnalyticsId: true
      }
    });

    const codeExamples = {};

    // דוגמת קוד Facebook Pixel
    if (storeData.facebookPixelId) {
      codeExamples.facebookPixel = `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${storeData.facebookPixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${storeData.facebookPixelId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`;
    }

    // דוגמת קוד Google Analytics
    if (storeData.googleAnalyticsId) {
      codeExamples.googleAnalytics = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${storeData.googleAnalyticsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${storeData.googleAnalyticsId}');
</script>`;
    }

    // דוגמת קוד Google Tag Manager
    if (storeData.googleTagManagerId) {
      codeExamples.googleTagManager = `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${storeData.googleTagManagerId}');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${storeData.googleTagManagerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
    }

    res.json({
      success: true,
      data: codeExamples
    });

  } catch (error) {
    console.error('Error generating code examples:', error);
    res.status(500).json({
      error: 'Failed to generate code examples',
      message: error.message
    });
  }
});

export default router;
