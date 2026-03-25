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
window.renderWelcomeScreen = function() {
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

window.renderLoginScreen = function() {
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

window.handleLogin = function() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-password').value;
  const err   = document.getElementById('login-error');
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

window.renderSignUpScreen = function() {
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

window.togglePasswordVisibility = function(inputId, iconId) {
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

window.handleSignUp = function() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pass  = document.getElementById('signup-password').value;
  const err   = document.getElementById('signup-error');

  if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; err.classList.remove('hidden'); return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; err.classList.remove('hidden'); return; }
  if (authStore.users[email]) { err.textContent = 'An account with that email already exists.'; err.classList.remove('hidden'); return; }

  authStore.users[email] = { name, email, password: pass, role: null, description: '', avatar: '', avatarColor: '#FFB833' };
  authStore.currentUserId = email;
  saveAuthStore();
  renderRoleScreen();
}

let _selectedRole = null;
window.renderRoleScreen = function() {
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

window.selectRole = function(role) {
  _selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`role-${role.toLowerCase()}`).classList.add('selected');
  const btn = document.getElementById('role-continue-btn');
  btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.classList.add('yellow');
}

window.confirmRole = function() {
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
});

// ===================== GLOBAL JOURNAL STORE (LocalStorage) =====================

let store = { apiKey: ['AIzaSy','BKo7Mu','22hqa5tI','8lV2Y-eSp','q1pwrnWsGA'].join(''), entries: [] };
let activeEntryId = null;
let homeSelectedDate = new Date().toDateString();
let isEditing = false;
const DEFAULT_COVER = 'https://i.pinimg.com/1200x/4b/61/93/4b6193893b5e78852385512422b9fa9e.jpg';

function initStore() {
  const saved = localStorage.getItem('journal_store');
  const hardcodedKey = ['AIzaSy','BKo7Mu','22hqa5tI','8lV2Y-eSp','q1pwrnWsGA'].join('');
  
  if (saved) {
    try { 
      store = JSON.parse(saved); 
      if (!store.entries || !Array.isArray(store.entries)) store.entries = [];
      store.apiKey = hardcodedKey; // Always enforce the hardcoded key
    } catch (e) { console.error('Error parsing store', e); }
  } else {
    // defaults
    store.apiKey = hardcodedKey;
    if (!store.entries) store.entries = [];
    const welcome = {
      id: Date.now().toString(),
      title: "Morning Reflection",
      content: "<p>I woke up to the soft light filtering through my window, and for the first time in a while, I didn't rush to check my phone.</p><p><br></p><p>The warmth of my morning tea feeling <strong>deeply grounding</strong>. A moment of pure <em>gratitude</em>.</p>",
      date: new Date().toISOString(),
      emotion: "Happy",
      tags: ["Personal", "Calm"],
      coverImage: DEFAULT_COVER
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
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = e.currentTarget.getAttribute('data-target');
      if (targetId) switchScreen(targetId);
      navItems.forEach(n => {
        n.classList.remove('text-brand-dark');
        n.classList.add('text-brand-lightText', 'grayscale', 'opacity-60');
      });
      e.currentTarget.classList.remove('text-brand-lightText', 'grayscale', 'opacity-60');
      e.currentTarget.classList.add('text-brand-dark');
    });
  });
}

window.switchScreen = function (screenId) {
  document.querySelectorAll('.screen-view').forEach(screen => {
    screen.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    if (screenId === 'screen-home') renderHomeScreen();
    if (screenId === 'screen-detail') { isEditing = false; renderDetailScreen(); }
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

window.execCmd = function(cmd) {
  document.execCommand(cmd, false, null);
}

window.execFormatBlock = function(value, targetId) {
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

window.aiRewriteSelection = async function(mode) {
  const selectedText = getSelectedPlainText();
  if (!selectedText) { hideAiSelectionPopup(); return; }

  hideAiSelectionPopup();

  const prompts = {
    improve:   `Improve the writing quality of the following text while keeping the same core meaning and first-person perspective. Return only the rewritten text, nothing else:\n\n"${selectedText}"`,
    shorter:   `Make this shorter and more concise while keeping the key ideas. Return only the rewritten text:\n\n"${selectedText}"`,
    emotional: `Rewrite this to sound more emotionally expressive and heartfelt, as if writing in a personal diary. Return only the rewritten text:\n\n"${selectedText}"`
  };

  const prompt = prompts[mode] || prompts.improve;

  // Show inline loading indicator

  try {
    const result = await callActualGemini(prompt);
    replaceSelectionWithAiText(result.trim());
  } catch (err) {
    alert('AI Error: ' + (err.message || 'Failed to reach Gemini.'));
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

window.aiRewriteCustom = function() {
  const selectedText = getSelectedPlainText();
  if (!selectedText) return;
  _askAiMode = 'replace';
  document.getElementById('ask-ai-context-label').textContent = `Selected: "${selectedText.substring(0, 60)}${selectedText.length > 60 ? '…' : ''}"`;
  hideAiSelectionPopup();
  openAskAiModal();
}

window.openAskAiForCursor = function(rteId) {
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

window.closeAskAiModal = function() {
  const modal = document.getElementById('ask-ai-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.askAiQuickAction = async function(instruction) {
  const selectedText = _askAiMode === 'replace' ? getSelectedPlainText() : null;
  const prompt = selectedText
    ? `${instruction}. Return only the result, no explanation:\n\n"${selectedText}"`
    : `${instruction}. Write a 2-3 sentence response in a personal journal writing style. Return only the text, nothing else.`;
  await runAskAi(prompt);
}

window.askAiCustomSubmit = async function() {
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
    alert('AI Error: ' + (err.message || 'Failed to reach Gemini.'));
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

window.setHomeDate = function(dateStr) {
  homeSelectedDate = dateStr;
  renderHomeScreen();
}

function renderHomeScreen() {
  const container = document.getElementById('screen-home');
  const today = new Date();
  const calendarDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toDateString();
    calendarDays.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      fullDateStr: dStr,
      active: dStr === homeSelectedDate
    });
  }

  const calendarHtml = calendarDays.map(d => `
    <div onclick="setHomeDate('${d.fullDateStr}')" class="flex flex-col items-center gap-1 sm:gap-2 min-w-[3rem] sm:min-w-[3.5rem] cursor-pointer hover:scale-105 transition-transform">
      <span class="text-[10px] sm:text-xs ${d.active ? 'text-brand-orange font-bold' : 'text-brand-lightText font-medium'}">${d.day}</span>
      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-semibold transition-colors duration-300
        ${d.active ? 'bg-brand-yellow text-white shadow-md' : 'bg-white text-brand-text shadow-sm'}">
        ${d.date}
      </div>
    </div>
  `).join('');

  const sortedEntries = [...store.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const mainCardEntry = sortedEntries[0] || null;
  const selectedDateObj = new Date(homeSelectedDate);
  const quickEntries = sortedEntries.filter(e => new Date(e.date).toDateString() === selectedDateObj.toDateString());

  let mainCardHtml = '';
  if (mainCardEntry) {
    mainCardHtml = `
      <div class="min-w-[280px] bg-[#FACC50] rounded-[32px] p-4 sm:p-6 snap-center shadow-soft relative overflow-hidden cursor-pointer" onclick="viewEntry('${mainCardEntry.id}')">
        <div class="absolute top-20 right-10 w-8 h-2 bg-white/40 rounded-full blur-[1px]"></div>
        <div class="absolute top-24 left-10 w-12 h-2 bg-white/40 rounded-full blur-[1px]"></div>
        <div class="relative z-10 text-center mb-8">
          <h3 class="font-bold text-brand-dark text-lg whitespace-nowrap overflow-hidden text-ellipsis">${mainCardEntry.title}</h3>
          <p class="text-brand-dark/80 text-sm mt-1">${new Date(mainCardEntry.date).toLocaleDateString()}</p>
        </div>
        <div class="relative w-full h-32 flex justify-center items-end">
           <div class="w-16 h-16 bg-[#FF8C38] rounded-full absolute bottom-4 flex justify-center items-center shadow-[0_0_30px_#FF8C38]">
              <div class="flex gap-1 mb-2"><div class="w-1.5 h-1.5 bg-[#4A2511] rounded-full"></div><div class="w-1.5 h-1.5 bg-[#4A2511] rounded-full"></div></div>
              <div class="absolute bottom-3 w-3 h-1.5 border-b-2 border-[#4A2511] rounded-full"></div>
           </div>
           <div class="absolute -bottom-8 -left-10 w-40 h-24 bg-[#6A944B] rounded-full blur-[1px]"></div>
           <div class="absolute -bottom-6 -right-10 w-48 h-24 bg-[#80AD5C] rounded-full blur-[1px]"></div>
        </div>
      </div>`;
  } else {
    mainCardHtml = `<div class="min-w-[280px] bg-[#FACC50] rounded-[32px] p-4 sm:p-6 snap-center shadow-soft flex items-center justify-center text-center cursor-pointer" onclick="switchScreen('screen-create')"><h3 class="font-bold text-brand-dark text-lg">Let's start your day<br/><span class="text-sm font-normal">Tap '+' to begin your first journal</span></h3></div>`;
  }

  const bgColors = ['bg-card-peach', 'bg-card-lavender', 'bg-card-sage'];
  let quickJournalsHtml = quickEntries.map((q, idx) => `
    <div onclick="viewEntry('${q.id}')" class="${bgColors[idx % 3]} p-5 rounded-3xl min-w-[160px] snap-start shadow-sm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow" style="min-height: 180px;">
      <div>
        <h3 class="font-semibold text-brand-text mb-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis">${q.title}</h3>
        <p class="text-brand-text/70 text-xs leading-relaxed max-h-[60px] overflow-hidden">${q.content.replace(/<[^>]*>/g, '').substring(0, 60)}...</p>
      </div>
      <div class="flex items-center justify-between mt-4">
        <span class="text-xs text-brand-text/50">${new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span class="bg-white px-3 py-1 rounded-full text-[10px] font-semibold text-brand-yellow shadow-sm">${q.emotion}</span>
      </div>
    </div>`).join('');

  if (quickEntries.length === 0) quickJournalsHtml = `<div class="w-full text-center py-6 text-brand-lightText text-sm bg-white/50 rounded-[32px] border border-gray-100">No entries on ${selectedDateObj.toLocaleDateString(undefined, {month:'long', day:'numeric'})}.<br/><br/><button onclick="switchScreen('screen-create')" class="text-brand-orange font-bold">Write one now</button></div>`;

  const user = getCurrentUser();
  const rawName = user && user.name ? user.name : 'Friend';
  const firstName = rawName.split(' ')[0];
  const avatarHtml = user ? getAvatarHtml(user, 48) : '';

  container.innerHTML = `
    <div class="sticky -top-4 sm:-top-6 z-40 bg-brand-gray/95 backdrop-blur-md -mx-4 sm:-mx-6 px-4 sm:px-6 pt-8 sm:pt-10 pb-4 mb-6 shadow-[0_10px_30px_rgba(245,245,247,0.8)]">
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight transform origin-left transition-all">Hi, ${firstName}</h1>
        <button onclick="switchScreen('screen-profile')" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-brand-yellow flex-shrink-0 transition-transform hover:scale-105">
          ${avatarHtml}
        </button>
      </header>
      <div class="flex overflow-x-auto hide-scrollbar gap-2 pb-2 snap-x relative -mx-4 sm:-mx-6 px-4 sm:px-6">${calendarHtml}</div>
    </div>
    <div class="mb-8">
      <h2 class="text-xl font-bold mb-4">Latest Entry</h2>
      <div class="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x pb-4">
        ${mainCardHtml}
        <div class="min-w-[100px] bg-[#D7D0C4] rounded-[32px] p-4 sm:p-6 snap-center flex justify-center items-center shadow-soft">
          <span class="rotate-[-90deg] font-bold text-brand-dark/60 tracking-widest uppercase text-sm">Evening</span>
        </div>
      </div>
    </div>
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">Journals on Selected Date</h2>
      <div class="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x">${quickJournalsHtml}</div>
    </div>`;
}

// =================== DETAIL & EDIT ===================

window.viewEntry = function (id) {
  activeEntryId = id;
  isEditing = false;
  switchScreen('screen-detail');
}

window.toggleEdit = function () {
  isEditing = !isEditing;
  renderDetailScreen();
}

window.saveEdit = function () {
  const entry = store.entries.find(e => e.id === activeEntryId);
  if (!entry) return;

  const newTitle = document.getElementById('edit-title')?.value.trim();
  const newEmotion = document.getElementById('edit-emotion')?.value;
  const rte = document.getElementById('edit-rte');
  const newContent = rte ? rte.innerHTML : entry.content;

  if (!newTitle) { alert("Title cannot be empty."); return; }

  entry.title = newTitle;
  entry.content = newContent;
  entry.emotion = newEmotion;
  saveStore();
  isEditing = false;
  renderDetailScreen();
}

// Image picker helpers
window.openImgPicker = function () {
  const modal = document.getElementById('img-picker-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

window.closeImgPicker = function () {
  const modal = document.getElementById('img-picker-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.applyPresetImage = function (src) {
  if (activeEntryId) {
    const entry = store.entries.find(e => e.id === activeEntryId);
    if (entry) { entry.coverImage = src; saveStore(); }
    const coverEl = document.getElementById('detail-cover');
    if (coverEl) coverEl.src = src;
  } else {
    _createCoverImage = src;
    const createCoverEl = document.getElementById('create-cover');
    const containerEl = document.getElementById('create-cover-container');
    const btnEl = document.getElementById('create-cover-btn');
    if (createCoverEl && containerEl) {
      createCoverEl.src = src;
      containerEl.classList.remove('hidden');
      if (btnEl) btnEl.classList.add('hidden');
    }
  }
  closeImgPicker();
}

window.applyCustomImageUrl = function () {
  const input = document.getElementById('img-url-input');
  const url = input?.value.trim();
  if (!url) { alert('Please enter a valid URL.'); return; }
  applyPresetImage(url);
}

window.handleCoverFileUpload = function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
  // Compressing or limiting large files is vital for localStorage limits (~5MB total)
  if (file.size > 2 * 1024 * 1024) { alert('Image too large. Please pick one under 2 MB to avoid running out of storage space.'); return; }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    applyPresetImage(e.target.result); // Reuse the same logic to set image
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // Reset input
}

function renderDetailScreen() {
  const container = document.getElementById('screen-detail');
  const entry = store.entries.find(e => e.id === activeEntryId);
  if (!entry) {
    container.innerHTML = `<div class="p-6 pt-20 text-center"><p>Entry not found.</p><button onclick="switchScreen('screen-home')" class="mt-4 text-brand-orange font-bold">Go Back</button></div>`;
    return;
  }

  const coverImg = entry.coverImage || DEFAULT_COVER;
  const d = new Date(entry.date);

  if (isEditing) {
    container.innerHTML = `
      <div class="flex justify-between items-center mb-6 pt-2">
        <button onclick="toggleEdit()" class="w-10 h-10 bg-brand-gray rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
          <i class="ri-close-line text-2xl"></i>
        </button>
        <span class="font-bold text-brand-dark">Edit Entry</span>
        <button onclick="saveEdit()" class="px-4 h-10 bg-brand-yellow text-white rounded-full flex items-center gap-1 justify-center shadow-md font-bold text-sm hover:scale-105 transition-transform">
          <i class="ri-check-line"></i> Save
        </button>
      </div>

      <!-- Editable Cover -->
      <div class="editable-cover w-full h-48 rounded-3xl overflow-hidden mb-4 shadow-md" onclick="openImgPicker()">
        <img id="detail-cover" src="${coverImg}" class="w-full h-full object-cover">
        <div class="cover-edit-overlay"><span><i class="ri-image-edit-line text-lg"></i> Change Photo</span></div>
      </div>

      <p class="text-brand-orange font-medium text-sm mb-2 text-center">${d.toLocaleDateString()}</p>
      <input type="text" id="edit-title" value="${entry.title}" class="w-full text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none mb-3 text-center text-brand-dark focus:border-brand-yellow transition-colors">
      
      <div class="flex justify-center mb-4">
        <select id="edit-emotion" class="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-brand-orange outline-none shadow-sm focus:border-brand-yellow transition-colors cursor-pointer">
          <option value="Happy" ${entry.emotion === 'Happy' ? 'selected' : ''}>😊 Happy</option>
          <option value="Calm" ${entry.emotion === 'Calm' ? 'selected' : ''}>😌 Calm</option>
          <option value="Anxious" ${entry.emotion === 'Anxious' ? 'selected' : ''}>😰 Anxious</option>
          <option value="Sad" ${entry.emotion === 'Sad' ? 'selected' : ''}>😔 Sad</option>
        </select>
      </div>

      ${buildToolbar('edit-rte')}
      <div class="pb-20"></div>
    `;

    // Load existing content into RTE
    const rte = document.getElementById('edit-rte');
    if (rte) rte.innerHTML = entry.content || '';
    // Wire up AI selection popup
    attachRteSelectionListeners('edit-rte');
    return;
  }

  // View mode
  const tagsHtml = (entry.tags || []).map(t => `<span class="px-4 py-1.5 bg-brand-gray rounded-full text-xs font-medium text-brand-text/70 shadow-sm border border-gray-100">${t}</span>`).join('');

  container.innerHTML = `
    <div class="flex justify-between items-center mb-6 pt-2">
      <button onclick="switchScreen('screen-home')" class="w-10 h-10 bg-brand-gray rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
        <i class="ri-arrow-left-s-line text-2xl"></i>
      </button>
      <div class="w-10 h-10"></div>
    </div>

    <div class="text-center mb-6">
      <p class="text-brand-orange font-medium text-sm mb-1">${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <h1 class="text-3xl font-bold text-brand-dark mb-4 drop-shadow-sm">${entry.title}</h1>
      <div class="flex justify-center flex-wrap gap-2">
        <span class="px-4 py-1.5 bg-brand-yellow/20 text-brand-orange rounded-full text-xs font-bold shadow-sm">${entry.emotion}</span>
        ${tagsHtml}
      </div>
    </div>

    <!-- Editable Cover (view mode) -->
    <div class="editable-cover w-full h-48 rounded-3xl overflow-hidden mb-6 shadow-md" onclick="openImgPicker()">
      <img id="detail-cover" src="${coverImg}" class="w-full h-full object-cover">
      <div class="cover-edit-overlay"><span><i class="ri-image-edit-line text-lg"></i> Change Photo</span></div>
    </div>

    <div class="rte-content prose prose-sm mb-24 px-1">${entry.content}</div>

    <!-- Floating Actions -->
    <div class="fixed bottom-24 left-0 w-full flex justify-center gap-4 px-6 pointer-events-none">
      <div class="flex gap-4 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg pointer-events-auto border border-white/50">
        <button onclick="toggleEdit()" class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-brand-dark hover:bg-gray-200 transition shadow-sm border border-gray-200" title="Edit Entry">
          <i class="ri-pencil-line text-xl"></i>
        </button>
        <button onclick="deleteEntry('${entry.id}')" class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition shadow-sm border border-red-100" title="Delete Entry">
          <i class="ri-delete-bin-line text-xl"></i>
        </button>
        <button onclick="enhanceEntryWithGemini('${entry.id}')" class="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-100 transition shadow-sm border border-purple-200" title="Analyze with Gemini AI">
          <i class="ri-sparkling-fill text-xl"></i>
        </button>
      </div>
    </div>
  `;
}

window.deleteEntry = function (id) {
  if (confirm("Are you sure you want to delete this journal entry?")) {
    store.entries = store.entries.filter(e => e.id !== id);
    if (activeEntryId === id) activeEntryId = null;
    saveStore();
    switchScreen('screen-home');
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

  if (!title || !plainText) { alert("Please provide both a title and some content."); return; }

  const emotion = emotionRaw.replace(/[^\w]/g, '').replace(/\d/g, '').trim();
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);

  store.entries.push({
    id: Date.now().toString(),
    title,
    content,
    emotion: emotion || 'Happy',
    tags,
    date: new Date().toISOString(),
    coverImage: _createCoverImage || DEFAULT_COVER
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
  const baseImgs = [
    'https://i.pinimg.com/1200x/4b/61/93/4b6193893b5e78852385512422b9fa9e.jpg',
    'https://i.pinimg.com/1200x/74/a7/91/74a791a1e32c9d381e6bcad683d2a7ba.jpg',
    'https://i.pinimg.com/1200x/70/29/11/7029115ab573baf10929a5ef2105f81c.jpg',
    'https://i.pinimg.com/1200x/b2/95/29/b2952920b7923033c314f804318075f7.jpg',
    'https://i.pinimg.com/736x/4c/b4/b4/4cb4b4af788147056a9e506280818e3b.jpg',
    'https://i.pinimg.com/736x/93/63/44/936344a9551968ecbde37266d01f3e21.jpg',
    'https://i.pinimg.com/1200x/39/2e/f9/392ef906f1722f71c103b17f19697b73.jpg',
    'https://i.pinimg.com/1200x/50/6c/c3/506cc38eaed3badcfc34f2e864b45484.jpg'
  ];

  // Repeat and shuffle for a full board
  let feedImgs = [...baseImgs, ...baseImgs, ...baseImgs];
  feedImgs.sort(() => Math.random() - 0.5);

  const gridHtml = feedImgs.map((src, i) => {
    const h = Math.floor(140 + Math.random() * 120); // Random height for masonry effect
    return `
      <div class="break-inside-avoid shadow-sm rounded-[24px] overflow-hidden relative group cursor-pointer mb-4 hover:shadow-md transition-all hover:-translate-y-1" onclick="openExplorePreview('${src}')">
        <img src="${src}" class="w-full object-cover" style="height: ${h}px;" loading="lazy" alt="Pinterest Idea">
        <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span class="bg-white/95 text-brand-dark px-4 py-2 rounded-full text-xs font-bold shadow-md flex items-center gap-1"><i class="ri-add-line"></i> Journal</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="w-full min-h-full bg-brand-gray pt-10 px-4 sm:px-6 pb-28">
      <div class="flex flex-col mb-6">
        <h2 class="text-3xl font-bold tracking-tight text-brand-dark mb-4">Discover Feed</h2>
        
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

window.openExplorePreview = function(src) {
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

window.closeExplorePreview = function() {
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
    <div class="flex flex-col items-center gap-3 h-full flex-1 cursor-pointer hover:opacity-80 transition-opacity" onclick="filterEmotion('${b.key}')" style="--delay:${i*100}ms">
      <div class="w-full bg-brand-gray rounded-full h-full relative overflow-hidden flex items-end ${statsSelectedEmotion === b.key ? 'ring-2 ring-offset-2' : ''}" style="ring-color:${b.color}">
        <div class="w-full rounded-full flex items-end justify-center pb-3 transition-all duration-1000 ease-out" style="height:0%; background:${b.color}; transition-delay:${i*100}ms" data-height="${Math.max(b.pct, 15)}%">
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

  const roleIcon  = user.role === 'Student' ? '🎓' : user.role === 'Employee' ? '💼' : '👤';
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

window.saveUserProfile = function() {
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById('profile-name')?.value.trim();
  const desc = document.getElementById('profile-desc')?.value.trim();
  if (!name) { alert('Name cannot be empty.'); return; }
  user.name = name;
  user.description = desc;
  saveAuthStore();
  renderHomeScreen();
  renderProfileScreen();
  const btn = document.querySelector('#screen-profile button[onclick="saveUserProfile()"]');
  if (btn) { btn.textContent = '✓ Saved!'; setTimeout(() => { btn.textContent = 'Save Changes'; }, 1500); }
}

window.openChangeRole = function() {
  showAuthOverlay();
  renderRoleScreen();
  const origConfirm = window.confirmRole;
  window.confirmRole = function() {
    if (!_selectedRole) return;
    const user = getCurrentUser();
    if (user) { user.role = _selectedRole; saveAuthStore(); }
    dismissAuthOverlay();
    renderProfileScreen();
    window.confirmRole = origConfirm;
  };
}

window.requestChangeEmail = function() {
  const newEmail = prompt("Enter your new email address:");
  if (!newEmail) return;
  alert(`An OTP (One-Time Password) has been sent to ${newEmail} (simulated for local storage).`);
  const otp = prompt("Please enter the 6-digit OTP sent to your email:");
  if (otp) {
    const user = getCurrentUser();
    const oldEmail = user.email;
    const newEmailLower = newEmail.trim().toLowerCase();
    if (authStore.users[newEmailLower]) { alert('Email is already in use!'); return; }
    
    user.email = newEmailLower;
    // Re-key the users object
    authStore.users[newEmailLower] = user;
    delete authStore.users[oldEmail];
    authStore.currentUserId = newEmailLower;
    saveAuthStore();
    
    alert("Email updated successfully!");
    renderProfileScreen();
  }
}

window.requestChangePassword = function() {
  const user = getCurrentUser();
  const oldPass = prompt("Enter your CURRENT password:");
  if (!oldPass || oldPass !== user.password) { alert("Incorrect current password."); return; }
  
  const newPass = prompt("Enter your NEW password (min 6 characters):");
  if (!newPass || newPass.length < 6) { alert("Password must be at least 6 characters."); return; }
  
  alert(`An OTP has been sent to ${user.email} for verification (simulated).`);
  const otp = prompt("Please enter the 6-digit OTP:");
  if (otp) {
    user.password = newPass;
    saveAuthStore();
    alert("Password updated successfully!");
  }
}

window.handleLogout = function() {
  if (!confirm('Sign out of Mindful Journal?')) return;
  authStore.currentUserId = null;
  saveAuthStore();
  store = { apiKey: ['AIzaSy','BKo7Mu','22hqa5tI','8lV2Y-eSp','q1pwrnWsGA'].join(''), entries: [] };
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

window.openAvatarPicker = function() {
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

window.closeAvatarPicker = function() {
  const modal = document.getElementById('avatar-picker-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

window.handleAvatarFileUpload = function(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
  // Limit to ~2 MB to avoid localStorage bloat
  if (file.size > 2 * 1024 * 1024) { alert('Image too large. Please pick one under 2 MB.'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const user = getCurrentUser();
    if (user) { user.avatar = base64; saveAuthStore(); }
    closeAvatarPicker();
    renderProfileScreen();
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

window.applyAvatarColor = function(color) {
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

window.clearAllData = function () {
  if (confirm("This will permanently delete all your journal entries. Proceed?")) {
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
