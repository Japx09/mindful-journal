// ===================== CUSTOM ALERTS/CONFIRMS =====================

window.showCustomModal = function (options) {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-dialog-modal');
    const card = document.getElementById('custom-dialog-card');
    const titleEl = document.getElementById('custom-dialog-title');
    const msgEl = document.getElementById('custom-dialog-message');
    const buttonsEl = document.getElementById('custom-dialog-buttons');

    if (!modal) {
      if (options.type === 'confirm') resolve(confirm(options.message));
      else { alert(options.message); resolve(true); }
      return;
    }

    titleEl.textContent = options.title || (options.type === 'confirm' ? 'Confirm' : 'Notice');
    msgEl.textContent = options.message;
    buttonsEl.innerHTML = '';

    const close = (result) => {
      card.classList.remove('scale-100', 'opacity-100');
      card.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        resolve(result);
      }, 200);
    };

    if (options.type === 'confirm') {
       buttonsEl.innerHTML = `
         <button id="custom-dialog-cancel" class="flex-1 py-3 px-4 rounded-xl font-bold bg-brand-gray text-brand-dark hover:bg-gray-200 transition-colors cursor-pointer">Cancel</button>
         <button id="custom-dialog-confirm" class="flex-1 py-3 px-4 rounded-xl font-bold transition-colors cursor-pointer ${options.isDanger ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-brand-yellow hover:scale-105 text-brand-dark shadow-[0_4px_15px_rgba(255,184,51,0.4)]'}">${options.confirmText || 'Yes'}</button>
       `;
       document.getElementById('custom-dialog-cancel').onclick = () => close(false);
       document.getElementById('custom-dialog-confirm').onclick = () => close(true);
    } else {
       buttonsEl.innerHTML = `
         <button id="custom-dialog-ok" class="w-full py-3 px-4 rounded-xl font-bold bg-brand-dark hover:bg-black text-white transition-colors cursor-pointer">OK</button>
       `;
       document.getElementById('custom-dialog-ok').onclick = () => close(true);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
      card.classList.remove('scale-95', 'opacity-0');
      card.classList.add('scale-100', 'opacity-100');
    });
  });
};

window.showAlert = function(message, title = "Notification") {
  return window.showCustomModal({ type: 'alert', message, title });
}

window.showConfirm = function(message, title = "Are you sure?", isDanger = false, confirmText = "Confirm") {
  return window.showCustomModal({ type: 'confirm', message, title, isDanger, confirmText });
}

// ===================== LOCAL STORAGE AUTH =====================

let authStore = {
  users: {}, // email -> { name, email, password, role, description, avatar, avatarColor }
  currentUserId: null
};

function loadAuthStore() {
  const data = localStorage.getItem('journal_auth_store');
  if (data) authStore = JSON.parse(data);
}

function saveAuthStore() {
  localStorage.setItem('journal_auth_store', JSON.stringify(authStore));
}

function getCurrentUser() {
  return authStore.currentUserId ? authStore.users[authStore.currentUserId] : null;
}

function getAvatarHtml(user, size = 80) {
  const s = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;`;
  const bg = (user && user.avatarColor) || '#FFB833';
  const fs = Math.round(size * 0.38);
  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : '?';
  if (user && user.avatar) {
    return `<img src="${user.avatar}" style="${s}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div style="${s}display:none;background:${bg};align-items:center;justify-content:center;font-size:${fs}px;font-weight:800;color:white;">${initial}</div>`;
  }
  return `<div style="${s}background:${bg};display:flex;align-items:center;justify-content:center;font-size:${fs}px;font-weight:800;color:white;">${initial}</div>`;
}

// ---- UI helpers ----
function showAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  el.style.display = 'flex'; el.style.flexDirection = 'column'; el.classList.remove('hide');
}
function dismissAuthOverlay() {
  const el = document.getElementById('auth-overlay');
  el.classList.add('hide'); setTimeout(() => { el.style.display = 'none'; }, 420);
}

// ---- AUTH SCREENS ----
window.renderWelcomeScreen = function () {
  document.getElementById('auth-overlay').innerHTML = `
    <div class="auth-screen auth-welcome-bg flex flex-col flex-1 items-center justify-between p-8 pb-14" style="min-height:100%">
      <div class="w-full flex justify-end"><div class="w-2 h-2 rounded-full bg-white/30"></div></div>
      <div class="text-center">
        <div class="w-20 h-20 rounded-[28px] bg-brand-yellow flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,184,51,0.4)]">
          <i class="ri-quill-pen-fill text-white text-4xl"></i>
        </div>
        <h1 class="text-4xl font-bold text-white tracking-tight mb-3">Mindful<br>Journal</h1>
        <p class="text-white/60 text-sm leading-relaxed max-w-[240px] mx-auto">Your private space to reflect, grow, and find peace.</p>
      </div>
      <div class="w-full flex flex-col gap-3">
        <button class="auth-btn yellow" onclick="renderSignUpScreen()">Create Account</button>
        <button class="auth-btn" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);" onclick="renderLoginScreen()">Sign In</button>
      </div>
    </div>
  `;
}
function renderWelcomeScreen() { window.renderWelcomeScreen(); }

window.renderLoginScreen = function () {
  document.getElementById('auth-overlay').innerHTML = `
    <div class="auth-screen flex flex-col flex-1 p-7 pt-14" style="min-height:100%">
      <button onclick="renderWelcomeScreen()" class="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center mb-8"><i class="ri-arrow-left-s-line text-2xl text-brand-dark"></i></button>
      <h2 class="text-3xl font-bold text-brand-dark mb-1">Welcome back</h2>
      <p class="text-brand-lightText mb-8 text-sm">Sign in to continue your journey.</p>
      <div class="flex flex-col gap-4">
        <div><label class="text-xs font-semibold text-brand-text/60 uppercase tracking-wider mb-2 block">Email</label><input id="login-email" type="email" placeholder="you@email.com" class="auth-input"></div>
        <div>
          <label class="text-xs font-semibold text-brand-text/60 uppercase tracking-wider mb-2 block">Password</label>
          <div class="relative">
            <input id="login-password" type="password" placeholder="••••••••" class="auth-input w-full pr-12">
            <button tabindex="-1" type="button" onclick="togglePasswordVisibility('login-password', 'login-eye-icon')" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-lightText hover:text-brand-dark transition-colors">
              <i id="login-eye-icon" class="ri-eye-off-line text-lg"></i>
            </button>
          </div>
        </div>
        <p id="login-error" class="text-red-500 text-sm hidden"></p>
        <button class="auth-btn yellow mt-2" onclick="handleLogin()">Sign In</button>
      </div>
      <p class="mt-auto text-center text-sm text-brand-lightText pt-8">New here? <button onclick="renderSignUpScreen()" class="text-brand-orange font-bold">Create an account</button></p>
    </div>
  `;
}
function renderLoginScreen() { window.renderLoginScreen(); }

window.handleLogin = function () {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  if (!email || !pass) { err.textContent = 'Please fill in all fields.'; err.classList.remove('hidden'); return; }

  if (authStore.users[email] && authStore.users[email].password === pass) {
    authStore.currentUserId = email;
    saveAuthStore();
    bootApp();
  } else {
    err.textContent = 'Incorrect email or password.';
    err.classList.remove('hidden');
  }
}

window.renderSignUpScreen = function () {
  document.getElementById('auth-overlay').innerHTML = `
    <div class="auth-screen flex flex-col flex-1 p-7 pt-14 overflow-y-auto" style="min-height:100%">
      <button onclick="renderWelcomeScreen()" class="w-10 h-10 rounded-full bg-brand-gray flex items-center justify-center mb-8"><i class="ri-arrow-left-s-line text-2xl text-brand-dark"></i></button>
      <h2 class="text-3xl font-bold text-brand-dark mb-1">Create account</h2>
      <p class="text-brand-lightText mb-8 text-sm">Start your mindful journaling journey today.</p>
      <div class="flex flex-col gap-4 mb-8">
        <div><label class="text-xs font-semibold text-brand-text/60 uppercase tracking-wider mb-2 block">Full Name</label><input id="signup-name" type="text" placeholder="Your name" class="auth-input"></div>
        <div><label class="text-xs font-semibold text-brand-text/60 uppercase tracking-wider mb-2 block">Email</label><input id="signup-email" type="email" placeholder="you@email.com" class="auth-input"></div>
        <div>
          <label class="text-xs font-semibold text-brand-text/60 uppercase tracking-wider mb-2 block">Password</label>
          <div class="relative">
            <input id="signup-password" type="password" placeholder="Min. 6 characters" class="auth-input w-full pr-12">
            <button tabindex="-1" type="button" onclick="togglePasswordVisibility('signup-password', 'signup-eye-icon')" class="absolute right-4 top-1/2 -translate-y-1/2 text-brand-lightText hover:text-brand-dark transition-colors">
              <i id="signup-eye-icon" class="ri-eye-off-line text-lg"></i>
            </button>
          </div>
        </div>
        <p id="signup-error" class="text-red-500 text-sm hidden"></p>
        <button class="auth-btn yellow" onclick="handleSignUp()">Continue</button>
      </div>
      <p class="text-center text-sm text-brand-lightText">Already have an account? <button onclick="renderLoginScreen()" class="text-brand-orange font-bold">Sign In</button></p>
    </div>
  `;
}
function renderSignUpScreen() { window.renderSignUpScreen(); }

window.togglePasswordVisibility = function (inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
  } else {
    input.type = 'password';
    icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
  }
}

window.handleSignUp = function () {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pass = document.getElementById('signup-password').value;
  const err = document.getElementById('signup-error');

  if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; err.classList.remove('hidden'); return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; err.classList.remove('hidden'); return; }
  if (authStore.users[email]) { err.textContent = 'An account with that email already exists.'; err.classList.remove('hidden'); return; }

  authStore.users[email] = { name, email, password: pass, role: null, description: '', avatar: '', avatarColor: '#FFB833' };
  authStore.currentUserId = email;
  saveAuthStore();
  renderRoleScreen();
}

let _selectedRole = null;
window.renderRoleScreen = function () {
  document.getElementById('auth-overlay').innerHTML = `
    <div class="auth-screen flex flex-col flex-1 p-7 pt-14" style="min-height:100%">
      <div class="w-14 h-14 rounded-[18px] bg-brand-yellow/20 flex items-center justify-center mb-6"><i class="ri-user-heart-line text-brand-yellow text-2xl"></i></div>
      <h2 class="text-3xl font-bold text-brand-dark mb-2">Who are you?</h2>
      <p class="text-brand-lightText text-sm mb-10">Help us personalise your experience. You can change this later in Profile.</p>
      <div class="flex gap-4 mb-10">
        <div class="role-card" id="role-student" onclick="selectRole('Student')">
          <div class="role-check w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-white"><i class="ri-check-line text-sm"></i></div>
          <div class="text-4xl mb-3">🎓</div><div class="font-bold text-brand-dark text-lg">Student</div><div class="text-xs text-brand-lightText mt-1">Learning, growing, exploring</div>
        </div>
        <div class="role-card" id="role-employee" onclick="selectRole('Employee')">
          <div class="role-check w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-white"><i class="ri-check-line text-sm"></i></div>
          <div class="text-4xl mb-3">💼</div><div class="font-bold text-brand-dark text-lg">Employee</div><div class="text-xs text-brand-lightText mt-1">Working, building, achieving</div>
        </div>
      </div>
      <button id="role-continue-btn" class="auth-btn" style="opacity:0.4;pointer-events:none" onclick="confirmRole()">Get Started <i class="ri-arrow-right-line ml-1"></i></button>
    </div>
  `;
}
function renderRoleScreen() { window.renderRoleScreen(); }

window.selectRole = function (role) {
  _selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`role-${role.toLowerCase()}`).classList.add('selected');
  const btn = document.getElementById('role-continue-btn');
  btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.classList.add('yellow');
}

window.confirmRole = function () {
  if (!_selectedRole) return;
  const user = getCurrentUser();
  if (user) {
    user.role = _selectedRole;
    saveAuthStore();
    bootApp();
  }
}

// ---- Boot ----
function bootApp() {
  initStore();
  initNavigation();
  const user = getCurrentUser();
  if (user && !user.role) {
    showAuthOverlay();
    renderRoleScreen();
    return;
  }
  renderHomeScreen();
  dismissAuthOverlay();
}

document.addEventListener('DOMContentLoaded', () => {
  loadAuthStore();
  if (authStore.currentUserId) bootApp();
  else { showAuthOverlay(); renderWelcomeScreen(); }

  // Auto-fullscreen on first user interaction (browsers require a user gesture)
  const autoFS = () => {
    tryRequestFullscreen();
    document.removeEventListener('click', autoFS);
    document.removeEventListener('touchstart', autoFS);
  };
  document.addEventListener('click', autoFS, { once: true });
  document.addEventListener('touchstart', autoFS, { once: true });
});

// ===================== GLOBAL JOURNAL STORE (LocalStorage) =====================

let store = { apiKey: ['AIzaSy', 'BKo7Mu', '22hqa5tI', '8lV2Y-eSp', 'q1pwrnWsGA'].join(''), entries: [] };
let activeEntryId = null;
let activePageIndex = 0;
let homeSelectedDate = new Date().toDateString();
let isEditing = false;
const DEFAULT_COVER = 'https://i.pinimg.com/1200x/4b/61/93/4b6193893b5e78852385512422b9fa9e.jpg';

function initStore() {
  const saved = localStorage.getItem('journal_store');
  const hardcodedKey = ['AIzaSy', 'BKo7Mu', '22hqa5tI', '8lV2Y-eSp', 'q1pwrnWsGA'].join('');

  const defaultExploreImgs = [
    { src: 'https://i.pinimg.com/1200x/4b/61/93/4b6193893b5e78852385512422b9fa9e.jpg', tags: ['happy', 'freedom', 'nature', 'joy', 'smile', 'bright'] },
    { src: 'https://i.pinimg.com/1200x/74/a7/91/74a791a1e32c9d381e6bcad683d2a7ba.jpg', tags: ['calm', 'drive', 'sunset', 'roadtrip', 'peace', 'warm'] },
    { src: 'https://i.pinimg.com/1200x/70/29/11/7029115ab573baf10929a5ef2105f81c.jpg', tags: ['calm', 'coffee', 'matcha', 'morning', 'cafe', 'chill', 'drink'] },
    { src: 'https://i.pinimg.com/1200x/b2/95/29/b2952920b7923033c314f804318075f7.jpg', tags: ['happy', 'beach', 'sunset', 'ocean', 'peace', 'water', 'vacation'] },
    { src: 'https://i.pinimg.com/736x/4c/b4/b4/4cb4b4af788147056a9e506280818e3b.jpg', tags: ['calm', 'dreamy', 'clouds', 'pink', 'aesthetic', 'sky'] },
    { src: 'https://i.pinimg.com/736x/93/63/44/936344a9551968ecbde37266d01f3e21.jpg', tags: ['sad', 'lonely', 'night', 'city', 'lights', 'moody', 'dark', 'anxious'] },
    { src: 'https://i.pinimg.com/1200x/39/2e/f9/392ef906f1722f71c103b17f19697b73.jpg', tags: ['calm', 'cozy', 'book', 'read', 'indoor', 'home', 'peace'] },
    { src: 'https://i.pinimg.com/1200x/50/6c/c3/506cc38eaed3badcfc34f2e864b45484.jpg', tags: ['happy', 'flowers', 'spring', 'cute', 'bright', 'love', 'nature'] }
  ];

  if (saved) {
    try {
      store = JSON.parse(saved);
      if (!store.entries || !Array.isArray(store.entries)) store.entries = [];
      
      // Migrate flat entries to multi-page format dynamically
      store.entries.forEach(book => {
        if (!book.pages) {
          book.pages = [{
            id: book.id + '_p1',
            date: book.date,
            content: book.content || ''
          }];
          delete book.content;
        }
      });
      
      if (!store.exploreImages || !Array.isArray(store.exploreImages) || store.exploreImages.length === 0) store.exploreImages = defaultExploreImgs;
      store.apiKey = hardcodedKey;
    } catch (e) { console.error('Error parsing store', e); }
  } else {
    store.apiKey = hardcodedKey;
    store.entries = [];
    store.exploreImages = defaultExploreImgs;
      const welcome = {
      id: Date.now().toString(),
      title: "Morning Reflection",
      date: new Date().toISOString(),
      emotion: "Happy",
      tags: ["Personal", "Calm"],
      coverImage: DEFAULT_COVER,
      pages: [{
        id: Date.now().toString() + '_p1',
        date: new Date().toISOString(),
        content: "<p>I woke up to the soft light filtering through my window, and for the first time in a while, I didn't rush to check my phone.</p><p><br></p><p>The warmth of my morning tea feeling <strong>deeply grounding</strong>. A moment of pure <em>gratitude</em>.</p>"
      }]
    };
    store.entries.push(welcome);
    saveStore();
  }
}

function saveStore() {
  localStorage.setItem('journal_store', JSON.stringify(store));
  localStorage.setItem('gemini_api_key', store.apiKey || '');
}

// Firestore CRUD helpers
async function addEntry(entry) {
  const col = getEntriesCollection();
  if (!col) return entry;
  const { id, ...data } = entry;
  const docRef = await col.add(data);
  entry.id = docRef.id;
  store.entries.unshift(entry);
  return entry;
}

async function updateEntry(entryId, updates) {
  const col = getEntriesCollection();
  if (!col) return;
  await col.doc(entryId).update(updates);
  const idx = store.entries.findIndex(e => e.id === entryId);
  if (idx !== -1) store.entries[idx] = { ...store.entries[idx], ...updates };
}

async function deleteEntry(entryId) {
  const col = getEntriesCollection();
  if (!col) return;
  await col.doc(entryId).delete();
  store.entries = store.entries.filter(e => e.id !== entryId);
}



// --- NAVIGATION ---
let previousScreen = 'screen-home';

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      if (targetId) switchScreen(targetId);
    });
  });
}

window.switchScreen = function (screenId) {
  const currentActive = document.querySelector('.screen-view.active');
  if (currentActive && currentActive.id !== screenId && currentActive.id !== 'screen-create' && currentActive.id !== 'screen-detail') {
    previousScreen = currentActive.id || 'screen-home';
  }

  document.querySelectorAll('.screen-view').forEach(screen => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  const bottomNav = document.getElementById('bottom-nav');
  const detailOverlay = document.getElementById('detail-overlay');
  
  if (screenId === 'screen-detail') {
    if (bottomNav) { bottomNav.classList.add('hidden'); bottomNav.classList.remove('flex'); }
  } else {
    // Clean up detail overlay when leaving
    if (detailOverlay) detailOverlay.remove();
    if (bottomNav) { bottomNav.classList.remove('hidden'); bottomNav.classList.add('flex'); }
  }

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
    
    document.getElementById('screens-container').scrollTop = 0;
    
    // Sync Navigation Bar UI
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => {
      n.classList.remove('text-brand-dark');
      n.classList.add('text-brand-lightText', 'grayscale', 'opacity-60');
      if (n.getAttribute('data-target') === screenId) {
        n.classList.remove('text-brand-lightText', 'grayscale', 'opacity-60');
        n.classList.add('text-brand-dark');
      }
    });

    if (screenId === 'screen-home') renderHomeScreen();
    if (screenId === 'screen-detail') renderDetailScreen();
    if (screenId === 'screen-create') renderCreateScreen();
    if (screenId === 'screen-stats') renderStatsScreen();
    if (screenId === 'screen-profile') renderProfileScreen();
    if (screenId === 'screen-explore') renderExploreScreen();
  }
}

// =================== RICH TEXT EDITOR ===================

// Stores the saved selection range for AI replacement
let _savedRange = null;
let _activeRteId = null;

function buildToolbar(targetId) {
  return `
    <div class="rte-toolbar mb-3" id="toolbar-${targetId}">
      <!-- Text Style -->
      <select onchange="execFormatBlock(this.value, '${targetId}')" id="format-select-${targetId}" title="Text Style"
        class="rte-btn text-xs px-2 w-auto font-semibold cursor-pointer bg-transparent border-none outline-none text-brand-text" style="width:80px;">
        <option value="p">Body</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div class="divider"></div>

      <!-- Formatting -->
      <button type="button" class="rte-btn" onclick="execCmd('bold')" title="Bold"><strong>B</strong></button>
      <button type="button" class="rte-btn" onclick="execCmd('italic')" title="Italic"><em>I</em></button>
      <button type="button" class="rte-btn" onclick="execCmd('underline')" title="Underline"><u>U</u></button>

      <div class="divider"></div>

      <!-- Lists -->
      <button type="button" class="rte-btn" onclick="execCmd('insertUnorderedList')" title="Bullet List"><i class="ri-list-unordered"></i></button>
      <button type="button" class="rte-btn" onclick="execCmd('insertOrderedList')" title="Numbered List"><i class="ri-list-ordered"></i></button>

      <div class="divider"></div>

      <!-- Alignment -->
      <button type="button" class="rte-btn" onclick="execCmd('justifyLeft')" title="Align Left"><i class="ri-align-left"></i></button>
      <button type="button" class="rte-btn" onclick="execCmd('justifyCenter')" title="Align Center"><i class="ri-align-center"></i></button>
      <button type="button" class="rte-btn" onclick="execCmd('justifyRight')" title="Align Right"><i class="ri-align-right"></i></button>

      <div class="divider"></div>

      <!-- Strikethrough -->
      <button type="button" class="rte-btn" onclick="execCmd('strikeThrough')" title="Strikethrough"><s>S</s></button>

      <div class="divider"></div>

      <!-- Ask AI button -->
      <button type="button" class="rte-btn" onclick="openAskAiForCursor('${targetId}')" title="Ask AI"
        style="background:linear-gradient(135deg,#7C3AED,#a855f7); color:white; width:auto; padding:0 12px; border-radius:10px; font-size:12px; gap:4px;">
        <i class="ri-sparkling-fill"></i> Ask AI
      </button>
    </div>

    <div
      id="${targetId}"
      class="rte-content bg-brand-gray/30 rounded-2xl p-5 min-h-[220px]"
      data-placeholder="Start writing how you feel..."
      contenteditable="true"
    ></div>
  `;
}

window.execCmd = function (cmd) {
  document.execCommand(cmd, false, null);
}

window.execFormatBlock = function (value, targetId) {
  document.execCommand('formatBlock', false, value);
  document.getElementById(targetId)?.focus();
}

// ---- AI SELECTION POPUP ----

const popup = () => document.getElementById('ai-selection-popup');

function saveSelectionRange() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    _savedRange = sel.getRangeAt(0).cloneRange();
    return true;
  }
  return false;
}

function restoreSelectionRange() {
  if (!_savedRange) return false;
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(_savedRange);
  return true;
}

function getSelectedPlainText() {
  const sel = window.getSelection();
  return sel ? sel.toString().trim() : '';
}

function showAiSelectionPopup(x, y) {
  const p = popup();
  p.style.display = 'flex';
  // Position above the selection
  requestAnimationFrame(() => {
    const pw = p.offsetWidth;
    const ph = p.offsetHeight;
    const vw = window.innerWidth;
    let left = x - pw / 2;
    if (left < 8) left = 8;
    if (left + pw > vw - 8) left = vw - pw - 8;
    p.style.left = left + 'px';
    p.style.top = (y - ph - 10) + 'px';
  });
}

function hideAiSelectionPopup() {
  popup().style.display = 'none';
}

// Attach selection events to RTE divs (called after rendering)
function attachRteSelectionListeners(rteId) {
  const el = document.getElementById(rteId);
  if (!el) return;
  _activeRteId = rteId;

  const handleSelection = (e) => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        hideAiSelectionPopup();
        return;
      }
      // Make sure the selection is inside the rte
      if (!el.contains(sel.anchorNode)) return;
      saveSelectionRange();
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showAiSelectionPopup(rect.left + rect.width / 2, rect.top);
    }, 50);
  };

  el.addEventListener('mouseup', handleSelection);
  el.addEventListener('touchend', handleSelection);
}

// Hide popup when clicking outside
document.addEventListener('mousedown', (e) => {
  if (!popup().contains(e.target)) {
    hideAiSelectionPopup();
  }
}, true);

// ---- AI REWRITE SELECTED TEXT ----

window.aiRewriteSelection = async function (mode) {
  const selectedText = getSelectedPlainText();
  if (!selectedText) { hideAiSelectionPopup(); return; }

  hideAiSelectionPopup();

  const prompts = {
    improve: `Improve the writing quality of the following text while keeping the same core meaning and first-person perspective. Return only the rewritten text, nothing else:\n\n"${selectedText}"`,
    shorter: `Make this shorter and more concise while keeping the key ideas. Return only the rewritten text:\n\n"${selectedText}"`,
    emotional: `Rewrite this to sound more emotionally expressive and heartfelt, as if writing in a personal diary. Return only the rewritten text:\n\n"${selectedText}"`
  };

  const prompt = prompts[mode] || prompts.improve;

  // Show inline loading indicator

  try {
    const result = await callActualGemini(prompt);
    replaceSelectionWithAiText(result.trim());
  } catch (err) {
    showAlert('AI Error: ' + (err.message || 'Failed to reach Gemini.'));
  }
}

function replaceSelectionWithAiText(newText) {
  if (!restoreSelectionRange()) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = _savedRange;
  range.deleteContents();

  // Insert the new text as a span with highlight animation
  const span = document.createElement('span');
  span.className = 'ai-replaced';
  span.innerHTML = parseMarkdownToHtml(newText);
  range.insertNode(span);

  // Move caret to end of inserted node
  const newRange = document.createRange();
  newRange.setStartAfter(span);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  _savedRange = null;
}

// ---- ASK AI MODAL (for custom prompts & cursor insertion) ----

let _askAiMode = 'insert'; // 'insert' | 'replace'

window.aiRewriteCustom = function () {
  const selectedText = getSelectedPlainText();
  if (!selectedText) return;
  _askAiMode = 'replace';
  document.getElementById('ask-ai-context-label').textContent = `Selected: "${selectedText.substring(0, 60)}${selectedText.length > 60 ? '…' : ''}"`;
  hideAiSelectionPopup();
  openAskAiModal();
}

window.openAskAiForCursor = function (rteId) {
  _activeRteId = rteId;
  _askAiMode = 'insert';
  // Save cursor position
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) _savedRange = sel.getRangeAt(0).cloneRange();
  document.getElementById('ask-ai-context-label').textContent = 'AI will insert text at your cursor position.';
  openAskAiModal();
}

function openAskAiModal() {
  document.getElementById('ask-ai-input').value = '';
  document.getElementById('ask-ai-loading').classList.add('hidden');
  const modal = document.getElementById('ask-ai-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => document.getElementById('ask-ai-input').focus(), 100);
}

window.closeAskAiModal = function () {
  const modal = document.getElementById('ask-ai-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.askAiQuickAction = async function (instruction) {
  const selectedText = _askAiMode === 'replace' ? getSelectedPlainText() : null;
  const prompt = selectedText
    ? `${instruction}. Return only the result, no explanation:\n\n"${selectedText}"`
    : `${instruction}. Write a 2-3 sentence response in a personal journal writing style. Return only the text, nothing else.`;
  await runAskAi(prompt);
}

window.askAiCustomSubmit = async function () {
  const input = document.getElementById('ask-ai-input')?.value.trim();
  if (!input) return;
  const selectedText = _askAiMode === 'replace' ? getSelectedPlainText() : null;
  const prompt = selectedText
    ? `${input}. Apply this to the following text and return only the result:\n\n"${selectedText}"`
    : `${input}. Write a response in a personal journal writing style. Return only the text, nothing else.`;
  await runAskAi(prompt);
}

async function runAskAi(prompt) {
  const loading = document.getElementById('ask-ai-loading');
  loading.classList.remove('hidden');

  try {
    const result = await callActualGemini(prompt);
    loading.classList.add('hidden');
    closeAskAiModal();

    if (_askAiMode === 'replace') {
      restoreSelectionRange();
      replaceSelectionWithAiText(result.trim());
    } else {
      insertTextAtCursor(result.trim());
    }
  } catch (err) {
    loading.classList.add('hidden');
    showAlert('AI Error: ' + (err.message || 'Failed to reach Gemini.'));
  }
}

function insertTextAtCursor(text) {
  const rte = document.getElementById(_activeRteId);
  if (!rte) return;
  rte.focus();

  if (_savedRange) {
    restoreSelectionRange();
    const span = document.createElement('span');
    span.className = 'ai-replaced';
    span.innerHTML = parseMarkdownToHtml(text);
    _savedRange.insertNode(span);
    const newRange = document.createRange();
    newRange.setStartAfter(span);
    newRange.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(newRange);
    _savedRange = null;
  } else {
    document.execCommand('insertHTML', false, parseMarkdownToHtml(text));
  }
}



// =================== HOME SCREEN ===================

window.setHomeDate = function (dateStr) {
  homeSelectedDate = dateStr;
  renderHomeScreen();
}

function renderHomeScreen() {
  const container = document.getElementById('screen-home');
  const sortedEntries = [...store.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 1. Featured Latest Entries (Top 3)
  const latestEntries = sortedEntries.slice(0, 3);
  let mainCardsHtml = '';

  if (latestEntries.length > 0) {
    mainCardsHtml = latestEntries.map(entry => `
      <div class="relative min-w-[220px] w-[220px] h-[310px] snap-center cursor-pointer group shrink-0 mb-4 mt-2" onclick="openBookOptions('${entry.id}')">
        <div class="absolute top-6 bottom-4 -right-4 w-10 bg-black/15 rounded-r-3xl blur-lg group-hover:-right-6 transition-all duration-500"></div>
        <div class="relative w-full h-full rounded-r-2xl rounded-l-[4px] overflow-hidden shadow-[2px_0_15px_rgba(0,0,0,0.05),inset_2px_0_6px_rgba(255,255,255,0.4)] group-hover:-translate-y-3 group-hover:shadow-[10px_10px_30px_rgba(0,0,0,0.15)] transition-all duration-500 bg-brand-gray">
          <div class="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/50 via-black/10 to-transparent z-20 mix-blend-multiply"></div>
          <div class="absolute top-0 bottom-0 left-[14px] w-[1px] bg-white/40 z-20"></div>
          <div class="absolute top-0 bottom-0 left-[16px] w-[1px] bg-black/10 z-20"></div>
          <img src="${entry.coverImage || DEFAULT_COVER}" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none z-10 transition-all duration-500 group-hover:to-black/100"></div>
          <div class="absolute inset-0 z-20 p-5 pt-6 flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <span class="inline-flex items-center px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-sm text-[9px] text-white font-bold tracking-widest uppercase border border-white/20 shadow-sm">${entry.emotion || 'Journal'}</span>
            </div>
            <div class="mt-auto">
              <h3 class="font-serif font-bold text-2xl leading-tight mb-1 text-white drop-shadow-xl" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 2px 5px rgba(0,0,0,0.8);">${entry.title}</h3>
              <p class="text-[11px] text-white/80 font-bold tracking-widest font-sans uppercase">${new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    mainCardsHtml = `
      <div class="relative min-w-[220px] w-[220px] h-[310px] snap-center cursor-pointer group shrink-0 mb-4 mt-2" onclick="switchScreen('screen-create')">
        <div class="absolute top-6 bottom-4 -right-4 w-10 bg-black/10 rounded-r-3xl blur-lg group-hover:-right-6 transition-all duration-500"></div>
        <div class="relative w-full h-full rounded-r-2xl rounded-l-[4px] overflow-hidden shadow-[2px_0_15px_rgba(0,0,0,0.02),inset_2px_0_6px_rgba(255,255,255,0.6)] group-hover:-translate-y-3 group-hover:shadow-[10px_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 bg-[#FACC50]">
          <div class="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/20 via-black/5 to-transparent z-20 mix-blend-multiply"></div>
          <div class="absolute top-0 bottom-0 left-[14px] w-[1px] bg-white/60 z-20"></div>
          <div class="absolute inset-0 z-20 p-6 flex flex-col items-center justify-center text-center">
            <div class="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md mb-6 flex items-center justify-center shadow-sm">
              <i class="ri-add-line text-brand-dark text-3xl"></i>
            </div>
            <h3 class="font-serif font-bold text-2xl leading-tight mb-2 text-brand-dark shadow-sm">Write today</h3>
            <p class="text-[10px] text-brand-dark/70 font-bold tracking-widest font-sans uppercase">Tap to start</p>
          </div>
        </div>
      </div>`;
  }

  // 2. Genre Shelves Construction
  const genreMap = {};
  sortedEntries.forEach(entry => {
    const genre = entry.emotion || 'Collection';
    if (!genreMap[genre]) genreMap[genre] = [];
    genreMap[genre].push(entry);
  });

  let shelvesHtml = '';
  if (Object.keys(genreMap).length > 0) {
    for (const [genre, entries] of Object.entries(genreMap)) {
      const booksHtml = entries.map(q => `
        <div onclick="openBookOptions('${q.id}')" class="relative min-w-[130px] w-[130px] h-[180px] snap-start cursor-pointer group mb-4 mt-2">
          <div class="absolute top-4 bottom-2 -right-3 w-6 bg-black/15 rounded-r-2xl blur-md group-hover:-right-4 transition-all duration-300"></div>
          <div class="relative w-full h-full rounded-r-xl rounded-l-[3px] overflow-hidden shadow-[2px_0_10px_rgba(0,0,0,0.05),inset_2px_0_4px_rgba(255,255,255,0.4)] group-hover:-translate-y-2 group-hover:shadow-[7px_7px_20px_rgba(0,0,0,0.15)] transition-all duration-300 bg-brand-gray">
            <div class="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-20 mix-blend-multiply"></div>
            <div class="absolute top-0 bottom-0 left-[9px] w-[1px] bg-white/40 z-20"></div>
            <div class="absolute top-0 bottom-0 left-[10px] w-[1px] bg-black/10 z-20"></div>
            <img src="${q.coverImage || DEFAULT_COVER}" class="absolute inset-0 w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none z-10"></div>
            <div class="absolute inset-0 z-20 p-3 pt-4 flex flex-col justify-between">
              <div class="flex justify-end">
                <span class="inline-flex items-center px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-[4px] text-[8px] text-white font-bold tracking-wider uppercase border border-white/20 shadow-sm">${genre}</span>
              </div>
              <div class="mt-auto">
                <h3 class="font-serif font-bold text-sm leading-[1.1] mb-1 text-white drop-shadow-md" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">${q.title}</h3>
                <p class="text-[9px] text-white/80 font-medium tracking-widest font-sans uppercase">${new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      `).join('');

      shelvesHtml += `
        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-bold text-brand-dark capitalize">${genre} Collection</h2>
            <span class="text-xs font-semibold text-brand-lightText lowercase">${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} <i class="ri-arrow-right-s-line align-middle"></i></span>
          </div>
          <div class="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x pb-2">
            ${booksHtml}
          </div>
        </div>
      `;
    }
  } else {
    shelvesHtml = `<div class="w-full text-center py-10 px-6 text-brand-lightText text-sm"><i class="ri-book-open-line text-4xl mb-3 block opacity-30"></i>Your collection is currently empty.<br/><br/><button onclick="switchScreen('screen-create')" class="text-brand-orange font-bold">Write your first journal</button></div>`;
  }

  const user = getCurrentUser();
  const rawName = user && user.name ? user.name : 'Friend';
  const firstName = rawName.split(' ')[0];
  const avatarHtml = user ? getAvatarHtml(user, 48) : '';

  container.innerHTML = `
    <div class="sticky -top-4 sm:-top-6 z-40 bg-brand-gray/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-8 sm:pt-10 pb-4 mb-2 shadow-[0_10px_30px_rgba(245,245,247,0.8)]">
      <header class="flex justify-between items-center">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight transform origin-left transition-all">My Journals</h1>
        <button onclick="switchScreen('screen-profile')" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-brand-yellow flex-shrink-0 transition-transform hover:scale-105">
          ${avatarHtml}
        </button>
      </header>
    </div>
    
    <div class="mb-6">
      <div class="flex justify-between items-center mb-1">
        <h2 class="text-xl font-bold">Latest Writings</h2>
      </div>
      <div class="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x pb-4">
        ${mainCardsHtml}
      </div>
    </div>
    
    <div class="mb-4">
      ${shelvesHtml}
    </div>`;
}

// =================== DETAIL & EDIT & BOOK OVERLAY ===================

window.openBookOptions = function(id) {
  activeEntryId = id;
  const entry = store.entries.find(e => e.id === id);
  if (!entry) return;

  document.getElementById('action-book-cover').src = entry.coverImage || DEFAULT_COVER;
  document.getElementById('action-book-emotion').innerText = entry.emotion || 'Journal';
  document.getElementById('action-book-title').innerText = entry.title;
  document.getElementById('action-book-date').innerText = new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  const modal = document.getElementById('book-actions-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

window.closeBookOptions = function() {
  const modal = document.getElementById('book-actions-modal');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
}

window.tryRequestFullscreen = function() {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) { el.requestFullscreen(); }
    else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); } // Safari
    else if (el.msRequestFullscreen) { el.msRequestFullscreen(); } // IE11
  } catch(e) {}
}

window.tryExitFullscreen = function() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) { document.exitFullscreen(); }
      else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
      else if (document.msExitFullscreen) { document.msExitFullscreen(); }
    }
  } catch(e) {}
}

window.actionReadBook = function() {
  tryRequestFullscreen();
  closeBookOptions();
  window.viewEntry(activeEntryId);
}

window.actionEditBook = function() {
  tryRequestFullscreen();
  closeBookOptions();
  isEditing = true;
  switchScreen('screen-detail');
}

window.actionDeleteBook = async function() {
  if (await showConfirm("Are you sure you want to completely delete this book? This action cannot be undone.", "Delete Book", true, "Delete")) {
    closeBookOptions();
    await deleteEntry(activeEntryId);
    saveStore(); // Backup to local storage in case backend sync fails
    renderHomeScreen();
  }
}

window.viewEntry = function (id) {
  tryRequestFullscreen();
  activeEntryId = id;
  isEditing = false;
  switchScreen('screen-detail');
}

window.toggleEdit = function () {
  if (isEditing) {
    // Closing edit mode — discard empty pages
    const book = store.entries.find(e => e.id === activeEntryId);
    if (book && activePageIndex >= 0 && activePageIndex < book.pages.length) {
      const page = book.pages[activePageIndex];
      const content = (page.content || '').replace(/<[^>]*>/g, '').trim();
      if (!content) {
        // Remove the empty page
        book.pages.splice(activePageIndex, 1);
        saveStore();
        // Go back to last page (or 0 if none left)
        activePageIndex = Math.max(0, book.pages.length - 1);
      }
    }
  }
  isEditing = !isEditing;
  renderDetailScreen();
}

window.saveEdit = function () {
  const book = store.entries.find(e => e.id === activeEntryId);
  if (!book) return;

  const rte = document.getElementById('edit-rte');
  const newContent = rte ? rte.innerHTML : '';
  
  const titleInput = document.getElementById('edit-title');
  if (titleInput && titleInput.value.trim() !== '') {
    book.title = titleInput.value.trim();
  }

  const emotionSelect = document.getElementById('edit-emotion');
  if (emotionSelect) {
    book.emotion = emotionSelect.value;
  }
  
  if (activePageIndex >= 0 && activePageIndex < book.pages.length) {
    book.pages[activePageIndex].content = newContent;
  }
  
  saveStore();
  isEditing = false;
  renderDetailScreen();
}

window.flipPage = function(direction) {
  const container = document.getElementById('screen-detail');
  const book = store.entries.find(e => e.id === activeEntryId);
  if (!book || !container) return;

  if (direction === 'next' && activePageIndex < book.pages.length - 1) {
    container.classList.add('animate-[fadeOut_0.2s_ease-out_forwards]');
    setTimeout(() => {
      activePageIndex++;
      renderDetailScreen();
      const newContainer = document.getElementById('screen-detail');
      newContainer.classList.remove('animate-[fadeOut_0.2s_ease-out_forwards]');
      newContainer.classList.add('animate-[fadeIn_0.2s_ease-in_forwards]');
    }, 200);
  } else if (direction === 'prev' && activePageIndex > 0) {
    container.classList.add('animate-[fadeOut_0.2s_ease-out_forwards]');
    setTimeout(() => {
      activePageIndex--;
      renderDetailScreen();
      const newContainer = document.getElementById('screen-detail');
      newContainer.classList.remove('animate-[fadeOut_0.2s_ease-out_forwards]');
      newContainer.classList.add('animate-[fadeIn_0.2s_ease-in_forwards]');
    }, 200);
  }
}

window.writeNewPage = function() {
  const book = store.entries.find(e => e.id === activeEntryId);
  if (!book) return;
  book.pages.push({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    content: ''
  });
  activePageIndex = book.pages.length - 1;
  isEditing = true;
  renderDetailScreen();
}

// =================== IMAGE PICKER ===================

let _imgPickerContext = null; // 'detail' or 'create'

window.openImgPicker = function() {
  _imgPickerContext = (document.getElementById('detail-overlay')) ? 'detail' : 'create';
  const modal = document.getElementById('img-picker-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

window.closeImgPicker = function() {
  const modal = document.getElementById('img-picker-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  document.getElementById('img-url-input').value = '';
}

function applyCoverImage(src) {
  if (_imgPickerContext === 'detail') {
    // Apply to current journal book
    const book = store.entries.find(e => e.id === activeEntryId);
    if (book) {
      book.coverImage = src;
      saveStore();
      const coverEl = document.getElementById('detail-cover');
      if (coverEl) coverEl.src = src;
    }
  } else {
    // Apply to create screen
    _createCoverImage = src;
    const coverEl = document.getElementById('create-cover');
    const containerEl = document.getElementById('create-cover-container');
    const btnAddEl = document.getElementById('create-cover-btn');
    if (coverEl && containerEl) {
      coverEl.src = src;
      containerEl.classList.remove('hidden');
      if (btnAddEl) btnAddEl.classList.add('hidden');
    }
  }
  closeImgPicker();
}

window.applyPresetImage = function(src) {
  applyCoverImage(src);
}

window.applyCustomImageUrl = function() {
  const url = document.getElementById('img-url-input').value.trim();
  if (!url) { showAlert('Please enter a valid image URL.'); return; }
  applyCoverImage(url);
}

window.handleCoverFileUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showAlert('Image too large. Please pick one under 2 MB.'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    applyCoverImage(e.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // reset so same file can be re-selected
}

window.toggleActionMenu = function() {
  const menu = document.getElementById('detail-action-menu');
  if (menu) {
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      menu.classList.add('flex');
    } else {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
    }
  }
}

function renderDetailScreen() {
  const book = store.entries.find(e => e.id === activeEntryId);
  
  // Get or create the overlay (direct child of app-wrapper for reliable sizing)
  let overlay = document.getElementById('detail-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'detail-overlay';
    document.getElementById('app-wrapper').appendChild(overlay);
  }
  overlay.style.cssText = 'position:absolute;inset:0;z-index:60;display:flex;flex-direction:column;background:#fff;';
  
  if (!book) {
    overlay.innerHTML = '<div class="p-6 pt-20 text-center"><p>Book not found.</p><button onclick="tryExitFullscreen(); switchScreen(\'screen-home\')" class="mt-4 text-brand-orange font-bold">Go Back</button></div>';
    return;
  }

  // Ensure activePageIndex is valid
  if (activePageIndex < 0) activePageIndex = 0;
  if (!book.pages) {
    book.pages = [{ id: Date.now().toString(), date: book.date, content: '' }];
  }
  if (book.pages.length === 0) {
    book.pages.push({ id: Date.now().toString(), date: new Date().toISOString(), content: '' });
  }
  if (activePageIndex >= book.pages.length) activePageIndex = book.pages.length - 1;
  
  const page = book.pages[activePageIndex];
  const d = new Date(page.date);
  const totalPages = book.pages.length;

  if (isEditing) {
    overlay.innerHTML = `
      <!-- SCROLLABLE MIDDLE -->
      <div style="flex:1;overflow-y:auto;" class="w-full">
        <div class="w-full max-w-2xl mx-auto">
          
          <!-- Cover Image with floating Close + Save -->
          <div class="w-full h-[180px] sm:h-[220px] relative group cursor-pointer" onclick="openImgPicker()">
            <img id="detail-cover" src="${book.coverImage || DEFAULT_COVER}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm">
              <i class="ri-image-edit-fill text-3xl mb-1"></i>
              <span class="text-sm font-bold tracking-wider">CHANGE COVER</span>
            </div>
            <!-- Floating Close + Save over cover -->
            <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
              <button onclick="event.stopPropagation(); toggleEdit()" class="w-10 h-10 rounded-full bg-[#113a4d] text-white flex items-center justify-center hover:bg-[#0a2533] transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                <i class="ri-close-line text-[26px]"></i>
              </button>
              <button onclick="event.stopPropagation(); saveEdit()" class="px-6 h-10 bg-[#ffb833] text-[#131313] rounded-full font-extrabold text-[15px] tracking-wide shadow-[0_4px_15px_rgba(255,184,51,0.4)] hover:scale-105 transition-transform flex items-center gap-1.5">
                <i class="ri-check-line text-[22px] font-bold"></i> Save
              </button>
            </div>
          </div>

          <div class="px-5 sm:px-6 pt-6 pb-8 flex flex-col w-full">
            <div class="text-left mb-3">
              <p class="text-brand-orange font-medium text-sm tracking-wide">${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>

            <input type="text" id="edit-title" value="${book.title}" placeholder="Book Title" class="w-full text-left text-[22px] sm:text-[28px] font-extrabold text-brand-dark mb-4 leading-tight tracking-tight outline-none border-b border-dashed border-gray-200 pb-2 bg-transparent">
            
            <div class="flex justify-start mb-6">
              <select id="edit-emotion" class="bg-brand-orange/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-brand-orange outline-none shadow-sm cursor-pointer border border-transparent focus:border-brand-yellow transition-colors">
                <option value="Happy" ${book.emotion === 'Happy' ? 'selected' : ''}>Happy</option>
                <option value="Calm" ${book.emotion === 'Calm' ? 'selected' : ''}>Calm</option>
                <option value="Anxious" ${book.emotion === 'Anxious' ? 'selected' : ''}>Anxious</option>
                <option value="Sad" ${book.emotion === 'Sad' ? 'selected' : ''}>Sad</option>
              </select>
            </div>

            <div class="w-full bg-gray-50 rounded-xl p-2 border border-gray-100 shadow-sm text-left mb-6">
              ${buildToolbar('edit-rte')}
            </div>

            <div class="w-full">
              <div id="edit-rte" class="prose prose-sm font-sans text-brand-text leading-[2] text-[15px] sm:text-[17px] w-full outline-none min-h-[300px]"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    const rte = document.getElementById('edit-rte');
    if (rte) rte.innerHTML = page.content || '';
    attachRteSelectionListeners('edit-rte');
    return;
  }

  // View mode
  overlay.innerHTML = `
    <!-- FIXED TOP: Back + 3-Dots (floating over content) -->
    <div style="position:absolute;top:0;left:0;right:0;z-index:50;pointer-events:none;" class="flex justify-between items-center px-5 py-4">
      <button onclick="tryExitFullscreen(); switchScreen('screen-home')" class="pointer-events-auto w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.15)] ring-1 ring-white/10">
        <i class="ri-arrow-left-s-line text-[28px]"></i>
      </button>
      
      <div class="relative pointer-events-auto">
        <button onclick="toggleActionMenu()" class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.15)] ring-1 ring-white/10">
          <i class="ri-more-2-fill text-[22px]"></i>
        </button>
        
        <!-- 3-Dot Dropdown Menu -->
        <div id="detail-action-menu" class="absolute right-0 top-12 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 p-2 w-48 hidden flex-col gap-1 origin-top-right animate-[fadeIn_0.2s_ease-out]">
          <button onclick="toggleEdit()" class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left text-sm font-bold text-brand-dark transition-colors">
            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-dark"><i class="ri-pencil-fill"></i></div> Edit Page
          </button>
          <button onclick="enhanceEntryWithGemini('${book.id}')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 text-left text-sm font-bold text-purple-600 transition-colors">
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><i class="ri-sparkling-fill"></i></div> Ask AI
          </button>
          <div class="border-t border-gray-100 my-1 mx-2"></div>
          <button onclick="deletePage()" class="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-left text-sm font-bold text-red-500 transition-colors">
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><i class="ri-delete-bin-fill"></i></div> Delete Page
          </button>
        </div>
      </div>
    </div>

    <!-- SCROLLABLE CONTENT -->
    <div style="flex:1;overflow-y:auto;padding-bottom:52px;" class="w-full">
      <div class="w-full max-w-2xl mx-auto">
        
        <!-- Cover Image -->
        <div class="w-full h-[180px] sm:h-[220px] relative">
          <img src="${book.coverImage || DEFAULT_COVER}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none"></div>
        </div>

        <div class="px-5 sm:px-6 pt-6 pb-6 flex flex-col w-full">
          <div class="text-left mb-5">
            <p class="text-brand-orange font-bold text-sm mb-2 tracking-wide">${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <h1 class="text-[22px] sm:text-[28px] font-extrabold text-brand-dark mb-3 leading-tight tracking-tight">${book.title}</h1>
            <div class="flex justify-start">
              <span class="px-4 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-[11px] font-bold uppercase tracking-wider">${book.emotion}</span>
            </div>
          </div>

          <div class="prose prose-sm font-sans text-brand-text leading-[2] text-[15px] sm:text-[17px] w-full max-w-none">
            ${page.content || '<p class="italic opacity-50 text-left">No entry written for this page.</p>'}
          </div>
        </div>
      </div>
    </div>

    <!-- FIXED BOTTOM: Pagination -->
    <div style="flex-shrink:0;" class="w-full bg-white border-t border-gray-100 px-5 py-3 z-50">
      <div class="flex justify-between items-center w-full max-w-2xl mx-auto">
        <button onclick="flipPage('prev')" class="font-bold text-gray-400 hover:text-brand-dark transition-colors px-2 py-2 uppercase tracking-widest text-[11px] flex items-center gap-1 group/btn ${activePageIndex === 0 ? 'invisible pointer-events-none' : ''}">
          <i class="ri-arrow-left-s-line text-lg group-hover/btn:-translate-x-1 transition-transform"></i> Prev
        </button>
        
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">Page ${activePageIndex + 1} of ${totalPages}</span>
        
        ${activePageIndex === totalPages - 1 
          ? '<button onclick="writeNewPage()" class="font-bold text-brand-orange hover:text-orange-600 transition-colors px-2 py-2 flex items-center gap-1 uppercase tracking-widest text-[11px] group/btn">Write <i class="ri-add-line text-lg group-hover/btn:rotate-90 transition-transform"></i></button>'
          : `<button onclick="flipPage('next')" class="font-bold text-gray-400 hover:text-brand-dark transition-colors px-2 py-2 flex items-center gap-1 uppercase tracking-widest text-[11px] group/btn">Next <i class="ri-arrow-right-s-line text-lg group-hover/btn:translate-x-1 transition-transform"></i></button>`
        }
      </div>
    </div>
  `;
}


window.deleteEntry = async function (id) {
  if (await showConfirm("Are you sure you want to delete this journal entry?", "Delete Book", true, "Delete")) {
    store.entries = store.entries.filter(e => e.id !== id);
    if (activeEntryId === id) activeEntryId = null;
    saveStore();
    switchScreen('screen-home');
  }
}

window.deletePage = async function() {
  const book = store.entries.find(e => e.id === activeEntryId);
  if (!book || !book.pages) return;
  
  if (book.pages.length <= 1) {
    showAlert("Can't delete the last page. Delete the book from the home screen instead.");
    return;
  }
  
  if (await showConfirm(`Delete page ${activePageIndex + 1}? This cannot be undone.`, "Delete Page", true, "Delete")) {
    book.pages.splice(activePageIndex, 1);
    activePageIndex = Math.max(0, activePageIndex - 1);
    saveStore();
    toggleActionMenu(); // close menu
    renderDetailScreen();
  }
}

// =================== CREATE SCREEN ===================

let _createCoverImage = null;

function renderCreateScreen() {
  _createCoverImage = null; // reset on load
  const container = document.getElementById('screen-create');
  container.innerHTML = `
    <div class="flex justify-between items-center mb-5 pt-2">
      <button onclick="switchScreen('screen-home')" class="w-10 h-10 bg-brand-gray rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
        <i class="ri-close-line text-2xl"></i>
      </button>
      <h2 class="font-bold text-lg">New Journal</h2>
      <button onclick="saveNewEntry()" class="px-4 h-10 bg-brand-yellow text-white rounded-full flex items-center gap-1 justify-center shadow-md font-bold text-sm hover:scale-105 transition-transform">
        <i class="ri-check-line"></i> Save
      </button>
    </div>

    <input type="text" id="create-title" placeholder="Title your reflection..." class="w-full text-2xl font-bold bg-transparent outline-none mb-4 text-brand-dark placeholder:text-gray-300 border-b border-gray-100 pb-3">
    
    <div class="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
      <select id="create-emotion" class="bg-brand-gray px-3 py-2 rounded-xl text-sm font-bold text-brand-orange outline-none shadow-sm cursor-pointer border border-transparent focus:border-brand-yellow transition-colors">
        <option value="Happy">😊 Happy</option>
        <option value="Calm">😌 Calm</option>
        <option value="Anxious">😰 Anxious</option>
        <option value="Sad">😔 Sad</option>
      </select>
      <input type="text" id="create-tags" placeholder="Tags (e.g. Work, Family)" class="flex-1 bg-brand-gray px-3 py-2 rounded-xl text-sm outline-none border border-transparent focus:border-brand-yellow transition-colors">
    </div>

    <button id="create-cover-btn" onclick="openImgPicker()" class="w-full py-3 bg-brand-gray text-brand-dark rounded-xl mb-5 font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition border border-dashed border-gray-300">
      <i class="ri-image-add-line text-lg"></i> Add Cover Image
    </button>
    <div id="create-cover-container" class="editable-cover w-full h-48 rounded-3xl overflow-hidden mb-5 shadow-md hidden" onclick="openImgPicker()">
      <img id="create-cover" src="" class="w-full h-full object-cover">
      <div class="editable-cover-overlay absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity">
        <i class="ri-camera-switch-line text-white text-3xl"></i>
      </div>
    </div>

    ${buildToolbar('create-rte')}

    <button onclick="openAiModal('generate_prompt')" class="mt-4 w-full py-3 bg-purple-50 text-purple-700 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm border border-purple-200 hover:bg-purple-100 transition-colors mb-10">
      <i class="ri-sparkling-fill"></i> AI Writer's Block Help
    </button>
  `;
  // Wire up AI selection popup after create-rte is in DOM
  requestAnimationFrame(() => attachRteSelectionListeners('create-rte'));
}

window.saveNewEntry = function () {
  const title = document.getElementById('create-title')?.value.trim();
  const emotionRaw = document.getElementById('create-emotion')?.value || 'Happy';
  const tagsRaw = document.getElementById('create-tags')?.value || '';
  const rte = document.getElementById('create-rte');
  const content = rte ? rte.innerHTML : '';
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  if (!title || !plainText) { showAlert("Please provide both a title and some content."); return; }

  const emotion = emotionRaw.replace(/[^\w]/g, '').replace(/\d/g, '').trim();
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);

  store.entries.push({
    id: Date.now().toString(),
    title,
    emotion: emotion || 'Happy',
    tags,
    date: new Date().toISOString(),
    coverImage: _createCoverImage || DEFAULT_COVER,
    pages: [{
      id: Date.now().toString() + '_p1',
      date: new Date().toISOString(),
      content
    }]
  });
  saveStore();
  homeSelectedDate = new Date().toDateString();
  switchScreen('screen-home');
}

// =================== EXPLORE SCREEN ===================

async function fetchQuote() {
  try {
    const res = await fetch('https://dummyjson.com/quotes/random');
    const data = await res.json();
    return { quote: data.quote, author: data.author };
  } catch (e) {
    return { quote: "Peace comes from within. Do not seek it without.", author: "Buddha" };
  }
}

async function renderExploreScreen() {
  const container = document.getElementById('screen-explore');
  container.innerHTML = `<div class="w-full h-[85vh] flex items-center justify-center bg-brand-gray"><i class="ri-loader-4-line text-brand-dark text-4xl animate-spin"></i></div>`;

  const quoteData = await fetchQuote();
  
  let feedImgs = [...store.exploreImages];
  while (feedImgs.length < 12) { feedImgs = [...feedImgs, ...store.exploreImages]; }
  feedImgs.sort(() => Math.random() - 0.5);

  const gridHtml = feedImgs.map((img, i) => {
    const h = Math.floor(140 + Math.random() * 120);
    return `
      <div class="break-inside-avoid shadow-sm rounded-[24px] overflow-hidden relative group cursor-pointer mb-4 hover:shadow-md transition-all hover:-translate-y-1" onclick="openExplorePreview('${img.src}')">
        <img src="${img.src}" class="w-full object-cover bg-gray-200" style="height: ${h}px;" loading="lazy" alt="${img.tags[0]} Pinterest Idea">
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span class="bg-white/95 text-brand-dark px-4 py-2 rounded-full text-xs font-bold shadow-md flex items-center gap-1"><i class="ri-add-line"></i> Journal</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="w-full min-h-full bg-brand-gray pt-10 px-4 sm:px-6 pb-28">
      <div class="flex flex-col mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-3xl font-bold tracking-tight text-brand-dark">Discover Feed</h2>
          <button onclick="openExploreAddModal()" class="w-10 h-10 bg-brand-yellow text-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"><i class="ri-add-line text-xl"></i></button>
        </div>
        
        <div class="flex gap-2 mb-4">
          <input type="text" id="explore-search-input" placeholder="Search ideas (e.g. happy, sad, nature)..." class="flex-1 bg-white px-4 py-3 rounded-2xl text-sm outline-none shadow-sm border border-transparent focus:border-brand-yellow transition-colors" onkeydown="if(event.key === 'Enter') searchExploreImages()">
          <button onclick="searchExploreImages()" class="w-12 h-12 bg-brand-dark text-white rounded-2xl flex-shrink-0 flex items-center justify-center hover:bg-black transition-colors shadow-sm">
            <i class="ri-search-line"></i>
          </button>
        </div>

        <div class="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-2 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onclick="reflectOnQuote('${encodeURIComponent(quoteData.quote)}')">
          <div class="absolute right-0 top-0 opacity-10 text-6xl text-brand-yellow font-serif pt-2 pr-4">"</div>
          <p class="text-sm font-semibold text-brand-dark italic relative z-10">"${quoteData.quote}"</p>
          <p class="text-xs text-brand-lightText mt-2 font-medium flex justify-between items-center">
            <span>— ${quoteData.author}</span>
            <span class="bg-brand-gray px-2 py-1 rounded-full"><i class="ri-quill-pen-line"></i> Reflect</span>
          </p>
        </div>
      </div>
      
      <div class="columns-2 gap-4" id="explore-grid">
        ${gridHtml}
      </div>
    </div>`;
}

window.searchExploreImages = async function() {
  const query = document.getElementById('explore-search-input').value.trim().toLowerCase();
  if (!query) return;

  const grid = document.getElementById('explore-grid');
  grid.innerHTML = `<div class="w-full py-10 flex flex-col items-center justify-center col-span-2"><i class="ri-loader-4-line text-brand-dark text-3xl animate-spin mb-2"></i><p class="text-sm text-brand-dark/50">Finding aesthetic ideas...</p></div>`;

  setTimeout(() => {
    let matchingImgs = store.exploreImages.filter(img => img.tags.some(t => query.includes(t) || t.includes(query) || t.includes(query.toLowerCase())));
    
    // Fallback if no matching tag: just return top 4 from store to guarantee something is shown
    if (matchingImgs.length === 0) {
      matchingImgs = store.exploreImages.slice(0, 4);
    }

    let feedImgs = [...matchingImgs];
    while (feedImgs.length < 10 && feedImgs.length > 0) { feedImgs = [...feedImgs, ...matchingImgs]; } // Pad results
    feedImgs.sort(() => Math.random() - 0.5);

    const gridHtml = feedImgs.map(img => {
      const h = Math.floor(140 + Math.random() * 120);
      return `
        <div class="break-inside-avoid shadow-sm rounded-[24px] overflow-hidden relative group cursor-pointer mb-4 hover:shadow-md transition-all hover:-translate-y-1" onclick="openExplorePreview('${img.src}')">
          <img src="${img.src}" class="w-full object-cover bg-gray-200" style="height: ${h}px;" loading="lazy" alt="${img.tags[0]} Aesthetic">
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span class="bg-white/95 text-brand-dark px-4 py-2 rounded-full text-xs font-bold shadow-md flex items-center gap-1"><i class="ri-add-line"></i> Journal</span>
          </div>
        </div>
      `;
    }).join('');
    
    grid.innerHTML = gridHtml;
  }, 300);
}

window.openExploreAddModal = function() {
  document.getElementById('explore-add-url').value = '';
  document.getElementById('explore-add-tags').value = '';
  const modal = document.getElementById('explore-add-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

window.closeExploreAddModal = function() {
  const modal = document.getElementById('explore-add-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.handleExploreFileUpload = function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showAlert('Please select an image file.'); return; }
  if (file.size > 2 * 1024 * 1024) { showAlert('Image too large. Max 2MB.'); return; }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('explore-add-url').value = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

window.saveExploreInspiration = function() {
  const url = document.getElementById('explore-add-url').value.trim();
  const tagsStr = document.getElementById('explore-add-tags').value.trim();
  if (!url) { showAlert('Please provide an image URL or upload one from your device.'); return; }
  
  let tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
  if (tags.length === 0) tags = ['custom', 'aesthetic'];
  
  store.exploreImages.unshift({ src: url, tags: tags });
  saveStore();
  closeExploreAddModal();
  renderExploreScreen(); // Immediately reload grid with new image!
}

window.openExplorePreview = function (src) {
  const modal = document.getElementById('explore-preview-modal');
  document.getElementById('explore-preview-img').src = src;
  const btn = document.getElementById('explore-preview-confirm');

  btn.onclick = () => {
    closeExplorePreview();
    _createCoverImage = src;
    switchScreen('screen-create');

    // Auto populate cover logic visually
    setTimeout(() => {
      const coverEl = document.getElementById('create-cover');
      const containerEl = document.getElementById('create-cover-container');
      const btnAddEl = document.getElementById('create-cover-btn');
      if (coverEl && containerEl) {
        coverEl.src = src;
        containerEl.classList.remove('hidden');
        if (btnAddEl) btnAddEl.classList.add('hidden');
      }
    }, 50);
  };

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

window.closeExplorePreview = function () {
  const modal = document.getElementById('explore-preview-modal');
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

window.reflectOnQuote = function (encodedQuote) {
  const quote = decodeURIComponent(encodedQuote);
  switchScreen('screen-create');
  setTimeout(() => {
    const titleEl = document.getElementById('create-title');
    const rte = document.getElementById('create-rte');
    if (titleEl) titleEl.value = "Reflection on a Quote";
    if (rte) rte.innerHTML = `<blockquote><em>"${quote}"</em></blockquote><p><br></p><p>Here is how I feel about this today...</p>`;
  }, 50);
}

// =================== STATS SCREEN ===================

let statsSelectedEmotion = null;

window.filterEmotion = function (emotion) {
  statsSelectedEmotion = statsSelectedEmotion === emotion ? null : emotion;
  renderStatsScreen();
}

function renderStatsScreen() {
  const container = document.getElementById('screen-stats');
  const total = store.entries.length;
  const counts = { "Happy": 0, "Sad": 0, "Calm": 0, "Anxious": 0 };
  store.entries.forEach(e => { if (counts[e.emotion] !== undefined) counts[e.emotion]++; });
  const pct = (em) => total === 0 ? 0 : Math.round((counts[em] / total) * 100);

  const bars = [
    { key: 'Happy', color: '#FFB833', pct: pct('Happy') },
    { key: 'Sad', color: '#8B5A4B', pct: pct('Sad') },
    { key: 'Calm', color: '#8EB254', pct: pct('Calm') },
    { key: 'Anxious', color: '#6C6C63', pct: pct('Anxious') }
  ];

  const barsHtml = bars.map((b, i) => `
    <div class="flex flex-col items-center gap-3 h-full flex-1 cursor-pointer hover:opacity-80 transition-opacity" onclick="filterEmotion('${b.key}')" style="--delay:${i * 100}ms">
      <div class="w-full bg-brand-gray rounded-full h-full relative overflow-hidden flex items-end ${statsSelectedEmotion === b.key ? 'ring-2 ring-offset-2' : ''}" style="ring-color:${b.color}">
        <div class="w-full rounded-full flex items-end justify-center pb-3 transition-all duration-1000 ease-out" style="height:0%; background:${b.color}; transition-delay:${i * 100}ms" data-height="${Math.max(b.pct, 15)}%">
          <span class="text-xs font-semibold text-white">${b.pct}%</span>
        </div>
      </div>
      <span class="text-xs font-bold" style="color:${statsSelectedEmotion === b.key ? b.color : '#888'}">${b.key}</span>
    </div>`).join('');

  let filteredListHtml = '';
  if (statsSelectedEmotion) {
    const list = store.entries.filter(e => e.emotion === statsSelectedEmotion);
    const barColor = bars.find(b => b.key === statsSelectedEmotion)?.color || '#ccc';
    filteredListHtml = list.length === 0
      ? `<div class="text-center p-4 text-sm text-brand-lightText">No ${statsSelectedEmotion} entries yet.</div>`
      : list.map(e => `
          <div onclick="viewEntry('${e.id}')" class="bg-white p-4 rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4" style="border-color:${barColor}">
            <h4 class="font-bold text-brand-dark">${e.title}</h4>
            <p class="text-xs text-brand-lightText mt-1">${new Date(e.date).toLocaleDateString()}</p>
          </div>`).join('');
  }

  container.innerHTML = `
    <div class="flex justify-between items-center mb-8 pt-2">
      <h2 class="font-bold text-2xl">My Journey</h2>
    </div>
    <div class="text-center mb-8">
      <h1 class="text-6xl font-bold text-brand-dark tracking-tighter mb-2">${total}</h1>
      <p class="text-brand-text/70 text-sm">Total entries capturing your moments.</p>
    </div>
    <div class="bg-white rounded-[32px] p-4 sm:p-6 shadow-soft mb-6">
      <h3 class="font-bold text-lg mb-1">Emotion Breakdown</h3>
      <p class="text-xs text-brand-lightText mb-6">Tap a bar to filter journals</p>
      <div class="flex justify-between items-end h-[180px] gap-3">${barsHtml}</div>
    </div>
    <div class="${statsSelectedEmotion ? 'block' : 'hidden'}">
      <h4 class="font-bold text-brand-dark mb-3 flex items-center justify-between">
        ${statsSelectedEmotion} Entries
        <button onclick="filterEmotion('${statsSelectedEmotion}')" class="text-xs font-medium text-brand-lightText bg-white px-2 py-1 rounded-full shadow-sm"><i class="ri-close-line"></i> Clear</button>
      </h4>
      ${filteredListHtml}
    </div>`;

  setTimeout(() => {
    container.querySelectorAll('[data-height]').forEach(bar => {
      bar.style.height = bar.getAttribute('data-height');
    });
  }, 100);
}

// =================== PROFILE SCREEN ===================

function renderProfileScreen() {
  const container = document.getElementById('screen-profile');
  const user = getCurrentUser();
  if (!user) { container.innerHTML = '<p class="text-center mt-20">Not logged in.</p>'; return; }

  const roleIcon = user.role === 'Student' ? '🎓' : user.role === 'Employee' ? '💼' : '👤';
  const roleColor = user.role === 'Student' ? 'bg-blue-100 text-blue-700' : user.role === 'Employee' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';

  container.innerHTML = `
    <div class="flex justify-between items-center mb-8 pt-2">
      <h2 class="font-bold text-2xl">Profile</h2>
    </div>

    <!-- Avatar + Identity Card -->
    <div class="bg-white rounded-[32px] p-4 sm:p-6 shadow-soft mb-5 flex flex-col items-center text-center">
      <button onclick="openAvatarPicker()" class="avatar-ring mb-4 relative">
        <div style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
          ${getAvatarHtml(user, 90)}
        </div>
        <div class="absolute bottom-0 right-0 w-7 h-7 bg-brand-yellow rounded-full flex items-center justify-center border-2 border-white shadow">
          <i class="ri-camera-line text-white text-xs"></i>
        </div>
      </button>

      <input id="profile-name" value="${user.name}" class="text-xl font-bold text-center bg-transparent border-b-2 border-transparent focus:border-brand-yellow outline-none w-full pb-1 mb-2 transition-colors" placeholder="Your name">
      <textarea id="profile-desc" rows="2" class="w-full text-sm text-brand-lightText bg-transparent border-b-2 border-transparent focus:border-brand-yellow outline-none resize-none text-center transition-colors" placeholder="Add a short bio...">${user.description || ''}</textarea>

      <div class="flex items-center gap-2 mt-4">
        <span class="${roleColor} px-3 py-1 rounded-full text-xs font-bold">${roleIcon} ${user.role || 'No role set'}</span>
        <button onclick="openChangeRole()" class="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold hover:bg-gray-200 transition">Change</button>
      </div>

      <button onclick="saveUserProfile()" class="mt-5 w-full py-3 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-colors shadow-md">
        Save Changes
      </button>
    </div>

    <!-- Security Settings -->
    <div class="bg-white rounded-[32px] p-4 sm:p-6 shadow-soft mb-5">
      <h3 class="font-bold text-lg mb-4">Security</h3>
      <div class="flex flex-col gap-3">
        <button onclick="requestChangeEmail()" class="w-full py-3 bg-brand-gray text-brand-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <i class="ri-mail-line"></i> Change Email
        </button>
        <button onclick="requestChangePassword()" class="w-full py-3 bg-brand-gray text-brand-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <i class="ri-lock-password-line"></i> Change Password
        </button>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="bg-white rounded-[32px] p-4 sm:p-6 shadow-soft mb-5">
      <h3 class="font-bold text-lg mb-4">Account</h3>
      <div class="flex flex-col gap-3">
        <button onclick="handleLogout()" class="w-full py-3 bg-brand-gray text-brand-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <i class="ri-logout-box-r-line"></i> Sign Out
        </button>
        <button onclick="clearAllData()" class="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100">
          Erase All My Journals
        </button>
      </div>
    </div>
    <p class="text-center text-xs text-brand-lightText pb-4">Your data is securely stored offline in your device's local storage.</p>
  `;
}

window.saveUserProfile = function () {
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById('profile-name')?.value.trim();
  const desc = document.getElementById('profile-desc')?.value.trim();
  if (!name) { showAlert('Name cannot be empty.'); return; }
  user.name = name;
  user.description = desc;
  saveAuthStore();
  renderHomeScreen();
  renderProfileScreen();
  const btn = document.querySelector('#screen-profile button[onclick="saveUserProfile()"]');
  if (btn) { btn.textContent = '✓ Saved!'; setTimeout(() => { btn.textContent = 'Save Changes'; }, 1500); }
}

window.openChangeRole = function () {
  showAuthOverlay();
  renderRoleScreen();
  const origConfirm = window.confirmRole;
  window.confirmRole = function () {
    if (!_selectedRole) return;
    const user = getCurrentUser();
    if (user) { user.role = _selectedRole; saveAuthStore(); }
    dismissAuthOverlay();
    renderProfileScreen();
    window.confirmRole = origConfirm;
  };
}

window.requestChangeEmail = function () {
  const newEmail = prompt("Enter your new email address:");
  if (!newEmail) return;
  showAlert(`An OTP (One-Time Password) has been sent to ${newEmail} (simulated for local storage).`);
  const otp = prompt("Please enter the 6-digit OTP sent to your email:");
  if (otp) {
    const user = getCurrentUser();
    const oldEmail = user.email;
    const newEmailLower = newEmail.trim().toLowerCase();
    if (authStore.users[newEmailLower]) { showAlert('Email is already in use!'); return; }

    user.email = newEmailLower;
    // Re-key the users object
    authStore.users[newEmailLower] = user;
    delete authStore.users[oldEmail];
    authStore.currentUserId = newEmailLower;
    saveAuthStore();

    showAlert("Email updated successfully!");
    renderProfileScreen();
  }
}

window.requestChangePassword = function () {
  const user = getCurrentUser();
  const oldPass = prompt("Enter your CURRENT password:");
  if (!oldPass || oldPass !== user.password) { showAlert("Incorrect current password."); return; }

  const newPass = prompt("Enter your NEW password (min 6 characters):");
  if (!newPass || newPass.length < 6) { showAlert("Password must be at least 6 characters."); return; }

  showAlert(`An OTP has been sent to ${user.email} for verification (simulated).`);
  const otp = prompt("Please enter the 6-digit OTP:");
  if (otp) {
    user.password = newPass;
    saveAuthStore();
    showAlert("Password updated successfully!");
  }
}

window.handleLogout = async function () {
  if (!(await showConfirm('Sign out of Mindful Journal?', 'Sign Out', true, 'Sign Out'))) return;
  authStore.currentUserId = null;
  saveAuthStore();
  store = { apiKey: ['AIzaSy', 'BKo7Mu', '22hqa5tI', '8lV2Y-eSp', 'q1pwrnWsGA'].join(''), entries: [] };
  switchScreen('screen-home');
  showAuthOverlay();
  renderWelcomeScreen();
}


// =================== AVATAR PICKER ===================

const AVATAR_PRESET_COLORS = [
  { bg: '#FFB833', initials: true },
  { bg: '#6C63FF', initials: true },
  { bg: '#EF4444', initials: true },
  { bg: '#10B981', initials: true },
];

window.openAvatarPicker = function () {
  const user = getCurrentUser();
  if (!user) return;
  // Populate initials presets
  const grid = document.getElementById('avatar-preset-grid');
  if (grid) {
    grid.innerHTML = AVATAR_PRESET_COLORS.map((c, i) => `
      <button onclick="applyAvatarColor('${c.bg}')"
        style="width:60px;height:60px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:white;border:3px solid transparent;transition:border 0.15s;"
        onmouseover="this.style.border='3px solid #FFB833'" onmouseout="this.style.border='3px solid transparent'">
        ${user.name.charAt(0).toUpperCase()}
      </button>
    `).join('');
  }
  const modal = document.getElementById('avatar-picker-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

window.closeAvatarPicker = function () {
  const modal = document.getElementById('avatar-picker-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.handleAvatarFileUpload = function (event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showAlert('Please select an image file.'); return; }
  // Limit to ~2 MB to avoid localStorage bloat
  if (file.size > 2 * 1024 * 1024) { showAlert('Image too large. Please pick one under 2 MB.'); return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    const user = getCurrentUser();
    if (user) { user.avatar = base64; saveAuthStore(); }
    closeAvatarPicker();
    renderProfileScreen();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

window.applyAvatarColor = function (color) {
  const user = getCurrentUser();
  if (user) {
    user.avatar = '';
    user.avatarColor = color;
    saveAuthStore();
  }
  closeAvatarPicker();
  renderProfileScreen();
}

// =================== PROFILE HELPERS ===================

window.clearAllData = async function () {
  if (await showConfirm("This will permanently delete all your journal entries. Proceed?", "Clear All Data", true, "Delete All")) {
    store.entries = [];
    saveStore();
    switchScreen('screen-home');
  }
}

// =================== GEMINI AI ===================

function parseMarkdownToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

window.openAiModal = function (actionType = 'generate_prompt') {
  const modal = document.getElementById('ai-modal');
  const responseDiv = document.getElementById('ai-response');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(() => { modal.classList.add('modal-open'); }, 10);

  responseDiv.innerHTML = `<div class="animate-pulse flex space-x-2 items-center text-brand-lightText"><i class="ri-loader-4-line animate-spin text-xl"></i><span>Communicating with Gemini AI...</span></div>`;

  const prompt = "Act as an empathetic journaling assistant. Generate a single, short, 1-2 sentence mindful journaling prompt to help the user reflect on their day and focus on gratitude or peace. Just the prompt, nothing else.";

  callActualGemini(prompt)
    .then(response => {
      const htmlResponse = parseMarkdownToHtml(response);
      responseDiv.innerHTML = `<div class="p-4 bg-brand-gray rounded-xl mb-4 border border-gray-200"><p class="italic text-brand-text font-medium text-lg leading-snug">"${htmlResponse}"</p></div>`;
      if (actionType === 'generate_prompt' && document.getElementById('create-rte')) {
        const btn = document.createElement('button');
        btn.className = "w-full py-3 bg-brand-dark text-white rounded-xl font-bold mt-2 hover:bg-black transition border border-gray-800 shadow-md";
        btn.innerText = "Use this prompt";
        btn.onclick = () => {
          const rte = document.getElementById('create-rte');
          if (rte) rte.innerHTML = `<p>${htmlResponse}</p><p><br></p>`;
          document.getElementById('close-ai-modal').click();
          rte?.focus();
        }
        responseDiv.appendChild(btn);
      }
    })
    .catch(err => {
      responseDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-xl mb-4 border border-red-200 text-sm"><strong>Error:</strong> ${err.message || "Failed to reach Gemini API."}</div>`;
    });
}

window.enhanceEntryWithGemini = function (entryId) {
  const entry = store.entries.find(e => e.id === entryId);
  if (!entry) return;
  const modal = document.getElementById('ai-modal');
  const responseDiv = document.getElementById('ai-response');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  setTimeout(() => { modal.classList.add('modal-open'); }, 10);
  responseDiv.innerHTML = `<div class="animate-pulse flex space-x-2 items-center text-brand-lightText"><i class="ri-loader-4-line animate-spin text-xl"></i><span>Analyzing your journal entry...</span></div>`;

  const plain = entry.content.replace(/<[^>]*>/g, '');
  const promptData = `Analyze this journal entry briefly: "${plain}". Give an empathetic, 2-3 sentence insight or encouragement based on the emotions described. Sound like a supportive friend.`;

  callActualGemini(promptData)
    .then(response => {
      const htmlResponse = parseMarkdownToHtml(response);
      responseDiv.innerHTML = `<div class="p-4 bg-purple-50 rounded-xl mb-4 border border-purple-200"><p class="italic text-brand-text leading-relaxed font-medium">"${htmlResponse}"</p></div>`;
    })
    .catch(err => {
      responseDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm"><strong>API Error:</strong> ${err.message}</div>`;
    });
}

document.getElementById('close-ai-modal').addEventListener('click', () => {
  const modal = document.getElementById('ai-modal');
  modal.classList.remove('modal-open');
  setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
});

async function callActualGemini(userPrompt) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API Request Failed');
    }

    return data.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to reach AI. Ensure you are accessing this app via the deployed URL and the GEMINI_API_KEY environment variable is configured correctly.');
  }
}
