import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import storageService from '../services/storage';

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [editHours, setEditHours] = useState({ job: 0, class: 0 });

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      const data = await storageService.getCalendarData();
      setCalendarData(data);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const handleSaveHours = async (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    await storageService.saveCalendarDay(dateKey, editHours);
    await loadCalendarData();
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDate(date);
    setEditHours(calendarData[dateKey] || { job: 0, class: 0 });
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Pad with days from previous/next month to fill the grid
    const firstDayOfWeek = start.getDay();
    const lastDayOfWeek = end.getDay();
    
    const paddingStart = Array(firstDayOfWeek).fill(null);
    const paddingEnd = Array(6 - lastDayOfWeek).fill(null);
    
    return [...paddingStart, ...days, ...paddingEnd];
  };

  const getDaysInWeek = () => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getTotalHours = (dateKey) => {
    const data = calendarData[dateKey];
    if (!data) return 0;
    return (data.job || 0) + (data.class || 0);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {weekDays.map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="bg-white min-h-24"></div>;
            }
            
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasData = calendarData[dateKey];
            const totalHours = getTotalHours(dateKey);
            
            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(day)}
                className={`bg-white min-h-24 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isSameMonth(day, currentDate) ? 'opacity-40' : ''
                } ${isToday(day) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {format(day, 'd')}
                </div>
                {hasData && (
                  <div className="text-xs space-y-1">
                    {hasData.job > 0 && (
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        💼 {hasData.job}h
                      </div>
                    )}
                    {hasData.class > 0 && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        📚 {hasData.class}h
                      </div>
                    )}
                    <div className="text-gray-600 font-semibold">
                      Total: {totalHours}h
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getDaysInWeek();

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasData = calendarData[dateKey];
            const totalHours = getTotalHours(dateKey);
            
            return (
              <div
                key={dateKey}
                onClick={() => handleDateClick(day)}
                className={`bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday(day) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className={`text-center mb-4 ${
                  isToday(day) ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className="text-2xl font-bold">{format(day, 'd')}</div>
                </div>
                {hasData && (
                  <div className="space-y-2">
                    {hasData.job > 0 && (
                      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-center">
                        <div className="text-xs">Work</div>
                        <div className="font-bold">{hasData.job}h</div>
                      </div>
                    )}
                    {hasData.class > 0 && (
                      <div className="bg-green-100 text-green-800 px-3 py-2 rounded text-center">
                        <div className="text-xs">Class</div>
                        <div className="font-bold">{hasData.class}h</div>
                      </div>
                    )}
                    <div className="text-center text-gray-600 font-semibold text-sm">
                      Total: {totalHours}h
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => view === 'month' ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(subWeeks(currentDate, 1))}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
          </h1>
          <button
            onClick={() => view === 'month' ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1))}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            →
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Today
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-md ${
              view === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-md ${
              view === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {view === 'month' ? renderMonthView() : renderWeekView()}

      {/* Edit Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editHours.job}
                  onChange={(e) => setEditHours({ ...editHours, job: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editHours.class}
                  onChange={(e) => setEditHours({ ...editHours, class: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleSaveHours(selectedDate)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
