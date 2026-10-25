import { readRoute } from '../shared/routes';
import { LessonPage } from './LessonPage';
import { WelcomePage } from '../features/home/WelcomePage';
import { TodayPage } from '../features/home/TodayPage';
import { OnboardingPage } from '../features/onboarding/OnboardingPage';
import { AuthPage } from '../features/account/AuthPage';
import { SettingsPage } from '../features/account/SettingsPage';
import { PageFrame } from '../shared/PageFrame';
import { LearningHubPage } from '../features/home/LearningHubPage';
import { NotebookPage } from '../features/home/NotebookPage';
import { ProjectsPage } from '../features/home/ProjectsPage';

export function App() {
  const route = readRoute(window.location.pathname, window.location.search);
  switch (route.screen) {
    case 'projects':
      return <ProjectsPage locale={route.locale} />;
    case 'notebook':
      return <NotebookPage locale={route.locale} />;
    case 'learn':
    case 'practice':
    case 'progress':
      return <LearningHubPage locale={route.locale} screen={route.screen} />;
    case 'settings':
      return <SettingsPage locale={route.locale} />;
    case 'lesson':
      return <LessonPage />;
    case 'welcome':
      return <WelcomePage locale={route.locale} />;
    case 'auth':
      return <AuthPage locale={route.locale} />;
    case 'start':
      return <OnboardingPage locale={route.locale} />;
    case 'today':
      return <TodayPage locale={route.locale} />;
    default:
      return (
        <PageFrame
          locale={route.locale}
          title={route.locale === 'en' ? 'This page is not here.' : 'Esta página no existe.'}
        >
          <a href={'/' + route.locale}>
            {route.locale === 'en' ? 'Back to Learntify' : 'Volver a Learntify'}
          </a>
        </PageFrame>
      );
  }
}
