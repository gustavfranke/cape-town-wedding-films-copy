/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminABTest from './pages/AdminABTest';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAutomations from './pages/AdminAutomations';
import AdminDashboard from './pages/AdminDashboard';
import AdminFAQs from './pages/AdminFAQs';
import AdminLeads from './pages/AdminLeads';
import AdminMedia from './pages/AdminMedia';
import AdminPages from './pages/AdminPages';
import AdminSettings from './pages/AdminSettings';
import AdminSurvey from './pages/AdminSurvey';
import AdminSurveyBuilder from './pages/AdminSurveyBuilder';
import AdminSurveyDestinations from './pages/AdminSurveyDestinations';
import AdminSurveyRules from './pages/AdminSurveyRules';
import AdminSurveySubmissions from './pages/AdminSurveySubmissions';
import AdminSurveyTriggers from './pages/AdminSurveyTriggers';
import AdminTestimonials from './pages/AdminTestimonials';
import FunnelVariantA from './pages/FunnelVariantA';
import FunnelVariantB from './pages/FunnelVariantB';
import Home from './pages/Home';
import ThankYou from './pages/ThankYou';
import SannaAfrika from './pages/SannaAfrika';
import AdminIntegrations from './pages/AdminIntegrations';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminABTest": AdminABTest,
    "AdminAnalytics": AdminAnalytics,
    "AdminAutomations": AdminAutomations,
    "AdminDashboard": AdminDashboard,
    "AdminFAQs": AdminFAQs,
    "AdminLeads": AdminLeads,
    "AdminMedia": AdminMedia,
    "AdminPages": AdminPages,
    "AdminSettings": AdminSettings,
    "AdminSurvey": AdminSurvey,
    "AdminSurveyBuilder": AdminSurveyBuilder,
    "AdminSurveyDestinations": AdminSurveyDestinations,
    "AdminSurveyRules": AdminSurveyRules,
    "AdminSurveySubmissions": AdminSurveySubmissions,
    "AdminSurveyTriggers": AdminSurveyTriggers,
    "AdminTestimonials": AdminTestimonials,
    "FunnelVariantA": FunnelVariantA,
    "FunnelVariantB": FunnelVariantB,
    "Home": Home,
    "ThankYou": ThankYou,
    "SannaAfrika": SannaAfrika,
    "AdminIntegrations": AdminIntegrations,
}

export const pagesConfig = {
    mainPage: "FunnelVariantA",
    Pages: PAGES,
    Layout: __Layout,
};