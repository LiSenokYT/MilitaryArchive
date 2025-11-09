import { supabase } from './supabase.js'

export async function registerUser(email, password, username) {
  try {
    console.log('🔧 Starting registration...', { email, username });
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          full_name: username
        }
      }
    });
    
    if (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
    
    console.log('✅ Registration successful:', data.user);
    return { success: true, user: data.user };
    
  } catch (error) {
    console.error('🚨 Auth error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    return { success: true, user: data.user };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error);
}
