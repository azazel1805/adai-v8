import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';

type Theme = 'light' | 'dark' | 'system';

export const SettingsView: React.FC = () => {
  // Initialize state from localStorage or default to 'system'
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === 'system') {
      localStorage.removeItem('theme');
      // The global effect in App.tsx will handle applying the correct theme
    } else {
      localStorage.setItem('theme', newTheme);
    }
    // Manually dispatch a storage event to trigger the theme handler in App.tsx immediately
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Görünüm</h2>
        <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">Uygulama genelinde kullanılacak renk temasını seçin.</p>
            <div className="flex space-x-2 pt-2">
                <Button
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                    onClick={() => handleThemeChange('light')}
                    className="flex-1"
                >
                    Açık
                </Button>
                <Button
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                    onClick={() => handleThemeChange('dark')}
                    className="flex-1"
                >
                    Koyu
                </Button>
                <Button
                    variant={theme === 'system' ? 'primary' : 'secondary'}
                    onClick={() => handleThemeChange('system')}
                    className="flex-1"
                >
                    Sistem
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};