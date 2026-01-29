import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import storageService from '../services/storage';
import { debounce } from '../utils/helpers';

function TodayPage() {
  const [content, setContent] = useState('');
  const [hours, setHours] = useState({ job: 0, class: 0 });
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTodayContent();
  }, []);

  const loadTodayContent = async () => {
    try {
      const data = await storageService.getTodayContent();
      setContent(data.content || '');
      setHours(data.hours || { job: 0, class: 0 });
    } catch (error) {
      console.error('Error loading today content:', error);
    }
  };

  const saveContent = async (newContent, newHours) => {
    try {
      setIsSaving(true);
      await storageService.saveTodayContent(newContent, newHours);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((newContent, newHours) => {
      saveContent(newContent, newHours);
    }, 1000),
    []
  );

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedSave(newContent, hours);
  };

  const handleHoursChange = (type, value) => {
    const newHours = { ...hours, [type]: parseFloat(value) || 0 };
    setHours(newHours);
    saveContent(content, newHours);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>
            {isSaving ? 'Saving...' : lastSaved ? `Last saved at ${format(lastSaved, 'h:mm a')}` : 'Ready'}
          </span>
        </div>
      </div>

      {/* Hours Tracker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Today's Hours</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Job Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={hours.job}
              onChange={(e) => handleHoursChange('job', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Class Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={hours.class}
              onChange={(e) => handleHoursChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Journal Text Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing about your day..."
          className="w-full h-96 resize-none border-none focus:outline-none text-gray-700 leading-relaxed"
          style={{ fontSize: '16px' }}
        />
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        This entry will be saved to your journal at midnight
      </div>
    </div>
  );
}

export default TodayPage;
