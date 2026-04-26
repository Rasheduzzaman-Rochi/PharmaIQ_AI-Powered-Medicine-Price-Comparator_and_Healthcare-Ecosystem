function PharmaIQViews({ ctx }) {
    const { view, setView, mobileMenu, setMobileMenu, query, setQuery, isScanning, scanFile, scanPreviewUrl, scanMedicines, activeScannedMedicine, scanError, isLoading, results, chatOpen, setChatOpen, chatInput, setChatInput, chatSending, chatCheckoutFlow, setChatCheckoutFlow, chatMessages, setChatMessages, profile, setProfile, shopProducts, shopLoading, shopSearch, setShopSearch, shopCategory, setShopCategory, cart, setCart, checkoutForm, setCheckoutForm, checkoutError, setCheckoutError, checkoutLoading, setCheckoutLoading, orderConfirmed, setOrderConfirmed, symptomForm, setSymptomForm, interactionInput, setInteractionInput, dosageForm, setDosageForm, effectsForm, setEffectsForm, encyclopediaDrug, setEncyclopediaDrug, moduleLoading, setModuleLoading, moduleError, setModuleError, systemStatus, setSystemStatus, symptomResult, setSymptomResult, interactionResult, setInteractionResult, dosageResult, setDosageResult, effectsResult, setEffectsResult, encyclopediaResult, setEncyclopediaResult, hasSearched, setHasSearched, progress, filteredProducts, cartTotal, getProductImage, normalizeText, buildFinderRow, buildFinderRowsForText, preventEnterSubmit, refreshApp, searchMedicines, applyScannedMedicine, runScan, persistRoutineItem, deleteRoutineItem, updateRoutineStatus, addToRoutine, completeRoutineItem, removeRoutineItemFromList, addToCart, changeQty, buyFromFinder, findBestProductMatch, findCheapestByGenericFromText, parseCheckoutDetailsFromText, openCheckoutFlow, isRoutineDone, isRoutineDoneToday, getRoutineStatusLabel, parseRoutineTimeToMinutes, getSortedRoutineItems, formatRoutineLines, findRoutineMatch, getRoutineSummaryReply, getChatAppContext, submitCheckoutWithDetails, handleCheckout, processPharmaBotAction, sendMessage, sendChat, useQuickPrompt, submitSymptom, submitInteraction, submitDosage, submitEffects, submitEncyclopedia } = ctx;

    const cleanDisplayText = (value) => {
        const text = String(value ?? "").trim();
        if (!text) return "";

        let cleaned = text
            .replace(/^['"]+|['"]+$/g, "")
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .replace(/^['"]+|['"]+$/g, "")
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/__(.*?)__/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/^[-*•]\s+/gm, "")
            .replace(/^\d+[\.)]\s+/gm, "")
            .replace(/\s+/g, " ")
            .trim();

        cleaned = cleaned.replace(/^['"]+|['"]+$/g, "");
        return cleaned;
    };

    const renderMain = () => {
        if (view === "finder") return PharmaIQFinderView(ctx);
        if (view === "shop") return PharmaIQShopView(ctx);
        if (view === "routine") return PharmaIQRoutineView(ctx);

        return PharmaIQMedicalToolsView(ctx);
    };

    const featureTips = {
        finder: [
            "Match the brand, generic name, strength, and form before choosing an alternative.",
            "If the search looks empty, try the exact brand name from the packet or prescription.",
            "Cheaper is good, but the same active ingredient matters more.",
        ],
        shop: [
            "Check packaging, strength, and company before adding a medicine to cart.",
            "Use the search box to narrow by brand, generic name, or manufacturer.",
            "Compare similar products before buying the first one you see.",
        ],
        routine: [
            "Take routine medicines at the same time every day to avoid missed doses.",
            "Complete marks a medicine as taken for today. Use Delete only when you want to remove the reminder.",
            "Use Delete if you no longer need a reminder.",
        ],
        symptom: [
            "List symptoms clearly with duration and age for a better result.",
            "Go to urgent care if symptoms are severe or suddenly worsening.",
            "Use the result as guidance, not a final diagnosis.",
        ],
        interaction: [
            "Enter all medicines you take, including over-the-counter products.",
            "Double-check interactions before combining two new medicines.",
            "Ask a pharmacist if the interaction result looks serious.",
        ],
        dosage: [
            "Enter age and weight accurately for a safer dose estimate.",
            "Do not use the calculator for emergency treatment decisions.",
            "If the medicine has special instructions, follow the label or your doctor.",
        ],
        effects: [
            "Watch for common side effects after starting a new medicine.",
            "Severe rash, swelling, or breathing trouble needs immediate care.",
            "Report ongoing side effects to a clinician or pharmacist.",
        ],
        encyclopedia: [
            "Use the encyclopedia to understand what a medicine does before starting it.",
            "Check storage and contraindications if the medicine is for regular use.",
            "Cross-check with a licensed clinician when a medicine is new to you.",
        ],
        default: [
            "Keep medicines away from children and direct heat.",
            "Do not combine medicines without checking interactions first.",
            "If symptoms are severe, seek medical care first.",
        ]
    };

    const TipsPanel = () => {
        const currentTips = featureTips[view] || featureTips.default;
        const title = NAV_ITEMS.find((item) => item.id === view)?.label || "Health Tips";

        return (
            <aside className="glass rounded-2xl p-5 sticky top-24">
            <h3 className="text-lg font-bold mb-3 flex items-center">
                <i className="fa-solid fa-lightbulb text-amber-500 mr-2"></i>
                {title} Tips
            </h3>
            <ul className="space-y-3 text-sm text-slate-700">
                {currentTips.map((tip) => (
                    <li key={tip} className="flex"><i className="fa-solid fa-check text-teal-600 mt-1 mr-2"></i>{tip}</li>
                ))}
            </ul>
        </aside>
        );
    };

    return (
        <div className="min-h-screen flex">
            <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur px-5 py-6 sticky top-0 h-screen">
                <button className="flex items-center mb-8" onClick={refreshApp} type="button" title="Reload PharmaIQ">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white flex items-center justify-center mr-3 shadow-lg shadow-teal-200">
                        <i className="fa-solid fa-pills text-lg"></i>
                    </div>
                    <div className="text-left">
                        <p className="font-extrabold text-lg leading-none tracking-tight">PharmaIQ</p>
                        <p className="text-xs text-slate-500">Medicine. Advice. Shopping.</p>
                    </div>
                </button>

                <nav className="space-y-2 overflow-auto pr-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full h-11 rounded-lg text-left px-3 text-sm font-semibold transition ${view === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                        >
                            <i className={`fa-solid ${item.icon} mr-2`}></i>{item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                    For informational support only. Consult licensed doctors for final decisions.
                </div>
            </aside>

            <div className="flex-1 min-w-0">
                <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <button className="flex items-center" onClick={refreshApp} type="button" title="Reload PharmaIQ">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white flex items-center justify-center mr-2 shadow-lg shadow-teal-100">
                            <i className="fa-solid fa-pills"></i>
                        </div>
                        <div className="text-left">
                            <p className="font-extrabold leading-none">PharmaIQ</p>
                            <p className="text-[11px] text-slate-500">Medicine Platform</p>
                        </div>
                    </button>
                    <button onClick={() => setMobileMenu(true)} className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700">
                        <i className="fa-solid fa-bars"></i>
                    </button>
                </header>

                <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className={`${view === "shop" ? "xl:col-span-12" : "xl:col-span-8"} space-y-4`}>
                        {systemStatus.notice && (
                            <div className="glass rounded-xl p-3 text-sm border border-cyan-200 bg-cyan-50 text-cyan-900">
                                {systemStatus.notice}
                            </div>
                        )}
                        {moduleError && <div className="glass rounded-xl p-3 text-sm text-rose-700 bg-rose-50 border-rose-200">{moduleError}</div>}
                        {renderMain()}
                    </div>
                    <div className={`xl:col-span-4 hidden xl:block ${view === "shop" ? "xl:hidden" : ""}`}>
                        <TipsPanel />
                    </div>
                </main>
            </div>

            {mobileMenu && (
                <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMobileMenu(false)}>
                    <div className="w-80 max-w-[90vw] h-full bg-white p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-500 text-white flex items-center justify-center mr-3">
                                <i className="fa-solid fa-pills"></i>
                            </div>
                            <div>
                                <p className="font-extrabold leading-none">PharmaIQ</p>
                                <p className="text-[11px] text-slate-500">Medicine Platform</p>
                            </div>
                        </div>
                        <div className="space-y-2 overflow-auto">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setView(item.id); setMobileMenu(false); }}
                                    className={`w-full h-11 rounded-lg text-left px-3 text-sm font-semibold ${view === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}
                                >
                                    <i className={`fa-solid ${item.icon} mr-2`}></i>{item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isScanning && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center px-4">
                    <div className="relative w-72 h-96 rounded-xl border border-teal-400 overflow-hidden mb-5">
                        {scanPreviewUrl ? (
                            <img src={scanPreviewUrl} alt="Selected prescription" className="w-full h-full object-cover opacity-55" />
                        ) : (
                            <div className="w-full h-full bg-slate-800/70"></div>
                        )}
                        <div className="scan-line"></div>
                    </div>
                    <h3 className="text-white text-xl font-bold">AI OCR is scanning prescription...</h3>
                </div>
            )}

            <div className="fixed right-5 bottom-5 z-40">
                <button onClick={() => setChatOpen((v) => !v)} className="w-14 h-14 rounded-full bg-teal-700 text-white shadow-xl hover:bg-teal-800">
                    <i className={`fa-solid ${chatOpen ? "fa-xmark" : "fa-comment-medical"} text-xl`}></i>
                </button>
            </div>

            <aside className={`chat-drawer fixed right-4 bottom-4 top-4 w-[min(92vw,420px)] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.18)] z-50 ${chatOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
                <div className="h-full flex flex-col bg-gradient-to-b from-white via-cyan-50 to-slate-50">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-700 via-cyan-600 to-teal-500 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20">
                                <i className="fa-solid fa-robot text-lg"></i>
                            </div>
                            <div>
                                <h4 className="font-extrabold text-white leading-none text-[15px]">PharmaBot</h4>
                                <p className="text-[10px] text-white/80 mt-1">Gemini-powered medicine assistant</p>
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="w-8 h-8 rounded-full bg-white/15 text-white border border-white/20"><i className="fa-solid fa-xmark text-sm"></i></button>
                    </div>

                    <div className="px-4 py-2.5 border-b border-cyan-100 bg-white/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                            <span>Quick questions</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold"><i className="fa-solid fa-sparkles"></i> Smart reply</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {CHAT_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => useQuickPrompt(prompt)}
                                    className="text-left px-3 py-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-[10px] text-cyan-900 transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} fade-up`}>
                                <div className={`max-w-[84%] flex items-end gap-2 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${m.sender === "user" ? "bg-teal-700 text-white" : "bg-white border border-cyan-200 text-cyan-700"}`}>
                                        {m.sender === "user" ? "You" : "AI"}
                                    </div>
                                    <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] shadow-sm whitespace-pre-line ${m.sender === "user" ? "bg-gradient-to-r from-teal-700 to-cyan-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"}`}>
                                        {cleanDisplayText(m.text)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {chatSending && (
                            <div className="flex justify-start fade-up">
                                <div className="max-w-[84%] flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white border border-cyan-200 text-cyan-700">AI</div>
                                    <div className="px-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 text-slate-500 rounded-bl-md shadow-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: "120ms" }}></span>
                                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: "240ms" }}></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={sendChat} className="p-3 border-t border-slate-200 flex gap-2 bg-white/90 backdrop-blur-sm">
                        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about medicine, dosage, side effects..." className="flex-1 h-11 rounded-2xl border border-slate-300 px-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        <button className="w-11 h-11 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-600 text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95" type="submit" disabled={chatSending}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );
}
