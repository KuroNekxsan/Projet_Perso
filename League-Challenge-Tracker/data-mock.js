/**
 * Mock Data for the LoL Challenges website.
 * Allows the website to function offline or without a valid API key.
 */

const MOCK_PLAYER_PROFILE = {
    gameName: "Imout",
    tagLine: "999",
    region: "euw1",
    level: 700, // Summoner account level
    profileIconId: 1230, // Faker icon
    totalPoints: {
        level: "CHALLENGER",
        current: 18450,
        max: 20000,
        percentile: 0.001 // Top 0.1%
    },
    categoryPoints: {
        "VETERANCY": { level: "CHALLENGER", current: 4200, max: 5000, percentile: 0.002 },
        "COLLECTION": { level: "GRANDMASTER", current: 3900, max: 4500, percentile: 0.015 },
        "TEAMWORK": { level: "CHALLENGER", current: 4500, max: 5000, percentile: 0.001 },
        "IMAGINATION": { level: "MASTER", current: 2850, max: 3500, percentile: 0.045 },
        "EXPERTISE": { level: "CHALLENGER", current: 3000, max: 3000, percentile: 0.0005 }
    }
};

const MOCK_CHALLENGES = [
    // --- EXPERTISE ---
    {
        id: 101001,
        name: "Arena God",
        description: "Earn multikills (Double, Triple, Quadra, Pentakills) in ranked matches.",
        category: "EXPERTISE",
        level: "CHALLENGER",
        value: 1420,
        percentile: 0.001,
        thresholds: {
            "IRON": 10, "BRONZE": 50, "SILVER": 150, "GOLD": 300, "PLATINUM": 600, "DIAMOND": 900, "MASTER": 1200, "GRANDMASTER": 1350, "CHALLENGER": 1400
        }
    },
    {
        id: 101002,
        name: "Farm King",
        description: "Achieve a minion farm score of 10 or more per minute in won matches.",
        category: "EXPERTISE",
        level: "GRANDMASTER",
        value: 85,
        percentile: 0.008,
        thresholds: {
            "IRON": 2, "BRONZE": 10, "SILVER": 25, "GOLD": 45, "PLATINUM": 60, "DIAMOND": 75, "MASTER": 80, "GRANDMASTER": 85, "CHALLENGER": 95
        }
    },
    {
        id: 101003,
        name: "Unkillable Demon",
        description: "Win games with 0 deaths and a kill participation rate > 50%.",
        category: "EXPERTISE",
        level: "DIAMOND",
        value: 14,
        percentile: 0.023,
        thresholds: {
            "IRON": 1, "BRONZE": 3, "SILVER": 6, "GOLD": 10, "PLATINUM": 12, "DIAMOND": 14, "MASTER": 18, "GRANDMASTER": 22, "CHALLENGER": 25
        }
    },
    {
        id: 101004,
        name: "Hard Carry",
        description: "Deal 40% or more of your team's total damage to champions in ranked matches.",
        category: "EXPERTISE",
        level: "MASTER",
        value: 48,
        percentile: 0.038,
        thresholds: {
            "IRON": 2, "BRONZE": 8, "SILVER": 15, "GOLD": 25, "PLATINUM": 35, "DIAMOND": 42, "MASTER": 48, "GRANDMASTER": 55, "CHALLENGER": 65
        }
    },

    // --- VETERANCY ---
    {
        id: 102001,
        name: "Infinite Armada",
        description: "Play matches of League of Legends on Summoner's Rift.",
        category: "VETERANCY",
        level: "CHALLENGER",
        value: 8432,
        percentile: 0.0008,
        thresholds: {
            "IRON": 100, "BRONZE": 500, "SILVER": 1500, "GOLD": 3000, "PLATINUM": 5000, "DIAMOND": 6500, "MASTER": 7500, "GRANDMASTER": 8000, "CHALLENGER": 8400
        }
    },
    {
        id: 102002,
        name: "Supreme Mastery",
        description: "Achieve mastery level 7 (or high equivalent) on different champions.",
        category: "VETERANCY",
        level: "CHALLENGER",
        value: 154,
        percentile: 0.0015,
        thresholds: {
            "IRON": 2, "BRONZE": 10, "SILVER": 30, "GOLD": 60, "PLATINUM": 90, "DIAMOND": 120, "MASTER": 135, "GRANDMASTER": 145, "CHALLENGER": 150
        }
    },
    {
        id: 102003,
        name: "Abyss Veteran",
        description: "Win matches in ARAM mode.",
        category: "VETERANCY",
        level: "PLATINUM",
        value: 520,
        percentile: 0.14,
        thresholds: {
            "IRON": 10, "BRONZE": 50, "SILVER": 150, "GOLD": 300, "PLATINUM": 500, "DIAMOND": 800, "MASTER": 1200, "GRANDMASTER": 1500, "CHALLENGER": 2000
        }
    },

    // --- TEAMWORK ---
    {
        id: 103001,
        name: "Vision Controller",
        description: "Achieve a vision score of 2 or more per minute in won matches.",
        category: "TEAMWORK",
        level: "CHALLENGER",
        value: 620,
        percentile: 0.0009,
        thresholds: {
            "IRON": 5, "BRONZE": 25, "SILVER": 75, "GOLD": 150, "PLATINUM": 300, "DIAMOND": 450, "MASTER": 550, "GRANDMASTER": 580, "CHALLENGER": 600
        }
    },
    {
        id: 103002,
        name: "Objective Secured",
        description: "Participate in killing Baron Nashors and Dragons with your team.",
        category: "TEAMWORK",
        level: "CHALLENGER",
        value: 3820,
        percentile: 0.0011,
        thresholds: {
            "IRON": 50, "BRONZE": 200, "SILVER": 600, "GOLD": 1200, "PLATINUM": 2000, "DIAMOND": 2800, "MASTER": 3200, "GRANDMASTER": 3500, "CHALLENGER": 3800
        }
    },
    {
        id: 103003,
        name: "Brother in Arms",
        description: "Save allies from certain death by applying shields or heals.",
        category: "TEAMWORK",
        level: "GOLD",
        value: 412,
        percentile: 0.28,
        thresholds: {
            "IRON": 20, "BRONZE": 100, "SILVER": 250, "GOLD": 400, "PLATINUM": 600, "DIAMOND": 900, "MASTER": 1200, "GRANDMASTER": 1500, "CHALLENGER": 1800
        }
    },

    // --- IMAGINATION ---
    {
        id: 104001,
        name: "Spectacular Escape",
        description: "Survive a combat with less than 2% HP and get a kill shortly after.",
        category: "IMAGINATION",
        level: "MASTER",
        value: 35,
        percentile: 0.012,
        thresholds: {
            "IRON": 1, "BRONZE": 5, "SILVER": 10, "GOLD": 18, "PLATINUM": 25, "DIAMOND": 30, "MASTER": 35, "GRANDMASTER": 40, "CHALLENGER": 45
        }
    },
    {
        id: 104002,
        name: "Enemy Invasion",
        description: "Steal buffs or epic monsters from the enemy jungle using long-range abilities.",
        category: "IMAGINATION",
        level: "SILVER",
        value: 8,
        percentile: 0.45,
        thresholds: {
            "IRON": 1, "BRONZE": 4, "SILVER": 8, "GOLD": 15, "PLATINUM": 25, "DIAMOND": 35, "MASTER": 45, "GRANDMASTER": 55, "CHALLENGER": 65
        }
    },
    {
        id: 104003,
        name: "Lightning Victory",
        description: "Win matches in less than 20 minutes on Summoner's Rift.",
        category: "IMAGINATION",
        level: "PLATINUM",
        value: 135,
        percentile: 0.095,
        thresholds: {
            "IRON": 5, "BRONZE": 20, "SILVER": 50, "GOLD": 90, "PLATINUM": 130, "DIAMOND": 180, "MASTER": 220, "GRANDMASTER": 250, "CHALLENGER": 280
        }
    },

    // --- COLLECTION ---
    {
        id: 105001,
        name: "Living Encyclopedia",
        description: "Unlock a large number of champions on your account.",
        category: "COLLECTION",
        level: "CHALLENGER",
        value: 168, // All champions
        percentile: 0.001,
        thresholds: {
            "IRON": 20, "BRONZE": 50, "SILVER": 80, "GOLD": 110, "PLATINUM": 130, "DIAMOND": 150, "MASTER": 160, "GRANDMASTER": 165, "CHALLENGER": 168
        }
    },
    {
        id: 105002,
        name: "Hextech Wardrobe",
        description: "Collect champion skins (all rarities combined).",
        category: "COLLECTION",
        level: "GRANDMASTER",
        value: 652,
        percentile: 0.011,
        thresholds: {
            "IRON": 10, "BRONZE": 50, "SILVER": 150, "GOLD": 300, "PLATINUM": 450, "DIAMOND": 550, "MASTER": 600, "GRANDMASTER": 650, "CHALLENGER": 750
        }
    },
    {
        id: 105003,
        name: "Peak Collector",
        description: "Own legendary or ultimate champion skins.",
        category: "COLLECTION",
        level: "SILVER",
        value: 12,
        percentile: 0.35,
        thresholds: {
            "IRON": 1, "BRONZE": 5, "SILVER": 10, "GOLD": 20, "PLATINUM": 30, "DIAMOND": 45, "MASTER": 60, "GRANDMASTER": 75, "CHALLENGER": 90
        }
    },
    // --- ARAM SPECIFIC CHALLENGES ---
    {
        id: 106001,
        name: "ARAM DPS Threat",
        description: "Deal more than 1800 damage per minute to enemy champions in an ARAM match.",
        category: "EXPERTISE",
        level: "CHALLENGER",
        value: 125,
        percentile: 0.005,
        thresholds: {
            "IRON": 2, "BRONZE": 10, "SILVER": 25, "GOLD": 50, "PLATINUM": 75, "DIAMOND": 100, "MASTER": 115, "GRANDMASTER": 120, "CHALLENGER": 125
        }
    },
    {
        id: 106002,
        name: "ARAM Solo Carry",
        description: "Deal 40% or more of your team's total damage to champions in a won ARAM match.",
        category: "EXPERTISE",
        level: "MASTER",
        value: 18,
        percentile: 0.045,
        thresholds: {
            "IRON": 1, "BRONZE": 3, "SILVER": 6, "GOLD": 10, "PLATINUM": 12, "DIAMOND": 15, "MASTER": 18, "GRANDMASTER": 22, "CHALLENGER": 25
        }
    },
    {
        id: 106003,
        name: "ARAM Active Participant",
        description: "Achieve a kill participation rate higher than 90% in an ARAM match.",
        category: "TEAMWORK",
        level: "GRANDMASTER",
        value: 45,
        percentile: 0.012,
        thresholds: {
            "IRON": 1, "BRONZE": 5, "SILVER": 12, "GOLD": 20, "PLATINUM": 28, "DIAMOND": 35, "MASTER": 40, "GRANDMASTER": 45, "CHALLENGER": 50
        }
    },
    {
        id: 106004,
        name: "ARAM Bad Medicine",
        description: "Pick up health relics in the enemy half of the map in an ARAM match.",
        category: "IMAGINATION",
        level: "GOLD",
        value: 85,
        percentile: 0.15,
        thresholds: {
            "IRON": 5, "BRONZE": 15, "SILVER": 35, "GOLD": 75, "PLATINUM": 120, "DIAMOND": 180, "MASTER": 220, "GRANDMASTER": 250, "CHALLENGER": 300
        }
    },
    {
        id: 106005,
        name: "Abyss Survivor",
        description: "Win an ARAM match without dying a single time.",
        category: "IMAGINATION",
        level: "DIAMOND",
        value: 3,
        percentile: 0.035,
        thresholds: {
            "IRON": 1, "BRONZE": 2, "SILVER": 3, "GOLD": 4, "PLATINUM": 5, "DIAMOND": 6, "MASTER": 8, "GRANDMASTER": 10, "CHALLENGER": 12
        }
    },
    {
        id: 106006,
        name: "All Random All Champions",
        description: "Earn an S- grade or higher on different champions in ARAM mode.",
        category: "COLLECTION",
        level: "GRANDMASTER",
        value: 48,
        percentile: 0.018,
        thresholds: {
            "IRON": 2, "BRONZE": 8, "SILVER": 15, "GOLD": 25, "PLATINUM": 35, "DIAMOND": 42, "MASTER": 45, "GRANDMASTER": 48, "CHALLENGER": 55
        }
    }
];
