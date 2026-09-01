const envUrl = process.argv[2];
let finalUrl = 'https://placeholder.supabase.co';
try {
  if (envUrl) {
    const u = new URL(envUrl);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      finalUrl = envUrl;
    }
  }
} catch (e) {
}
console.log(finalUrl);
