import { supabase } from './supabase.js'

async function testSupabase() {
  console.log('🔧 Testing Supabase connection...')
  
  // Простой тест - получаем текущего пользователя
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.log('❌ Auth error:', error.message)
  } else {
    console.log('✅ Supabase connected! User:', user)
  }
}

// Запускаем тест
testSupabase()
