import re

with open('src/components/pages/TestimonialsPage.tsx', 'r') as f:
    content = f.read()

# I see it says "{/* Toggle Featured */}" and then a td with text-center.
pattern = r"\{/\* Toggle Featured \*/\}.*?</button>\s*</td>"
new_td = """{/* Actions */}
                    <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleTogglePublished(r.id, r.is_published)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          r.is_published
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {r.is_published ? (
                          <>
                            <Globe className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Published (Live)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setReviewToDelete(r.id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>"""

content = re.sub(pattern, new_td, content, flags=re.DOTALL)

with open('src/components/pages/TestimonialsPage.tsx', 'w') as f:
    f.write(content)

