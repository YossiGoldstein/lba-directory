import Home from './pages/Home';
import CategoryListing from './pages/CategoryListing';
import BusinessListing from './pages/BusinessListing';
import AddBusiness from './pages/AddBusiness';
import Pricing from './pages/Pricing';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import NotFound from './pages/NotFound';
import Success from './pages/Success';
import Error from './pages/Error';
import FAQ from './pages/FAQ';
import AdminDashboard from './pages/AdminDashboard';
import BusinessJoin from './pages/BusinessJoin';
import AdminEmailSettings from './pages/AdminEmailSettings';
import ForShoppers from './pages/ForShoppers';
import Welcome from './pages/Welcome';
import SignIn from './pages/SignIn';
import UserRegister from './pages/UserRegister';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "CategoryListing": CategoryListing,
    "BusinessListing": BusinessListing,
    "AddBusiness": AddBusiness,
    "Pricing": Pricing,
    "AboutUs": AboutUs,
    "Contact": Contact,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfUse": TermsOfUse,
    "ForgotPassword": ForgotPassword,
    "UserDashboard": UserDashboard,
    "BusinessDashboard": BusinessDashboard,
    "NotFound": NotFound,
    "Success": Success,
    "Error": Error,
    "FAQ": FAQ,
    "AdminDashboard": AdminDashboard,
    "BusinessJoin": BusinessJoin,
    "AdminEmailSettings": AdminEmailSettings,
    "ForShoppers": ForShoppers,
    "Welcome": Welcome,
    "SignIn": SignIn,
    "UserRegister": UserRegister,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};