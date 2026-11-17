    /* --------------------------------------------------------------------------
       6. UI NAVIGATION & EVENT BINDINGS
       -------------------------------------------------------------------------- */
    function switchView(viewId) {
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

      const target = document.getElementById(`view-${viewId}`);
      const btn = document.querySelector(`.nav-btn[data-view="${viewId}"]`);

      if (target) target.classList.add('active');
      if (btn) btn.classList.add('active');

      if (viewId === 'dashboard') refreshDashboardMetrics();
      if (viewId === 'nutrition') {
        if (window.hunterTracker) window.hunterTracker.render();
        else renderNutritionSection();
      }
      if (viewId === 'programs') renderProgramCatalog();
      if (viewId === 'library') {
        renderExerciseLibrary();
      } else {
        if (window.stopLibraryPreviewAnimation) window.stopLibraryPreviewAnimation();
      }
      if (viewId === 'progress') renderProgressPRTable();
      if (viewId === 'achievements') renderAchievements();
      if (viewId === 'profile') populateProfileInputs();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openModal(modalId) {
      document.getElementById(modalId)?.classList.add('active');
    }

    window.closeModal = function(modalId) {
      document.getElementById(modalId)?.classList.remove('active');
    };

    function triggerToast(text) {
      const toast = document.createElement('div');
      toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0D0E12; color: #FFF; border: 1px solid rgba(16, 185, 129, 0.4); padding: 12px 20px; border-radius: 8px; font-weight: 700; font-size: 0.875rem; box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(16, 185, 129, 0.2); z-index: 9999; animation: fadeIn 0.2s ease; font-family: monospace;';
      toast.innerText = text;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
    window.triggerToast = triggerToast;

    function populateProfileInputs() {
      const state = store.get();
      const u = state.user;
      document.getElementById('profName').value = u.name;
      document.getElementById('profAge').value = u.age;
      document.getElementById('profGender').value = u.gender;
      document.getElementById('profHeight').value = u.height_cm;
      document.getElementById('profWeight').value = u.weight_kg;
      document.getElementById('profGoal').value = u.goal;
      document.getElementById('profActivity').value = u.activity;

      // Update computed display
      store.recomputeMetabolism();
      const t = state.targets;
      document.getElementById('calcTargetCal').innerText = t.calories;
      document.getElementById('calcTargetPro').innerText = `${t.protein}g`;
      document.getElementById('calcTargetCarb').innerText = `${t.carbs}g`;
      document.getElementById('calcTargetFat').innerText = `${t.fats}g`;
    }

    // Export Biometric CSV
    function exportMetricsCSV() {
      const state = store.get();
      let csv = 'Date,Weight(kg)\n';
      state.bodyMetrics.forEach(m => {
        csv += `${m.date},${m.weight}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `forma_biometrics_${new Date().toISOString().split('T')[0]}.csv`);
      a.click();
    }

    // App Initialization
    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      initCharts();
      refreshDashboardMetrics();

      // System clock
      setInterval(() => {
        const clk = document.getElementById('systemClockDisplay');
        if (clk) clk.innerText = new Date().toLocaleTimeString();
      }, 1000);

      // Populate food items modal dropdown
      const foodSelect = document.getElementById('modalFoodSelect');
      const state = store.get();
      foodSelect.innerHTML = state.foods.map(f => `
        <option value="${f.id}">${f.name} (${f.cal100} kcal/100g)</option>
      `).join('');

      // Nav View switching
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          switchView(e.currentTarget.dataset.view);
        });
      });

      // Quick Launch Session
      document.getElementById('topStartWorkoutBtn').addEventListener('click', () => {
        startWorkoutSession('Resistance Protocol A');
      });
      document.getElementById('dashLaunchAssignedBtn').addEventListener('click', () => {
        startWorkoutSession('Upper Body Hypertrophy');
      });

      // Dock Actions
      document.getElementById('dockResumeBtn').addEventListener('click', () => switchView('workout'));
      document.getElementById('workoutFinishBtn').addEventListener('click', finishWorkout);
      document.getElementById('workoutCancelBtn').addEventListener('click', () => {
        if (confirm('Discard current workout session?')) {
          store.get().activeWorkout = null;
          store.save();
          renderActiveWorkoutUI();
          switchView('dashboard');
        }
      });

      // Modal Triggers
      document.getElementById('quickAddMealBtn')?.addEventListener('click', () => {
        if (window.hunterTracker) window.hunterTracker.openModal('hunterAddMealModal');
        else openModal('addMealModal');
      });
      document.getElementById('nutritionAddFoodBtn')?.addEventListener('click', () => {
        if (window.hunterTracker) window.hunterTracker.openModal('hunterAddMealModal');
        else openModal('addMealModal');
      });
      document.getElementById('progressLogMetricBtn')?.addEventListener('click', () => openModal('addMetricModal'));
      document.getElementById('progressExportCsvBtn')?.addEventListener('click', exportMetricsCSV);

      // Add Meal Form Submit (legacy fallback)
      document.getElementById('addMealForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const slot = document.getElementById('modalMealSlot').value;
        const foodId = parseInt(document.getElementById('modalFoodSelect').value, 10);
        const grams = parseFloat(document.getElementById('modalFoodGrams').value) || 100;

        store.get().loggedMeals.push({
          id: Date.now(),
          slot,
          foodId,
          grams
        });
        store.save();
        closeModal('addMealModal');
        triggerToast('Food item logged successfully.');
        renderNutritionSection();
        refreshDashboardMetrics();
      });

      // Add Weigh-In Form Submit
      document.getElementById('addMetricForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const weight = parseFloat(document.getElementById('modalWeightInput').value);
        if (!weight) return;

        const dateStr = new Date().toISOString().split('T')[0];
        const state = store.get();
        state.bodyMetrics.push({ date: dateStr, weight });
        state.user.weight_kg = weight;
        store.save();

        if (chartWeightInstance) {
          chartWeightInstance.data.labels.push(dateStr);
          chartWeightInstance.data.datasets[0].data.push(weight);
          chartWeightInstance.update();
        }

        closeModal('addMetricModal');
        triggerToast('Weigh-in recorded.');
      });

      // Profile Form Recompute
      document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        store.updateUser({
          name: document.getElementById('profName').value,
          age: parseInt(document.getElementById('profAge').value, 10),
          gender: document.getElementById('profGender').value,
          height_cm: parseFloat(document.getElementById('profHeight').value),
          weight_kg: parseFloat(document.getElementById('profWeight').value),
          goal: document.getElementById('profGoal').value,
          activity: document.getElementById('profActivity').value
        });
        triggerToast('Profile updated & baselines recalculated.');
        populateProfileInputs();
        refreshDashboardMetrics();
      });

      // Water logging buttons
      document.getElementById('addWater250Btn').addEventListener('click', () => {
        store.get().water_ml += 250;
        store.save();
        document.getElementById('recoveryWaterDisplay').innerText = store.get().water_ml.toLocaleString();
      });
      document.getElementById('addWater500Btn').addEventListener('click', () => {
        store.get().water_ml += 500;
        store.save();
        document.getElementById('recoveryWaterDisplay').innerText = store.get().water_ml.toLocaleString();
      });
      document.getElementById('resetWaterBtn').addEventListener('click', () => {
        store.get().water_ml = 0;
        store.save();
        document.getElementById('recoveryWaterDisplay').innerText = '0';
      });

      // Sidebar collapse toggle
      document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
        document.getElementById('appSidebar').classList.toggle('collapsed');
      });

      // Search & Filters on Exercise Library
      document.getElementById('exerciseSearchInput')?.addEventListener('input', (e) => {
        renderExerciseLibrary(document.getElementById('exerciseCategoryFilter').value, e.target.value);
      });
      document.getElementById('exerciseCategoryFilter')?.addEventListener('change', (e) => {
        renderExerciseLibrary(e.target.value, document.getElementById('exerciseSearchInput').value);
      });

      // Add exercise to active workout from Cinema modal
      document.getElementById('modalStartWorkoutActionBtn')?.addEventListener('click', () => {
        const state = store.get();
        const ex = state.exercises[currentCinemaIndex];
        if (!ex) return;
        if (!state.activeWorkout) {
          startWorkoutSession('Daily Training Session', [ex]);
          triggerToast(`Started session with ${ex.name}`);
        } else {
          state.activeWorkout.exercises.push({
            exerciseId: ex.id,
            name: ex.name,
            sets: [
              { setNumber: 1, weight: 0, reps: 15, completed: false },
              { setNumber: 2, weight: 0, reps: 15, completed: false },
              { setNumber: 3, weight: 0, reps: 15, completed: false }
            ]
          });
          store.save();
          renderActiveWorkoutUI();
          triggerToast(`Added ${ex.name} to active workout`);
        }
        closeCinemaModal();
      });

      // Resume active workout if stored in local database
      renderActiveWorkoutUI();
    });
