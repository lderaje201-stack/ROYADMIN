import re

with open('src/components/modals/TeamMemberModal.tsx', 'r') as f:
    content = f.read()

# Add actualFile state and change onSave signature
interface_search = "  onSave: (member: TeamMember) => void;"
interface_replacement = "  onSave: (member: TeamMember, actualFile?: File) => void;"
content = content.replace(interface_search, interface_replacement)

state_search = "  const [is_published, setPublished] = useState(true);"
state_replacement = state_search + "\n  const [actualFile, setActualFile] = useState<File | null>(null);"
content = content.replace(state_search, state_replacement)

onsave_search = """    onSave({
      id: editingMember ? editingMember.id : '',
      name,
      role,
      specialty,
      bio,
      photo_url: photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      email,
      phone,
      room_number,
      is_published,
      working_days: editingMember ? editingMember.working_days : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    });"""

onsave_replacement = """    onSave({
      id: editingMember ? editingMember.id : '',
      name,
      full_name: name,
      role,
      specialty,
      bio,
      photo_url: photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      email,
      phone,
      room_number,
      is_published,
      working_days: editingMember ? editingMember.working_days : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    }, actualFile || undefined);"""

content = content.replace(onsave_search, onsave_replacement)

# Remove the text input for image URL and replace with drag/drop area
old_photo_input = """            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL</label>
              <input
                id="team-photo-input"
                type="text"
                value={photo_url}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>"""

new_photo_input = """            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Photo</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-2 text-center hover:border-blue-500 bg-slate-50 transition-colors relative cursor-pointer flex items-center justify-center">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setActualFile(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                  {actualFile ? actualFile.name : (editingMember?.photo_url ? "Change Photo" : "Upload Image")}
                </p>
              </div>
            </div>"""

content = content.replace(old_photo_input, new_photo_input)

# Wait, TeamMemberModal.tsx has 'import { UserCheck, X } from 'lucide-react';'
# Is there an UploadCloud import? we can just use text.

with open('src/components/modals/TeamMemberModal.tsx', 'w') as f:
    f.write(content)
