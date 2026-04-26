function PharmaIQRoutineView(ctx) {
    const { view, setView, mobileMenu, setMobileMenu, query, setQuery, isScanning, scanFile, scanPreviewUrl, scanMedicines, activeScannedMedicine, scanError, isLoading, results, chatOpen, setChatOpen, chatInput, setChatInput, chatSending, chatCheckoutFlow, setChatCheckoutFlow, chatMessages, setChatMessages, profile, setProfile, shopProducts, shopLoading, shopSearch, setShopSearch, shopCategory, setShopCategory, cart, setCart, checkoutForm, setCheckoutForm, checkoutError, setCheckoutError, checkoutLoading, setCheckoutLoading, orderConfirmed, setOrderConfirmed, symptomForm, setSymptomForm, interactionInput, setInteractionInput, dosageForm, setDosageForm, effectsForm, setEffectsForm, encyclopediaDrug, setEncyclopediaDrug, moduleLoading, setModuleLoading, moduleError, setModuleError, systemStatus, setSystemStatus, symptomResult, setSymptomResult, interactionResult, setInteractionResult, dosageResult, setDosageResult, effectsResult, setEffectsResult, encyclopediaResult, setEncyclopediaResult, hasSearched, setHasSearched, progress, filteredProducts, cartTotal, getProductImage, normalizeText, buildFinderRow, buildFinderRowsForText, preventEnterSubmit, refreshApp, searchMedicines, applyScannedMedicine, runScan, persistRoutineItem, deleteRoutineItem, updateRoutineStatus, addToRoutine, completeRoutineItem, removeRoutineItemFromList, addToCart, changeQty, buyFromFinder, findBestProductMatch, findCheapestByGenericFromText, parseCheckoutDetailsFromText, openCheckoutFlow, isRoutineDone, isRoutineDoneToday, getRoutineStatusLabel, parseRoutineTimeToMinutes, getSortedRoutineItems, formatRoutineLines, findRoutineMatch, getRoutineSummaryReply, getChatAppContext, submitCheckoutWithDetails, handleCheckout, processPharmaBotAction, sendMessage, sendChat, useQuickPrompt, submitSymptom, submitInteraction, submitDosage, submitEffects, submitEncyclopedia, renderMain } = ctx;
    return (
        <section className="fade-up space-y-4">
            <div className="glass rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">My Daily Pill Routine</h2>
                <p className="text-slate-600">Track your medicine intake and adherence progress.</p>
                <div className="mt-5">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Today completion</span>
                        <span className="font-bold text-teal-700">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {profile.reminders.length === 0 ? (
                <div className="glass rounded-xl p-5 text-slate-600">
                    No active medicines in your routine. Add a medicine from Finder or Shop.
                </div>
            ) : (
                profile.reminders.map((rem) => {
                    const doneToday = isRoutineDoneToday(rem);
                    return (
                    <div key={rem.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${doneToday ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                                <i className={`fa-solid ${doneToday ? "fa-check" : "fa-pills"}`}></i>
                            </div>
                            <div className="min-w-0">
                                <p className={`font-semibold truncate ${doneToday ? "line-through text-slate-400" : "text-slate-800"}`}>{rem.medicine}</p>
                                <p className="text-xs text-teal-700">{rem.time}</p>
                                <p className={`text-[11px] mt-1 ${doneToday ? "text-emerald-700" : "text-slate-500"}`}>{getRoutineStatusLabel(rem)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {doneToday ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Completed</span>
                            ) : (
                                <button onClick={() => completeRoutineItem(rem.id)} className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold">
                                    Complete
                                </button>
                            )}
                            <button onClick={() => removeRoutineItemFromList(rem.id)} className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold">
                                Delete
                            </button>
                        </div>
                    </div>
                )})
            )}
        </section>
    );
}
