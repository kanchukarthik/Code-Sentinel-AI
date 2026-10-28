import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PipelineProvider } from './context/PipelineContext';
import { MainLayout } from './components/layout/MainLayout';

import { OverviewPage } from './pages/OverviewPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { LivePipelinePage } from './pages/LivePipelinePage';
import { CodeIntelligencePage } from './pages/CodeIntelligencePage';
import { TestSynthesisPage } from './pages/TestSynthesisPage';
import { BugDetectionPage } from './pages/BugDetectionPage';
import { RootCausePage } from './pages/RootCausePage';
import { PatchReviewPage } from './pages/PatchReviewPage';
import { MetricsHistoryPage } from './pages/MetricsHistoryPage';
import { FeedbackLoopPage } from './pages/FeedbackLoopPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ThemeProvider>
      <PipelineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="pipeline" element={<LivePipelinePage />} />
              <Route path="code-intelligence" element={<CodeIntelligencePage />} />
              <Route path="tests" element={<TestSynthesisPage />} />
              <Route path="bugs" element={<BugDetectionPage />} />
              <Route path="root-cause" element={<RootCausePage />} />
              <Route path="patches" element={<PatchReviewPage />} />
              <Route path="metrics" element={<MetricsHistoryPage />} />
              <Route path="feedback" element={<FeedbackLoopPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PipelineProvider>
    </ThemeProvider>
  );
}

export default App;
