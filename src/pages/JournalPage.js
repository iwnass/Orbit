import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import storageService from '../services/storage';

function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await storageService.getJournalEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setEditedTitle(entry.title);
    setEditingTitle(false);
  };

  const handleSaveTitle = async () => {
    if (selectedEntry && editedTitle.trim()) {
      const updatedEntry = { ...selectedEntry, title: editedTitle.trim() };
      await storageService.saveJournalEntry(updatedEntry);
      setEditingTitle(false);
      loadEntries();
      setSelectedEntry(updatedEntry);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await storageService.deleteJournalEntry(entryId);
      loadEntries();
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };

  const getPreview = (content) => {
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  return (
    <div className="h-screen flex">
      {/* Grid View */}
      <div className="w-2/5 bg-gray-50 border-r border-gray-200 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Journal Entries</h1>
          
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p>No journal entries yet.</p>
              <p className="text-sm mt-2">Start writing in Today's page!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleEntryClick(entry)}
                  className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedEntry?.id === entry.id
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{entry.title}</h3>
                    <span className="text-xs text-gray-500">
                      {format(parseISO(entry.date), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {getPreview(entry.content)}
                  </p>
                  {entry.hours && (entry.hours.job > 0 || entry.hours.class > 0) && (
                    <div className="mt-2 flex gap-2 text-xs text-gray-500">
                      {entry.hours.job > 0 && <span>💼 {entry.hours.job}h</span>}
                      {entry.hours.class > 0 && <span>📚 {entry.hours.class}h</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-auto">
        {selectedEntry ? (
          <div className="max-w-3xl mx-auto p-8">
            <div className="mb-6">
              {editingTitle ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="flex-1 text-3xl font-bold border-b-2 border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingTitle(false);
                      setEditedTitle(selectedEntry.title);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <h1
                    className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingTitle(true)}
                  >
                    {selectedEntry.title}
                  </h1>
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              )}
              <p className="text-gray-500 mt-2">
                {format(parseISO(selectedEntry.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {selectedEntry.hours && (selectedEntry.hours.job > 0 || selectedEntry.hours.class > 0) && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Hours Logged</h3>
                <div className="flex gap-4">
                  {selectedEntry.hours.job > 0 && (
                    <div className="flex items-center gap-2">
                      <span>💼</span>
                      <span className="text-gray-700">{selectedEntry.hours.job} hours at work</span>
                    </div>
                  )}
                  {selectedEntry.hours.class > 0 && (
                    <div className="flex items-center gap-2">
                      <span>📚</span>
                      <span className="text-gray-700">{selectedEntry.hours.class} hours in class</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedEntry.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select an entry to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JournalPage;
