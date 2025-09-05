import Layout from "./Layout.jsx";

import Home from "./Home";

import Profile from "./Profile";

import Diary from "./Diary";

import Calendar from "./Calendar";

import Health from "./Health";

import Reminders from "./Reminders";

import Settings from "./Settings";

import VetLogin from "./VetLogin";

import VetPets from "./VetPets";

import Error from "./Error";

import Welcome from "./Welcome";

import EmailTemplates from "./EmailTemplates";

import Invite from "./Invite";

import Share from "./Share";

import EditProfile from "./EditProfile";

import VetManagement from "./VetManagement";

import Donation from "./Donation";

import About from "./About";

import VaccineHistory from "./VaccineHistory";

import TestEmail from "./TestEmail";

import VetDashboard from "./VetDashboard";

import VetProfile from "./VetProfile";

import RegisterVet from "./RegisterVet";

import TutorOnboarding from "./TutorOnboarding";

import Users from "./Users";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Profile: Profile,
    
    Diary: Diary,
    
    Calendar: Calendar,
    
    Health: Health,
    
    Reminders: Reminders,
    
    Settings: Settings,
    
    VetLogin: VetLogin,
    
    VetPets: VetPets,
    
    Error: Error,
    
    Welcome: Welcome,
    
    EmailTemplates: EmailTemplates,
    
    Invite: Invite,
    
    Share: Share,
    
    EditProfile: EditProfile,
    
    VetManagement: VetManagement,
    
    Donation: Donation,
    
    About: About,
    
    VaccineHistory: VaccineHistory,
    
    TestEmail: TestEmail,
    
    VetDashboard: VetDashboard,
    
    VetProfile: VetProfile,
    
    RegisterVet: RegisterVet,
    
    TutorOnboarding: TutorOnboarding,
    
    Users: Users,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Diary" element={<Diary />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Health" element={<Health />} />
                
                <Route path="/Reminders" element={<Reminders />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/VetLogin" element={<VetLogin />} />
                
                <Route path="/VetPets" element={<VetPets />} />
                
                <Route path="/Error" element={<Error />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/EmailTemplates" element={<EmailTemplates />} />
                
                <Route path="/Invite" element={<Invite />} />
                
                <Route path="/Share" element={<Share />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
                <Route path="/VetManagement" element={<VetManagement />} />
                
                <Route path="/Donation" element={<Donation />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/VaccineHistory" element={<VaccineHistory />} />
                
                <Route path="/TestEmail" element={<TestEmail />} />
                
                <Route path="/VetDashboard" element={<VetDashboard />} />
                
                <Route path="/VetProfile" element={<VetProfile />} />
                
                <Route path="/RegisterVet" element={<RegisterVet />} />
                
                <Route path="/TutorOnboarding" element={<TutorOnboarding />} />
                
                <Route path="/Users" element={<Users />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}