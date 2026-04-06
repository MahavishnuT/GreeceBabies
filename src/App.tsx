import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Destinations from './components/Destinations';
import Hotels from './components/Hotels';
import Activities from './components/Activities';
import Planning from './components/Planning';
import LanguageSwitcher from './components/LanguageSwitcher';
import { MapPin, Building2, Compass, CalendarDays } from 'lucide-react';
import type { TabId } from './types';
import './App.css';

const tabs: { id: TabId; labelKey: string; icon: typeof MapPin }[] = [
  { id: 'destinations', labelKey: 'tabs.destinations', icon: MapPin },
  { id: 'hotels', labelKey: 'tabs.hotels', icon: Building2 },
  { id: 'activities', labelKey: 'tabs.activities', icon: Compass },
  { id: 'planning', labelKey: 'tabs.planning', icon: CalendarDays },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('destinations');
  const { t } = useTranslation();

  return (
    <div className="app">
      <header className="app-header">
        <LanguageSwitcher />
        <div className="header-content">
          <h1>🇬🇷 {t('header.title')}</h1>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <main className="app-main">
        {activeTab === 'destinations' && <Destinations />}
        {activeTab === 'hotels' && <Hotels />}
        {activeTab === 'activities' && <Activities />}
        {activeTab === 'planning' && <Planning />}
      </main>

      <footer className="app-footer">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}

export default App;
