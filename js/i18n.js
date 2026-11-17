/* ==========================================================================
   FORMA MULTI-LANGUAGE SYSTEM & NATURAL KANNADA (ಕನ್ನಡ) ENGINE
   High-Fidelity Regional Localization with Instant Live Switching & Multi-Device Sync
   ========================================================================== */

(function() {
  'use strict';

  const LANG_STORAGE_KEY = 'forma_user_language';

  // Available Languages Configuration
  const SUPPORTED_LANGUAGES = {
    en: { name: 'English', native: 'English', flag: '🇬🇧', dir: 'ltr' },
    kn: { name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr', fontClass: 'lang-kn' },
    hi: { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', dir: 'ltr', fontClass: 'lang-hi' },
    ta: { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', dir: 'ltr', fontClass: 'lang-ta' },
    te: { name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', dir: 'ltr', fontClass: 'lang-te' },
    ml: { name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', dir: 'ltr', fontClass: 'lang-ml' }
  };

  // Natural Translations Glossary
  const TRANSLATIONS = {
    // ------------------------------------------------------------------------
    // ENGLISH (Default)
    // ------------------------------------------------------------------------
    en: {
      // Navigation
      nav_dashboard: "Dashboard",
      nav_workout: "Workout Tracker",
      nav_programs: "Training Programs",
      nav_library: "Exercise Library",
      nav_nutrition: "Meal Tracker",
      nav_progress: "Progress & Metrics",
      nav_recovery: "Recovery & Sleep",
      nav_achievements: "Achievements",
      nav_profile: "Profile & Targets",

      // Top Header
      sys_core_synced: "PERSISTENT CORE: SYNCHRONIZED",
      auth_signin_register: "SIGN IN / REGISTER",
      auth_athlete_account: "ATHLETE ACCOUNT",
      db_cloud_synced: "CLOUD SYNCED",
      db_local_offline: "LOCAL OFFLINE",
      btn_log_food: "Log Food",
      btn_start_session: "Start Session",

      // Hero Banner
      hero_stream_linked: "BIOMETRIC STREAM LINKED",
      hero_welcome: "Welcome back,",
      hero_readiness_desc: "Physical readiness is currently 94% Optimal. Maintain your 14-day progressive training streak today.",
      hero_pill_protocol: "HYPERTROPHY SURPLUS",
      hero_pill_readiness: "OPTIMAL (94/100)",
      hero_pill_kinematics: "60 FPS ACTIVE",
      btn_resume_workout: "Resume Workout",
      btn_daily_fuel: "Daily Fuel",

      // Metric Tiles
      metric_streak_title: "Consistency Streak",
      metric_streak_unit: "Days",
      metric_streak_sub: "Consecutive performance target",
      metric_cal_title: "Daily Calories",
      metric_cal_sub: "Active metabolic energy balance",
      metric_pro_title: "Protein Intake",
      metric_pro_sub: "Muscle protein synthesis partition",
      metric_vol_title: "Weekly Training Volume",
      metric_vol_unit: "kg",
      metric_vol_sub: "Cumulative external tonnage",
      metric_water_title: "Hydration Level",
      metric_water_sub: "Live Water Bottle Sync",

      // Volume & Macro Charts
      chart_vol_title: "Volume Load Trajectory (kg)",
      chart_vol_sub: "Cumulative work volume across progressive training cycles",
      chart_7_sessions: "7 SESSIONS",
      chart_30_days: "30 DAYS",
      chart_macro_title: "Macronutrient Proportions",
      chart_macro_sub: "Today's Ratio",
      macro_carbs: "Carbs",
      macro_protein: "Protein",
      macro_fats: "Fats",

      // Daily Goals Panel
      goals_panel_title: "Daily Targets & Goals",
      goals_panel_sub: "Real-time performance completion",
      goals_today: "TODAY",
      goals_done: "Done",
      goals_milestone_title: "Daily Milestone",
      goals_milestone_desc: "Complete your nutrition intake & active training set.",
      goal_cal_title: "Caloric Energy Target",
      goal_cal_desc: "Surplus fueling requirement",
      goal_pro_title: "Protein Allocation",
      goal_pro_desc: "Hypertrophy synthesis requirement",
      goal_water_title: "Hydration (3.0L Goal)",
      goal_water_desc: "Intracellular water intake",
      goal_workout_title: "Resistance Workout",
      goal_workout_desc: "Push hypertrophy split",
      goal_status_ready: "Ready",
      goal_status_progress: "In Progress",
      goal_status_completed: "Completed",

      // Active Workout Banner on Dashboard
      active_training_label: "Active Training Assignment",
      active_assigned_title: "Upper Body Strength (Push Focus)",
      active_assigned_desc: "4 exercises • Estimated 50 min duration • Progressive overload protocol",
      btn_load_tracker: "Load Into Tracker",

      // Workout Tracker View
      wt_title: "Active Workout Session",
      wt_sub: "Real-time set logging with Brzycki 1RM computation and audio rest countdown",
      wt_add_ex: "Add Exercise",
      wt_cancel: "Cancel",
      wt_finish: "Finish Workout",
      wt_elapsed: "Elapsed",
      wt_volume: "External Volume",
      wt_sets: "Completed Sets",
      wt_rest_timer: "REST",
      wt_set: "SET",
      wt_prev: "PREV",
      wt_kg: "KG",
      wt_reps: "REPS",
      wt_est_1rm: "EST. 1RM",
      wt_action: "ACTION",

      // Programs View
      prog_title: "Periodized Training Programs",
      prog_sub: "Structured 10-program catalog with double-progression schemes",
      prog_days: "days/week",
      prog_start: "Start Program",

      // Exercise Library
      lib_title: "Biomechanical Exercise Directory",
      lib_live_preview: "LIVE PREVIEW",
      lib_sub: "Real-time humanoid biomechanics, target muscle activations & kinematic form",
      lib_custom_btn: "Custom Exercise",
      lib_demo_label: "Live Exercise Demonstration",
      lib_fullscreen: "Fullscreen Cinema",
      lib_search_ph: "Search exercises (e.g., Squat, Pull-Up, Bench)...",
      lib_all_muscles: "All Muscle Groups",
      lib_prime_movers: "Prime Movers & Target Activation",
      lib_add_to_log: "Add to Workout Log",

      // Meal Tracker (Hunter HUD)
      meal_title: "Hunter System — Meal & Biometric Tracker",
      meal_synced: "SYNCED • FUEL HUD",
      meal_sub: "Tactical macronutrient partition, dynamic hydration logs & weekly prep protocol",
      meal_btn_log: "+ LOG MEAL",
      meal_daily_progress: "Daily Progress",
      meal_edit_targets: "Edit Targets",
      meal_water_label: "WATER",
      meal_liters_goal: "LITERS (3L GOAL)",
      meal_add_bottle: "+ 1L BOTTLE",
      meal_bottle_1: "BOTTLE 1",
      meal_bottle_2: "BOTTLE 2",
      meal_bottle_3: "BOTTLE 3",
      meal_log_title: "Log Meal",
      meal_favorites: "FAVORITES",
      meal_add_btn: "+ ADD",
      meal_empty: "No meals logged for this day. Tap + Add to start tracking.",
      meal_7day_title: "7-Day Overview",
      meal_prep_title: "Meal Prep Plan",
      meal_add_prep: "+ ADD PREP MEAL",

      // Progress View
      pr_title: "Progress Analytics & Metrics",
      pr_sub: "Biometric trendlines and personal record verification",
      pr_export_csv: "Export Data (CSV)",
      pr_log_weighin: "Log Weigh-In",
      pr_chart_title: "Body Mass Progression (kg)",
      pr_chart_sub: "Historical weigh-ins",
      pr_records_title: "Verified Personal Records (1RM Brzycki Calculation)",
      pr_th_exercise: "Exercise",
      pr_th_peak: "Peak Weight",
      pr_th_1rm: "Est. 1RM",
      pr_th_date: "Date Logged",

      // Recovery View
      rec_title: "Recovery & Hydration Tracker",
      rec_sub: "Sleep duration, neuromuscular readiness, and daily water balances",
      rec_water_label: "Hydration Intake",
      rec_sleep_label: "Sleep Quantity",
      rec_sleep_score: "Deep/REM Recovery Score: 88/100",
      rec_readiness_label: "Readiness Index",
      rec_readiness_val: "OPTIMAL",
      rec_readiness_sub: "Central Nervous System primed for resistance loads",
      rec_log_title: "Log Sleep & Muscle Soreness Check-In",
      rec_sleep_hours: "Sleep Duration (Hours)",
      rec_sleep_qual: "Sleep Quality (1-5)",
      rec_soreness: "Muscle Soreness Index",
      rec_record_btn: "Record Recovery Metric",

      // Achievements View
      ach_title: "Performance Badges & Milestones",
      ach_sub: "Milestones earned strictly through verified database logging",

      // Profile & Settings View
      prof_title: "Athlete Profile & Mifflin-St Jeor Engine",
      prof_sub: "Scientific metabolic basal calculations and customized macro partitioning",
      prof_params_title: "Physical Parameters",
      prof_name: "Full Name",
      prof_age: "Age",
      prof_gender: "Gender",
      prof_gender_male: "Male",
      prof_gender_female: "Female",
      prof_height: "Height (cm)",
      prof_weight: "Weight (kg)",
      prof_goal: "Primary Objective",
      prof_goal_muscle: "Muscle Gain (Hypertrophy Surplus)",
      prof_goal_fatloss: "Fat Loss (Deficit Protocol)",
      prof_goal_strength: "Pure Strength Peak",
      prof_goal_maint: "Maintenance & Longevity",
      prof_activity: "Activity Level",
      prof_act_sedentary: "Sedentary (Desk work)",
      prof_act_light: "Lightly Active (1-3 days/wk)",
      prof_act_mod: "Moderately Active (3-5 days/wk)",
      prof_act_very: "Very Active (6-7 days intense)",
      prof_recompute_btn: "Recompute Energy Baselines",
      prof_calc_title: "Calculated Metabolic Output",
      prof_bmr_title: "Basal Metabolic Rate (BMR)",
      prof_bmr_sub: "Energy consumed at complete rest via Mifflin-St Jeor formula",
      prof_tdee_title: "Total Daily Energy Expenditure (TDEE)",
      prof_tdee_sub: "Estimated maintenance calories based on activity factor",
      prof_partition_title: "Calculated Daily Target Partition",

      // Language Preferences Section
      lang_section_title: "Language & Regional Localization",
      lang_section_sub: "Choose your primary language. Switches instantly across dashboard, workouts, and nutrition without page reload.",
      lang_select_label: "Active Platform Language",

      // Modals & General
      modal_close: "Close",
      modal_cancel: "Cancel",
      modal_save: "Save",
      modal_commit: "Commit to Daily Nutrition",

      // Toasts
      toast_lang_changed: "Language changed successfully to English",
      toast_workout_started: "Workout session initialized",
      toast_workout_finished: "Workout saved to training history!",
      toast_weighin_saved: "Weigh-in recorded successfully.",
      toast_profile_updated: "Profile updated & baselines recalculated.",
      toast_food_logged: "Food item logged successfully."
    },

    // ------------------------------------------------------------------------
    // KANNADA (ಕನ್ನಡ) - Primary Regional Language (Natural, Modern, Fluent)
    // ------------------------------------------------------------------------
    kn: {
      // Navigation
      nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      nav_workout: "ವ್ಯಾಯಾಮ ಟ್ರ್ಯಾಕರ್",
      nav_programs: "ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮಗಳು",
      nav_library: "ವ್ಯಾಯಾಮ ಲೈಬ್ರರಿ",
      nav_nutrition: "ಆಹಾರ ಟ್ರ್ಯಾಕರ್",
      nav_progress: "ಪ್ರಗತಿ ಮತ್ತು ಮಾಪನಗಳು",
      nav_recovery: "ಚೇತರಿಕೆ ಮತ್ತು ನಿದ್ರೆ",
      nav_achievements: "ಸಾಧನೆಗಳು",
      nav_profile: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಗುರಿಗಳು",

      // Top Header
      sys_core_synced: "ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ: ಸಿಂಕ್ ಆಗಿದೆ",
      auth_signin_register: "ಸೈನ್ ಇನ್ / ನೋಂದಾಯಿಸಿ",
      auth_athlete_account: "ಖಾತೆ ವಿವರಗಳು",
      db_cloud_synced: "ಕ್ಲೌಡ್ ಸಿಂಕ್ ಆಗಿದೆ",
      db_local_offline: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
      btn_log_food: "+ ಆಹಾರ ನಮೂದಿಸಿ",
      btn_start_session: "ವ್ಯಾಯಾಮ ಪ್ರಾರಂಭಿಸಿ",

      // Hero Banner
      hero_stream_linked: "ಬಯೋಮೆಟ್ರಿಕ್ ಲೈವ್ ಸ್ಟ್ರೀಮ್",
      hero_welcome: "ಮರಳಿ ಸುಸ್ವಾಗತ,",
      hero_readiness_desc: "ನಿಮ್ಮ ಶಾರೀರಿಕ ಸಿದ್ಧತೆ 94% ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ನಿಮ್ಮ 14 ದಿನಗಳ ನಿರಂತರ ತರಬೇತಿ ಸರಣಿಯನ್ನು ಮುಂದುವರಿಸಿ.",
      hero_pill_protocol: "ಸ್ನಾಯು ಬೆಳವಣಿಗೆ (ಸರ್ಪ್ಲಸ್)",
      hero_pill_readiness: "ಸಿದ್ಧತೆ: ಅತ್ಯುತ್ತಮ (94/100)",
      hero_pill_kinematics: "60 FPS ಚಲನಶಾಸ್ತ್ರ",
      btn_resume_workout: "ವ್ಯಾಯಾಮ ಮುಂದುವರಿಸಿ",
      btn_daily_fuel: "ದೈನಂದಿನ ಪೋಷಕಾಂಶ",

      // Metric Tiles
      metric_streak_title: "ಸ್ಥಿರತೆಯ ದಿನಗಳು",
      metric_streak_unit: "ದಿನಗಳು",
      metric_streak_sub: "ನಿರಂತರ ತರಬೇತಿ ಗುರಿ",
      metric_cal_title: "ದೈನಂದಿನ ಕ್ಯಾಲೊರಿಗಳು",
      metric_cal_sub: "ದೈನಂದಿನ ಶಕ್ತಿಯ ಸಮತೋಲನ",
      metric_pro_title: "ಪ್ರೋಟೀನ್ ಸೇವನೆ",
      metric_pro_sub: "ಸ್ನಾಯು ಪುನರುಜ್ಜೀವನದ ಗುರಿ",
      metric_vol_title: "ವಾರದ ಒಟ್ಟು ತೂಕ (ವಾಲ್ಯೂಮ್)",
      metric_vol_unit: "ಕೆ.ಜಿ",
      metric_vol_sub: "ಎತ್ತಿದ ಒಟ್ಟು ಭಾರದ ಮೊತ್ತ",
      metric_water_title: "ನೀರಿನ ಮಟ್ಟ (ಜಲಸಂಚಯನ)",
      metric_water_sub: "ಲೈವ್ ವಾಟರ್ ಬಾಟಲ್ ಸಿಂಕ್",

      // Volume & Macro Charts
      chart_vol_title: "ತರಬೇತಿ ತೂಕದ ಪ್ರಗತಿ (ಕೆ.ಜಿ)",
      chart_vol_sub: "ಹಿಂದಿನ ಸೆಷನ್‌ಗಳಲ್ಲಿ ಎತ್ತಲಾದ ಒಟ್ಟು ತೂಕದ ಪ್ರಗತಿ",
      chart_7_sessions: "7 ಸೆಷನ್‌ಗಳು",
      chart_30_days: "30 ದಿನಗಳು",
      chart_macro_title: "ಪೋಷಕಾಂಶಗಳ ಪ್ರಮಾಣ (ಮ್ಯಾಕ್ರೋ)",
      chart_macro_sub: "ಇಂದಿನ ಅನುಪಾತ",
      macro_carbs: "ಕಾರ್ಬ್ಸ್",
      macro_protein: "ಪ್ರೋಟೀನ್",
      macro_fats: "ಕೊಬ್ಬು",

      // Daily Goals Panel
      goals_panel_title: "ದೈನಂದಿನ ಗುರಿಗಳು",
      goals_panel_sub: "ನೈಜ ಸಮಯದಲ್ಲಿ ಗುರಿಗಳ ಪೂರ್ಣತೆ",
      goals_today: "ಇಂದು",
      goals_done: "ಪೂರ್ಣ",
      goals_milestone_title: "ದೈನಂದಿನ ಮೈಲಿಗಲ್ಲು",
      goals_milestone_desc: "ಇಂದಿನ ಪೌಷ್ಟಿಕಾಂಶ ಸೇವನೆ ಮತ್ತು ತರಬೇತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
      goal_cal_title: "ಕ್ಯಾಲೊರಿ ಶಕ್ತಿಯ ಗುರಿ",
      goal_cal_desc: "ಶಕ್ತಿ ಮತ್ತು ಸ್ನಾಯು ಬೆಳವಣಿಗೆಯ ಆಹಾರ",
      goal_pro_title: "ಪ್ರೋಟೀನ್ ಹಂಚಿಕೆ",
      goal_pro_desc: "ಸ್ನಾಯು ನಿರ್ಮಾಣದ ಅಗತ್ಯ ಪ್ರಮಾಣ",
      goal_water_title: "ನೀರು ಸೇವನೆ (3.0 ಲೀಟರ್ ಗುರಿ)",
      goal_water_desc: "ದೇಹದ ಜಲಸಂಚಯನದ ಗುರಿ",
      goal_workout_title: "ವ್ಯಾಯಾಮ ಸೆಷನ್",
      goal_workout_desc: "ಮೇಲ್ಭಾಗದ ಪುಶ್ ತರಬೇತಿ",
      goal_status_ready: "ಸಿದ್ಧವಾಗಿದೆ",
      goal_status_progress: "ನಡೆಯುತ್ತಿದೆ",
      goal_status_completed: "ಪೂರ್ಣಗೊಂಡಿದೆ",

      // Active Workout Banner on Dashboard
      active_training_label: "ಇಂದಿನ ನಿಗದಿತ ತರಬೇತಿ",
      active_assigned_title: "ದೇಹದ ಮೇಲ್ಭಾಗದ ಶಕ್ತಿ ತರಬೇತಿ (ಪುಶ್)",
      active_assigned_desc: "4 ವ್ಯಾಯಾಮಗಳು • ಅಂದಾಜು 50 ನಿಮಿಷಗಳು • ಪ್ರೋಗ್ರೆಸಿವ್ ಓವರ್‌ಲೋಡ್",
      btn_load_tracker: "ಟ್ರ್ಯಾಕರ್‌ಗೆ ಲೋಡ್ ಮಾಡಿ",

      // Workout Tracker View
      wt_title: "ಪ್ರಸ್ತುತ ವ್ಯಾಯಾಮ ಸೆಷನ್",
      wt_sub: "ನೈಜ ಸಮಯದಲ್ಲಿ ಸೆಟ್‌ಗಳ ದಾಖಲಾತಿ, 1RM ಅಂದಾಜು ಮತ್ತು ವಿಶ್ರಾಂತಿ ಕೌಂಟ್‌ಡೌನ್",
      wt_add_ex: "+ ವ್ಯಾಯಾಮ ಸೇರಿಸಿ",
      wt_cancel: "ರದ್ದುಮಾಡಿ",
      wt_finish: "ವ್ಯಾಯಾಮ ಪೂರ್ಣಗೊಳಿಸಿ",
      wt_elapsed: "ಕಳೆದ ಸಮಯ",
      wt_volume: "ಒಟ್ಟು ತೂಕ",
      wt_sets: "ಪೂರ್ಣಗೊಂಡ ಸೆಟ್‌ಗಳು",
      wt_rest_timer: "ವಿಶ್ರಾಂತಿ",
      wt_set: "ಸೆಟ್",
      wt_prev: "ಹಿಂದಿನದ್ದು",
      wt_kg: "ಕೆ.ಜಿ",
      wt_reps: "ರೆಪ್ಸ್",
      wt_est_1rm: "ಅಂದಾಜು 1RM",
      wt_action: "ಕ್ರಿಯೆ",

      // Programs View
      prog_title: "ವೈಜ್ಞಾನಿಕ ತರಬೇತಿ ಕಾರ್ಯಕ್ರಮಗಳು",
      prog_sub: "ವಿವಿಧ ಹಂತಗಳಿಗಾಗಿ ರಚಿಸಲಾದ 10 ಸಮಗ್ರ ತರಬೇತಿ ಪ್ರೋಟೋಕಾಲ್‌ಗಳು",
      prog_days: "ದಿನಗಳು/ವಾರ",
      prog_start: "ಕಾರ್ಯಕ್ರಮ ಪ್ರಾರಂಭಿಸಿ",

      // Exercise Library
      lib_title: "ವ್ಯಾಯಾಮಗಳ ಸಮಗ್ರ ಡೈರೆಕ್ಟರಿ",
      lib_live_preview: "ಲೈವ್ ಪ್ರಿವ್ಯೂ",
      lib_sub: "ನೈಜ ಸಮಯದ ಮಾನವ ಬಯೋಮೆಕಾನಿಕ್ಸ್, ಸ್ನಾಯುಗಳ ಚಟುವಟಿಕೆ ಮತ್ತು ಸರಿಯಾದ ಭಂಗಿ",
      lib_custom_btn: "+ ಸ್ವಂತ ವ್ಯಾಯಾಮ ಸೇರಿಸಿ",
      lib_demo_label: "ಲೈವ್ ವ್ಯಾಯಾಮ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ",
      lib_fullscreen: "ಪೂರ್ಣ ಪರದೆ ಸಿನಿಮಾ",
      lib_search_ph: "ವ್ಯಾಯಾಮ ಹುಡುಕಿ (ಉದಾ: ಸ್ಕ್ವಾಟ್, ಪುಲ್-ಅಪ್, ಬೆಂಚ್ ಪ್ರೆಸ್)...",
      lib_all_muscles: "ಎಲ್ಲಾ ಸ್ನಾಯು ಗುಂಪುಗಳು",
      lib_prime_movers: "ಮುಖ್ಯ ಸ್ನಾಯುಗಳು ಮತ್ತು ಸಕ್ರಿಯತೆ",
      lib_add_to_log: "+ ವ್ಯಾಯಾಮ ಲಾಗ್‌ಗೆ ಸೇರಿಸಿ",

      // Meal Tracker (Hunter HUD)
      meal_title: "ಹಂಟರ್ ಸಿಸ್ಟಮ್ — ಆಹಾರ ಮತ್ತು ಬಯೋಮೆಟ್ರಿಕ್ ಟ್ರ್ಯಾಕರ್",
      meal_synced: "ಸಿಂಕ್ ಆಗಿದೆ • ಪೋಷಕಾಂಶ HUD",
      meal_sub: "ಪೋಷಕಾಂಶಗಳ ವಿಭಜನೆ, ಲೈವ್ ನೀರಿನ ಲೆಕ್ಕ ಮತ್ತು ವಾರದ ಮೀಲ್ ಪ್ರೆಪ್ ಯೋಜನೆ",
      meal_btn_log: "+ ಊಟ ನಮೂದಿಸಿ",
      meal_daily_progress: "ದೈನಂದಿನ ಪ್ರಗತಿ",
      meal_edit_targets: "ಗುರಿಗಳನ್ನು ಬದಲಾಯಿಸಿ",
      meal_water_label: "ನೀರು",
      meal_liters_goal: "ಲೀಟರ್ (3L ಗುರಿ)",
      meal_add_bottle: "+ 1 ಲೀಟರ್ ಬಾಟಲ್",
      meal_bottle_1: "ಬಾಟಲ್ 1",
      meal_bottle_2: "ಬಾಟಲ್ 2",
      meal_bottle_3: "ಬಾಟಲ್ 3",
      meal_log_title: "ಊಟ ದಾಖಲಿಸಿ",
      meal_favorites: "ಮೆಚ್ಚಿನವುಗಳು",
      meal_add_btn: "+ ಸೇರಿಸಿ",
      meal_empty: "ಈ ದಿನ ಯಾವುದೇ ಆಹಾರ ದಾಖಲಾಗಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು + ಸೇರಿಸಿ ಒತ್ತಿ.",
      meal_7day_title: "7 ದಿನಗಳ ಅವಲೋಕನ",
      meal_prep_title: "ಆಹಾರ ತಯಾರಿ ಯೋಜನೆ (ಮೀಲ್ ಪ್ರೆಪ್)",
      meal_add_prep: "+ ಪ್ರೆಪ್ ಊಟ ಸೇರಿಸಿ",

      // Progress View
      pr_title: "ಪ್ರಗತಿ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಅಂಕಿಅಂಶಗಳು",
      pr_sub: "ದೇಹದ ತೂಕದ ಬದಲಾವಣೆ ಮತ್ತು ವೈಯಕ್ತಿಕ ದಾಖಲೆಗಳ ಪರಿಶೀಲನೆ",
      pr_export_csv: "ಡೇಟಾ ಡೌನ್‌ಲೋಡ್ (CSV)",
      pr_log_weighin: "+ ತೂಕ ನಮೂದಿಸಿ",
      pr_chart_title: "ದೇಹದ ತೂಕದ ಪ್ರಗತಿ (ಕೆ.ಜಿ)",
      pr_chart_sub: "ಹಿಂದಿನ ತೂಕದ ಇತಿಹಾಸ",
      pr_records_title: "ದೃಢೀಕರಿಸಿದ ವೈಯಕ್ತಿಕ ದಾಖಲೆಗಳು (1RM ಬ್ರಜಿಕಿ ಲೆಕ್ಕಾಚಾರ)",
      pr_th_exercise: "ವ್ಯಾಯಾಮ",
      pr_th_peak: "ಗರಿಷ್ಠ ತೂಕ",
      pr_th_1rm: "ಅಂದಾಜು 1RM",
      pr_th_date: "ದಾಖಲಿಸಿದ ದಿನಾಂಕ",

      // Recovery View
      rec_title: "ಚೇತರಿಕೆ ಮತ್ತು ಜಲಸಂಚಯನ ಟ್ರ್ಯಾಕರ್",
      rec_sub: "ನಿದ್ರೆಯ ಅವಧಿ, ನರಮಂಡಲದ ಸಿದ್ಧತೆ ಮತ್ತು ದೈನಂದಿನ ನೀರಿನ ಪ್ರಮಾಣ",
      rec_water_label: "ನೀರಿನ ಸೇವನೆ",
      rec_sleep_label: "ನಿದ್ರೆಯ ಪ್ರಮಾಣ",
      rec_sleep_score: "ಆಳವಾದ ನಿದ್ರೆಯ ಚೇತರಿಕೆ ಅಂಕ: 88/100",
      rec_readiness_label: "ಸಿದ್ಧತಾ ಸೂಚ್ಯಂಕ",
      rec_readiness_val: "ಅತ್ಯುತ್ತಮ (OPTIMAL)",
      rec_readiness_sub: "ಕೇಂದ್ರೀಯ ನರಮಂಡಲವು ತೂಕ ಎತ್ತಲು ಸಂಪೂರ್ಣ ಸಿದ್ಧವಾಗಿದೆ",
      rec_log_title: "ನಿದ್ರೆ ಮತ್ತು ಸ್ನಾಯು ನೋವಿನ ಪರಿಶೀಲನೆ",
      rec_sleep_hours: "ನಿದ್ರೆಯ ಅವಧಿ (ಗಂಟೆಗಳು)",
      rec_sleep_qual: "ನಿದ್ರೆಯ ಗುಣಮಟ್ಟ (1-5)",
      rec_soreness: "ಸ್ನಾಯು ನೋವಿನ ಸೂಚ್ಯಂಕ",
      rec_record_btn: "ಚೇತರಿಕೆ ವಿವರ ಉಳಿಸಿ",

      // Achievements View
      ach_title: "ಸಾಧನೆಯ ಬ್ಯಾಡ್ಜ್‌ಗಳು ಮತ್ತು ಮೈಲಿಗಲ್ಲುಗಳು",
      ach_sub: "ನಿಖರ ತರಬೇತಿ ದಾಖಲೆಗಳಿಂದ ಗಳಿಸಿದ ಸಾಧನೆಗಳು",

      // Profile & Settings View
      prof_title: "ಕ್ರೀಡಾಪಟು ಪ್ರೊಫೈಲ್ ಮತ್ತು ಮೆಟಾಬಾಲಿಕ್ ಎಂಜಿನ್",
      prof_sub: "ಮಿಫ್ಲಿನ್-ಸೇಂಟ್ ಜಿಯೋರ್ ಸೂತ್ರದ ಆಧಾರಿತ ವೈಜ್ಞಾನಿಕ ಕ್ಯಾಲೊರಿ ಮತ್ತು ಮ್ಯಾಕ್ರೋ ಲೆಕ್ಕಾಚಾರ",
      prof_params_title: "ಶಾರೀರಿಕ ವಿವರಗಳು",
      prof_name: "ಪೂರ್ಣ ಹೆಸರು",
      prof_age: "ವಯಸ್ಸು",
      prof_gender: "ಲಿಂಗ",
      prof_gender_male: "ಪುರುಷ",
      prof_gender_female: "ಮಹಿಳೆ",
      prof_height: "ಎತ್ತರ (ಸೆಂ.ಮೀ)",
      prof_weight: "ತೂಕ (ಕೆ.ಜಿ)",
      prof_goal: "ಮುಖ್ಯ ಗುರಿ",
      prof_goal_muscle: "ಸ್ನಾಯು ಬೆಳವಣಿಗೆ (ಸರ್ಪ್ಲಸ್ ಡಯಟ್)",
      prof_goal_fatloss: "ಕೊಬ್ಬು ಕರಗಿಸುವುದು (ಡೆಫಿಸಿಟ್ ಡಯಟ್)",
      prof_goal_strength: "ಶಕ್ತಿ ಹೆಚ್ಚಿಸುವುದು",
      prof_goal_maint: "ಆರೋಗ್ಯ ನಿರ್ವಹಣೆ ಮತ್ತು ಸ್ಥಿರತೆ",
      prof_activity: "ದೈನಂದಿನ ಚಟುವಟಿಕೆಯ ಮಟ್ಟ",
      prof_act_sedentary: "ಕುಳಿತು ಕೆಲಸ ಮಾಡುವವರು (Sedentary)",
      prof_act_light: "ಸಾಧಾರಣ ಚಟುವಟಿಕೆ (ವಾರಕ್ಕೆ 1-3 ದಿನ ವ್ಯಾಯಾಮ)",
      prof_act_mod: "ಮಧ್ಯಮ ಚಟುವಟಿಕೆ (ವಾರಕ್ಕೆ 3-5 ದಿನ ವ್ಯಾಯಾಮ)",
      prof_act_very: "ಹೆಚ್ಚು ಸಕ್ರಿಯ (ವಾರಕ್ಕೆ 6-7 ದಿನ ತೀವ್ರ ವ್ಯಾಯಾಮ)",
      prof_recompute_btn: "ಶಕ್ತಿಯ ಬೇಸ್‌ಲೈನ್‌ಗಳನ್ನು ಮರುಲೆಕ್ಕಾಚಾರ ಮಾಡಿ",
      prof_calc_title: "ಲೆಕ್ಕಹಾಕಲಾದ ಮೆಟಾಬಾಲಿಕ್ ಫಲಿತಾಂಶ",
      prof_bmr_title: "ಬೇಸಲ್ ಮೆಟಾಬಾಲಿಕ್ ದರ (BMR)",
      prof_bmr_sub: "ಸಂಪೂರ್ಣ ವಿಶ್ರಾಂತಿಯಲ್ಲಿ ದೇಹಕ್ಕೆ ಅಗತ್ಯವಿರುವ ಮೂಲ ಶಕ್ತಿ (ಕ್ಯಾಲೊರಿ)",
      prof_tdee_title: "ದೈನಂದಿನ ಒಟ್ಟು ಶಕ್ತಿ ಬಳಕೆ (TDEE)",
      prof_tdee_sub: "ಚಟುವಟಿಕೆಯ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜು ನಿರ್ವಹಣಾ ಕ್ಯಾಲೊರಿಗಳು",
      prof_partition_title: "ದೈನಂದಿನ ಗುರಿ ಪೋಷಕಾಂಶಗಳ ವಿಭಜನೆ",

      // Language Preferences Section
      lang_section_title: "ಭಾಷೆ ಮತ್ತು ಸ್ಥಳೀಕರಣ (Language & Regional)",
      lang_section_sub: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಪೇಜ್ ರೀಲೋಡ್ ಮಾಡದೆ ತಕ್ಷಣವೇ ಸಂಪೂರ್ಣ ಆ್ಯಪ್ ಬದಲಾಗುತ್ತದೆ.",
      lang_select_label: "ಆ್ಯಪ್ ಭಾಷೆ (Active Language)",

      // Modals & General
      modal_close: "ಮುಚ್ಚಿ",
      modal_cancel: "ರದ್ದುಮಾಡಿ",
      modal_save: "ಉಳಿಸಿ",
      modal_commit: "ದೈನಂದಿನ ಪೋಷಕಾಂಶಕ್ಕೆ ಸೇರಿಸಿ",

      // Toasts
      toast_lang_changed: "ಭಾಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ",
      toast_workout_started: "ವ್ಯಾಯಾಮ ಸೆಷನ್ ಪ್ರಾರಂಭಿಸಲಾಗಿದೆ",
      toast_workout_finished: "ವ್ಯಾಯಾಮ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ!",
      toast_weighin_saved: "ತೂಕದ ವಿವರ ದಾಖಲಾಗಿದೆ.",
      toast_profile_updated: "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಕ್ಯಾಲೊರಿ ಗುರಿಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.",
      toast_food_logged: "ಆಹಾರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ."
    },

    // ------------------------------------------------------------------------
    // HINDI (हिन्दी)
    // ------------------------------------------------------------------------
    hi: {
      nav_dashboard: "डैशबोर्ड",
      nav_workout: "वर्कआउट ट्रैकर",
      nav_programs: "ट्रेनिंग प्रोग्राम्स",
      nav_library: "व्यायाम लाइब्रेरी",
      nav_nutrition: "मील ट्रैकर",
      nav_progress: "प्रगति और मेट्रिक्स",
      nav_recovery: "रिकवरी और नींद",
      nav_achievements: "उपलब्धियां",
      nav_profile: "प्रोफाइल और लक्ष्य",
      sys_core_synced: "सिस्टम: सिंक हुआ",
      auth_signin_register: "साइन इन / रजिस्टर",
      btn_log_food: "+ भोजन दर्ज करें",
      btn_start_session: "वर्कआउट शुरू करें",
      hero_welcome: "वापसी पर स्वागत है,",
      hero_readiness_desc: "आपकी शारीरिक तत्परता 94% इष्टतम है। अपनी 14-दिन की निरंतरता बनाए रखें।",
      metric_streak_title: "निरंतरता स्ट्रीक",
      metric_streak_unit: "दिन",
      metric_cal_title: "दैनिक कैलोरी",
      metric_pro_title: "प्रोटीन सेवन",
      metric_vol_title: "साप्ताहिक वॉल्यूम",
      metric_water_title: "हाइड्रेशन स्तर",
      goals_panel_title: "दैनिक लक्ष्य",
      toast_lang_changed: "भाषा सफलतापूर्वक हिन्दी में बदली गई"
    },

    // ------------------------------------------------------------------------
    // TAMIL (தமிழ்)
    // ------------------------------------------------------------------------
    ta: {
      nav_dashboard: "டாஷ்போர்டு",
      nav_workout: "உடற்பயிற்சி டிராக்கர்",
      nav_programs: "பயிற்சி திட்டங்கள்",
      nav_library: "பயிற்சி நூலகம்",
      nav_nutrition: "உணவு டிராக்கர்",
      nav_progress: "முன்னேற்றம் & அளவீடுகள்",
      nav_recovery: "மீட்பு & தூக்கம்",
      nav_achievements: "சாதனைகள்",
      nav_profile: "சுயவிவரம் & இலக்குகள்",
      sys_core_synced: "அமைப்பு: ஒத்திசைக்கப்பட்டது",
      auth_signin_register: "உள்நுழைக / பதிவு செய்க",
      btn_log_food: "+ உணவு சேர்",
      btn_start_session: "பயிற்சியைத் தொடங்கு",
      hero_welcome: "மீண்டும் வருக,",
      hero_readiness_desc: "உங்கள் உடல் நிலை 94% உகந்தது. உங்கள் 14 நாள் தொடர்ச்சியைத் தொடரவும்.",
      metric_streak_title: "தொடர்ச்சி நாட்கள்",
      metric_streak_unit: "நாட்கள்",
      metric_cal_title: "தினசரி கலோரிகள்",
      metric_pro_title: "புரத உட்கொள்ளல்",
      metric_vol_title: "வாராந்திர அளவு",
      metric_water_title: "நீர் அளவு",
      goals_panel_title: "தினசரி இலக்குகள்",
      toast_lang_changed: "மொழி வெற்றிகரமாக தமிழுக்கு மாற்றப்பட்டது"
    },

    // ------------------------------------------------------------------------
    // TELUGU (తెలుగు)
    // ------------------------------------------------------------------------
    te: {
      nav_dashboard: "డాష్‌బోర్డ్",
      nav_workout: "వ్యాయామ ట్రాకర్",
      nav_programs: "శిక్షణ కార్యక్రమాలు",
      nav_library: "వ్యాయామాల లైబ్రరీ",
      nav_nutrition: "ఆహార ట్రాకర్",
      nav_progress: "పురోగతి & కొలమానాలు",
      nav_recovery: "కోలుకోవడం & నిద్ర",
      nav_achievements: "విజయాలు",
      nav_profile: "ప్రొఫైల్ & లక్ష్యాలు",
      sys_core_synced: "సిస్టమ్: సమకాలీకరించబడింది",
      auth_signin_register: "సైన్ ఇన్ / రిజిస్టర్",
      btn_log_food: "+ ఆహారం నమోదు",
      btn_start_session: "వర్కౌట్ ప్రారంభించండి",
      hero_welcome: "తిరిగి స్వాగతం,",
      hero_readiness_desc: "మీ శారీరక సంసిద్ధత 94% సరైనది. మీ 14 రోజుల నిరంతర రికార్డును కొనసాగించండి.",
      metric_streak_title: "నిరంతర స్ట్రీక్",
      metric_streak_unit: "రోజులు",
      metric_cal_title: "రోజువారీ కేలరీలు",
      metric_pro_title: "ప్రొటీన్ తీసుకోవడం",
      metric_vol_title: "వారపు వాల్యూమ్",
      metric_water_title: "నీటి శాతం",
      goals_panel_title: "రోజువారీ లక్ష్యాలు",
      toast_lang_changed: "భాష విజయవంతంగా తెలుగుకు మార్చబడింది"
    },

    // ------------------------------------------------------------------------
    // MALAYALAM (മലയാളം)
    // ------------------------------------------------------------------------
    ml: {
      nav_dashboard: "ഡാഷ്‌ബോർഡ്",
      nav_workout: "വർക്കൗട്ട് ട്രാക്കർ",
      nav_programs: "പരിശീലന പരിപാടികൾ",
      nav_library: "വ്യായാമ ലൈബ്രറി",
      nav_nutrition: "ഭക്ഷണ ട്രാക്കർ",
      nav_progress: "പുരോഗതിയും അളവുകളും",
      nav_recovery: "വീണ്ടെടുക്കലും ഉറക്കവും",
      nav_achievements: "നേട്ടങ്ങൾ",
      nav_profile: "പ്രൊഫൈലും ലക്ഷ്യങ്ങളും",
      sys_core_synced: "സിസ്റ്റം: സമന്വയിപ്പിച്ചു",
      auth_signin_register: "സൈൻ ഇൻ / രജിസ്റ്റർ",
      btn_log_food: "+ ഭക്ഷണം ചേർക്കുക",
      btn_start_session: "പരിശീലനം ആരംഭിക്കുക",
      hero_welcome: "സ്വാഗതം,",
      hero_readiness_desc: "നിങ്ങളുടെ ശാരീരിക സന്നദ്ധത 94% മികച്ചതാണ്. നിങ്ങളുടെ 14 ദിവസത്തെ സ്ഥിരത നിലനിർത്തുക.",
      metric_streak_title: "സ്ഥിരത ദിവസങ്ങൾ",
      metric_streak_unit: "ദിവസങ്ങൾ",
      metric_cal_title: "ദൈനംദിന കലോറി",
      metric_pro_title: "പ്രോട്ടീൻ അളവ്",
      metric_vol_title: "പ്രതിവാര ഭാരം",
      metric_water_title: "ജലാംശം",
      goals_panel_title: "ദൈനംദിന ലക്ഷ്യങ്ങൾ",
      toast_lang_changed: "ഭാഷ വിജയകരമായി മലയാളത്തിലേക്ക് മാറ്റി"
    }
  };

  // Kannada Translations for Default Exercises
  const KANNADA_EXERCISES = {
    1: { name: 'ಬಾರ್ಬೆಲ್ ಬೆಂಚ್ ಪ್ರೆಸ್', category: 'ಎದೆ (Chest)', equipment: 'ಬಾರ್ಬೆಲ್', instructions: 'ಭುಜದ ಬ್ಲೇಡ್‌ಗಳನ್ನು ಹಿಂದಕ್ಕೆ ಎಳೆಯಿರಿ, ಬಾರ್ ಅನ್ನು ಎದೆಯ ಕೆಳಭಾಗಕ್ಕೆ ಸ್ಪರ್ಶಿಸಿ ಮತ್ತು ಮೊಣಕೈಗಳನ್ನು ನಿಯಂತ್ರಣದಲ್ಲಿಟ್ಟುಕೊಂಡು ಮೇಲಕ್ಕೆತ್ತಿ.' },
    2: { name: 'ಡೆಡ್‌ಲಿಫ್ಟ್', category: 'ಬೆನ್ನು (Back)', equipment: 'ಬಾರ್ಬೆಲ್', instructions: 'ಸೊಂಟವನ್ನು ಬಗ್ಗಿಸಿ, ಬೆನ್ನಿನ ಕೆಳಭಾಗವನ್ನು ನೇರವಾಗಿಡಿ ಮತ್ತು ನೆಲದಿಂದ ಬಾರ್ ಅನ್ನು ಸಂಪೂರ್ಣ ನಿಯಂತ್ರಣದೊಂದಿಗೆ ಮೇಲಕ್ಕೆತ್ತಿ.' },
    3: { name: 'ಬಾರ್ಬೆಲ್ ಬ್ಯಾಕ್ ಸ್ಕ್ವಾಟ್', category: 'ತೊಡೆಗಳು (Quads)', equipment: 'ಬಾರ್ಬೆಲ್', instructions: 'ಹಿಮ್ಮಡಿಗಳ ಮೇಲೆ ಸಮತೋಲನವಿರಿಸಿ ಮೊಣಕಾಲುಗಳನ್ನು 90 ಡಿಗ್ರಿಗಿಂತ ಕೆಳಕ್ಕೆ ಬಗ್ಗಿಸಿ ನೇರವಾಗಿ ಎದ್ದೇಳಿ.' },
    4: { name: 'ಪುಲ್-ಅಪ್', category: 'ಬೆನ್ನು (Back)', equipment: 'ಪುಲ್-ಅಪ್ ಬಾರ್', instructions: 'ದೇಹವನ್ನು ತೂಗಾಡಿಸದೆ ಗಲ್ಲವು ಬಾರ್‌ನ ಮೇಲಕ್ಕೆ ಬರುವವರೆಗೆ ಮೇಲಕ್ಕೆತ್ತಿ ಮತ್ತು ನಿಧಾನವಾಗಿ ಇಳಿಸಿ.' },
    5: { name: 'ಓವರ್‌ಹೆಡ್ ಪ್ರೆಸ್', category: 'ಭುಜಗಳು (Shoulders)', equipment: 'ಬಾರ್ಬೆಲ್', instructions: 'ಹೊಟ್ಟೆ ಮತ್ತು ಸೊಂಟದ ಸ್ನಾಯುಗಳನ್ನು ಬಿಗಿಗೊಳಿಸಿ ಬಾರ್ ಅನ್ನು ನೇರವಾಗಿ ತಲೆಯ ಮೇಲೆ ತಳ್ಳಿರಿ.' },
    6: { name: 'ಇನ್‌ಕ್ಲೈನ್ ಡಂಬ್ಬೆಲ್ ಪ್ರೆಸ್', category: 'ಎದೆ (Chest)', equipment: 'ಡಂಬ್ಬೆಲ್ಸ್', instructions: 'ಬೆಂಚ್ ಅನ್ನು 30 ಡಿಗ್ರಿಗೆ ಇರಿಸಿ, ಡಂಬ್ಬೆಲ್‌ಗಳನ್ನು ಎದೆಯ ಪೂರ್ಣ ಸ್ಟ್ರೆಚ್‌ನೊಂದಿಗೆ ನಿಯಂತ್ರಣದಿಂದ ಮೇಲಕ್ಕೆತ್ತಿ.' },
    7: { name: 'ರೊಮೇನಿಯನ್ ಡೆಡ್‌ಲಿಫ್ಟ್', category: 'ತೊಡೆಯ ಹಿಂಭಾಗ (Hamstrings)', equipment: 'ಬಾರ್ಬೆಲ್', instructions: 'ಮೊಣಕಾಲುಗಳನ್ನು ಸ್ವಲ್ಪ ಮಡಚಿ, ಸೊಂಟವನ್ನು ಹಿಂದಕ್ಕೆ ತಳ್ಳಿ ತೊಡೆಯ ಹಿಂಭಾಗದಲ್ಲಿ ಸೆಳೆತ ಅನುಭವಿಸಿ.' },
    8: { name: 'ಪುಶ್-ಅಪ್', category: 'ಎದೆ (Chest)', equipment: 'ಯಾವುದೂ ಇಲ್ಲ', instructions: 'ದೇಹವನ್ನು ನೇರ ಪ್ಲ್ಯಾಂಕ್ ಭಂಗಿಯಲ್ಲಿರಿಸಿ, ಎದೆಯನ್ನು ನೆಲದಿಂದ 2 ಸೆಂ.ಮೀ ವರೆಗೆ ತಗ್ಗಿಸಿ ನಂತರ ಮೇಲಕ್ಕೆತ್ತಿ.' },
    9: { name: 'ಜಂಪಿಂಗ್ ಜ್ಯಾಕ್ಸ್', category: 'ಕಾರ್ಡಿಯೋ (Cardio)', equipment: 'ಯಾವುದೂ ಇಲ್ಲ', instructions: 'ಕಾಲುಗಳನ್ನು ಒಟ್ಟಿಗೆ ಇರಿಸಿ, ನಂತರ ಜಿಗಿಯುತ್ತಾ ಕಾಲುಗಳನ್ನು ಅಗಲಿಸಿ ಕೈಗಳನ್ನು ತಲೆಯ ಮೇಲೆ ಚಪ್ಪಾಳೆ ತಟ್ಟಿ.' }
  };

  // Kannada Translations for Programs
  const KANNADA_PROGRAMS = {
    1: { title: 'ಪುಶ್ ಪುಲ್ ಲೆಗ್ಸ್ (PPL)', focus: 'ಸ್ನಾಯು ಬೆಳವಣಿಗೆ', level: 'ಮಧ್ಯಮ', desc: 'ಪುಶ್, ಪುಲ್ ಮತ್ತು ಕಾಲುಗಳಿಗಾಗಿ ಮೀಸಲಾದ ವೈಜ್ಞಾನಿಕ ಹೈಪರ್‌ಟ್ರೋಫಿ ತರಬೇತಿ ವಿಧಾನ.' },
    2: { title: 'ಮೇಲ್ಭಾಗ / ಕೆಳಭಾಗದ ವಿಭಜನೆ (Upper / Lower)', focus: 'ಶಕ್ತಿ ಮತ್ತು ದೃಢತೆ', level: 'ಮಧ್ಯಮ', desc: 'ಭಾರವಾದ ಕಾಂಪೌಂಡ್ ವ್ಯಾಯಾಮಗಳೊಂದಿಗೆ ಶಕ್ತಿ ಮತ್ತು ಗಾತ್ರವನ್ನು ಹೆಚ್ಚಿಸುವ ತರಬೇತಿ.' },
    3: { title: 'ಆರಂಭಿಕರಿಗಾಗಿ ಪೂರ್ಣ ದೇಹದ ತರಬೇತಿ', focus: 'ಮೂಲಭೂತ ಶಕ್ತಿ', level: 'ಆರಂಭಿಕ', desc: 'ವಾರದಲ್ಲಿ ಮೂರು ದಿನ ಪರ್ಯಾಯವಾಗಿ ಮಾಡುವ ಸಮಗ್ರ ಬಾರ್ಬೆಲ್ ತರಬೇತಿ.' },
    4: { title: 'ಕ್ಯಾಲಿಸ್ಟೆನಿಕ್ಸ್ ಬಾಡಿವೇಟ್ ತರಬೇತಿ', focus: 'ದೇಹದ ನಿಯಂತ್ರಣ', level: 'ಮಧ್ಯಮ', desc: 'ದೇಹದ ತೂಕದ ಸಹಾಯದಿಂದ ಸಮತೋಲನ, ಕೋರ್ ಮತ್ತು ಸ್ಫೋಟಕ ಶಕ್ತಿ ಹೆಚ್ಚಿಸುವ ವಿಧಾನ.' },
    5: { title: 'ಗರಿಷ್ಠ ಸ್ನಾಯು ಬೆಳವಣಿಗೆ (Bro Split)', focus: 'ಸ್ನಾಯು ಗಾತ್ರ', level: 'ಸುಧಾರಿತ', desc: 'ಪ್ರತಿ ದಿನ ಒಂದೊಂದು ಪ್ರತ್ಯೇಕ ಸ್ನಾಯು ಗುಂಪಿಗೆ ಸಂಪೂರ್ಣ ತೀವ್ರತೆಯ ಗಮನ ನೀಡುವ ವಿಧಾನ.' },
    6: { title: 'ಶಕ್ತಿ ಪ್ರೋಟೋಕಾಲ್ 5x5', focus: 'ಗರಿಷ್ಠ ಶಕ್ತಿ', level: 'ಮಧ್ಯಮ', desc: 'ಸ್ಕ್ವಾಟ್, ಬೆಂಚ್ ಪ್ರೆಸ್ ಮತ್ತು ಡೆಡ್‌ಲಿಫ್ಟ್‌ಗಳಲ್ಲಿ ಗರಿಷ್ಠ ಭಾರ ಎತ್ತಲು 5x5 ವಿಧಾನ.' },
    7: { title: 'ಕೊಬ್ಬು ಕರಗಿಸುವ ಕಂಡೀಷನಿಂಗ್', focus: 'ಮೆಟಾಬಾಲಿಕ್ ಫಿಟ್‌ನೆಸ್', level: 'ಎಲ್ಲಾ ಹಂತಗಳಿಗೆ', desc: 'ಹೆಚ್ಚು ಕ್ಯಾಲೊರಿಗಳನ್ನು ಕರಗಿಸಲು ಮತ್ತು ಹೃದಯದ ಆರೋಗ್ಯ ಕಾಪಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಿದ ತರಬೇತಿ.' },
    8: { title: 'ಕ್ರೀಡಾಪಟುಗಳ ಸಾಮರ್ಥ್ಯ ತರಬೇತಿ', focus: 'ವೇಗ ಮತ್ತು ಶಕ್ತಿ', level: 'ಸುಧಾರಿತ', desc: 'ವೇಗವರ್ಧನೆ, ಜಂಪಿಂಗ್ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಸ್ಫೋಟಕ ಶಕ್ತಿಯನ್ನು ಸುಧಾರಿಸುವ ತರಬೇತಿ.' },
    9: { title: 'ಮೊಬಿಲಿಟಿ ಮತ್ತು ಕೀಲುಗಳ ಆರೋಗ್ಯ', focus: 'ಕೀಲುಗಳ ನಮ್ಯತೆ', level: 'ಎಲ್ಲಾ ಹಂತಗಳಿಗೆ', desc: 'ಕೀಲುಗಳ ನಮ್ಯತೆ, ಬೆನ್ನುಮೂಳೆಯ ಆರೋಗ್ಯ ಮತ್ತು ಗಾಯಗಳಿಂದ ರಕ್ಷಣೆಗಾಗಿ ತರಬೇತಿ.' },
    10: { title: 'ತೋಳು ಮತ್ತು ಭುಜಗಳ ವಿಶೇಷ ತರಬೇತಿ', focus: 'ಹೈಪರ್‌ಟ್ರೋಫಿ', level: 'ಮಧ್ಯಮ', desc: 'ಬೈಸೆಪ್ಸ್, ಟ್ರೈಸೆಪ್ಸ್ ಮತ್ತು ಭುಜಗಳನ್ನು ದೃಢಗೊಳಿಸಲು ಸೂಪರ್‌ಸೆಟ್ ತರಬೇತಿ.' }
  };

  // Kannada Translations for Indian / Global Foods
  const KANNADA_FOODS = {
    1: 'ಚಪಾತಿ (ಗೋಧಿ ರೊಟ್ಟಿ)',
    2: 'ಪನೀರ್',
    3: 'ಅನ್ನ (ಬಾಸ್ಮತಿ ರೈಸ್)',
    4: 'ಬೇಳೆ ಸಾರು (ಹೆಸರು ಬೇಳೆ ದಾಲ್)',
    5: 'ಮೊಸರು (ದಹಿ)',
    6: 'ಚಿಕನ್ ಬ್ರೆಸ್ಟ್',
    7: 'ಕೋಳಿ ಮೊಟ್ಟೆ',
    8: 'ರೋಲ್ಡ್ ಓಟ್ಸ್',
    9: 'ಕಡಲೆಕಾಯಿ ಬೆಣ್ಣೆ (ಪೀನಟ್ ಬಟರ್)',
    10: 'ಬಾಳೆಹಣ್ಣು'
  };

  // i18n Controller Object
  class I18nManager {
    constructor() {
      // 1. Check user preference from storage or fallback to English
      this.currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'en';
      if (!SUPPORTED_LANGUAGES[this.currentLang]) this.currentLang = 'en';
    }

    init() {
      this.applyTypography();
      this.translatePage();
      this.renderLanguageSelectors();
    }

    getLang() {
      return this.currentLang;
    }

    t(key, fallback = '') {
      const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
      if (dict && dict[key]) return dict[key];
      // Fallback to English dictionary
      if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
      return fallback || key;
    }

    getExercise(exercise) {
      if (!exercise) return null;
      if (this.currentLang === 'kn' && KANNADA_EXERCISES[exercise.id]) {
        return {
          ...exercise,
          ...KANNADA_EXERCISES[exercise.id]
        };
      }
      return exercise;
    }

    getProgram(program) {
      if (!program) return null;
      if (this.currentLang === 'kn' && KANNADA_PROGRAMS[program.id]) {
        return {
          ...program,
          ...KANNADA_PROGRAMS[program.id]
        };
      }
      return program;
    }

    getFoodName(food) {
      if (!food) return '';
      if (this.currentLang === 'kn' && KANNADA_FOODS[food.id]) {
        return KANNADA_FOODS[food.id];
      }
      return food.name;
    }

    setLanguage(lang, syncCloud = true) {
      if (!SUPPORTED_LANGUAGES[lang]) return;
      this.currentLang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);

      // Also persist into state store
      try {
        if (window.store) {
          const s = window.store.get();
          if (s && s.user) {
            s.user.language = lang;
            window.store.save();
          }
        }
      } catch (e) {
        console.warn('Could not persist language to store', e);
      }

      // Sync with Supabase cloud profile if authenticated
      if (syncCloud) {
        this.syncCloudLanguage(lang);
      }

      // Apply typography & attributes
      this.applyTypography();

      // Translate all DOM elements
      this.translatePage();

      // Re-render language selector dropdowns
      this.renderLanguageSelectors();

      // Re-render active application views
      this.refreshActiveViews();

      // Trigger translated toast alert
      const toastMsg = this.t('toast_lang_changed');
      if (window.triggerToast) window.triggerToast(toastMsg);
    }

    applyTypography() {
      document.documentElement.lang = this.currentLang;
      // Toggle font class on body
      Object.keys(SUPPORTED_LANGUAGES).forEach(l => {
        document.body.classList.remove(`lang-${l}`);
      });
      document.body.classList.add(`lang-${this.currentLang}`);
    }

    translatePage() {
      // 1. Elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = this.t(key);
        if (translated && translated !== key) {
          el.innerText = translated;
        }
      });

      // 2. Placeholders with data-i18n-ph
      document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        const translated = this.t(key);
        if (translated && translated !== key) {
          el.placeholder = translated;
        }
      });

      // 3. Titles / tooltips with data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = this.t(key);
        if (translated && translated !== key) {
          el.title = translated;
        }
      });

      // 4. Update Header Status & Buttons
      const sysStatus = document.querySelector('.header-status span:nth-child(2)');
      if (sysStatus) sysStatus.innerText = this.t('sys_core_synced');
    }

    refreshActiveViews() {
      // Re-trigger view-specific renderers
      if (window.refreshDashboardMetrics) window.refreshDashboardMetrics();
      if (window.renderActiveWorkoutUI) window.renderActiveWorkoutUI();
      if (window.renderProgramCatalog) window.renderProgramCatalog();
      if (window.renderExerciseLibrary) window.renderExerciseLibrary();
      if (window.renderProgressPRTable) window.renderProgressPRTable();
      if (window.renderAchievements) window.renderAchievements();
      if (window.hunterTracker && typeof window.hunterTracker.render === 'function') {
        window.hunterTracker.render();
      }
      if (window.lucide) lucide.createIcons();
    }

    renderLanguageSelectors() {
      const cur = SUPPORTED_LANGUAGES[this.currentLang] || SUPPORTED_LANGUAGES.en;

      // 1. Update Header Label if static pill exists
      const labelEl = document.getElementById('currentLangLabel');
      if (labelEl) {
        labelEl.innerText = `${cur.native} (${cur.name})`;
      }

      // 2. Top Header Quick Selector
      const topContainer = document.getElementById('topLanguageSelectorContainer');
      if (topContainer) {
        topContainer.innerHTML = `
          <div class="lang-dropdown-wrapper" style="position: relative;">
            <button class="btn btn-ghost lang-pill-btn" onclick="window.formaI18n.toggleLangDropdown()" title="Change Language / ಭಾಷೆ ಬದಲಾಯಿಸಿ" style="padding: 6px 14px; font-size: 0.78rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); color: #FFF; cursor: pointer;">
              <span style="font-size: 0.95rem;">🌐</span>
              <span id="currentLangLabel" style="font-weight: 700; color: #FFF;">${cur.native} (${cur.name})</span>
              <span style="font-size: 0.65rem; color: #38BDF8;">▼</span>
            </button>
            <div id="topLangDropdownMenu" class="forma-card lang-dropdown-menu" style="display: none; position: absolute; top: calc(100% + 8px); right: 0; min-width: 185px; padding: 8px; z-index: 1000; box-shadow: 0 12px 32px rgba(0,0,0,0.7); background: #18191E; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px;">
              ${Object.keys(SUPPORTED_LANGUAGES).map(code => {
                const item = SUPPORTED_LANGUAGES[code];
                const isActive = code === this.currentLang;
                return `
                  <button class="lang-option-btn ${isActive ? 'active' : ''}" onclick="window.setLanguage('${code}')" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 12px; border: none; background: ${isActive ? 'rgba(56, 189, 248, 0.16)' : 'transparent'}; color: ${isActive ? '#38BDF8' : '#CBD5E1'}; border-radius: 8px; cursor: pointer; font-size: 0.8125rem; font-weight: ${isActive ? '800' : '600'}; text-align: left; transition: all 0.15s ease;">
                    <span style="${code === 'kn' ? 'font-weight: 700;' : ''}">${item.native}</span>
                    <span style="font-size: 0.7rem; color: ${isActive ? '#38BDF8' : '#64748B'};">${item.name}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      // 3. Sidebar Language Selector
      const sidebarSelect = document.getElementById('sidebarLanguageSelect');
      if (sidebarSelect) {
        sidebarSelect.value = this.currentLang;
      }

      // 4. Profile View Language Section Dropdown
      const profSelect = document.getElementById('profLanguageSelect');
      if (profSelect) {
        profSelect.innerHTML = Object.keys(SUPPORTED_LANGUAGES).map(code => {
          const item = SUPPORTED_LANGUAGES[code];
          return `<option value="${code}" ${code === this.currentLang ? 'selected' : ''}>${item.native} (${item.name})</option>`;
        }).join('');
      }
    }

    toggleLangDropdown() {
      const menu = document.getElementById('topLangDropdownMenu');
      if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    }

    async syncCloudLanguage(lang) {
      if (window.formaSync && typeof window.formaSync.dispatch === 'function') {
        window.formaSync.dispatch('profiles', 'UPDATE', { language: lang });
      } else if (window.formaSupabase?.client && window.formaAuth?.getUser()) {
        try {
          const user = window.formaAuth.getUser();
          await window.formaSupabase.client
            .from('profiles')
            .update({ language: lang, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } catch(e) {
          console.warn('[FormaI18n] Supabase cloud language sync failed', e);
        }
      }
    }

    // Kannada AI Fitness Advisor & Telemetry Helper
    generateAiRecommendation(type, data = {}) {
      if (this.currentLang === 'kn') {
        switch (type) {
          case 'calories':
            return `ಇಂದು ನೀವು ${data.cal || 0} ಕ್ಯಾಲೊರಿ ಸೇವಿಸಿದ್ದೀರಿ. ನಿಮ್ಮ ಗುರಿ ತಲುಪಲು ಇನ್ನೂ ${(data.target || 2000) - (data.cal || 0)} ಕ್ಯಾಲೊರಿ ಬಾಕಿ ಇದೆ.`;
          case 'protein':
            return `ಸ್ನಾಯು ಪುನರುಜ್ಜೀವನಕ್ಕಾಗಿ ಗುಣಮಟ್ಟದ ಪ್ರೋಟೀನ್ ಸೇವಿಸಿ. ಪ್ರಸ್ತುತ ಪ್ರೋಟೀನ್: ${data.pro || 0} ಗ್ರಾಂ.`;
          case 'recovery':
            return `ಕೇಂದ್ರೀಯ ನರಮಂಡಲದ ಚೇತರಿಕೆಯ ಮಟ್ಟ 94% ಅತ್ಯುತ್ತಮವಾಗಿದೆ. ಭಾರವಾದ ತೂಕ ಎತ್ತಲು ಸೂಕ್ತ ದಿನ.`;
          default:
            return `ವ್ಯಾಯಾಮದಲ್ಲಿ ಪ್ರೋಗ್ರೆಸಿವ್ ಓವರ್‌ಲೋಡ್ ನಿಯಮವನ್ನು ಪಾಲಿಸಿ.`;
        }
      } else {
        switch (type) {
          case 'calories':
            return `You have logged ${data.cal || 0} kcal today. ${(data.target || 2000) - (data.cal || 0)} kcal remaining.`;
          case 'protein':
            return `Adequate protein intake promotes muscular hypertrophy. Current: ${data.pro || 0}g.`;
          case 'recovery':
            return `Neuromuscular readiness is at 94% optimal. Excellent day for progressive resistance.`;
          default:
            return `Maintain progressive overload throughout training.`;
        }
      }
    }
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('topLangDropdownMenu');
    const btn = e.target.closest('.lang-pill-btn');
    if (menu && !btn && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Global exports
  const i18n = new I18nManager();
  window.formaI18n = i18n;
  window.setLanguage = (lang) => i18n.setLanguage(lang);
  window.t = (key, fallback) => i18n.t(key, fallback);

  // Auto-init immediately if DOM is ready, or on DOMContentLoaded/load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
  } else {
    i18n.init();
  }
  window.addEventListener('load', () => i18n.init());

})();

