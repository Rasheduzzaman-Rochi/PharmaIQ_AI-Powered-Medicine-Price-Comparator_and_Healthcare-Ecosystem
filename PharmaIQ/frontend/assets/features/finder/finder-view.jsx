function PharmaIQFinderView(ctx) {
    const { view, setView, mobileMenu, setMobileMenu, query, setQuery, isScanning, scanFile, setScanFile, scanPreviewUrl, scanMedicines, setScanMedicines, activeScannedMedicine, setActiveScannedMedicine, scanError, setScanError, isLoading, results, chatOpen, setChatOpen, chatInput, setChatInput, chatSending, chatCheckoutFlow, setChatCheckoutFlow, chatMessages, setChatMessages, profile, setProfile, shopProducts, shopLoading, shopSearch, setShopSearch, shopCategory, setShopCategory, cart, setCart, checkoutForm, setCheckoutForm, checkoutError, setCheckoutError, checkoutLoading, setCheckoutLoading, orderConfirmed, setOrderConfirmed, symptomForm, setSymptomForm, interactionInput, setInteractionInput, dosageForm, setDosageForm, effectsForm, setEffectsForm, encyclopediaDrug, setEncyclopediaDrug, moduleLoading, setModuleLoading, moduleError, setModuleError, systemStatus, setSystemStatus, symptomResult, setSymptomResult, interactionResult, setInteractionResult, dosageResult, setDosageResult, effectsResult, setEffectsResult, encyclopediaResult, setEncyclopediaResult, hasSearched, setHasSearched, progress, filteredProducts, cartTotal, getProductImage, normalizeText, buildFinderRow, buildFinderRowsForText, preventEnterSubmit, refreshApp, searchMedicines, applyScannedMedicine, runScan, persistRoutineItem, deleteRoutineItem, updateRoutineStatus, addToRoutine, completeRoutineItem, removeRoutineItemFromList, addToCart, changeQty, buyFromFinder, findBestProductMatch, findCheapestByGenericFromText, parseCheckoutDetailsFromText, openCheckoutFlow, isRoutineDone, isRoutineDoneToday, getRoutineStatusLabel, parseRoutineTimeToMinutes, getSortedRoutineItems, formatRoutineLines, findRoutineMatch, getRoutineSummaryReply, getChatAppContext, submitCheckoutWithDetails, handleCheckout, processPharmaBotAction, sendMessage, sendChat, useQuickPrompt, submitSymptom, submitInteraction, submitDosage, submitEffects, submitEncyclopedia, renderMain } = ctx;
    return (
        <section className="fade-up space-y-6">
            <div className="glass rounded-3xl p-6 md:p-8">
                <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-cyan-50 p-4 md:p-5 shadow-sm">
                    <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 leading-tight">
                        PharmaIQ: AI-Powered Medicine Price Comparator &amp; Healthcare Ecosystem
                    </h1>
                </div>

                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                    Find Better Medicine Alternatives
                </h2>
                <p className="text-slate-600 max-w-2xl">
                    Search for medications or scan your prescription to discover affordable, high-quality generic alternatives instantly.
                </p>

                <form
                    className="mt-7 bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm"
                    onSubmit={(e) => {
                        e.preventDefault();
                        searchMedicines();
                    }}
                >
                    <div className="space-y-3">
                        <div className="rounded-3xl bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 p-[2px] shadow-[0_6px_24px_rgba(13,148,136,0.16)]">
                            <div className="relative rounded-3xl bg-white/95">
                                <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-teal-600"></i>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="e.g. Napa 500mg, Seclo 20mg"
                                    className="w-full h-16 rounded-3xl border-0 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 pl-14 pr-5 text-lg font-semibold tracking-[0.01em] text-slate-800 placeholder:text-slate-500 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 px-4 py-2 text-center text-xs md:text-sm text-slate-600">
                            <span className="font-semibold text-slate-700">Step:</span> 1) Choose Image • 2) Click Scan Image • 3) Search results will appear
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200">
                                <i className="fa-regular fa-image"></i>
                                <span>{scanFile ? "Image Selected" : "Choose Image"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onClick={(e) => {
                                        e.currentTarget.value = "";
                                    }}
                                    onChange={(e) => {
                                        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                        setScanFile(file);
                                        setScanMedicines([]);
                                        setActiveScannedMedicine("");
                                        setScanError("");
                                    }}
                                />
                            </label>
                            <button
                                type="button"
                                onClick={runScan}
                                disabled={!scanFile || isScanning}
                                className={`h-12 px-5 rounded-xl border font-semibold transition-all duration-200 ${scanFile && !isScanning ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100" : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                            >
                                <i className="fa-solid fa-camera mr-2"></i>Scan Image
                            </button>
                            <button type="submit" className="h-12 px-7 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 text-white font-semibold hover:from-teal-800 hover:to-cyan-700 transition-all duration-200">
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 text-sm">
                        {scanFile && <p className="text-slate-600">Selected image: <span className="font-semibold">{scanFile.name}</span></p>}
                        {scanError && <p className="text-rose-600">{scanError}</p>}
                    </div>
                </form>

                {scanMedicines.length > 0 && (
                    <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                        <p className="text-sm font-semibold text-cyan-900 mb-1">Medicines detected from image:</p>
                        <p className="text-xs text-cyan-700 mb-2">Showing alternatives for all detected medicines below. Click any name to focus on a single medicine.</p>
                        <div className="flex flex-wrap gap-2">
                            {scanMedicines.map((med, idx) => {
                                const label = `${med.name}${med.strength ? ` (${med.strength})` : ""}`;
                                const isActive = activeScannedMedicine === med.name.toLowerCase();
                                return (
                                    <button
                                        key={`${med.name}-${idx}`}
                                        type="button"
                                        onClick={() => applyScannedMedicine(med.name)}
                                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${isActive ? "border-teal-600 bg-teal-600 text-white" : "border-cyan-300 bg-white text-cyan-800 hover:bg-cyan-100"}`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="glass rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-700 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-600">Analyzing shop medicines...</p>
                </div>
            )}

            {!isLoading && results.length > 0 && (
                <div className="space-y-6">
                    {results.map((row, idx) => {
                        const med = row.base;
                        const alternatives = row.alternatives;
                        const allergy = med.genericName && profile.allergies.includes(med.genericName);

                        return (
                            <article key={idx} className="glass rounded-2xl overflow-hidden fade-up">
                                {allergy && (
                                    <div className="bg-rose-50 border-b border-rose-200 px-5 py-4 text-rose-700 text-sm">
                                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                                        Allergy warning: {med.genericName} is in your profile.
                                    </div>
                                )}

                                <div className="p-6 md:p-7 border-b border-slate-100 flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{med.drugClass || med.category || "Medicine"}</span>
                                        <h3 className="text-2xl font-extrabold mt-2">{med.brandName || med.name}</h3>
                                        {med.genericName && <p className="text-slate-600 mt-1">Generic: {med.genericName}</p>}
                                        <p className="text-slate-500 text-sm">Company: {med.company || med.brand}</p>
                                    </div>

                                    <div className="md:text-right">
                                        <p className="text-3xl font-extrabold text-slate-900">Tk {Number(med.price || 0).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">base price</p>
                                        <div className="mt-3 flex md:justify-end gap-2">
                                            <button onClick={() => addToRoutine(med.brandName || med.name)} className="px-4 py-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-sm font-semibold">
                                                <i className="fa-regular fa-clock mr-1"></i>Add to Routine
                                            </button>
                                            <button onClick={() => buyFromFinder(med)} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold">
                                                <i className="fa-solid fa-store mr-1"></i>Buy from Shop
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 md:px-7 py-3 bg-teal-700 text-white text-sm font-semibold flex flex-wrap items-center justify-between gap-2">
                                    <span>Save up to Tk {row.bestSaving.toFixed(2)} per tablet by switching to cheaper options.</span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/20 text-xs">
                                        <i className="fa-solid fa-bullhorn mr-1"></i>Suggestion: Choose these lower-price alternatives to reduce cost
                                    </span>
                                </div>

                                <div className="p-6 md:p-7 bg-slate-50">
                                    <h4 className="font-bold text-slate-700 mb-4">Cheaper Alternatives From Medicine Shop</h4>

                                    {alternatives.length === 0 ? (
                                        <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                                            No cheaper alternative found in your current shop dataset for this medicine.
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {alternatives.map((alt) => (
                                                <article key={alt.id} className="glass rounded-xl p-3 overflow-hidden hover-lift group border border-teal-100 bg-gradient-to-b from-white via-cyan-50 to-teal-50 shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
                                                    <div className="h-36 rounded-lg bg-slate-100 mb-2 overflow-hidden relative">
                                                        {getProductImage(alt) ? (
                                                            <img src={getProductImage(alt)} alt={alt.name} className="w-full h-full object-cover hover-zoom group-hover:scale-105" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-teal-100 text-teal-700 text-2xl">
                                                                <i className="fa-solid fa-capsules"></i>
                                                            </div>
                                                        )}
                                                        <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm">
                                                            Save Tk {(Number(med.price || 0) - Number(alt.price || 0)).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <h3 className="font-extrabold text-sm leading-tight">{alt.brandName || alt.name}</h3>
                                                    {alt.genericName && <p className="text-xs text-slate-600">Generic: {alt.genericName}</p>}
                                                    <p className="text-xs text-slate-500">{alt.company || alt.brand}</p>

                                                    <div className="mt-2 flex items-center justify-between">
                                                        <p className="text-base font-extrabold text-slate-900">Tk {Number(alt.price || 0).toFixed(2)}</p>
                                                        <button onClick={() => addToCart(alt)} className="h-8 px-3 rounded-md bg-teal-700 text-white text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
                                                            <i className="fa-solid fa-cart-plus mr-1"></i>Add
                                                        </button>
                                                    </div>

                                                    <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                        <button
                                                            onClick={() => addToRoutine(alt.brandName || alt.name)}
                                                            className="h-8 rounded-md border border-teal-200 bg-teal-50 text-teal-700 text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                                        >
                                                            <i className="fa-regular fa-clock mr-1"></i>Add Routine
                                                        </button>
                                                        <button
                                                            onClick={() => buyFromFinder(alt)}
                                                            className="h-8 rounded-md bg-teal-700 text-white text-[11px] font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                                        >
                                                            <i className="fa-solid fa-store mr-1"></i>Buy from Shop
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!isLoading && hasSearched && query && results.length === 0 && !shopLoading && (
                <div className="glass rounded-2xl p-8 text-center text-slate-600">
                    <i className="fa-regular fa-face-frown text-4xl mb-3 text-slate-300"></i>
                    <p>No matching medicine found from your shop dataset.</p>
                    <p className="text-sm text-slate-500 mt-1">Try brand name, generic name, or medicine class.</p>
                </div>
            )}

            {!isLoading && hasSearched && query && results.length === 0 && shopLoading && (
                <div className="glass rounded-2xl p-8 text-center text-slate-600">
                    <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-700 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3">Shop data is still loading...</p>
                </div>
            )}
        </section>
    );
}
