import React, { useState, useEffect } from 'react';
import { AgentAction, getPendingActions, updateActionStatus } from '../../services/AgentService';
import { Bot, Check, X, Edit, Clock } from 'lucide-react';
import { Toast } from '../../types';

export default function AgentApprovalPage({ showToast }: { showToast: (t: Toast) => void }) {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPayload, setEditPayload] = useState<string>('');

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    setLoading(true);
    const data = await getPendingActions();
    setActions(data);
    setLoading(false);
  };

  const handleApprove = async (id: string, currentPayload: any) => {
    const payload = editingId === id ? JSON.parse(editPayload) : currentPayload;
    const success = await updateActionStatus(id, 'approved', payload);
    if (success) {
      showToast({ id: Date.now().toString(), type: 'success', message: 'Action approved and executed.' });
      setEditingId(null);
      loadActions();
    } else {
      showToast({ id: Date.now().toString(), type: 'error', message: 'Failed to approve action.' });
    }
  };

  const handleReject = async (id: string) => {
    const success = await updateActionStatus(id, 'rejected');
    if (success) {
      showToast({ id: Date.now().toString(), type: 'info', message: 'Action rejected.' });
      setEditingId(null);
      loadActions();
    } else {
      showToast({ id: Date.now().toString(), type: 'error', message: 'Failed to reject action.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Agent Approvals</h2>
          <p className="text-gray-500 mt-1">Review and approve actions proposed by the AI Agent.</p>
        </div>
        <button onClick={loadActions} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          Refresh Queue
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Payload</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading queue...</span>
                    </div>
                  </td>
                </tr>
              ) : actions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Bot className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-900">Queue is empty</p>
                    <p>No pending actions from the AI Agent.</p>
                  </td>
                </tr>
              ) : (
                actions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.status === 'auto_sent' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {action.status === 'auto_sent' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{action.action_type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500 capitalize">{action.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{action.target_table}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{action.target_id.substring(0, 8)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === action.id ? (
                        <textarea
                          className="w-full text-sm font-mono bg-white border border-indigo-300 rounded p-2 focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                          value={editPayload}
                          onChange={(e) => setEditPayload(e.target.value)}
                        />
                      ) : (
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs font-mono text-gray-600 overflow-hidden max-h-24">
                          {JSON.stringify(action.proposed_payload, null, 2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {editingId === action.id ? (
                          <>
                            <button onClick={() => handleApprove(action.id, action.proposed_payload)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors" title="Save & Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Cancel Edit">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(action.id); setEditPayload(JSON.stringify(action.proposed_payload, null, 2)); }} className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded transition-colors" title="Edit Payload">
                              <Edit className="w-4 h-4" />
                            </button>
                            {action.status !== 'auto_sent' && (
                              <button onClick={() => handleApprove(action.id, action.proposed_payload)} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors" title="Approve">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleReject(action.id)} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
