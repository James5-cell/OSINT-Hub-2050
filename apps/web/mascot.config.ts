/** OSINT Hub mascot: canonical PostSoma core with the prepared osint-hub skin. */
export const mascotConfig = {
  version: "1.0.0-osint-hub",
  storageKey: "postsoma-osint-hub-mascot-v1",
  core: {
    light: "/mascot/optimized/plate_light.webp",
    dark: "/mascot/optimized/plate_dark.webp",
    width: 1122,
    height: 1228,
    sprout: {
      light: "/mascot/optimized/sprout_light.webp",
      dark: "/mascot/optimized/sprout_dark.webp",
      left: "43.94%", top: "0%", displayWidth: "12.03%", displayHeight: "11.16%",
      pivot: "48.74% 85.4%",
    },
    eyes: [
      { x: 728.9, y: 563.8, moonRadius: 48.6, haloRadius: 66 },
      { x: 382.7, y: 563.9, moonRadius: 48.6, haloRadius: 66 },
    ],
  },
  slots: {
    magnifier: {
      light: "/mascot/optimized/magnifier_clean.webp", dark: "/mascot/optimized/magnifier_dark.webp",
      right: "-4%", top: "48%", width: "24%", zIndex: 3, pivot: "50% 80%", transform: "rotate(12deg)",
      behavior: { follow_breath: true, on_click: "lens_scan", on_shock: "lens_recoil", on_antic: "trace_follow" },
    },
    trail: {
      light: "/mascot/optimized/trail_clean.webp", dark: "/mascot/optimized/trail_dark.webp",
      left: "10%", top: "8%", width: "16%", zIndex: 4, pivot: "50% 50%", transform: "rotate(-8deg)",
      behavior: { follow_breath: true, on_click: "trail_reveal", on_shock: "trail_recoil", on_antic: "trace_follow" },
    },
  },
  animation: { breathMs: 3400, blinkMs: 5200, sproutDegrees: 6 },
  behaviorWheel: [
    { id: "sprout_sway", weight: 40, durationMs: 3500 },
    { id: "peek_curious", weight: 30, durationMs: 1800 },
    { id: "wander_slide", weight: 20, durationMs: 4500 },
    { id: "subtle_tilt", weight: 10, durationMs: 1200 },
  ],
  siteAntic: { id: "trace_follow", minimumIdleMs: 20000, cooldownMs: 20000, chance: 0.12, durationMs: 1400 },
  scheduler: {
    tickMs: 100, heartbeatMs: 1000, durationDrift: 0.2, firstActionMs: 4500,
    idleGapMinMs: 1400, idleGapMaxMs: 2800, tapWindowMs: 320, activeIdleMs: 10000,
    sleepAfterMs: 90000, hoverMs: 560, clickMs: 760, flinchMs: 480, blushMs: 980,
    shyHideMs: 650, shyHiddenMs: 2400, shyQuietMs: 2000, alertMs: 900,
    scrollThresholdPx: 360, rapidPointerSpeedPxPerSecond: 900, nearbyRadiusPx: 150,
    minimumAlertGapMs: 1800,
  },
  motion: {
    stage: { mobile: { width: 118, height: 129 }, desktop: { width: 132, height: 145 } },
    restOffsetPx: { mobile: 68, desktop: 77 }, peekOffsetPx: { mobile: 55, desktop: 63 },
    hiddenOffsetPx: { mobile: 160, desktop: 176 },
    companionLiftPx: 16, persistenceMs: 5000, hoverLeaveMs: 150, nearbyChance: 0.45,
    minHorizontalPercent: 16, maxHorizontalPercent: 84, startHorizontalPercent: 78,
    wanderMinPercent: 16, wanderMaxPercent: 84, wanderMinStepPercent: 16, wanderMaxStepPercent: 32,
  },
  drives: {
    defaults: { energy: 80, curiosity: 60, affection: 40 },
    energyDecayPerMinute: 1.5, curiosityDecayPerMinute: 2, affectionDecayPerMinute: 1,
    sleepRecoveryPerMinute: 10, hoverAffection: 8, clickAffection: 15, nearbyCuriosity: 10,
  },
  priorities: { autonomous: 0, environment: 1, direct: 2 },
} as const;

export type MascotBehaviorId = (typeof mascotConfig.behaviorWheel)[number]["id"] | typeof mascotConfig.siteAntic.id;
