/**
 * Main App Component
 * Sets up routing and global app structure
 */
import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './views/DashboardNew';
import Analysis from './views/Analysis';
// Use the plain JS version of the view which manages its own props via useParams
import AnalysisResults from './views/AnalysisResults';
import MiniServices from './views/MiniServices';
import Settings from './views/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route
            path="/analysis/results/:id"
            element={React.createElement(
              AnalysisResults as unknown as React.ComponentType<unknown>
            )}
          />
          <Route path="/reports" element={<MiniServices />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
