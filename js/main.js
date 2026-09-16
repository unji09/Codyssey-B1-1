'use strict';

// DOM 요소
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const header = $('#header');
const hamburger = $('#hamburger');
const navMenu = $('#nav-menu');
const themeToggle = $('#theme-toggle');
const themeIcon = $('#theme-icon');
const scrollTopBtn = $('#scroll-top');
const contactForm = $('#contact-form');
const projectsGrid = $('#projects-grid');

// 1. 다크 모드 (이벤트 → 상태 → 렌더링)
const themeState = {
  current: localStorage.getItem('theme') || 'light'
};

const renderTheme = () => {
  document.documentElement.setAttribute('data-theme', themeState.current);
  themeIcon.className = themeState.current === 'dark'
    ? 'fa-solid fa-sun'
    : 'fa-solid fa-moon';
};

const toggleTheme = () => {
  themeState.current = themeState.current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', themeState.current);
  renderTheme();
};

renderTheme();
themeToggle.addEventListener('click', toggleTheme);

// 2. 햄버거 메뉴
const overlay = document.createElement('div');
overlay.classList.add('nav__overlay');
document.body.appendChild(overlay);

const toggleMenu = () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  overlay.classList.toggle('active');
};

const closeMenu = () => {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  overlay.classList.remove('active');
};

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);

$$('.nav__link').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// 3. 스크롤 이벤트
const SCROLL_NAV_THRESHOLD = 60;
const SCROLL_TOP_THRESHOLD = 300;

const handleScroll = () => {
  const scrollY = window.scrollY;

  if (scrollY > SCROLL_NAV_THRESHOLD) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  if (scrollY > SCROLL_TOP_THRESHOLD) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
};

window.addEventListener('scroll', handleScroll);

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 4. Intersection Observer (threshold: 0.2)
const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeInObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

$$('.section__title, .about__grid, .skill-card, .contact__form').forEach((el) => {
  el.classList.add('fade-in');
  fadeInObserver.observe(el);
});

// 5. 폼 유효성 검사 (이벤트 → 상태 → 렌더링)
const formState = {
  name: { value: '', error: '' },
  email: { value: '', error: '' },
  message: { value: '', error: '' },
  submitted: false
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_ERRORS = {
  name: '이름을 입력해주세요.',
  email: '이메일을 입력해주세요.',
  message: '메시지를 입력해주세요.'
};

const validateField = (field, value) => {
  if (!value.trim()) return FIELD_ERRORS[field];
  if (field === 'email' && !EMAIL_REGEX.test(value)) return '올바른 이메일 형식을 입력해주세요.';
  return '';
};

const renderFormErrors = () => {
  ['name', 'email', 'message'].forEach((field) => {
    const errorEl = $(`#${field}-error`);
    const inputEl = $(`#${field}`);
    const { error } = formState[field];

    errorEl.textContent = error;
    if (error) {
      inputEl.classList.add('error');
    } else {
      inputEl.classList.remove('error');
    }
  });
};

const renderFormSuccess = () => {
  const successEl = $('#form-success');
  if (formState.submitted) {
    successEl.classList.add('show');
    contactForm.reset();
    setTimeout(() => {
      formState.submitted = false;
      successEl.classList.remove('show');
    }, 3000);
  }
};

// 실시간 입력 검증
['name', 'email', 'message'].forEach((field) => {
  const inputEl = $(`#${field}`);
  inputEl.addEventListener('input', (e) => {
    formState[field].value = e.target.value;
    formState[field].error = validateField(field, e.target.value);
    renderFormErrors();
  });
});

// 폼 제출
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let hasError = false;
  ['name', 'email', 'message'].forEach((field) => {
    const value = $(`#${field}`).value;
    formState[field].value = value;
    formState[field].error = validateField(field, value);
    if (formState[field].error) hasError = true;
  });

  renderFormErrors();

  if (!hasError) {
    formState.submitted = true;
    ['name', 'email', 'message'].forEach((field) => {
      formState[field] = { value: '', error: '' };
    });
    renderFormSuccess();
  }
});

// 6. GitHub API 연동 (이벤트 → 상태 → 렌더링)
const GITHUB_USERNAME = 'unji09';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`;

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Java: '#b07219',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  C: '#555555',
  'C++': '#f34b7d',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Shell: '#89e051',
  null: '#8b8b8b'
};

const projectState = {
  status: 'loading',
  repos: [],
  errorMessage: ''
};

const createProjectCard = ({ name, description, language, stargazers_count, html_url, homepage }) => {
  const langColor = LANG_COLORS[language] || LANG_COLORS[null];
  const desc = description || '';

  return `
    <article class="project-card fade-in visible">
      <div class="project-card__header">
        <i class="fa-solid fa-folder-open project-card__icon"></i>
        <h3 class="project-card__name">${name}</h3>
      </div>
      ${desc ? `<p class="project-card__desc">${desc}</p>` : ''}
      <div class="project-card__meta">
        ${language ? `
          <span class="project-card__meta-item">
            <span class="project-card__lang-dot" style="background-color: ${langColor}"></span>
            ${language}
          </span>
        ` : ''}
        <span class="project-card__meta-item">
          <i class="fa-solid fa-star"></i> ${stargazers_count}
        </span>
      </div>
      <div class="project-card__links">
        <a href="${html_url}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--small">
          <i class="fa-brands fa-github"></i> GitHub
        </a>
        ${homepage ? `
          <a href="${homepage}" target="_blank" rel="noopener noreferrer" class="btn btn--primary btn--small">
            <i class="fa-solid fa-link"></i> Demo
          </a>
        ` : ''}
      </div>
    </article>
  `;
};

const renderProjects = () => {
  const { status, repos, errorMessage } = projectState;

  switch (status) {
    case 'loading':
      projectsGrid.innerHTML = `
        <div class="projects__status">
          <div class="spinner"></div>
          <p>프로젝트를 불러오는 중...</p>
        </div>
      `;
      break;

    case 'error':
      projectsGrid.innerHTML = `
        <div class="projects__status">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>${errorMessage}</p>
          <button class="btn btn--primary btn--small" id="retry-btn">
            <i class="fa-solid fa-rotate-right"></i> 다시 시도
          </button>
        </div>
      `;
      const retryBtn = $('#retry-btn');
      if (retryBtn) retryBtn.addEventListener('click', fetchProjects);
      break;

    case 'empty':
      projectsGrid.innerHTML = `
        <div class="projects__status">
          <i class="fa-solid fa-inbox"></i>
          <p>표시할 프로젝트가 없습니다.</p>
        </div>
      `;
      break;

    case 'success':
      projectsGrid.innerHTML = repos
        .map((repo) => createProjectCard(repo))
        .join('');
      break;
  }
};

const fetchProjects = async () => {
  projectState.status = 'loading';
  renderProjects();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error('프로젝트를 불러올 수 없습니다.');
    }

    const repos = await response.json();
    const ownRepos = repos.filter(({ fork }) => !fork);

    if (ownRepos.length === 0) {
      projectState.status = 'empty';
      projectState.repos = [];
    } else {
      projectState.status = 'success';
      projectState.repos = ownRepos;
    }

    renderProjects();
  } catch (error) {
    projectState.status = 'error';
    projectState.errorMessage = error.message;
    renderProjects();
  }
};

fetchProjects();