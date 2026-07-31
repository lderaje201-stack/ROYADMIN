import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

missing_imports = """
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastContainer } from './components/ToastContainer';
import { OverviewPage } from './components/pages/OverviewPage';
import { BookingsPage } from './components/pages/BookingsPage';
import { MessagesPage } from './components/pages/MessagesPage';
import { MedicalFilesPage } from './components/pages/MedicalFilesPage';
import { PatientsPage } from './components/pages/PatientsPage';
import { TeamMembersPage } from './components/pages/TeamMembersPage';
import { ReviewsPage } from './components/pages/ReviewsPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { BookingModal } from './components/modals/BookingModal';
import { PatientModal } from './components/modals/PatientModal';
import { MedicalFileModal } from './components/modals/MedicalFileModal';
import { TeamMemberModal } from './components/modals/TeamMemberModal';
import { ResetPasswordModal } from './components/modals/ResetPasswordModal';
import { LogoutModal } from './components/modals/LogoutModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Local State powered by real Supabase data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [adminProfile, setAdminProfile] = useState<TeamMember | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [
          b, c, f, p, tm, a, admin
        ] = await Promise.all([
          getAllBookings(),
          getAllConversations(),
          getAllMedicalFiles(),
          getAllPatients(),
          getAllTeamMembers(),
          getAllActivities(),
          getAdminProfile()
        ]);
        setBookings(b);
        setConversations(c);
        setMedicalFiles(f);
        setPatients(p);
        setTeamMembers(tm);
        setActivities(a);
        setAdminProfile(admin);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);
"""

content = content.replace("} from './lib/supabase';", "} from './lib/supabase';\n" + missing_imports)

with open('src/App.tsx', 'w') as f:
    f.write(content)

