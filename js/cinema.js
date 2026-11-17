    /* --------------------------------------------------------------------------
       5. HOME WORKOUT CINEMA ENGINE & ANATOMICAL VISUALIZER
       -------------------------------------------------------------------------- */
    let currentCinemaIndex = 0;
    let cinemaDurationSecs = 30;
    let cinemaAnimFrameId = null;
    let currentModalTab = 'video';

    function getMuscleActivations(ex) {
      const name = (ex?.name || '').toLowerCase();
      const cat = (ex?.category || '').toLowerCase();

      if (name.includes('jumping jack')) {
        return [
          { muscle: 'Calves (Gastrocnemius)', pct: 95 },
          { muscle: 'Quadriceps', pct: 85 },
          { muscle: 'Deltoids & Shoulders', pct: 80 },
          { muscle: 'Core & Abdominals', pct: 75 },
          { muscle: 'Cardiovascular Output', pct: 100 }
        ];
      } else if (cat.includes('chest') || name.includes('bench') || name.includes('push-up')) {
        return [
          { muscle: 'Pectoralis Major', pct: 95 },
          { muscle: 'Anterior Deltoids', pct: 80 },
          { muscle: 'Triceps Brachii', pct: 75 },
          { muscle: 'Serratus Anterior', pct: 60 }
        ];
      } else if (cat.includes('back') || name.includes('deadlift') || name.includes('pull-up')) {
        return [
          { muscle: 'Latissimus Dorsi', pct: 95 },
          { muscle: 'Rhomboids & Traps', pct: 85 },
          { muscle: 'Erector Spinae', pct: 80 },
          { muscle: 'Biceps Brachii', pct: 75 }
        ];
      } else if (cat.includes('legs') || cat.includes('quad') || name.includes('squat')) {
        return [
          { muscle: 'Quadriceps Femoris', pct: 95 },
          { muscle: 'Gluteus Maximus', pct: 90 },
          { muscle: 'Hamstrings', pct: 75 },
          { muscle: 'Core Stabilizers', pct: 70 }
        ];
      } else if (cat.includes('shoulder') || name.includes('press')) {
        return [
          { muscle: 'Anterior & Medial Delts', pct: 95 },
          { muscle: 'Triceps Brachii', pct: 80 },
          { muscle: 'Upper Trapezius', pct: 75 },
          { muscle: 'Core Bracing', pct: 65 }
        ];
      }
      return [
        { muscle: 'Primary Agonist', pct: 90 },
        { muscle: 'Secondary Synergist', pct: 75 },
        { muscle: 'Stabilizer Core', pct: 65 }
      ];
    }

    /* ==========================================================================
       REALISTIC HUMANOID VECTOR KINEMATICS ENGINE
       Renders human anatomy (skin, shirt, shorts, shoes) with natural movement.
       ========================================================================== */
    function drawHumanFigureAndLift(ctx, width, height, kinType, progress) {
      ctx.clearRect(0, 0, width, height);

      const t = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0 to 1 cycle
      const isConcentric = Math.cos(progress * Math.PI * 2 - Math.PI / 2) > 0;

      ctx.save();
      ctx.translate(width / 2, height / 2 + 10);

      // Palette matching Home Workout App
      const skinTone = '#E5A885';
      const skinShadow = '#C98A68';
      const tankTopColor = '#0284C7'; // Blue jersey from screenshot
      const shortsColor = '#0F172A';  // Dark navy shorts
      const shoeColor = '#475569';    // Cross-trainers
      const floorShadow = 'rgba(0, 0, 0, 0.08)';

      // Helper function: Render anatomical joint segment
      function drawSegment(x1, y1, x2, y2, thickness, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // --- 1. JUMPING JACKS (Exact match to screenshot) ---
      if (kinType === 'jumping_jacks') {
        const bounce = Math.abs(Math.sin(progress * Math.PI * 2)) * 14;
        const legSpread = t * 32;
        const armAngle = -0.4 + (t * 2.5); // Radians from down to overhead

        // Ground Shadow
        ctx.fillStyle = floorShadow;
        ctx.beginPath();
        ctx.ellipse(0, 85, 45 + legSpread * 0.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(0, -bounce);

        // Legs (Navy Shorts + Skin Legs)
        // Left Leg
        drawSegment(-6, 20, -12 - legSpread * 0.4, 45, 14, shortsColor);
        drawSegment(-12 - legSpread * 0.4, 45, -16 - legSpread, 75, 10, skinTone);
        drawSegment(-16 - legSpread, 75, -20 - legSpread, 80, 11, shoeColor); // Shoe

        // Right Leg
        drawSegment(6, 20, 12 + legSpread * 0.4, 45, 14, shortsColor);
        drawSegment(12 + legSpread * 0.4, 45, 16 + legSpread, 75, 10, skinTone);
        drawSegment(16 + legSpread, 75, 20 + legSpread, 80, 11, shoeColor); // Shoe

        // Torso & Blue Athletic Tank Top
        ctx.fillStyle = tankTopColor;
        ctx.beginPath();
        ctx.roundRect(-16, -28, 32, 50, [6, 6, 2, 2]);
        ctx.fill();

        // Head & Neck
        drawSegment(0, -28, 0, -36, 8, skinTone); // Neck
        ctx.fillStyle = skinTone;
        ctx.beginPath();
        ctx.ellipse(0, -48, 10, 13, 0, 0, Math.PI * 2);
        ctx.fill(); // Head

        // Left Arm
        const leftHandX = -18 - Math.cos(armAngle) * 35;
        const leftHandY = -22 - Math.sin(armAngle) * 35;
        drawSegment(-15, -22, (-15 + leftHandX) / 2, (-22 + leftHandY) / 2 + 5, 8, skinTone);
        drawSegment((-15 + leftHandX) / 2, (-22 + leftHandY) / 2 + 5, leftHandX, leftHandY, 7, skinTone);

        // Right Arm
        const rightHandX = 18 + Math.cos(armAngle) * 35;
        const rightHandY = -22 - Math.sin(armAngle) * 35;
        drawSegment(15, -22, (15 + rightHandX) / 2, (-22 + rightHandY) / 2 + 5, 8, skinTone);
        drawSegment((15 + rightHandX) / 2, (-22 + rightHandY) / 2 + 5, rightHandX, rightHandY, 7, skinTone);
      }

      // --- 2. SQUATS (Humanoid In-Depth Articulation) ---
      else if (kinType === 'squat') {
        const hipY = -10 + (t * 42);
        const kneeY = 25 + (t * 10);
        const kneeX = 22 + (t * 12);

        // Shadow
        ctx.fillStyle = floorShadow;
        ctx.beginPath(); ctx.ellipse(0, 75, 45, 8, 0, 0, Math.PI * 2); ctx.fill();

        // Thighs (Shorts) & Lower Legs
        drawSegment(-10, hipY, -10 + kneeX * 0.6, kneeY, 15, shortsColor);
        drawSegment(-10 + kneeX * 0.6, kneeY, 0, 70, 10, skinTone);
        drawSegment(0, 70, 8, 73, 11, shoeColor); // Shoe

        // Torso (Tank Top)
        ctx.fillStyle = tankTopColor;
        ctx.save();
        ctx.translate(-15, hipY);
        ctx.rotate(0.18 + t * 0.2); // Natural torso incline
        ctx.roundRect(-8, -48, 26, 48, 6);
        ctx.fill();
        // Head
        ctx.fillStyle = skinTone;
        ctx.beginPath(); ctx.arc(5, -58, 10, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // --- 3. PUSH-UP KINEMATICS ---
      else if (kinType === 'pushup') {
        const floorY = 75;
        const dip = (1 - t) * 22; // 0 (top lockout) to 22 (chest near ground)
        const shoulderY = 18 + dip;
        const hipY = 25 + (dip * 0.7);
        const feetX = -65;
        const feetY = floorY - 6;
        const handsX = 25;
        const handsY = floorY;

        // Ground shadow
        ctx.fillStyle = floorShadow;
        ctx.beginPath();
        ctx.ellipse(0, floorY + 4, 75, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Feet & Shoes
        drawSegment(feetX, feetY, feetX + 6, feetY, 9, shoeColor);

        // Legs
        drawSegment(feetX + 6, feetY, -5, hipY, 10, skinTone);
        drawSegment(-12, hipY, -2, hipY, 14, shortsColor);

        // Torso
        ctx.save();
        ctx.fillStyle = tankTopColor;
        const torsoAngle = Math.atan2((shoulderY - hipY), (handsX - -5));
        ctx.translate(-5, hipY);
        ctx.rotate(torsoAngle);
        ctx.roundRect(0, -9, 34, 18, 4);
        ctx.fill();
        ctx.restore();

        // Head
        ctx.fillStyle = skinTone;
        ctx.beginPath();
        ctx.arc(handsX + 6, shoulderY - 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Arms (Pushup articulation)
        const elbowX = (handsX - 8) - (1 - t) * 12;
        const elbowY = (shoulderY + handsY) / 2 + (1 - t) * 10;
        drawSegment(handsX - 5, shoulderY, elbowX, elbowY, 8, skinTone);
        drawSegment(elbowX, elbowY, handsX, handsY, 7, skinTone);
      }

      // --- 4. BENCH PRESS & UPPER BODY ---
      else {
        // Bench surface
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-70, 25, 140, 10);

        // Torso (Tank Top)
        ctx.fillStyle = tankTopColor;
        ctx.roundRect(-45, 10, 75, 16, 4);
        ctx.fill();

        // Head
        ctx.fillStyle = skinTone;
        ctx.beginPath(); ctx.arc(-55, 17, 9, 0, Math.PI * 2); ctx.fill();

        // Arm pressing upwards
        const barY = -25 + (t * 35);
        drawSegment(-20, 15, -30, (-25 + barY) / 2, 8, skinTone);
        drawSegment(-30, (-25 + barY) / 2, -10, barY, 7, skinTone);

        // Barbell & Weights
        ctx.strokeStyle = '#64748B'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-60, barY); ctx.lineTo(40, barY); ctx.stroke();
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-65, barY - 14, 8, 28);
        ctx.fillRect(35, barY - 14, 8, 28);
      }

      ctx.restore();
    }

    function getKinTypeForExercise(ex) {
      const exName = (ex?.name || '').toLowerCase();
      const cat = (ex?.category || '').toLowerCase();
      if (exName.includes('jump') || exName.includes('jack') || cat === 'cardio' || cat === 'full body') {
        return 'jumping_jacks';
      } else if (exName.includes('squat') || cat.includes('quad') || cat.includes('hamstring') || cat.includes('legs') || cat.includes('lower') || exName.includes('deadlift')) {
        return 'squat';
      } else if (exName.includes('push-up') || exName.includes('pushup')) {
        return 'pushup';
      }
      return 'bench';
    }

    function startCinemaAnimation(ex) {
      if (cinemaAnimFrameId) {
        cancelAnimationFrame(cinemaAnimFrameId);
        cinemaAnimFrameId = null;
      }
      const canvas = document.getElementById('cinemaCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const kinType = getKinTypeForExercise(ex);

      const animStartTime = performance.now();
      function renderFrame(now) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width || 440;
        const h = rect.height || 280;

        if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
          canvas.width = w * dpr;
          canvas.height = h * dpr;
        }
        ctx.save();
        ctx.scale(dpr, dpr);

        const elapsed = (now - animStartTime) / 1000;
        const speed = kinType === 'jumping_jacks' ? 1.5 : 1.0;
        const progress = (elapsed * speed) % 1.0;

        drawHumanFigureAndLift(ctx, w, h, kinType, progress);

        ctx.restore();
        cinemaAnimFrameId = requestAnimationFrame(renderFrame);
      }
      cinemaAnimFrameId = requestAnimationFrame(renderFrame);
    }

    /* --------------------------------------------------------------------------
       INLINE EXERCISE LIBRARY VIDEO PREVIEW ENGINE
       -------------------------------------------------------------------------- */
    let libraryAnimFrameId = null;
    let currentLibraryExerciseIndex = -1;
    let isLibraryPreviewPlaying = true;
    let libraryAnimStartTime = performance.now();

    function startLibraryPreviewAnimation(ex) {
      if (libraryAnimFrameId) {
        cancelAnimationFrame(libraryAnimFrameId);
        libraryAnimFrameId = null;
      }
      const canvas = document.getElementById('libraryCinemaCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const kinType = getKinTypeForExercise(ex);

      libraryAnimStartTime = performance.now();
      function renderLibFrame(now) {
        if (!isLibraryPreviewPlaying) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const w = rect.width || 440;
        const h = rect.height || 290;

        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        ctx.save();
        ctx.scale(dpr, dpr);

        const elapsed = (now - libraryAnimStartTime) / 1000;
        const speed = kinType === 'jumping_jacks' ? 1.5 : 1.0;
        const progress = (elapsed * speed) % 1.0;

        drawHumanFigureAndLift(ctx, w, h, kinType, progress);

        ctx.restore();
        libraryAnimFrameId = requestAnimationFrame(renderLibFrame);
      }
      libraryAnimFrameId = requestAnimationFrame(renderLibFrame);
    }

    window.stopLibraryPreviewAnimation = function() {
      if (libraryAnimFrameId) {
        cancelAnimationFrame(libraryAnimFrameId);
        libraryAnimFrameId = null;
      }
    };

    window.toggleLibraryVideoPlay = function() {
      isLibraryPreviewPlaying = !isLibraryPreviewPlaying;
      const icon = document.getElementById('libPreviewPlayPauseIcon');
      if (icon) {
        icon.setAttribute('data-lucide', isLibraryPreviewPlaying ? 'pause' : 'play');
        lucide.createIcons();
      }
      if (isLibraryPreviewPlaying) {
        const state = store.get();
        const ex = state.exercises[currentLibraryExerciseIndex] || state.exercises[0];
        startLibraryPreviewAnimation(ex);
      } else {
        stopLibraryPreviewAnimation();
      }
    };

    window.setLibraryPreviewExercise = function(idx) {
      const state = store.get();
      if (!state.exercises || state.exercises.length === 0) return;
      currentLibraryExerciseIndex = (idx + state.exercises.length) % state.exercises.length;
      const ex = state.exercises[currentLibraryExerciseIndex];

      const indexBadge = document.getElementById('libPreviewIndexBadge');
      if (indexBadge) indexBadge.innerText = `${currentLibraryExerciseIndex + 1}/${state.exercises.length}`;

      const titleEl = document.getElementById('libPreviewTitle');
      if (titleEl) titleEl.innerText = ex.name.toUpperCase();

      const catEl = document.getElementById('libPreviewCategory');
      if (catEl) catEl.innerText = ex.category;

      const eqEl = document.getElementById('libPreviewEquipment');
      if (eqEl) eqEl.innerText = ex.equipment || 'None';

      const instEl = document.getElementById('libPreviewInstructions');
      if (instEl) instEl.innerText = ex.instructions || 'Perform with controlled form and full range of motion.';

      const muscleBarsContainer = document.getElementById('libPreviewMuscleBars');
      if (muscleBarsContainer) {
        muscleBarsContainer.innerHTML = '';
        const activations = getMuscleActivations(ex);
        activations.slice(0, 3).forEach(act => {
          const row = document.createElement('div');
          row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 10px;';
          row.innerHTML = `
            <span style="font-size: 0.75rem; color: #E2E8F0; font-weight: 600;">${act.muscle}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 80px; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                <div style="width: ${act.pct}%; height: 100%; background: #38BDF8; border-radius: 3px;"></div>
              </div>
              <span style="font-size: 0.7rem; font-weight: 700; color: #38BDF8; min-width: 28px; text-align: right;">${act.pct}%</span>
            </div>
          `;
          muscleBarsContainer.appendChild(row);
        });
      }

      // Highlight active card in library list
      document.querySelectorAll('.library-exercise-card').forEach(c => {
        const cId = parseInt(c.dataset.exerciseId, 10);
        if (cId === ex.id) {
          c.classList.add('active-preview-card');
          const badge = c.querySelector('.preview-status-pill');
          if (badge) badge.style.display = 'inline-flex';
        } else {
          c.classList.remove('active-preview-card');
          const badge = c.querySelector('.preview-status-pill');
          if (badge) badge.style.display = 'none';
        }
      });

      isLibraryPreviewPlaying = true;
      const playIcon = document.getElementById('libPreviewPlayPauseIcon');
      if (playIcon) playIcon.setAttribute('data-lucide', 'pause');

      startLibraryPreviewAnimation(ex);
      lucide.createIcons();
    };

    window.loadNextLibraryExercise = function(direction) {
      const state = store.get();
      if (!state.exercises || state.exercises.length === 0) return;
      setLibraryPreviewExercise(currentLibraryExerciseIndex + direction);
    };

    window.addCurrentPreviewToWorkout = function() {
      const state = store.get();
      const ex = state.exercises[currentLibraryExerciseIndex];
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
    };

    window.openCinemaModal = function(idOrIdx = 0) {
      const state = store.get();
      if (!state.exercises || state.exercises.length === 0) return;
      let targetIdx = 0;
      if (typeof idOrIdx === 'number') {
        const found = state.exercises.findIndex(e => e.id === idOrIdx);
        targetIdx = found !== -1 ? found : idOrIdx;
      } else if (typeof idOrIdx === 'string') {
        const found = state.exercises.findIndex(e => e.name.toLowerCase().includes(idOrIdx.toLowerCase()));
        targetIdx = found !== -1 ? found : 0;
      }
      openModal('cinemaModal');
      switchModalTab('video');
      loadCinemaExercise(targetIdx);
    };

    window.closeCinemaModal = function() {
      closeModal('cinemaModal');
      if (cinemaAnimFrameId) {
        cancelAnimationFrame(cinemaAnimFrameId);
        cinemaAnimFrameId = null;
      }
      // If currently on exercise library view, resume library video preview
      const libView = document.getElementById('view-library');
      if (libView && libView.classList.contains('active')) {
        setLibraryPreviewExercise(currentLibraryExerciseIndex);
      }
    };

    window.switchModalTab = function(tab) {
      currentModalTab = tab;
      const btnVideo = document.getElementById('tabBtnVideo');
      const btnMuscle = document.getElementById('tabBtnMuscle');
      const btnHowTo = document.getElementById('tabBtnHowTo');
      const overlay = document.getElementById('muscleMapOverlay');
      const howtoSection = document.getElementById('modalInstructionsSection');
      const canvas = document.getElementById('cinemaCanvas');

      [btnVideo, btnMuscle, btnHowTo].forEach(b => b?.classList.remove('active'));

      if (tab === 'video') {
        btnVideo?.classList.add('active');
        if (overlay) overlay.style.display = 'none';
        if (howtoSection) howtoSection.style.display = 'block';
        if (canvas) canvas.style.display = 'block';
      } else if (tab === 'muscle') {
        btnMuscle?.classList.add('active');
        if (overlay) overlay.style.display = 'flex';
        if (howtoSection) howtoSection.style.display = 'none';
        if (canvas) canvas.style.display = 'none';
      } else if (tab === 'howto') {
        btnHowTo?.classList.add('active');
        if (overlay) overlay.style.display = 'none';
        if (howtoSection) howtoSection.style.display = 'block';
        if (canvas) canvas.style.display = 'block';
      }
    };

    window.adjustExerciseMetric = function(delta) {
      cinemaDurationSecs = Math.max(5, cinemaDurationSecs + delta);
      const mins = String(Math.floor(cinemaDurationSecs / 60)).padStart(2, '0');
      const secs = String(cinemaDurationSecs % 60).padStart(2, '0');
      const display = document.getElementById('stepperDisplay');
      if (display) display.innerText = `${mins}:${secs}`;
    };

    window.loadNextExercise = function(direction) {
      const state = store.get();
      if (!state.exercises || state.exercises.length === 0) return;
      loadCinemaExercise((currentCinemaIndex + direction + state.exercises.length) % state.exercises.length);
    };

    window.loadCinemaExercise = function(idx) {
      const state = store.get();
      if (!state.exercises || state.exercises.length === 0) return;
      currentCinemaIndex = (idx + state.exercises.length) % state.exercises.length;
      const ex = state.exercises[currentCinemaIndex];

      const titleEl = document.getElementById('modalExerciseTitle');
      if (titleEl) titleEl.innerText = ex.name.toUpperCase();

      const indexEl = document.getElementById('modalExerciseIndex');
      if (indexEl) indexEl.innerText = `${currentCinemaIndex + 1}/${state.exercises.length}`;

      const instructionsEl = document.getElementById('modalInstructionsText');
      if (instructionsEl) instructionsEl.innerText = ex.instructions || 'Perform with controlled form and full range of motion.';

      const pillsContainer = document.getElementById('modalFocusAreaPills');
      if (pillsContainer) {
        pillsContainer.innerHTML = '';
        const focusAreas = [ex.category];
        if (ex.equipment && ex.equipment !== 'None') focusAreas.push(ex.equipment);
        if (ex.category === 'Cardio') focusAreas.push('Calves', 'Full Body');
        else if (ex.category === 'Chest') focusAreas.push('Triceps', 'Anterior Delts');
        else if (ex.category === 'Back') focusAreas.push('Biceps', 'Latissimus');
        else if (ex.category === 'Quadriceps' || ex.category === 'Legs') focusAreas.push('Glutes', 'Hamstrings');
        else focusAreas.push('Core Stabilizers');

        focusAreas.forEach(area => {
          const badge = document.createElement('span');
          badge.className = 'focus-badge';
          badge.innerText = area;
          pillsContainer.appendChild(badge);
        });
      }

      const muscleList = document.getElementById('muscleDiagramList');
      if (muscleList) {
        muscleList.innerHTML = '';
        const activations = getMuscleActivations(ex);
        activations.forEach(act => {
          const item = document.createElement('div');
          item.style.cssText = 'background: #1E293B; border-radius: 12px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-width: 190px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px;';
          item.innerHTML = `
            <div style="font-size: 0.75rem; font-weight: 700; color: #F8FAFC;">${act.muscle}</div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 50px; height: 6px; background: #334155; border-radius: 3px; overflow: hidden;">
                <div style="width: ${act.pct}%; height: 100%; background: #38BDF8; border-radius: 3px;"></div>
              </div>
              <span style="font-size: 0.7rem; font-weight: 800; color: #38BDF8;">${act.pct}%</span>
            </div>
          `;
          muscleList.appendChild(item);
        });
      }

      startCinemaAnimation(ex);
      lucide.createIcons();
    };

    function renderExerciseLibrary(filterCat = 'ALL', searchTxt = '') {
      const state = store.get();
      const container = document.getElementById('exerciseLibraryCards');
      if (!container) return;
      container.innerHTML = '';

      // Initialize default preview exercise to Jumping Jacks (or 0) if not set
      if (currentLibraryExerciseIndex === -1) {
        const jjIdx = state.exercises.findIndex(e => e.name.toLowerCase().includes('jumping jack'));
        currentLibraryExerciseIndex = jjIdx !== -1 ? jjIdx : 0;
      }

      const filtered = state.exercises.filter(ex => {
        const matchesCat = (filterCat === 'ALL' || ex.category.toLowerCase() === filterCat.toLowerCase());
        const matchesSearch = ex.name.toLowerCase().includes(searchTxt.toLowerCase());
        return matchesCat && matchesSearch;
      });

      filtered.forEach(ex => {
        const isCurrent = state.exercises[currentLibraryExerciseIndex]?.id === ex.id;
        const card = document.createElement('div');
        card.className = `forma-card library-exercise-card ${isCurrent ? 'active-preview-card' : ''}`;
        card.dataset.exerciseId = ex.id;
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">${ex.category} • ${ex.equipment || 'None'}</div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="preview-status-pill active-preview-badge" style="display: ${isCurrent ? 'inline-flex' : 'none'};">
                <i data-lucide="eye" style="width: 10px; height: 10px;"></i> Previewing
              </span>
              <button class="btn btn-ghost" style="padding: 2px 8px; font-size: 0.75rem; border: none; color: #38BDF8;" onclick="event.stopPropagation(); openCinemaModal(${ex.id});" title="Full Cinema Modal">
                <i data-lucide="maximize-2" style="width: 12px; height: 12px; margin-right: 4px;"></i> Demo
              </button>
            </div>
          </div>
          <h3 style="font-size: 1.05rem; font-weight: 700; margin: 4px 0 8px 0; color: #FFF;">${ex.name}</h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">${ex.instructions}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px; margin-top: 6px;">
            <span style="font-size: 0.7rem; color: #38BDF8; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="play-circle" style="width: 13px; height: 13px;"></i> Click to Preview Video
            </span>
            <span style="font-size: 0.7rem; color: var(--text-tertiary); font-weight: 600;">#${ex.id}</span>
          </div>
        `;
        card.addEventListener('click', () => {
          const targetIdx = state.exercises.findIndex(e => e.id === ex.id);
          if (targetIdx !== -1) {
            setLibraryPreviewExercise(targetIdx);
            document.getElementById('libraryVideoPreviewContainer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
        container.appendChild(card);
      });
      lucide.createIcons();

      // Launch video preview immediately upon entering library
      setLibraryPreviewExercise(currentLibraryExerciseIndex);
    }

    function renderProgressPRTable() {
      const state = store.get();
      const tbody = document.getElementById('personalRecordsTableBody');
      tbody.innerHTML = '';

      state.personalRecords.forEach(pr => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--border-subtle)';
        tr.innerHTML = `
          <td style="padding: 10px; font-weight: 600;">${pr.exercise}</td>
          <td style="padding: 10px;">${pr.weight} kg <span style="font-size: 0.75rem; color: var(--text-secondary);">(${pr.reps} reps)</span></td>
          <td style="padding: 10px; font-weight: 700; color: var(--silver-bright);">${pr.est1rm} kg</td>
          <td style="padding: 10px; color: var(--text-secondary); font-size: 0.8125rem;">${pr.date}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderAchievements() {
      const state = store.get();
      const container = document.getElementById('achievementsGrid');
      container.innerHTML = '';

      state.achievements.forEach(ach => {
        const card = document.createElement('div');
        card.className = 'forma-card';
        card.style.opacity = ach.earned ? '1' : '0.4';
        card.innerHTML = `
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 8px; background: #222; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-medium);">
              <i data-lucide="${ach.icon}" style="width: 22px; height: 22px; color: ${ach.earned ? 'var(--silver-accent)' : 'var(--text-tertiary)'};"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.9375rem;">${ach.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">${ach.desc}</div>
              <div style="font-size: 0.65rem; font-weight: 700; margin-top: 4px; color: ${ach.earned ? 'var(--status-success)' : 'var(--text-tertiary)'};">
                ${ach.earned ? '✓ UNLOCKED' : 'LOCKED MILESTONE'}
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
      lucide.createIcons();
    }

