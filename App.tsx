import React, { useState } from 'react';
import { ActivePage } from './types';
import Menu from './components/Menu';
import ValidatorPage from './pages/ValidatorPage';
import BackfillerPage from './pages/BackfillerPage';
import V1UpdaterPage from './pages/V1UpdaterPage';
import ExamplesPage from './pages/ExamplesPage';
import GeneratorPage from './pages/GeneratorPage';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('generator');

  const renderActivePage = () => {
    switch (activePage) {
      case 'generator':
        return <GeneratorPage />;
      case 'validator':
        return <ValidatorPage />;
      case 'backfiller':
        return <BackfillerPage withObsolescenceNotice={false} />;
      case 'backfillerWithObsolescenceNotice':
        return <BackfillerPage withObsolescenceNotice={true} />;
      case 'v1Updater':
        return <V1UpdaterPage />;
      case 'examples':
        return <ExamplesPage />;
      default:
        return <GeneratorPage />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 pb-2">
            Character Card Utils
          </h1>
          <p className="text-gray-400">An AI-powered toolkit for character card creation and manipulation.</p>
        </header>
        
        <Menu activePage={activePage} setActivePage={setActivePage} />

        <main className="mt-8 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default App;
