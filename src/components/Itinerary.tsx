import { useTranslation } from 'react-i18next';
import type { Destination, Hotel, Activity, TripInfo } from '../types';
import { useSharedStorage } from '../hooks/useSharedStorage';
import { Route, MapPin, Building2, Compass, AlertCircle } from 'lucide-react';

const MIN_VOTES = 6;

export default function Itinerary() {
  const { t } = useTranslation();
  const [tripInfo] = useSharedStorage<TripInfo>('gb-trip-info', {
    startDate: '',
    endDate: '',
    budget: '',
    participants: [],
  });
  const [destinations] = useSharedStorage<Destination[]>('gb-destinations', []);
  const [hotels] = useSharedStorage<Hotel[]>('gb-hotels', []);
  const [activities] = useSharedStorage<Activity[]>('gb-activities', []);

  const approvedDestinations = destinations.filter(
    (d) => d.votes.length >= MIN_VOTES,
  );
  const approvedHotels = hotels.filter(
    (h) => (h.votes ?? []).length >= MIN_VOTES,
  );
  const approvedActivities = activities.filter(
    (a) => (a.votes ?? []).length >= MIN_VOTES,
  );

  // Build day-by-day itinerary
  const startDate = tripInfo.startDate ? new Date(tripInfo.startDate) : null;
  const endDate = tripInfo.endDate ? new Date(tripInfo.endDate) : null;
  const totalDays =
    startDate && endDate
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

  // Distribute approved destinations across days
  const days: {
    date: Date;
    dayNumber: number;
    destinations: typeof approvedDestinations;
    hotels: typeof approvedHotels;
    activities: typeof approvedActivities;
  }[] = [];

  if (startDate && totalDays > 0) {
    const destsPerDay =
      approvedDestinations.length > 0
        ? Math.ceil(approvedDestinations.length / totalDays)
        : 0;

    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);

      const dayDests = approvedDestinations.slice(
        i * destsPerDay,
        (i + 1) * destsPerDay,
      );
      const dayDestNames = dayDests.map((d) => d.name);

      const dayHotels = approvedHotels.filter(
        (h) =>
          dayDestNames.includes(h.destination) || (!h.destination && i === 0),
      );
      const dayActivities = approvedActivities.filter(
        (a) =>
          dayDestNames.includes(a.destination) || (!a.destination && i === 0),
      );

      days.push({
        date: dayDate,
        dayNumber: i + 1,
        destinations: dayDests,
        hotels: dayHotels,
        activities: dayActivities,
      });
    }
  }

  const hasNoDates = !startDate || !endDate;
  const hasNoApproved =
    approvedDestinations.length === 0 &&
    approvedHotels.length === 0 &&
    approvedActivities.length === 0;

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>
          <Route size={24} /> {t('itinerary.title')}
        </h2>
      </div>

      <div className="itinerary-info">
        <AlertCircle size={16} />
        <span>{t('itinerary.minVotesInfo', { count: MIN_VOTES })}</span>
      </div>

      {/* Summary of approved items */}
      <div className="itinerary-summary">
        <div className="summary-item">
          <MapPin size={18} />
          <span>
            {approvedDestinations.length} {t('itinerary.approvedDestinations')}
          </span>
        </div>
        <div className="summary-item">
          <Building2 size={18} />
          <span>
            {approvedHotels.length} {t('itinerary.approvedHotels')}
          </span>
        </div>
        <div className="summary-item">
          <Compass size={18} />
          <span>
            {approvedActivities.length} {t('itinerary.approvedActivities')}
          </span>
        </div>
      </div>

      {hasNoDates ? (
        <div className="empty-state">
          <Route size={48} />
          <p>{t('itinerary.setDatesFirst')}</p>
        </div>
      ) : hasNoApproved ? (
        <div className="empty-state">
          <Route size={48} />
          <p>{t('itinerary.noApprovedItems')}</p>
        </div>
      ) : (
        <div className="itinerary-timeline">
          {days.map((day) => (
            <div key={day.dayNumber} className="timeline-day">
              <div className="day-header">
                <span className="day-number">
                  {t('itinerary.dayNumber', { day: day.dayNumber })}
                </span>
                <span className="day-date">
                  {day.date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <div className="day-content">
                {day.destinations.length > 0 && (
                  <div className="day-section">
                    <h4>
                      <MapPin size={16} /> {t('itinerary.destinationsLabel')}
                    </h4>
                    {day.destinations.map((d) => (
                      <div key={d.id} className="day-item">
                        <strong>{d.name}</strong>
                        {d.description && <p>{d.description}</p>}
                        <span className="vote-count">👍 {d.votes.length}</span>
                      </div>
                    ))}
                  </div>
                )}
                {day.hotels.length > 0 && (
                  <div className="day-section">
                    <h4>
                      <Building2 size={16} /> {t('itinerary.hotelsLabel')}
                    </h4>
                    {day.hotels.map((h) => (
                      <div key={h.id} className="day-item">
                        <strong>{h.name}</strong>
                        {h.pricePerNight && (
                          <span className="detail-tag">
                            💰 {h.pricePerNight}€
                          </span>
                        )}
                        <span className="vote-count">
                          👍 {(h.votes ?? []).length}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {day.activities.length > 0 && (
                  <div className="day-section">
                    <h4>
                      <Compass size={16} /> {t('itinerary.activitiesLabel')}
                    </h4>
                    {day.activities.map((a) => (
                      <div key={a.id} className="day-item">
                        <strong>{a.name}</strong>
                        {a.description && <p>{a.description}</p>}
                        {a.estimatedCost && (
                          <span className="detail-tag">
                            💰 ~{a.estimatedCost}€
                          </span>
                        )}
                        <span className="vote-count">
                          👍 {(a.votes ?? []).length}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {day.destinations.length === 0 &&
                  day.hotels.length === 0 &&
                  day.activities.length === 0 && (
                    <p className="empty-text">{t('itinerary.freeDay')}</p>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
