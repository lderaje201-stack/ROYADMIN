import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the corrupted import block
corrupted_import = r"getAllActivities\(\),\s*getAdminProfile\(\)\s*\]\);\s*setBookings\(b\);\s*setConversations\(c\);\s*setMedicalFiles\(f\);\s*setPatients\(p\);\s*setTeamMembers\(tm\);\s*setActivities\(a\);\s*setAdminProfile\(admin\);\s*\} catch \(err\) \{\s*console\.error\('Error loading initial data:', err\);\s*\} finally \{\s*setIsLoading\(false\);\s*\}\s*\}\s*loadData\(\);\s*\}, \[\]\);"

new_import = """getAllActivities,
  getAdminProfile, createBooking, updateBookingStatus, rescheduleBooking, sendMessage, toggleFileReviewed, createMedicalFile, createPatient, saveTeamMember, toggleTeamPublished, createActivity
} from './lib/supabase';
"""

# Find where it was injected
content = re.sub(r"getAllActivities\(\),\s*getAdminProfile\(\)\s*\]\);\s*setBookings.*?\}, \[\]\);", new_import, content, flags=re.DOTALL)

# Add back the loadData function
load_data_block = """  useEffect(() => {
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

content = content.replace("const [adminProfile, setAdminProfile] = useState<TeamMember | null>(null);", "const [adminProfile, setAdminProfile] = useState<TeamMember | null>(null);\n\n" + load_data_block)


with open('src/App.tsx', 'w') as f:
    f.write(content)

