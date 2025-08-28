import { EventEmitter } from 'events';

/**
 * מערכת אירועים מרכזית למערכת
 * מאפשרת הפרדה בין לוגיקה עסקית ופעולות נלוות
 */
class SystemEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // מגדיל את מספר המאזינים המותר
  }

  /**
   * הפעלת אירוע עם לוגים
   */
  emitEvent(eventName, data) {
    console.log(`🔔 Event emitted: ${eventName}`, { 
      timestamp: new Date().toISOString(),
      dataKeys: Object.keys(data || {})
    });
    
    this.emit(eventName, data);
  }

  /**
   * הרשמה לאירוע עם לוגים
   */
  onEvent(eventName, handler) {
    console.log(`👂 Event listener registered: ${eventName}`);
    this.on(eventName, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`❌ Error in event handler for ${eventName}:`, error);
        // לא זורק שגיאה כדי לא לעצור אירועים אחרים
      }
    });
  }
}

// יצירת instance יחיד למערכת כולה
const systemEvents = new SystemEventEmitter();

export default systemEvents;
