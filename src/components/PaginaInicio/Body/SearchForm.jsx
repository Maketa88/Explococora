import React, { useState } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const SearchForm = ({ onSearch }) => {
  const [duration, setDuration] = useState('30min');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ duration, date });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-full shadow-lg overflow-hidden border border-white/20 hover:bg-white/90 transition-all duration-300"
    >
      <div className="flex items-center h-16">
        {/* Time Selection */}
        <div className="flex-1 flex items-center pl-6 border-r border-gray-200/50">
          <Clock className="w-5 h-5 text-blue-600 mr-3" />
          <select
            id="duration"
            className="w-full bg-transparent text-gray-800 font-medium focus:outline-none cursor-pointer"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="30min">30 Minutos</option>
            <option value="1hour">1 Hora</option>
          </select>
        </div>

        {/* Date */}
        <div className="flex-1 flex items-center pl-6">
          <Calendar className="w-5 h-5 text-blue-600 mr-3" />
          <input
            type="date"
            id="date"
            className="w-full bg-transparent text-gray-800 font-medium focus:outline-none cursor-pointer"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <div className="pl-6 pr-2">
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-sm uppercase tracking-wide"
          >
            Buscar
          </button>
        </div>
      </div>
    </form>
  );
};
