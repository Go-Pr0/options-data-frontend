import React from 'react';

const TimeRangeSelector = ({ timeRange, onTimeRangeChange }) => {
  const timeRanges = [
    { value: 1, label: '1H', description: '1 Hour' },
    { value: 6, label: '6H', description: '6 Hours' },
    { value: 12, label: '12H', description: '12 Hours' },
    { value: 24, label: '1D', description: '1 Day' },
    { value: 48, label: '2D', description: '2 Days' },
    { value: 168, label: '1W', description: '1 Week' }
  ];

  return (
    <div className="time-range-selector">
      <label className="form-label">Time Range</label>
      <div className="btn-group">
        {timeRanges.map(({ value, label, description }) => (
          <button
            key={value}
            className={`btn btn-sm ${timeRange === value ? 'active' : 'btn-secondary'}`}
            onClick={() => onTimeRangeChange(value)}
            title={description}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;