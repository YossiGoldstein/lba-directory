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
import SignIn from './pages/SignIn';
import Success from './pages/Success';
import TermsOfUse from './pages/TermsOfUse';
import UserDashboard from './pages/UserDashboard';
import UserRegister from './pages/UserRegister';
import Welcome from './pages/Welcome';
import SubmissionSuccess from './pages/SubmissionSuccess';
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
    "SignIn": SignIn,
    "Success": Success,
    "TermsOfUse": TermsOfUse,
    "UserDashboard": UserDashboard,
    "UserRegister": UserRegister,
    "Welcome": Welcome,
    "SubmissionSuccess": SubmissionSuccess,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};