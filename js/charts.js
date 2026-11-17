    /* --------------------------------------------------------------------------
       5. CHART.JS VISUALIZATION CONTROLLERS
       -------------------------------------------------------------------------- */
    let chartVolumeInstance = null;
    let chartMacroInstance = null;
    let chartWeightInstance = null;

    function initCharts() {
      // 1. Dashboard Volume Chart
      const vCtx = document.getElementById('chartDashVolume')?.getContext('2d');
      if (vCtx) {
        chartVolumeInstance = new Chart(vCtx, {
          type: 'line',
          data: {
            labels: ['May 1', 'May 5', 'May 9', 'May 14', 'May 18', 'May 22', 'May 26'],
            datasets: [{
              data: [14200, 18500, 16800, 22100, 20400, 24500, 26800],
              borderColor: '#E5E5E7',
              borderWidth: 2,
              tension: 0.35,
              fill: true,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              pointBackgroundColor: '#FFFFFF',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8E8E93' } },
              y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8E8E93' } }
            }
          }
        });
      }

      // 2. Dashboard Macro Doughnut
      const mCtx = document.getElementById('chartDashMacros')?.getContext('2d');
      if (mCtx) {
        chartMacroInstance = new Chart(mCtx, {
          type: 'doughnut',
          data: {
            labels: ['Carbs', 'Protein', 'Fats'],
            datasets: [{
              data: [210, 140, 60],
              backgroundColor: ['#71717A', '#FFFFFF', '#27272A'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: { legend: { display: false } }
          }
        });
      }

      // 3. Weight History Line
      const wCtx = document.getElementById('chartBodyWeight')?.getContext('2d');
      if (wCtx) {
        const state = store.get();
        chartWeightInstance = new Chart(wCtx, {
          type: 'line',
          data: {
            labels: state.bodyMetrics.map(b => b.date),
            datasets: [{
              data: state.bodyMetrics.map(b => b.weight),
              borderColor: '#E5E5E7',
              borderWidth: 2,
              tension: 0.2,
              pointBackgroundColor: '#FFF',
              pointRadius: 5
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8E8E93' } },
              y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8E8E93' } }
            }
          }
        });
      }
    }

    function updateMacroDonutChart(carbs, protein, fats) {
      if (!chartMacroInstance) return;
      const total = carbs + protein + fats;
      chartMacroInstance.data.datasets[0].data = total > 0 ? [carbs, protein, fats] : [1, 1, 1];
      chartMacroInstance.update();

      const carbEl = document.getElementById('dashCarbTotal');
      if (carbEl) carbEl.innerText = `${Math.round(carbs)}g`;
      const proEl = document.getElementById('dashProteinTotal');
      if (proEl) proEl.innerText = `${Math.round(protein)}g`;
      const fatEl = document.getElementById('dashFatTotal');
      if (fatEl) fatEl.innerText = `${Math.round(fats)}g`;
    }

    function renderDashboardActiveSessionCallout(state) {
      const container = document.getElementById('dashActiveSessionContainer');
      if (!container) return;

      if (state.activeWorkout) {
        let liveVol = 0;
        let setsCount = 0;
        state.activeWorkout.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.completed) {
              liveVol += ((s.weight || 0) * (s.reps || 0));
              setsCount++;
            }
          });
        });

        container.innerHTML = `
          <div class="dash-active-session-callout">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div class="live-pulse-dot" style="width: 12px; height: 12px; background: #38BDF8; box-shadow: 0 0 12px #38BDF8;"></div>
              <div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #38BDF8; letter-spacing: 0.1em; text-transform: uppercase;">
                  TRAINING SESSION CURRENTLY ACTIVE
                </div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #FFF; margin: 2px 0;">${state.activeWorkout.title}</h3>
                <div style="font-size: 0.75rem; color: #94A3B8; display: flex; gap: 12px;">
                  <span>Elapsed: <b id="dashLiveTimer" style="color: #FFF;">00:00</b></span>
                  <span>•</span>
                  <span>Live Volume: <b style="color: #38BDF8;">${liveVol.toLocaleString()} kg</b></span>
                  <span>•</span>
                  <span>Sets: <b style="color: #FFF;">${setsCount}</b></span>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-silver" onclick="switchView('workout')" style="padding: 6px 14px; font-size: 0.8rem;">
                <i data-lucide="activity" style="width: 14px; height: 14px; margin-right: 4px;"></i> Resume Tracker
              </button>
            </div>
          </div>
        `;
        lucide.createIcons();
      } else {
        container.innerHTML = `
          <div class="forma-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="stat-label">Active Training Assignment</div>
                <h2 style="font-size: 1.25rem; font-weight: 700; margin-top: 4px;" id="dashAssignedWorkout">Upper Body Strength (Push Focus)</h2>
                <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-top: 4px;">4 exercises • Estimated 50 min duration</p>
              </div>
              <button class="btn btn-silver" id="dashLaunchAssignedBtn" onclick="startWorkoutSession('Upper Body Hypertrophy')">
                <i data-lucide="play" style="width: 14px; height: 14px;"></i> Load Into Tracker
              </button>
            </div>
          </div>
        `;
        lucide.createIcons();
      }
    }

    function refreshDashboardMetrics() {
      const state = store.get();
      
      // 1. Live Nutrition & Calorie Readings
      let totalCal = 0, totalPro = 0;
      let targetCal = state.targets?.calories || 2000;
      let targetPro = state.targets?.protein || 120;
      let waterLiters = 0;

      // Pull from Hunter System state if available
      const hunterSaved = localStorage.getItem('hunter_system_meal_tracker_v1');
      let hunterData = null;
      if (hunterSaved) {
        try { hunterData = JSON.parse(hunterSaved); } catch(e){}
      } else if (window.hunterTracker?.state) {
        hunterData = window.hunterTracker.state;
      }

      if (hunterData) {
        const curDate = hunterData.selectedDate || new Date().toISOString().split('T')[0];
        const dayMeals = (hunterData.meals || []).filter(m => m.date === curDate || !m.date);
        dayMeals.forEach(m => {
          totalCal += (m.cal || 0);
          totalPro += (m.pro || 0);
        });
        if (hunterData.targets) {
          targetCal = hunterData.targets.calories || targetCal;
          targetPro = hunterData.targets.protein || targetPro;
        }
        waterLiters = hunterData.waterLoggedLiters || 0;
      } else {
        // Fallback to state.loggedMeals
        (state.loggedMeals || []).forEach(m => {
          const f = state.foods?.find(item => item.id === m.foodId);
          if (f) {
            const calc = calculateFoodItemMacros(f, m.grams);
            totalCal += calc.calories;
            totalPro += calc.protein;
          }
        });
        waterLiters = Math.round((state.water_ml || 2250) / 1000);
      }

      // Update KPI DOM elements
      const streakEl = document.getElementById('dashStreakVal');
      if (streakEl) streakEl.innerText = state.user?.streak_days || 14;

      const calValEl = document.getElementById('dashCalVal');
      if (calValEl) calValEl.innerText = Math.round(totalCal);

      const calTargetEl = document.getElementById('dashCalTarget');
      if (calTargetEl) calTargetEl.innerText = targetCal;

      const proValEl = document.getElementById('dashProVal');
      if (proValEl) proValEl.innerText = Math.round(totalPro);

      const proTargetEl = document.getElementById('dashProTarget');
      if (proTargetEl) proTargetEl.innerText = targetPro;

      const calPct = Math.min(100, Math.round((totalCal / targetCal) * 100));
      const proPct = Math.min(100, Math.round((totalPro / targetPro) * 100));

      const calBar = document.getElementById('dashCalBar');
      if (calBar) calBar.style.width = `${calPct}%`;

      const proBar = document.getElementById('dashProBar');
      if (proBar) proBar.style.width = `${proPct}%`;

      // Live Water Tile
      const waterValEl = document.getElementById('dashWaterVal');
      if (waterValEl) waterValEl.innerText = `${waterLiters}L`;

      // 2. Live Training Volume & Active Workout State
      let weeklyVolume = 0;
      const historyVolumes = [14200, 18500, 16800, 22100, 20400, 24500, 26800];
      if (state.workoutHistory && state.workoutHistory.length > 0) {
        weeklyVolume = state.workoutHistory.reduce((sum, s) => sum + (s.volume || 0), 0);
      } else {
        weeklyVolume = historyVolumes.reduce((a, b) => a + b, 0);
      }

      // If active workout has completed sets, add live volume
      if (state.activeWorkout) {
        let liveSessionVol = 0;
        state.activeWorkout.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            if (s.completed) liveSessionVol += ((s.weight || 0) * (s.reps || 0));
          });
        });
        weeklyVolume += liveSessionVol;
      }

      const volValEl = document.getElementById('dashVolVal');
      if (volValEl) volValEl.innerText = weeklyVolume.toLocaleString();

      // 3. Update Macro Doughnut Chart Live
      const proteinGrams = totalPro;
      const carbGrams = Math.round((totalCal * 0.50) / 4);
      const fatGrams = Math.round((totalCal * 0.25) / 9);
      updateMacroDonutChart(carbGrams, proteinGrams, fatGrams);

      // 4. Live Active Workout Banner on Dashboard
      renderDashboardActiveSessionCallout(state);

      // 5. Update Telemetry Clock
      const syncTimeEl = document.getElementById('dashSyncTimestamp');
      if (syncTimeEl) syncTimeEl.innerText = new Date().toLocaleTimeString();
    }

    window.refreshDashboardMetrics = refreshDashboardMetrics;

