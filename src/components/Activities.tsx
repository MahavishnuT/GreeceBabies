import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Activity, TripInfo } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Compass, Plus, Trash2, ThumbsUp } from 'lucide-react';

export default function Activities() {
  const { t } = useTranslation();
  const [activities, setActivities] = useLocalStorage<Activity[]>(
    'gb-activities',
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [date, setDate] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [voterName, setVoterName] = useState('');
  const [tripInfo] = useLocalStorage<TripInfo>('gb-trip-info', {
    startDate: '',
    endDate: '',
    budget: '',
    participants: [],
  });
  const participants = tripInfo.participants;

  const handleAdd = () => {
    if (!name.trim() || !addedBy.trim()) return;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      destination: destination.trim(),
      name: name.trim(),
      date,
      description: description.trim(),
      estimatedCost: estimatedCost.trim(),
      votes: [],
      addedBy: addedBy.trim(),
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newActivity]);
    setName('');
    setDestination('');
    setDate('');
    setDescription('');
    setEstimatedCost('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleVote = (activityId: string) => {
    if (!voterName.trim()) return;
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;
        const votes = a.votes ?? [];
        if (votes.includes(voterName.trim())) {
          return { ...a, votes: votes.filter((v) => v !== voterName.trim()) };
        }
        return { ...a, votes: [...votes, voterName.trim()] };
      }),
    );
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>
          <Compass size={24} /> {t('activities.title')}
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
          <h3>{t('activities.newActivity')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('activities.nameLabel')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('activities.namePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('common.destination')}</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('common.destinationPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('common.dateLabel')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>{t('activities.costLabel')}</label>
              <input
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder={t('activities.costPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('activities.addedByLabel')}</label>
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
              <label>{t('activities.descriptionLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('activities.descriptionPlaceholder')}
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

      {activities.length === 0 ? (
        <div className="empty-state">
          <Compass size={48} />
          <p>{t('activities.emptyState')}</p>
        </div>
      ) : (
        <>
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
          <div className="cards-grid">
            {activities.map((activity) => (
              <div key={activity.id} className="card">
                <div className="card-header">
                  <h3>{activity.name}</h3>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDelete(activity.id)}
                    title={t('common.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="card-details">
                  {activity.date && (
                    <span className="detail-tag">
                      📅 {new Date(activity.date).toLocaleDateString()}
                    </span>
                  )}
                  {activity.destination && (
                    <span className="detail-tag">
                      📍 {activity.destination}
                    </span>
                  )}
                  {activity.estimatedCost && (
                    <span className="detail-tag">
                      💰{' '}
                      {t('activities.estimatedCost', {
                        cost: activity.estimatedCost,
                      })}
                    </span>
                  )}
                </div>
                {activity.description && (
                  <p className="card-desc">{activity.description}</p>
                )}
                <div className="card-meta">
                  <span className="meta-tag">
                    {t('common.addedBy', { name: activity.addedBy })}
                  </span>
                </div>
                <div className="card-votes">
                  <button
                    className={`btn btn-vote ${voterName.trim() && (activity.votes ?? []).includes(voterName.trim()) ? 'voted' : ''}`}
                    onClick={() => handleVote(activity.id)}
                    disabled={!voterName.trim()}
                  >
                    <ThumbsUp size={16} /> {(activity.votes ?? []).length}
                  </button>
                  {(activity.votes ?? []).length > 0 && (
                    <span className="voters">
                      {(activity.votes ?? []).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
