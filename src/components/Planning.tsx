import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TripInfo, TripNote } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CalendarDays, Plus, Trash2, UserPlus, StickyNote } from 'lucide-react';

export default function Planning() {
  const { t, i18n } = useTranslation();
  const [tripInfo, setTripInfo] = useLocalStorage<TripInfo>('gb-trip-info', {
    startDate: '',
    endDate: '',
    budget: '',
    participants: [],
  });
  const [notes, setNotes] = useLocalStorage<TripNote[]>('gb-notes', []);
  const [newParticipant, setNewParticipant] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');

  const addParticipant = () => {
    if (!newParticipant.trim()) return;
    if (tripInfo.participants.includes(newParticipant.trim())) return;
    setTripInfo((prev) => ({
      ...prev,
      participants: [...prev.participants, newParticipant.trim()],
    }));
    setNewParticipant('');
  };

  const removeParticipant = (name: string) => {
    setTripInfo((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p !== name),
    }));
  };

  const addNote = () => {
    if (!newNote.trim() || !noteAuthor.trim()) return;
    const note: TripNote = {
      id: crypto.randomUUID(),
      content: newNote.trim(),
      author: noteAuthor.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>
          <CalendarDays size={24} /> {t('planning.title')}
        </h2>
      </div>

      <div className="planning-grid">
        {/* Dates & Budget */}
        <div className="form-card">
          <h3>📅 {t('planning.datesBudget')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('planning.startDate')}</label>
              <input
                type="date"
                value={tripInfo.startDate}
                onChange={(e) =>
                  setTripInfo((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="form-group">
              <label>{t('planning.endDate')}</label>
              <input
                type="date"
                value={tripInfo.endDate}
                onChange={(e) =>
                  setTripInfo((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label>{t('planning.budget')}</label>
              <input
                value={tripInfo.budget}
                onChange={(e) =>
                  setTripInfo((prev) => ({ ...prev, budget: e.target.value }))
                }
                placeholder={t('planning.budgetPlaceholder')}
              />
            </div>
          </div>
          {tripInfo.startDate && tripInfo.endDate && (
            <p className="trip-duration">
              {t('planning.duration', {
                days: Math.ceil(
                  (new Date(tripInfo.endDate).getTime() -
                    new Date(tripInfo.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              })}
            </p>
          )}
        </div>

        {/* Participants */}
        <div className="form-card">
          <h3>
            <UserPlus size={20} /> {t('planning.participants')}
          </h3>
          <div className="add-inline">
            <input
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              placeholder={t('planning.participantPlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
            />
            <button className="btn btn-primary" onClick={addParticipant}>
              <Plus size={18} />
            </button>
          </div>
          {tripInfo.participants.length === 0 ? (
            <p className="empty-text">{t('planning.addParticipants')}</p>
          ) : (
            <div className="participants-list">
              {tripInfo.participants.map((p) => (
                <span key={p} className="participant-tag">
                  {p}
                  <button
                    onClick={() => removeParticipant(p)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="form-card full-width">
          <h3>
            <StickyNote size={20} /> {t('planning.notesTitle')}
          </h3>
          <div className="add-note">
            <div className="note-inputs">
              <input
                value={noteAuthor}
                onChange={(e) => setNoteAuthor(e.target.value)}
                placeholder={t('common.yourName')}
                className="note-author"
              />
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={t('planning.notePlaceholder')}
                rows={2}
              />
            </div>
            <button className="btn btn-primary" onClick={addNote}>
              <Plus size={18} /> {t('common.add')}
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="empty-text">{t('planning.noNotes')}</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <div key={note.id} className="note-item">
                  <div className="note-content">
                    <p>{note.content}</p>
                    <span className="note-meta">
                      {note.author} —{' '}
                      {new Date(note.createdAt).toLocaleDateString(
                        i18n.language,
                      )}
                    </span>
                  </div>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
