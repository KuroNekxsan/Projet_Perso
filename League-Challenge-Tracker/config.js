/**
 * Riot Games API Configuration for the LoL Challenges application.
 * You can edit this file directly to set your default credentials.
 * These settings can also be configured and saved directly via the website interface.
 */
const RIOT_CONFIG = {
    // 1. WHERE TO PUT THE RIOT API KEY:
    // Replace the string below with your Riot Games API key (obtained from https://developer.riotgames.com/)
    // Example: "RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    API_KEY: "",

    // 2. WHERE TO PUT THE PLAYER NAME (Riot ID):
    // LoL Summoner names are now formatted as "Name#Tag" (e.g., Faker#KR1 or Player#NA1)
    DEFAULT_SUMMONER_NAME: "Imout", // Enter the player name here (without the #tag)
    DEFAULT_TAGLINE: "999",         // Enter the tagline here (e.g., EUW, NA1, KR1, etc.)

    // 3. GAME REGIONS & ROUTING SETTINGS:
    // Platform region (e.g., euw1, na1, kr, eun1, br1...)
    DEFAULT_PLATFORM: "euw1",

    // Routing region for the Riot Account API (europe, americas, asia, esports)
    DEFAULT_ROUTE: "europe",

    // Optional: URL of a CORS proxy to bypass browser CORS blocking (e.g., a cors-anywhere server)
    // Leave empty if using Demo Mode or if launching your browser with CORS disabled for local testing.
    CORS_PROXY: "http://localhost:8080/"
};
