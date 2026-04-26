const { useEffect, useMemo, useState } = React;

async function callApi(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Request failed");
    }
    return res.json();
}

function JsonView({ title, data }) {
    if (!data) return null;
    return (
        <div className="mt-4">
            <h3 className="font-bold text-slate-700 mb-2">{title}</h3>
            <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs md:text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

function App() {
    const [view, setView] = useState("finder");
    const [mobileMenu, setMobileMenu] = useState(false);

    const initialRoutineReminders = [];

    const [query, setQuery] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanFile, setScanFile] = useState(null);
    const [scanPreviewUrl, setScanPreviewUrl] = useState("");
    const [scanMedicines, setScanMedicines] = useState([]);
    const [activeScannedMedicine, setActiveScannedMedicine] = useState("");
    const [scanError, setScanError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);

    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatSending, setChatSending] = useState(false);
    const [chatCheckoutFlow, setChatCheckoutFlow] = useState({
        active: false,
        step: "",
        name: "",
        mobile: "",
        address: ""
    });
    const [chatMessages, setChatMessages] = useState([
        {
            sender: "bot",
            text: "Hello, I am PharmaBot. Ask me anything about medicines, side effects, dosage, interactions, or cheaper alternatives."
        }
    ]);

    const [profile, setProfile] = useState({
        name: "",
        allergies: [],
        reminders: initialRoutineReminders
    });

    const [shopProducts, setShopProducts] = useState([]);
    const [shopLoading, setShopLoading] = useState(true);
    const [shopSearch, setShopSearch] = useState("");
    const [shopCategory, setShopCategory] = useState("All");
    const [cart, setCart] = useState([]);
    const [checkoutForm, setCheckoutForm] = useState({ name: "", mobile: "", address: "" });
    const [checkoutError, setCheckoutError] = useState("");
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(null);

    const [symptomForm, setSymptomForm] = useState({ symptoms: "", age: "", duration: "" });
    const [interactionInput, setInteractionInput] = useState("");
    const [dosageForm, setDosageForm] = useState({ medicine_name: "", age: "", weight: "", condition: "" });
    const [effectsForm, setEffectsForm] = useState({ medicine_name: "", patient_age: "", existing_conditions: "" });
    const [encyclopediaDrug, setEncyclopediaDrug] = useState("");

    const [moduleLoading, setModuleLoading] = useState("");
    const [moduleError, setModuleError] = useState("");
    const [systemStatus, setSystemStatus] = useState({
        apiReachable: true,
        storageMode: "loading",
        productsSource: "",
        aiReady: true,
        notice: ""
    });
    const [symptomResult, setSymptomResult] = useState(null);
    const [interactionResult, setInteractionResult] = useState(null);
    const [dosageResult, setDosageResult] = useState(null);
    const [effectsResult, setEffectsResult] = useState(null);
    const [encyclopediaResult, setEncyclopediaResult] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const loadHealth = async () => {
            try {
                const res = await fetch(`${API_BASE}/health`);
                if (!res.ok) {
                    throw new Error("Health check failed");
                }

                const data = await res.json();
                const storageMode = data.storage_mode || "local";
                const notice = storageMode === "local"
                    ? "Running in local mode. Routine and orders stay on this machine when Firebase is unavailable."
                    : "";

                setSystemStatus({
                    apiReachable: true,
                    storageMode,
                    productsSource: data.products_source || "",
                    aiReady: Boolean(data.ai_ready),
                    notice
                });
            } catch {
                setSystemStatus({
                    apiReachable: false,
                    storageMode: "offline",
                    productsSource: "",
                    aiReady: false,
                    notice: `Backend is not reachable at ${API_BASE}. Start the FastAPI server to use AI, products, and saved routine data.`
                });
            }
        };

        loadHealth();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setShopLoading(true);
            try {
                const res = await fetch(`${API_BASE}/products`);
                if (!res.ok) {
                    throw new Error("Could not load products");
                }
                const data = await res.json();
                const normalized = (Array.isArray(data) ? data : []).map((p, i) => ({
                    id: p.id || String(i + 1),
                    name: p.name || p.medicine_name || p.brand_name || p.generic_name || "Medicine",
                    brandName: p.brand_name || p.brand || p.medicine_name || p.name || "Unknown Brand",
                    genericName: p.generic_name || p.generic || "",
                    medicineName: p.medicine_name || p.medicineName || p.name || p.brand_name || "",
                    price: Number(p.price || 0),
                    brand: p.brand || p.brand_name || "Pharma Brand",
                    company: p.company || p.manufacturer || "",
                    drugClass: p.drug_class || p.class || "",
                    form: p.form || "",
                    strength: p.strength || "",
                    offer: p.offer || "",
                    packaging: Array.isArray(p.packaging) ? p.packaging : (p.packaging ? [String(p.packaging)] : []),
                    category: p.category || p.group || p.type || ["Pain Relief", "Diabetes", "Heart Care", "Supplements"][i % 4],
                    imageUrl: p.imageUrl || p.image_url || p.image || p.thumbnail || p.photo || "",
                    description: p.description || p.short_description || p.details || "",
                    stock: p.stock ?? p.quantity ?? null
                }));
                setShopProducts(normalized);
            } catch (e) {
                setShopProducts([]);
                setSystemStatus((prev) => ({
                    ...prev,
                    apiReachable: false,
                    notice: `Backend is not reachable at ${API_BASE}. Start the FastAPI server to use AI, products, and saved routine data.`
                }));
            } finally {
                setShopLoading(false);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        const loadRoutine = async () => {
            try {
                const res = await fetch(`${API_BASE}/user/${ROUTINE_USER_ID}`);
                if (!res.ok) return;

                const data = await res.json();
                const remoteRoutine = Array.isArray(data.routine) ? data.routine.map((item, index) => ({
                    id: item.id || item.routine_id || `${Date.now()}-${index}`,
                    dbId: item.id || item.routine_id || "",
                    time: item.time || "09:00 PM",
                    medicine: item.medicine || item.name || "Medicine",
                    status: item.status || "Pending",
                    lastTakenDate: item.last_taken_date || item.lastTakenDate || ""
                })) : [];

                setProfile((prev) => ({ ...prev, reminders: remoteRoutine }));
            } catch {
                // Keep local state when backend is unavailable.
            }
        };

        loadRoutine();
    }, []);

    useEffect(() => {
        if (!scanFile) {
            setScanPreviewUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(scanFile);
        setScanPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [scanFile]);

    const progress = useMemo(() => {
        const total = profile.reminders.length;
        const today = getTodayKey();
        const taken = profile.reminders.filter((item) => (item.lastTakenDate || "") === today).length;
        return total ? Math.round((taken / total) * 100) : 0;
    }, [profile.reminders]);

    const filteredProducts = useMemo(() => {
        return shopProducts.filter((p) => {
            const matchCategory = shopCategory === "All" || p.category === shopCategory;
            const q = shopSearch.toLowerCase().trim();
            const matchSearch = !q ||
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                (p.brandName || "").toLowerCase().includes(q) ||
                (p.genericName || "").toLowerCase().includes(q) ||
                (p.company || "").toLowerCase().includes(q);
            return matchCategory && matchSearch;
        });
    }, [shopProducts, shopCategory, shopSearch]);

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

    const getProductImage = (product) => {
        return product.imageUrl || product.image_url || product.image || product.thumbnail || product.photo || "";
    };

    const normalizeText = (value) => String(value || "").toLowerCase().trim();

    const buildFinderRow = (base) => {
        const basePrice = Number(base.price || 0);
        const baseGeneric = normalizeText(base.genericName);

        const alternatives = shopProducts
            .filter((p) => {
                if (p.id === base.id) return false;

                const genericName = normalizeText(p.genericName);
                if (!baseGeneric || !genericName || genericName !== baseGeneric) return false;

                const altPrice = Number(p.price || 0);
                return altPrice > 0;
            })
            .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
            .slice(0, 20);

        const cheapest = alternatives[0];
        const bestSaving = cheapest ? Math.max(basePrice - Number(cheapest.price || 0), 0) : 0;

        return {
            base,
            alternatives,
            bestSaving
        };
    };

    const buildFinderRowsForText = (searchText, options = {}) => {
        const text = String(searchText || "").toLowerCase().trim();
        if (!text || shopProducts.length === 0) {
            return [];
        }

        const singleMedicine = Boolean(options.singleMedicine);

        const medicineFields = (p) => [
            p.name,
            p.medicineName,
            p.brandName,
            p.genericName,
            p.company,
            p.drugClass,
            p.category,
            p.form,
            p.strength,
            p.description
        ]
            .map(normalizeText)
            .filter(Boolean);

        const includesQuery = (p) => {
            return medicineFields(p).some((field) => field.includes(text));
        };

        const words = text.split(/\s+/).filter(Boolean);
        const matchesAnyWord = (p) => {
            return medicineFields(p).some((field) => words.some((word) => field.includes(word)));
        };

        const baseCandidates = shopProducts
            .filter((p) => includesQuery(p) || matchesAnyWord(p));

        if (singleMedicine) {
            const primaryField = (p) => [p.brandName, p.name, p.medicineName, p.genericName]
                .map(normalizeText)
                .find(Boolean) || "";
            const primaryFields = (p) => [p.brandName, p.name, p.medicineName, p.genericName]
                .map(normalizeText)
                .filter(Boolean);

            const exact = baseCandidates.find((p) => primaryFields(p).some((field) => field === text));
            const startsWith = baseCandidates.find((p) => primaryFields(p).some((field) => field.startsWith(text) || text.startsWith(field)));
            const contains = baseCandidates.find((p) => primaryFields(p).some((field) => field.includes(text)));

            const picked = exact || startsWith || contains || baseCandidates[0];
            return picked ? [buildFinderRow(picked)] : [];
        }

        return baseCandidates.slice(0, 6).map(buildFinderRow);
    };

    const preventEnterSubmit = (e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
        }
    };

    const refreshApp = () => {
        window.location.reload();
    };

    const searchMedicines = (override, options = {}) => {
        const terms = Array.isArray(override)
            ? override.map((item) => String(item || "").trim()).filter(Boolean)
            : [String(override || query || "").trim()].filter(Boolean);

        if (terms.length === 0) {
            setHasSearched(false);
            setResults([]);
            return;
        }

        setHasSearched(true);
        setView("finder");
        setIsLoading(true);
        setResults([]);

        setTimeout(() => {
            const mergedRows = [];
            const seen = new Set();
            const singleMedicine = Boolean(options.singleMedicine);

            terms.forEach((term) => {
                const rows = buildFinderRowsForText(term, { singleMedicine });
                rows.forEach((row) => {
                    if (singleMedicine) {
                        mergedRows.push(row);
                        return;
                    }

                    const key = String(row.base.id || row.base.name || "").toLowerCase();
                    if (!key || seen.has(key)) return;
                    seen.add(key);
                    mergedRows.push(row);
                });
            });

            setResults(mergedRows);
            setIsLoading(false);
        }, 550);
    };

    const applyScannedMedicine = (medicineName) => {
        const clean = String(medicineName || "").trim();
        if (!clean) return;
        setActiveScannedMedicine(clean.toLowerCase());
        setQuery(clean);
        setHasSearched(true);
        searchMedicines(clean, { singleMedicine: true });
    };

    const runScan = async () => {
        if (!scanFile) {
            setScanError("Please select a prescription image first.");
            return;
        }

        setScanError("");
        setScanMedicines([]);
        setIsScanning(true);

        try {
            const formData = new FormData();
            formData.append("image", scanFile);

            const response = await fetch(`${API_BASE}/scan-prescription`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Scan failed. Please try again.");
            }

            const data = await response.json();
            const medicines = Array.isArray(data.medicines)
                ? data.medicines
                    .map((item) => {
                        if (typeof item === "string") {
                            return {
                                name: item,
                                strength: "",
                                notes: "",
                                confidence: 0
                            };
                        }
                        return item;
                    })
                    .filter((item) => item && String(item.name || "").trim())
                    .map((item) => ({
                        name: String(item.name || "").trim(),
                        strength: String(item.strength || "").trim(),
                        notes: String(item.notes || "").trim(),
                        confidence: Number(item.confidence || 0)
                    }))
                : [];

            if (medicines.length === 0) {
                const backendHint = String(data.error || "").trim();
                const lowerHint = backendHint.toLowerCase();
                const quotaIssue = lowerHint.includes("429") || lowerHint.includes("quota") || lowerHint.includes("rate");
                const msg = quotaIssue
                    ? "AI scan quota is temporarily exceeded. Please wait a little and try again."
                    : backendHint
                        ? `Could not read medicine names. Scan service says: ${backendHint}`
                        : "Could not read medicine names from this image. Please upload a clearer image.";
                setScanError(msg);
                return;
            }

            setScanMedicines(medicines);
            setActiveScannedMedicine("");
            setQuery(medicines.map((item) => item.name).join(", "));
            searchMedicines(medicines.map((item) => item.name));
        } catch (err) {
            setScanError(err.message || "Scan failed. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const persistRoutineItem = async (item) => {
        const response = await fetch(`${API_BASE}/user/${ROUTINE_USER_ID}/routine`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                medicine: item.medicine,
                time: item.time,
                status: item.status,
                last_taken_date: item.lastTakenDate || ""
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to save routine item");
        }

        return response.json();
    };

    const deleteRoutineItem = async (routineId) => {
        const response = await fetch(`${API_BASE}/user/${ROUTINE_USER_ID}/routine/${routineId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to delete routine item");
        }

        return response.json();
    };

    const updateRoutineStatus = async (routineId, status) => {
        const response = await fetch(`${API_BASE}/user/${ROUTINE_USER_ID}/routine/${routineId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status,
                last_taken_date: status === "Taken" ? getTodayKey() : ""
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to update routine item");
        }

        return response.json();
    };

    const addToRoutine = async (medName) => {
        const next = {
            id: Date.now(),
            dbId: "",
            time: "09:00 PM",
            medicine: medName,
            status: "Pending",
            lastTakenDate: ""
        };
        setProfile((prev) => ({ ...prev, reminders: [...prev.reminders, next] }));
        setView("routine");

        try {
            const data = await persistRoutineItem(next);
            const savedId = data.id || data.routine_id || "";
            if (savedId) {
                setProfile((prev) => ({
                    ...prev,
                    reminders: prev.reminders.map((item) => item.id === next.id ? { ...item, dbId: savedId } : item)
                }));
            }
            return { ok: true, item: next };
        } catch (err) {
            setModuleError(err.message || "Failed to save routine item.");
            return { ok: false, message: err.message || "Failed to save routine item." };
        }
    };

    const completeRoutineItem = async (id) => {
        const target = profile.reminders.find((item) => item.id === id);
        if (!target) return { ok: false, message: "Routine item not found." };
        const today = getTodayKey();

        setProfile((prev) => ({
            ...prev,
            reminders: prev.reminders.map((item) => item.id === id ? { ...item, status: "Taken", lastTakenDate: today } : item)
        }));

        try {
            if (target.dbId) {
                await updateRoutineStatus(target.dbId, "Taken");
            }
            return { ok: true, item: target };
        } catch (err) {
            setModuleError(err.message || "Failed to complete routine item.");
            setProfile((prev) => ({
                ...prev,
                reminders: prev.reminders.map((item) => item.id === id ? { ...item, status: target.status, lastTakenDate: target.lastTakenDate || "" } : item)
            }));
            return { ok: false, message: err.message || "Failed to complete routine item." };
        }
    };

    const removeRoutineItemFromList = async (id) => {
        const target = profile.reminders.find((item) => item.id === id);
        if (!target) return { ok: false, message: "Routine item not found." };

        setProfile((prev) => ({
            ...prev,
            reminders: prev.reminders.filter((item) => item.id !== id)
        }));

        try {
            if (target.dbId) {
                await deleteRoutineItem(target.dbId);
            }
            return { ok: true, item: target };
        } catch (err) {
            setModuleError(err.message || "Failed to delete routine item.");
            setProfile((prev) => ({ ...prev, reminders: [...prev.reminders, target] }));
            return { ok: false, message: err.message || "Failed to delete routine item." };
        }
    };

    const addToCart = (product) => {
        setCart((prev) => {
            const exist = prev.find((x) => x.id === product.id);
            if (exist) {
                return prev.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const changeQty = (id, delta) => {
        setCart((prev) => prev
            .map((item) => item.id === id ? { ...item, qty: item.qty + delta } : item)
            .filter((item) => item.qty > 0)
        );
    };

    const buyFromFinder = (product) => {
        addToCart(product);
        setShopSearch(product.name || product.brandName || "");
        setView("shop");
    };

    const findBestProductMatch = (rawText) => {
        const normalizedSentence = normalizeText(rawText)
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const text = normalizedSentence
            .replace(/\b(add|to|cart|buy|please|medicine|medicines|now|this|that|korte|daw|dao|koro|hello|hi|i|want|need|am|ei|ta|ekta)\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (!text) return null;

        const exact = shopProducts.find((p) => {
            const values = [p.name, p.brandName, p.genericName].map(normalizeText);
            return values.includes(text);
        });
        if (exact) return exact;

        const phraseHit = shopProducts.find((p) => {
            const values = [p.name, p.brandName, p.genericName]
                .map((value) => normalizeText(value).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim())
                .filter(Boolean);
            return values.some((value) => normalizedSentence.includes(value));
        });
        if (phraseHit) return phraseHit;

        const simpleContains = shopProducts.find((p) => {
            const hay = [p.name, p.brandName, p.genericName, p.company].map(normalizeText).join(" ");
            return hay.includes(text);
        });
        if (simpleContains) return simpleContains;

        const tokens = text.split(" ").filter((token) => token.length > 1);
        if (tokens.length === 0) return null;

        let bestMatch = null;
        let bestScore = 0;

        for (const product of shopProducts) {
            const productText = [product.name, product.brandName, product.genericName, product.company]
                .map((value) => normalizeText(value).replace(/[^a-z0-9\s]/g, " "))
                .join(" ");

            let score = 0;
            for (const token of tokens) {
                if (productText.includes(token)) score += 1;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = product;
            }
        }

        return bestScore > 0 ? bestMatch : null;
    };

    const findCheapestByGenericFromText = (rawText) => {
        const text = normalizeText(rawText);
        const genericPool = Array.from(new Set(shopProducts.map((p) => normalizeText(p.genericName)).filter(Boolean)));
        const matchedGeneric = genericPool.find((generic) => text.includes(generic));
        if (!matchedGeneric) return null;

        const sameGeneric = shopProducts
            .filter((p) => normalizeText(p.genericName) === matchedGeneric)
            .sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

        if (sameGeneric.length === 0) return null;

        const cheapest = sameGeneric[0];
        const highest = sameGeneric[sameGeneric.length - 1];
        const savePerUnit = Math.max(Number(highest.price || 0) - Number(cheapest.price || 0), 0);

        return { generic: matchedGeneric, cheapest, savePerUnit };
    };

    const parseCheckoutDetailsFromText = (rawText) => {
        const text = String(rawText || "").trim();

        const nameMatch = text.match(/name\s*[:\-]\s*([^,\n]+)/i);
        const numberMatch = text.match(/(?:number|mobile|phone)\s*[:\-]\s*([^,\n]+)/i);
        const addressMatch = text.match(/address\s*[:\-]\s*([^\n]+)/i);

        if (!nameMatch || !numberMatch || !addressMatch) return null;

        return {
            name: nameMatch[1].trim(),
            mobile: numberMatch[1].trim(),
            address: addressMatch[1].trim()
        };
    };

    const openCheckoutFlow = () => {
        setView("shop");
        setChatCheckoutFlow({ active: true, step: "details", name: "", mobile: "", address: "" });
        return "Please give me your name, mobile number, and address in one message. Example: Name: John Doe, Number: 019221XXXX, Address: House 12, Road 5, Dhaka.";
    };

    const isRoutineDone = (status) => {
        const value = normalizeText(status);
        return value === "taken" || value === "completed";
    };

    const isRoutineDoneToday = (item, date = getTodayKey()) => {
        return isRoutineDone(item?.status) && String(item?.lastTakenDate || "") === date;
    };

    const getRoutineStatusLabel = (item, date = getTodayKey()) => {
        if (isRoutineDoneToday(item, date)) return "Taken today";
        if (item?.lastTakenDate) return `Pending today | Last taken ${item.lastTakenDate}`;
        return "Pending today";
    };

    const parseRoutineTimeToMinutes = (timeText) => {
        const text = String(timeText || "").trim();
        const match = text.match(/(\d{1,2})\s*:\s*(\d{2})\s*(am|pm)?/i);
        if (!match) return Number.MAX_SAFE_INTEGER;

        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const meridiem = (match[3] || "").toLowerCase();

        if (meridiem === "pm" && hours < 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;

        return (hours * 60) + minutes;
    };

    const getSortedRoutineItems = () => {
        return [...profile.reminders].sort((a, b) => parseRoutineTimeToMinutes(a.time) - parseRoutineTimeToMinutes(b.time));
    };

    const formatRoutineLines = (items) => {
        return items.map((item, index) => {
            const statusLabel = isRoutineDoneToday(item) ? "Taken today" : "Pending today";
            return `${index + 1}. ${item.medicine} at ${item.time} - ${statusLabel}`;
        }).join("\n");
    };

    const findRoutineMatch = (rawText, options = {}) => {
        const { allowDefault = false } = options;
        const normalizedSentence = normalizeText(rawText)
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const cleaned = normalizedSentence
            .replace(/\b(my|daily|pill|routine|medicine|medicines|tablet|tablets|capsule|capsules|today|take|took|taken|mark|as|done|complete|completed|delete|remove|from|please|should|which|what|need|do|i)\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const reminders = getSortedRoutineItems();
        if (!cleaned) return allowDefault ? (reminders[0] || null) : null;

        const exact = reminders.find((item) => normalizeText(item.medicine) === cleaned);
        if (exact) return exact;

        const phrase = reminders.find((item) => normalizedSentence.includes(normalizeText(item.medicine)));
        if (phrase) return phrase;

        const tokens = cleaned.split(" ").filter((token) => token.length > 1);
        if (tokens.length === 0) return null;

        let best = null;
        let bestScore = 0;

        for (const item of reminders) {
            const medicineText = normalizeText(item.medicine).replace(/[^a-z0-9\s]/g, " ");
            const score = tokens.reduce((sum, token) => sum + (medicineText.includes(token) ? 1 : 0), 0);
            if (score > bestScore) {
                bestScore = score;
                best = item;
            }
        }

        return bestScore > 0 ? best : null;
    };

    const getRoutineSummaryReply = () => {
        const reminders = getSortedRoutineItems();
        if (reminders.length === 0) {
            return "Your daily pill routine is empty right now. Add a medicine from Finder, Shop, or tell me to add one to your routine.";
        }

        const pending = reminders.filter((item) => !isRoutineDoneToday(item));
        const taken = reminders.filter((item) => isRoutineDoneToday(item));

        if (pending.length === 0) {
            return `You already completed all medicines in your daily pill routine today.\n${formatRoutineLines(reminders)}`;
        }

        let reply = `From your daily pill routine, you still need to take:\n${formatRoutineLines(pending)}`;
        if (taken.length > 0) {
            reply += `\n\nAlready marked as taken:\n${formatRoutineLines(taken)}`;
        }
        return reply;
    };

    const getChatAppContext = () => ({
        current_date: getTodayKey(),
        daily_pill_routine: getSortedRoutineItems().map((item) => ({
            medicine: item.medicine,
            time: item.time,
            status: item.status,
            last_taken_date: item.lastTakenDate || "",
            taken_today: isRoutineDoneToday(item)
        })),
        cart: cart.map((item) => ({
            name: item.brandName || item.name,
            qty: item.qty,
            price: item.price
        }))
    });

    const submitCheckoutWithDetails = async (name, mobile, address) => {
        if (cart.length === 0) {
            setCheckoutError("Your cart is empty.");
            return { ok: false, message: "Your cart is empty. Please add a medicine first." };
        }

        const safeName = String(name || "").trim();
        const safeMobile = String(mobile || "").trim();
        const safeAddress = String(address || "").trim();

        if (!safeName || !safeMobile || !safeAddress) {
            return { ok: false, message: "Please provide name, phone number, and address." };
        }

        const mobileOk = /^\+?[0-9\-\s]{10,15}$/.test(safeMobile);
        if (!mobileOk) {
            return { ok: false, message: "Phone number seems invalid. Please enter a valid phone number." };
        }

        setCheckoutLoading(true);
        setCheckoutError("");

        try {
            const payload = {
                customer_name: safeName,
                mobile: safeMobile,
                address: safeAddress,
                total: cartTotal,
                items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    brand: item.brand || item.brandName || "",
                    qty: item.qty,
                    price: item.price
                }))
            };

            const response = await fetch(`${API_BASE}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMessage = "Checkout failed. Please try again.";
                try {
                    const errorData = await response.json();
                    if (errorData.detail) errorMessage = String(errorData.detail);
                } catch {
                    // Keep generic fallback.
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
            setOrderConfirmed({
                orderId: data.order_id || `PH-${Date.now().toString().slice(-6)}`,
                name: safeName,
                mobile: safeMobile,
                address: safeAddress,
                items: totalItems,
                total: cartTotal
            });

            setCart([]);
            setCheckoutForm({ name: "", mobile: "", address: "" });
            return {
                ok: true,
                message: `Order placed successfully. Order ID: ${data.order_id || "Generated"}. Total: Tk ${cartTotal.toFixed(2)} for ${totalItems} item(s).`
            };
        } catch (err) {
            const message = err.message || "Checkout failed.";
            setCheckoutError(message);
            return { ok: false, message };
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleCheckout = async () => {
        const result = await submitCheckoutWithDetails(checkoutForm.name, checkoutForm.mobile, checkoutForm.address);
        if (!result.ok && !checkoutError) {
            setCheckoutError(result.message);
        }
    };

    const processPharmaBotAction = async (userText) => {
        const message = normalizeText(userText);
        const wantsRoutineContext = /routine|daily pill|pill routine|medicine routine|reminder|what should i take today|what do i take today|which medicine should i take today|which medicine do i take today|today which medicine|today what medicine|today.*take/.test(message);
        const wantsRoutineAdd = wantsRoutineContext && /\b(add|include|save|set)\b/.test(message);
        const wantsRoutineDelete = wantsRoutineContext && /\b(delete|remove|cancel)\b/.test(message);
        const wantsRoutineComplete = wantsRoutineContext && /\b(took|taken|complete|completed|done|finished|mark)\b/.test(message);
        const wantsRoutineList = wantsRoutineContext && /\b(show|list|which|what|today|see|tell)\b/.test(message);

        if (chatCheckoutFlow.active) {
            if (chatCheckoutFlow.step === "details") {
                const details = parseCheckoutDetailsFromText(userText);
                if (!details) {
                    return {
                        handled: true,
                        reply: "Please send all details in this format: Name: John Doe, Number: 019221XXXX, Address: House 12, Road 5, Dhaka."
                    };
                }

                setCheckoutForm((prev) => ({
                    ...prev,
                    name: details.name,
                    mobile: details.mobile,
                    address: details.address
                }));
                setChatCheckoutFlow({ active: false, step: "", name: "", mobile: "", address: "" });
                const result = await submitCheckoutWithDetails(details.name, details.mobile, details.address);
                return { handled: true, reply: result.message };
            }
        }

        if (wantsRoutineAdd) {
            const product = findBestProductMatch(userText);
            const medicineName = product ? (product.brandName || product.name) : "";

            if (!medicineName) {
                return {
                    handled: true,
                    reply: "Please tell me the medicine name you want to add to your daily pill routine. Example: Add Napa to my routine."
                };
            }

            const exists = profile.reminders.find((item) => normalizeText(item.medicine) === normalizeText(medicineName));
            if (exists) {
                setView("routine");
                return {
                    handled: true,
                    reply: `${exists.medicine} is already in your daily pill routine at ${exists.time}.`
                };
            }

            const result = await addToRoutine(medicineName);
            return {
                handled: true,
                reply: result.ok
                    ? `${medicineName} has been added to your daily pill routine for ${result.item.time}.`
                    : (result.message || "I could not add that medicine to your routine right now.")
            };
        }

        if (wantsRoutineDelete) {
            const target = findRoutineMatch(userText);
            if (!target) {
                return {
                    handled: true,
                    reply: "I could not match a medicine from your daily pill routine. Please say the medicine name clearly."
                };
            }

            const result = await removeRoutineItemFromList(target.id);
            return {
                handled: true,
                reply: result.ok
                    ? `${target.medicine} has been removed from your daily pill routine.`
                    : (result.message || "I could not remove that routine item right now.")
            };
        }

        if (wantsRoutineComplete) {
            const target = findRoutineMatch(userText);
            if (!target) {
                return {
                    handled: true,
                    reply: "I could not find which routine medicine you want to mark as taken. Please send the medicine name."
                };
            }

            if (isRoutineDoneToday(target)) {
                return {
                    handled: true,
                    reply: `${target.medicine} is already marked as taken in your daily pill routine.`
                };
            }

            const result = await completeRoutineItem(target.id);
            return {
                handled: true,
                reply: result.ok
                    ? `${target.medicine} is now marked as taken for today.`
                    : (result.message || "I could not update that routine item right now.")
            };
        }

        if (wantsRoutineList) {
            setView("routine");
            return {
                handled: true,
                reply: getRoutineSummaryReply()
            };
        }

        const wantsAlternative = /\b(alternative|cheapest|lowest|low price|sasta|kom dami)\b/.test(message);
        const wantsAdd = /\badd to cart\b|\b(add|cart)\b/.test(message);
        const wantsBuy = /\b(buy|kino|kinte|purchase|order)\b/.test(message);

        if (wantsAlternative && !wantsAdd && !wantsBuy) {
            const base = findBestProductMatch(userText);
            if (!base) {
                return {
                    handled: true,
                    reply: "Please share the medicine name clearly. Example: Which medicine is an alternative of Napa 500?"
                };
            }

            const baseGeneric = normalizeText(base.genericName);
            if (!baseGeneric) {
                return {
                    handled: true,
                    reply: `I found ${base.brandName || base.name}, but I do not have its generic name in the dataset. Please try another medicine name.`
                };
            }

            const alternatives = shopProducts
                .filter((p) => p.id !== base.id && normalizeText(p.genericName) === baseGeneric)
                .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
                .slice(0, 3);

            if (alternatives.length === 0) {
                return {
                    handled: true,
                    reply: `I could not find alternatives for ${base.brandName || base.name} in the current dataset.`
                };
            }

            const listText = alternatives
                .map((item, idx) => `${idx + 1}. ${item.brandName || item.name} - Tk ${Number(item.price || 0).toFixed(2)}`)
                .join("\n");

            return {
                handled: true,
                reply: `Alternatives for ${base.brandName || base.name} (generic: ${base.genericName}):\n${listText}\n\nIf you want, I can add one to your cart.`
            };
        }

        if (wantsAlternative && (wantsAdd || wantsBuy)) {
            const alt = findCheapestByGenericFromText(userText);
            if (!alt) {
                return {
                    handled: true,
                    reply: "Which generic medicine do you want the cheaper alternative for? Example: Paracetamol, Omeprazole, Metformin."
                };
            }

            addToCart(alt.cheapest);
            setView("shop");
            const genericTitle = alt.cheapest.genericName || alt.generic;
            const saveLine = `I added ${alt.cheapest.brandName || alt.cheapest.name} (generic: ${genericTitle}) to cart. You save Tk ${alt.savePerUnit.toFixed(2)} per unit compared to the highest-priced option in this generic.`;

            if (wantsBuy) {
                const prompt = openCheckoutFlow();
                return { handled: true, reply: `${saveLine}\n\n${prompt}` };
            }
            return { handled: true, reply: saveLine };
        }

        if (wantsAdd || wantsBuy) {
            const product = findBestProductMatch(userText);
            if (!product) {
                return {
                    handled: true,
                    reply: "I could not identify the medicine. Please send the exact medicine or brand name."
                };
            }

            addToCart(product);
            setView("shop");
            setShopSearch(product.name || product.brandName || "");

            const addedLine = `${product.brandName || product.name} added to cart successfully.`;
            if (wantsBuy) {
                const prompt = openCheckoutFlow();
                return { handled: true, reply: `${addedLine}\n\n${prompt}` };
            }
            return { handled: true, reply: addedLine };
        }

        if (/\bcheckout\b|\bplace order\b|\border now\b/.test(message)) {
            if (cart.length === 0) {
                return { handled: true, reply: "Your cart is empty. Add a medicine first." };
            }
            return { handled: true, reply: openCheckoutFlow() };
        }

        return { handled: false, reply: "" };
    };

    const sendMessage = async (messageText) => {
        const userText = messageText.trim();
        if (!userText || chatSending) return;

        setChatSending(true);
        const updated = [...chatMessages, { sender: "user", text: userText }];
        setChatMessages(updated);
        setChatInput("");

        try {
            const localAction = await processPharmaBotAction(userText);
            if (localAction.handled) {
                setChatMessages([...updated, { sender: "bot", text: localAction.reply }]);
                return;
            }

            const history = updated.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text
            }));
            const data = await callApi("/chat", { message: userText, history, app_context: getChatAppContext() });
            setChatMessages([...updated, { sender: "bot", text: data.response || "No response" }]);
        } catch (err) {
            setChatMessages([...updated, { sender: "bot", text: `Error: ${err.message}` }]);
        } finally {
            setChatSending(false);
        }
    };

    const sendChat = async (e) => {
        e.preventDefault();
        await sendMessage(chatInput);
    };

    const useQuickPrompt = async (prompt) => {
        setChatInput(prompt);
        await sendMessage(prompt);
    };

    const submitSymptom = async (e) => {
        e.preventDefault();
        setModuleError("");
        setModuleLoading("symptom");
        setSymptomResult(null);

        const symptomText = String(symptomForm.symptoms || "").trim();
        if (symptomText.length < 6) {
            setModuleError("Please describe symptoms with a little more detail.");
            setModuleLoading("");
            return;
        }

        try {
            const data = await callApi("/symptoms", {
                symptoms: symptomText,
                age: symptomForm.age ? Number(symptomForm.age) : null,
                duration: symptomForm.duration
            });
            setSymptomResult(data);
        } catch (err) {
            setModuleError(err.message);
        } finally {
            setModuleLoading("");
        }
    };

    const submitInteraction = async (e) => {
        e.preventDefault();
        setModuleError("");
        setModuleLoading("interaction");
        setInteractionResult(null);

        const medicines = interactionInput.split(",").map((m) => m.trim()).filter(Boolean);
        if (medicines.length < 2) {
            setModuleError("Please enter at least 2 medicine names, separated by commas.");
            setModuleLoading("");
            return;
        }

        try {
            const data = await callApi("/interactions", { medicines });
            setInteractionResult(data);
        } catch (err) {
            setModuleError(err.message);
        } finally {
            setModuleLoading("");
        }
    };

    const submitDosage = async (e) => {
        e.preventDefault();
        setModuleError("");
        setModuleLoading("dosage");
        setDosageResult(null);

        const age = Number(dosageForm.age);
        const weight = Number(dosageForm.weight);
        if (!Number.isFinite(age) || age <= 0 || !Number.isFinite(weight) || weight <= 0) {
            setModuleError("Please enter valid age and weight values.");
            setModuleLoading("");
            return;
        }

        try {
            const data = await callApi("/dosage", {
                medicine_name: dosageForm.medicine_name,
                age,
                weight,
                condition: dosageForm.condition
            });
            setDosageResult(data);
        } catch (err) {
            setModuleError(err.message);
        } finally {
            setModuleLoading("");
        }
    };

    const submitEffects = async (e) => {
        e.preventDefault();
        setModuleError("");
        setModuleLoading("effects");
        setEffectsResult(null);

        const medicineName = String(effectsForm.medicine_name || "").trim();
        if (!medicineName) {
            setModuleError("Please enter the medicine name.");
            setModuleLoading("");
            return;
        }

        try {
            const data = await callApi("/side-effects", {
                medicine_name: medicineName,
                patient_age: effectsForm.patient_age ? Number(effectsForm.patient_age) : null,
                existing_conditions: effectsForm.existing_conditions
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
            });
            setEffectsResult(data);
        } catch (err) {
            setModuleError(err.message);
        } finally {
            setModuleLoading("");
        }
    };

    const submitEncyclopedia = async (e) => {
        e.preventDefault();
        setModuleError("");
        setModuleLoading("encyclopedia");
        setEncyclopediaResult(null);

        const medicineName = String(encyclopediaDrug || "").trim();
        if (!medicineName) {
            setModuleError("Please enter a medicine name.");
            setModuleLoading("");
            return;
        }

        try {
            const data = await callApi("/medicine-info", { medicine_name: medicineName });
            setEncyclopediaResult(data);
        } catch (err) {
            setModuleError(err.message);
        } finally {
            setModuleLoading("");
        }
    };

    const ctx = {
        view,
        setView,
        mobileMenu,
        setMobileMenu,
        query,
        setQuery,
        isScanning,
        scanFile,
        setScanFile,
        scanPreviewUrl,
        scanMedicines,
        setScanMedicines,
        activeScannedMedicine,
        setActiveScannedMedicine,
        scanError,
        setScanError,
        isLoading,
        results,
        chatOpen,
        setChatOpen,
        chatInput,
        setChatInput,
        chatSending,
        chatCheckoutFlow,
        setChatCheckoutFlow,
        chatMessages,
        setChatMessages,
        profile,
        setProfile,
        shopProducts,
        shopLoading,
        shopSearch,
        setShopSearch,
        shopCategory,
        setShopCategory,
        cart,
        setCart,
        checkoutForm,
        setCheckoutForm,
        checkoutError,
        setCheckoutError,
        checkoutLoading,
        setCheckoutLoading,
        orderConfirmed,
        setOrderConfirmed,
        symptomForm,
        setSymptomForm,
        interactionInput,
        setInteractionInput,
        dosageForm,
        setDosageForm,
        effectsForm,
        setEffectsForm,
        encyclopediaDrug,
        setEncyclopediaDrug,
        moduleLoading,
        setModuleLoading,
        moduleError,
        setModuleError,
        systemStatus,
        setSystemStatus,
        symptomResult,
        setSymptomResult,
        interactionResult,
        setInteractionResult,
        dosageResult,
        setDosageResult,
        effectsResult,
        setEffectsResult,
        encyclopediaResult,
        setEncyclopediaResult,
        hasSearched,
        setHasSearched,
        progress,
        filteredProducts,
        cartTotal,
        getProductImage,
        normalizeText,
        buildFinderRow,
        buildFinderRowsForText,
        preventEnterSubmit,
        refreshApp,
        searchMedicines,
        applyScannedMedicine,
        runScan,
        persistRoutineItem,
        deleteRoutineItem,
        updateRoutineStatus,
        addToRoutine,
        completeRoutineItem,
        removeRoutineItemFromList,
        addToCart,
        changeQty,
        buyFromFinder,
        findBestProductMatch,
        findCheapestByGenericFromText,
        parseCheckoutDetailsFromText,
        openCheckoutFlow,
        isRoutineDone,
        isRoutineDoneToday,
        getRoutineStatusLabel,
        parseRoutineTimeToMinutes,
        getSortedRoutineItems,
        formatRoutineLines,
        findRoutineMatch,
        getRoutineSummaryReply,
        getChatAppContext,
        submitCheckoutWithDetails,
        handleCheckout,
        processPharmaBotAction,
        sendMessage,
        sendChat,
        useQuickPrompt,
        submitSymptom,
        submitInteraction,
        submitDosage,
        submitEffects,
        submitEncyclopedia
    };

    return <PharmaIQViews ctx={ctx} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
