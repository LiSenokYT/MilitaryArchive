import { supabase } from './supabase.js'

async function loadEnhancedProfile() {
  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    window.location.href = '/login.html'
    return
  }
  
  // Загружаем данные профиля
  await loadUserProfile(user)
  
  // Загружаем дополнительные данные
  await loadUserBookmarks(user)
  await loadUserActivity(user)
  await loadUserStats(user)
  await loadUserAchievements(user)
}

async function loadUserProfile(user) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error

    // Обновляем интерфейс
    updateProfileUI(user, profile)
    
  } catch (error) {
    console.error('Ошибка загрузки профиля:', error)
    showError('Не удалось загрузить профиль')
  }
}

function updateProfileUI(user, profile) {
  // Аватар
  const avatar = document.getElementById('userAvatar')
  const initials = profile?.username ? profile.username.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()
  avatar.innerHTML = initials
  
  // Имя пользователя
  document.getElementById('userName').textContent = profile?.username || user.email
  
  // Ранг (можно добавить логику для определения ранга)
  const rank = document.getElementById('userRank')
  rank.textContent = getUserRank(profile)
  
  // Био
  const bio = document.getElementById('userBio')
  bio.textContent = profile?.bio || `Участник сообщества с ${new Date(user.created_at).getFullYear()} года.`
}

function getUserRank(profile) {
  // Простая логика определения ранга (можно усложнить)
  const joinDate = new Date(profile?.created_at || new Date())
  const monthsSinceJoin = (new Date() - joinDate) / (1000 * 60 * 60 * 24 * 30)
  
  if (monthsSinceJoin > 24) return 'Ветеран сообщества'
  if (monthsSinceJoin > 12) return 'Опытный исследователь'
  if (monthsSinceJoin > 6) return 'Активный участник'
  if (monthsSinceJoin > 3) return 'Любитель техники'
  return 'Новичок'
}

async function loadUserBookmarks(user) {
  // Заглушка - в будущем можно подключить реальные закладки
  const bookmarksList = document.getElementById('bookmarksList')
  bookmarksList.innerHTML = `
    <div class="bookmark-card">
      <div class="bookmark-image">
        <img src="https://images.unsplash.com/photo-1546345501-c12f135fb1b0?q=80&w=1470" alt="Т-34">
        <div class="bookmark-type">Танк</div>
      </div>
      <div class="bookmark-content">
        <h3>Т-34-85</h3>
        <div class="bookmark-meta">
          <span class="meta-item"><i class="fas fa-flag"></i> СССР</span>
          <span class="meta-item"><i class="fas fa-calendar"></i> 1943-1958</span>
        </div>
        <p>Советский средний танк периода Великой Отечественной войны.</p>
        <div class="bookmark-actions">
          <a href="/tanks.html" class="bookmark-btn">Открыть</a>
          <button class="bookmark-btn remove-btn">Удалить</button>
        </div>
      </div>
    </div>
  `
  
  // Обновляем счетчик закладок
  document.getElementById('statBookmarks').textContent = '1'
}

async function loadUserActivity(user) {
  // Заглушка активности
  document.getElementById('statDays').textContent = Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
}

async function loadUserStats(user) {
  // Заглушка статистики
  document.getElementById('statViews').textContent = '128'
  document.getElementById('statComments').textContent = '23'
}

async function loadUserAchievements(user) {
  // Заглушка достижений
}

function showError(message) {
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 10000;
  `
  errorDiv.textContent = message
  document.body.appendChild(errorDiv)
  
  setTimeout(() => {
    errorDiv.remove()
  }, 5000)
}

// Запускаем загрузку профиля
document.addEventListener('DOMContentLoaded', loadEnhancedProfile)
