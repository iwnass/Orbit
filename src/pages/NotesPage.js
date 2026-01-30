import { useState, useEffect } from 'react';
import storageService from '../services/storage';

const CATEGORIES = {
  personal: { name: 'Personal', icon: '👤' },
  school: { name: 'School', icon: '📚'},
  work: { name: 'Work', icon: '💼' },
  ideas: { name: 'Ideas', icon: '💡' },
  random: { name: 'Random', icon: '🎲' }
};

function NotesPage() {
  const [notes, setNotes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('personal');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({ title: '', content: '', attachments: [] });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await storageService.getNotes();
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setEditedNote({ title: '', content: '', attachments: [] });
    setIsEditing(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setEditedNote({ ...note });
    setIsEditing(true);
  };

  const handleSaveNote = async () => {
    if (!editedNote.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const noteToSave = {
      ...editedNote,
      id: selectedNote?.id || Date.now(),
      updatedAt: new Date().toISOString()
    };

    await storageService.saveNote(selectedCategory, noteToSave);
    await loadNotes();
    setIsEditing(false);
    setSelectedNote(noteToSave);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await storageService.deleteNote(selectedCategory, noteId);
      await loadNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const relativePath = await storageService.saveAttachment(file, editedNote.id || Date.now());
        setEditedNote(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), { name: file.name, path: relativePath, type: file.type }]
        }));
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload ' + file.name);
      }
    }
  };

  const handleRemoveAttachment = (index) => {
    setEditedNote(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const categoryNotes = notes[selectedCategory] || [];

  return (
    <div className="h-screen flex">
      {/* Categories Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
        {Object.entries(CATEGORIES).map(([key, { name, icon }]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key);
              setSelectedNote(null);
              setIsEditing(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
              selectedCategory === key
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{icon}</span>
            {name}
            <span className="float-right text-sm text-gray-500">
              {(notes[key] || []).length}
            </span>
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {CATEGORIES[selectedCategory].name}
          </h2>
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            + New
          </button>
        </div>

        <div className="p-2">
          {categoryNotes.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No notes yet</p>
            </div>
          ) : (
            categoryNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditing(false);
                }}
                className={`p-4 mb-2 rounded-lg cursor-pointer transition-all ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <h3 className="font-semibold text-gray-800 mb-1">{note.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {note.content.substring(0, 100)}
                </p>
                {note.attachments && note.attachments.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    📎 {note.attachments.length} attachment{note.attachments.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Detail/Editor */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <div className="max-w-3xl mx-auto p-8">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {selectedNote ? 'Edit Note' : 'New Note'}
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (!selectedNote) setEditedNote({ title: '', content: '', attachments: [] });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>

            <input
              type="text"
              value={editedNote.title || ''}
              onChange={(e) => setEditedNote(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Note title"
              className="w-full text-2xl font-semibold mb-4 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none pb-2"
              autoFocus
            />

            <textarea
              value={editedNote.content || ''}
              onChange={(e) => setEditedNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Start writing..."
              className="w-full h-64 resize-none border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Attachments</h3>
                <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer text-sm">
                  + Add Files
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {editedNote.attachments && editedNote.attachments.length > 0 && (
                <div className="space-y-2">
                  {editedNote.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">
                        {attachment.type.startsWith('image/') ? '🖼️' : '📄'} {attachment.name}
                      </span>
                      <button
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : selectedNote ? (
          <div className="max-w-3xl mx-auto p-8">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">{selectedNote.title}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditNote(selectedNote)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedNote.content}</p>
            </div>

            {selectedNote.attachments && selectedNote.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Attachments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedNote.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {attachment.type.startsWith('image/') ? '🖼️' : '📄'}
                        </span>
                        <span className="text-sm text-gray-700 truncate">
                          {attachment.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesPage;