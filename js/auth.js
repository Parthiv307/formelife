/* ==========================================================================
   FORMA PLATFORM / HUNTER SYSTEM — MULTI-DEVICE AUTHENTICATION ENGINE
   Handles user registration, login, secure JWT sessions, password resets,
   and cross-device session synchronization.
   ========================================================================== */

class FormaAuthService {
  constructor() {
    this.currentUser = null;
    this.currentSession = null;
    this.authListeners = [];
    this.init();
  }

  async init() {
    // Wait until Supabase client is initialized
    if (!window.formaSupabase || !window.formaSupabase.client) {
      setTimeout(() => this.init(), 200);
      return;
    }

    try {
      const client = window.formaSupabase.client;
      
      // 1. Check existing session
      const { data: { session }, error } = await client.auth.getSession();
      if (!error && session) {
        this.currentSession = session;
        this.currentUser = session.user;
        this.notifyAuthChange('INITIAL_SESSION', session);
      }

      // 2. Listen to real-time auth events (multi-tab / multi-device token refreshes)
      client.auth.onAuthStateChange((event, session) => {
        console.log(`[FormaAuth] Auth Event: ${event}`, session?.user?.email);
        this.currentSession = session;
        this.currentUser = session ? session.user : null;
        this.notifyAuthChange(event, session);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (window.formaSync) {
            window.formaSync.start(session.user.id);
          }
          this.updateUserUI(session.user);
        } else if (event === 'SIGNED_OUT') {
          if (window.formaSync) {
            window.formaSync.stop();
          }
          this.updateUserUI(null);
        }
      });
    } catch (e) {
      console.warn('[FormaAuth] Initialization notice:', e);
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getUser() {
    return this.currentUser;
  }

  getSession() {
    return this.currentSession;
  }

  onAuthStateChange(callback) {
    if (typeof callback === 'function') {
      this.authListeners.push(callback);
    }
  }

  notifyAuthChange(event, session) {
    this.authListeners.forEach(fn => {
      try { fn(event, session); } catch (e) { console.error(e); }
    });
  }

  // --- ACTIONS ---

  async signUp(email, password, fullName) {
    if (!window.formaSupabase?.client) {
      if (window.openSupabaseConfigModal) window.openSupabaseConfigModal();
      return { 
        success: false, 
        message: 'Database not connected. Please enter your Supabase Anon Key in the opened settings modal.' 
      };
    }
    try {
      const { data, error } = await window.formaSupabase.client.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName ? fullName.trim() : 'FORMA Athlete'
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) return { success: false, message: error.message };
      return {
        success: true,
        user: data.user,
        session: data.session,
        message: data.session 
          ? 'Registration successful! Logged in.' 
          : 'Registration successful! Please check your email to confirm your account.'
      };
    } catch (e) {
      return { success: false, message: e.message || 'Error creating account' };
    }
  }

  async signIn(email, password) {
    if (!window.formaSupabase?.client) {
      if (window.openSupabaseConfigModal) window.openSupabaseConfigModal();
      return { 
        success: false, 
        message: 'Database not connected. Please enter your Supabase Anon Key in the opened settings modal.' 
      };
    }
    try {
      const { data, error } = await window.formaSupabase.client.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) return { success: false, message: error.message };
      this.currentSession = data.session;
      this.currentUser = data.user;
      return { success: true, user: data.user, session: data.session };
    } catch (e) {
      return { success: false, message: e.message || 'Error signing in' };
    }
  }

  async signOut() {
    if (!window.formaSupabase?.client) return;
    try {
      await window.formaSupabase.client.auth.signOut();
      this.currentUser = null;
      this.currentSession = null;
      this.updateUserUI(null);
      if (window.triggerToast) window.triggerToast('✓ Signed out successfully');
    } catch (e) {
      console.error('[FormaAuth] Sign out error:', e);
    }
  }

  async resetPassword(email) {
    if (!window.formaSupabase?.client) {
      return { success: false, message: 'Supabase client is not connected' };
    }
    try {
      const { error } = await window.formaSupabase.client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Password reset link sent to your email.' };
    } catch (e) {
      return { success: false, message: e.message || 'Error requesting password reset' };
    }
  }

  // --- UI INTEGRATION HELPERS ---

  updateUserUI(user) {
    const authBtn = document.getElementById('headerAuthBtn');
    const userEmailSpan = document.getElementById('headerUserEmail');
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (user) {
      const name = user.user_metadata?.full_name || user.email.split('@')[0];
      const initial = name.charAt(0).toUpperCase();

      if (authBtn) {
        authBtn.innerHTML = `
          <span style="font-size: 0.72rem; color: #10B981; font-weight: 700; letter-spacing: 0.08em;">ATHLETE: ${name.toUpperCase()}</span>
          <span class="auth-logout-chip" onclick="event.stopPropagation(); window.formaAuth.signOut()" title="Sign Out">✕</span>
        `;
        authBtn.className = 'auth-pill authenticated';
      }
      if (sidebarName) sidebarName.innerText = name;
      if (sidebarAvatar) sidebarAvatar.innerText = initial;
    } else {
      if (authBtn) {
        authBtn.innerHTML = `
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span>
          <span style="font-size: 0.72rem; color: #D1D5DB; font-weight: 700; letter-spacing: 0.08em;">SIGN IN / REGISTER</span>
        `;
        authBtn.className = 'auth-pill unauthenticated';
      }
      if (sidebarName) sidebarName.innerText = 'Athlete User';
      if (sidebarAvatar) sidebarAvatar.innerText = 'A';
    }
  }
}

// Global Instance
window.formaAuth = new FormaAuthService();

// --- AUTH MODAL CONTROLLER ---
window.openAuthModal = function(initialTab = 'signin') {
  const modal = document.getElementById('formaAuthModal');
  if (!modal) return;
  window.switchAuthTab(initialTab);
  modal.classList.add('active');
};

window.closeAuthModal = function() {
  document.getElementById('formaAuthModal')?.classList.remove('active');
};

window.switchAuthTab = function(tabName) {
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.auth-tab-content').forEach(view => {
    view.style.display = view.id === `authTab-${tabName}` ? 'block' : 'none';
  });
  const errBox = document.getElementById('authStatusMessage');
  if (errBox) errBox.innerHTML = '';
};

// Form Handlers
window.handleSignInSubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('authSignInEmail').value;
  const pass = document.getElementById('authSignInPassword').value;
  const statusMsg = document.getElementById('authStatusMessage');

  statusMsg.innerHTML = '<span style="color: #38BDF8;">Authenticating athlete...</span>';
  const res = await window.formaAuth.signIn(email, pass);

  if (res.success) {
    statusMsg.innerHTML = '<span style="color: #10B981;">✓ Login successful! Connecting sync engine...</span>';
    setTimeout(() => {
      window.closeAuthModal();
      if (window.triggerToast) window.triggerToast(`Welcome back, ${res.user.email}`);
    }, 800);
  } else {
    statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
  }
};

window.handleSignUpSubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('authSignUpName').value;
  const email = document.getElementById('authSignUpEmail').value;
  const pass = document.getElementById('authSignUpPassword').value;
  const statusMsg = document.getElementById('authStatusMessage');

  statusMsg.innerHTML = '<span style="color: #38BDF8;">Registering new hunter account...</span>';
  const res = await window.formaAuth.signUp(email, pass, name);

  if (res.success) {
    statusMsg.innerHTML = `<span style="color: #10B981;">✓ ${res.message}</span>`;
    setTimeout(() => {
      window.closeAuthModal();
      if (window.triggerToast) window.triggerToast('Account registered successfully!');
    }, 1500);
  } else {
    statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
  }
};

window.handleResetPasswordSubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('authResetEmail').value;
  const statusMsg = document.getElementById('authStatusMessage');

  statusMsg.innerHTML = '<span style="color: #38BDF8;">Sending reset link...</span>';
  const res = await window.formaAuth.resetPassword(email);

  if (res.success) {
    statusMsg.innerHTML = `<span style="color: #10B981;">✓ ${res.message}</span>`;
  } else {
    statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
  }
};

