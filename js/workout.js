    /* --------------------------------------------------------------------------
       2. WORKOUT ENGINE: LIVE TIMERS, BRZYCKI PRs, WEB AUDIO CHIME
       -------------------------------------------------------------------------- */
    let workoutTimerInterval = null;
    let restTimerInterval = null;
    let restSecondsLeft = 0;
    let audioCtx = null;

    function playBellChime() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn('AudioContext prevented by browser policy until gesture', e);
      }
    }

    function calculateBrzycki1RM(weight, reps) {
      if (!weight || !reps || reps <= 0) return 0;
      if (reps === 1) return weight;
      return Math.round((weight / (1.0278 - (0.0278 * Math.min(reps, 10)))) * 10) / 10;
    }

    function startWorkoutSession(title = 'Custom Resistance Session', preloadedExercises = []) {
      const state = store.get();
      const exercises = preloadedExercises.length > 0 
        ? preloadedExercises 
        : [state.exercises[0], state.exercises[1]];

      state.activeWorkout = {
        title: title,
        startedAt: Date.now(),
        exercises: exercises.map((ex, index) => ({
          exerciseId: ex.id,
          name: ex.name,
          sets: [
            { setNumber: 1, weight: 60, reps: 10, completed: false },
            { setNumber: 2, weight: 60, reps: 10, completed: false },
            { setNumber: 3, weight: 60, reps: 10, completed: false }
          ]
        }))
      };
      store.save();
      renderActiveWorkoutUI();
      switchView('workout');
    }

    function renderActiveWorkoutUI() {
      const state = store.get();
      const w = state.activeWorkout;
      const dock = document.getElementById('workoutFloatingDock');

      if (!w) {
        dock.classList.remove('visible');
        clearInterval(workoutTimerInterval);
        return;
      }

      dock.classList.add('visible');
      document.getElementById('workoutSessionTitle').value = w.title;

      // Start elapsed timer if not already ticking
      clearInterval(workoutTimerInterval);
      workoutTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - w.startedAt) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        const formatted = `${mins}:${secs}`;
        document.getElementById('trackerDurationTimer').innerText = formatted;
        document.getElementById('dockTimerDisplay').innerText = formatted;
      }, 1000);

      // Render Exercises List
      const container = document.getElementById('workoutExercisesList');
      container.innerHTML = '';

      let grandVolume = 0;
      let totalCompletedSets = 0;

      w.exercises.forEach((exItem, exIdx) => {
        const card = document.createElement('div');
        card.className = 'forma-card';

        let setsRows = '';
        exItem.sets.forEach((set, setIdx) => {
          if (set.completed) {
            grandVolume += (set.weight * set.reps);
            totalCompletedSets++;
          }

          setsRows += `
            <div style="display: grid; grid-template-columns: 40px 1fr 1fr 60px 40px; gap: 10px; align-items: center; background: #111; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; border: 1px solid ${set.completed ? 'var(--status-success)' : 'var(--border-subtle)'};">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">${set.setNumber}</span>
              <input type="number" step="0.5" class="form-control" style="padding: 4px 8px; text-align: center;" value="${set.weight}" onchange="updateSetVal(${exIdx}, ${setIdx}, 'weight', this.value)">
              <input type="number" class="form-control" style="padding: 4px 8px; text-align: center;" value="${set.reps}" onchange="updateSetVal(${exIdx}, ${setIdx}, 'reps', this.value)">
              <button class="btn ${set.completed ? 'btn-silver' : 'btn-ghost'}" style="padding: 5px 8px; font-size: 0.75rem;" onclick="toggleSetComplete(${exIdx}, ${setIdx})">
                ${set.completed ? '✓' : 'Log'}
              </button>
              <button class="btn btn-ghost" style="padding: 5px; color: var(--status-danger); border: none;" onclick="deleteSet(${exIdx}, ${setIdx})">✕</button>
            </div>
          `;
        });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1rem; font-weight: 700;">${exItem.name}</h3>
            <button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.75rem;" onclick="addSetToExercise(${exIdx})">+ Add Set</button>
          </div>
          <div style="display: grid; grid-template-columns: 40px 1fr 1fr 60px 40px; gap: 10px; margin-bottom: 6px; font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; padding: 0 12px;">
            <span>Set</span><span style="text-align: center;">kg</span><span style="text-align: center;">Reps</span><span>Status</span><span></span>
          </div>
          ${setsRows}
        `;
        container.appendChild(card);
      });

      document.getElementById('trackerVolumeTotal').innerText = `${grandVolume.toLocaleString()} kg`;
      document.getElementById('dockVolumeDisplay').innerText = `${grandVolume.toLocaleString()} kg`;
      document.getElementById('trackerSetsTotal').innerText = totalCompletedSets;
    }

    window.updateSetVal = function(exIdx, setIdx, field, value) {
      const state = store.get();
      state.activeWorkout.exercises[exIdx].sets[setIdx][field] = parseFloat(value) || 0;
      store.save();
      renderActiveWorkoutUI();
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
    };

    window.toggleSetComplete = function(exIdx, setIdx) {
      const state = store.get();
      const targetSet = state.activeWorkout.exercises[exIdx].sets[setIdx];
      targetSet.completed = !targetSet.completed;

      if (targetSet.completed) {
        // Trigger 90s audio rest countdown
        startRestCountdown(90);

        // Check and evaluate PR
        const exerciseName = state.activeWorkout.exercises[exIdx].name;
        const est1rm = calculateBrzycki1RM(targetSet.weight, targetSet.reps);
        const existingPR = state.personalRecords.find(p => p.exercise === exerciseName);

        if (!existingPR || targetSet.weight > existingPR.weight) {
          if (existingPR) {
            existingPR.weight = targetSet.weight;
            existingPR.reps = targetSet.reps;
            existingPR.est1rm = est1rm;
            existingPR.date = new Date().toISOString().split('T')[0];
          } else {
            state.personalRecords.push({
              exercise: exerciseName,
              weight: targetSet.weight,
              reps: targetSet.reps,
              est1rm: est1rm,
              date: new Date().toISOString().split('T')[0]
            });
          }
          triggerToast(`★ Personal Record Broken: ${exerciseName} @ ${targetSet.weight} kg!`);
        }
      }

      store.save();
      renderActiveWorkoutUI();
      renderProgressPRTable();
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
    };

    window.addSetToExercise = function(exIdx) {
      const state = store.get();
      const sets = state.activeWorkout.exercises[exIdx].sets;
      const prev = sets[sets.length - 1] || { weight: 50, reps: 10 };
      sets.push({
        setNumber: sets.length + 1,
        weight: prev.weight,
        reps: prev.reps,
        completed: false
      });
      store.save();
      renderActiveWorkoutUI();
    };

    window.deleteSet = function(exIdx, setIdx) {
      const state = store.get();
      state.activeWorkout.exercises[exIdx].sets.splice(setIdx, 1);
      state.activeWorkout.exercises[exIdx].sets.forEach((s, idx) => s.setNumber = idx + 1);
      store.save();
      renderActiveWorkoutUI();
    };

    function startRestCountdown(seconds) {
      clearInterval(restTimerInterval);
      restSecondsLeft = seconds;
      const pill = document.getElementById('dockRestPill');
      const disp = document.getElementById('dockRestDisplay');
      pill.classList.add('active');

      restTimerInterval = setInterval(() => {
        restSecondsLeft--;
        const m = String(Math.floor(restSecondsLeft / 60)).padStart(2, '0');
        const s = String(restSecondsLeft % 60).padStart(2, '0');
        disp.innerText = `${m}:${s}`;

        if (restSecondsLeft <= 0) {
          clearInterval(restTimerInterval);
          pill.classList.remove('active');
          playBellChime();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }, 1000);
    }

    function finishWorkout() {
      const state = store.get();
      if (!state.activeWorkout) return;

      clearInterval(workoutTimerInterval);

      // Compute total session volume
      let sessionVolume = 0;
      let sessionSets = 0;
      state.activeWorkout.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) {
            sessionVolume += ((s.weight || 0) * (s.reps || 0));
            sessionSets++;
          }
        });
      });

      if (!state.workoutHistory) {
        state.workoutHistory = [
          { date: 'May 1', volume: 14200 },
          { date: 'May 5', volume: 18500 },
          { date: 'May 9', volume: 16800 },
          { date: 'May 14', volume: 22100 },
          { date: 'May 18', volume: 20400 },
          { date: 'May 22', volume: 24500 },
          { date: 'May 26', volume: 26800 }
        ];
      }

      const todayDateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const completedWorkout = {
        id: Date.now(),
        title: state.activeWorkout.title,
        date: todayDateLabel,
        volume: sessionVolume,
        setsCount: sessionSets
      };
      state.workoutHistory.push(completedWorkout);

      if (window.formaSupabase) {
        window.formaSupabase.syncWorkout(completedWorkout);
      }

      if (sessionSets > 0) {
        state.user.streak_days = (state.user.streak_days || 14) + 1;
      }

      state.activeWorkout = null;
      store.save();
      renderActiveWorkoutUI();
      triggerToast(`✓ Session Finalized: ${sessionVolume.toLocaleString()} kg volume recorded!`);
      switchView('dashboard');
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
    }

    /* --------------------------------------------------------------------------
       3. NUTRITION ENGINE: 100g RATIO SCALING & MACRO TOTALS
       -------------------------------------------------------------------------- */
    function calculateFoodItemMacros(foodItem, grams) {
      const factor = grams / 100.0;
      return {
        calories: Math.round(foodItem.cal100 * factor),
        protein: Math.round(foodItem.pro100 * factor * 10) / 10,
        carbs: Math.round(foodItem.carb100 * factor * 10) / 10,
        fats: Math.round(foodItem.fat100 * factor * 10) / 10
      };
    }

    function renderNutritionSection() {
      const state = store.get();
      if (window.hunterTracker) {
        window.hunterTracker.render();
      }
      const container = document.getElementById('mealSectionsList');
      if (!container) return;
      container.innerHTML = '';

      let grandCal = 0, grandPro = 0, grandCarb = 0, grandFat = 0;

      slots.forEach(slot => {
        const slotMeals = state.loggedMeals.filter(m => m.slot === slot);
        const card = document.createElement('div');
        card.className = 'forma-card';

        let rowsHtml = '';
        slotMeals.forEach((meal, mealIdx) => {
          const food = state.foods.find(f => f.id === meal.foodId);
          if (!food) return;

          const macros = calculateFoodItemMacros(food, meal.grams);
          grandCal += macros.calories;
          grandPro += macros.protein;
          grandCarb += macros.carbs;
          grandFat += macros.fats;

          rowsHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.875rem;">
              <div>
                <div style="font-weight: 600;">${food.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${meal.grams}g • ${macros.protein}g P • ${macros.carbs}g C • ${macros.fats}g F</div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <span style="font-weight: 700;">${macros.calories} kcal</span>
                <button class="btn btn-ghost" style="padding: 4px; color: var(--status-danger); border: none;" onclick="deleteMealItem(${meal.id})">✕</button>
              </div>
            </div>
          `;
        });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1rem; font-weight: 700; text-transform: capitalize;">${slot}</h3>
            <button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.75rem;" onclick="openMealModalWithSlot('${slot}')">+ Add Item</button>
          </div>
          ${rowsHtml || '<div style="font-size: 0.8125rem; color: var(--text-secondary); padding: 8px 0;">No foods logged in this interval.</div>'}
        `;
        container.appendChild(card);
      });

      // Update Dashboard & Nutrition View Displays
      document.getElementById('nutrCalConsumed').innerText = Math.round(grandCal);
      document.getElementById('nutrCalTarget').innerText = state.targets.calories;
      document.getElementById('nutrProConsumed').innerText = Math.round(grandPro);
      document.getElementById('nutrProTarget').innerText = state.targets.protein;
      document.getElementById('nutrCarbConsumed').innerText = Math.round(grandCarb);
      document.getElementById('nutrCarbTarget').innerText = state.targets.carbs;
      document.getElementById('nutrFatConsumed').innerText = Math.round(grandFat);
      document.getElementById('nutrFatTarget').innerText = state.targets.fats;

      updateMacroDonutChart(grandCarb, grandPro, grandFat);
    }

    window.deleteMealItem = function(mealId) {
      const state = store.get();
      state.loggedMeals = state.loggedMeals.filter(m => m.id !== mealId);
      store.save();
      renderNutritionSection();
      refreshDashboardMetrics();
    };

    window.openMealModalWithSlot = function(slot) {
      document.getElementById('modalMealSlot').value = slot;
      openModal('addMealModal');
    };

    /* --------------------------------------------------------------------------
       4. PROGRAM CATALOG & LIBRARY RENDERERS
       -------------------------------------------------------------------------- */
    function renderProgramCatalog() {
      const state = store.get();
      const container = document.getElementById('programsContainer');
      container.innerHTML = '';

      state.programs.forEach(prog => {
        const card = document.createElement('div');
        card.className = 'forma-card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <span style="font-size: 0.7rem; font-weight: 700; color: var(--silver-accent); letter-spacing: 0.05em; text-transform: uppercase;">${prog.focus}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${prog.days} Days / Wk</span>
          </div>
          <h3 style="font-size: 1.125rem; font-weight: 700; margin-bottom: 8px;">${prog.title}</h3>
          <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 16px; min-height: 40px;">${prog.desc}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">${prog.level}</span>
            <button class="btn btn-silver" onclick="enrollInProgram(${prog.id})">Enroll & Start</button>
          </div>
        `;
        container.appendChild(card);
      });
    }

    window.enrollInProgram = function(progId) {
      const state = store.get();
      const prog = state.programs.find(p => p.id === progId);
      if (!prog) return;

      const exercisesToLoad = state.exercises.filter(ex => prog.sampleExercises.includes(ex.id));
      startWorkoutSession(`${prog.title} (Session 1)`, exercisesToLoad);
      triggerToast(`Enrolled into ${prog.title}`);
    };

