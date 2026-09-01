import re

with open('src/lib/supabase.ts', 'r') as f:
    content = f.read()

# Replace the assignment of envUrl and envKey
replacement = """const metaEnv = (import.meta as any).env || {};

// Sanitize env variables to prevent HTTP header non-ISO-8859-1 code point errors
const sanitizeEnv = (val: string) => {
  if (!val) return '';
  return val.replace(/[^\\x20-\\x7E]/g, '').trim();
};

const envUrl = sanitizeEnv(metaEnv.VITE_SUPABASE_URL);
const envKey = sanitizeEnv(metaEnv.VITE_SUPABASE_ANON_KEY);"""

content = re.sub(r'const metaEnv.*const envKey = metaEnv\.VITE_SUPABASE_ANON_KEY \|\| \'\';', replacement, content, flags=re.DOTALL)

with open('src/lib/supabase.ts', 'w') as f:
    f.write(content)
