require('dotenv').config({ path: '/home/jass/projects/cloud-computing/projects/foodzie/6weeks_Jaspreet_SERN/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('User').select('*').limit(2);
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
