function PharmaIQShopView(ctx) {
    const { view, setView, mobileMenu, setMobileMenu, query, setQuery, isScanning, scanFile, scanPreviewUrl, scanMedicines, activeScannedMedicine, scanError, isLoading, results, chatOpen, setChatOpen, chatInput, setChatInput, chatSending, chatCheckoutFlow, setChatCheckoutFlow, chatMessages, setChatMessages, profile, setProfile, shopProducts, shopLoading, shopSearch, setShopSearch, shopCategory, setShopCategory, cart, setCart, checkoutForm, setCheckoutForm, checkoutError, setCheckoutError, checkoutLoading, setCheckoutLoading, orderConfirmed, setOrderConfirmed, symptomForm, setSymptomForm, interactionInput, setInteractionInput, dosageForm, setDosageForm, effectsForm, setEffectsForm, encyclopediaDrug, setEncyclopediaDrug, moduleLoading, setModuleLoading, moduleError, setModuleError, systemStatus, setSystemStatus, symptomResult, setSymptomResult, interactionResult, setInteractionResult, dosageResult, setDosageResult, effectsResult, setEffectsResult, encyclopediaResult, setEncyclopediaResult, hasSearched, setHasSearched, progress, filteredProducts, cartTotal, getProductImage, normalizeText, buildFinderRow, buildFinderRowsForText, preventEnterSubmit, refreshApp, searchMedicines, applyScannedMedicine, runScan, persistRoutineItem, deleteRoutineItem, updateRoutineStatus, addToRoutine, completeRoutineItem, removeRoutineItemFromList, addToCart, changeQty, buyFromFinder, findBestProductMatch, findCheapestByGenericFromText, parseCheckoutDetailsFromText, openCheckoutFlow, isRoutineDone, isRoutineDoneToday, getRoutineStatusLabel, parseRoutineTimeToMinutes, getSortedRoutineItems, formatRoutineLines, findRoutineMatch, getRoutineSummaryReply, getChatAppContext, submitCheckoutWithDetails, handleCheckout, processPharmaBotAction, sendMessage, sendChat, useQuickPrompt, submitSymptom, submitInteraction, submitDosage, submitEffects, submitEncyclopedia, renderMain } = ctx;
    return (
        <section className="fade-up grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-9 space-y-4">
                <div className="glass rounded-2xl p-5">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
                        <div>
                            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 mb-2">
                                <i className="fa-solid fa-store mr-2"></i>Medicine Shop
                            </p>
                            <h2 className="text-2xl md:text-3xl font-extrabold">E-Medicine Shop</h2>
                            <p className="text-slate-600 mt-1">Browse verified medicines and wellness products, add to cart, and checkout.</p>
                        </div>
                        <div className="w-full lg:w-auto grid grid-cols-3 gap-2 md:gap-3 text-center">
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 md:px-3 py-2 min-w-[86px]">
                                <p className="text-lg font-extrabold text-slate-900">{shopProducts.length}</p>
                                <p className="text-[11px] text-slate-500">Products</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 md:px-3 py-2 min-w-[86px]">
                                <p className="text-lg font-extrabold text-slate-900">{cart.reduce((sum, item) => sum + item.qty, 0)}</p>
                                <p className="text-[11px] text-slate-500">In Cart</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 md:px-3 py-2 min-w-[86px]">
                                <p className="text-lg font-extrabold text-slate-900">Tk {cartTotal.toFixed(0)}</p>
                                <p className="text-[11px] text-slate-500">Subtotal</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-teal-600"></i>
                            <input
                                value={shopSearch}
                                onChange={(e) => setShopSearch(e.target.value)}
                                placeholder="Search medicine or brand"
                                className="w-full h-12 rounded-2xl border border-teal-200 bg-white px-11 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                </div>

                {shopLoading ? (
                    <div className="glass rounded-2xl p-8 text-center">
                        <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-700 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-3 text-slate-600">Loading products...</p>
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="glass rounded-2xl p-10 text-center">
                                <i className="fa-regular fa-face-frown text-4xl text-slate-300"></i>
                                <p className="mt-3 font-semibold text-slate-700">No products found in Firestore</p>
                                <p className="text-sm text-slate-500 mt-1">Please confirm the products collection name and document fields.</p>
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                    <i className="fa-solid fa-database text-teal-700"></i>
                                    Expected fields: brand_name, generic_name, drug_class, form, strength, company, price, packaging, offer, image_url
                                </div>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {filteredProducts.map((p) => (
                                    <article key={p.id} className="glass rounded-xl p-3 overflow-hidden hover-lift group border border-teal-100 bg-gradient-to-b from-white via-cyan-50 to-teal-50 shadow-[0_10px_30px_rgba(15,118,110,0.08)]">
                                        <div className="h-36 rounded-lg bg-gradient-to-br from-cyan-100 via-white to-teal-100 mb-2 overflow-hidden relative ring-1 ring-white/70">
                                            {getProductImage(p) ? (
                                                <img src={getProductImage(p)} alt={p.name} className="w-full h-full object-cover hover-zoom group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-teal-700 text-2xl">
                                                    <i className="fa-solid fa-capsules"></i>
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-teal-950/45 to-transparent"></div>
                                        </div>
                                        <h3 className="font-extrabold text-sm leading-tight text-slate-900">{p.brandName || p.name}</h3>
                                        {p.genericName && <p className="text-xs text-teal-700 font-semibold">Generic: {p.genericName}</p>}
                                        <p className="text-xs text-slate-500">{p.company || p.brand}</p>

                                        <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px] text-slate-600">
                                            {p.strength && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Strength: {p.strength}</span>}
                                            {p.form && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Form: {p.form}</span>}
                                            {p.drugClass && <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 col-span-2">Class: {p.drugClass}</span>}
                                        </div>

                                        {p.description && (
                                            <p className="mt-2 text-[11px] text-slate-600 line-clamp-2">{p.description}</p>
                                        )}

                                        {p.offer && (
                                            <div className="mt-2 text-[11px] font-semibold text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-2 py-1 rounded-md inline-flex items-center shadow-sm">
                                                <i className="fa-solid fa-tags mr-1"></i>{p.offer}
                                            </div>
                                        )}

                                        {p.packaging.length > 0 && (
                                            <p className="mt-1.5 text-[11px] text-slate-500">Packaging: {p.packaging.join(", ")}</p>
                                        )}

                                        <div className="mt-2.5 flex items-center justify-between">
                                            <p className="text-base font-extrabold text-teal-900">Tk {p.price.toFixed(2)}</p>
                                            <button onClick={() => addToCart(p)} className="h-8 px-3 rounded-md bg-gradient-to-r from-teal-700 to-cyan-600 text-white text-xs font-semibold shadow-sm transition-all duration-200 hover:scale-105 active:scale-95">
                                                <i className="fa-solid fa-cart-plus mr-1"></i>Add
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="xl:col-span-3">
                <div className="glass rounded-2xl p-5 sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col">
                    <h3 className="text-xl font-extrabold mb-4 flex items-center">
                        <i className="fa-solid fa-bag-shopping text-teal-700 mr-2"></i>Your Cart
                    </h3>

                    {cart.length === 0 ? (
                        <p className="text-sm text-slate-500">No items in cart yet.</p>
                    ) : (
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                            {cart.map((item) => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3">
                                    <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                                    <p className="text-xs text-slate-500 mb-2">{item.brand}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-extrabold text-slate-900">Tk {(item.price * item.qty).toFixed(2)}</p>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => changeQty(item.id, -1)} className="w-7 h-7 rounded bg-slate-200">-</button>
                                            <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                                            <button onClick={() => changeQty(item.id, 1)} className="w-7 h-7 rounded bg-slate-200">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-3 border-t border-slate-200 bg-white/90 backdrop-blur-sm sticky bottom-0">
                                <div className="flex justify-between text-sm text-slate-600 mb-1">
                                    <span>Subtotal</span><span>Tk {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600 mb-3">
                                    <span>Delivery</span><span>Tk Free</span>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-3 space-y-2">
                                    <p className="text-xs font-bold text-slate-700">Checkout Information</p>
                                    <input
                                        value={checkoutForm.name}
                                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="Full name"
                                        className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <input
                                        value={checkoutForm.mobile}
                                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, mobile: e.target.value }))}
                                        placeholder="Mobile number"
                                        className="w-full h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <textarea
                                        value={checkoutForm.address}
                                        onChange={(e) => setCheckoutForm((prev) => ({ ...prev, address: e.target.value }))}
                                        placeholder="Delivery address"
                                        rows="2"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    ></textarea>
                                    {checkoutError && <p className="text-xs text-rose-600">{checkoutError}</p>}
                                </div>

                                <div className="flex justify-between font-extrabold text-lg">
                                    <span>Total</span><span>Tk {cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="w-full mt-4 h-11 rounded-xl bg-teal-700 text-white font-semibold"
                                >
                                    <i className="fa-solid fa-credit-card mr-2"></i>{checkoutLoading ? "Saving..." : "Checkout"}
                                </button>
                            </div>
                        </div>
                    )}

                    {orderConfirmed && (
                        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center mb-2">
                                <i className="fa-solid fa-circle-check text-emerald-600 mr-2"></i>
                                <p className="font-extrabold text-emerald-700">Order Confirmed</p>
                            </div>
                            <p className="text-sm text-emerald-800">Order ID: {orderConfirmed.orderId}</p>
                            <p className="text-sm text-emerald-800">Customer: {orderConfirmed.name}</p>
                            <p className="text-sm text-emerald-800">Mobile: {orderConfirmed.mobile}</p>
                            <p className="text-sm text-emerald-800">Address: {orderConfirmed.address}</p>
                            <p className="text-sm text-emerald-800">Items: {orderConfirmed.items}</p>
                            <p className="text-sm font-bold text-emerald-900">Total Paid: Tk {orderConfirmed.total.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
