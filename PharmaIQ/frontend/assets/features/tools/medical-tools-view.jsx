function PharmaIQMedicalToolsView(ctx) {
    const {
        view,
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
        symptomResult,
        interactionResult,
        dosageResult,
        effectsResult,
        encyclopediaResult,
        preventEnterSubmit,
        submitSymptom,
        submitInteraction,
        submitDosage,
        submitEffects,
        submitEncyclopedia
    } = ctx;

    const renderToolCard = (title, icon, children) => (
        <section className="glass rounded-2xl p-6 fade-up">
            <h2 className="text-2xl font-extrabold mb-4 flex items-center">
                <i className={`fa-solid ${icon} text-teal-700 mr-3`}></i>{title}
            </h2>
            {children}
        </section>
    );

    const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

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

    const listFromAny = (value) => {
        if (Array.isArray(value)) {
            return value
                .flatMap((item) => listFromAny(item))
                .filter(Boolean);
        }

        if (value === null || value === undefined) return [];

        const raw = String(value).trim();
        if (!raw) return [];

        return raw
            .split(/\n|\s*\|\s*|\s*;\s*/)
            .map((item) => cleanDisplayText(item))
            .filter(Boolean);
    };

    const severityClass = (value) => {
        const text = String(value || "").toLowerCase();
        if (text.includes("high") || text.includes("severe")) return "bg-rose-100 text-rose-700";
        if (text.includes("moderate") || text.includes("medium")) return "bg-amber-100 text-amber-700";
        return "bg-emerald-100 text-emerald-700";
    };

    const SymptomResultView = () => {
        if (!symptomResult) return null;
        const conditions = asArray(symptomResult.possible_conditions);
        const tests = listFromAny(symptomResult.recommended_tests);
        const normalizedTips = listFromAny(symptomResult.home_care_tips);
        const urgent = Boolean(symptomResult.urgent_care_needed);

        return (
            <div className="mt-4 space-y-4">
                <div className={`rounded-xl border p-4 ${urgent ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                    <p className="font-bold">{urgent ? "Urgent medical care may be needed." : "No immediate danger detected from provided info."}</p>
                    {symptomResult.specialist_to_visit && <p className="text-sm mt-1">Suggested specialist: {cleanDisplayText(symptomResult.specialist_to_visit)}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                    {conditions.length > 0 ? conditions.map((item, idx) => (
                        <article key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="font-bold text-slate-800">{cleanDisplayText(item.name) || "Possible condition"}</p>
                            {item.probability && <p className="text-xs text-slate-500 mt-1">Probability: {cleanDisplayText(item.probability)}</p>}
                            {item.explanation && <p className="text-sm text-slate-700 mt-2">{cleanDisplayText(item.explanation)}</p>}
                            {listFromAny(item.red_flags).length > 0 && (
                                <p className="text-xs text-rose-700 mt-2">Red flags: {listFromAny(item.red_flags).join(", ")}</p>
                            )}
                        </article>
                    )) : <p className="text-sm text-slate-600">No conditions returned.</p>}
                </div>

                {tests.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><p className="font-bold mb-1">Recommended tests</p><p>{tests.join(", ")}</p></div>}
                {normalizedTips.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                        <p className="font-bold mb-2">Home care tips</p>
                        <ul className="space-y-2">
                            {normalizedTips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-700">
                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600"></span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {symptomResult.disclaimer && <p className="text-xs text-slate-500">{cleanDisplayText(symptomResult.disclaimer)}</p>}
            </div>
        );
    };

    const InteractionResultView = () => {
        if (!interactionResult) return null;
        const interactions = asArray(interactionResult.interactions);

        return (
            <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityClass(interactionResult.severity)}`}>{cleanDisplayText(interactionResult.severity) || "Unknown"}</span>
                    {interactionResult.overall_risk && <span className="text-sm text-slate-700">Overall risk: {cleanDisplayText(interactionResult.overall_risk)}</span>}
                    {interactionResult.doctor_consult_required !== undefined && <span className="text-sm text-slate-700">Doctor consult: {interactionResult.doctor_consult_required ? "Recommended" : "Not required now"}</span>}
                </div>

                <div className="space-y-3">
                    {interactions.length > 0 ? interactions.map((item, idx) => (
                        <article key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-slate-800">{cleanDisplayText(item.pair) || "Medicine pair"}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${severityClass(item.severity)}`}>{cleanDisplayText(item.severity) || "Unknown"}</span>
                            </div>
                            {item.effect && <p className="text-sm text-slate-700 mt-2">Effect: {cleanDisplayText(item.effect)}</p>}
                            {item.mechanism && <p className="text-sm text-slate-600 mt-1">Mechanism: {cleanDisplayText(item.mechanism)}</p>}
                            {item.recommendation && <p className="text-sm text-teal-700 mt-1">Recommendation: {cleanDisplayText(item.recommendation)}</p>}
                        </article>
                    )) : <p className="text-sm text-slate-600">No major interaction detected from provided medicines.</p>}
                </div>

                {interactionResult.summary && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{cleanDisplayText(interactionResult.summary)}</div>}
            </div>
        );
    };

    const DosageResultView = () => {
        if (!dosageResult) return null;
        const warnings = asArray(dosageResult.warnings);

        return (
            <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                    <p className="text-xs font-bold text-teal-700 uppercase">Recommended dosage</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{cleanDisplayText(dosageResult.recommended_dosage) || "Not available"}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">Frequency:</span> {cleanDisplayText(dosageResult.frequency) || "N/A"}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">Duration:</span> {cleanDisplayText(dosageResult.duration) || "N/A"}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">Max daily dose:</span> {cleanDisplayText(dosageResult.max_daily_dose) || "N/A"}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">With food:</span> {dosageResult.with_food ? "Yes" : "No / not specified"}</div>
                </div>

                {dosageResult.timing && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">Timing:</span> {cleanDisplayText(dosageResult.timing)}</div>}
                {dosageResult.special_notes && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">Special notes:</span> {cleanDisplayText(dosageResult.special_notes)}</div>}
                {dosageResult.missed_dose_action && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">Missed dose:</span> {cleanDisplayText(dosageResult.missed_dose_action)}</div>}
                {warnings.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm">
                        <p className="font-bold text-rose-700 mb-2">Warnings</p>
                        <ul className="space-y-1 text-rose-700">
                            {listFromAny(warnings).map((warning, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-rose-600"></span>
                                    <span>{warning}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const SideEffectsResultView = () => {
        if (!effectsResult) return null;
        const common = asArray(effectsResult.common_side_effects);
        const serious = listFromAny(effectsResult.rare_serious_side_effects);
        const risks = listFromAny(effectsResult.condition_specific_risks);
        const stopNow = listFromAny(effectsResult.when_to_stop_immediately);
        const monitor = listFromAny(effectsResult.things_to_monitor);

        return (
            <div className="mt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="font-bold mb-2">Common side effects</p>
                        {common.length > 0 ? (
                            <div className="space-y-2 text-sm">
                                {common.map((item, idx) => (
                                    <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                                        <p className="font-semibold">{cleanDisplayText(item.effect) || "Effect"}</p>
                                        <p className="text-slate-600">Frequency: {cleanDisplayText(item.frequency) || "N/A"} | Severity: {cleanDisplayText(item.severity) || "N/A"}</p>
                                        {item.management && <p className="text-teal-700">Management: {cleanDisplayText(item.management)}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-600">No common side effects listed.</p>}
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                        <p className="font-bold text-rose-700 mb-2">Serious warning signs</p>
                        {serious.length > 0 ? (
                            <ul className="space-y-1 text-sm text-rose-700">
                                {serious.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-rose-600"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-rose-700">No severe signs listed.</p>}
                        {stopNow.length > 0 && (
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-rose-700">Stop medicine and seek care if:</p>
                                <ul className="space-y-1 text-sm text-rose-700 mt-1">
                                    {stopNow.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-rose-600"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {risks.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                        <p className="font-bold mb-2">Condition-specific risks</p>
                        <ul className="space-y-1 text-slate-700">
                            {risks.map((risk, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-500"></span>
                                    <span>{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {monitor.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                        <p className="font-bold mb-2">Things to monitor</p>
                        <ul className="space-y-1 text-slate-700">
                            {monitor.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-teal-600"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const EncyclopediaResultView = () => {
        if (!encyclopediaResult) return null;
        const indications = asArray(encyclopediaResult.indications);
        const contraindications = asArray(encyclopediaResult.contraindications);
        const manufacturers = asArray(encyclopediaResult.common_manufacturers);

        return (
            <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-xl font-extrabold text-slate-900">{cleanDisplayText(encyclopediaResult.name) || "Medicine profile"}</h3>
                    <p className="text-sm text-slate-600 mt-1">Generic: {cleanDisplayText(encyclopediaResult.generic_name) || "Unknown"}</p>
                    <p className="text-sm text-slate-600">Class: {cleanDisplayText(encyclopediaResult.drug_class) || "Unknown"}</p>
                </div>

                {encyclopediaResult.mechanism_of_action && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">How it works:</span> {cleanDisplayText(encyclopediaResult.mechanism_of_action)}</div>}
                {indications.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">Used for:</span> {listFromAny(indications).join(", ")}</div>}
                {contraindications.length > 0 && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm"><span className="font-bold text-rose-700">Avoid if:</span> {listFromAny(contraindications).join(", ")}</div>}

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">Standard dosage:</span> {cleanDisplayText(encyclopediaResult.standard_dosage) || "N/A"}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3"><span className="font-bold">Pregnancy category:</span> {cleanDisplayText(encyclopediaResult.pregnancy_category) || "N/A"}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2"><span className="font-bold">Storage:</span> {cleanDisplayText(encyclopediaResult.storage) || "N/A"}</div>
                </div>

                {manufacturers.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm"><span className="font-bold">Common manufacturers:</span> {listFromAny(manufacturers).join(", ")}</div>}
                {encyclopediaResult.interesting_fact && <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm"><span className="font-bold text-cyan-800">Quick fact:</span> {cleanDisplayText(encyclopediaResult.interesting_fact)}</div>}
            </div>
        );
    };

    if (view === "symptom") {
        return renderToolCard("Symptom Analyzer", "fa-stethoscope", (
            <>
                <form onSubmit={submitSymptom} onKeyDown={preventEnterSubmit} className="space-y-3">
                    <textarea value={symptomForm.symptoms} onChange={(e) => setSymptomForm({ ...symptomForm, symptoms: e.target.value })} placeholder="Describe symptoms" className="w-full rounded-xl border border-slate-300 p-3" rows="4" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={symptomForm.age} onChange={(e) => setSymptomForm({ ...symptomForm, age: e.target.value })} type="number" placeholder="Age" className="rounded-xl border border-slate-300 p-3" />
                        <input value={symptomForm.duration} onChange={(e) => setSymptomForm({ ...symptomForm, duration: e.target.value })} placeholder="Duration (e.g., 2 days)" className="rounded-xl border border-slate-300 p-3" />
                    </div>
                    <button className="h-11 px-6 rounded-xl bg-teal-700 text-white font-semibold" type="submit">{moduleLoading === "symptom" ? "Analyzing..." : "Analyze Symptoms"}</button>
                </form>
                <SymptomResultView />
            </>
        ));
    }

    if (view === "interaction") {
        return renderToolCard("Drug Interaction Checker", "fa-shield-virus", (
            <>
                <form onSubmit={submitInteraction} onKeyDown={preventEnterSubmit} className="space-y-3">
                    <textarea value={interactionInput} onChange={(e) => setInteractionInput(e.target.value)} placeholder="Medicines separated by comma" className="w-full rounded-xl border border-slate-300 p-3" rows="4" required />
                    <button className="h-11 px-6 rounded-xl bg-teal-700 text-white font-semibold" type="submit">{moduleLoading === "interaction" ? "Checking..." : "Check Interactions"}</button>
                </form>
                <InteractionResultView />
            </>
        ));
    }

    if (view === "dosage") {
        return renderToolCard("Dosage Calculator", "fa-calculator", (
            <>
                <form onSubmit={submitDosage} onKeyDown={preventEnterSubmit} className="space-y-3">
                    <input value={dosageForm.medicine_name} onChange={(e) => setDosageForm({ ...dosageForm, medicine_name: e.target.value })} placeholder="Medicine name" className="w-full rounded-xl border border-slate-300 p-3" required />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={dosageForm.age} onChange={(e) => setDosageForm({ ...dosageForm, age: e.target.value })} type="number" placeholder="Age" className="rounded-xl border border-slate-300 p-3" required />
                        <input value={dosageForm.weight} onChange={(e) => setDosageForm({ ...dosageForm, weight: e.target.value })} type="number" step="0.1" placeholder="Weight (kg)" className="rounded-xl border border-slate-300 p-3" required />
                        <input value={dosageForm.condition} onChange={(e) => setDosageForm({ ...dosageForm, condition: e.target.value })} placeholder="Condition" className="rounded-xl border border-slate-300 p-3" />
                    </div>
                    <button className="h-11 px-6 rounded-xl bg-teal-700 text-white font-semibold" type="submit">{moduleLoading === "dosage" ? "Calculating..." : "Calculate Dosage"}</button>
                </form>
                <DosageResultView />
            </>
        ));
    }

    if (view === "effects") {
        return renderToolCard("Side Effects Predictor", "fa-triangle-exclamation", (
            <>
                <form onSubmit={submitEffects} onKeyDown={preventEnterSubmit} className="space-y-3">
                    <input value={effectsForm.medicine_name} onChange={(e) => setEffectsForm({ ...effectsForm, medicine_name: e.target.value })} placeholder="Medicine name" className="w-full rounded-xl border border-slate-300 p-3" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={effectsForm.patient_age} onChange={(e) => setEffectsForm({ ...effectsForm, patient_age: e.target.value })} type="number" placeholder="Patient age" className="rounded-xl border border-slate-300 p-3" />
                        <input value={effectsForm.existing_conditions} onChange={(e) => setEffectsForm({ ...effectsForm, existing_conditions: e.target.value })} placeholder="Existing conditions" className="rounded-xl border border-slate-300 p-3" />
                    </div>
                    <button className="h-11 px-6 rounded-xl bg-teal-700 text-white font-semibold" type="submit">{moduleLoading === "effects" ? "Predicting..." : "Predict Side Effects"}</button>
                </form>
                <SideEffectsResultView />
            </>
        ));
    }

    return renderToolCard("Drug Encyclopedia", "fa-book-medical", (
        <>
            <form onSubmit={submitEncyclopedia} onKeyDown={preventEnterSubmit} className="space-y-3">
                <input value={encyclopediaDrug} onChange={(e) => setEncyclopediaDrug(e.target.value)} placeholder="Search medicine info" className="w-full rounded-xl border border-slate-300 p-3" required />
                <button className="h-11 px-6 rounded-xl bg-teal-700 text-white font-semibold" type="submit">{moduleLoading === "encyclopedia" ? "Loading..." : "Get Drug Info"}</button>
            </form>
            <EncyclopediaResultView />
        </>
    ));
}
