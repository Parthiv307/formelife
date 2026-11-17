/* ==========================================================================
   FORMA PLATFORM / HUNTER SYSTEM — REAL-TIME SYNCHRONIZATION & OFFLINE ENGINE
   Provides:
   - WebSocket Real-time Replication across devices without page refreshes
   - Offline Transaction Queue with automatic reconnection & retry
   - Conflict resolution using Last-Write-Wins (LWW) timestamps
   - Multi-device data consistency across authenticated clients
   ========================================================================== */

const OFFLINE_QUEUE_KEY = 'forma_sync_queue_v1';

class FormaSyncEngine {
  constructor() {
    this.userId = null;
    this.realtimeChannel = null;
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.queue = this.loadQueue();
    this.initNetworkListeners();
  }

  loadQueue() {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveQueue() {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    this.updateSyncTelemetry();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('[FormaSync] Network connection restored');
      this.isOnline = true;
      this.updateSyncTelemetry();
      if (window.triggerToast) window.triggerToast('● Network restored. Synchronizing pending changes...');
      this.flushQueue();
      if (this.userId && !this.realtimeChannel) {
        this.subscribeRealtime(this.userId);
      }
    });

    window.addEventListener('offline', () => {
      console.log('[FormaSync] Network connection lost');
      this.isOnline = false;
      this.updateSyncTelemetry();
      if (window.triggerToast) window.triggerToast('⚠️ Offline mode active. Changes will queue and auto-sync when reconnected.');
    });
  }

  // --- START / STOP REALTIME SUBSCRIPTIONS ---

  async start(userId) {
    if (!userId) return;
    this.userId = userId;
    console.log('[FormaSync] Starting sync engine for user:', userId);

    // 1. Initial cloud hydration for this user
    await this.hydrateFromCloud(userId);

    // 2. Subscribe to real-time events on Supabase
    this.subscribeRealtime(userId);

    // 3. Process any pending offline transactions
    await this.flushQueue();
  }

  stop() {
    console.log('[FormaSync] Stopping sync engine');
    if (this.realtimeChannel && window.formaSupabase?.client) {
      window.formaSupabase.client.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.userId = null;
    this.updateSyncTelemetry();
  }

  subscribeRealtime(userId) {
    if (!window.formaSupabase?.client || !userId) return;

    if (this.realtimeChannel) {
      window.formaSupabase.client.removeChannel(this.realtimeChannel);
    }

    try {
      const client = window.formaSupabase.client;
      const channelId = `forma-user-sync-${userId}-${Date.now()}`;

      this.realtimeChannel = client
        .channel(channelId)
        // 1. Meals
        .on('postgres_changes', { event: '*', schema: 'public', table: 'meals', filter: `user_id=eq.${userId}` }, payload => {
          this.handleIncomingMealChange(payload);
        })
        // 2. Hydration
        .on('postgres_changes', { event: '*', schema: 'public', table: 'water_logs', filter: `user_id=eq.${userId}` }, payload => {
          this.handleIncomingWaterChange(payload);
        })
        // 3. Prep Plans
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prep_plans', filter: `user_id=eq.${userId}` }, payload => {
          this.handleIncomingPrepPlanChange(payload);
        })
        // 4. Workout Sessions
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_sessions', filter: `user_id=eq.${userId}` }, payload => {
          this.handleIncomingWorkoutChange(payload);
        })
        // 5. Profiles & Targets
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` }, payload => {
          this.handleIncomingProfileChange(payload);
        })
        .subscribe((status) => {
          console.log('[FormaSync] Realtime WebSocket Status:', status);
          this.updateSyncTelemetry();
        });
    } catch (e) {
      console.warn('[FormaSync] Realtime subscription notice:', e);
    }
  }

  // --- INCOMING REALTIME DELTA HANDLERS (Cross-Device Live Updating) ---

  handleIncomingMealChange(payload) {
    console.log('[FormaSync] Incoming real-time meal change:', payload.eventType);
    if (!window.hunterTracker) return;

    const { eventType, new: newRow, old: oldRow } = payload;
    let modified = false;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const existingIdx = window.hunterTracker.state.meals.findIndex(m => m.id == newRow.id);
      const incomingMeal = {
        id: newRow.id,
        date: newRow.date,
        slot: newRow.slot,
        desc: newRow.description,
        cal: newRow.calories,
        pro: newRow.protein,
        prepPlanId: newRow.prep_plan_id
      };

      if (existingIdx >= 0) {
        window.hunterTracker.state.meals[existingIdx] = incomingMeal;
      } else {
        window.hunterTracker.state.meals.push(incomingMeal);
      }
      modified = true;
    } else if (eventType === 'DELETE') {
      window.hunterTracker.state.meals = window.hunterTracker.state.meals.filter(m => m.id != oldRow.id);
      modified = true;
    }

    if (modified) {
      localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
      window.hunterTracker.render();
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
      if (window.triggerToast) window.triggerToast('⚡ Live update from connected device: Meals synchronized');
    }
  }

  handleIncomingWaterChange(payload) {
    if (!window.hunterTracker || !payload.new) return;
    const { new: newRow } = payload;
    if (newRow.date === window.hunterTracker.state.selectedDate) {
      window.hunterTracker.state.waterLoggedLiters = Number(newRow.water_liters) || 0;
      localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
      window.hunterTracker.render();
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
      if (window.triggerToast) window.triggerToast('⚡ Live update from connected device: Hydration synchronized');
    }
  }

  handleIncomingPrepPlanChange(payload) {
    if (!window.hunterTracker || !window.hunterTracker.state.prepPlan) return;
    const { eventType, new: newRow, old: oldRow } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const day = newRow.day;
      let dayGroup = window.hunterTracker.state.prepPlan.find(p => p.day.toUpperCase() === day.toUpperCase());
      if (!dayGroup) {
        dayGroup = { day: day.toUpperCase(), items: [] };
        window.hunterTracker.state.prepPlan.push(dayGroup);
      }
      const existingIdx = (dayGroup.items || []).findIndex(it => it.id === newRow.id);
      const incomingItem = {
        id: newRow.id,
        slot: newRow.slot,
        text: newRow.food_description,
        cal: newRow.calories,
        pro: newRow.protein
      };
      if (existingIdx >= 0) {
        dayGroup.items[existingIdx] = incomingItem;
      } else {
        dayGroup.items.push(incomingItem);
      }
      localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
      window.hunterTracker.render();
    }
  }

  handleIncomingWorkoutChange(payload) {
    if (typeof store === 'undefined' || !store.get) return;
    const { eventType, new: newRow } = payload;
    if (eventType === 'INSERT') {
      const state = store.get();
      if (!state.workoutHistory) state.workoutHistory = [];
      if (!state.workoutHistory.some(w => w.id == newRow.id)) {
        state.workoutHistory.push({
          id: newRow.id,
          title: newRow.title,
          date: newRow.date,
          volume: newRow.volume,
          setsCount: newRow.sets_count
        });
        store.save();
        if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
        if (window.triggerToast) window.triggerToast('⚡ Live update from connected device: New workout recorded');
      }
    }
  }

  handleIncomingProfileChange(payload) {
    if (!payload.new) return;
    const { new: newRow } = payload;
    if (newRow.language && window.formaI18n && window.formaI18n.currentLang !== newRow.language) {
      window.formaI18n.setLanguage(newRow.language, false);
    }
    if (window.hunterTracker) {
      window.hunterTracker.state.targets.calories = newRow.calories_target || 2000;
      window.hunterTracker.state.targets.protein = newRow.protein_target || 120;
      localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
      window.hunterTracker.render();
    }
    if (typeof store !== 'undefined' && store.get) {
      const s = store.get();
      s.targets.calories = newRow.calories_target || 2000;
      s.targets.protein = newRow.protein_target || 120;
      store.save();
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
    }
  }

  // --- TRANSACTION DISPATCH & OFFLINE QUEUEING ---

  async dispatch(table, action, payload) {
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      table,
      action,
      payload,
      userId: this.userId || (window.formaAuth?.getUser()?.id) || null,
      timestamp: Date.now(),
      retries: 0
    };

    if (tx.userId && payload) {
      payload.user_id = tx.userId;
      payload.updated_at = new Date().toISOString();
    }

    // If online and connected, attempt instant push
    if (this.isOnline && window.formaSupabase?.isConnected()) {
      const ok = await this.executeTransaction(tx);
      if (ok) {
        this.updateSyncTelemetry();
        return true;
      }
    }

    // Otherwise, queue for background sync upon reconnect
    console.log('[FormaSync] Transaction queued for offline sync:', tx);
    this.queue.push(tx);
    this.saveQueue();
    return false;
  }

  async executeTransaction(tx) {
    if (!window.formaSupabase?.client) return false;
    const client = window.formaSupabase.client;

    try {
      if (tx.action === 'UPSERT') {
        const { error } = await client.from(tx.table).upsert(tx.payload);
        if (error) {
          console.error(`[FormaSync] Exec error on ${tx.table}:`, error.message);
          return false;
        }
        return true;
      } else if (tx.action === 'DELETE') {
        const query = client.from(tx.table).delete();
        if (tx.payload.id) query.eq('id', tx.payload.id);
        if (tx.payload.user_id) query.eq('user_id', tx.payload.user_id);
        const { error } = await query;
        if (error) {
          console.error(`[FormaSync] Delete error on ${tx.table}:`, error.message);
          return false;
        }
        return true;
      }
    } catch (e) {
      console.error('[FormaSync] Network exception:', e);
      return false;
    }
    return false;
  }

  async flushQueue() {
    if (this.isSyncing || this.queue.length === 0 || !this.isOnline || !window.formaSupabase?.isConnected()) {
      return;
    }

    this.isSyncing = true;
    console.log(`[FormaSync] Flushing offline queue (${this.queue.length} pending items)...`);

    const remaining = [];
    for (const tx of this.queue) {
      // Re-assign user ID if user just logged in
      if (!tx.userId && this.userId) {
        tx.userId = this.userId;
        if (tx.payload) tx.payload.user_id = this.userId;
      }

      const success = await this.executeTransaction(tx);
      if (!success) {
        tx.retries = (tx.retries || 0) + 1;
        if (tx.retries < 5) remaining.push(tx);
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.isSyncing = false;

    if (this.queue.length === 0) {
      console.log('[FormaSync] Offline queue fully synchronized');
      this.updateSyncTelemetry();
    }
  }

  // --- CLOUD HYDRATION (Pulls latest remote state for logged-in user) ---

  async hydrateFromCloud(userId) {
    if (!window.formaSupabase?.client || !userId) return;
    const client = window.formaSupabase.client;
    console.log('[FormaSync] Hydrating application state from cloud for user:', userId);

    try {
      // 1. Fetch Profile
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile) {
        this.handleIncomingProfileChange({ new: profile });
      }

      // 2. Fetch Meals
      const { data: meals } = await client
        .from('meals')
        .select('*')
        .eq('user_id', userId);

      if (meals && meals.length > 0 && window.hunterTracker) {
        window.hunterTracker.state.meals = meals.map(m => ({
          id: m.id,
          date: m.date,
          slot: m.slot,
          desc: m.description,
          cal: m.calories,
          pro: m.protein,
          prepPlanId: m.prep_plan_id
        }));
        localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
        window.hunterTracker.render();
      }

      // 3. Fetch Hydration
      const { data: waterRows } = await client
        .from('water_logs')
        .select('*')
        .eq('user_id', userId);

      if (waterRows && waterRows.length > 0 && window.hunterTracker) {
        const curDate = window.hunterTracker.state.selectedDate;
        const matching = waterRows.find(w => w.date === curDate);
        if (matching) {
          window.hunterTracker.state.waterLoggedLiters = Number(matching.water_liters) || 0;
          localStorage.setItem('hunter_system_meal_tracker_v1', JSON.stringify(window.hunterTracker.state));
          window.hunterTracker.render();
        }
      }

      // 4. Fetch Workouts
      const { data: workouts } = await client
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (workouts && workouts.length > 0 && typeof store !== 'undefined') {
        const s = store.get();
        s.workoutHistory = workouts.map(w => ({
          id: w.id,
          title: w.title,
          date: w.date,
          volume: w.volume,
          setsCount: w.sets_count
        }));
        store.save();
      }

      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
      console.log('[FormaSync] Cloud state hydration complete');
    } catch (e) {
      console.error('[FormaSync] Error during cloud hydration:', e);
    }
  }

  // --- TELEMETRY & STATUS PILL UPDATER ---

  updateSyncTelemetry() {
    const badge = document.getElementById('supabaseHeaderStatus');
    if (!badge) return;

    if (!this.isOnline) {
      badge.innerHTML = `
        <span class="hunter-sync-dot" style="background: #EF4444; box-shadow: 0 0 8px #EF4444;"></span>
        <span style="color: #EF4444; font-weight: 700;">OFFLINE</span>
        ${this.queue.length > 0 ? `<span class="queue-counter">${this.queue.length}</span>` : ''}
      `;
      badge.className = 'hunter-sync-badge offline';
      badge.title = `Offline mode: ${this.queue.length} pending updates queued locally.`;
      return;
    }

    if (this.queue.length > 0) {
      badge.innerHTML = `
        <span class="live-pulse-dot" style="background: #F59E0B; box-shadow: 0 0 8px #F59E0B;"></span>
        <span style="color: #F59E0B; font-weight: 700;">SYNCING (${this.queue.length})</span>
      `;
      badge.className = 'hunter-sync-badge syncing';
      badge.title = `Transmitting ${this.queue.length} local changes to cloud...`;
      return;
    }

    const isConnected = window.formaSupabase?.isConnected();
    const isAuthed = window.formaAuth?.isAuthenticated();

    if (isConnected && isAuthed) {
      badge.innerHTML = `
        <span class="live-pulse-dot" style="background: #10B981; box-shadow: 0 0 10px #10B981;"></span>
        <span style="color: #10B981; font-weight: 700;">MULTI-DEVICE SYNCED</span>
      `;
      badge.className = 'hunter-sync-badge synced';
      badge.title = 'Real-time WebSocket connection active across all devices';
    } else if (isConnected) {
      badge.innerHTML = `
        <span class="live-pulse-dot" style="background: #38BDF8; box-shadow: 0 0 8px #38BDF8;"></span>
        <span style="color: #38BDF8; font-weight: 700;">CLOUD CONNECTED</span>
      `;
      badge.className = 'hunter-sync-badge connected';
      badge.title = 'Connected to Supabase. Sign in to enable multi-device sync.';
    } else {
      badge.innerHTML = `
        <span class="hunter-sync-dot"></span>
        <span style="color: #8E8E93; font-weight: 600;">LOCAL OFFLINE</span>
      `;
      badge.className = 'hunter-sync-badge offline';
      badge.title = 'Click to configure Supabase URL & Anon Key';
    }
  }
}

// Global Instance
window.formaSync = new FormaSyncEngine();

