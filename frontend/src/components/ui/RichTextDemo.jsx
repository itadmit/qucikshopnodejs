import React, { useState } from 'react';
import { RichTextEditor } from './index.js';

const RichTextDemo = () => {
  const [content, setContent] = useState(`
    <h2>ברוכים הבאים לעורך הטקסט העשיר!</h2>
    <p>זהו דוגמה לשימוש בעורך הטקסט העשיר שלנו. אתם יכולים:</p>
    <ul>
      <li><strong>להדגיש טקסט</strong></li>
      <li><em>לכתוב בנטוי</em></li>
      <li><u>להוסיף קו תחתון</u></li>
      <li>לשנות גודל פונט</li>
      <li>לשנות צבעים</li>
      <li>ליישר טקסט למרכז, לימין או לשמאל</li>
    </ul>
    <p style="text-align: center;">זהו טקסט ממורכז</p>
    <p>אתם יכולים גם <a href="https://example.com">להוסיף קישורים</a></p>
    <hr>
    <p>ולהוסיף קווים מפרידים!</p>
  `);

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">דוגמה לעורך טקסט עשיר</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">עורך הטקסט:</h2>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="התחל לכתוב כאן..."
            minHeight="200px"
            maxHeight="400px"
          />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">תצוגה מקדימה של התוכן:</h2>
          <div 
            className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-32"
            dangerouslySetInnerHTML={{ __html: content }}
            dir="rtl"
          />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">HTML גולמי:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto border">
            <code>{content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RichTextDemo;
