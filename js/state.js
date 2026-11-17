    /* --------------------------------------------------------------------------
       1. RELATIONAL DATABASE & STATE STORAGE (Persistent in LocalStorage)
       -------------------------------------------------------------------------- */
    const FORMA_DB_KEY = 'forma_production_state_v1';

    const defaultInitialState = {
      user: {
        name: 'Vikram Malhotra',
        age: 28,
        gender: 'male',
        height_cm: 180,
        weight_kg: 78.5,
        goal: 'muscle_gain',
        activity: 'moderately_active',
        streak_days: 14
      },
      targets: {
        calories: 2750,
        protein: 173,
        carbs: 340,
        fats: 75,
        water_ml: 3500
      },
      exercises: [
        { id: 1, name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', instructions: 'Retract scapulae, touch lower sternum, drive upwards without elbow flaring.' },
        { id: 2, name: 'Conventional Deadlift', category: 'Back', equipment: 'Barbell', instructions: 'Hinge at hips, maintain rigid lumbar curvature, pull the floor away.' },
        { id: 3, name: 'Barbell Back Squat', category: 'Quadriceps', equipment: 'Barbell', instructions: 'Break parallel depth, maintain neutral thoracic spine, drive heels.' },
        { id: 4, name: 'Pull-Up', category: 'Back', equipment: 'Pull-up Bar', instructions: 'Full dead-hang to chin over bar without swinging or kipping.' },
        { id: 5, name: 'Standing Overhead Press', category: 'Shoulders', equipment: 'Barbell', instructions: 'Brace core and glutes, press bar overhead in vertical plane.' },
        { id: 6, name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbells', instructions: 'Set bench to 30 degrees, full clavicular stretch at bottom.' },
        { id: 7, name: 'Barbell Romanian Deadlift', category: 'Hamstrings', equipment: 'Barbell', instructions: 'Soft knees, push hips backward until deep hamstring tension.' },
        { id: 8, name: 'Standard Push-Up', category: 'Chest', equipment: 'None', instructions: 'Rigid plank posture, chest to 2cm off floor, lock out elbows.' },
        { id: 9, name: 'Jumping Jacks', category: 'Cardio', equipment: 'None', instructions: 'Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.' }
      ],
      programs: [
        { id: 1, title: 'Push Pull Legs (PPL)', days: 6, level: 'Intermediate', focus: 'Hypertrophy', desc: 'Mechanical tension protocol with dedicated push, pull, and leg sessions.', sampleExercises: [1, 6] },
        { id: 2, title: 'Upper / Lower Split', days: 4, level: 'Intermediate', focus: 'Strength & Mass', desc: 'Optimal frequency balancing heavy compound loads with structural balance.', sampleExercises: [1, 2, 3] },
        { id: 3, title: 'Beginner Full Body', days: 3, level: 'Beginner', focus: 'Foundational Strength', desc: 'Neuromuscular barbell development performed on alternating training days.', sampleExercises: [3, 1, 4] },
        { id: 4, title: 'Home Calisthenics Mastery', days: 4, level: 'Intermediate', focus: 'Bodyweight Mastery', desc: 'Progressive levers, handstand variations, and explosive pulling power.', sampleExercises: [4, 8] },
        { id: 5, title: 'Maximum Hypertrophy (Bro Split)', days: 5, level: 'Advanced', focus: 'Muscle Growth', desc: 'Isolated target volume dedicating singular workouts to dedicated muscle groups.', sampleExercises: [1, 5] },
        { id: 6, title: 'Strength Protocol 5x5', days: 3, level: 'Intermediate', focus: 'Pure Strength', desc: 'High load intensity centered strictly on Squat, Bench, and Deadlift triples.', sampleExercises: [3, 1, 2] },
        { id: 7, title: 'Fat Loss & Conditioning', days: 4, level: 'All Levels', focus: 'Metabolic Conditioning', desc: 'Compound lifting coupled with timed rest periods to drive caloric expenditure.', sampleExercises: [3, 8] },
        { id: 8, title: 'Athletic Performance', days: 4, level: 'Advanced', focus: 'Power & Speed', desc: 'Triphasic training enhancing sprint deceleration and vertical power output.', sampleExercises: [2, 3] },
        { id: 9, title: 'Mobility & Structural Longevity', days: 3, level: 'All Levels', focus: 'Joint Health', desc: 'End-range joint control, thoracic rotational capacity, and spine health.', sampleExercises: [8] },
        { id: 10, title: 'Arm & Shoulder Specialization', days: 4, level: 'Intermediate', focus: 'Hypertrophy', desc: 'High-density peripheral supersets for lateral delts, biceps, and triceps.', sampleExercises: [5, 6] }
      ],
      foods: [
        { id: 1, name: 'Cooked Chapati (Whole Wheat Roti)', cal100: 297, pro100: 10.5, carb100: 58.0, fat100: 3.5 },
        { id: 2, name: 'Raw Paneer (Cottage Cheese)', cal100: 265, pro100: 18.3, carb100: 3.4, fat100: 20.8 },
        { id: 3, name: 'Cooked Basmati Rice', cal100: 130, pro100: 2.7, carb100: 28.2, fat100: 0.3 },
        { id: 4, name: 'Cooked Yellow Moong Dal', cal100: 105, pro100: 7.1, carb100: 14.2, fat100: 2.4 },
        { id: 5, name: 'Plain Curd (Dahi / Yogurt)', cal100: 61, pro100: 3.5, carb100: 4.7, fat100: 3.3 },
        { id: 6, name: 'Raw Chicken Breast', cal100: 120, pro100: 22.5, carb100: 0.0, fat100: 2.6 },
        { id: 7, name: 'Whole Large Egg', cal100: 143, pro100: 12.6, carb100: 0.7, fat100: 9.5 },
        { id: 8, name: 'Rolled Oats (Raw)', cal100: 389, pro100: 16.9, carb100: 66.3, fat100: 6.9 },
        { id: 9, name: 'Natural Peanut Butter', cal100: 588, pro100: 25.1, carb100: 20.0, fat100: 50.4 },
        { id: 10, name: 'Fresh Banana', cal100: 89, pro100: 1.1, carb100: 22.8, fat100: 0.3 }
      ],
      loggedMeals: [
        { id: 1, slot: 'breakfast', foodId: 8, grams: 80 },  // Oats
        { id: 2, slot: 'breakfast', foodId: 7, grams: 120 }, // Eggs
        { id: 3, slot: 'lunch', foodId: 6, grams: 200 },     // Chicken
        { id: 4, slot: 'lunch', foodId: 3, grams: 250 }      // Rice
      ],
      bodyMetrics: [
        { date: '2025-05-01', weight: 80.0 },
        { date: '2025-05-08', weight: 79.6 },
        { date: '2025-05-15', weight: 79.1 },
        { date: '2025-05-22', weight: 78.8 },
        { date: '2025-05-29', weight: 78.5 }
      ],
      personalRecords: [
        { exercise: 'Barbell Bench Press', weight: 115, reps: 5, est1rm: 129.4, date: '2025-05-14' },
        { exercise: 'Conventional Deadlift', weight: 180, reps: 3, est1rm: 190.5, date: '2025-05-18' },
        { exercise: 'Barbell Back Squat', weight: 145, reps: 4, est1rm: 158.2, date: '2025-05-22' }
      ],
      achievements: [
        { code: 'initiation', title: 'Initiation Protocol', desc: 'Logged first workout session.', icon: 'award', earned: true },
        { code: 'streak_10', title: 'Deca Consistency', desc: '10+ Days active fitness tracking streak.', icon: 'flame', earned: true },
        { code: 'century_bench', title: 'Triple Digit Club', desc: 'Bench pressed 100+ kg recorded.', icon: 'zap', earned: true },
        { code: 'volume_100k', title: 'Tonnage Titan', desc: 'Moved 100,000 kg external load volume.', icon: 'trophy', earned: false }
      ],
      water_ml: 2250,
      activeWorkout: null
    };

    class StateStore {
      constructor() {
        const stored = localStorage.getItem(FORMA_DB_KEY);
        if (stored) {
          try { 
            this.state = JSON.parse(stored);
            if (!this.state.exercises.some(e => e.name.toLowerCase().includes('jumping jack'))) {
              this.state.exercises.push({ id: 9, name: 'Jumping Jacks', category: 'Cardio', equipment: 'None', instructions: 'Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.' });
            }
          } catch(e) { this.state = defaultInitialState; }
        } else {
          this.state = defaultInitialState;
          this.save();
        }
      }

      save() {
        localStorage.setItem(FORMA_DB_KEY, JSON.stringify(this.state));
      }

      get() { return this.state; }

      updateUser(fields) {
        Object.assign(this.state.user, fields);
        this.recomputeMetabolism();
        this.save();
      }

      recomputeMetabolism() {
        const u = this.state.user;
        // Mifflin-St Jeor Formula
        let bmr = (10 * u.weight_kg) + (6.25 * u.height_cm) - (5 * u.age);
        bmr += (u.gender === 'female') ? -161 : 5;
        bmr = Math.round(bmr);

        const multipliers = {
          sedentary: 1.2,
          lightly_active: 1.375,
          moderately_active: 1.55,
          very_active: 1.725
        };
        const tdee = Math.round(bmr * (multipliers[u.activity] || 1.55));

        let targetCal = tdee;
        if (u.goal === 'muscle_gain') targetCal = Math.round(tdee * 1.10);
        if (u.goal === 'fat_loss') targetCal = Math.round(tdee * 0.80);

        const targetPro = Math.round(u.weight_kg * (u.goal === 'fat_loss' ? 2.2 : 2.0));
        const targetFat = Math.round((targetCal * 0.25) / 9);
        const targetCarb = Math.round((targetCal - ((targetPro * 4) + (targetFat * 9))) / 4);

        this.state.targets = {
          calories: targetCal,
          protein: targetPro,
          carbs: targetCarb,
          fats: targetFat,
          water_ml: Math.round(u.weight_kg * 40)
        };
      }
    }

    const store = new StateStore();

