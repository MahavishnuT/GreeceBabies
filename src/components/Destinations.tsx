import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Destination, TripInfo } from '../types';
import { useSharedStorage } from '../hooks/useSharedStorage';
import { MapPin, Plus, ThumbsUp, Trash2 } from 'lucide-react';

export default function Destinations() {
  const { t } = useTranslation();
  const [destinations, setDestinations] = useSharedStorage<Destination[]>(
    'gb-destinations',
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [voterName, setVoterName] = useState('');
  const [tripInfo] = useSharedStorage<TripInfo>('gb-trip-info', {
    startDate: '',
    endDate: '',
    budget: '',
    participants: [],
  });
  const participants = tripInfo.participants;

  const handleAdd = () => {
    if (!name.trim() || !addedBy.trim()) return;
    const newDest: Destination = {
      id: crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      votes: [],
      addedBy: addedBy.trim(),
      createdAt: new Date().toISOString(),
    };
    setDestinations((prev) => [...prev, newDest]);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  const handleVote = (destId: string) => {
    if (!voterName.trim()) return;
    setDestinations((prev) =>
      prev.map((d) => {
        if (d.id !== destId) return d;
        if (d.votes.includes(voterName.trim())) {
          return { ...d, votes: d.votes.filter((v) => v !== voterName.trim()) };
        }
        return { ...d, votes: [...d.votes, voterName.trim()] };
      }),
    );
  };

  const handleDelete = (id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>
          <MapPin size={24} /> {t('destinations.title')}
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{t('destinations.newDestination')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('destinations.nameLabel')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('destinations.namePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('destinations.addedByLabel')}</label>
              <select
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
              >
                <option value="">{t('common.select')}</option>
                {participants.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label>{t('destinations.descriptionLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('destinations.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              {t('common.add')}
            </button>
          </div>
        </div>
      )}

      <div className="voter-bar">
        <label>{t('destinations.voterLabel')}</label>
        <select
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          className="voter-input"
        >
          <option value="">{t('common.select')}</option>
          {participants.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {destinations.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} />
          <p>{t('destinations.emptyState')}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {destinations
            .sort((a, b) => b.votes.length - a.votes.length)
            .map((dest) => (
              <div key={dest.id} className="card">
                <div className="card-header">
                  <h3>{dest.name}</h3>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(dest.id)}
                    title={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {dest.description && (
                  <p className="card-desc">{dest.description}</p>
                )}
                <div className="card-meta">
                  <span className="meta-tag">
                    {t('common.addedBy', { name: dest.addedBy })}
                  </span>
                </div>
                <div className="card-votes">
                  <button
                    className={`btn btn-vote ${voterName.trim() && dest.votes.includes(voterName.trim()) ? 'voted' : ''}`}
                    onClick={() => handleVote(dest.id)}
                    disabled={!voterName.trim()}
                  >
                    <ThumbsUp size={16} /> {dest.votes.length}
                  </button>
                  {dest.votes.length > 0 && (
                    <span className="voters">{dest.votes.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
