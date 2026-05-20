import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      {/* Admin Routes - /admin/* */}
      <Route path="/admin" element={<LayoutWrapper currentPageName="AdminDashboard"><Pages.AdminDashboard /></LayoutWrapper>} />
      <Route path="/admin/leads" element={<LayoutWrapper currentPageName="AdminLeads"><Pages.AdminLeads /></LayoutWrapper>} />
      <Route path="/admin/surveys" element={<LayoutWrapper currentPageName="AdminSurveys"><Pages.AdminSurveys /></LayoutWrapper>} />
      <Route path="/admin/surveys/:id/edit" element={<LayoutWrapper currentPageName="AdminSurveyEditor"><Pages.AdminSurveyEditor /></LayoutWrapper>} />
      <Route path="/admin/contact-forms" element={<LayoutWrapper currentPageName="AdminContactForms"><Pages.AdminContactForms /></LayoutWrapper>} />
      <Route path="/admin/contact-forms/:id/edit" element={<LayoutWrapper currentPageName="AdminContactFormEditor"><Pages.AdminContactFormEditor /></LayoutWrapper>} />
      <Route path="/admin/pages" element={<LayoutWrapper currentPageName="AdminPages"><Pages.AdminPages /></LayoutWrapper>} />
      <Route path="/admin/ab-test" element={<LayoutWrapper currentPageName="AdminABTest"><Pages.AdminABTest /></LayoutWrapper>} />
      <Route path="/admin/media" element={<LayoutWrapper currentPageName="AdminMedia"><Pages.AdminMedia /></LayoutWrapper>} />
      <Route path="/admin/testimonials" element={<LayoutWrapper currentPageName="AdminTestimonials"><Pages.AdminTestimonials /></LayoutWrapper>} />
      <Route path="/admin/faqs" element={<LayoutWrapper currentPageName="AdminFAQs"><Pages.AdminFAQs /></LayoutWrapper>} />
      <Route path="/admin/automations" element={<LayoutWrapper currentPageName="AdminAutomations"><Pages.AdminAutomations /></LayoutWrapper>} />
      <Route path="/admin/analytics" element={<LayoutWrapper currentPageName="AdminAnalytics"><Pages.AdminAnalytics /></LayoutWrapper>} />
      <Route path="/admin/settings" element={<LayoutWrapper currentPageName="AdminSettings"><Pages.AdminSettings /></LayoutWrapper>} />
      <Route path="/admin/integrations" element={<LayoutWrapper currentPageName="AdminIntegrations"><Pages.AdminIntegrations /></LayoutWrapper>} />
      {/* Legacy redirects */}
      <Route path="/AdminDashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/AdminLeads" element={<Navigate to="/admin/leads" replace />} />
      <Route path="/AdminSurvey" element={<Navigate to="/admin/survey" replace />} />
      <Route path="/AdminPages" element={<Navigate to="/admin/pages" replace />} />
      <Route path="/AdminABTest" element={<Navigate to="/admin/ab-test" replace />} />
      <Route path="/AdminSettings" element={<Navigate to="/admin/settings" replace />} />
      <Route path="/AdminAnalytics" element={<Navigate to="/admin/analytics" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App