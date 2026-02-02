import { useState, useEffect } from 'react';
import TodayPage from './pages/TodayPage';
import JournalPage from './pages/JournalPage';
import NotesPage from './pages/NotesPage';
import CalendarPage from './pages/CalendarPage';
import GoalsPage from './pages/GoalsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('today');

  useEffect(() => {
    // Discord Activity per Page :)
    const activityMap = {
      today: 'Writing in Today\'s Journal',
      journal: 'Browsing Past Entries',
      notes: 'Managing Notes',
      calendar: 'Planning Schedule',
      goals: 'Tracking Financial Goals'
    };

    if (window.electron && window.electron.setDiscordActivity) {
      window.electron.setDiscordActivity(activityMap[currentPage] || 'Using Orbit');
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <TodayPage />;
      case 'journal':
        return <JournalPage />;
      case 'notes':
        return <NotesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'goals':
        return <GoalsPage />;
      default:
        return <TodayPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Orbit</h1>
          <p className="text-sm text-gray-500 mt-1">Your Personal Space</p>
        </div>

        <div className="flex-1 px-3">
          <button
            onClick={() => setCurrentPage('today')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === 'today'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📝 Today
          </button>

          <button
            onClick={() => setCurrentPage('journal')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === 'journal'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📖 Journal
          </button>

          <button
            onClick={() => setCurrentPage('notes')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === 'notes'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Notes
          </button>

          <button
            onClick={() => setCurrentPage('calendar')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === 'calendar'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            📅 Calendar
          </button>

          <button
            onClick={() => setCurrentPage('goals')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === 'goals'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            💰 Goals
          </button>
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            v1.0.8
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;