export function cleanupStaleCaches() {
  try {
    console.log("Running cache cleanup utility due to inactivity (> 5 minutes)...");
    const keysToRemove = [
      "homebuyer_user_properties",
      "geosphere_cached_listings",
      "homebuyer_temp_listings",
      "ad_drafts_cache",
      "ai_copilot_history_temp",
      "homebuyer_roadmap_state_v2",
      "manus_guides_state_v2"
    ];
    keysToRemove.forEach(key => {
      if (typeof localStorage !== "undefined" && localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  } catch (e) {
    console.warn("Cache cleanup utility notice:", e);
  }
}
