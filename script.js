// Основные функции сайта
document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Закрываем мобильное меню
                if (window.innerWidth <= 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
    
    // Активное состояние навигации
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Проверка авторизации
    checkAuth();
});

// Функции для модального окна
let currentMod = '';

function showAccessModal(modType) {
    currentMod = modType;
    const modal = document.getElementById('accessModal');
    const message = document.getElementById('modalMessage');
    
    if (modType === 'tester') {
        message.textContent = 'Для получения доступа к Tester версии необходимо получить инвайт от администратора.';
    } else {
        message.textContent = `Запрос доступа к ${modType} версии`;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('accessModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentMod = '';
}

function submitAccessRequest() {
    const username = document.getElementById('username').value;
    const inviteCode = document.getElementById('inviteCode').value;
    
    if (!username) {
        alert('Пожалуйста, введите ваш никнейм');
        return;
    }
    
    // Здесь будет отправка запроса на сервер
    alert(`Запрос на доступ к ${currentMod} отправлен! Мы свяжемся с вами в ближайшее время.`);
    closeModal();
}

function selectMod(modType) {
    const mods = {
        'basic': { name: 'RustMe Basic', price: 99 },
        'lite': { name: 'RustMe Lite', price: 89 },
        'legit': { name: 'RustMe Legit', price: 79 },
        'full': { name: 'RustMe Full', price: 199 }
    };
    
    const mod = mods[modType];
    if (mod) {
        alert(`Вы выбрали: ${mod.name}\nЦена: ${mod.price}₽/месяц\n\nДля покупки свяжитесь с администратором.`);
    }
}

// Система авторизации
const USER_KEY = 'rustme_user';
const DEVELOPER_ACCOUNT = {
    username: 'RoftekDEV',
    password: 'dimok2016',
    role: 'developer',
    created: new Date().toISOString(),
    subscriptions: ['full', 'basic', 'legit', 'lite', 'tester'],
    permissions: ['all']
};

function checkAuth() {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    const loginBtn = document.querySelector('a[href="login.html"]');
    
    if (user) {
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${user.username}`;
            loginBtn.href = 'dashboard.html';
            
            // Добавляем коронку для разработчика
            if (user.role === 'developer') {
                loginBtn.innerHTML = `<i class="fas fa-crown"></i> ${user.username}`;
            }
        }
        
        // Проверяем, есть ли администратор
        if (!localStorage.getItem('rustme_admin_created')) {
            localStorage.setItem('rustme_admin_created', 'true');
        }
    }
}

// Функция для создания аккаунта разработчика
function createDeveloperAccount() {
    localStorage.setItem(USER_KEY, JSON.stringify(DEVELOPER_ACCOUNT));
    localStorage.setItem('rustme_admin_created', 'true');
    alert('Аккаунт разработчика создан!\nЛогин: RoftekDEV\nПароль: dimok2016');
}

// Если это страница логина, добавляем создание аккаунта разработчика
if (window.location.pathname.includes('login.html')) {
    if (!localStorage.getItem('rustme_admin_created')) {
        createDeveloperAccount();
    }
}

// Функция для входа
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Проверка аккаунта разработчика
    if (username === 'RoftekDEV' && password === 'dimok2016') {
        localStorage.setItem(USER_KEY, JSON.stringify(DEVELOPER_ACCOUNT));
        window.location.href = 'admin-panel.html';
        return;
    }
    
    // Проверка других пользователей
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (user && user.username === username) {
        // Для демо - любой пароль подходит
        window.location.href = user.role === 'developer' ? 'admin-panel.html' : 'dashboard.html';
    } else {
        alert('Неверные данные для входа');
    }
}

// Функция для регистрации
function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;
    
    if (!username || !password || !email) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    const newUser = {
        username,
        password,
        email,
        role: 'user',
        created: new Date().toISOString(),
        subscriptions: [],
        permissions: []
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    alert('Регистрация успешна!');
    window.location.href = 'dashboard.html';
}

// Функция для выхода
function logout() {
    localStorage.removeItem(USER_KEY);
    window.location.href = 'index.html';
}