import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <label className="toggle">
        <input
          type="checkbox"
          checked={isDark}
          onChange={toggleTheme}
          aria-label="Toggle theme"
        />
        <span className="toggle-slider"></span>
      </label>
      <span className="theme-label">
        {isDark ? (
          <span className="flex items-center gap-xs">
            🌙 <span className="text-sm">Dark</span>
          </span>
        ) : (
          <span className="flex items-center gap-xs">
            ☀️ <span className="text-sm">Light</span>
          </span>
        )}
      </span>
    </div>
  );
};

export default ThemeToggle;