import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Activity, Destination } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Compass, Plus, Trash2 } from 'lucide-react';

export default function Activities() {
  const { t } = useTranslation();
  const [activities, setActivities] = useLocalStorage<Activity[]>(
    'gb-activities',
    [],
  );
  const [destinations] = useLocalStorage<Destination[]>('gb-destinations', []);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [addedBy, setAddedBy] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !addedBy.trim()) return;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      destination: destination.trim(),
      name: name.trim(),
      description: description.trim(),
      estimatedCost: estimatedCost.trim(),
      addedBy: addedBy.trim(),
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newActivity]);
    setName('');
    setDestination('');
    setDescription('');
    setEstimatedCost('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
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
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="">{t('common.select')}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
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
              <input
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder={t('common.yourName')}
              />
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
                {activity.destination && (
                  <span className="detail-tag">📍 {activity.destination}</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
