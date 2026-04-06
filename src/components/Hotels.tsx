import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Hotel, Destination } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Building2, Plus, Trash2, ExternalLink } from 'lucide-react';

export default function Hotels() {
  const { t } = useTranslation();
  const [hotels, setHotels] = useLocalStorage<Hotel[]>('gb-hotels', []);
  const [destinations] = useLocalStorage<Destination[]>('gb-destinations', []);
  const [showForm, setShowForm] = useState(false);
  const [destination, setDestination] = useState('');
  const [name, setName] = useState('');
  const [pricePerNight, setPricePerNight] = useState('');
  const [rating, setRating] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [addedBy, setAddedBy] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !addedBy.trim()) return;
    const newHotel: Hotel = {
      id: crypto.randomUUID(),
      destination: destination.trim(),
      name: name.trim(),
      pricePerNight: pricePerNight.trim(),
      rating: rating.trim(),
      link: link.trim(),
      notes: notes.trim(),
      addedBy: addedBy.trim(),
      createdAt: new Date().toISOString(),
    };
    setHotels((prev) => [...prev, newHotel]);
    setName('');
    setDestination('');
    setPricePerNight('');
    setRating('');
    setLink('');
    setNotes('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>
          <Building2 size={24} /> {t('hotels.title')}
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
          <h3>{t('hotels.newHotel')}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('hotels.nameLabel')}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('hotels.namePlaceholder')}
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
              <label>{t('hotels.priceLabel')}</label>
              <input
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder={t('hotels.pricePlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('hotels.ratingLabel')}</label>
              <input
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder={t('hotels.ratingPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('hotels.linkLabel')}</label>
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={t('hotels.linkPlaceholder')}
              />
            </div>
            <div className="form-group">
              <label>{t('hotels.addedByLabel')}</label>
              <input
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder={t('common.yourName')}
              />
            </div>
            <div className="form-group full-width">
              <label>{t('hotels.notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('hotels.notesPlaceholder')}
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

      {hotels.length === 0 ? (
        <div className="empty-state">
          <Building2 size={48} />
          <p>{t('hotels.emptyState')}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="card">
              <div className="card-header">
                <h3>{hotel.name}</h3>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(hotel.id)}
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="card-details">
                {hotel.destination && (
                  <span className="detail-tag">📍 {hotel.destination}</span>
                )}
                {hotel.pricePerNight && (
                  <span className="detail-tag">
                    💰{' '}
                    {t('hotels.pricePerNight', { price: hotel.pricePerNight })}
                  </span>
                )}
                {hotel.rating && (
                  <span className="detail-tag">
                    ⭐ {t('hotels.ratingOut10', { rating: hotel.rating })}
                  </span>
                )}
              </div>
              {hotel.notes && <p className="card-desc">{hotel.notes}</p>}
              {hotel.link && (
                <a
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                >
                  <ExternalLink size={14} /> {t('hotels.viewLink')}
                </a>
              )}
              <div className="card-meta">
                <span className="meta-tag">
                  {t('common.addedBy', { name: hotel.addedBy })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
