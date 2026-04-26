function getApiBase() {
    try {
        const configured = window.localStorage.getItem("pharmaiq_api_base");
        if (configured) return configured.replace(/\/$/, "");
    } catch {}

    const meta = document.querySelector('meta[name="pharmaiq-api-base"]');
    const metaValue = meta?.getAttribute("content");
    if (metaValue) return metaValue.replace(/\/$/, "");

    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        const { protocol, hostname, port } = window.location;

        // Static dev servers commonly run on custom ports while backend stays on :8000.
        if (["5500", "5501", "3000", "5173", "4173"].includes(port)) {
            return `${protocol}//${hostname}:8000/api`;
        }

        return `${window.location.origin.replace(/\/$/, "")}/api`;
    }

    return "http://localhost:8000/api";
}

function getOrCreateRoutineUserId() {
    const key = "pharmaiq_user_id";
    try {
        const stored = window.localStorage.getItem(key);
        if (stored) return stored;

        const generated = window.crypto?.randomUUID
            ? `user-${window.crypto.randomUUID()}`
            : `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
        window.localStorage.setItem(key, generated);
        return generated;
    } catch {
        return `user-${Date.now()}`;
    }
}

function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const API_BASE = getApiBase();
const ROUTINE_USER_ID = getOrCreateRoutineUserId();

const NAV_ITEMS = [
    { id: "finder", label: "Alternative Finder", icon: "fa-magnifying-glass-dollar" },
    { id: "shop", label: "Medicine Shop", icon: "fa-store" },
    { id: "routine", label: "My Daily Routine", icon: "fa-clock" },
    { id: "symptom", label: "Symptom Analyzer", icon: "fa-stethoscope" },
    { id: "interaction", label: "Interaction Checker", icon: "fa-shield-virus" },
    { id: "dosage", label: "Dosage Calculator", icon: "fa-calculator" },
    { id: "effects", label: "Side Effects", icon: "fa-triangle-exclamation" },
    { id: "encyclopedia", label: "Drug Encyclopedia", icon: "fa-book-medical" }
];

const CATEGORY_TAGS = ["All", "Pain Relief", "Diabetes", "Heart Care", "Supplements", "Devices"];

const CHAT_PROMPTS = [
    "What is the best dose for fever medicine?",
    "Check interaction between two medicines",
    "Suggest cheaper alternatives for Napa",
    "What side effects should I watch for?"
];
