/**
 * Main logic for the Hextech Challenges application.
 */

// --- APPLICATION STATE ---
let appState = {
    apiKey: "",
    summonerName: "",
    tagLine: "",
    platform: "",
    route: "",
    corsProxy: "",

    isDemoMode: true,
    activeCategory: "ALL", // ALL, EXPERTISE, VETERANCY, TEAMWORK, IMAGINATION, COLLECTION
    activeTierFilter: "ALL", // ALL, CHALLENGER, MASTER+, DIAMOND, GOLD, etc.
    searchQuery: "",

    // Checklist State
    isChecklistExpanded: false,
    checklistFilter: "ALL", // ALL, TODO, DONE
    checklistSearchQuery: "",

    // Loaded Data
    playerProfile: null,
    challenges: [],
    allChallenges: [],
    championsList: [],
    latestVersion: "14.10.1"
};

// Tier order for comparisons
const TIER_ORDER = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    initUIBindings();
    loadChampionsData().then(() => {
        const checklistContainer = document.getElementById("arac-checklist-container");
        if (checklistContainer) {
            const challenge = appState.challenges.find(c => c.name === "All Random All Champions");
            if (challenge) {
                const tier = challenge.level ? challenge.level.toUpperCase() : "IRON";
                const stored = localStorage.getItem("lol_arac_completed_champions");
                if (stored === null) {
                    const completedChamps = [];
                    localStorage.setItem("lol_arac_completed_champions", JSON.stringify(completedChamps));
                    challenge.value = completedChamps.length;

                    const checkedCountEl = document.getElementById("arac-checked-count");
                    if (checkedCountEl) checkedCountEl.textContent = challenge.value;
                    const valueEl = document.getElementById("arac-card-value");
                    if (valueEl) valueEl.textContent = challenge.value.toLocaleString();

                    const thresholdInfo = getNextThresholdInfo(tier, challenge.thresholds, challenge.value);
                    const nextEl = document.getElementById("arac-card-next");
                    if (nextEl) nextEl.textContent = thresholdInfo.isMax ? "Max" : `${thresholdInfo.nextValue.toLocaleString()} (${thresholdInfo.nextLevel})`;

                    const progressPct = thresholdInfo.isMax ? 100 : Math.min(100, Math.max(0, (challenge.value / thresholdInfo.nextValue) * 100));
                    const progressbar = document.getElementById("arac-card-progressbar");
                    if (progressbar) progressbar.style.width = `${progressPct}%`;
                }

                populateChampionsChecklist(challenge, tier);
                const totalCountEl = document.getElementById("arac-total-count");
                if (totalCountEl) totalCountEl.textContent = appState.championsList.length;
            }
        }
    });
    loadDashboardData();
});

// --- LOAD / SAVE SETTINGS ---
function loadSettings() {
    // Reset completed champions to empty once if needed (since user wants everyone unchecked by default)
    try {
        if (!localStorage.getItem("lol_arac_completed_champions_reset_v2")) {
            localStorage.removeItem("lol_arac_completed_champions");
            localStorage.setItem("lol_arac_completed_champions_reset_v2", "true");
        }

        // If the saved summoner in localStorage is the old default "Faker", reset it to use config.js / new defaults
        if (localStorage.getItem("lol_summoner_name") === "Faker") {
            localStorage.removeItem("lol_summoner_name");
            localStorage.removeItem("lol_tagline");
            localStorage.removeItem("lol_platform");
            localStorage.removeItem("lol_route");
        }
    } catch (e) {
        console.warn("localStorage is not accessible for cleanup checks:", e);
    }

    // Attempt loading from localStorage, fallback to config.js (RIOT_CONFIG)
    try {
        appState.apiKey = (localStorage.getItem("lol_api_key") || RIOT_CONFIG.API_KEY || "").trim();
        appState.summonerName = (localStorage.getItem("lol_summoner_name") || RIOT_CONFIG.DEFAULT_SUMMONER_NAME || "Imout").trim();
        appState.tagLine = (localStorage.getItem("lol_tagline") || RIOT_CONFIG.DEFAULT_TAGLINE || "999").trim();
        appState.platform = (localStorage.getItem("lol_platform") || RIOT_CONFIG.DEFAULT_PLATFORM || "euw1").trim();
        appState.route = (localStorage.getItem("lol_route") || RIOT_CONFIG.DEFAULT_ROUTE || "europe").trim();
        appState.corsProxy = (localStorage.getItem("lol_cors_proxy") || RIOT_CONFIG.CORS_PROXY || "").trim();
    } catch (e) {
        console.warn("localStorage is not accessible for reading settings. Using config.js fallbacks:", e);
        appState.apiKey = (RIOT_CONFIG.API_KEY || "").trim();
        appState.summonerName = (RIOT_CONFIG.DEFAULT_SUMMONER_NAME || "Imout").trim();
        appState.tagLine = (RIOT_CONFIG.DEFAULT_TAGLINE || "999").trim();
        appState.platform = (RIOT_CONFIG.DEFAULT_PLATFORM || "euw1").trim();
        appState.route = (RIOT_CONFIG.DEFAULT_ROUTE || "europe").trim();
        appState.corsProxy = (RIOT_CONFIG.CORS_PROXY || "").trim();
    }

    // Update demo mode state
    appState.isDemoMode = !appState.apiKey;

    // Fill settings modal fields
    document.getElementById("input-api-key").value = appState.apiKey;
    document.getElementById("input-summoner-name").value = appState.summonerName;
    document.getElementById("input-tagline").value = appState.tagLine;
    document.getElementById("select-platform").value = appState.platform;
    document.getElementById("select-route").value = appState.route;
    document.getElementById("input-proxy-url").value = appState.corsProxy;

    // Update main search input
    document.getElementById("player-search-bar").value = `${appState.summonerName}#${appState.tagLine}`;
}

function saveSettings() {
    const apiKey = document.getElementById("input-api-key").value.trim();
    const summonerName = document.getElementById("input-summoner-name").value.trim();
    const tagline = document.getElementById("input-tagline").value.trim();
    const platform = document.getElementById("select-platform").value;
    const route = document.getElementById("select-route").value;
    const proxyUrl = document.getElementById("input-proxy-url").value.trim();

    try {
        localStorage.setItem("lol_api_key", apiKey);
        localStorage.setItem("lol_summoner_name", summonerName);
        localStorage.setItem("lol_tagline", tagline);
        localStorage.setItem("lol_platform", platform);
        localStorage.setItem("lol_route", route);
        localStorage.setItem("lol_cors_proxy", proxyUrl);
    } catch (e) {
        console.error("Failed to save settings to localStorage:", e);
        showBanner("warning", "Could not persist settings to browser storage. Settings will only apply to this session.");
    }

    // Reload settings into state
    loadSettings();
}

// --- UI EVENT BINDINGS ---
function initUIBindings() {
    // Settings Modal Elements
    const modal = document.getElementById("settings-modal");
    const btnOpenSettings = document.getElementById("btn-open-settings");
    const btnCloseSettings = document.getElementById("btn-close-settings");
    const settingsForm = document.getElementById("settings-form");

    btnOpenSettings.addEventListener("click", () => {
        modal.classList.add("active");
    });

    btnCloseSettings.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Close when clicking outside content box
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Submit settings form
    settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveSettings();
        modal.classList.remove("active");
        loadDashboardData();
    });

    // Search player bar (Enter key press)
    const playerSearchBar = document.getElementById("player-search-bar");
    playerSearchBar.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const val = playerSearchBar.value.trim();
            if (val.includes("#")) {
                const parts = val.split("#");
                appState.summonerName = parts[0].trim();
                appState.tagLine = parts[1].trim();

                // Update form settings inputs
                document.getElementById("input-summoner-name").value = appState.summonerName;
                document.getElementById("input-tagline").value = appState.tagLine;

                localStorage.setItem("lol_summoner_name", appState.summonerName);
                localStorage.setItem("lol_tagline", appState.tagLine);

                loadDashboardData();
            } else {
                showBanner("warning", "Invalid format. Please search using: PlayerName#Tag (e.g., Faker#KR1)");
            }
        }
    });

    // Category Selector Tabs
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            categoryCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            appState.activeCategory = card.getAttribute("data-category");
            applyFiltersAndRender();
        });
    });

    // Tier Selector Tabs
    const tierTabs = document.querySelectorAll("#tier-filters .filter-tab");
    tierTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tierTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            appState.activeTierFilter = tab.getAttribute("data-tier");
            applyFiltersAndRender();
        });
    });

    // Text Search Filter Input
    const challengeSearchInput = document.getElementById("challenge-search-input");
    challengeSearchInput.addEventListener("input", (e) => {
        appState.searchQuery = e.target.value.toLowerCase().trim();
        applyFiltersAndRender();
    });

    // (Collapsible toggle listener was removed in favor of modal popups)
}

// --- STATUS BANNER HANDLER ---
function showBanner(type, message) {
    const banner = document.getElementById("status-notification-banner");
    banner.className = `alert-box ${type}`;

    let iconName = "info";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "error") iconName = "alert-octagon";

    banner.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div>${message}</div>
    `;
    lucide.createIcons();
}

// --- LOAD DASHBOARD DATA ---
async function loadDashboardData() {
    const grid = document.getElementById("challenges-display-grid");
    grid.innerHTML = "";
    grid.classList.add("loading");

    const isAramPage = window.location.pathname.toLowerCase().includes("aram.html");

    if (appState.isDemoMode) {
        // --- DEMO MODE ---
        const modeLabel = isAramPage ? "ARAM Demo Mode Active" : "Demo Mode Active";
        const descLabel = isAramPage ? "simulated ARAM challenges" : "simulated challenges";
        showBanner("info", `<strong>${modeLabel}:</strong> Displaying ${descLabel} for <strong>${appState.summonerName}#${appState.tagLine}</strong>. Click the gear icon <i data-lucide="settings" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i> to configure a real Riot API key.`);

        // Short network delay mock for Hextech loading animations
        setTimeout(() => {
            appState.playerProfile = MOCK_PLAYER_PROFILE;
            appState.allChallenges = MOCK_CHALLENGES;
            // Customize demo profile with user-entered values
            appState.playerProfile.gameName = appState.summonerName;
            appState.playerProfile.tagLine = appState.tagLine;
            appState.playerProfile.region = appState.platform;

            const isAramChallenge = c => {
                const name = (c.name || "").toLowerCase();
                const desc = (c.description || "").toLowerCase();
                return name.includes("aram") || name.includes("abîme") || desc.includes("aram") || desc.includes("abîme hurlant") || desc.includes("poro") || desc.includes("abyss");
            };

            let filteredDemoChallenges = MOCK_CHALLENGES;
            if (isAramPage) {
                filteredDemoChallenges = filteredDemoChallenges.filter(isAramChallenge);
            } else {
                filteredDemoChallenges = filteredDemoChallenges.filter(c => !isAramChallenge(c));
            }
            appState.challenges = filteredDemoChallenges;

            renderProfile(appState.playerProfile);
            applyFiltersAndRender();
            grid.classList.remove("loading");
        }, 400);
    } else {
        // --- REAL API MODE ---
        showBanner("info", `Connecting to Riot Games servers to fetch stats for <strong>${appState.summonerName}#${appState.tagLine}</strong>...`);
        try {
            await fetchRiotAPIData();
            grid.classList.remove("loading");
        } catch (error) {
            console.error("Riot API Error:", error);
            
            // Format a highly specific, action-oriented error message
            let userFriendlyMessage = error.message;
            if (error.name === "TypeError" && error.message.toLowerCase().includes("fetch")) {
                if (appState.corsProxy) {
                    userFriendlyMessage = `Failed to connect to the CORS proxy at <strong>${appState.corsProxy}</strong>. Please verify that your local CORS proxy is running (run <code>node cors-proxy.js</code> in your terminal)`;
                } else {
                    userFriendlyMessage = "Network connection failed. If you are querying the Riot API directly without a proxy, your browser may be blocking the request due to CORS. Please configure and run the local CORS proxy";
                }
            }
            
            showBanner("error", `<strong>Error loading data:</strong> ${userFriendlyMessage}`);
            grid.classList.remove("loading");

            // Revert back to Demo Mode on failure
            appState.playerProfile = MOCK_PLAYER_PROFILE;
            appState.allChallenges = MOCK_CHALLENGES;
            const isAramChallenge = c => {
                const name = (c.name || "").toLowerCase();
                const desc = (c.description || "").toLowerCase();
                return name.includes("aram") || name.includes("abîme") || desc.includes("aram") || desc.includes("abîme hurlant") || desc.includes("poro") || desc.includes("abyss");
            };
            let filteredDemoChallenges = MOCK_CHALLENGES;
            if (isAramPage) {
                filteredDemoChallenges = filteredDemoChallenges.filter(isAramChallenge);
            } else {
                filteredDemoChallenges = filteredDemoChallenges.filter(c => !isAramChallenge(c));
            }
            appState.challenges = filteredDemoChallenges;

            renderProfile(appState.playerProfile);
            applyFiltersAndRender();
        }
    }
}

// --- FETCH RIOT GAMES API DATA ---
async function fetchRiotAPIData() {
    const apiKey = appState.apiKey;
    const gameName = encodeURIComponent(appState.summonerName);
    const tagLine = encodeURIComponent(appState.tagLine);
    const platform = appState.platform;
    const route = appState.route;
    const proxy = appState.corsProxy;

    // Helper to request URL directly or via CORS proxy, appending api_key to prevent header stripping
    const getUrl = (baseUrl) => {
        const separator = baseUrl.includes("?") ? "&" : "?";
        const urlWithKey = `${baseUrl}${separator}api_key=${encodeURIComponent(apiKey)}`;
        if (proxy) {
            // Ensure proxy ends with a slash to avoid invalid URLs
            const formattedProxy = proxy.endsWith("/") ? proxy : `${proxy}/`;
            return `${formattedProxy}${urlWithKey}`;
        }
        return urlWithKey;
    };
    
    // Always pass X-Riot-Token header. The local proxy supports it, 
    // and sending the header is standard practice for the Riot API.
    const headers = {
        "X-Riot-Token": apiKey
    };

    // Step 1: Get PUUID from Riot Account API
    const accountUrl = `https://${route}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
    const accountRes = await fetch(getUrl(accountUrl), { headers });

    if (!accountRes.ok) {
        if (accountRes.status === 401 || accountRes.status === 403) {
            throw new Error("Riot API Key is invalid, expired, or missing. Please verify the key or regenerate a new one in the Riot Developer Portal");
        }
        if (accountRes.status === 404) throw new Error(`Player "${appState.summonerName}#${appState.tagLine}" not found in region ${route.toUpperCase()}`);
        throw new Error(`Riot ID API returned error ${accountRes.status}`);
    }

    const accountData = await accountRes.json();
    const puuid = accountData.puuid;

    // Step 2: Get Summoner profile (account level and icon)
    const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const summonerRes = await fetch(getUrl(summonerUrl), { headers });
    let level = 1;
    let iconId = 29; // default icon

    if (summonerRes.ok) {
        const summonerData = await summonerRes.json();
        level = summonerData.summonerLevel;
        iconId = summonerData.profileIconId;
    }

    // Step 3: Load global challenges configuration (or read from localStorage cache)
    let challengesConfig = null;
    const cacheKey = `lol_challenges_config_${platform}`;
    const cachedConfig = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(`${cacheKey}_time`);

    // Cache valid for 24 hours (86,400,000 ms)
    if (cachedConfig && cachedTime && (Date.now() - parseInt(cachedTime) < 86400000)) {
        challengesConfig = JSON.parse(cachedConfig);
    } else {
        const configUrl = `https://${platform}.api.riotgames.com/lol/challenges/v1/challenges/config`;
        const configRes = await fetch(getUrl(configUrl), { headers });
        if (configRes.ok) {
            challengesConfig = await configRes.json();
            try {
                localStorage.setItem(cacheKey, JSON.stringify(challengesConfig));
                localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            } catch (e) {
                console.warn("Could not cache challenge configuration in localStorage (storage full).");
            }
        }
    }

    if (!challengesConfig) {
        throw new Error("Failed to load Riot Games global challenges configuration.");
    }

    // Step 4: Fetch player challenges progress
    const playerDataUrl = `https://${platform}.api.riotgames.com/lol/challenges/v1/player-data/${puuid}`;
    const playerDataRes = await fetch(getUrl(playerDataUrl), { headers });

    if (!playerDataRes.ok) {
        throw new Error(`Failed to retrieve player challenges progress (Status ${playerDataRes.status})`);
    }

    const playerData = await playerDataRes.json();

    // Map player profile data
    appState.playerProfile = {
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        region: platform.toUpperCase(),
        level: level,
        profileIconId: iconId,
        totalPoints: playerData.totalPoints,
        categoryPoints: playerData.categoryPoints
    };

    // Step 5: Merge player progress with global configuration metadata
    const playerProgressMap = new Map();
    if (playerData.challenges) {
        playerData.challenges.forEach(c => {
            playerProgressMap.set(c.challengeId, c);
        });
    }

    const initialChallenges = challengesConfig
        .filter(cfg => {
            const nameObj = cfg.localizedNames?.en_US || cfg.localizedNames?.fr_FR || null;
            const name = nameObj ? (nameObj.name || "") : "";
            const nameLower = name.toLowerCase();
            const isAramAllRandomAllChamps = nameLower.includes("all random all champ") || nameLower.includes("all random all champion");

            if (isAramAllRandomAllChamps) {
                return true; // Keep all versions for deduplication by progress value later
            }

            if (cfg.state === "DISABLED" || cfg.state === "HIDDEN") return false;
            if (cfg.tracking === "SEASONAL") return false;
            if (cfg.category === "LEGACY" || cfg.category === "legacy") return false;
            return true;
        })
        .map(cfg => {
            const progress = playerProgressMap.get(cfg.id) || { level: "NONE", value: 0, percentile: 1.0 };

            // Select language translations (defaulting to English)
            const nameObj = cfg.localizedNames?.en_US || cfg.localizedNames?.fr_FR || null;
            let name = nameObj ? (nameObj.name || `Challenge #${cfg.id}`) : `Challenge #${cfg.id}`;
            if (name.toLowerCase().includes("all random all champions") || name.toLowerCase().includes("all random all champion")) {
                name = "All Random All Champions";
            }
            const description = nameObj ? (nameObj.description || "No description available.") : "No description available.";

            let category = cfg.category || deduceCategoryFromId(cfg.id);

            return {
                id: cfg.id,
                name: name,
                description: description,
                category: category,
                level: progress.level === "NONE" ? "IRON" : progress.level,
                value: progress.value,
                percentile: progress.percentile,
                thresholds: cfg.thresholds || {}
            };
        });

    // Deduplicate challenges by name, keeping the one with the highest value (helps display the correct active/completed one)
    const uniqueChallengesMap = new Map();
    initialChallenges.forEach(c => {
        const existing = uniqueChallengesMap.get(c.name);
        if (!existing || c.value > existing.value) {
            uniqueChallengesMap.set(c.name, c);
        }
    });
    const mergedChallenges = Array.from(uniqueChallengesMap.values());

    appState.allChallenges = mergedChallenges;

    // Filter based on active page route (ARAM vs Summoner's Rift)
    const isAramPage = window.location.pathname.toLowerCase().includes("aram.html");
    const isAramChallenge = c => {
        const name = (c.name || "").toLowerCase();
        const desc = (c.description || "").toLowerCase();
        return name.includes("aram") || name.includes("abîme") || desc.includes("aram") || desc.includes("abîme hurlant") || desc.includes("poro") || desc.includes("abyss");
    };

    let finalChallenges = mergedChallenges;
    if (isAramPage) {
        finalChallenges = finalChallenges.filter(isAramChallenge);
    } else {
        finalChallenges = finalChallenges.filter(c => !isAramChallenge(c));
    }

    // Sort challenges by tier order (highest first)
    finalChallenges.sort((a, b) => {
        const idxA = TIER_ORDER.indexOf(a.level);
        const idxB = TIER_ORDER.indexOf(b.level);
        return idxB - idxA;
    });

    appState.challenges = finalChallenges;

    // Render UI components
    showBanner("success", `Real game data loaded successfully for <strong>${accountData.gameName}#${accountData.tagLine}</strong>.`);
    renderProfile(appState.playerProfile, false);
    applyFiltersAndRender();
}

// --- RENDER PLAYER PROFILE CARD ---
function renderProfile(profile, isDemo = appState.isDemoMode) {
    document.getElementById("player-name-display").textContent = profile.gameName;
    document.getElementById("player-tag-display").textContent = `#${profile.tagLine}`;
    document.getElementById("player-region-badge").textContent = profile.region.toUpperCase();
    document.getElementById("player-level-badge").textContent = `Lvl ${profile.level}`;

    // Execution Mode Badge text
    const modeBadge = document.getElementById("app-mode-badge");
    if (isDemo) {
        modeBadge.textContent = "Demo";
        modeBadge.className = "badge-mode";
    } else {
        modeBadge.textContent = "API Live";
        modeBadge.className = "badge-mode api";
    }

    // Total points and global tier
    const totalPoints = profile.totalPoints || { level: "IRON", current: 0, max: 100, percentile: 1.0 };
    const globalTier = totalPoints.level;
    const rankTierDisplay = document.getElementById("rank-tier-display");
    rankTierDisplay.textContent = globalTier;
    rankTierDisplay.style.color = `var(--tier-${globalTier.toLowerCase()})`;

    document.getElementById("rank-points-display").textContent = `${totalPoints.current.toLocaleString()} / ${totalPoints.max.toLocaleString()} pts`;

    // Update global rank tier crystal
    const rankCrystal = document.querySelector(".rank-crystal");
    rankCrystal.style.background = `radial-gradient(circle, var(--tier-${globalTier.toLowerCase()}) 0%, transparent 70%)`;
    const rankIcon = rankCrystal.querySelector("i");
    if (rankIcon) {
        rankIcon.style.color = `var(--tier-${globalTier.toLowerCase()})`;
    }

    // Global completion numbers (computed from all challenges)
    const allChallengesList = (appState.allChallenges && appState.allChallenges.length > 0) ? appState.allChallenges : MOCK_CHALLENGES;
    const globalTotalChallenges = allChallengesList.length;
    const globalCompletedChallenges = allChallengesList.filter(c => c.level !== "NONE" && c.level !== "IRON").length;
    const globalCompletionPercentage = globalTotalChallenges > 0 ? Math.round((globalCompletedChallenges / globalTotalChallenges) * 100) : 0;

    document.getElementById("stat-completed-count").textContent = `${globalCompletedChallenges} / ${globalTotalChallenges}`;
    document.getElementById("stat-completion-pct").textContent = `${globalCompletionPercentage}%`;

    // Update category crystal milestones
    const categories = ["EXPERTISE", "VETERANCY", "TEAMWORK", "IMAGINATION", "COLLECTION"];
    categories.forEach(cat => {
        const catPoints = profile.categoryPoints?.[cat] || { level: "IRON", current: 0, max: 1000 };
        const level = catPoints.level;

        // Update level text label
        const tierTextEl = document.getElementById(`tier-${cat.toLowerCase()}`);
        if (tierTextEl) {
            tierTextEl.textContent = level;
            tierTextEl.style.color = `var(--tier-${level.toLowerCase()})`;
        }

        // Update points value
        const progressEl = document.getElementById(`progress-${cat.toLowerCase()}`);
        if (progressEl) {
            progressEl.textContent = `${catPoints.current.toLocaleString()} pts`;
        }
    });

    // Update global challenges counter (for current page)
    const pageTotalChallenges = appState.challenges.length || MOCK_CHALLENGES.length;
    document.getElementById("progress-all").textContent = `${pageTotalChallenges} challenges`;
}

// --- FILTER & RENDER CHALLENGES GRID ---
function applyFiltersAndRender() {
    const grid = document.getElementById("challenges-display-grid");

    // Category Filter
    let filtered = appState.challenges;
    if (appState.activeCategory !== "ALL") {
        filtered = filtered.filter(c => c.category.toUpperCase() === appState.activeCategory);
    }

    // Tier Filter
    if (appState.activeTierFilter !== "ALL") {
        if (appState.activeTierFilter === "MASTER+") {
            // Includes Master, Grandmaster, and Challenger
            filtered = filtered.filter(c => ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(c.level.toUpperCase()));
        } else if (appState.activeTierFilter === "BRONZE/IRON") {
            filtered = filtered.filter(c => ["IRON", "BRONZE", "NONE"].includes(c.level.toUpperCase()));
        } else {
            filtered = filtered.filter(c => c.level.toUpperCase() === appState.activeTierFilter);
        }
    }

    // Text Search Filter Query
    if (appState.searchQuery) {
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(appState.searchQuery) ||
            c.description.toLowerCase().includes(appState.searchQuery)
        );
    }

    // Render cards to container
    renderChallengeCards(filtered, grid);
}

function renderChallengeCards(challengesList, container) {
    container.innerHTML = "";

    if (challengesList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="compass"></i>
                <h3>No challenges found</h3>
                <p>Modify your filters or perform another search.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    challengesList.forEach(challenge => {
        const card = document.createElement("div");
        card.className = "challenge-card";

        const tier = challenge.level ? challenge.level.toUpperCase() : "IRON";

        // Define tier color custom property variables
        card.style.setProperty("--tier-color", `var(--tier-${tier.toLowerCase()})`);
        card.style.setProperty("--tier-glow", `rgba(var(--tier-${tier.toLowerCase()}-rgb), 0.3)`);

        // Calculate thresholds milestones progress
        let thresholdInfo = getNextThresholdInfo(tier, challenge.thresholds, challenge.value);
        let progressPct = thresholdInfo.isMax ? 100 : Math.min(100, Math.max(0, (challenge.value / thresholdInfo.nextValue) * 100));

        // Format percentile rates
        const percentileStr = challenge.percentile ? `Top ${(challenge.percentile * 100).toFixed(2)}%` : "Top 100%";

        if (challenge.name === "All Random All Champions") {
            // Sync value with local storage completed count
            let completedChamps = [];
            const stored = localStorage.getItem("lol_arac_completed_champions");
            if (stored !== null) {
                completedChamps = JSON.parse(stored);
                challenge.value = completedChamps.length;
            } else {
                completedChamps = [];
                localStorage.setItem("lol_arac_completed_champions", JSON.stringify([]));
                challenge.value = 0;
            }

            thresholdInfo = getNextThresholdInfo(tier, challenge.thresholds, challenge.value);
            progressPct = thresholdInfo.isMax ? 100 : Math.min(100, Math.max(0, (challenge.value / thresholdInfo.nextValue) * 100));

            card.innerHTML = `
                <div>
                    <div class="challenge-header">
                        <div class="challenge-title-group">
                            <h4>${challenge.name}</h4>
                            <span class="challenge-category-tag">${translateCategoryName(challenge.category)}</span>
                        </div>
                        <span class="challenge-badge">${tier}</span>
                    </div>
                    <p class="challenge-description">${challenge.description}</p>
                </div>
                
                <div class="challenge-footer">
                    <div class="challenge-progress-info">
                        <span class="current-value"><span id="arac-card-value">${challenge.value.toLocaleString()}</span> <span style="font-size:0.75rem; color:var(--text-dark)">current</span></span>
                        <span class="next-threshold" id="arac-card-next">${thresholdInfo.isMax ? "Max" : `${thresholdInfo.nextValue.toLocaleString()} (${thresholdInfo.nextLevel})`}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" id="arac-card-progressbar" style="width: ${progressPct}%"></div>
                    </div>
                    <div class="challenge-percentile">${percentileStr} of players</div>
                </div>

                <!-- Champions Checklist Collapsible -->
                <div class="challenge-tiers-toggle" id="toggle-arac-checklist" style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
                    <span>Champions Checklist (<span id="arac-checked-count">${completedChamps.length}</span> / <span id="arac-total-count">${appState.championsList.length}</span>)</span>
                    <i data-lucide="chevron-down" id="arac-toggle-icon" style="${appState.isChecklistExpanded ? 'transform: rotate(180deg);' : ''}"></i>
                </div>
                <div class="challenge-tiers-list ${appState.isChecklistExpanded ? 'expanded' : ''}" id="arac-checklist-container" style="${appState.isChecklistExpanded ? 'max-height: 450px;' : 'max-height: 0;'} overflow: hidden; width: 100%;">
                    <div class="checklist-controls" style="margin-top: 0.5rem;">
                        <input type="text" id="champion-search" class="checklist-search" placeholder="Search champion..." value="${appState.checklistSearchQuery}">
                        <button id="btn-filter-all" class="checklist-filter-btn ${appState.checklistFilter === 'ALL' ? 'active' : ''}">All</button>
                        <button id="btn-filter-todo" class="checklist-filter-btn ${appState.checklistFilter === 'TODO' ? 'active' : ''}">To Do</button>
                        <button id="btn-filter-done" class="checklist-filter-btn ${appState.checklistFilter === 'DONE' ? 'active' : ''}">Done</button>
                    </div>
                    <div class="champions-list-container" id="champions-checklist-grid" style="max-height: 250px; overflow-y: auto; padding-right: 5px; margin-top: 0.5rem;">
                        <!-- Dynamically populated -->
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div>
                    <div class="challenge-header">
                        <div class="challenge-title-group">
                            <h4>${challenge.name}</h4>
                            <span class="challenge-category-tag">${translateCategoryName(challenge.category)}</span>
                        </div>
                        <span class="challenge-badge">${tier}</span>
                    </div>
                    <p class="challenge-description">${challenge.description}</p>
                </div>
                
                <div class="challenge-footer">
                    <div class="challenge-progress-info">
                        <span class="current-value">${challenge.value.toLocaleString()} <span style="font-size:0.75rem; color:var(--text-dark)">current</span></span>
                        <span class="next-threshold">${thresholdInfo.isMax ? "Max" : `${thresholdInfo.nextValue.toLocaleString()} (${thresholdInfo.nextLevel})`}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
                    </div>
                    <div class="challenge-percentile">${percentileStr} of players</div>
                </div>
            `;
        }

        container.appendChild(card);

        // After appending, if it was the checklist card, initialize its listeners and populate it
        if (challenge.name === "All Random All Champions") {
            initChampionsChecklistListeners(challenge, tier);
        }
    });
    // Initialize Lucide icons on newly created elements
    lucide.createIcons();
}

// Translate Riot category codes into human-readable English
function translateCategoryName(cat) {
    const map = {
        "EXPERTISE": "Expertise",
        "VETERANCY": "Veterancy",
        "TEAMWORK": "Teamwork",
        "IMAGINATION": "Imagination",
        "COLLECTION": "Collection"
    };
    return map[cat.toUpperCase()] || cat;
}

// Compute the next target threshold score
function getNextThresholdInfo(currentTier, thresholds, currentValue) {
    if (!thresholds || Object.keys(thresholds).length === 0) {
        return { nextLevel: "Next", nextValue: currentValue * 1.5, isMax: false };
    }

    const currentIdx = TIER_ORDER.indexOf(currentTier);

    // Check if player is already at the maximum tier threshold
    if (currentIdx === TIER_ORDER.length - 1 || (thresholds[currentTier] && !hasHigherThreshold(currentTier, thresholds))) {
        return { nextLevel: "MAX", nextValue: currentValue, isMax: true };
    }

    // Find the next incremental milestone thresholds defined in Riot config
    for (let i = currentIdx + 1; i < TIER_ORDER.length; i++) {
        const tier = TIER_ORDER[i];
        if (thresholds[tier] !== undefined) {
            return {
                nextLevel: tier,
                nextValue: thresholds[tier],
                isMax: false
            };
        }
    }

    return { nextLevel: "MAX", nextValue: currentValue, isMax: true };
}

function hasHigherThreshold(tier, thresholds) {
    const idx = TIER_ORDER.indexOf(tier);
    for (let i = idx + 1; i < TIER_ORDER.length; i++) {
        if (thresholds[TIER_ORDER[i]] !== undefined) return true;
    }
    return false;
}

// generateTiersListHTML was removed

function deduceCategoryFromId(id) {
    const idStr = String(id);

    // Check for mock ARAM challenges
    if (idStr.startsWith("106")) {
        const lastDigit = parseInt(idStr.slice(-1));
        if (lastDigit === 1 || lastDigit === 2) return "EXPERTISE";
        if (lastDigit === 3) return "TEAMWORK";
        if (lastDigit === 4 || lastDigit === 5) return "IMAGINATION";
        if (lastDigit === 6) return "COLLECTION";
        return "ALL";
    }

    if (idStr.startsWith("101") || idStr === "1") return "EXPERTISE";
    if (idStr.startsWith("102") || idStr === "2") return "VETERANCY";
    if (idStr.startsWith("103") || idStr === "3") return "TEAMWORK";
    if (idStr.startsWith("104") || idStr === "4") return "IMAGINATION";
    if (idStr.startsWith("105") || idStr === "5") return "COLLECTION";

    const idNum = Number(id);
    if (idNum >= 101000 && idNum < 102000) return "EXPERTISE";
    if (idNum >= 102000 && idNum < 103000) return "VETERANCY";
    if (idNum >= 103000 && idNum < 104000) return "TEAMWORK";
    if (idNum >= 104000 && idNum < 105000) return "IMAGINATION";
    if (idNum >= 105000 && idNum < 106000) return "COLLECTION";

    return "ALL";
}

// --- LOAD CHAMPION LIST (DATA DRAGON / STATIC FALLBACK) ---
async function loadChampionsData() {
    // 1. Fetch latest DDragon version
    try {
        const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        if (versionsRes.ok) {
            const versions = await versionsRes.json();
            if (versions && versions.length > 0) {
                appState.latestVersion = versions[0];
            }
        }
    } catch (e) {
        console.warn("Failed to fetch latest DDragon version, using fallback version", appState.latestVersion, e);
    }

    // 2. Fetch champions from DDragon
    try {
        const champsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${appState.latestVersion}/data/en_US/champion.json`);
        if (champsRes.ok) {
            const champsData = await champsRes.json();
            const list = [];
            for (const key in champsData.data) {
                const champ = champsData.data[key];
                list.push({
                    id: champ.id,
                    name: champ.name,
                    image: `https://ddragon.leagueoflegends.com/cdn/${appState.latestVersion}/img/champion/${champ.image.full}`
                });
            }
            // Sort alphabetically
            list.sort((a, b) => a.name.localeCompare(b.name));
            appState.championsList = list;
            return;
        }
    } catch (e) {
        console.warn("Failed to fetch DDragon champions, using static fallback", e);
    }

    // 3. Fallback to static list
    const fallbackNames = [
        "Aatrox", "Ahri", "Akali", "Akshan", "Alistar", "Amumu", "Anivia", "Annie", "Aphelios", "Ashe",
        "Aurelion Sol", "Aurora", "Azir", "Bard", "Bel'Veth", "Blitzcrank", "Brand", "Braum", "Briar", "Caitlyn",
        "Camille", "Cassiopeia", "Cho'Gath", "Corki", "Darius", "Diana", "Dr. Mundo", "Draven", "Ekko", "Elise",
        "Evelynn", "Ezreal", "Fiddlesticks", "Fiora", "Fizz", "Galio", "Gangplank", "Garen", "Gnar", "Gragas",
        "Graves", "Gwen", "Hecarim", "Heimerdinger", "Hwei", "Illaoi", "Irelia", "Ivern", "Janna", "Jarvan IV",
        "Jax", "Jayce", "Jhin", "Jinx", "K'Sante", "Kai'Sa", "Kalista", "Karma", "Karthus", "Kassadin",
        "Katarina", "Kayle", "Kayn", "Kennen", "Kha'Zix", "Kindred", "Kled", "Kog'Maw", "LeBlanc", "Lee Sin",
        "Leona", "Lillia", "Lissandra", "Lucian", "Lulu", "Lux", "Malphite", "Malzahar", "Maokai", "Master Yi",
        "Milio", "Miss Fortune", "Mordekaiser", "Morgana", "Naafiri", "Nami", "Nasus", "Nautilus", "Neeko",
        "Nidalee", "Nilah", "Nocturne", "Nunu & Willump", "Olaf", "Orianna", "Ornn", "Pantheon", "Poppy",
        "Pyke", "Qiyana", "Quinn", "Rakan", "Rammus", "Rek'Sai", "Rell", "Renata Glasc", "Renekton", "Rengar",
        "Riven", "Rumble", "Ryze", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shaco", "Shen",
        "Shyvana", "Singed", "Sion", "Sivir", "Skarner", "Smolder", "Sona", "Soraka", "Swain", "Syndra",
        "Tahm Kench", "Taliyah", "Talon", "Taric", "Teemo", "Thresh", "Tristana", "Trundle", "Tryndamere",
        "Twisted Fate", "Twitch", "Udyr", "Urgot", "Varus", "Vayne", "Veigar", "Vel'Koz", "Vex", "Vi",
        "Viego", "Viktor", "Vladimir", "Volibear", "Warwick", "Wukong", "Xayah", "Xerath", "Xin Zhao",
        "Yasuo", "Yone", "Yorick", "Yuumi", "Zac", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra"
    ];

    const CHAMPION_IMAGE_MAPPINGS = {
        "Aurelion Sol": "AurelionSol",
        "Bel'Veth": "Belveth",
        "Cho'Gath": "Chogath",
        "Dr. Mundo": "DrMundo",
        "Jarvan IV": "JarvanIV",
        "K'Sante": "Ksante",
        "Kai'Sa": "Kaisa",
        "Kha'Zix": "Khazix",
        "Kog'Maw": "KogMaw",
        "LeBlanc": "Leblanc",
        "Lee Sin": "LeeSin",
        "Master Yi": "MasterYi",
        "Miss Fortune": "MissFortune",
        "Nunu & Willump": "Nunu",
        "Rek'Sai": "Reksai",
        "Renata Glasc": "Renata",
        "Tahm Kench": "TahmKench",
        "Twisted Fate": "TwistedFate",
        "Vel'Koz": "Velkoz",
        "Wukong": "MonkeyKing",
        "Xin Zhao": "XinZhao"
    };

    appState.championsList = fallbackNames.map(name => {
        const id = CHAMPION_IMAGE_MAPPINGS[name] || name.replace(/[^a-zA-Z]/g, "");
        return {
            id: id,
            name: name,
            image: `https://ddragon.leagueoflegends.com/cdn/${appState.latestVersion}/img/champion/${id}.png`
        };
    });
}

// --- INIT CHAMPIONS CHECKLIST LISTENERS ---
function initChampionsChecklistListeners(challenge, tier) {
    const toggle = document.getElementById("toggle-arac-checklist");
    const container = document.getElementById("arac-checklist-container");
    const icon = document.getElementById("arac-toggle-icon");

    if (toggle && container && icon) {
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            appState.isChecklistExpanded = !appState.isChecklistExpanded;
            if (appState.isChecklistExpanded) {
                container.classList.add("expanded");
                container.style.maxHeight = "450px";
                icon.style.transform = "rotate(180deg)";
                populateChampionsChecklist(challenge, tier);
            } else {
                container.classList.remove("expanded");
                container.style.maxHeight = "0";
                icon.style.transform = "rotate(0deg)";
            }
        });
    }

    // Populate initial content if already expanded
    if (appState.isChecklistExpanded) {
        populateChampionsChecklist(challenge, tier);
    }

    // Bind checklist controls
    const searchInput = document.getElementById("champion-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            appState.checklistSearchQuery = e.target.value.toLowerCase().trim();
            populateChampionsChecklist(challenge, tier);
        });
    }

    const btnAll = document.getElementById("btn-filter-all");
    const btnTodo = document.getElementById("btn-filter-todo");
    const btnDone = document.getElementById("btn-filter-done");

    if (btnAll && btnTodo && btnDone) {
        const updateFilterActiveTab = (activeBtn) => {
            [btnAll, btnTodo, btnDone].forEach(b => b.classList.remove("active"));
            activeBtn.classList.add("active");
        };

        btnAll.addEventListener("click", (e) => {
            e.stopPropagation();
            appState.checklistFilter = "ALL";
            updateFilterActiveTab(btnAll);
            populateChampionsChecklist(challenge, tier);
        });

        btnTodo.addEventListener("click", (e) => {
            e.stopPropagation();
            appState.checklistFilter = "TODO";
            updateFilterActiveTab(btnTodo);
            populateChampionsChecklist(challenge, tier);
        });

        btnDone.addEventListener("click", (e) => {
            e.stopPropagation();
            appState.checklistFilter = "DONE";
            updateFilterActiveTab(btnDone);
            populateChampionsChecklist(challenge, tier);
        });
    }
}

// --- HELPER TO SYNC ARAC PROGRESS UI ---
function updateARACProgressUI(challenge, tier) {
    const checkedCountEl = document.getElementById("arac-checked-count");
    if (checkedCountEl) checkedCountEl.textContent = challenge.value;

    const valueEl = document.getElementById("arac-card-value");
    if (valueEl) valueEl.textContent = challenge.value.toLocaleString();

    // Find closest card to update level badge and CSS custom properties dynamically
    const container = document.getElementById("arac-checklist-container");
    if (container) {
        const card = container.closest(".challenge-card");
        if (card) {
            // Recalculate level based on current value
            const newTier = getCurrentTierFromValue(challenge.thresholds, challenge.value);
            challenge.level = newTier;

            // Update badge text
            const badge = card.querySelector(".challenge-badge");
            if (badge) badge.textContent = newTier;

            // Update CSS variables for colors & glow
            card.style.setProperty("--tier-color", `var(--tier-${newTier.toLowerCase()})`);
            card.style.setProperty("--tier-glow", `rgba(var(--tier-${newTier.toLowerCase()}-rgb), 0.3)`);

            // Use the new tier to get next milestone info
            tier = newTier;
        }
    }

    const thresholdInfo = getNextThresholdInfo(tier, challenge.thresholds, challenge.value);
    const nextEl = document.getElementById("arac-card-next");
    if (nextEl) nextEl.textContent = thresholdInfo.isMax ? "Max" : `${thresholdInfo.nextValue.toLocaleString()} (${thresholdInfo.nextLevel})`;

    const progressPct = thresholdInfo.isMax ? 100 : Math.min(100, Math.max(0, (challenge.value / thresholdInfo.nextValue) * 100));
    const progressbar = document.getElementById("arac-card-progressbar");
    if (progressbar) progressbar.style.width = `${progressPct}%`;
}

// Helper to deduce tier dynamically from threshold list and progress value
function getCurrentTierFromValue(thresholds, value) {
    if (!thresholds || Object.keys(thresholds).length === 0) return "IRON";
    let currentTier = "NONE";
    for (let i = 0; i < TIER_ORDER.length; i++) {
        const tier = TIER_ORDER[i];
        if (thresholds[tier] !== undefined && value >= thresholds[tier]) {
            currentTier = tier;
        }
    }
    return currentTier === "NONE" ? "IRON" : currentTier;
}

// --- POPULATE CHAMPIONS CHECKLIST GRID ---
function populateChampionsChecklist(challenge, tier) {
    const grid = document.getElementById("champions-checklist-grid");
    if (!grid) return;

    if (appState.championsList.length === 0) {
        grid.innerHTML = `<div style="text-align: center; font-size: 0.8rem; color: var(--text-dark); padding: 1rem 0;">Loading champions...</div>`;
        return;
    }

    // Get checked champions
    let completedChamps = JSON.parse(localStorage.getItem("lol_arac_completed_champions") || "[]");

    // Filter champions
    let filteredChamps = appState.championsList;
    if (appState.checklistSearchQuery) {
        filteredChamps = filteredChamps.filter(c => c.name.toLowerCase().includes(appState.checklistSearchQuery));
    }

    if (appState.checklistFilter === "TODO") {
        filteredChamps = filteredChamps.filter(c => !completedChamps.includes(c.id));
    } else if (appState.checklistFilter === "DONE") {
        filteredChamps = filteredChamps.filter(c => completedChamps.includes(c.id));
    }

    // Render list
    grid.innerHTML = "";
    if (filteredChamps.length === 0) {
        grid.innerHTML = `<div style="text-align: center; font-size: 0.8rem; color: var(--text-dark); padding: 1rem 0;">No champions found</div>`;
        return;
    }

    filteredChamps.forEach(champ => {
        const isCompleted = completedChamps.includes(champ.id);
        const item = document.createElement("label");
        item.className = `champion-item ${isCompleted ? 'completed' : 'locked'}`;
        item.style.cursor = "pointer";

        item.innerHTML = `
            <input type="checkbox" class="champion-checkbox" ${isCompleted ? 'checked' : ''}>
            <img src="${champ.image}" alt="${champ.name}" style="width: 20px; height: 20px; border-radius: 4px; border: 1px solid var(--gold-dark); object-fit: cover; flex-shrink: 0;" onerror="this.src='https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Aatrox.png'">
            <span class="champion-name">${champ.name}</span>
        `;

        // Checkbox toggle event listener
        const checkbox = item.querySelector(".champion-checkbox");
        checkbox.addEventListener("change", (e) => {
            e.stopPropagation();

            // Reload from storage to avoid concurrency issues
            let currentCompleted = JSON.parse(localStorage.getItem("lol_arac_completed_champions") || "[]");

            if (checkbox.checked) {
                if (!currentCompleted.includes(champ.id)) {
                    currentCompleted.push(champ.id);
                }
                item.className = "champion-item completed";
            } else {
                currentCompleted = currentCompleted.filter(id => id !== champ.id);
                item.className = "champion-item locked";
            }

            localStorage.setItem("lol_arac_completed_champions", JSON.stringify(currentCompleted));

            // Sync values in state and UI
            challenge.value = currentCompleted.length;
            updateARACProgressUI(challenge, tier);

            // If we are currently in TODO or DONE filter, hide the item since its state changed
            if (appState.checklistFilter === "TODO" && checkbox.checked) {
                setTimeout(() => item.remove(), 150); // slight delay for smooth visual checkbox toggle feedback
            } else if (appState.checklistFilter === "DONE" && !checkbox.checked) {
                setTimeout(() => item.remove(), 150);
            }
        });

        grid.appendChild(item);
    });
}
