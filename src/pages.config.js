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
import AboutUs from './pages/AboutUs';
import AddBusiness from './pages/AddBusiness';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmailSettings from './pages/AdminEmailSettings';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessJoin from './pages/BusinessJoin';
import BusinessListing from './pages/BusinessListing';
import CategoryListing from './pages/CategoryListing';
import Contact from './pages/Contact';
import Error from './pages/Error';
import FAQ from './pages/FAQ';
import ForShoppers from './pages/ForShoppers';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RegistrationSuccess from './pages/RegistrationSuccess';
import SignIn from './pages/SignIn';
import SubmissionSuccess from './pages/SubmissionSuccess';
import Success from './pages/Success';
import TermsOfUse from './pages/TermsOfUse';
import UserDashboard from './pages/UserDashboard';
import UserRegister from './pages/UserRegister';
import Welcome from './pages/Welcome';
import SearchResults from './pages/SearchResults';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AboutUs": AboutUs,
    "AddBusiness": AddBusiness,
    "AdminDashboard": AdminDashboard,
    "AdminEmailSettings": AdminEmailSettings,
    "BusinessDashboard": BusinessDashboard,
    "BusinessJoin": BusinessJoin,
    "BusinessListing": BusinessListing,
    "CategoryListing": CategoryListing,
    "Contact": Contact,
    "Error": Error,
    "FAQ": FAQ,
    "ForShoppers": ForShoppers,
    "ForgotPassword": ForgotPassword,
    "Home": Home,
    "NotFound": NotFound,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "RegistrationSuccess": RegistrationSuccess,
    "SignIn": SignIn,
    "SubmissionSuccess": SubmissionSuccess,
    "Success": Success,
    "TermsOfUse": TermsOfUse,
    "UserDashboard": UserDashboard,
    "UserRegister": UserRegister,
    "Welcome": Welcome,
    "SearchResults": SearchResults,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};