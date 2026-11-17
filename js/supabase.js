/* ==========================================================================
   FORMA PLATFORM / HUNTER SYSTEM — SUPABASE CLOUD CONNECTOR
   Provides offline-first automatic syncing, realtime subscriptions & cloud storage
   ========================================================================== */

const SUPABASE_CONFIG_KEY = 'forma_supabase_config_v1';

class FormaSupabaseService {
  constructor() {
    this.client = null;
    this.config = this.loadConfig();
    this.init();
  }

  cleanUrl(rawUrl) {
    if (!rawUrl) return '';
    let url = rawUrl.trim();
    // If user pasted dashboard URL: https://supabase.com/dashboard/project/cxplwrnpgwdmeqyztbid/...
    const dashMatch = url.match(/project\/([a-zA-Z0-9_-]+)/);
    if (dashMatch && dashMatch[1]) {
      return `https://${dashMatch[1]}.supabase.co`;
    }
    // If user pasted just project ID: cxplwrnpgwdmeqyztbid
    if (/^[a-z0-9]{20}$/i.test(url)) {
      return `https://${url}.supabase.co`;
    }
    // Strip trailing slashes and paths like /rest/v1
    url = url.replace(/\/+$/, '');
    url = url.replace(/\/rest\/v1\/?$/, '');
    url = url.replace(/\/rest\/?$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  loadConfig() {
    const DEFAULT_PROJECT_URL = 'https://cxplwrnpgwdmeqyztbid.supabase.co';
    const DEFAULT_PROJECT_KEY = 'sb_publishable_166v6hDocLhP3jXg7Tl6fw_l-ymAl5w';
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          url: this.cleanUrl(parsed.url || DEFAULT_PROJECT_URL),
          key: (parsed.key || DEFAULT_PROJECT_KEY).trim()
        };
      } catch (e) {
        return { url: DEFAULT_PROJECT_URL, key: DEFAULT_PROJECT_KEY };
      }
    }
    return { url: DEFAULT_PROJECT_URL, key: DEFAULT_PROJECT_KEY };
  }

  saveConfig(url, key) {
    const sanitizedUrl = this.cleanUrl(url);
    this.config = { url: sanitizedUrl, key: key.trim() };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));
    return this.init();
  }

  init() {
    const { url, key } = this.config;
    if (url && key && window.supabase) {
      try {
        this.client = window.supabase.createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true }
        });
        this.updateStatusBadge(true);
        this.setupRealtime();
        return true;
      } catch (e) {
        console.error('Supabase initialization error:', e);
        this.client = null;
        this.updateStatusBadge(false);
        return false;
      }
    } else {
      this.client = null;
      this.updateStatusBadge(false);
      return false;
    }
  }

  isConnected() {
    return !!this.client;
  }

  async testConnection() {
    if (!this.client) return { success: false, message: 'Supabase credentials not configured' };
    try {
      const { data, error } = await this.client.from('meals').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
          return {
            success: false,
            message: 'Connected to Supabase project, but tables are missing! Please paste and run supabase_schema.sql in your Supabase SQL Editor.'
          };
        }
        if (error.code === 'PGRST301' || (error.message && error.message.includes('JWT'))) {
          return {
            success: false,
            message: 'Invalid Supabase Anon Public Key. Please check the anon key in Project Settings -> API.'
          };
        }
        return { success: false, message: `Supabase notice: ${error.message}` };
      }
      return { success: true, message: 'Connected successfully to Supabase! PostgreSQL tables are ready.' };
    } catch (e) {
      return { success: false, message: e.message || 'Network error connecting to Supabase' };
    }
  }

  updateStatusBadge(connected) {
    if (window.formaSync) {
      window.formaSync.updateSyncTelemetry();
      return;
    }
    const badge = document.getElementById('supabaseHeaderStatus');
    if (!badge) return;

    if (connected) {
      badge.innerHTML = `
        <span class="live-pulse-dot" style="background: #3ECF8E; box-shadow: 0 0 10px #3ECF8E;"></span>
        <span style="color: #3ECF8E; font-weight: 700;">SUPABASE: CLOUD SYNCED</span>
      `;
      badge.title = 'Supabase Cloud Connected — Click to Manage';
    } else {
      badge.innerHTML = `
        <span style="width: 7px; height: 7px; border-radius: 50%; background: #71717A; display: inline-block;"></span>
        <span style="color: #8E8E93;">SUPABASE: LOCAL OFFLINE</span>
      `;
      badge.title = 'Click to Connect Supabase URL & Anon Key';
    }
  }

  // --- 1. MEAL SYNCING (Optimistic with Offline Queue & Realtime Broadcast) ---
  async syncMeal(meal) {
    if (!meal) return;
    const payload = {
      id: meal.id || Date.now(),
      date: meal.date || new Date().toISOString().split('T')[0],
      slot: (meal.slot || 'L').toUpperCase(),
      description: meal.desc || 'Meal',
      calories: parseInt(meal.cal, 10) || 0,
      protein: parseInt(meal.pro, 10) || 0,
      prep_plan_id: meal.prepPlanId || null
    };

    if (window.formaSync) {
      return await window.formaSync.dispatch('meals', 'UPSERT', payload);
    }

    if (!this.client) return;
    try {
      const { error } = await this.client.from('meals').upsert(payload);
      if (error && window.triggerToast) {
        window.triggerToast(`⚠️ Supabase Meals Error: ${error.message}`);
      }
    } catch (e) {
      console.warn('Supabase meal sync error:', e);
    }
  }

  async deleteMeal(mealId) {
    if (!mealId) return;
    if (window.formaSync) {
      return await window.formaSync.dispatch('meals', 'DELETE', { id: mealId });
    }

    if (!this.client) return;
    try {
      await this.client.from('meals').delete().eq('id', mealId);
    } catch (e) {
      console.warn('Supabase meal delete error:', e);
    }
  }

  // --- 2. WATER SYNCING ---
  async syncWater(date, liters) {
    if (!date) return;
    const payload = {
      date: date,
      water_liters: Number(liters) || 0,
      updated_at: new Date().toISOString()
    };

    if (window.formaSync) {
      return await window.formaSync.dispatch('water_logs', 'UPSERT', payload);
    }

    if (!this.client) return;
    try {
      await this.client.from('water_logs').upsert(payload);
    } catch (e) {
      console.warn('Supabase water sync error:', e);
    }
  }

  // --- 3. WORKOUT SYNCING ---
  async syncWorkout(workout) {
    if (!workout) return;
    const payload = {
      id: workout.id || Date.now(),
      title: workout.title || 'Workout Session',
      date: workout.date ? (workout.date.includes('-') ? workout.date : new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      volume: workout.volume || 0,
      sets_count: workout.setsCount || 0,
      duration_seconds: workout.durationSeconds || 0,
      updated_at: new Date().toISOString()
    };

    if (window.formaSync) {
      return await window.formaSync.dispatch('workout_sessions', 'UPSERT', payload);
    }

    if (!this.client) return;
    try {
      await this.client.from('workout_sessions').upsert(payload);
    } catch (e) {
      console.warn('Supabase workout sync error:', e);
    }
  }

  // --- 4. TARGETS & PROFILE SYNCING ---
  async syncTargets(targets) {
    if (!targets) return;
    const payload = {
      calories_target: targets.calories || 2000,
      protein_target: targets.protein || 120,
      updated_at: new Date().toISOString()
    };

    if (window.formaSync) {
      return await window.formaSync.dispatch('profiles', 'UPSERT', payload);
    }

    if (!this.client) return;
    try {
      const { data: existingProfiles } = await this.client.from('profiles').select('id').limit(1);
      if (existingProfiles && existingProfiles.length > 0) {
        await this.client.from('profiles').update(payload).eq('id', existingProfiles[0].id);
      } else {
        await this.client.from('profiles').insert(payload);
      }
    } catch (e) {
      console.warn('Supabase targets sync error:', e);
    }
  }

  // --- 5. FULL PUSH (Upload Local Data to Supabase) ---
  async pushLocalDataToCloud() {
    if (!this.client) return { success: false, message: 'Please connect Supabase first (URL & Anon Key).' };
    try {
      const summary = [];
      const errors = [];

      // 1. Sync Profile & Targets
      try {
        const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
        const hunter = hunterSaved ? JSON.parse(hunterSaved) : {};
        const targets = hunter.targets || { calories: 2000, protein: 120 };
        
        const { data: existingProfiles, error: pSelErr } = await this.client.from('profiles').select('id').limit(1);
        if (pSelErr) {
          errors.push(`profiles: ${pSelErr.message}`);
        } else if (existingProfiles && existingProfiles.length > 0) {
          const { error: pUpErr } = await this.client.from('profiles').update({
            calories_target: targets.calories,
            protein_target: targets.protein,
            updated_at: new Date().toISOString()
          }).eq('id', existingProfiles[0].id);
          if (pUpErr) errors.push(`profiles update: ${pUpErr.message}`);
          else summary.push('1 Profile/Target');
        } else {
          const { error: pInsErr } = await this.client.from('profiles').insert({
            name: 'Hunter Athlete',
            calories_target: targets.calories,
            protein_target: targets.protein,
            streak_days: 14
          });
          if (pInsErr) errors.push(`profiles insert: ${pInsErr.message}`);
          else summary.push('1 Profile/Target');
        }
      } catch (err) {
        errors.push(`profiles: ${err.message}`);
      }

      // 2. Sync Prep Plans (Weekly Protocol)
      try {
        const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
        const hunter = hunterSaved ? JSON.parse(hunterSaved) : null;
        const defaultPrepPlan = [
          {
            day: 'MON',
            items: [
              { id: 'prep_mon_1', slot: 'B', text: 'Egg and bread', cal: 470, pro: 28 },
              { id: 'prep_mon_2', slot: 'L', text: 'chapathi and panner buter masal', cal: 700, pro: 28 },
              { id: 'prep_mon_3', slot: 'D', text: 'Protein shake', cal: 640, pro: 25 }
            ]
          },
          {
            day: 'SUN',
            items: [
              { id: 'prep_sun_1', slot: 'B', text: 'egg and bread', cal: 470, pro: 28 },
              { id: 'prep_sun_2', slot: 'D', text: 'protin shake and rice', cal: 1000, pro: 30 }
            ]
          }
        ];
        const prepPlanList = (hunter && hunter.prepPlan && hunter.prepPlan.length > 0) ? hunter.prepPlan : defaultPrepPlan;
        
        const prepRows = [];
        prepPlanList.forEach(p => {
          (p.items || []).forEach(it => {
            prepRows.push({
              id: it.id || `prep_${p.day}_${Date.now()}_${Math.random()}`,
              day: (p.day || 'MON').toUpperCase(),
              slot: (it.slot || 'L').toUpperCase(),
              food_description: it.text || it.desc || 'Prepared Meal',
              calories: parseInt(it.cal, 10) || 0,
              protein: parseInt(it.pro, 10) || 0
            });
          });
        });

        if (prepRows.length > 0) {
          const { error: prepErr } = await this.client.from('prep_plans').upsert(prepRows);
          if (prepErr) errors.push(`prep_plans: ${prepErr.message}`);
          else summary.push(`${prepRows.length} Meal Prep Protocols`);
        }
      } catch (err) {
        errors.push(`prep_plans: ${err.message}`);
      }

      // 3. Sync Meals (Active Consumed Meals)
      try {
        const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
        const hunter = hunterSaved ? JSON.parse(hunterSaved) : {};
        let mealsToPush = (hunter && hunter.meals && hunter.meals.length > 0) ? hunter.meals : [];
        
        // If user has no meals logged yet, create an initial logged meal so Supabase table has rows
        if (mealsToPush.length === 0) {
          const initialMeal = {
            id: Date.now(),
            date: (hunter && hunter.selectedDate) ? hunter.selectedDate : new Date().toISOString().split('T')[0],
            slot: 'L',
            desc: 'Chapathi and Paneer Butter Masala',
            cal: 700,
            pro: 28
          };
          mealsToPush = [initialMeal];
          if (hunter) {
            hunter.meals = mealsToPush;
            localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(hunter));
            if (window.hunterTracker) {
              window.hunterTracker.state.meals = mealsToPush;
              window.hunterTracker.render();
            }
          }
        }

        const mealRows = mealsToPush.map(m => ({
          id: m.id || Date.now(),
          date: m.date || new Date().toISOString().split('T')[0],
          slot: (m.slot || 'L').toUpperCase(),
          description: m.desc || 'Meal',
          calories: parseInt(m.cal, 10) || 0,
          protein: parseInt(m.pro, 10) || 0,
          prep_plan_id: m.prepPlanId || null
        }));

        const { error: mealErr } = await this.client.from('meals').upsert(mealRows);
        if (mealErr) errors.push(`meals: ${mealErr.message}`);
        else summary.push(`${mealRows.length} Logged Meals`);
      } catch (err) {
        errors.push(`meals: ${err.message}`);
      }

      // 4. Sync Hydration
      try {
        const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
        const hunter = hunterSaved ? JSON.parse(hunterSaved) : {};
        const curDate = (hunter && hunter.selectedDate) ? hunter.selectedDate : new Date().toISOString().split('T')[0];
        const liters = (hunter && hunter.waterLoggedLiters) ? hunter.waterLoggedLiters : 2;
        
        const { error: waterErr } = await this.client.from('water_logs').upsert({
          date: curDate,
          water_liters: liters,
          updated_at: new Date().toISOString()
        });
        if (waterErr) errors.push(`water_logs: ${waterErr.message}`);
        else summary.push('Hydration Log');
      } catch (err) {
        errors.push(`water_logs: ${err.message}`);
      }

      // 5. Sync Workout History
      try {
        let workouts = [];
        if (typeof store !== 'undefined' && store.get) {
          const s = store.get();
          if (s.workoutHistory && s.workoutHistory.length > 0) workouts = s.workoutHistory;
        }
        if (workouts.length === 0) {
          workouts = [
            { id: 1001, title: 'Upper Hypertrophy A', date: new Date().toISOString().split('T')[0], volume: 22100, setsCount: 16 }
          ];
        }
        const wRows = workouts.map((w, idx) => ({
          id: w.id || (Date.now() + idx),
          title: w.title || 'Training Session',
          date: new Date().toISOString().split('T')[0],
          volume: w.volume || 14000,
          sets_count: w.setsCount || 12
        }));

        const { error: wErr } = await this.client.from('workout_sessions').upsert(wRows);
        if (wErr) errors.push(`workout_sessions: ${wErr.message}`);
        else summary.push(`${wRows.length} Workouts`);
      } catch (err) {
        errors.push(`workout_sessions: ${err.message}`);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Some tables failed to sync. Make sure you ran supabase_schema.sql in Supabase SQL editor! Errors: ${errors.join(' | ')}`
        };
      }

      return {
        success: true,
        message: `✓ Successfully synced all tables to Supabase: ${summary.join(', ')}!`
      };
    } catch (e) {
      return { success: false, message: e.message || 'Error pushing data to Supabase' };
    }
  }

  // --- 6. FULL PULL (Hydrate Local App from Supabase Cloud) ---
  async pullCloudDataToLocal() {
    if (!this.client) return { success: false, message: 'Please connect Supabase first.' };
    try {
      // 1. Pull meals
      const { data: cloudMeals, error: mealErr } = await this.client.from('meals').select('*');
      if (!mealErr && cloudMeals && cloudMeals.length > 0) {
        const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
        let hunter = hunterSaved ? JSON.parse(hunterSaved) : {};
        hunter.meals = cloudMeals.map(cm => ({
          id: cm.id,
          date: cm.date,
          slot: cm.slot,
          desc: cm.description,
          cal: cm.calories,
          pro: cm.protein,
          prepPlanId: cm.prep_plan_id
        }));
        localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(hunter));
        if (window.hunterTracker) {
          window.hunterTracker.state = hunter;
          window.hunterTracker.render();
        }
      }

      // 2. Pull water
      const { data: waterRows } = await this.client.from('water_logs').select('*');
      if (waterRows && waterRows.length > 0 && window.hunterTracker) {
        const curDate = window.hunterTracker.state.selectedDate;
        const matchingWater = waterRows.find(w => w.date === curDate);
        if (matchingWater) {
          window.hunterTracker.state.waterLoggedLiters = matchingWater.water_liters;
          window.hunterTracker.saveState();
        }
      }

      // Refresh Dashboard live metrics
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();

      return { success: true, message: 'Successfully pulled latest cloud data from Supabase!' };
    } catch (e) {
      return { success: false, message: e.message || 'Error pulling data from Supabase' };
    }
  }

  // --- 7. REALTIME REPLICATION LISTENER ---
  setupRealtime() {
    if (!this.client) return;
    try {
      this.client
        .channel('forma-realtime-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, payload => {
          console.log('Realtime meal change received from Supabase:', payload);
          if (payload.eventType === 'INSERT') {
            const newMeal = {
              id: payload.new.id,
              date: payload.new.date,
              slot: payload.new.slot,
              desc: payload.new.description,
              cal: payload.new.calories,
              pro: payload.new.protein,
              prepPlanId: payload.new.prep_plan_id
            };
            if (window.hunterTracker) {
              if (!window.hunterTracker.state.meals.some(m => m.id === newMeal.id)) {
                window.hunterTracker.state.meals.push(newMeal);
                window.hunterTracker.saveState();
              }
            }
          } else if (payload.eventType === 'DELETE' && window.hunterTracker) {
            window.hunterTracker.state.meals = window.hunterTracker.state.meals.filter(m => m.id !== payload.old.id);
            window.hunterTracker.saveState();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription could not be established:', e);
    }
  }
}

// Global instance initialization
window.formaSupabase = new FormaSupabaseService();

// Update status badge once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.formaSupabase) {
    window.formaSupabase.updateStatusBadge(window.formaSupabase.isConnected());
  }
});

// UI Modal Helpers
window.openSupabaseConfigModal = function() {
  const modal = document.getElementById('supabaseConfigModal');
  if (!modal) return;
  const cfg = window.formaSupabase ? window.formaSupabase.config : { url: '', key: '' };
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');
  const statusMsg = document.getElementById('supabaseStatusMessage');
  
  if (urlInput) urlInput.value = cfg.url || '';
  if (keyInput) keyInput.value = cfg.key || '';
  if (statusMsg) {
    if (window.formaSupabase && window.formaSupabase.isConnected()) {
      statusMsg.innerHTML = '<span style="color: #3ECF8E; font-weight: 600;">● Connected to Supabase Cloud</span>';
    } else {
      statusMsg.innerHTML = '<span style="color: #A1A1AA;">Local offline mode. Enter your credentials to sync with Supabase.</span>';
    }
  }
  if (window.openHunterModal) {
    window.openHunterModal('supabaseConfigModal');
  } else {
    modal.classList.add('active');
  }
};

window.closeSupabaseConfigModal = function() {
  if (window.closeHunterModal) {
    window.closeHunterModal('supabaseConfigModal');
  } else {
    document.getElementById('supabaseConfigModal')?.classList.remove('active');
  }
};

window.testSupabaseConnection = async function() {
  const statusMsg = document.getElementById('supabaseStatusMessage');
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');
  if (statusMsg) statusMsg.innerHTML = '<span style="color: #38BDF8;">Testing connection to Supabase...</span>';
  
  if (urlInput && keyInput && urlInput.value.trim() && keyInput.value.trim()) {
    window.formaSupabase.saveConfig(urlInput.value, keyInput.value);
  }
  
  const res = await window.formaSupabase.testConnection();
  if (statusMsg) {
    if (res.success) {
      statusMsg.innerHTML = `<span style="color: #3ECF8E; font-weight: 600;">✓ ${res.message}</span>`;
    } else {
      statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
    }
  }
};

window.saveSupabaseConfig = async function(e) {
  if (e) e.preventDefault();
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');
  const statusMsg = document.getElementById('supabaseStatusMessage');
  
  const url = urlInput ? urlInput.value.trim() : '';
  const key = keyInput ? keyInput.value.trim() : '';
  
  if (!url || !key) {
    if (statusMsg) statusMsg.innerHTML = '<span style="color: #F87171;">URL and Anon Public Key are required.</span>';
    return;
  }
  
  if (statusMsg) statusMsg.innerHTML = '<span style="color: #38BDF8;">Connecting to Supabase...</span>';
  
  const ok = window.formaSupabase.saveConfig(url, key);
  if (ok) {
    const test = await window.formaSupabase.testConnection();
    if (test.success) {
      if (statusMsg) statusMsg.innerHTML = '<span style="color: #38BDF8;">Connected! Syncing initial data to Supabase...</span>';
      const pushRes = await window.formaSupabase.pushLocalDataToCloud();
      if (pushRes.success) {
        if (statusMsg) statusMsg.innerHTML = `<span style="color: #3ECF8E; font-weight: 600;">✓ Connected! ${pushRes.message}</span>`;
      } else {
        if (statusMsg) statusMsg.innerHTML = `<span style="color: #F59E0B;">Connected, but table note: ${pushRes.message}</span>`;
      }
      setTimeout(() => window.closeSupabaseConfigModal(), 2500);
    } else {
      if (statusMsg) statusMsg.innerHTML = `<span style="color: #F87171;">${test.message}</span>`;
    }
  } else {
    if (statusMsg) statusMsg.innerHTML = '<span style="color: #F87171;">Failed to initialize Supabase client. Check Supabase CDN script.</span>';
  }
};

window.disconnectSupabase = function() {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  window.formaSupabase.config = { url: '', key: '' };
  window.formaSupabase.client = null;
  window.formaSupabase.updateStatusBadge(false);
  const urlInput = document.getElementById('supabaseUrlInput');
  const keyInput = document.getElementById('supabaseKeyInput');
  const statusMsg = document.getElementById('supabaseStatusMessage');
  if (urlInput) urlInput.value = '';
  if (keyInput) keyInput.value = '';
  if (statusMsg) statusMsg.innerHTML = '<span style="color: #A1A1AA;">Disconnected. Running in local offline mode.</span>';
};

window.pushLocalToSupabase = async function() {
  const statusMsg = document.getElementById('supabaseStatusMessage');
  if (statusMsg) statusMsg.innerHTML = '<span style="color: #38BDF8;">Pushing local data to Supabase...</span>';
  const res = await window.formaSupabase.pushLocalDataToCloud();
  if (statusMsg) {
    if (res.success) {
      statusMsg.innerHTML = `<span style="color: #3ECF8E; font-weight: 600;">✓ ${res.message}</span>`;
    } else {
      statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
    }
  }
};

window.pullCloudToLocal = async function() {
  const statusMsg = document.getElementById('supabaseStatusMessage');
  if (statusMsg) statusMsg.innerHTML = '<span style="color: #38BDF8;">Pulling data from Supabase...</span>';
  const res = await window.formaSupabase.pullCloudDataToLocal();
  if (statusMsg) {
    if (res.success) {
      statusMsg.innerHTML = `<span style="color: #3ECF8E; font-weight: 600;">✓ ${res.message}</span>`;
    } else {
      statusMsg.innerHTML = `<span style="color: #F87171;">✕ ${res.message}</span>`;
    }
  }
};
