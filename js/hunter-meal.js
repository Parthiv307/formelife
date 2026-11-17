/* ==========================================================================
   HUNTER SYSTEM — MEAL & WATER ENGINE
   Dedicated logic for Hunter System Tactical Meal Tracker HUD
   - Live 7-Day Overview per-day calorie tracking
   - Structured Meal Prep Protocol input modal
   - Interactive Meal Prep Checklist with auto-moving to Active Meals
   - Real-time Calorie & Protein Progress Tracking
   ========================================================================== */

const HUNTER_STORAGE_KEY = 'hunter_system_meal_tracker_v1';

// Initial state replicating image defaults
const hunterInitialState = {
  selectedDate: '2026-11-17',
  targets: {
    calories: 2000,
    protein: 120,
    waterLiters: 3
  },
  waterLoggedLiters: 0,
  meals: [], // { id, date, slot: 'B'|'L'|'D'|'S', desc, cal, pro, prepPlanId }
  prepPlan: [
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
  ]
};

class HunterTracker {
  constructor() {
    this.state = this.loadState();
    this.initElements();
    this.bindEvents();
    this.render();
  }

  loadState() {
    const saved = localStorage.getItem(HUNTER_STORAGE_KEY);
    let state = null;
    if (saved) {
      try {
        state = JSON.parse(saved);
      } catch(e) {
        state = null;
      }
    }
    if (!state) {
      state = JSON.parse(JSON.stringify(hunterInitialState));
    }

    // Migration: ensure every meal has a date
    if (state.meals && Array.isArray(state.meals)) {
      state.meals.forEach(m => {
        if (!m.date) m.date = state.selectedDate || '2026-11-17';
      });
    }

    // Migration: ensure every prep item has a unique id
    if (state.prepPlan && Array.isArray(state.prepPlan)) {
      state.prepPlan.forEach(p => {
        if (p.items && Array.isArray(p.items)) {
          p.items.forEach((it, idx) => {
            if (!it.id) it.id = `prep_${p.day}_${idx}_${Date.now()}`;
          });
        }
      });
    }

    return state;
  }

  saveState() {
    localStorage.setItem(HUNTER_STORAGE_KEY, JSON.stringify(this.state));
    this.render();
    if (window.refreshDashboardMetrics) {
      window.refreshDashboardMetrics();
    }
  }

  initElements() {
    // Top Display
    this.calCurrentEl = document.getElementById('calCurrent');
    this.calTargetEl = document.getElementById('calTarget');
    this.calFillEl = document.getElementById('calFill');
    
    this.proCurrentEl = document.getElementById('proCurrent');
    this.proTargetEl = document.getElementById('proTarget');
    this.proFillEl = document.getElementById('proFill');

    // Water
    this.waterDisplayEl = document.getElementById('waterCurrentDisplay');
    this.bottle1 = document.getElementById('bottle1Btn');
    this.bottle2 = document.getElementById('bottle2Btn');
    this.bottle3 = document.getElementById('bottle3Btn');

    // Container
    this.mealsContainer = document.getElementById('mealsContainer');
  }

  bindEvents() {
    // Water buttons
    document.getElementById('waterAddBottleBtn')?.addEventListener('click', () => this.addWater(1));
    document.getElementById('waterIncBtn')?.addEventListener('click', () => this.addWater(1));
    document.getElementById('waterDecBtn')?.addEventListener('click', () => this.addWater(-1));

    // Bottle cards
    [this.bottle1, this.bottle2, this.bottle3].forEach((btn, idx) => {
      btn?.addEventListener('click', () => {
        const bottleNum = idx + 1;
        this.setWater(bottleNum === this.state.waterLoggedLiters ? bottleNum - 1 : bottleNum);
      });
    });

    // Modal Triggers
    document.getElementById('openAddMealBtn')?.addEventListener('click', () => this.openModal('hunterAddMealModal'));
    document.getElementById('editTargetsBtn')?.addEventListener('click', () => this.openModal('hunterEditTargetsModal'));
    document.getElementById('openFavoritesBtn')?.addEventListener('click', () => this.quickAddFavorite());
    document.getElementById('editPlanBtn')?.addEventListener('click', () => this.openModal('hunterPrepMealModal'));

    // Form: Log Active Meal
    document.getElementById('hunterAddMealForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const slot = document.getElementById('hunterMealSlotInput').value;
      const desc = document.getElementById('hunterMealDescInput').value.trim();
      const cal = parseInt(document.getElementById('hunterMealCalInput').value, 10) || 0;
      const pro = parseInt(document.getElementById('hunterMealProInput').value, 10) || 0;

      const newMeal = {
        id: Date.now(),
        date: this.state.selectedDate,
        slot,
        desc,
        cal,
        pro
      };
      this.state.meals.push(newMeal);

      if (window.formaSupabase) {
        window.formaSupabase.syncMeal(newMeal);
      }

      this.closeModal('hunterAddMealModal');
      document.getElementById('hunterAddMealForm').reset();
      this.saveState();
    });

    // Form: Reconfigure Targets
    document.getElementById('hunterEditTargetsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.state.targets.calories = parseInt(document.getElementById('hunterTargetCalInput').value, 10) || 2000;
      this.state.targets.protein = parseInt(document.getElementById('hunterTargetProInput').value, 10) || 120;
      if (window.formaSupabase) {
        window.formaSupabase.syncTargets(this.state.targets);
      }
      this.closeModal('hunterEditTargetsModal');
      this.saveState();
    });

    // Form: Add/Edit Meal Prep Protocol Item
    document.getElementById('hunterPrepMealForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const day = document.getElementById('hunterPrepDaySelect').value;
      const slot = document.getElementById('hunterPrepSlotInput').value;
      const desc = document.getElementById('hunterPrepDescInput').value.trim();
      const cal = parseInt(document.getElementById('hunterPrepCalInput').value, 10) || 0;
      const pro = parseInt(document.getElementById('hunterPrepProInput').value, 10) || 0;

      let dayPlan = this.state.prepPlan.find(p => p.day.toUpperCase() === day.toUpperCase());
      if (!dayPlan) {
        dayPlan = { day: day.toUpperCase(), items: [] };
        this.state.prepPlan.push(dayPlan);
      }

      dayPlan.items.push({
        id: 'prep_' + Date.now(),
        slot,
        text: desc,
        cal,
        pro
      });

      this.closeModal('hunterPrepMealModal');
      document.getElementById('hunterPrepMealForm').reset();
      this.saveState();
    });

    // Date Switchers
    document.getElementById('prevDayBtn')?.addEventListener('click', () => this.shiftDay(-1));
    document.getElementById('nextDayBtn')?.addEventListener('click', () => this.shiftDay(1));
  }

  addWater(delta) {
    this.state.waterLoggedLiters = Math.max(0, Math.min(3, (this.state.waterLoggedLiters || 0) + delta));
    if (window.formaSupabase) {
      window.formaSupabase.syncWater(this.state.selectedDate, this.state.waterLoggedLiters);
    }
    this.saveState();
  }

  setWater(amount) {
    this.state.waterLoggedLiters = Math.max(0, Math.min(3, amount));
    if (window.formaSupabase) {
      window.formaSupabase.syncWater(this.state.selectedDate, this.state.waterLoggedLiters);
    }
    this.saveState();
  }

  shiftDay(delta) {
    const cur = new Date(this.state.selectedDate || '2026-11-17');
    cur.setDate(cur.getDate() + delta);
    this.setDate(cur.toISOString().split('T')[0]);
  }

  setDate(isoDateStr) {
    this.state.selectedDate = isoDateStr;
    const dateText = document.getElementById('currentDateText');
    const dateTitle = document.getElementById('currentDateTitle');
    if (dateText) dateText.innerText = this.state.selectedDate;
    if (dateTitle) {
      const todayStr = new Date().toISOString().split('T')[0];
      dateTitle.innerText = this.state.selectedDate === todayStr ? 'TODAY' : 'DATE';
    }
    this.saveState();
  }

  quickAddFavorite() {
    const favMeal = {
      id: Date.now(),
      date: this.state.selectedDate,
      slot: 'L',
      desc: 'Chapathi and Paneer Butter Masala',
      cal: 700,
      pro: 28
    };
    this.state.meals.push(favMeal);
    if (window.formaSupabase) {
      window.formaSupabase.syncMeal(favMeal);
    }
    this.saveState();
  }

  deleteMeal(id) {
    this.state.meals = this.state.meals.filter(m => m.id !== id);
    if (window.formaSupabase) {
      window.formaSupabase.deleteMeal(id);
    }
    this.saveState();
  }

  deletePrepItem(prepId) {
    this.state.prepPlan.forEach(p => {
      p.items = (p.items || []).filter(it => it.id !== prepId);
    });
    // Also remove from logged meals if present
    const removedMeals = this.state.meals.filter(m => m.prepPlanId === prepId);
    this.state.meals = this.state.meals.filter(m => m.prepPlanId !== prepId);
    if (window.formaSupabase) {
      removedMeals.forEach(rm => window.formaSupabase.deleteMeal(rm.id));
    }
    this.saveState();
  }

  togglePrepItemConsumed(prepId) {
    const existing = this.state.meals.find(
      m => m.prepPlanId === prepId && m.date === this.state.selectedDate
    );

    if (existing) {
      // Uncheck / Remove from active meals for this date
      this.state.meals = this.state.meals.filter(m => m.id !== existing.id);
      if (window.formaSupabase) {
        window.formaSupabase.deleteMeal(existing.id);
      }
    } else {
      // Find prep item
      let targetItem = null;
      for (const p of this.state.prepPlan) {
        const found = (p.items || []).find(it => it.id === prepId);
        if (found) { targetItem = found; break; }
      }
      if (targetItem) {
        const consumedMeal = {
          id: Date.now(),
          date: this.state.selectedDate,
          slot: targetItem.slot || 'L',
          desc: targetItem.text || targetItem.desc,
          cal: parseInt(targetItem.cal, 10) || 0,
          pro: parseInt(targetItem.pro, 10) || 0,
          prepPlanId: prepId
        };
        this.state.meals.push(consumedMeal);
        if (window.formaSupabase) {
          window.formaSupabase.syncMeal(consumedMeal);
        }
      }
    }
    this.saveState();
  }

  openModal(id) {
    document.getElementById(id)?.classList.add('active');
  }

  closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
  }

  render() {
    if (!this.calCurrentEl) this.initElements();

    // 1. Filter meals for the currently selected date
    const curDate = this.state.selectedDate || '2026-11-17';
    const activeMeals = (this.state.meals || []).filter(m => m.date === curDate);

    // Calculate Aggregates for selected day
    let totalCal = 0;
    let totalPro = 0;
    activeMeals.forEach(m => {
      totalCal += (m.cal || 0);
      totalPro += (m.pro || 0);
    });

    // 2. Render Calories
    if (this.calCurrentEl) this.calCurrentEl.innerText = totalCal;
    if (this.calTargetEl) this.calTargetEl.innerText = this.state.targets.calories;
    const calPct = Math.min(100, Math.round((totalCal / (this.state.targets.calories || 2000)) * 100));
    if (this.calFillEl) this.calFillEl.style.width = `${calPct}%`;

    // 3. Render Protein
    if (this.proCurrentEl) this.proCurrentEl.innerText = totalPro;
    if (this.proTargetEl) this.proTargetEl.innerText = this.state.targets.protein;
    const proPct = Math.min(100, Math.round((totalPro / (this.state.targets.protein || 120)) * 100));
    if (this.proFillEl) this.proFillEl.style.width = `${proPct}%`;

    // 4. Render Water
    const w = this.state.waterLoggedLiters || 0;
    if (this.waterDisplayEl) this.waterDisplayEl.innerText = `${w}L`;
    
    // Bottles visual fill toggle
    this.bottle1?.classList.toggle('filled', w >= 1);
    this.bottle2?.classList.toggle('filled', w >= 2);
    this.bottle3?.classList.toggle('filled', w >= 3);

    // 5. Render Meals for Current Day
    if (this.mealsContainer) {
      if (activeMeals.length === 0) {
        this.mealsContainer.innerHTML = `
          <div class="empty-state-text">
            No meals logged for this day (${curDate}). Tap + Add or check items from the Meal Prep Plan below.
          </div>
        `;
      } else {
        this.mealsContainer.innerHTML = activeMeals.map(m => `
          <div class="meal-entry-row">
            <div class="meal-entry-left">
              <span class="tag tag-${m.slot.toLowerCase()}">${m.slot}:</span>
              <span style="font-weight: 500;">${m.desc}</span>
              ${m.prepPlanId ? '<span class="meal-prep-origin-badge">PREP LOG</span>' : ''}
            </div>
            <div class="meal-entry-right">
              <span class="macro-note">(${m.cal}cal, ${m.pro}g)</span>
              <button class="meal-del-btn" onclick="window.hunterTracker.deleteMeal(${m.id})" title="Remove item">✕</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 6. Render Live 7-Day Overview Dials (Calculates actual consumed calories per day)
    this.renderWeekOverview();

    // 7. Render Prep Plan Checklist with interactive Checkboxes
    this.renderPrepPlanChecklist();
  }

  renderWeekOverview() {
    const weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) return;

    const todayObj = new Date();
    const todayIso = todayObj.toISOString().split('T')[0];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const daysData = [];

    // Calculate last 7 days ending with today (or reference date)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayObj);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dName = dayNames[d.getDay()];

      // Compute exact calories consumed on that date
      const dayCal = (this.state.meals || [])
        .filter(m => m.date === iso)
        .reduce((sum, m) => sum + (m.cal || 0), 0);

      daysData.push({
        date: iso,
        name: dName,
        calories: dayCal,
        isToday: iso === todayIso,
        isSelected: iso === this.state.selectedDate
      });
    }

    weekGrid.innerHTML = daysData.map(d => `
      <div class="day-slot ${d.isSelected ? 'active-today' : ''}" data-date="${d.date}" style="cursor: pointer;" title="Select ${d.date}">
        <div class="day-name">${d.name}</div>
        <div class="day-dial" style="${d.calories > 0 ? 'border-color: var(--amber-primary); box-shadow: 0 0 10px var(--amber-glow);' : ''}">
          <span class="dial-dot" style="${d.calories > 0 ? 'background: var(--amber-primary);' : 'background: #444;'}"></span>
          <span class="dial-num" style="${d.calories > 0 ? 'color: var(--amber-primary); font-weight: 800;' : ''}">${d.calories}</span>
        </div>
        <div class="day-foot">${d.isToday ? 'TODAY' : d.date.slice(5)}</div>
      </div>
    `).join('');

    // Bind click to switch selected day
    weekGrid.querySelectorAll('.day-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const d = slot.dataset.date;
        if (d) this.setDate(d);
      });
    });
  }

  renderPrepPlanChecklist() {
    const prepPlanEl = document.getElementById('prepPlanList');
    if (!prepPlanEl || !this.state.prepPlan) return;

    const curDate = this.state.selectedDate;

    prepPlanEl.innerHTML = this.state.prepPlan.map(plan => `
      <div class="prep-row" style="flex-direction: column; gap: 8px; margin-bottom: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
          <span class="prep-day" style="font-size: 0.9rem; font-weight: 800; color: var(--mauve-text);">${plan.day}</span>
          <span style="font-size: 0.7rem; color: #6d545d;">Check to log for ${curDate}</span>
        </div>
        <div class="prep-entries" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          ${(plan.items || []).map(it => {
            const isConsumed = (this.state.meals || []).some(
              m => m.prepPlanId === it.id && m.date === curDate
            );
            return `
              <div class="prep-checklist-row ${isConsumed ? 'prep-item-completed' : ''}">
                <input 
                  type="checkbox" 
                  class="hunter-prep-checkbox" 
                  ${isConsumed ? 'checked' : ''} 
                  onchange="window.hunterTracker.togglePrepItemConsumed('${it.id}')"
                  title="Check to add to today's active meals"
                >
                <div style="flex: 1; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="tag tag-${it.slot.toLowerCase()}">${it.slot}:</span>
                  <span class="prep-text" style="font-weight: 500; font-size: 0.8125rem;">${it.text}</span>
                  ${it.cal ? `<span class="macro-note">(${it.cal}cal, ${it.pro || 0}g)</span>` : ''}
                  ${isConsumed ? '<span class="prep-logged-badge">✓ CONSUMED & LOGGED</span>' : ''}
                </div>
                <button class="prep-del-btn" onclick="window.hunterTracker.deletePrepItem('${it.id}')" title="Delete from prep protocol">✕</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }
}

// Global modal helpers
window.closeHunterModal = (id) => document.getElementById(id)?.classList.remove('active');
window.openHunterModal = (id) => document.getElementById(id)?.classList.add('active');

document.addEventListener('DOMContentLoaded', () => {
  window.hunterTracker = new HunterTracker();
});
