import { format, startOfDay, parseISO } from 'date-fns';

class StorageService {
  constructor() {
    this.userDataPath = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    this.userDataPath = await window.electron.getUserDataPath();
    this.initialized = true;
  }

  getPath(relativePath) {
    return `${this.userDataPath}/${relativePath}`;
  }

  // Today's journal
  async getTodayContent() {
    await this.initialize();
    const todayPath = this.getPath('today.json');
    const result = await window.electron.readFile(todayPath);
    
    if (result.success) {
      const data = JSON.parse(result.data);
      // Check if we need to rollover to a new day
      const lastDate = data.date ? parseISO(data.date) : null;
      const today = startOfDay(new Date());
      
      if (lastDate && startOfDay(lastDate).getTime() !== today.getTime()) {
        // Save yesterday's content as a journal entry
        if (data.content && data.content.trim()) {
          await this.saveJournalEntry({
            date: format(lastDate, 'yyyy-MM-dd'),
            title: format(lastDate, 'MMMM d, yyyy'),
            content: data.content,
            hours: data.hours || { job: 0, class: 0 }
          });
        }
        // Return fresh content for today
        return {
          content: '',
          date: format(today, 'yyyy-MM-dd'),
          hours: { job: 0, class: 0 }
        };
      }
      
      return data;
    }
    
    return {
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      hours: { job: 0, class: 0 }
    };
  }

  async saveTodayContent(content, hours = null) {
    await this.initialize();
    const todayPath = this.getPath('today.json');
    const data = {
      content,
      date: format(new Date(), 'yyyy-MM-dd'),
      hours: hours || { job: 0, class: 0 }
    };
    
    await window.electron.writeFile(todayPath, JSON.stringify(data, null, 2));
  }

  // Journal entries
  async getJournalEntries() {
    await this.initialize();
    const journalPath = this.getPath('journal.json');
    const result = await window.electron.readFile(journalPath);
    
    if (result.success) {
      return JSON.parse(result.data);
    }
    
    return [];
  }

  async saveJournalEntry(entry) {
    const entries = await this.getJournalEntries();
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    if (existingIndex >= 0) {
      entries[existingIndex] = { ...entries[existingIndex], ...entry };
    } else {
      entries.push({ id: Date.now(), ...entry });
    }
    
    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    await this.initialize();
    const journalPath = this.getPath('journal.json');
    await window.electron.writeFile(journalPath, JSON.stringify(entries, null, 2));
  }

  async deleteJournalEntry(id) {
    const entries = await this.getJournalEntries();
    const filtered = entries.filter(e => e.id !== id);
    
    await this.initialize();
    const journalPath = this.getPath('journal.json');
    await window.electron.writeFile(journalPath, JSON.stringify(filtered, null, 2));
  }

  // Notes
  async getNotes() {
    await this.initialize();
    const notesPath = this.getPath('notes.json');
    const result = await window.electron.readFile(notesPath);
    
    if (result.success) {
      return JSON.parse(result.data);
    }
    
    return {
      personal: [],
      work: [],
      ideas: [],
      random: []
    };
  }

  async saveNote(category, note) {
    const notes = await this.getNotes();
    
    if (!notes[category]) {
      notes[category] = [];
    }
    
    const existingIndex = notes[category].findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      notes[category][existingIndex] = note;
    } else {
      notes[category].push({ id: Date.now(), createdAt: new Date().toISOString(), ...note });
    }
    
    await this.initialize();
    const notesPath = this.getPath('notes.json');
    await window.electron.writeFile(notesPath, JSON.stringify(notes, null, 2));
  }

  async deleteNote(category, noteId) {
    const notes = await this.getNotes();
    
    if (notes[category]) {
      const note = notes[category].find(n => n.id === noteId);
      
      // Delete attachments
      if (note && note.attachments) {
        for (const attachment of note.attachments) {
          const fullPath = this.getPath(attachment);
          await window.electron.deleteFile(fullPath);
        }
      }
      
      notes[category] = notes[category].filter(n => n.id !== noteId);
    }
    
    await this.initialize();
    const notesPath = this.getPath('notes.json');
    await window.electron.writeFile(notesPath, JSON.stringify(notes, null, 2));
  }

  async saveAttachment(file, noteId) {
    await this.initialize();
    const attachmentDir = this.getPath(`attachments/${noteId}`);
    const fileName = `${Date.now()}_${file.name}`;
    const destPath = `${attachmentDir}/${fileName}`;
    
    // For web File objects, we need to read and write differently
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          // Write as base64 then convert back on read
          const base64Data = e.target.result.split(',')[1];
          await window.electron.writeFile(destPath, base64Data);
          resolve(`attachments/${noteId}/${fileName}`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Calendar
  async getCalendarData() {
    await this.initialize();
    const calendarPath = this.getPath('calendar.json');
    const result = await window.electron.readFile(calendarPath);
    
    if (result.success) {
      return JSON.parse(result.data);
    }
    
    return {};
  }

  async saveCalendarDay(date, data) {
    const calendar = await this.getCalendarData();
    calendar[date] = data;
    
    await this.initialize();
    const calendarPath = this.getPath('calendar.json');
    await window.electron.writeFile(calendarPath, JSON.stringify(calendar, null, 2));
  }

  // Financial Goals
  async getGoals() {
    await this.initialize();
    const goalsPath = this.getPath('goals.json');
    const result = await window.electron.readFile(goalsPath);
    
    if (result.success) {
      return JSON.parse(result.data);
    }
    
    return [];
  }

  async saveGoals(goals) {
    await this.initialize();
    const goalsPath = this.getPath('goals.json');
    await window.electron.writeFile(goalsPath, JSON.stringify(goals, null, 2));
  }
}

export default new StorageService();
