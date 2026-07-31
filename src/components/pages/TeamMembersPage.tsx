import React, { useState } from 'react';
import { TeamMember } from '../../types';
import { 
  UserCheck, 
  Plus, 
  Edit3, 
  Search, 
  Globe, 
  EyeOff, 
  Mail, 
  Phone, 
  Building,
  Check,
  Stethoscope,
  Grid,
  List
} from 'lucide-react';

interface TeamMembersPageProps {
  teamMembers: TeamMember[];
  onTogglePublished: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (member: TeamMember) => void;
  searchQuery: string;
}

export const TeamMembersPage: React.FC<TeamMembersPageProps> = ({
  teamMembers,
  onTogglePublished,
  onOpenAddModal,
  onOpenEditModal,
  searchQuery
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredMembers = teamMembers.filter((tm) => {
    const q = searchQuery.toLowerCase();
    return !q ||
      tm.name.toLowerCase().includes(q) ||
      tm.role.toLowerCase().includes(q) ||
      tm.specialty.toLowerCase().includes(q) ||
      tm.roomNumber.toLowerCase().includes(q);
  });

  return (
    <div id="team-members-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action & View Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Clinical Team & Specialist Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage doctor bios, published website profiles, and assigned dental suites
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Grid vs Table View Toggle */}
          <div className="flex items-center bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60">
            <button
              id="view-mode-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-900 shadow-2xs text-white font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-900 shadow-2xs text-white font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            id="add-team-member-btn"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex-1 sm:flex-initial cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Doctor Profile</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl">
            <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No team members found</h3>
            <p className="text-xs text-slate-500 mt-1">Add a new doctor or specialist to the roster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                id={`team-card-${member.id}`}
                className="bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] transition-all flex flex-col justify-between"
              >
              <div className="p-5 space-y-4">
                {/* Top Profile Header */}
                <div className="flex items-start gap-3">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 font-mono">{member.id}</span>
                      {/* Published status badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        member.published
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {member.published ? <Globe className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        {member.published ? 'Published' : 'Hidden'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">{member.name}</h3>
                    <p className="text-xs font-semibold text-slate-700 leading-tight truncate">{member.role}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{member.specialty}</p>
                  </div>
                </div>

                {/* Bio text */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {member.bio}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{member.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {/* Published Toggle Switch */}
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id={`toggle-published-${member.id}`}
                      type="checkbox"
                      checked={member.published}
                      onChange={() => onTogglePublished(member.id)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {member.published ? 'Site Live' : 'Draft'}
                  </span>
                </div>

                {/* Edit Button */}
                <button
                  id={`edit-team-btn-${member.id}`}
                  onClick={() => onOpenEditModal(member)}
                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table id="team-members-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Doctor Name & Photo</th>
                  <th className="py-3.5 px-4">Role & Specialty</th>
                  <th className="py-3.5 px-4">Suite / Suite Email</th>
                  <th className="py-3.5 px-4 text-center">Published Switch</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-slate-900">No team members found</h3>
                      <p className="text-xs text-slate-500 mt-1">Add a new doctor or specialist to the roster.</p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{m.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{m.role}</div>
                      <div className="text-[11px] text-slate-500">{m.specialty}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{m.roomNumber}</div>
                      <div className="text-[11px] text-slate-500">{m.email}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          id={`table-toggle-published-${m.id}`}
                          type="checkbox"
                          checked={m.published}
                          onChange={() => onTogglePublished(m.id)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        id={`table-edit-team-btn-${m.id}`}
                        onClick={() => onOpenEditModal(m)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200 transition-colors"
                      >
                        Edit Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
