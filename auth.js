// auth.js - Система аутентификации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.usersKey = 'armor_archive_users';
        this.currentUserKey = 'armor_archive_current_user';
        this.init();
    }

    init() {
        // Загружаем текущего пользователя из localStorage
        const savedUser = localStorage.getItem(this.currentUserKey);
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }

    // Регистрация нового пользователя
    register(userData) {
        const users = this.getUsers();
        
        // Проверяем, существует ли пользователь
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        if (users.find(u => u.username === userData.username)) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        // Создаем нового пользователя
        const newUser = {
            id: this.generateId(),
            username: userData.username,
            email: userData.email,
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            profile: {
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                avatar: '',
                bio: '',
                favorites: []
            }
        };

        users.push(newUser);
        this.saveUsers(users);
        
        return this.login(userData.email, userData.password);
    }

    // Вход пользователя
    login(emailOrUsername, password) {
        const users = this.getUsers();
        const user = users.find(u => 
            u.email === emailOrUsername || u.username === emailOrUsername
        );

        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Неверный email/имя пользователя или пароль');
        }

        // Сохраняем пользователя в текущей сессии
        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword;
        localStorage.setItem(this.currentUserKey, JSON.stringify(userWithoutPassword));
        
        this.updateUI();
        return userWithoutPassword;
    }

    // Выход пользователя
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.currentUserKey);
        this.updateUI();
        window.location.href = 'index.html';
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Обновление профиля
    updateProfile(profileData) {
        if (!this.isAuthenticated()) {
            throw new Error('Пользователь не авторизован');
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].profile = { ...users[userIndex].profile, ...profileData };
            
            // Обновляем текущего пользователя
            this.currentUser.profile = users[userIndex].profile;
            
            this.saveUsers(users);
            localStorage.setItem(this.currentUserKey, JSON.stringify(this.currentUser));
            this.updateUI();
        }
    }

    // Добавление в избранное
    addToFavorites(itemId, itemType) {
        if (!this.isAuthenticated()) return;

        const favorite = { id: itemId, type: itemType, addedAt: new Date().toISOString() };
        
        if (!this.currentUser.profile.favorites.find(f => f.id === itemId && f.type === itemType)) {
            this.currentUser.profile.favorites.push(favorite);
            this.updateProfile({ favorites: this.currentUser.profile.favorites });
        }
    }

    // Удаление из избранного
    removeFromFavorites(itemId, itemType) {
        if (!this.isAuthenticated()) return;

        const updatedFavorites = this.currentUser.profile.favorites.filter(
            f => !(f.id === itemId && f.type === itemType)
        );
        
        this.updateProfile({ favorites: updatedFavorites });
    }

    // Вспомогательные методы
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    hashPassword(password) {
        // Простое хеширование для демонстрации
        // В реальном приложении используйте bcrypt или аналоги
        return btoa(unescape(encodeURIComponent(password)));
    }

    // Обновление интерфейса
    updateUI() {
        const authButtons = document.querySelector('.nav-actions');
        if (!authButtons) return;

        if (this.isAuthenticated()) {
            authButtons.innerHTML = `
                <button class="icon-btn" id="favoritesBtn">
                    <i class="fas fa-bookmark"></i>
                </button>
                <div class="user-dropdown">
                    <button class="icon-btn" id="userMenuBtn">
                        <i class="fas fa-user"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> Мой профиль
                        </a>
                        <a href="favorites.html" class="dropdown-item">
                            <i class="fas fa-bookmark"></i> Избранное
                        </a>
                        <div class="dropdown-divider"></div>
                        <button class="dropdown-item" id="logoutBtn">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </button>
                    </div>
                </div>
            `;

            // Добавляем обработчики для выпадающего меню
            const userMenuBtn = document.getElementById('userMenuBtn');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const logoutBtn = document.getElementById('logoutBtn');

            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            logoutBtn.addEventListener('click', () => {
                this.logout();
            });

            // Закрываем меню при клике вне его
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });

        } else {
            authButtons.innerHTML = `
                <button class="icon-btn">
                    <i class="fas fa-bookmark"></i>
                </button>
                <a href="login.html" class="icon-btn">
                    <i class="fas fa-user"></i>
                </a>
            `;
        }
    }
}

// Инициализация глобальной системы аутентификации
window.authSystem = new AuthSystem();