import React, { useState, useEffect } from 'react';
import { TeamMember } from '../../types';
import { X, UserCheck, Image, Shield } from 'lucide-react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
  editingMember?: TeamMember | null;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMember
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+965 ');
  const [roomNumber, setRoomNumber] = useState('Suite 101');
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setRole(editingMember.role);
      setSpecialty(editingMember.specialty);
      setBio(editingMember.bio);
      setPhotoUrl(editingMember.photoUrl);
      setEmail(editingMember.email);
      setPhone(editingMember.phone);
      setRoomNumber(editingMember.roomNumber);
      setPublished(editingMember.published);
    } else {
      setName('');
      setRole('Specialist Dentist');
      setSpecialty('General & Cosmetic Dentistry');
      setBio('Dedicated dental specialist providing high-quality dental care.');
      setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80');
      setEmail('doctor@royaldental.com');
      setPhone('+965 2200 1109');
      setRoomNumber('Suite 201');
      setPublished(true);
    }
  }, [editingMember]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: editingMember ? editingMember.id : `DOC-${Math.floor(10 + Math.random() * 90)}`,
      name,
      role,
      specialty,
      bio,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      email,
      phone,
      roomNumber,
      published,
      workingDays: editingMember ? editingMember.workingDays : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="team-member-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200/60 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-slate-900" />
            <h2 className="text-base font-bold text-slate-900">
              {editingMember ? 'Edit Team Member Profile' : 'Add New Doctor / Staff Member'}
            </h2>
          </div>
          <button 
            id="close-team-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name</label>
            <input
              id="team-name-input"
              type="text"
              required
              placeholder="e.g. Dr. Faisal Al-Sabah"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Role Title</label>
              <input
                id="team-role-input"
                type="text"
                required
                placeholder="Head of Orthodontics"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty Sub-field</label>
              <input
                id="team-specialty-input"
                type="text"
                required
                placeholder="Invisalign & Lingual Braces"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Biography & Credentials</label>
            <textarea
              id="team-bio-input"
              rows={3}
              required
              placeholder="Consultant with over 15 years experience..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                id="team-email-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Extension / Phone</label>
              <input
                id="team-phone-input"
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Suite / Room</label>
              <input
                id="team-room-input"
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL</label>
              <input
                id="team-photo-input"
                type="text"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-900">Publish Profile to Website</span>
              <span className="text-[11px] text-slate-500">
                Visible to patients on the public booking portal
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="team-published-toggle"
                type="checkbox"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              id="cancel-team-form-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-neutral-200/80 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-team-form-btn"
              type="submit"
              className="px-4 py-2.5 text-xs font-semibold bg-slate-900 hover:bg-black text-white rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              {editingMember ? 'Update Profile' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
