/*
 * WhichAI (formerly WhichAI) - UI translations (v0.21.0) - 11 languages
 * Interface chrome in 8 languages. Content (generated prompts, benchmark notes,
 * catalog, chain step instructions) intentionally stays in English: prompt
 * quality and benchmark data are tuned for English. The langNote string
 * explains this to the user whenever a non-English language is active.
 */
(function () {
  "use strict";

  var LANGS = [
    { code: "en", label: "English" },
    { code: "it", label: "Italiano" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "pt", label: "Português" },
    { code: "zh", label: "中文" },
    { code: "hi", label: "हिन्दी" },
    { code: "ru", label: "Русский" },
    { code: "ja", label: "日本語" },
    { code: "ar", label: "العربية" }
  ];

  var S = {};

  S.en = {
    navGenerator: "Generator", navGuide: "Model guide", navCompare: "Compare", navChains: "Chains", navSettings: "Settings",
    privacyPill: "Private by design",
    privacyTip: "Runs entirely in your browser. No account, no server, no tracking. API keys stay on your device.",
    trustLine: "No account · No server · Nothing leaves your browser",
    langNote: "",
    genTitle: "Describe your goal",
    genSubtitle: "WhichAI turns it into a prompt tailored to each AI model - and tells you which model is the best fit for the job, in plain language.",
    goalLabel: "Goal ", optionalTag: "(optional)", tryExample: "Try an example",
    goalPh: "e.g., Write a landing page headline and subheadline for a budgeting app aimed at freelancers",
    goalErr: "Describe your goal to generate prompts.",
    contextLabel: "Context ", contextPh: "Background, audience, constraints, examples - anything the AI should know",
    taskLabel: "Task type", formatLabel: "Output format", lengthLabel: "Length", toneLabel: "Tone",
    targetsLabel: "Target models", groupAssistants: "AI assistants", groupEco: "Ecosystem assistants", groupOpen: "Open models ",
    modelsErr: "Select at least one target model.", generateBtn: "Generate prompts",
    emptyLead: "Your optimized prompts will appear here - one version per model, plus a recommendation of which model fits this task best.",
    step1: "Describe your goal", step2: "Copy the prompt tailored to each AI", step3: "Compare the answers and iterate",
    resultsTitle: "Optimized prompts", toCompareBtn: "Compare outputs →",
    optNone: "No preference", optProse: "Plain prose", optMarkdown: "Markdown", optBullets: "Bullet points", optTable: "Table", optJson: "JSON", optCode: "Code",
    optShort: "Short", optMedium: "Medium", optLong: "Long & detailed",
    optProfessional: "Professional", optFriendly: "Friendly", optCasual: "Casual", optPersuasive: "Persuasive", optAcademic: "Academic",
    autoDetect: "Auto-detect", detected: "Detected:",
    task_writing: "Writing & content", task_coding: "Coding & development", task_analysis: "Analysis & data", task_research: "Research & summarization",
    task_brainstorming: "Brainstorming & ideas", task_education: "Education & explanation", task_business: "Business & marketing", task_general: "General / other",
    routerTitle: "Which model for this task?", bestPick: "Best pick:", benchLabel: "Benchmarks:",
    fullRanking: "Full ranking, free tiers and sources", freeTier: "Free tier:", sourcesLabel: "Sources:",
    whyPrefix: "Why this prompt is built this way for", copy: "Copy", copied: "Copied", copyPrompt: "Copy prompt",
    guideTitle: "Model guide", guideSub: "Which AI app fits each kind of task - public benchmarks translated into plain language.",
    catalogTitle: "Model catalog",
    compareTitle: "Compare outputs",
    compareSub: "Run the same optimized prompt in each AI app, paste (or auto-run) the answers, and score them side by side. Everything stays in your browser.",
    compareEmptyText: "No active comparison. Generate prompts first, then click \"Compare outputs\" to bring them here. ",
    goGenerator: "Go to the Generator",
    saveCmp: "Save comparison", newVersion: "New version", exportMd: "Export .md", savedCmps: "Saved comparisons",
    notScored: "Not scored", winner: "Winner", tied: "Tied", tie: "Tie", winnerPrefix: "Winner:", openBtn: "Open", deleteBtn: "Delete",
    chainsTitle: "Chains",
    chainsSub: "Break a complex goal into linked steps: each step gets its own optimized prompt, and the output of one step feeds the next. Auto-run steps where you have a free key; copy & paste elsewhere.",
    buildChain: "Build chain", saveChain: "Save chain", savedChains: "Saved chains",
    promptForStep: "Prompt for this step", stepOutput: "Step output",
    settingsTitle: "Settings",
    settingsSub: "API keys enable automatic execution in Compare. Keys are stored only in this browser and are sent only to the provider you call - never to any WhichAI server (there is none).",
    saveSettings: "Save settings", prefsReset: "Reset remembered preferences",
    footerText: "Runs entirely in your browser: no account, no server, your keys and data never leave your device."
  };

  S.it = {
    navGenerator: "Generatore", navGuide: "Guida modelli", navCompare: "Confronta", navChains: "Catene", navSettings: "Impostazioni",
    privacyPill: "Privacy by design",
    privacyTip: "Funziona interamente nel tuo browser. Nessun account, nessun server, nessun tracciamento. Le chiavi API restano sul tuo dispositivo.",
    trustLine: "Nessun account · Nessun server · Nulla esce dal tuo browser",
    langNote: "Interfaccia in italiano. Nota: i prompt generati, le note sui benchmark e il rilevamento automatico del tipo di task sono ottimizzati per l'inglese (tutti i modelli AI rendono al meglio con istruzioni in inglese). Puoi comunque scrivere il tuo obiettivo in qualsiasi lingua: l'AI risponderà nella tua lingua.",
    genTitle: "Descrivi il tuo obiettivo",
    genSubtitle: "WhichAI lo trasforma in un prompt su misura per ogni modello AI - e ti dice quale modello è il più adatto, in parole semplici.",
    goalLabel: "Obiettivo ", optionalTag: "(facoltativo)", tryExample: "Prova un esempio",
    goalPh: "es. Scrivi titolo e sottotitolo per la landing page di un'app di budgeting per freelance",
    goalErr: "Descrivi il tuo obiettivo per generare i prompt.",
    contextLabel: "Contesto ", contextPh: "Sfondo, pubblico, vincoli, esempi - tutto ciò che l'AI dovrebbe sapere",
    taskLabel: "Tipo di task", formatLabel: "Formato output", lengthLabel: "Lunghezza", toneLabel: "Tono",
    targetsLabel: "Modelli di destinazione", groupAssistants: "Assistenti AI", groupEco: "Assistenti di ecosistema", groupOpen: "Modelli open ",
    modelsErr: "Seleziona almeno un modello.", generateBtn: "Genera i prompt",
    emptyLead: "I tuoi prompt ottimizzati appariranno qui - una versione per modello, più il consiglio su quale modello è il migliore per questo task.",
    step1: "Descrivi il tuo obiettivo", step2: "Copia il prompt su misura per ogni AI", step3: "Confronta le risposte e itera",
    resultsTitle: "Prompt ottimizzati", toCompareBtn: "Confronta gli output →",
    optNone: "Nessuna preferenza", optProse: "Prosa semplice", optMarkdown: "Markdown", optBullets: "Elenco puntato", optTable: "Tabella", optJson: "JSON", optCode: "Codice",
    optShort: "Breve", optMedium: "Media", optLong: "Lunga e dettagliata",
    optProfessional: "Professionale", optFriendly: "Amichevole", optCasual: "Informale", optPersuasive: "Persuasivo", optAcademic: "Accademico",
    autoDetect: "Rilevamento automatico", detected: "Rilevato:",
    task_writing: "Scrittura e contenuti", task_coding: "Codice e sviluppo", task_analysis: "Analisi e dati", task_research: "Ricerca e sintesi",
    task_brainstorming: "Brainstorming e idee", task_education: "Formazione e spiegazioni", task_business: "Business e marketing", task_general: "Generale / altro",
    routerTitle: "Quale modello per questo task?", bestPick: "Scelta migliore:", benchLabel: "Benchmark:",
    fullRanking: "Classifica completa, piani gratuiti e fonti", freeTier: "Piano gratuito:", sourcesLabel: "Fonti:",
    whyPrefix: "Perché questo prompt è costruito così per", copy: "Copia", copied: "Copiato", copyPrompt: "Copia prompt",
    guideTitle: "Guida ai modelli", guideSub: "Quale app AI è adatta a ogni tipo di task - benchmark pubblici tradotti in parole semplici.",
    catalogTitle: "Catalogo modelli",
    compareTitle: "Confronta gli output",
    compareSub: "Esegui lo stesso prompt ottimizzato in ogni app AI, incolla (o esegui in automatico) le risposte e valutale fianco a fianco. Tutto resta nel tuo browser.",
    compareEmptyText: "Nessun confronto attivo. Genera prima i prompt, poi clicca \"Confronta gli output\". ",
    goGenerator: "Vai al Generatore",
    saveCmp: "Salva confronto", newVersion: "Nuova versione", exportMd: "Esporta .md", savedCmps: "Confronti salvati",
    notScored: "Non valutato", winner: "Vincitore", tied: "Pareggio", tie: "Pareggio", winnerPrefix: "Vincitore:", openBtn: "Apri", deleteBtn: "Elimina",
    chainsTitle: "Catene",
    chainsSub: "Spezza un obiettivo complesso in passi collegati: ogni passo ha il suo prompt ottimizzato e l'output di un passo alimenta il successivo. Esecuzione automatica dove hai una chiave gratuita; copia e incolla altrove.",
    buildChain: "Costruisci catena", saveChain: "Salva catena", savedChains: "Catene salvate",
    promptForStep: "Prompt per questo passo", stepOutput: "Output del passo",
    settingsTitle: "Impostazioni",
    settingsSub: "Le chiavi API abilitano l'esecuzione automatica nel Confronto. Restano solo in questo browser e vengono inviate solo al provider che chiami - mai a un server WhichAI (che non esiste).",
    saveSettings: "Salva impostazioni", prefsReset: "Ripristina preferenze predefinite",
    footerText: "Funziona interamente nel tuo browser: nessun account, nessun server, chiavi e dati non lasciano mai il tuo dispositivo."
  };

  S.fr = {
    navGenerator: "Générateur", navGuide: "Guide des modèles", navCompare: "Comparer", navChains: "Chaînes", navSettings: "Paramètres",
    privacyPill: "Privé par conception",
    privacyTip: "Fonctionne entièrement dans votre navigateur. Pas de compte, pas de serveur, pas de suivi. Les clés API restent sur votre appareil.",
    trustLine: "Pas de compte · Pas de serveur · Rien ne quitte votre navigateur",
    langNote: "Interface en français. Remarque : les prompts générés, les notes de benchmark et la détection automatique du type de tâche sont optimisés pour l'anglais (tous les modèles d'IA fonctionnent mieux avec des instructions en anglais). Vous pouvez écrire votre objectif dans n'importe quelle langue : l'IA répondra dans votre langue.",
    genTitle: "Décrivez votre objectif",
    genSubtitle: "WhichAI le transforme en un prompt adapté à chaque modèle d'IA - et vous dit quel modèle convient le mieux, en langage simple.",
    goalLabel: "Objectif ", optionalTag: "(facultatif)", tryExample: "Essayer un exemple",
    goalPh: "ex. Rédigez le titre d'une landing page pour une app de budget destinée aux freelances",
    goalErr: "Décrivez votre objectif pour générer les prompts.",
    contextLabel: "Contexte ", contextPh: "Contexte, public, contraintes, exemples - tout ce que l'IA devrait savoir",
    taskLabel: "Type de tâche", formatLabel: "Format de sortie", lengthLabel: "Longueur", toneLabel: "Ton",
    targetsLabel: "Modèles cibles", groupAssistants: "Assistants IA", groupEco: "Assistants d'écosystème", groupOpen: "Modèles ouverts ",
    modelsErr: "Sélectionnez au moins un modèle.", generateBtn: "Générer les prompts",
    emptyLead: "Vos prompts optimisés apparaîtront ici - une version par modèle, plus une recommandation du modèle le mieux adapté.",
    step1: "Décrivez votre objectif", step2: "Copiez le prompt adapté à chaque IA", step3: "Comparez les réponses et itérez",
    resultsTitle: "Prompts optimisés", toCompareBtn: "Comparer les réponses →",
    optNone: "Sans préférence", optProse: "Prose simple", optMarkdown: "Markdown", optBullets: "Liste à puces", optTable: "Tableau", optJson: "JSON", optCode: "Code",
    optShort: "Court", optMedium: "Moyen", optLong: "Long et détaillé",
    optProfessional: "Professionnel", optFriendly: "Chaleureux", optCasual: "Décontracté", optPersuasive: "Persuasif", optAcademic: "Académique",
    autoDetect: "Détection automatique", detected: "Détecté :",
    task_writing: "Rédaction et contenu", task_coding: "Code et développement", task_analysis: "Analyse et données", task_research: "Recherche et synthèse",
    task_brainstorming: "Brainstorming et idées", task_education: "Éducation et explication", task_business: "Business et marketing", task_general: "Général / autre",
    routerTitle: "Quel modèle pour cette tâche ?", bestPick: "Meilleur choix :", benchLabel: "Benchmarks :",
    fullRanking: "Classement complet, offres gratuites et sources", freeTier: "Offre gratuite :", sourcesLabel: "Sources :",
    whyPrefix: "Pourquoi ce prompt est construit ainsi pour", copy: "Copier", copied: "Copié", copyPrompt: "Copier le prompt",
    guideTitle: "Guide des modèles", guideSub: "Quelle app d'IA convient à chaque type de tâche - benchmarks publics traduits en langage simple.",
    catalogTitle: "Catalogue des modèles",
    compareTitle: "Comparer les réponses",
    compareSub: "Exécutez le même prompt optimisé dans chaque app d'IA, collez (ou exécutez automatiquement) les réponses et notez-les côte à côte. Tout reste dans votre navigateur.",
    compareEmptyText: "Aucune comparaison active. Générez d'abord les prompts, puis cliquez sur « Comparer les réponses ». ",
    goGenerator: "Aller au Générateur",
    saveCmp: "Enregistrer", newVersion: "Nouvelle version", exportMd: "Exporter .md", savedCmps: "Comparaisons enregistrées",
    notScored: "Non noté", winner: "Gagnant", tied: "Égalité", tie: "Égalité", winnerPrefix: "Gagnant :", openBtn: "Ouvrir", deleteBtn: "Supprimer",
    chainsTitle: "Chaînes",
    chainsSub: "Découpez un objectif complexe en étapes liées : chaque étape a son prompt optimisé, et la sortie d'une étape alimente la suivante. Exécution automatique avec une clé gratuite ; copier-coller sinon.",
    buildChain: "Construire la chaîne", saveChain: "Enregistrer la chaîne", savedChains: "Chaînes enregistrées",
    promptForStep: "Prompt de cette étape", stepOutput: "Sortie de l'étape",
    settingsTitle: "Paramètres",
    settingsSub: "Les clés API activent l'exécution automatique. Elles restent uniquement dans ce navigateur et ne sont envoyées qu'au fournisseur appelé - jamais à un serveur WhichAI (il n'y en a pas).",
    saveSettings: "Enregistrer", prefsReset: "Réinitialiser les préférences",
    footerText: "Fonctionne entièrement dans votre navigateur : pas de compte, pas de serveur, vos clés et données ne quittent jamais votre appareil."
  };

  S.es = {
    navGenerator: "Generador", navGuide: "Guía de modelos", navCompare: "Comparar", navChains: "Cadenas", navSettings: "Ajustes",
    privacyPill: "Privado por diseño",
    privacyTip: "Funciona por completo en tu navegador. Sin cuenta, sin servidor, sin rastreo. Las claves API se quedan en tu dispositivo.",
    trustLine: "Sin cuenta · Sin servidor · Nada sale de tu navegador",
    langNote: "Interfaz en español. Nota: los prompts generados, las notas de benchmarks y la detección automática del tipo de tarea están optimizados para el inglés (todos los modelos de IA rinden mejor con instrucciones en inglés). Puedes escribir tu objetivo en cualquier idioma: la IA responderá en tu idioma.",
    genTitle: "Describe tu objetivo",
    genSubtitle: "WhichAI lo convierte en un prompt a medida para cada modelo de IA - y te dice qué modelo encaja mejor, en lenguaje sencillo.",
    goalLabel: "Objetivo ", optionalTag: "(opcional)", tryExample: "Probar un ejemplo",
    goalPh: "p. ej., Escribe el titular de una landing page para una app de presupuestos para freelancers",
    goalErr: "Describe tu objetivo para generar los prompts.",
    contextLabel: "Contexto ", contextPh: "Antecedentes, público, restricciones, ejemplos - todo lo que la IA deba saber",
    taskLabel: "Tipo de tarea", formatLabel: "Formato de salida", lengthLabel: "Longitud", toneLabel: "Tono",
    targetsLabel: "Modelos de destino", groupAssistants: "Asistentes de IA", groupEco: "Asistentes de ecosistema", groupOpen: "Modelos abiertos ",
    modelsErr: "Selecciona al menos un modelo.", generateBtn: "Generar prompts",
    emptyLead: "Tus prompts optimizados aparecerán aquí - una versión por modelo, más una recomendación del modelo que mejor encaja.",
    step1: "Describe tu objetivo", step2: "Copia el prompt a medida de cada IA", step3: "Compara las respuestas e itera",
    resultsTitle: "Prompts optimizados", toCompareBtn: "Comparar respuestas →",
    optNone: "Sin preferencia", optProse: "Prosa simple", optMarkdown: "Markdown", optBullets: "Viñetas", optTable: "Tabla", optJson: "JSON", optCode: "Código",
    optShort: "Corta", optMedium: "Media", optLong: "Larga y detallada",
    optProfessional: "Profesional", optFriendly: "Cercano", optCasual: "Informal", optPersuasive: "Persuasivo", optAcademic: "Académico",
    autoDetect: "Detección automática", detected: "Detectado:",
    task_writing: "Escritura y contenido", task_coding: "Código y desarrollo", task_analysis: "Análisis y datos", task_research: "Investigación y síntesis",
    task_brainstorming: "Lluvia de ideas", task_education: "Educación y explicación", task_business: "Negocios y marketing", task_general: "General / otro",
    routerTitle: "¿Qué modelo para esta tarea?", bestPick: "Mejor opción:", benchLabel: "Benchmarks:",
    fullRanking: "Clasificación completa, planes gratuitos y fuentes", freeTier: "Plan gratuito:", sourcesLabel: "Fuentes:",
    whyPrefix: "Por qué este prompt está construido así para", copy: "Copiar", copied: "Copiado", copyPrompt: "Copiar prompt",
    guideTitle: "Guía de modelos", guideSub: "Qué app de IA encaja con cada tipo de tarea - benchmarks públicos traducidos a lenguaje sencillo.",
    catalogTitle: "Catálogo de modelos",
    compareTitle: "Comparar respuestas",
    compareSub: "Ejecuta el mismo prompt optimizado en cada app de IA, pega (o ejecuta automáticamente) las respuestas y puntúalas lado a lado. Todo se queda en tu navegador.",
    compareEmptyText: "No hay comparación activa. Genera primero los prompts y pulsa \"Comparar respuestas\". ",
    goGenerator: "Ir al Generador",
    saveCmp: "Guardar comparación", newVersion: "Nueva versión", exportMd: "Exportar .md", savedCmps: "Comparaciones guardadas",
    notScored: "Sin puntuar", winner: "Ganador", tied: "Empate", tie: "Empate", winnerPrefix: "Ganador:", openBtn: "Abrir", deleteBtn: "Eliminar",
    chainsTitle: "Cadenas",
    chainsSub: "Divide un objetivo complejo en pasos enlazados: cada paso tiene su prompt optimizado y la salida de un paso alimenta el siguiente. Ejecución automática donde tengas una clave gratuita; copiar y pegar en el resto.",
    buildChain: "Construir cadena", saveChain: "Guardar cadena", savedChains: "Cadenas guardadas",
    promptForStep: "Prompt de este paso", stepOutput: "Salida del paso",
    settingsTitle: "Ajustes",
    settingsSub: "Las claves API activan la ejecución automática. Se guardan solo en este navegador y se envían solo al proveedor que llamas - nunca a un servidor de WhichAI (no existe).",
    saveSettings: "Guardar ajustes", prefsReset: "Restablecer preferencias",
    footerText: "Funciona por completo en tu navegador: sin cuenta, sin servidor, tus claves y datos nunca salen de tu dispositivo."
  };

  S.de = {
    navGenerator: "Generator", navGuide: "Modell-Guide", navCompare: "Vergleichen", navChains: "Ketten", navSettings: "Einstellungen",
    privacyPill: "Privat by Design",
    privacyTip: "Läuft vollständig in deinem Browser. Kein Konto, kein Server, kein Tracking. API-Schlüssel bleiben auf deinem Gerät.",
    trustLine: "Kein Konto · Kein Server · Nichts verlässt deinen Browser",
    langNote: "Oberfläche auf Deutsch. Hinweis: Generierte Prompts, Benchmark-Notizen und die automatische Aufgabenerkennung sind für Englisch optimiert (alle KI-Modelle arbeiten mit englischen Anweisungen am besten). Dein Ziel kannst du in jeder Sprache schreiben - die KI antwortet in deiner Sprache.",
    genTitle: "Beschreibe dein Ziel",
    genSubtitle: "WhichAI macht daraus einen auf jedes KI-Modell zugeschnittenen Prompt - und sagt dir in einfachen Worten, welches Modell am besten passt.",
    goalLabel: "Ziel ", optionalTag: "(optional)", tryExample: "Beispiel laden",
    goalPh: "z. B. Schreibe die Headline einer Landingpage für eine Budget-App für Freelancer",
    goalErr: "Beschreibe dein Ziel, um Prompts zu generieren.",
    contextLabel: "Kontext ", contextPh: "Hintergrund, Zielgruppe, Einschränkungen, Beispiele - alles, was die KI wissen sollte",
    taskLabel: "Aufgabentyp", formatLabel: "Ausgabeformat", lengthLabel: "Länge", toneLabel: "Ton",
    targetsLabel: "Zielmodelle", groupAssistants: "KI-Assistenten", groupEco: "Ökosystem-Assistenten", groupOpen: "Offene Modelle ",
    modelsErr: "Wähle mindestens ein Modell.", generateBtn: "Prompts generieren",
    emptyLead: "Deine optimierten Prompts erscheinen hier - eine Version pro Modell, plus eine Empfehlung, welches Modell am besten passt.",
    step1: "Beschreibe dein Ziel", step2: "Kopiere den auf jede KI zugeschnittenen Prompt", step3: "Vergleiche die Antworten und iteriere",
    resultsTitle: "Optimierte Prompts", toCompareBtn: "Antworten vergleichen →",
    optNone: "Keine Präferenz", optProse: "Fließtext", optMarkdown: "Markdown", optBullets: "Stichpunkte", optTable: "Tabelle", optJson: "JSON", optCode: "Code",
    optShort: "Kurz", optMedium: "Mittel", optLong: "Lang & detailliert",
    optProfessional: "Professionell", optFriendly: "Freundlich", optCasual: "Locker", optPersuasive: "Überzeugend", optAcademic: "Akademisch",
    autoDetect: "Automatisch erkennen", detected: "Erkannt:",
    task_writing: "Schreiben & Inhalte", task_coding: "Code & Entwicklung", task_analysis: "Analyse & Daten", task_research: "Recherche & Zusammenfassung",
    task_brainstorming: "Brainstorming & Ideen", task_education: "Bildung & Erklärung", task_business: "Business & Marketing", task_general: "Allgemein / Sonstiges",
    routerTitle: "Welches Modell für diese Aufgabe?", bestPick: "Beste Wahl:", benchLabel: "Benchmarks:",
    fullRanking: "Komplettes Ranking, Gratis-Angebote und Quellen", freeTier: "Gratis-Angebot:", sourcesLabel: "Quellen:",
    whyPrefix: "Warum dieser Prompt so aufgebaut ist für", copy: "Kopieren", copied: "Kopiert", copyPrompt: "Prompt kopieren",
    guideTitle: "Modell-Guide", guideSub: "Welche KI-App zu welcher Aufgabe passt - öffentliche Benchmarks in einfache Worte übersetzt.",
    catalogTitle: "Modellkatalog",
    compareTitle: "Antworten vergleichen",
    compareSub: "Führe denselben optimierten Prompt in jeder KI-App aus, füge die Antworten ein (oder führe sie automatisch aus) und bewerte sie nebeneinander. Alles bleibt in deinem Browser.",
    compareEmptyText: "Kein aktiver Vergleich. Generiere zuerst Prompts und klicke dann auf „Antworten vergleichen“. ",
    goGenerator: "Zum Generator",
    saveCmp: "Vergleich speichern", newVersion: "Neue Version", exportMd: ".md exportieren", savedCmps: "Gespeicherte Vergleiche",
    notScored: "Nicht bewertet", winner: "Gewinner", tied: "Unentschieden", tie: "Unentschieden", winnerPrefix: "Gewinner:", openBtn: "Öffnen", deleteBtn: "Löschen",
    chainsTitle: "Ketten",
    chainsSub: "Zerlege ein komplexes Ziel in verknüpfte Schritte: Jeder Schritt bekommt seinen eigenen optimierten Prompt, und die Ausgabe eines Schritts speist den nächsten. Automatische Ausführung mit Gratis-Schlüssel; sonst Copy & Paste.",
    buildChain: "Kette erstellen", saveChain: "Kette speichern", savedChains: "Gespeicherte Ketten",
    promptForStep: "Prompt für diesen Schritt", stepOutput: "Schritt-Ausgabe",
    settingsTitle: "Einstellungen",
    settingsSub: "API-Schlüssel aktivieren die automatische Ausführung. Sie bleiben nur in diesem Browser und gehen nur an den aufgerufenen Anbieter - nie an einen WhichAI-Server (es gibt keinen).",
    saveSettings: "Einstellungen speichern", prefsReset: "Einstellungen zurücksetzen",
    footerText: "Läuft vollständig in deinem Browser: kein Konto, kein Server, deine Schlüssel und Daten verlassen nie dein Gerät."
  };

  S.pt = {
    navGenerator: "Gerador", navGuide: "Guia de modelos", navCompare: "Comparar", navChains: "Cadeias", navSettings: "Configurações",
    privacyPill: "Privado por design",
    privacyTip: "Funciona inteiramente no seu navegador. Sem conta, sem servidor, sem rastreamento. As chaves de API ficam no seu dispositivo.",
    trustLine: "Sem conta · Sem servidor · Nada sai do seu navegador",
    langNote: "Interface em português. Nota: os prompts gerados, as notas de benchmark e a detecção automática do tipo de tarefa são otimizados para o inglês (todos os modelos de IA funcionam melhor com instruções em inglês). Você pode escrever seu objetivo em qualquer idioma: a IA responderá no seu idioma.",
    genTitle: "Descreva seu objetivo",
    genSubtitle: "O WhichAI o transforma em um prompt sob medida para cada modelo de IA - e diz qual modelo é o mais adequado, em linguagem simples.",
    goalLabel: "Objetivo ", optionalTag: "(opcional)", tryExample: "Testar um exemplo",
    goalPh: "ex.: Escreva o título de uma landing page para um app de orçamento para freelancers",
    goalErr: "Descreva seu objetivo para gerar os prompts.",
    contextLabel: "Contexto ", contextPh: "Contexto, público, restrições, exemplos - tudo o que a IA deve saber",
    taskLabel: "Tipo de tarefa", formatLabel: "Formato de saída", lengthLabel: "Comprimento", toneLabel: "Tom",
    targetsLabel: "Modelos de destino", groupAssistants: "Assistentes de IA", groupEco: "Assistentes de ecossistema", groupOpen: "Modelos abertos ",
    modelsErr: "Selecione pelo menos um modelo.", generateBtn: "Gerar prompts",
    emptyLead: "Seus prompts otimizados aparecerão aqui - uma versão por modelo, mais a recomendação do modelo mais adequado.",
    step1: "Descreva seu objetivo", step2: "Copie o prompt sob medida para cada IA", step3: "Compare as respostas e itere",
    resultsTitle: "Prompts otimizados", toCompareBtn: "Comparar respostas →",
    optNone: "Sem preferência", optProse: "Prosa simples", optMarkdown: "Markdown", optBullets: "Tópicos", optTable: "Tabela", optJson: "JSON", optCode: "Código",
    optShort: "Curto", optMedium: "Médio", optLong: "Longo e detalhado",
    optProfessional: "Profissional", optFriendly: "Amigável", optCasual: "Informal", optPersuasive: "Persuasivo", optAcademic: "Acadêmico",
    autoDetect: "Detecção automática", detected: "Detectado:",
    task_writing: "Escrita e conteúdo", task_coding: "Código e desenvolvimento", task_analysis: "Análise e dados", task_research: "Pesquisa e síntese",
    task_brainstorming: "Brainstorming e ideias", task_education: "Educação e explicação", task_business: "Negócios e marketing", task_general: "Geral / outro",
    routerTitle: "Qual modelo para esta tarefa?", bestPick: "Melhor escolha:", benchLabel: "Benchmarks:",
    fullRanking: "Classificação completa, planos gratuitos e fontes", freeTier: "Plano gratuito:", sourcesLabel: "Fontes:",
    whyPrefix: "Por que este prompt é construído assim para", copy: "Copiar", copied: "Copiado", copyPrompt: "Copiar prompt",
    guideTitle: "Guia de modelos", guideSub: "Qual app de IA combina com cada tipo de tarefa - benchmarks públicos traduzidos em linguagem simples.",
    catalogTitle: "Catálogo de modelos",
    compareTitle: "Comparar respostas",
    compareSub: "Execute o mesmo prompt otimizado em cada app de IA, cole (ou execute automaticamente) as respostas e avalie-as lado a lado. Tudo fica no seu navegador.",
    compareEmptyText: "Nenhuma comparação ativa. Gere os prompts primeiro e clique em \"Comparar respostas\". ",
    goGenerator: "Ir para o Gerador",
    saveCmp: "Salvar comparação", newVersion: "Nova versão", exportMd: "Exportar .md", savedCmps: "Comparações salvas",
    notScored: "Sem nota", winner: "Vencedor", tied: "Empate", tie: "Empate", winnerPrefix: "Vencedor:", openBtn: "Abrir", deleteBtn: "Excluir",
    chainsTitle: "Cadeias",
    chainsSub: "Divida um objetivo complexo em etapas ligadas: cada etapa tem seu prompt otimizado e a saída de uma etapa alimenta a próxima. Execução automática onde houver chave gratuita; copiar e colar no resto.",
    buildChain: "Construir cadeia", saveChain: "Salvar cadeia", savedChains: "Cadeias salvas",
    promptForStep: "Prompt desta etapa", stepOutput: "Saída da etapa",
    settingsTitle: "Configurações",
    settingsSub: "As chaves de API ativam a execução automática. Ficam apenas neste navegador e são enviadas somente ao provedor chamado - nunca a um servidor do WhichAI (não existe).",
    saveSettings: "Salvar configurações", prefsReset: "Redefinir preferências",
    footerText: "Funciona inteiramente no seu navegador: sem conta, sem servidor, suas chaves e dados nunca saem do seu dispositivo."
  };

  S.zh = {
    navGenerator: "生成器", navGuide: "模型指南", navCompare: "对比", navChains: "任务链", navSettings: "设置",
    privacyPill: "隐私优先设计",
    privacyTip: "完全在您的浏览器中运行。无需账户、无服务器、无跟踪。API 密钥仅保存在您的设备上。",
    trustLine: "无需账户 · 无服务器 · 数据不离开浏览器",
    langNote: "界面为中文。请注意：生成的提示词、基准测试说明和任务类型自动检测均针对英文优化（所有 AI 模型对英文指令的表现最佳）。您仍可用任何语言描述目标，AI 会用您的语言回答。",
    genTitle: "描述您的目标",
    genSubtitle: "WhichAI 将其转化为针对每个 AI 模型定制的提示词，并用通俗语言告诉您哪个模型最适合这项任务。",
    goalLabel: "目标 ", optionalTag: "（可选）", tryExample: "试试示例",
    goalPh: "例如：为一款面向自由职业者的记账应用撰写落地页标题和副标题",
    goalErr: "请描述您的目标以生成提示词。",
    contextLabel: "背景 ", contextPh: "背景、受众、限制、示例：任何 AI 应该知道的信息",
    taskLabel: "任务类型", formatLabel: "输出格式", lengthLabel: "长度", toneLabel: "语气",
    targetsLabel: "目标模型", groupAssistants: "AI 助手", groupEco: "生态系统助手", groupOpen: "开源模型 ",
    modelsErr: "请至少选择一个模型。", generateBtn: "生成提示词",
    emptyLead: "优化后的提示词将显示在这里：每个模型一个版本，并推荐最适合此任务的模型。",
    step1: "描述您的目标", step2: "复制为每个 AI 定制的提示词", step3: "对比回答并迭代",
    resultsTitle: "优化的提示词", toCompareBtn: "对比输出 →",
    optNone: "无偏好", optProse: "普通文本", optMarkdown: "Markdown", optBullets: "要点列表", optTable: "表格", optJson: "JSON", optCode: "代码",
    optShort: "简短", optMedium: "中等", optLong: "详细",
    optProfessional: "专业", optFriendly: "亲切", optCasual: "随意", optPersuasive: "有说服力", optAcademic: "学术",
    autoDetect: "自动检测", detected: "检测到：",
    task_writing: "写作与内容", task_coding: "编程与开发", task_analysis: "分析与数据", task_research: "研究与总结",
    task_brainstorming: "头脑风暴", task_education: "教育与讲解", task_business: "商业与营销", task_general: "通用 / 其他",
    routerTitle: "这项任务用哪个模型？", bestPick: "最佳选择：", benchLabel: "基准测试：",
    fullRanking: "完整排名、免费方案与来源", freeTier: "免费方案：", sourcesLabel: "来源：",
    whyPrefix: "为什么这样为其构建提示词：", copy: "复制", copied: "已复制", copyPrompt: "复制提示词",
    guideTitle: "模型指南", guideSub: "哪个 AI 应用适合哪类任务：把公开基准测试翻译成通俗语言。",
    catalogTitle: "模型目录",
    compareTitle: "对比输出",
    compareSub: "在每个 AI 应用中运行同一优化提示词，粘贴（或自动运行）回答并并排打分。一切都保存在您的浏览器中。",
    compareEmptyText: "暂无进行中的对比。请先生成提示词，然后点击“对比输出”。 ",
    goGenerator: "前往生成器",
    saveCmp: "保存对比", newVersion: "新版本", exportMd: "导出 .md", savedCmps: "已保存的对比",
    notScored: "未评分", winner: "胜者", tied: "并列", tie: "平局", winnerPrefix: "胜者：", openBtn: "打开", deleteBtn: "删除",
    chainsTitle: "任务链",
    chainsSub: "将复杂目标拆分为连贯的步骤：每一步都有专属优化提示词，上一步的输出会输入下一步。有免费密钥的模型可自动运行，其余复制粘贴即可。",
    buildChain: "构建任务链", saveChain: "保存任务链", savedChains: "已保存的任务链",
    promptForStep: "此步骤的提示词", stepOutput: "步骤输出",
    settingsTitle: "设置",
    settingsSub: "API 密钥用于自动运行。密钥仅保存在本浏览器中，只发送给您调用的提供商：绝不会发送到 WhichAI 服务器（根本不存在服务器）。",
    saveSettings: "保存设置", prefsReset: "重置偏好设置",
    footerText: "完全在您的浏览器中运行：无需账户、无服务器，您的密钥和数据绝不离开设备。"
  };

  S.hi = {
    navGenerator: "जनरेटर", navGuide: "मॉडल गाइड", navCompare: "तुलना", navChains: "चेन", navSettings: "सेटिंग्स",
    privacyPill: "डिज़ाइन से निजी",
    privacyTip: "पूरी तरह आपके ब्राउज़र में चलता है। कोई खाता नहीं, कोई सर्वर नहीं, कोई ट्रैकिंग नहीं। API कुंजियाँ आपके डिवाइस पर ही रहती हैं।",
    trustLine: "कोई खाता नहीं · कोई सर्वर नहीं · कुछ भी ब्राउज़र से बाहर नहीं जाता",
    langNote: "इंटरफ़ेस हिन्दी में है। ध्यान दें: जनरेट किए गए प्रॉम्प्ट, बेंचमार्क नोट्स और कार्य-प्रकार की स्वतः पहचान अंग्रेज़ी के लिए अनुकूलित हैं (सभी AI मॉडल अंग्रेज़ी निर्देशों पर सबसे अच्छा काम करते हैं)। आप अपना लक्ष्य किसी भी भाषा में लिख सकते हैं: AI आपकी भाषा में उत्तर देगा।",
    genTitle: "अपना लक्ष्य बताइए",
    genSubtitle: "WhichAI इसे हर AI मॉडल के लिए तैयार प्रॉम्प्ट में बदलता है - और सरल भाषा में बताता है कि कौन सा मॉडल सबसे उपयुक्त है।",
    goalLabel: "लक्ष्य ", optionalTag: "(वैकल्पिक)", tryExample: "उदाहरण आज़माएँ",
    goalPh: "जैसे: फ्रीलांसरों के लिए बजट ऐप की लैंडिंग पेज हेडलाइन लिखें",
    goalErr: "प्रॉम्प्ट बनाने के लिए अपना लक्ष्य बताइए।",
    contextLabel: "संदर्भ ", contextPh: "पृष्ठभूमि, दर्शक, सीमाएँ, उदाहरण - जो कुछ AI को पता होना चाहिए",
    taskLabel: "कार्य का प्रकार", formatLabel: "आउटपुट फ़ॉर्मेट", lengthLabel: "लंबाई", toneLabel: "लहजा",
    targetsLabel: "लक्षित मॉडल", groupAssistants: "AI सहायक", groupEco: "इकोसिस्टम सहायक", groupOpen: "ओपन मॉडल ",
    modelsErr: "कम से कम एक मॉडल चुनें।", generateBtn: "प्रॉम्प्ट बनाएँ",
    emptyLead: "आपके अनुकूलित प्रॉम्प्ट यहाँ दिखेंगे - हर मॉडल के लिए एक संस्करण, साथ ही सबसे उपयुक्त मॉडल की सिफ़ारिश।",
    step1: "अपना लक्ष्य बताइए", step2: "हर AI के लिए तैयार प्रॉम्प्ट कॉपी करें", step3: "उत्तरों की तुलना करें और सुधारें",
    resultsTitle: "अनुकूलित प्रॉम्प्ट", toCompareBtn: "आउटपुट की तुलना करें →",
    optNone: "कोई प्राथमिकता नहीं", optProse: "सादा गद्य", optMarkdown: "Markdown", optBullets: "बुलेट सूची", optTable: "तालिका", optJson: "JSON", optCode: "कोड",
    optShort: "छोटा", optMedium: "मध्यम", optLong: "लंबा और विस्तृत",
    optProfessional: "पेशेवर", optFriendly: "मैत्रीपूर्ण", optCasual: "अनौपचारिक", optPersuasive: "प्रेरक", optAcademic: "अकादमिक",
    autoDetect: "स्वतः पहचान", detected: "पहचाना गया:",
    task_writing: "लेखन और सामग्री", task_coding: "कोडिंग और विकास", task_analysis: "विश्लेषण और डेटा", task_research: "शोध और सारांश",
    task_brainstorming: "विचार-मंथन", task_education: "शिक्षा और व्याख्या", task_business: "व्यवसाय और मार्केटिंग", task_general: "सामान्य / अन्य",
    routerTitle: "इस कार्य के लिए कौन सा मॉडल?", bestPick: "सर्वश्रेष्ठ विकल्प:", benchLabel: "बेंचमार्क:",
    fullRanking: "पूरी रैंकिंग, मुफ़्त प्लान और स्रोत", freeTier: "मुफ़्त प्लान:", sourcesLabel: "स्रोत:",
    whyPrefix: "यह प्रॉम्प्ट इस तरह क्यों बनाया गया है:", copy: "कॉपी", copied: "कॉपी हो गया", copyPrompt: "प्रॉम्प्ट कॉपी करें",
    guideTitle: "मॉडल गाइड", guideSub: "किस तरह के कार्य के लिए कौन सा AI ऐप उपयुक्त है - सार्वजनिक बेंचमार्क सरल भाषा में।",
    catalogTitle: "मॉडल कैटलॉग",
    compareTitle: "आउटपुट की तुलना करें",
    compareSub: "हर AI ऐप में वही अनुकूलित प्रॉम्प्ट चलाएँ, उत्तर चिपकाएँ (या स्वतः चलाएँ) और साथ-साथ अंक दें। सब कुछ आपके ब्राउज़र में रहता है।",
    compareEmptyText: "कोई सक्रिय तुलना नहीं। पहले प्रॉम्प्ट बनाएँ, फिर \"आउटपुट की तुलना करें\" दबाएँ। ",
    goGenerator: "जनरेटर पर जाएँ",
    saveCmp: "तुलना सहेजें", newVersion: "नया संस्करण", exportMd: ".md निर्यात करें", savedCmps: "सहेजी गई तुलनाएँ",
    notScored: "अंक नहीं", winner: "विजेता", tied: "बराबर", tie: "बराबरी", winnerPrefix: "विजेता:", openBtn: "खोलें", deleteBtn: "हटाएँ",
    chainsTitle: "चेन",
    chainsSub: "जटिल लक्ष्य को जुड़े हुए चरणों में बाँटें: हर चरण का अपना अनुकूलित प्रॉम्प्ट होता है और एक चरण का आउटपुट अगले में जाता है। मुफ़्त कुंजी होने पर स्वतः चलाएँ; बाकी में कॉपी-पेस्ट करें।",
    buildChain: "चेन बनाएँ", saveChain: "चेन सहेजें", savedChains: "सहेजी गई चेन",
    promptForStep: "इस चरण का प्रॉम्प्ट", stepOutput: "चरण का आउटपुट",
    settingsTitle: "सेटिंग्स",
    settingsSub: "API कुंजियाँ स्वतः-चालन सक्षम करती हैं। ये केवल इस ब्राउज़र में रहती हैं और सिर्फ़ उसी प्रदाता को भेजी जाती हैं जिसे आप कॉल करते हैं - कभी किसी WhichAI सर्वर को नहीं (कोई सर्वर है ही नहीं)।",
    saveSettings: "सेटिंग्स सहेजें", prefsReset: "प्राथमिकताएँ रीसेट करें",
    footerText: "पूरी तरह आपके ब्राउज़र में चलता है: कोई खाता नहीं, कोई सर्वर नहीं, आपकी कुंजियाँ और डेटा कभी डिवाइस से बाहर नहीं जाते।"
  };


  S.en.dbTitle = "Model database"; S.en.dbSub = "Every notable AI model we track - including private and preview models, listed for information. Estimated scores are marked."; S.en.dbSearchPh = "Search models, vendors, tags…"; S.en.dbNoResults = "No models match your search.";
  S.it.dbTitle = "Database dei modelli"; S.it.dbSub = "Tutti i modelli AI rilevanti che seguiamo - inclusi quelli privati e in anteprima, presenti a scopo informativo. I punteggi stimati sono contrassegnati."; S.it.dbSearchPh = "Cerca modelli, produttori, tag…"; S.it.dbNoResults = "Nessun modello corrisponde alla ricerca.";
  S.fr.dbTitle = "Base de données des modèles"; S.fr.dbSub = "Tous les modèles d'IA notables que nous suivons - y compris privés et en préversion, à titre informatif. Les scores estimés sont signalés."; S.fr.dbSearchPh = "Rechercher modèles, éditeurs, tags…"; S.fr.dbNoResults = "Aucun modèle ne correspond à votre recherche.";
  S.es.dbTitle = "Base de datos de modelos"; S.es.dbSub = "Todos los modelos de IA relevantes que seguimos - incluidos privados y en vista previa, con fines informativos. Las puntuaciones estimadas están marcadas."; S.es.dbSearchPh = "Buscar modelos, proveedores, etiquetas…"; S.es.dbNoResults = "Ningún modelo coincide con tu búsqueda.";
  S.de.dbTitle = "Modell-Datenbank"; S.de.dbSub = "Alle relevanten KI-Modelle, die wir verfolgen - einschließlich privater und Preview-Modelle, zur Information. Geschätzte Werte sind markiert."; S.de.dbSearchPh = "Modelle, Anbieter, Tags suchen…"; S.de.dbNoResults = "Keine Modelle entsprechen deiner Suche.";
  S.pt.dbTitle = "Banco de dados de modelos"; S.pt.dbSub = "Todos os modelos de IA relevantes que acompanhamos - incluindo privados e em prévia, para fins informativos. Pontuações estimadas estão marcadas."; S.pt.dbSearchPh = "Buscar modelos, fornecedores, tags…"; S.pt.dbNoResults = "Nenhum modelo corresponde à sua busca.";
  S.zh.dbTitle = "模型数据库"; S.zh.dbSub = "我们追踪的所有重要 AI 模型：包括私有和预览模型，仅供参考。估算分数已标注。"; S.zh.dbSearchPh = "搜索模型、厂商、标签…"; S.zh.dbNoResults = "没有匹配的模型。";
  S.hi.dbTitle = "मॉडल डेटाबेस"; S.hi.dbSub = "हम जिन सभी उल्लेखनीय AI मॉडलों पर नज़र रखते हैं - निजी और पूर्वावलोकन मॉडल सहित, केवल जानकारी के लिए। अनुमानित स्कोर चिह्नित हैं।"; S.hi.dbSearchPh = "मॉडल, विक्रेता, टैग खोजें…"; S.hi.dbNoResults = "आपकी खोज से कोई मॉडल मेल नहीं खाता।";


  S.ru = {
    navGenerator: "Генератор",
    navGuide: "Гид по моделям",
    navCompare: "Сравнение",
    navChains: "Цепочки",
    navSettings: "Настройки",
    privacyPill: "Приватность по умолчанию",
    privacyTip: "Работает полностью в вашем браузере. Без аккаунта, без сервера, без трекинга. API-ключи остаются на вашем устройстве.",
    trustLine: "Без аккаунта · Без сервера · Ничего не покидает ваш браузер",
    langNote: "Интерфейс на русском. Примечание: сгенерированные промпты, заметки о бенчмарках и автоопределение типа задачи оптимизированы для английского (все ИИ-модели работают лучше с англоязычными инструкциями). Цель можно писать на любом языке - ИИ ответит на вашем языке.",
    genTitle: "Опишите вашу цель",
    genSubtitle: "WhichAI превратит её в промпт, адаптированный под каждую ИИ-модель, и простым языком подскажет, какая модель лучше подходит для задачи.",
    goalLabel: "Цель ",
    optionalTag: "(необязательно)",
    tryExample: "Показать пример",
    goalPh: "напр., Напиши заголовок и подзаголовок лендинга для приложения бюджетирования для фрилансеров",
    goalErr: "Опишите цель, чтобы сгенерировать промпты.",
    contextLabel: "Контекст ",
    contextPh: "Фон, аудитория, ограничения, примеры - всё, что ИИ должен знать",
    taskLabel: "Тип задачи",
    formatLabel: "Формат ответа",
    lengthLabel: "Длина",
    toneLabel: "Тон",
    targetsLabel: "Целевые модели",
    groupAssistants: "ИИ-ассистенты",
    groupEco: "Экосистемные ассистенты",
    groupOpen: "Открытые модели ",
    modelsErr: "Выберите хотя бы одну модель.",
    generateBtn: "Сгенерировать промпты",
    emptyLead: "Здесь появятся ваши оптимизированные промпты - по версии на модель, плюс рекомендация, какая модель лучше подходит.",
    step1: "Опишите цель",
    step2: "Скопируйте промпт под каждую ИИ",
    step3: "Сравните ответы и улучшайте",
    resultsTitle: "Оптимизированные промпты",
    toCompareBtn: "Сравнить ответы →",
    optNone: "Не важно",
    optProse: "Обычный текст",
    optMarkdown: "Markdown",
    optBullets: "Маркированный список",
    optTable: "Таблица",
    optJson: "JSON",
    optCode: "Код",
    optShort: "Коротко",
    optMedium: "Средне",
    optLong: "Подробно",
    optProfessional: "Профессиональный",
    optFriendly: "Дружелюбный",
    optCasual: "Неформальный",
    optPersuasive: "Убедительный",
    optAcademic: "Академический",
    autoDetect: "Автоопределение",
    detected: "Определено:",
    task_writing: "Тексты и контент",
    task_coding: "Код и разработка",
    task_analysis: "Анализ и данные",
    task_research: "Исследования и обзоры",
    task_brainstorming: "Брейншторм и идеи",
    task_education: "Обучение и объяснения",
    task_business: "Бизнес и маркетинг",
    task_general: "Общее / другое",
    routerTitle: "Какая модель для этой задачи?",
    bestPick: "Лучший выбор:",
    benchLabel: "Бенчмарки:",
    fullRanking: "Полный рейтинг, бесплатные тарифы и источники",
    freeTier: "Бесплатный тариф:",
    sourcesLabel: "Источники:",
    whyPrefix: "Почему промпт устроен так для",
    copy: "Копировать",
    copied: "Скопировано",
    copyPrompt: "Копировать промпт",
    guideTitle: "Гид по моделям",
    guideSub: "Какая ИИ подходит для каждого типа задач - публичные бенчмарки простым языком.",
    catalogTitle: "Каталог моделей",
    compareTitle: "Сравнение ответов",
    compareSub: "Запустите один и тот же промпт в каждой ИИ, вставьте (или запустите автоматически) ответы и оцените их рядом. Всё остаётся в вашем браузере.",
    compareEmptyText: "Нет активного сравнения. Сначала сгенерируйте промпты и нажмите «Сравнить ответы». ",
    goGenerator: "К генератору",
    saveCmp: "Сохранить сравнение",
    newVersion: "Новая версия",
    exportMd: "Экспорт .md",
    savedCmps: "Сохранённые сравнения",
    notScored: "Без оценки",
    winner: "Победитель",
    tied: "Ничья",
    tie: "Ничья",
    winnerPrefix: "Победитель:",
    openBtn: "Открыть",
    deleteBtn: "Удалить",
    chainsTitle: "Цепочки",
    chainsSub: "Разбейте сложную цель на связанные шаги: каждый шаг получает свой промпт, а результат одного шага питает следующий. Автозапуск там, где есть бесплатный ключ; в остальных - копипаст.",
    buildChain: "Построить цепочку",
    saveChain: "Сохранить цепочку",
    savedChains: "Сохранённые цепочки",
    promptForStep: "Промпт для этого шага",
    stepOutput: "Результат шага",
    settingsTitle: "Настройки",
    settingsSub: "API-ключи включают автозапуск в Сравнении. Ключи хранятся только в этом браузере и отправляются только выбранному провайдеру - никогда на сервер WhichAI (его нет).",
    saveSettings: "Сохранить настройки",
    prefsReset: "Сбросить запомненные предпочтения",
    footerText: "Работает полностью в вашем браузере: без аккаунта, без сервера, ключи и данные не покидают устройство.",
    dbTitle: "База моделей",
    dbSub: "Все значимые ИИ-модели, которые мы отслеживаем, включая приватные и превью - для информации. Оценочные баллы помечены.",
    dbSearchPh: "Поиск моделей, вендоров, тегов…",
    dbNoResults: "Ничего не найдено.",
    navAbout: "О проекте",
    dbHint: "моделей в базе - начните вводить (частичные имена работают)."
  };

  S.ja = {
    navGenerator: "ジェネレーター",
    navGuide: "モデルガイド",
    navCompare: "比較",
    navChains: "チェーン",
    navSettings: "設定",
    privacyPill: "プライバシー第一",
    privacyTip: "すべてブラウザ内で動作。アカウント不要、サーバーなし、トラッキングなし。APIキーは端末内に保存されます。",
    trustLine: "アカウント不要 · サーバーなし · データはブラウザの外に出ません",
    langNote: "インターフェースは日本語です。注: 生成されるプロンプト、ベンチマークの注記、タスク自動判定は英語向けに最適化されています（どのAIモデルも英語の指示で最高の性能を発揮します）。目標はどの言語で書いてもかまいません - AIはあなたの言語で回答します。",
    genTitle: "目標を記述してください",
    genSubtitle: "WhichAIがそれを各AIモデルに合わせたプロンプトに変換し、どのモデルが最適かをわかりやすく提案します。",
    goalLabel: "目標 ",
    optionalTag: "（任意）",
    tryExample: "例を試す",
    goalPh: "例: フリーランサー向け家計簿アプリのランディングページの見出しとサブ見出しを書いて",
    goalErr: "プロンプトを生成するには目標を記述してください。",
    contextLabel: "コンテキスト ",
    contextPh: "背景、対象読者、制約、例など - AIが知っておくべきこと",
    taskLabel: "タスクの種類",
    formatLabel: "出力形式",
    lengthLabel: "長さ",
    toneLabel: "トーン",
    targetsLabel: "対象モデル",
    groupAssistants: "AIアシスタント",
    groupEco: "エコシステム型アシスタント",
    groupOpen: "オープンモデル ",
    modelsErr: "対象モデルを1つ以上選択してください。",
    generateBtn: "プロンプトを生成",
    emptyLead: "最適化されたプロンプトがここに表示されます - モデルごとに1つ、さらに最適モデルの推薦付き。",
    step1: "目標を記述",
    step2: "各AI向けのプロンプトをコピー",
    step3: "回答を比較して改善",
    resultsTitle: "最適化されたプロンプト",
    toCompareBtn: "出力を比較 →",
    optNone: "指定なし",
    optProse: "通常の文章",
    optMarkdown: "Markdown",
    optBullets: "箇条書き",
    optTable: "表",
    optJson: "JSON",
    optCode: "コード",
    optShort: "短い",
    optMedium: "普通",
    optLong: "長く詳細に",
    optProfessional: "プロフェッショナル",
    optFriendly: "フレンドリー",
    optCasual: "カジュアル",
    optPersuasive: "説得力重視",
    optAcademic: "アカデミック",
    autoDetect: "自動判定",
    detected: "判定結果:",
    task_writing: "文章・コンテンツ",
    task_coding: "コーディング・開発",
    task_analysis: "分析・データ",
    task_research: "リサーチ・要約",
    task_brainstorming: "ブレスト・アイデア",
    task_education: "教育・解説",
    task_business: "ビジネス・マーケティング",
    task_general: "一般 / その他",
    routerTitle: "このタスクに最適なモデルは？",
    bestPick: "ベストチョイス:",
    benchLabel: "ベンチマーク:",
    fullRanking: "全ランキング・無料枠・出典",
    freeTier: "無料枠:",
    sourcesLabel: "出典:",
    whyPrefix: "このプロンプトの設計理由 -",
    copy: "コピー",
    copied: "コピー済み",
    copyPrompt: "プロンプトをコピー",
    guideTitle: "モデルガイド",
    guideSub: "タスクごとに最適なAIアプリ - 公開ベンチマークをわかりやすく翻訳。",
    catalogTitle: "モデルカタログ",
    compareTitle: "出力を比較",
    compareSub: "同じプロンプトを各AIで実行し、回答を貼り付け（または自動実行）して並べて採点。すべてブラウザ内に保存されます。",
    compareEmptyText: "アクティブな比較はありません。まずプロンプトを生成し、「出力を比較」をクリックしてください。 ",
    goGenerator: "ジェネレーターへ",
    saveCmp: "比較を保存",
    newVersion: "新バージョン",
    exportMd: ".mdエクスポート",
    savedCmps: "保存済みの比較",
    notScored: "未採点",
    winner: "勝者",
    tied: "同点",
    tie: "引き分け",
    winnerPrefix: "勝者:",
    openBtn: "開く",
    deleteBtn: "削除",
    chainsTitle: "チェーン",
    chainsSub: "複雑な目標を連結ステップに分解: 各ステップが専用プロンプトを持ち、前の出力が次の入力になります。無料キーがあれば自動実行、なければコピペで。",
    buildChain: "チェーンを作成",
    saveChain: "チェーンを保存",
    savedChains: "保存済みチェーン",
    promptForStep: "このステップのプロンプト",
    stepOutput: "ステップの出力",
    settingsTitle: "設定",
    settingsSub: "APIキーで比較の自動実行が有効になります。キーはこのブラウザにのみ保存され、呼び出すプロバイダーだけに送信されます - WhichAIのサーバーには送信されません（存在しません）。",
    saveSettings: "設定を保存",
    prefsReset: "記憶した設定をリセット",
    footerText: "すべてブラウザ内で動作: アカウント不要、サーバーなし、キーとデータは端末から出ません。",
    dbTitle: "モデルデータベース",
    dbSub: "追跡中の注目AIモデルすべて - 非公開・プレビュー版も情報として掲載。推定スコアには印が付いています。",
    dbSearchPh: "モデル・ベンダー・タグを検索…",
    dbNoResults: "該当するモデルがありません。",
    navAbout: "概要",
    dbHint: "件のモデルを収録 - 入力して検索（部分一致OK）。"
  };

  S.ar = {
    navGenerator: "المولّد",
    navGuide: "دليل النماذج",
    navCompare: "مقارنة",
    navChains: "السلاسل",
    navSettings: "الإعدادات",
    privacyPill: "خصوصية بالتصميم",
    privacyTip: "يعمل بالكامل في متصفحك. بلا حساب، بلا خادم، بلا تتبّع. مفاتيح API تبقى على جهازك.",
    trustLine: "بلا حساب · بلا خادم · لا شيء يغادر متصفحك",
    langNote: "الواجهة بالعربية. ملاحظة: البرومبتات المولّدة وملاحظات المعايير والكشف التلقائي لنوع المهمة مُحسّنة للإنجليزية (كل النماذج تعمل بأفضل أداء مع تعليمات إنجليزية). يمكنك كتابة هدفك بأي لغة - وسيجيب الذكاء الاصطناعي بلغتك.",
    genTitle: "صِف هدفك",
    genSubtitle: "يحوّله WhichAI إلى برومبت مُخصّص لكل نموذج ذكاء اصطناعي - ويخبرك بلغة بسيطة أي نموذج هو الأنسب للمهمة.",
    goalLabel: "الهدف ",
    optionalTag: "(اختياري)",
    tryExample: "جرّب مثالاً",
    goalPh: "مثال: اكتب عنواناً رئيسياً وفرعياً لصفحة هبوط لتطبيق ميزانية موجّه للمستقلين",
    goalErr: "صِف هدفك لتوليد البرومبتات.",
    contextLabel: "السياق ",
    contextPh: "الخلفية، الجمهور، القيود، أمثلة - كل ما يجب أن يعرفه الذكاء الاصطناعي",
    taskLabel: "نوع المهمة",
    formatLabel: "صيغة المخرجات",
    lengthLabel: "الطول",
    toneLabel: "النبرة",
    targetsLabel: "النماذج المستهدفة",
    groupAssistants: "مساعدو الذكاء الاصطناعي",
    groupEco: "مساعدو المنظومات",
    groupOpen: "نماذج مفتوحة ",
    modelsErr: "اختر نموذجاً واحداً على الأقل.",
    generateBtn: "ولّد البرومبتات",
    emptyLead: "ستظهر برومبتاتك المُحسّنة هنا - نسخة لكل نموذج، مع توصية بالنموذج الأنسب لهذه المهمة.",
    step1: "صِف هدفك",
    step2: "انسخ البرومبت المخصص لكل ذكاء اصطناعي",
    step3: "قارن الإجابات وحسّن",
    resultsTitle: "برومبتات محسّنة",
    toCompareBtn: "قارن المخرجات ←",
    optNone: "بلا تفضيل",
    optProse: "نص عادي",
    optMarkdown: "Markdown",
    optBullets: "نقاط",
    optTable: "جدول",
    optJson: "JSON",
    optCode: "كود",
    optShort: "قصير",
    optMedium: "متوسط",
    optLong: "طويل ومفصّل",
    optProfessional: "مهني",
    optFriendly: "ودّي",
    optCasual: "غير رسمي",
    optPersuasive: "إقناعي",
    optAcademic: "أكاديمي",
    autoDetect: "كشف تلقائي",
    detected: "تم الكشف:",
    task_writing: "كتابة ومحتوى",
    task_coding: "برمجة وتطوير",
    task_analysis: "تحليل وبيانات",
    task_research: "بحث وتلخيص",
    task_brainstorming: "عصف ذهني وأفكار",
    task_education: "تعليم وشرح",
    task_business: "أعمال وتسويق",
    task_general: "عام / أخرى",
    routerTitle: "أي نموذج لهذه المهمة؟",
    bestPick: "الخيار الأفضل:",
    benchLabel: "المعايير:",
    fullRanking: "الترتيب الكامل والفئات المجانية والمصادر",
    freeTier: "الفئة المجانية:",
    sourcesLabel: "المصادر:",
    whyPrefix: "لماذا بُني هذا البرومبت هكذا لـ",
    copy: "نسخ",
    copied: "تم النسخ",
    copyPrompt: "انسخ البرومبت",
    guideTitle: "دليل النماذج",
    guideSub: "أي تطبيق ذكاء اصطناعي يناسب كل نوع مهمة - معايير عامة مترجمة بلغة بسيطة.",
    catalogTitle: "كتالوج النماذج",
    compareTitle: "قارن المخرجات",
    compareSub: "شغّل البرومبت المُحسّن نفسه في كل تطبيق، الصق الإجابات (أو شغّلها تلقائياً) وقيّمها جنباً إلى جنب. كل شيء يبقى في متصفحك.",
    compareEmptyText: "لا توجد مقارنة نشطة. ولّد البرومبتات أولاً ثم اضغط «قارن المخرجات». ",
    goGenerator: "إلى المولّد",
    saveCmp: "احفظ المقارنة",
    newVersion: "نسخة جديدة",
    exportMd: "تصدير .md",
    savedCmps: "مقارنات محفوظة",
    notScored: "بدون تقييم",
    winner: "الفائز",
    tied: "تعادل",
    tie: "تعادل",
    winnerPrefix: "الفائز:",
    openBtn: "افتح",
    deleteBtn: "احذف",
    chainsTitle: "السلاسل",
    chainsSub: "قسّم هدفاً معقداً إلى خطوات مترابطة: لكل خطوة برومبت خاص، ومخرجات كل خطوة تغذّي التالية. تشغيل تلقائي حيث لديك مفتاح مجاني؛ ونسخ ولصق في الباقي.",
    buildChain: "ابنِ السلسلة",
    saveChain: "احفظ السلسلة",
    savedChains: "سلاسل محفوظة",
    promptForStep: "برومبت هذه الخطوة",
    stepOutput: "مخرجات الخطوة",
    settingsTitle: "الإعدادات",
    settingsSub: "مفاتيح API تتيح التشغيل التلقائي في المقارنة. تُحفظ المفاتيح في هذا المتصفح فقط وتُرسل فقط إلى المزوّد الذي تستدعيه - أبداً إلى خادم WhichAI (لا يوجد أصلاً).",
    saveSettings: "احفظ الإعدادات",
    prefsReset: "إعادة ضبط التفضيلات المحفوظة",
    footerText: "يعمل بالكامل في متصفحك: بلا حساب، بلا خادم، مفاتيحك وبياناتك لا تغادر جهازك.",
    dbTitle: "قاعدة النماذج",
    dbSub: "كل نموذج ذكاء اصطناعي مهم نتتبعه - بما في ذلك الخاصة والتجريبية، للمعلومة. الدرجات التقديرية مُعلّمة.",
    dbSearchPh: "ابحث في النماذج والشركات والوسوم…",
    dbNoResults: "لا نماذج تطابق بحثك.",
    navAbout: "حول",
    dbHint: "نموذجاً في القاعدة - ابدأ الكتابة للبحث (الأسماء الجزئية تعمل)."
  };

  S.en.navAbout = "About"; S.en.dbHint = "models tracked - start typing to search (partial names work).";
  S.it.navAbout = "Info"; S.it.dbHint = "modelli censiti - inizia a digitare per cercare (valgono anche nomi parziali).";
  S.fr.navAbout = "À propos"; S.fr.dbHint = "modèles suivis - tapez pour rechercher (noms partiels acceptés).";
  S.es.navAbout = "Acerca de"; S.es.dbHint = "modelos registrados - escribe para buscar (valen nombres parciales).";
  S.de.navAbout = "Über"; S.de.dbHint = "Modelle erfasst - tippe, um zu suchen (Teilnamen genügen).";
  S.pt.navAbout = "Sobre"; S.pt.dbHint = "modelos registrados - digite para buscar (nomes parciais funcionam).";
  S.zh.navAbout = "关于"; S.zh.dbHint = "个模型已收录：输入即可搜索（支持部分名称）。";
  S.hi.navAbout = "परिचय"; S.hi.dbHint = "मॉडल दर्ज हैं - खोजने के लिए टाइप करें (आंशिक नाम भी चलेंगे)।";


  /* ---------- v0.21: settings tests, AI refine, merge studio, themes ---------- */

  S.en.setGuideTitle = "How to get free API keys";
  S.en.setTestBtn = "Test key";
  S.en.setTesting = "Testing…";
  S.en.setKeyOk = "Key works";
  S.en.setKeyFail = "Key check failed:";
  S.en.setKeyMissing = "Paste a key first";
  S.en.themeTip = "Theme: light → dark → sepia";
  S.en.refineBtn = "Refine with AI";
  S.en.refineHint = "Uses your free API key to make the goal clearer and more complete - you review before applying.";
  S.en.refineApply = "Use this version";
  S.en.refineDiscard = "Keep mine";
  S.en.refineNeedKey = "Add a free API key in Settings first (Gemini, Groq or OpenRouter).";
  S.en.refineWorking = "Refining…";
  S.en.refineErr = "Could not refine:";
  S.en.refineLabel = "Suggested goal (editable):";
  S.en.mergeOpenBtn = "Merge studio →";
  S.en.mergeTitle = "Merge studio";
  S.en.mergeSub = "Read every answer side by side and hand-pick the best parts into one final draft. Nothing is automatic - you stay the editor.";
  S.en.mergeBase = "Use as base";
  S.en.mergeAddSel = "Add selection";
  S.en.mergeAddAll = "Append all";
  S.en.mergeHighlight = "Highlight sentences shared by 2+ models";
  S.en.mergeDraftLabel = "Your merged draft";
  S.en.mergeDraftPh = "Pick a base output or add selections from the sources…";
  S.en.mergeCopy = "Copy draft";
  S.en.mergeClear = "Clear";
  S.en.mergeWords = "words";
  S.en.mergeEmpty = "No outputs yet - run or paste answers in Compare first.";
  S.en.mergeBack = "← Back to Compare";
  S.en.mergeAddSource = "Add another output";
  S.en.mergeSourceName = "Label (e.g. GPT-5.6)";
  S.en.mergeSourcePh = "Paste an output you got elsewhere…";
  S.en.mergeSourceAdd = "Add source";

  S.it.setGuideTitle = "Come ottenere chiavi API gratuite";
  S.it.setTestBtn = "Prova chiave";
  S.it.setTesting = "Verifica…";
  S.it.setKeyOk = "La chiave funziona";
  S.it.setKeyFail = "Verifica fallita:";
  S.it.setKeyMissing = "Prima incolla una chiave";
  S.it.themeTip = "Tema: chiaro → scuro → seppia";
  S.it.refineBtn = "Rifinisci con l'AI";
  S.it.refineHint = "Usa la tua chiave API gratuita per rendere l'obiettivo più chiaro e completo - lo rivedi prima di applicarlo.";
  S.it.refineApply = "Usa questa versione";
  S.it.refineDiscard = "Tieni il mio";
  S.it.refineNeedKey = "Aggiungi prima una chiave API gratuita nelle Impostazioni (Gemini, Groq o OpenRouter).";
  S.it.refineWorking = "Rifinitura…";
  S.it.refineErr = "Rifinitura non riuscita:";
  S.it.refineLabel = "Obiettivo suggerito (modificabile):";
  S.it.mergeOpenBtn = "Merge studio →";
  S.it.mergeTitle = "Merge studio";
  S.it.mergeSub = "Leggi tutte le risposte fianco a fianco e scegli a mano le parti migliori per un'unica bozza finale. Niente è automatico: l'editor sei tu.";
  S.it.mergeBase = "Usa come base";
  S.it.mergeAddSel = "Aggiungi selezione";
  S.it.mergeAddAll = "Aggiungi tutto";
  S.it.mergeHighlight = "Evidenzia frasi comuni a 2+ modelli";
  S.it.mergeDraftLabel = "La tua bozza unificata";
  S.it.mergeDraftPh = "Scegli una base o aggiungi selezioni dalle fonti…";
  S.it.mergeCopy = "Copia bozza";
  S.it.mergeClear = "Svuota";
  S.it.mergeWords = "parole";
  S.it.mergeEmpty = "Nessun output - esegui o incolla le risposte in Confronta prima.";
  S.it.mergeBack = "← Torna a Confronta";
  S.it.mergeAddSource = "Aggiungi un altro output";
  S.it.mergeSourceName = "Etichetta (es. GPT-5.6)";
  S.it.mergeSourcePh = "Incolla un output ottenuto altrove…";
  S.it.mergeSourceAdd = "Aggiungi fonte";

  S.fr.setGuideTitle = "Comment obtenir des clés API gratuites";
  S.fr.setTestBtn = "Tester la clé";
  S.fr.setTesting = "Vérification…";
  S.fr.setKeyOk = "La clé fonctionne";
  S.fr.setKeyFail = "Échec de la vérification :";
  S.fr.setKeyMissing = "Collez d'abord une clé";
  S.fr.themeTip = "Thème : clair → sombre → sépia";
  S.fr.refineBtn = "Affiner avec l'IA";
  S.fr.refineHint = "Utilise votre clé API gratuite pour clarifier et compléter l'objectif - vous validez avant d'appliquer.";
  S.fr.refineApply = "Utiliser cette version";
  S.fr.refineDiscard = "Garder le mien";
  S.fr.refineNeedKey = "Ajoutez d'abord une clé API gratuite dans les Réglages (Gemini, Groq ou OpenRouter).";
  S.fr.refineWorking = "Affinage…";
  S.fr.refineErr = "Affinage impossible :";
  S.fr.refineLabel = "Objectif suggéré (modifiable) :";
  S.fr.mergeOpenBtn = "Studio de fusion →";
  S.fr.mergeTitle = "Studio de fusion";
  S.fr.mergeSub = "Lisez toutes les réponses côte à côte et composez à la main la meilleure version finale. Rien n'est automatique : l'éditeur, c'est vous.";
  S.fr.mergeBase = "Utiliser comme base";
  S.fr.mergeAddSel = "Ajouter la sélection";
  S.fr.mergeAddAll = "Tout ajouter";
  S.fr.mergeHighlight = "Surligner les phrases communes à 2+ modèles";
  S.fr.mergeDraftLabel = "Votre brouillon fusionné";
  S.fr.mergeDraftPh = "Choisissez une base ou ajoutez des sélections depuis les sources…";
  S.fr.mergeCopy = "Copier le brouillon";
  S.fr.mergeClear = "Vider";
  S.fr.mergeWords = "mots";
  S.fr.mergeEmpty = "Aucune sortie - exécutez ou collez d'abord des réponses dans Comparer.";
  S.fr.mergeBack = "← Retour à Comparer";
  S.fr.mergeAddSource = "Ajouter une autre sortie";
  S.fr.mergeSourceName = "Étiquette (ex. GPT-5.6)";
  S.fr.mergeSourcePh = "Collez une sortie obtenue ailleurs…";
  S.fr.mergeSourceAdd = "Ajouter la source";

  S.es.setGuideTitle = "Cómo obtener claves API gratis";
  S.es.setTestBtn = "Probar clave";
  S.es.setTesting = "Comprobando…";
  S.es.setKeyOk = "La clave funciona";
  S.es.setKeyFail = "Comprobación fallida:";
  S.es.setKeyMissing = "Pega primero una clave";
  S.es.themeTip = "Tema: claro → oscuro → sepia";
  S.es.refineBtn = "Refinar con IA";
  S.es.refineHint = "Usa tu clave API gratuita para hacer el objetivo más claro y completo - lo revisas antes de aplicarlo.";
  S.es.refineApply = "Usar esta versión";
  S.es.refineDiscard = "Mantener el mío";
  S.es.refineNeedKey = "Añade primero una clave API gratuita en Ajustes (Gemini, Groq u OpenRouter).";
  S.es.refineWorking = "Refinando…";
  S.es.refineErr = "No se pudo refinar:";
  S.es.refineLabel = "Objetivo sugerido (editable):";
  S.es.mergeOpenBtn = "Estudio de fusión →";
  S.es.mergeTitle = "Estudio de fusión";
  S.es.mergeSub = "Lee todas las respuestas lado a lado y elige a mano lo mejor para un borrador final. Nada es automático: el editor eres tú.";
  S.es.mergeBase = "Usar como base";
  S.es.mergeAddSel = "Añadir selección";
  S.es.mergeAddAll = "Añadir todo";
  S.es.mergeHighlight = "Resaltar frases comunes a 2+ modelos";
  S.es.mergeDraftLabel = "Tu borrador fusionado";
  S.es.mergeDraftPh = "Elige una base o añade selecciones desde las fuentes…";
  S.es.mergeCopy = "Copiar borrador";
  S.es.mergeClear = "Vaciar";
  S.es.mergeWords = "palabras";
  S.es.mergeEmpty = "Sin salidas - ejecuta o pega respuestas en Comparar primero.";
  S.es.mergeBack = "← Volver a Comparar";
  S.es.mergeAddSource = "Añadir otra salida";
  S.es.mergeSourceName = "Etiqueta (p. ej. GPT-5.6)";
  S.es.mergeSourcePh = "Pega una salida obtenida en otro sitio…";
  S.es.mergeSourceAdd = "Añadir fuente";

  S.de.setGuideTitle = "So bekommst du kostenlose API-Schlüssel";
  S.de.setTestBtn = "Schlüssel testen";
  S.de.setTesting = "Prüfe…";
  S.de.setKeyOk = "Schlüssel funktioniert";
  S.de.setKeyFail = "Prüfung fehlgeschlagen:";
  S.de.setKeyMissing = "Zuerst einen Schlüssel einfügen";
  S.de.themeTip = "Design: hell → dunkel → sepia";
  S.de.refineBtn = "Mit KI verfeinern";
  S.de.refineHint = "Nutzt deinen kostenlosen API-Schlüssel, um das Ziel klarer und vollständiger zu machen - du prüfst vor dem Übernehmen.";
  S.de.refineApply = "Diese Version verwenden";
  S.de.refineDiscard = "Meins behalten";
  S.de.refineNeedKey = "Füge zuerst einen kostenlosen API-Schlüssel in den Einstellungen hinzu (Gemini, Groq oder OpenRouter).";
  S.de.refineWorking = "Verfeinere…";
  S.de.refineErr = "Verfeinern fehlgeschlagen:";
  S.de.refineLabel = "Vorgeschlagenes Ziel (bearbeitbar):";
  S.de.mergeOpenBtn = "Merge-Studio →";
  S.de.mergeTitle = "Merge-Studio";
  S.de.mergeSub = "Lies alle Antworten nebeneinander und stelle die besten Teile von Hand zu einem finalen Entwurf zusammen. Nichts ist automatisch - du bleibst der Redakteur.";
  S.de.mergeBase = "Als Basis verwenden";
  S.de.mergeAddSel = "Auswahl hinzufügen";
  S.de.mergeAddAll = "Alles anhängen";
  S.de.mergeHighlight = "Sätze markieren, die 2+ Modelle teilen";
  S.de.mergeDraftLabel = "Dein zusammengeführter Entwurf";
  S.de.mergeDraftPh = "Wähle eine Basis oder füge Auswahlen aus den Quellen hinzu…";
  S.de.mergeCopy = "Entwurf kopieren";
  S.de.mergeClear = "Leeren";
  S.de.mergeWords = "Wörter";
  S.de.mergeEmpty = "Noch keine Ausgaben - führe erst Antworten in Vergleichen aus oder füge sie ein.";
  S.de.mergeBack = "← Zurück zu Vergleichen";
  S.de.mergeAddSource = "Weitere Ausgabe hinzufügen";
  S.de.mergeSourceName = "Bezeichnung (z. B. GPT-5.6)";
  S.de.mergeSourcePh = "Füge eine anderswo erhaltene Ausgabe ein…";
  S.de.mergeSourceAdd = "Quelle hinzufügen";

  S.pt.setGuideTitle = "Como obter chaves de API gratuitas";
  S.pt.setTestBtn = "Testar chave";
  S.pt.setTesting = "Verificando…";
  S.pt.setKeyOk = "A chave funciona";
  S.pt.setKeyFail = "Falha na verificação:";
  S.pt.setKeyMissing = "Cole uma chave primeiro";
  S.pt.themeTip = "Tema: claro → escuro → sépia";
  S.pt.refineBtn = "Refinar com IA";
  S.pt.refineHint = "Usa sua chave de API gratuita para tornar o objetivo mais claro e completo - você revisa antes de aplicar.";
  S.pt.refineApply = "Usar esta versão";
  S.pt.refineDiscard = "Manter o meu";
  S.pt.refineNeedKey = "Adicione primeiro uma chave de API gratuita em Configurações (Gemini, Groq ou OpenRouter).";
  S.pt.refineWorking = "Refinando…";
  S.pt.refineErr = "Não foi possível refinar:";
  S.pt.refineLabel = "Objetivo sugerido (editável):";
  S.pt.mergeOpenBtn = "Estúdio de fusão →";
  S.pt.mergeTitle = "Estúdio de fusão";
  S.pt.mergeSub = "Leia todas as respostas lado a lado e escolha a dedo as melhores partes para um rascunho final. Nada é automático - o editor é você.";
  S.pt.mergeBase = "Usar como base";
  S.pt.mergeAddSel = "Adicionar seleção";
  S.pt.mergeAddAll = "Anexar tudo";
  S.pt.mergeHighlight = "Destacar frases comuns a 2+ modelos";
  S.pt.mergeDraftLabel = "Seu rascunho unificado";
  S.pt.mergeDraftPh = "Escolha uma base ou adicione seleções das fontes…";
  S.pt.mergeCopy = "Copiar rascunho";
  S.pt.mergeClear = "Limpar";
  S.pt.mergeWords = "palavras";
  S.pt.mergeEmpty = "Sem saídas - execute ou cole respostas em Comparar primeiro.";
  S.pt.mergeBack = "← Voltar a Comparar";
  S.pt.mergeAddSource = "Adicionar outra saída";
  S.pt.mergeSourceName = "Rótulo (ex.: GPT-5.6)";
  S.pt.mergeSourcePh = "Cole uma saída obtida em outro lugar…";
  S.pt.mergeSourceAdd = "Adicionar fonte";

  S.zh.setGuideTitle = "如何获取免费 API 密钥";
  S.zh.setTestBtn = "测试密钥";
  S.zh.setTesting = "正在检测…";
  S.zh.setKeyOk = "密钥可用";
  S.zh.setKeyFail = "检测失败：";
  S.zh.setKeyMissing = "请先粘贴密钥";
  S.zh.themeTip = "主题：浅色 → 深色 → 棕褐";
  S.zh.refineBtn = "用 AI 优化";
  S.zh.refineHint = "使用你的免费 API 密钥，让目标更清晰完整：应用前由你审核。";
  S.zh.refineApply = "使用此版本";
  S.zh.refineDiscard = "保留我的";
  S.zh.refineNeedKey = "请先在设置中添加免费 API 密钥（Gemini、Groq 或 OpenRouter）。";
  S.zh.refineWorking = "优化中…";
  S.zh.refineErr = "优化失败：";
  S.zh.refineLabel = "建议的目标（可编辑）：";
  S.zh.mergeOpenBtn = "合并工作台 →";
  S.zh.mergeTitle = "合并工作台";
  S.zh.mergeSub = "并排阅读所有回答，手动挑选最佳部分，合成最终草稿。没有任何自动操作：编辑权在你。";
  S.zh.mergeBase = "设为底稿";
  S.zh.mergeAddSel = "添加所选";
  S.zh.mergeAddAll = "全部追加";
  S.zh.mergeHighlight = "高亮 2 个以上模型共有的句子";
  S.zh.mergeDraftLabel = "你的合并草稿";
  S.zh.mergeDraftPh = "选择一个底稿，或从来源中添加所选内容…";
  S.zh.mergeCopy = "复制草稿";
  S.zh.mergeClear = "清空";
  S.zh.mergeWords = "词";
  S.zh.mergeEmpty = "还没有输出：请先在对比页运行或粘贴回答。";
  S.zh.mergeBack = "← 返回对比";
  S.zh.mergeAddSource = "添加其他输出";
  S.zh.mergeSourceName = "标签（如 GPT-5.6）";
  S.zh.mergeSourcePh = "粘贴你在别处获得的输出…";
  S.zh.mergeSourceAdd = "添加来源";

  S.hi.setGuideTitle = "मुफ़्त API कुंजियाँ कैसे पाएँ";
  S.hi.setTestBtn = "कुंजी जाँचें";
  S.hi.setTesting = "जाँच हो रही है…";
  S.hi.setKeyOk = "कुंजी काम करती है";
  S.hi.setKeyFail = "जाँच विफल:";
  S.hi.setKeyMissing = "पहले कुंजी चिपकाएँ";
  S.hi.themeTip = "थीम: हल्की → गहरी → सीपिया";
  S.hi.refineBtn = "AI से निखारें";
  S.hi.refineHint = "आपकी मुफ़्त API कुंजी से लक्ष्य को स्पष्ट और पूर्ण बनाता है - लागू करने से पहले आप समीक्षा करते हैं।";
  S.hi.refineApply = "यह संस्करण उपयोग करें";
  S.hi.refineDiscard = "मेरा ही रखें";
  S.hi.refineNeedKey = "पहले सेटिंग्स में एक मुफ़्त API कुंजी जोड़ें (Gemini, Groq या OpenRouter)।";
  S.hi.refineWorking = "निखार जारी…";
  S.hi.refineErr = "निखार विफल:";
  S.hi.refineLabel = "सुझाया गया लक्ष्य (संपादन योग्य):";
  S.hi.mergeOpenBtn = "मर्ज स्टूडियो →";
  S.hi.mergeTitle = "मर्ज स्टूडियो";
  S.hi.mergeSub = "सभी उत्तर साथ-साथ पढ़ें और सर्वश्रेष्ठ हिस्से चुनकर एक अंतिम मसौदा बनाएँ। कुछ भी स्वचालित नहीं - संपादक आप हैं।";
  S.hi.mergeBase = "आधार बनाएँ";
  S.hi.mergeAddSel = "चयन जोड़ें";
  S.hi.mergeAddAll = "सब जोड़ें";
  S.hi.mergeHighlight = "2+ मॉडलों में साझा वाक्य हाइलाइट करें";
  S.hi.mergeDraftLabel = "आपका मर्ज किया मसौदा";
  S.hi.mergeDraftPh = "एक आधार चुनें या स्रोतों से चयन जोड़ें…";
  S.hi.mergeCopy = "मसौदा कॉपी करें";
  S.hi.mergeClear = "खाली करें";
  S.hi.mergeWords = "शब्द";
  S.hi.mergeEmpty = "अभी कोई आउटपुट नहीं - पहले तुलना में उत्तर चलाएँ या चिपकाएँ।";
  S.hi.mergeBack = "← तुलना पर लौटें";
  S.hi.mergeAddSource = "एक और आउटपुट जोड़ें";
  S.hi.mergeSourceName = "लेबल (जैसे GPT-5.6)";
  S.hi.mergeSourcePh = "कहीं और मिला आउटपुट चिपकाएँ…";
  S.hi.mergeSourceAdd = "स्रोत जोड़ें";

  S.ru.setGuideTitle = "Как получить бесплатные API-ключи";
  S.ru.setTestBtn = "Проверить ключ";
  S.ru.setTesting = "Проверка…";
  S.ru.setKeyOk = "Ключ работает";
  S.ru.setKeyFail = "Проверка не удалась:";
  S.ru.setKeyMissing = "Сначала вставьте ключ";
  S.ru.themeTip = "Тема: светлая → тёмная → сепия";
  S.ru.refineBtn = "Улучшить с ИИ";
  S.ru.refineHint = "Использует ваш бесплатный API-ключ, чтобы сделать цель яснее и полнее - вы проверяете перед применением.";
  S.ru.refineApply = "Использовать эту версию";
  S.ru.refineDiscard = "Оставить мою";
  S.ru.refineNeedKey = "Сначала добавьте бесплатный API-ключ в настройках (Gemini, Groq или OpenRouter).";
  S.ru.refineWorking = "Улучшение…";
  S.ru.refineErr = "Не удалось улучшить:";
  S.ru.refineLabel = "Предложенная цель (можно править):";
  S.ru.mergeOpenBtn = "Студия слияния →";
  S.ru.mergeTitle = "Студия слияния";
  S.ru.mergeSub = "Читайте все ответы рядом и вручную собирайте лучшее в один финальный черновик. Ничего автоматического - редактор здесь вы.";
  S.ru.mergeBase = "Взять за основу";
  S.ru.mergeAddSel = "Добавить выделенное";
  S.ru.mergeAddAll = "Добавить всё";
  S.ru.mergeHighlight = "Подсветить фразы, общие для 2+ моделей";
  S.ru.mergeDraftLabel = "Ваш объединённый черновик";
  S.ru.mergeDraftPh = "Выберите основу или добавляйте выделенное из источников…";
  S.ru.mergeCopy = "Копировать черновик";
  S.ru.mergeClear = "Очистить";
  S.ru.mergeWords = "слов";
  S.ru.mergeEmpty = "Пока нет ответов - сначала запустите или вставьте их в «Сравнить».";
  S.ru.mergeBack = "← Назад к сравнению";
  S.ru.mergeAddSource = "Добавить ещё один ответ";
  S.ru.mergeSourceName = "Метка (напр. GPT-5.6)";
  S.ru.mergeSourcePh = "Вставьте ответ, полученный в другом месте…";
  S.ru.mergeSourceAdd = "Добавить источник";

  S.ja.setGuideTitle = "無料APIキーの入手方法";
  S.ja.setTestBtn = "キーをテスト";
  S.ja.setTesting = "確認中…";
  S.ja.setKeyOk = "キーは有効です";
  S.ja.setKeyFail = "確認に失敗：";
  S.ja.setKeyMissing = "先にキーを貼り付けてください";
  S.ja.themeTip = "テーマ：ライト → ダーク → セピア";
  S.ja.refineBtn = "AIで磨き上げる";
  S.ja.refineHint = "無料のAPIキーを使って目標をより明確で完全にします。適用前にあなたが確認します。";
  S.ja.refineApply = "この案を使う";
  S.ja.refineDiscard = "自分の案を残す";
  S.ja.refineNeedKey = "先に設定で無料APIキーを追加してください（Gemini、Groq、OpenRouter）。";
  S.ja.refineWorking = "調整中…";
  S.ja.refineErr = "調整できませんでした：";
  S.ja.refineLabel = "提案された目標（編集可）：";
  S.ja.mergeOpenBtn = "マージスタジオ →";
  S.ja.mergeTitle = "マージスタジオ";
  S.ja.mergeSub = "すべての回答を並べて読み、良い部分を手作業で選んで最終ドラフトに。自動処理は一切なし。編集者はあなたです。";
  S.ja.mergeBase = "ベースにする";
  S.ja.mergeAddSel = "選択部分を追加";
  S.ja.mergeAddAll = "全文を追加";
  S.ja.mergeHighlight = "2つ以上のモデルに共通する文をハイライト";
  S.ja.mergeDraftLabel = "統合ドラフト";
  S.ja.mergeDraftPh = "ベースを選ぶか、ソースから選択部分を追加…";
  S.ja.mergeCopy = "ドラフトをコピー";
  S.ja.mergeClear = "クリア";
  S.ja.mergeWords = "語";
  S.ja.mergeEmpty = "まだ出力がありません。先に比較で回答を実行または貼り付けてください。";
  S.ja.mergeBack = "← 比較に戻る";
  S.ja.mergeAddSource = "別の出力を追加";
  S.ja.mergeSourceName = "ラベル（例：GPT-5.6）";
  S.ja.mergeSourcePh = "他所で得た出力を貼り付け…";
  S.ja.mergeSourceAdd = "ソースを追加";

  S.ar.setGuideTitle = "كيفية الحصول على مفاتيح API مجانية";
  S.ar.setTestBtn = "اختبار المفتاح";
  S.ar.setTesting = "جارٍ الفحص…";
  S.ar.setKeyOk = "المفتاح يعمل";
  S.ar.setKeyFail = "فشل الفحص:";
  S.ar.setKeyMissing = "الصق مفتاحًا أولًا";
  S.ar.themeTip = "السمة: فاتح → داكن → بُنّي";
  S.ar.refineBtn = "تحسين بالذكاء الاصطناعي";
  S.ar.refineHint = "يستخدم مفتاح API المجاني الخاص بك لجعل الهدف أوضح وأكمل - أنت تراجع قبل التطبيق.";
  S.ar.refineApply = "استخدم هذه النسخة";
  S.ar.refineDiscard = "احتفظ بنسختي";
  S.ar.refineNeedKey = "أضف أولًا مفتاح API مجانيًا في الإعدادات (Gemini أو Groq أو OpenRouter).";
  S.ar.refineWorking = "جارٍ التحسين…";
  S.ar.refineErr = "تعذّر التحسين:";
  S.ar.refineLabel = "الهدف المقترح (قابل للتعديل):";
  S.ar.mergeOpenBtn = "استوديو الدمج ←";
  S.ar.mergeTitle = "استوديو الدمج";
  S.ar.mergeSub = "اقرأ كل الإجابات جنبًا إلى جنب واختر يدويًا أفضل الأجزاء في مسودة نهائية واحدة. لا شيء تلقائي - أنت المحرر.";
  S.ar.mergeBase = "اجعله الأساس";
  S.ar.mergeAddSel = "أضف التحديد";
  S.ar.mergeAddAll = "أضف الكل";
  S.ar.mergeHighlight = "إبراز الجمل المشتركة بين نموذجين أو أكثر";
  S.ar.mergeDraftLabel = "مسودتك المدمجة";
  S.ar.mergeDraftPh = "اختر أساسًا أو أضف تحديدات من المصادر…";
  S.ar.mergeCopy = "انسخ المسودة";
  S.ar.mergeClear = "مسح";
  S.ar.mergeWords = "كلمات";
  S.ar.mergeEmpty = "لا مخرجات بعد - شغّل أو الصق الإجابات في «قارن» أولًا.";
  S.ar.mergeBack = "← الرجوع إلى المقارنة";
  S.ar.mergeAddSource = "أضف مخرجًا آخر";
  S.ar.mergeSourceName = "تسمية (مثل GPT-5.6)";
  S.ar.mergeSourcePh = "الصق مخرجًا حصلت عليه في مكان آخر…";
  S.ar.mergeSourceAdd = "أضف المصدر";


  /* ---------------- v0.22: finder, glossary, model compare, footer, roadmap ---------------- */

  S.en.footFaq = "FAQ";
  S.en.footSimilar = "Similar tools";
  S.en.footContribute = "Contribute";
  S.en.footGlossary = "Glossary";
  S.en.modeGoal = "Describe a goal";
  S.en.modeFinder = "Guided finder";
  S.en.finderTitle = "Find the right AI";
  S.en.finderSub = "Answer a few quick questions - get a recommendation with reasons, limits and pricing. No prompt needed.";
  S.en.finderBack = "← Back";
  S.en.finderNext = "Next";
  S.en.finderRestart = "Start over";
  S.en.finderResults = "Our recommendation";
  S.en.finderAlt = "Also worth considering";
  S.en.finderWhy = "Why this pick";
  S.en.finderBestFor = "Best for:";
  S.en.finderLimit = "Keep in mind:";
  S.en.finderAccess = "Access:";
  S.en.finderOpenGuide = "Open in Model guide →";
  S.en.finderUseGen = "Write a prompt for it →";
  S.en.finderSwitchGoal = "Prefer to describe your goal? Switch to prompt mode →";
  S.en.finderTop = "Top match";
  S.en.glossTitle = "AI glossary";
  S.en.glossSub = "Every AI term in plain words - one sentence each, examples included.";
  S.en.glossSearchPh = "Search terms…";
  S.en.glossNoRes = "No matching term.";
  S.en.glossCount = "terms";
  S.en.cmpTabOutputs = "Output comparison";
  S.en.cmpTabSpecs = "Model comparison";
  S.en.mcTitle = "Compare models on paper";
  S.en.mcSub = "Pick two or three models and compare scores, context, price and strengths - no API calls needed.";
  S.en.mcAdd = "+ Add a third model";
  S.en.mcRemove = "Remove";
  S.en.mcOpenGuide = "Open in guide →";
  S.en.mcProvider = "Provider";
  S.en.mcStatus = "Status";
  S.en.mcScore = "AA index";
  S.en.mcReleased = "Released";
  S.en.mcCtx = "Context window";
  S.en.mcModal = "Modalities";
  S.en.mcPrice = "API price $/1M (in / out)";
  S.en.mcSpeed = "Speed";
  S.en.mcAccess = "Access";
  S.en.mcProfile = "Category profile";
  S.en.mcStrengths = "Strengths";
  S.en.mcReview = "In one line";
  S.en.mcFootnote = "n/a = not published or not yet verified (checked July 19, 2026). Scores marked ~ are WhichAI estimates - never read small differences between an estimate and a measured score as real.";
  S.en.insightsTitle = "Market at a glance";
  S.en.chartTopTitle = "Top models - intelligence index";
  S.en.chartPpTitle = "Price vs performance";
  S.en.chainMapTitle = "Workflow roadmap";
  S.en.chainAddStep = "+ Add step";
  S.en.chainMoveUp = "Move step up";
  S.en.chainMoveDown = "Move step down";
  S.en.chainRemoveStep = "Remove step";
  S.en.specCompareBtn = "Compare →";
  S.en.compareSub = "Two ways to compare: run the models' real outputs side by side, or compare models on paper from the database.";

  S.it.footFaq = "FAQ";
  S.it.footSimilar = "Strumenti simili";
  S.it.footContribute = "Contribuisci";
  S.it.footGlossary = "Glossario";
  S.it.modeGoal = "Descrivi un obiettivo";
  S.it.modeFinder = "Percorso guidato";
  S.it.finderTitle = "Trova l'AI giusta";
  S.it.finderSub = "Rispondi a poche domande rapide: ottieni un consiglio con motivi, limiti e prezzi. Nessun prompt necessario.";
  S.it.finderBack = "← Indietro";
  S.it.finderNext = "Avanti";
  S.it.finderRestart = "Ricomincia";
  S.it.finderResults = "Il nostro consiglio";
  S.it.finderAlt = "Da considerare anche";
  S.it.finderWhy = "Perché questa scelta";
  S.it.finderBestFor = "Ideale per:";
  S.it.finderLimit = "Da sapere:";
  S.it.finderAccess = "Accesso:";
  S.it.finderOpenGuide = "Apri nella Model guide →";
  S.it.finderUseGen = "Scrivi un prompt per questa AI →";
  S.it.finderSwitchGoal = "Preferisci descrivere l'obiettivo? Passa alla modalità prompt →";
  S.it.finderTop = "Scelta migliore";
  S.it.glossTitle = "Glossario AI";
  S.it.glossSub = "Ogni termine AI in parole semplici: una frase ciascuno, con esempi.";
  S.it.glossSearchPh = "Cerca un termine…";
  S.it.glossNoRes = "Nessun termine trovato.";
  S.it.glossCount = "termini";
  S.it.cmpTabOutputs = "Confronto output";
  S.it.cmpTabSpecs = "Confronto modelli";
  S.it.mcTitle = "Confronta i modelli sulla carta";
  S.it.mcSub = "Scegli due o tre modelli e confronta punteggi, contesto, prezzi e punti di forza - senza chiamate API.";
  S.it.mcAdd = "+ Aggiungi un terzo modello";
  S.it.mcRemove = "Rimuovi";
  S.it.mcOpenGuide = "Apri nella guida →";
  S.it.mcProvider = "Fornitore";
  S.it.mcStatus = "Stato";
  S.it.mcScore = "Indice AA";
  S.it.mcReleased = "Uscita";
  S.it.mcCtx = "Finestra di contesto";
  S.it.mcModal = "Modalità";
  S.it.mcPrice = "Prezzo API $/1M (in / out)";
  S.it.mcSpeed = "Velocità";
  S.it.mcAccess = "Accesso";
  S.it.mcProfile = "Profilo per categoria";
  S.it.mcStrengths = "Punti di forza";
  S.it.mcReview = "In una riga";
  S.it.mcFootnote = "n/a = non pubblicato o non ancora verificato (controllo del 19 luglio 2026). I punteggi con ~ sono stime WhichAI: mai leggere piccole differenze tra una stima e un punteggio misurato come reali.";
  S.it.insightsTitle = "Il mercato a colpo d'occhio";
  S.it.chartTopTitle = "Modelli top - indice di intelligenza";
  S.it.chartPpTitle = "Prezzo vs prestazioni";
  S.it.chainMapTitle = "Roadmap del flusso";
  S.it.chainAddStep = "+ Aggiungi step";
  S.it.chainMoveUp = "Sposta su";
  S.it.chainMoveDown = "Sposta giù";
  S.it.chainRemoveStep = "Rimuovi step";
  S.it.specCompareBtn = "Confronta →";
  S.it.compareSub = "Due modi di confrontare: esegui gli output reali dei modelli fianco a fianco, oppure confronta i modelli sulla carta dal database.";

  S.fr.footFaq = "FAQ";
  S.fr.footSimilar = "Outils similaires";
  S.fr.footContribute = "Contribuer";
  S.fr.footGlossary = "Glossaire";
  S.fr.modeGoal = "Décrire un objectif";
  S.fr.modeFinder = "Parcours guidé";
  S.fr.finderTitle = "Trouvez la bonne IA";
  S.fr.finderSub = "Répondez à quelques questions rapides : une recommandation avec raisons, limites et prix. Aucun prompt requis.";
  S.fr.finderBack = "← Retour";
  S.fr.finderNext = "Suivant";
  S.fr.finderRestart = "Recommencer";
  S.fr.finderResults = "Notre recommandation";
  S.fr.finderAlt = "À considérer aussi";
  S.fr.finderWhy = "Pourquoi ce choix";
  S.fr.finderBestFor = "Idéal pour :";
  S.fr.finderLimit = "À savoir :";
  S.fr.finderAccess = "Accès :";
  S.fr.finderOpenGuide = "Ouvrir dans le Model guide →";
  S.fr.finderUseGen = "Écrire un prompt pour cette IA →";
  S.fr.finderSwitchGoal = "Vous préférez décrire votre objectif ? Passez en mode prompt →";
  S.fr.finderTop = "Meilleur choix";
  S.fr.glossTitle = "Glossaire IA";
  S.fr.glossSub = "Chaque terme IA en mots simples : une phrase chacun, avec exemples.";
  S.fr.glossSearchPh = "Rechercher un terme…";
  S.fr.glossNoRes = "Aucun terme trouvé.";
  S.fr.glossCount = "termes";
  S.fr.cmpTabOutputs = "Comparaison des réponses";
  S.fr.cmpTabSpecs = "Comparaison des modèles";
  S.fr.mcTitle = "Comparer les modèles sur le papier";
  S.fr.mcSub = "Choisissez deux ou trois modèles et comparez scores, contexte, prix et forces - sans appel API.";
  S.fr.mcAdd = "+ Ajouter un troisième modèle";
  S.fr.mcRemove = "Retirer";
  S.fr.mcOpenGuide = "Ouvrir dans le guide →";
  S.fr.mcProvider = "Fournisseur";
  S.fr.mcStatus = "Statut";
  S.fr.mcScore = "Indice AA";
  S.fr.mcReleased = "Sortie";
  S.fr.mcCtx = "Fenêtre de contexte";
  S.fr.mcModal = "Modalités";
  S.fr.mcPrice = "Prix API $/1M (in / out)";
  S.fr.mcSpeed = "Vitesse";
  S.fr.mcAccess = "Accès";
  S.fr.mcProfile = "Profil par catégorie";
  S.fr.mcStrengths = "Points forts";
  S.fr.mcReview = "En une ligne";
  S.fr.mcFootnote = "n/a = non publié ou non vérifié (contrôle du 19 juillet 2026). Les scores marqués ~ sont des estimations WhichAI : ne lisez jamais de petits écarts entre une estimation et un score mesuré comme réels.";
  S.fr.insightsTitle = "Le marché en un coup d'œil";
  S.fr.chartTopTitle = "Meilleurs modèles - indice d'intelligence";
  S.fr.chartPpTitle = "Prix vs performance";
  S.fr.chainMapTitle = "Feuille de route du flux";
  S.fr.chainAddStep = "+ Ajouter une étape";
  S.fr.chainMoveUp = "Monter l'étape";
  S.fr.chainMoveDown = "Descendre l'étape";
  S.fr.chainRemoveStep = "Supprimer l'étape";
  S.fr.specCompareBtn = "Comparer →";
  S.fr.compareSub = "Deux façons de comparer : exécutez les réponses réelles côte à côte, ou comparez les modèles sur le papier depuis la base.";

  S.es.footFaq = "FAQ";
  S.es.footSimilar = "Herramientas similares";
  S.es.footContribute = "Contribuir";
  S.es.footGlossary = "Glosario";
  S.es.modeGoal = "Describir un objetivo";
  S.es.modeFinder = "Asistente guiado";
  S.es.finderTitle = "Encuentra la IA adecuada";
  S.es.finderSub = "Responde unas preguntas rápidas: recibirás una recomendación con motivos, límites y precios. Sin necesidad de prompt.";
  S.es.finderBack = "← Atrás";
  S.es.finderNext = "Siguiente";
  S.es.finderRestart = "Empezar de nuevo";
  S.es.finderResults = "Nuestra recomendación";
  S.es.finderAlt = "También a considerar";
  S.es.finderWhy = "Por qué esta elección";
  S.es.finderBestFor = "Ideal para:";
  S.es.finderLimit = "Ten en cuenta:";
  S.es.finderAccess = "Acceso:";
  S.es.finderOpenGuide = "Abrir en la Model guide →";
  S.es.finderUseGen = "Escribir un prompt para esta IA →";
  S.es.finderSwitchGoal = "¿Prefieres describir tu objetivo? Cambia al modo prompt →";
  S.es.finderTop = "Mejor opción";
  S.es.glossTitle = "Glosario de IA";
  S.es.glossSub = "Cada término de IA en palabras sencillas: una frase cada uno, con ejemplos.";
  S.es.glossSearchPh = "Buscar término…";
  S.es.glossNoRes = "Ningún término coincide.";
  S.es.glossCount = "términos";
  S.es.cmpTabOutputs = "Comparar respuestas";
  S.es.cmpTabSpecs = "Comparar modelos";
  S.es.mcTitle = "Compara modelos sobre el papel";
  S.es.mcSub = "Elige dos o tres modelos y compara puntuaciones, contexto, precios y fortalezas - sin llamadas a la API.";
  S.es.mcAdd = "+ Añadir un tercer modelo";
  S.es.mcRemove = "Quitar";
  S.es.mcOpenGuide = "Abrir en la guía →";
  S.es.mcProvider = "Proveedor";
  S.es.mcStatus = "Estado";
  S.es.mcScore = "Índice AA";
  S.es.mcReleased = "Lanzamiento";
  S.es.mcCtx = "Ventana de contexto";
  S.es.mcModal = "Modalidades";
  S.es.mcPrice = "Precio API $/1M (in / out)";
  S.es.mcSpeed = "Velocidad";
  S.es.mcAccess = "Acceso";
  S.es.mcProfile = "Perfil por categoría";
  S.es.mcStrengths = "Fortalezas";
  S.es.mcReview = "En una línea";
  S.es.mcFootnote = "n/a = no publicado o sin verificar (comprobado el 19 de julio de 2026). Las puntuaciones con ~ son estimaciones de WhichAI: nunca tomes pequeñas diferencias entre una estimación y una medición como reales.";
  S.es.insightsTitle = "El mercado de un vistazo";
  S.es.chartTopTitle = "Mejores modelos - índice de inteligencia";
  S.es.chartPpTitle = "Precio vs rendimiento";
  S.es.chainMapTitle = "Hoja de ruta del flujo";
  S.es.chainAddStep = "+ Añadir paso";
  S.es.chainMoveUp = "Subir paso";
  S.es.chainMoveDown = "Bajar paso";
  S.es.chainRemoveStep = "Eliminar paso";
  S.es.specCompareBtn = "Comparar →";
  S.es.compareSub = "Dos formas de comparar: ejecuta las respuestas reales lado a lado, o compara los modelos sobre el papel desde la base de datos.";

  S.de.footFaq = "FAQ";
  S.de.footSimilar = "Ähnliche Tools";
  S.de.footContribute = "Mitmachen";
  S.de.footGlossary = "Glossar";
  S.de.modeGoal = "Ziel beschreiben";
  S.de.modeFinder = "Geführte Suche";
  S.de.finderTitle = "Finde die richtige KI";
  S.de.finderSub = "Beantworte ein paar kurze Fragen - du bekommst eine Empfehlung mit Gründen, Grenzen und Preisen. Ganz ohne Prompt.";
  S.de.finderBack = "← Zurück";
  S.de.finderNext = "Weiter";
  S.de.finderRestart = "Neu starten";
  S.de.finderResults = "Unsere Empfehlung";
  S.de.finderAlt = "Auch eine Überlegung wert";
  S.de.finderWhy = "Warum diese Wahl";
  S.de.finderBestFor = "Ideal für:";
  S.de.finderLimit = "Zu beachten:";
  S.de.finderAccess = "Zugang:";
  S.de.finderOpenGuide = "Im Model guide öffnen →";
  S.de.finderUseGen = "Prompt für diese KI schreiben →";
  S.de.finderSwitchGoal = "Lieber das Ziel selbst beschreiben? Zum Prompt-Modus wechseln →";
  S.de.finderTop = "Beste Wahl";
  S.de.glossTitle = "KI-Glossar";
  S.de.glossSub = "Jeder KI-Begriff in einfachen Worten: je ein Satz, mit Beispielen.";
  S.de.glossSearchPh = "Begriff suchen…";
  S.de.glossNoRes = "Kein passender Begriff.";
  S.de.glossCount = "Begriffe";
  S.de.cmpTabOutputs = "Antworten vergleichen";
  S.de.cmpTabSpecs = "Modelle vergleichen";
  S.de.mcTitle = "Modelle auf dem Papier vergleichen";
  S.de.mcSub = "Wähle zwei oder drei Modelle und vergleiche Scores, Kontext, Preise und Stärken - ganz ohne API-Aufrufe.";
  S.de.mcAdd = "+ Drittes Modell hinzufügen";
  S.de.mcRemove = "Entfernen";
  S.de.mcOpenGuide = "Im Guide öffnen →";
  S.de.mcProvider = "Anbieter";
  S.de.mcStatus = "Status";
  S.de.mcScore = "AA-Index";
  S.de.mcReleased = "Erschienen";
  S.de.mcCtx = "Kontextfenster";
  S.de.mcModal = "Modalitäten";
  S.de.mcPrice = "API-Preis $/1M (in / out)";
  S.de.mcSpeed = "Tempo";
  S.de.mcAccess = "Zugang";
  S.de.mcProfile = "Kategorienprofil";
  S.de.mcStrengths = "Stärken";
  S.de.mcReview = "In einer Zeile";
  S.de.mcFootnote = "n/a = nicht veröffentlicht oder noch nicht verifiziert (Stand 19. Juli 2026). Scores mit ~ sind WhichAI-Schätzungen: kleine Unterschiede zwischen Schätzung und Messung nie als real lesen.";
  S.de.insightsTitle = "Der Markt auf einen Blick";
  S.de.chartTopTitle = "Top-Modelle - Intelligenz-Index";
  S.de.chartPpTitle = "Preis vs. Leistung";
  S.de.chainMapTitle = "Workflow-Roadmap";
  S.de.chainAddStep = "+ Schritt hinzufügen";
  S.de.chainMoveUp = "Schritt nach oben";
  S.de.chainMoveDown = "Schritt nach unten";
  S.de.chainRemoveStep = "Schritt entfernen";
  S.de.specCompareBtn = "Vergleichen →";
  S.de.compareSub = "Zwei Wege zu vergleichen: echte Antworten nebeneinander ausführen - oder Modelle auf dem Papier aus der Datenbank vergleichen.";

  S.pt.footFaq = "FAQ";
  S.pt.footSimilar = "Ferramentas semelhantes";
  S.pt.footContribute = "Contribuir";
  S.pt.footGlossary = "Glossário";
  S.pt.modeGoal = "Descrever um objetivo";
  S.pt.modeFinder = "Assistente guiado";
  S.pt.finderTitle = "Encontre a IA certa";
  S.pt.finderSub = "Responda a algumas perguntas rápidas: receba uma recomendação com motivos, limites e preços. Sem precisar de prompt.";
  S.pt.finderBack = "← Voltar";
  S.pt.finderNext = "Avançar";
  S.pt.finderRestart = "Recomeçar";
  S.pt.finderResults = "Nossa recomendação";
  S.pt.finderAlt = "Também vale considerar";
  S.pt.finderWhy = "Por que esta escolha";
  S.pt.finderBestFor = "Ideal para:";
  S.pt.finderLimit = "Atenção:";
  S.pt.finderAccess = "Acesso:";
  S.pt.finderOpenGuide = "Abrir no Model guide →";
  S.pt.finderUseGen = "Escrever um prompt para esta IA →";
  S.pt.finderSwitchGoal = "Prefere descrever seu objetivo? Mude para o modo prompt →";
  S.pt.finderTop = "Melhor escolha";
  S.pt.glossTitle = "Glossário de IA";
  S.pt.glossSub = "Cada termo de IA em palavras simples: uma frase cada, com exemplos.";
  S.pt.glossSearchPh = "Pesquisar termo…";
  S.pt.glossNoRes = "Nenhum termo encontrado.";
  S.pt.glossCount = "termos";
  S.pt.cmpTabOutputs = "Comparar respostas";
  S.pt.cmpTabSpecs = "Comparar modelos";
  S.pt.mcTitle = "Compare modelos no papel";
  S.pt.mcSub = "Escolha dois ou três modelos e compare pontuações, contexto, preços e pontos fortes - sem chamadas de API.";
  S.pt.mcAdd = "+ Adicionar um terceiro modelo";
  S.pt.mcRemove = "Remover";
  S.pt.mcOpenGuide = "Abrir no guia →";
  S.pt.mcProvider = "Fornecedor";
  S.pt.mcStatus = "Status";
  S.pt.mcScore = "Índice AA";
  S.pt.mcReleased = "Lançamento";
  S.pt.mcCtx = "Janela de contexto";
  S.pt.mcModal = "Modalidades";
  S.pt.mcPrice = "Preço API $/1M (in / out)";
  S.pt.mcSpeed = "Velocidade";
  S.pt.mcAccess = "Acesso";
  S.pt.mcProfile = "Perfil por categoria";
  S.pt.mcStrengths = "Pontos fortes";
  S.pt.mcReview = "Em uma linha";
  S.pt.mcFootnote = "n/a = não publicado ou ainda não verificado (checado em 19 de julho de 2026). Pontuações com ~ são estimativas do WhichAI: nunca leia pequenas diferenças entre estimativa e medição como reais.";
  S.pt.insightsTitle = "O mercado num relance";
  S.pt.chartTopTitle = "Melhores modelos - índice de inteligência";
  S.pt.chartPpTitle = "Preço vs desempenho";
  S.pt.chainMapTitle = "Roteiro do fluxo";
  S.pt.chainAddStep = "+ Adicionar etapa";
  S.pt.chainMoveUp = "Subir etapa";
  S.pt.chainMoveDown = "Descer etapa";
  S.pt.chainRemoveStep = "Remover etapa";
  S.pt.specCompareBtn = "Comparar →";
  S.pt.compareSub = "Duas formas de comparar: execute as respostas reais lado a lado, ou compare os modelos no papel a partir do banco de dados.";

  S.zh.footFaq = "常见问题";
  S.zh.footSimilar = "同类工具";
  S.zh.footContribute = "参与贡献";
  S.zh.footGlossary = "术语表";
  S.zh.modeGoal = "描述目标";
  S.zh.modeFinder = "引导式选择";
  S.zh.finderTitle = "找到合适的 AI";
  S.zh.finderSub = "回答几个简短问题，即可获得推荐，包含理由、限制与价格。无需编写提示词。";
  S.zh.finderBack = "← 返回";
  S.zh.finderNext = "下一步";
  S.zh.finderRestart = "重新开始";
  S.zh.finderResults = "我们的推荐";
  S.zh.finderAlt = "也值得考虑";
  S.zh.finderWhy = "推荐理由";
  S.zh.finderBestFor = "最适合：";
  S.zh.finderLimit = "注意：";
  S.zh.finderAccess = "访问方式：";
  S.zh.finderOpenGuide = "在模型指南中打开 →";
  S.zh.finderUseGen = "为它生成提示词 →";
  S.zh.finderSwitchGoal = "想自己描述目标？切换到提示词模式 →";
  S.zh.finderTop = "最佳匹配";
  S.zh.glossTitle = "AI 术语表";
  S.zh.glossSub = "用最简单的话解释每个 AI 术语：每条一句话，附示例。";
  S.zh.glossSearchPh = "搜索术语…";
  S.zh.glossNoRes = "没有匹配的术语。";
  S.zh.glossCount = "个术语";
  S.zh.cmpTabOutputs = "输出对比";
  S.zh.cmpTabSpecs = "模型对比";
  S.zh.mcTitle = "纸面对比模型";
  S.zh.mcSub = "选择两到三个模型，对比分数、上下文、价格与优势：无需调用 API。";
  S.zh.mcAdd = "+ 添加第三个模型";
  S.zh.mcRemove = "移除";
  S.zh.mcOpenGuide = "在指南中打开 →";
  S.zh.mcProvider = "提供商";
  S.zh.mcStatus = "状态";
  S.zh.mcScore = "AA 指数";
  S.zh.mcReleased = "发布时间";
  S.zh.mcCtx = "上下文窗口";
  S.zh.mcModal = "模态";
  S.zh.mcPrice = "API 价格 $/1M（输入/输出）";
  S.zh.mcSpeed = "速度";
  S.zh.mcAccess = "访问方式";
  S.zh.mcProfile = "分类能力";
  S.zh.mcStrengths = "优势";
  S.zh.mcReview = "一句话点评";
  S.zh.mcFootnote = "n/a = 未公布或尚未核实（2026 年 7 月 19 日检查）。带 ~ 的分数为 WhichAI 估计值：不要把估计值与实测分数之间的细微差异当作真实差距。";
  S.zh.insightsTitle = "市场一览";
  S.zh.chartTopTitle = "顶级模型：智能指数";
  S.zh.chartPpTitle = "价格与性能";
  S.zh.chainMapTitle = "工作流路线图";
  S.zh.chainAddStep = "+ 添加步骤";
  S.zh.chainMoveUp = "上移步骤";
  S.zh.chainMoveDown = "下移步骤";
  S.zh.chainRemoveStep = "删除步骤";
  S.zh.specCompareBtn = "对比 →";
  S.zh.compareSub = "两种对比方式：并排运行模型的真实输出，或基于数据库进行纸面对比。";

  S.hi.footFaq = "सामान्य प्रश्न";
  S.hi.footSimilar = "मिलते-जुलते टूल";
  S.hi.footContribute = "योगदान करें";
  S.hi.footGlossary = "शब्दावली";
  S.hi.modeGoal = "लक्ष्य बताएं";
  S.hi.modeFinder = "गाइडेड फ़ाइंडर";
  S.hi.finderTitle = "सही AI चुनें";
  S.hi.finderSub = "कुछ छोटे सवालों के जवाब दें - कारण, सीमाएँ और कीमत के साथ सिफ़ारिश पाएं। प्रॉम्प्ट की ज़रूरत नहीं।";
  S.hi.finderBack = "← पीछे";
  S.hi.finderNext = "आगे";
  S.hi.finderRestart = "फिर से शुरू करें";
  S.hi.finderResults = "हमारी सिफ़ारिश";
  S.hi.finderAlt = "इन पर भी विचार करें";
  S.hi.finderWhy = "यह चुनाव क्यों";
  S.hi.finderBestFor = "सबसे उपयुक्त:";
  S.hi.finderLimit = "ध्यान रखें:";
  S.hi.finderAccess = "एक्सेस:";
  S.hi.finderOpenGuide = "Model guide में खोलें →";
  S.hi.finderUseGen = "इसके लिए प्रॉम्प्ट लिखें →";
  S.hi.finderSwitchGoal = "खुद लक्ष्य लिखना चाहते हैं? प्रॉम्प्ट मोड पर जाएँ →";
  S.hi.finderTop = "सर्वश्रेष्ठ विकल्प";
  S.hi.glossTitle = "AI शब्दावली";
  S.hi.glossSub = "हर AI शब्द आसान भाषा में - एक-एक वाक्य, उदाहरण सहित।";
  S.hi.glossSearchPh = "शब्द खोजें…";
  S.hi.glossNoRes = "कोई शब्द नहीं मिला।";
  S.hi.glossCount = "शब्द";
  S.hi.cmpTabOutputs = "आउटपुट तुलना";
  S.hi.cmpTabSpecs = "मॉडल तुलना";
  S.hi.mcTitle = "कागज़ पर मॉडलों की तुलना";
  S.hi.mcSub = "दो या तीन मॉडल चुनें और स्कोर, कॉन्टेक्स्ट, कीमत और ताकत की तुलना करें - बिना API कॉल के।";
  S.hi.mcAdd = "+ तीसरा मॉडल जोड़ें";
  S.hi.mcRemove = "हटाएँ";
  S.hi.mcOpenGuide = "गाइड में खोलें →";
  S.hi.mcProvider = "प्रदाता";
  S.hi.mcStatus = "स्थिति";
  S.hi.mcScore = "AA सूचकांक";
  S.hi.mcReleased = "रिलीज़";
  S.hi.mcCtx = "कॉन्टेक्स्ट विंडो";
  S.hi.mcModal = "मोडैलिटी";
  S.hi.mcPrice = "API कीमत $/1M (इन/आउट)";
  S.hi.mcSpeed = "गति";
  S.hi.mcAccess = "एक्सेस";
  S.hi.mcProfile = "श्रेणी प्रोफ़ाइल";
  S.hi.mcStrengths = "ताकत";
  S.hi.mcReview = "एक पंक्ति में";
  S.hi.mcFootnote = "n/a = प्रकाशित नहीं या अभी सत्यापित नहीं (19 जुलाई 2026 को जाँचा गया)। ~ वाले स्कोर WhichAI के अनुमान हैं: अनुमान और मापे गए स्कोर के छोटे अंतर को वास्तविक न मानें।";
  S.hi.insightsTitle = "बाज़ार एक नज़र में";
  S.hi.chartTopTitle = "शीर्ष मॉडल - इंटेलिजेंस इंडेक्स";
  S.hi.chartPpTitle = "कीमत बनाम प्रदर्शन";
  S.hi.chainMapTitle = "वर्कफ़्लो रोडमैप";
  S.hi.chainAddStep = "+ स्टेप जोड़ें";
  S.hi.chainMoveUp = "स्टेप ऊपर करें";
  S.hi.chainMoveDown = "स्टेप नीचे करें";
  S.hi.chainRemoveStep = "स्टेप हटाएँ";
  S.hi.specCompareBtn = "तुलना करें →";
  S.hi.compareSub = "तुलना के दो तरीके: मॉडलों के असली आउटपुट साथ-साथ चलाएँ, या डेटाबेस से कागज़ पर मॉडलों की तुलना करें।";

  S.ru.footFaq = "FAQ";
  S.ru.footSimilar = "Похожие инструменты";
  S.ru.footContribute = "Внести вклад";
  S.ru.footGlossary = "Глоссарий";
  S.ru.modeGoal = "Описать цель";
  S.ru.modeFinder = "Подбор по вопросам";
  S.ru.finderTitle = "Найдите подходящий ИИ";
  S.ru.finderSub = "Ответьте на несколько коротких вопросов - получите рекомендацию с причинами, ограничениями и ценами. Промпт не нужен.";
  S.ru.finderBack = "← Назад";
  S.ru.finderNext = "Далее";
  S.ru.finderRestart = "Начать заново";
  S.ru.finderResults = "Наша рекомендация";
  S.ru.finderAlt = "Также стоит рассмотреть";
  S.ru.finderWhy = "Почему этот выбор";
  S.ru.finderBestFor = "Лучше всего для:";
  S.ru.finderLimit = "Имейте в виду:";
  S.ru.finderAccess = "Доступ:";
  S.ru.finderOpenGuide = "Открыть в Model guide →";
  S.ru.finderUseGen = "Написать промпт для него →";
  S.ru.finderSwitchGoal = "Хотите описать цель сами? Перейти в режим промпта →";
  S.ru.finderTop = "Лучший вариант";
  S.ru.glossTitle = "Глоссарий ИИ";
  S.ru.glossSub = "Каждый термин ИИ простыми словами: по одному предложению, с примерами.";
  S.ru.glossSearchPh = "Поиск термина…";
  S.ru.glossNoRes = "Термин не найден.";
  S.ru.glossCount = "терминов";
  S.ru.cmpTabOutputs = "Сравнение ответов";
  S.ru.cmpTabSpecs = "Сравнение моделей";
  S.ru.mcTitle = "Сравните модели на бумаге";
  S.ru.mcSub = "Выберите две-три модели и сравните оценки, контекст, цены и сильные стороны - без вызовов API.";
  S.ru.mcAdd = "+ Добавить третью модель";
  S.ru.mcRemove = "Убрать";
  S.ru.mcOpenGuide = "Открыть в гиде →";
  S.ru.mcProvider = "Провайдер";
  S.ru.mcStatus = "Статус";
  S.ru.mcScore = "Индекс AA";
  S.ru.mcReleased = "Выпуск";
  S.ru.mcCtx = "Контекстное окно";
  S.ru.mcModal = "Модальности";
  S.ru.mcPrice = "Цена API $/1M (вход / выход)";
  S.ru.mcSpeed = "Скорость";
  S.ru.mcAccess = "Доступ";
  S.ru.mcProfile = "Профиль по категориям";
  S.ru.mcStrengths = "Сильные стороны";
  S.ru.mcReview = "Одной строкой";
  S.ru.mcFootnote = "n/a = не опубликовано или ещё не проверено (проверка 19 июля 2026). Оценки с ~ - это оценки WhichAI: не принимайте малые различия между оценкой и измерением за реальные.";
  S.ru.insightsTitle = "Рынок одним взглядом";
  S.ru.chartTopTitle = "Лучшие модели - индекс интеллекта";
  S.ru.chartPpTitle = "Цена и производительность";
  S.ru.chainMapTitle = "Дорожная карта процесса";
  S.ru.chainAddStep = "+ Добавить шаг";
  S.ru.chainMoveUp = "Шаг выше";
  S.ru.chainMoveDown = "Шаг ниже";
  S.ru.chainRemoveStep = "Удалить шаг";
  S.ru.specCompareBtn = "Сравнить →";
  S.ru.compareSub = "Два способа сравнения: запустите реальные ответы моделей бок о бок или сравните модели на бумаге по базе данных.";

  S.ja.footFaq = "よくある質問";
  S.ja.footSimilar = "類似ツール";
  S.ja.footContribute = "貢献する";
  S.ja.footGlossary = "用語集";
  S.ja.modeGoal = "目標を書く";
  S.ja.modeFinder = "ガイド付き診断";
  S.ja.finderTitle = "最適なAIを見つける";
  S.ja.finderSub = "いくつかの簡単な質問に答えるだけで、理由・制限・価格つきのおすすめが得られます。プロンプトは不要です。";
  S.ja.finderBack = "← 戻る";
  S.ja.finderNext = "次へ";
  S.ja.finderRestart = "最初からやり直す";
  S.ja.finderResults = "おすすめ";
  S.ja.finderAlt = "こちらも検討";
  S.ja.finderWhy = "選んだ理由";
  S.ja.finderBestFor = "最適な用途：";
  S.ja.finderLimit = "注意点：";
  S.ja.finderAccess = "利用方法：";
  S.ja.finderOpenGuide = "Model guideで開く →";
  S.ja.finderUseGen = "このAI用のプロンプトを作る →";
  S.ja.finderSwitchGoal = "自分で目標を書きたい場合は、プロンプトモードへ →";
  S.ja.finderTop = "ベストマッチ";
  S.ja.glossTitle = "AI用語集";
  S.ja.glossSub = "AI用語をやさしい言葉で。各用語1文＋例つき。";
  S.ja.glossSearchPh = "用語を検索…";
  S.ja.glossNoRes = "該当する用語がありません。";
  S.ja.glossCount = "件の用語";
  S.ja.cmpTabOutputs = "出力の比較";
  S.ja.cmpTabSpecs = "モデルの比較";
  S.ja.mcTitle = "スペックでモデルを比較";
  S.ja.mcSub = "2〜3個のモデルを選んで、スコア・コンテキスト・価格・強みを比較。API呼び出しは不要です。";
  S.ja.mcAdd = "+ 3つ目のモデルを追加";
  S.ja.mcRemove = "削除";
  S.ja.mcOpenGuide = "ガイドで開く →";
  S.ja.mcProvider = "提供元";
  S.ja.mcStatus = "ステータス";
  S.ja.mcScore = "AA指数";
  S.ja.mcReleased = "リリース";
  S.ja.mcCtx = "コンテキストウィンドウ";
  S.ja.mcModal = "モダリティ";
  S.ja.mcPrice = "API価格 $/1M（入力/出力）";
  S.ja.mcSpeed = "速度";
  S.ja.mcAccess = "利用方法";
  S.ja.mcProfile = "カテゴリ別プロフィール";
  S.ja.mcStrengths = "強み";
  S.ja.mcReview = "ひとことで";
  S.ja.mcFootnote = "n/a = 未公表または未検証（2026年7月19日確認）。~付きスコアはWhichAIの推定値です。推定値と実測値のわずかな差を実際の差と読まないでください。";
  S.ja.insightsTitle = "市場をひと目で";
  S.ja.chartTopTitle = "トップモデル - 知能指数";
  S.ja.chartPpTitle = "価格 vs 性能";
  S.ja.chainMapTitle = "ワークフロー・ロードマップ";
  S.ja.chainAddStep = "+ ステップを追加";
  S.ja.chainMoveUp = "上へ移動";
  S.ja.chainMoveDown = "下へ移動";
  S.ja.chainRemoveStep = "ステップを削除";
  S.ja.specCompareBtn = "比較 →";
  S.ja.compareSub = "比較は2通り：モデルの実際の出力を並べて実行するか、データベースからスペックで比較するか。";

  S.ar.footFaq = "الأسئلة الشائعة";
  S.ar.footSimilar = "أدوات مشابهة";
  S.ar.footContribute = "ساهم";
  S.ar.footGlossary = "المسرد";
  S.ar.modeGoal = "صف هدفك";
  S.ar.modeFinder = "مرشد موجَّه";
  S.ar.finderTitle = "اعثر على الذكاء الاصطناعي المناسب";
  S.ar.finderSub = "أجب عن بضعة أسئلة سريعة لتحصل على توصية مع الأسباب والحدود والأسعار. لا حاجة إلى موجّه.";
  S.ar.finderBack = "رجوع";
  S.ar.finderNext = "التالي";
  S.ar.finderRestart = "ابدأ من جديد";
  S.ar.finderResults = "توصيتنا";
  S.ar.finderAlt = "خيارات أخرى جديرة بالنظر";
  S.ar.finderWhy = "لماذا هذا الاختيار";
  S.ar.finderBestFor = "الأفضل لـ:";
  S.ar.finderLimit = "ضع في اعتبارك:";
  S.ar.finderAccess = "الوصول:";
  S.ar.finderOpenGuide = "افتح في دليل النماذج";
  S.ar.finderUseGen = "اكتب موجّهًا له";
  S.ar.finderSwitchGoal = "تفضّل وصف هدفك بنفسك؟ انتقل إلى وضع الموجّه";
  S.ar.finderTop = "الخيار الأفضل";
  S.ar.glossTitle = "مسرد الذكاء الاصطناعي";
  S.ar.glossSub = "كل مصطلح بكلمات بسيطة: جملة واحدة لكل مصطلح، مع أمثلة.";
  S.ar.glossSearchPh = "ابحث عن مصطلح…";
  S.ar.glossNoRes = "لا يوجد مصطلح مطابق.";
  S.ar.glossCount = "مصطلحًا";
  S.ar.cmpTabOutputs = "مقارنة المخرجات";
  S.ar.cmpTabSpecs = "مقارنة النماذج";
  S.ar.mcTitle = "قارن النماذج على الورق";
  S.ar.mcSub = "اختر نموذجين أو ثلاثة وقارن الدرجات والسياق والأسعار ونقاط القوة - دون استدعاءات API.";
  S.ar.mcAdd = "+ أضف نموذجًا ثالثًا";
  S.ar.mcRemove = "إزالة";
  S.ar.mcOpenGuide = "افتح في الدليل";
  S.ar.mcProvider = "المزوّد";
  S.ar.mcStatus = "الحالة";
  S.ar.mcScore = "مؤشر AA";
  S.ar.mcReleased = "الإصدار";
  S.ar.mcCtx = "نافذة السياق";
  S.ar.mcModal = "الوسائط";
  S.ar.mcPrice = "سعر API $/1M (إدخال/إخراج)";
  S.ar.mcSpeed = "السرعة";
  S.ar.mcAccess = "الوصول";
  S.ar.mcProfile = "الملف حسب الفئة";
  S.ar.mcStrengths = "نقاط القوة";
  S.ar.mcReview = "في سطر واحد";
  S.ar.mcFootnote = "n/a = غير منشور أو لم يُتحقق منه بعد (فُحص في 19 يوليو 2026). الدرجات المميزة بـ ~ تقديرات من WhichAI: لا تقرأ الفروق الصغيرة بين تقدير وقياس فعلي على أنها حقيقية.";
  S.ar.insightsTitle = "السوق في لمحة";
  S.ar.chartTopTitle = "أفضل النماذج - مؤشر الذكاء";
  S.ar.chartPpTitle = "السعر مقابل الأداء";
  S.ar.chainMapTitle = "خارطة سير العمل";
  S.ar.chainAddStep = "+ أضف خطوة";
  S.ar.chainMoveUp = "انقل الخطوة لأعلى";
  S.ar.chainMoveDown = "انقل الخطوة لأسفل";
  S.ar.chainRemoveStep = "احذف الخطوة";
  S.ar.specCompareBtn = "قارن";
  S.ar.compareSub = "طريقتان للمقارنة: شغّل المخرجات الفعلية للنماذج جنبًا إلى جنب، أو قارن النماذج على الورق من قاعدة البيانات.";

  S.en.compareTitle = "Compare";
  S.it.compareTitle = "Confronta";
  S.fr.compareTitle = "Comparer";
  S.es.compareTitle = "Comparar";
  S.de.compareTitle = "Vergleichen";
  S.pt.compareTitle = "Comparar";
  S.zh.compareTitle = "对比";
  S.hi.compareTitle = "तुलना";
  S.ru.compareTitle = "Сравнение";
  S.ja.compareTitle = "比較";
  S.ar.compareTitle = "المقارنة";


  /* ---------------- v0.23: key storage, data backup, update toast ---------------- */

  S.en.keymodeLabel = "Where to keep API keys";
  S.en.keymodeSession = "This session only (safer)";
  S.en.keymodeLocal = "Saved on this device";
  S.en.keymodeHint = "Keys never reach any WhichAI server (there is none). Session-only forgets them when the browser closes; saving on this device uses browser storage, which any script on this page could read, so it stays opt-in.";
  S.en.keysClear = "Clear all API keys";
  S.en.keysCleared = "Keys removed from this browser.";
  S.en.dataTitle = "Your data";
  S.en.dataHint = "Everything WhichAI saves lives in this browser: preferences, comparisons, chains, merge drafts and (if you chose so) API keys. Export a backup before switching device or clearing the browser.";
  S.en.dataExport = "Export backup (.json)";
  S.en.dataImport = "Import backup";
  S.en.dataWipe = "Delete all data";
  S.en.dataWipeAsk = "Delete ALL WhichAI data in this browser? Comparisons, chains, preferences and keys will be removed.";
  S.en.dataImportAsk = "Import this backup? Existing data with the same names will be overwritten.";
  S.en.dataImported = "Backup imported. Reloading.";
  S.en.dataImportBad = "Invalid backup file.";
  S.en.updateReady = "A new version of WhichAI is ready.";
  S.en.updateReload = "Refresh";

  S.it.keymodeLabel = "Dove tenere le chiavi API";
  S.it.keymodeSession = "Solo questa sessione (più sicuro)";
  S.it.keymodeLocal = "Salvate su questo dispositivo";
  S.it.keymodeHint = "Le chiavi non raggiungono mai un server WhichAI (non esiste). Con la modalità sessione si cancellano alla chiusura del browser; salvarle sul dispositivo usa lo storage del browser, leggibile da qualsiasi script su questa pagina, quindi resta una scelta esplicita.";
  S.it.keysClear = "Cancella tutte le chiavi API";
  S.it.keysCleared = "Chiavi rimosse da questo browser.";
  S.it.dataTitle = "I tuoi dati";
  S.it.dataHint = "Tutto ciò che WhichAI salva vive in questo browser: preferenze, confronti, catene, bozze e (se lo hai scelto) chiavi API. Esporta un backup prima di cambiare dispositivo o pulire il browser.";
  S.it.dataExport = "Esporta backup (.json)";
  S.it.dataImport = "Importa backup";
  S.it.dataWipe = "Elimina tutti i dati";
  S.it.dataWipeAsk = "Eliminare TUTTI i dati WhichAI in questo browser? Confronti, catene, preferenze e chiavi verranno rimossi.";
  S.it.dataImportAsk = "Importare questo backup? I dati esistenti con lo stesso nome verranno sovrascritti.";
  S.it.dataImported = "Backup importato. Ricarico.";
  S.it.dataImportBad = "File di backup non valido.";
  S.it.updateReady = "È pronta una nuova versione di WhichAI.";
  S.it.updateReload = "Aggiorna";

  S.fr.keymodeLabel = "Où conserver les clés API";
  S.fr.keymodeSession = "Cette session seulement (plus sûr)";
  S.fr.keymodeLocal = "Enregistrées sur cet appareil";
  S.fr.keymodeHint = "Les clés n'atteignent jamais un serveur WhichAI (il n'y en a pas). En mode session, elles disparaissent à la fermeture du navigateur ; l'enregistrement sur l'appareil utilise le stockage du navigateur, lisible par tout script de cette page, donc il reste optionnel.";
  S.fr.keysClear = "Effacer toutes les clés API";
  S.fr.keysCleared = "Clés supprimées de ce navigateur.";
  S.fr.dataTitle = "Vos données";
  S.fr.dataHint = "Tout ce que WhichAI enregistre vit dans ce navigateur : préférences, comparaisons, chaînes, brouillons et (si vous l'avez choisi) clés API. Exportez une sauvegarde avant de changer d'appareil.";
  S.fr.dataExport = "Exporter la sauvegarde (.json)";
  S.fr.dataImport = "Importer une sauvegarde";
  S.fr.dataWipe = "Supprimer toutes les données";
  S.fr.dataWipeAsk = "Supprimer TOUTES les données WhichAI de ce navigateur ? Comparaisons, chaînes, préférences et clés seront effacées.";
  S.fr.dataImportAsk = "Importer cette sauvegarde ? Les données existantes portant le même nom seront écrasées.";
  S.fr.dataImported = "Sauvegarde importée. Rechargement.";
  S.fr.dataImportBad = "Fichier de sauvegarde invalide.";
  S.fr.updateReady = "Une nouvelle version de WhichAI est prête.";
  S.fr.updateReload = "Actualiser";

  S.es.keymodeLabel = "Dónde guardar las claves API";
  S.es.keymodeSession = "Solo esta sesión (más seguro)";
  S.es.keymodeLocal = "Guardadas en este dispositivo";
  S.es.keymodeHint = "Las claves nunca llegan a un servidor de WhichAI (no existe). En modo sesión se borran al cerrar el navegador; guardarlas en el dispositivo usa el almacenamiento del navegador, legible por cualquier script de esta página, así que es una elección explícita.";
  S.es.keysClear = "Borrar todas las claves API";
  S.es.keysCleared = "Claves eliminadas de este navegador.";
  S.es.dataTitle = "Tus datos";
  S.es.dataHint = "Todo lo que WhichAI guarda vive en este navegador: preferencias, comparaciones, cadenas, borradores y (si lo elegiste) claves API. Exporta una copia antes de cambiar de dispositivo.";
  S.es.dataExport = "Exportar copia (.json)";
  S.es.dataImport = "Importar copia";
  S.es.dataWipe = "Eliminar todos los datos";
  S.es.dataWipeAsk = "¿Eliminar TODOS los datos de WhichAI en este navegador? Se borrarán comparaciones, cadenas, preferencias y claves.";
  S.es.dataImportAsk = "¿Importar esta copia? Los datos existentes con el mismo nombre se sobrescribirán.";
  S.es.dataImported = "Copia importada. Recargando.";
  S.es.dataImportBad = "Archivo de copia no válido.";
  S.es.updateReady = "Hay una nueva versión de WhichAI lista.";
  S.es.updateReload = "Actualizar";

  S.de.keymodeLabel = "Wo API-Schlüssel liegen sollen";
  S.de.keymodeSession = "Nur diese Sitzung (sicherer)";
  S.de.keymodeLocal = "Auf diesem Gerät gespeichert";
  S.de.keymodeHint = "Schlüssel erreichen nie einen WhichAI-Server (es gibt keinen). Im Sitzungsmodus verschwinden sie beim Schließen des Browsers; das Speichern auf dem Gerät nutzt den Browser-Speicher, den jedes Skript dieser Seite lesen könnte, deshalb bleibt es Opt-in.";
  S.de.keysClear = "Alle API-Schlüssel löschen";
  S.de.keysCleared = "Schlüssel aus diesem Browser entfernt.";
  S.de.dataTitle = "Deine Daten";
  S.de.dataHint = "Alles, was WhichAI speichert, lebt in diesem Browser: Einstellungen, Vergleiche, Chains, Entwürfe und (falls gewählt) API-Schlüssel. Exportiere ein Backup, bevor du das Gerät wechselst.";
  S.de.dataExport = "Backup exportieren (.json)";
  S.de.dataImport = "Backup importieren";
  S.de.dataWipe = "Alle Daten löschen";
  S.de.dataWipeAsk = "ALLE WhichAI-Daten in diesem Browser löschen? Vergleiche, Chains, Einstellungen und Schlüssel werden entfernt.";
  S.de.dataImportAsk = "Dieses Backup importieren? Vorhandene Daten mit gleichem Namen werden überschrieben.";
  S.de.dataImported = "Backup importiert. Neu laden.";
  S.de.dataImportBad = "Ungültige Backup-Datei.";
  S.de.updateReady = "Eine neue Version von WhichAI ist bereit.";
  S.de.updateReload = "Aktualisieren";

  S.pt.keymodeLabel = "Onde guardar as chaves API";
  S.pt.keymodeSession = "Só esta sessão (mais seguro)";
  S.pt.keymodeLocal = "Salvas neste dispositivo";
  S.pt.keymodeHint = "As chaves nunca chegam a um servidor do WhichAI (não existe). No modo sessão, somem ao fechar o navegador; salvá-las no dispositivo usa o armazenamento do navegador, legível por qualquer script desta página, então é uma escolha explícita.";
  S.pt.keysClear = "Apagar todas as chaves API";
  S.pt.keysCleared = "Chaves removidas deste navegador.";
  S.pt.dataTitle = "Seus dados";
  S.pt.dataHint = "Tudo o que o WhichAI salva vive neste navegador: preferências, comparações, cadeias, rascunhos e (se você escolheu) chaves API. Exporte um backup antes de trocar de dispositivo.";
  S.pt.dataExport = "Exportar backup (.json)";
  S.pt.dataImport = "Importar backup";
  S.pt.dataWipe = "Excluir todos os dados";
  S.pt.dataWipeAsk = "Excluir TODOS os dados do WhichAI neste navegador? Comparações, cadeias, preferências e chaves serão removidas.";
  S.pt.dataImportAsk = "Importar este backup? Dados existentes com o mesmo nome serão sobrescritos.";
  S.pt.dataImported = "Backup importado. Recarregando.";
  S.pt.dataImportBad = "Arquivo de backup inválido.";
  S.pt.updateReady = "Uma nova versão do WhichAI está pronta.";
  S.pt.updateReload = "Atualizar";

  S.zh.keymodeLabel = "API 密钥保存位置";
  S.zh.keymodeSession = "仅本次会话（更安全）";
  S.zh.keymodeLocal = "保存在此设备上";
  S.zh.keymodeHint = "密钥绝不会发送到 WhichAI 服务器（根本没有服务器）。会话模式下关闭浏览器即清除；保存在设备上会使用浏览器存储，本页面的任何脚本都可能读取，因此需要你主动选择。";
  S.zh.keysClear = "清除所有 API 密钥";
  S.zh.keysCleared = "已从此浏览器移除密钥。";
  S.zh.dataTitle = "你的数据";
  S.zh.dataHint = "WhichAI 保存的一切都在此浏览器中：偏好、对比、链、草稿以及（如你选择）API 密钥。换设备或清理浏览器前请先导出备份。";
  S.zh.dataExport = "导出备份 (.json)";
  S.zh.dataImport = "导入备份";
  S.zh.dataWipe = "删除所有数据";
  S.zh.dataWipeAsk = "删除此浏览器中的全部 WhichAI 数据？对比、链、偏好和密钥都将被移除。";
  S.zh.dataImportAsk = "导入此备份？同名的现有数据将被覆盖。";
  S.zh.dataImported = "备份已导入，正在刷新。";
  S.zh.dataImportBad = "备份文件无效。";
  S.zh.updateReady = "WhichAI 新版本已就绪。";
  S.zh.updateReload = "刷新";

  S.hi.keymodeLabel = "API कुंजियाँ कहाँ रखें";
  S.hi.keymodeSession = "केवल इस सत्र में (अधिक सुरक्षित)";
  S.hi.keymodeLocal = "इस डिवाइस पर सहेजें";
  S.hi.keymodeHint = "कुंजियाँ कभी किसी WhichAI सर्वर तक नहीं जातीं (सर्वर है ही नहीं)। सत्र मोड में ब्राउज़र बंद करते ही मिट जाती हैं; डिवाइस पर सहेजना ब्राउज़र स्टोरेज उपयोग करता है, जिसे इस पेज की कोई भी स्क्रिप्ट पढ़ सकती है, इसलिए यह आपकी स्पष्ट पसंद पर है।";
  S.hi.keysClear = "सभी API कुंजियाँ हटाएँ";
  S.hi.keysCleared = "कुंजियाँ इस ब्राउज़र से हटा दी गईं।";
  S.hi.dataTitle = "आपका डेटा";
  S.hi.dataHint = "WhichAI जो कुछ सहेजता है वह इसी ब्राउज़र में रहता है: प्राथमिकताएँ, तुलनाएँ, चेन, ड्राफ़्ट और (यदि चुना हो) API कुंजियाँ। डिवाइस बदलने से पहले बैकअप निर्यात करें।";
  S.hi.dataExport = "बैकअप निर्यात करें (.json)";
  S.hi.dataImport = "बैकअप आयात करें";
  S.hi.dataWipe = "सारा डेटा हटाएँ";
  S.hi.dataWipeAsk = "इस ब्राउज़र का सारा WhichAI डेटा हटाएँ? तुलनाएँ, चेन, प्राथमिकताएँ और कुंजियाँ हट जाएँगी।";
  S.hi.dataImportAsk = "यह बैकअप आयात करें? समान नाम का मौजूदा डेटा अधिलेखित होगा।";
  S.hi.dataImported = "बैकअप आयात हुआ। रीलोड हो रहा है।";
  S.hi.dataImportBad = "अमान्य बैकअप फ़ाइल।";
  S.hi.updateReady = "WhichAI का नया संस्करण तैयार है।";
  S.hi.updateReload = "रीफ़्रेश";

  S.ru.keymodeLabel = "Где хранить API-ключи";
  S.ru.keymodeSession = "Только эта сессия (безопаснее)";
  S.ru.keymodeLocal = "Сохранить на этом устройстве";
  S.ru.keymodeHint = "Ключи никогда не попадают на сервер WhichAI (его нет). В режиме сессии они исчезают при закрытии браузера; сохранение на устройстве использует хранилище браузера, доступное любому скрипту этой страницы, поэтому это осознанный выбор.";
  S.ru.keysClear = "Удалить все API-ключи";
  S.ru.keysCleared = "Ключи удалены из этого браузера.";
  S.ru.dataTitle = "Ваши данные";
  S.ru.dataHint = "Всё, что сохраняет WhichAI, живёт в этом браузере: настройки, сравнения, цепочки, черновики и (если вы выбрали) API-ключи. Экспортируйте резервную копию перед сменой устройства.";
  S.ru.dataExport = "Экспорт копии (.json)";
  S.ru.dataImport = "Импорт копии";
  S.ru.dataWipe = "Удалить все данные";
  S.ru.dataWipeAsk = "Удалить ВСЕ данные WhichAI в этом браузере? Сравнения, цепочки, настройки и ключи будут удалены.";
  S.ru.dataImportAsk = "Импортировать эту копию? Существующие данные с теми же именами будут перезаписаны.";
  S.ru.dataImported = "Копия импортирована. Перезагрузка.";
  S.ru.dataImportBad = "Недопустимый файл копии.";
  S.ru.updateReady = "Новая версия WhichAI готова.";
  S.ru.updateReload = "Обновить";

  S.ja.keymodeLabel = "APIキーの保存場所";
  S.ja.keymodeSession = "このセッションのみ（より安全）";
  S.ja.keymodeLocal = "この端末に保存";
  S.ja.keymodeHint = "キーがWhichAIのサーバーに送られることはありません（サーバー自体がありません）。セッションのみの場合、ブラウザを閉じると消えます。端末への保存はブラウザのストレージを使い、このページのスクリプトから読める可能性があるため、明示的な選択制です。";
  S.ja.keysClear = "すべてのAPIキーを削除";
  S.ja.keysCleared = "このブラウザからキーを削除しました。";
  S.ja.dataTitle = "あなたのデータ";
  S.ja.dataHint = "WhichAIが保存するものはすべてこのブラウザ内にあります：設定、比較、チェーン、下書き、（選択した場合）APIキー。端末を変える前にバックアップを書き出してください。";
  S.ja.dataExport = "バックアップを書き出す (.json)";
  S.ja.dataImport = "バックアップを読み込む";
  S.ja.dataWipe = "すべてのデータを削除";
  S.ja.dataWipeAsk = "このブラウザのWhichAIデータをすべて削除しますか？比較、チェーン、設定、キーが削除されます。";
  S.ja.dataImportAsk = "このバックアップを読み込みますか？同名の既存データは上書きされます。";
  S.ja.dataImported = "バックアップを読み込みました。再読み込みします。";
  S.ja.dataImportBad = "無効なバックアップファイルです。";
  S.ja.updateReady = "WhichAIの新しいバージョンが利用できます。";
  S.ja.updateReload = "更新";

  S.ar.keymodeLabel = "أين تُحفظ مفاتيح API";
  S.ar.keymodeSession = "هذه الجلسة فقط (أكثر أمانًا)";
  S.ar.keymodeLocal = "محفوظة على هذا الجهاز";
  S.ar.keymodeHint = "المفاتيح لا تصل أبدًا إلى خادم WhichAI (لا يوجد خادم أصلًا). في وضع الجلسة تُمحى عند إغلاق المتصفح؛ الحفظ على الجهاز يستخدم تخزين المتصفح الذي يمكن لأي سكربت في هذه الصفحة قراءته، لذا يبقى خيارًا صريحًا.";
  S.ar.keysClear = "امسح كل مفاتيح API";
  S.ar.keysCleared = "أُزيلت المفاتيح من هذا المتصفح.";
  S.ar.dataTitle = "بياناتك";
  S.ar.dataHint = "كل ما يحفظه WhichAI يعيش في هذا المتصفح: التفضيلات والمقارنات والسلاسل والمسودات و(إن اخترت) مفاتيح API. صدّر نسخة احتياطية قبل تغيير الجهاز.";
  S.ar.dataExport = "تصدير نسخة احتياطية (.json)";
  S.ar.dataImport = "استيراد نسخة احتياطية";
  S.ar.dataWipe = "احذف كل البيانات";
  S.ar.dataWipeAsk = "حذف كل بيانات WhichAI في هذا المتصفح؟ ستُزال المقارنات والسلاسل والتفضيلات والمفاتيح.";
  S.ar.dataImportAsk = "استيراد هذه النسخة؟ ستُستبدل البيانات الحالية التي تحمل الأسماء نفسها.";
  S.ar.dataImported = "تم استيراد النسخة. جارٍ التحديث.";
  S.ar.dataImportBad = "ملف نسخة احتياطية غير صالح.";
  S.ar.updateReady = "نسخة جديدة من WhichAI جاهزة.";
  S.ar.updateReload = "تحديث";


  /* ---------------- v0.24: More menu, demo, stack optimizer, prompt doctor ---------------- */

  S.en.navMore = "More ▾";
  S.en.navStack = "Stack Optimizer";
  S.en.navDoctor = "Prompt Doctor";
  S.en.navChainsSub = "Multi-step workflows, one model per step";
  S.en.navStackSub = "Which subscriptions to keep, what to use free";
  S.en.navDoctorSub = "Score a prompt, see the optimized version";
  S.en.navGlossarySub = "Every AI term in one plain sentence";
  S.en.navAboutSub = "FAQ, methodology, similar tools";
  S.en.navSettingsSub = "Free API keys, your data, backup";
  S.en.demoTitle = "Example result";
  S.en.demoBest = "Best pick:";
  S.en.demoAlt = "Free alternative:";
  S.en.demoTry = "Try this example";
  S.en.demoYours = "Get yours in 30 seconds";
  S.en.stackTitle = "AI Stack Optimizer";
  S.en.stackSub = "Four quick choices: which subscription is worth keeping, what to use free, and what you can cancel. All on your device.";
  S.en.stackGo = "Build my stack";
  S.en.stackPickOne = "Pick at least one task first.";
  S.en.stackResult = "Your recommended stack";
  S.en.stackNewCost = "estimated monthly cost of the recommended stack";
  S.en.stackCurrentCost = "You currently pay:";
  S.en.stackSaving = "estimated saving";
  S.en.stackRedundant = "Possibly redundant for your tasks:";
  S.en.stackFreeTier = "Free tier";
  S.en.stackToFinder = "Need a single pick instead? Take the finder";
  S.en.doctorTitle = "Prompt Doctor";
  S.en.doctorSub = "Paste a prompt: get a score, a checklist of what is missing, and an optimized version for the model you choose. No API needed.";
  S.en.doctorPh = "Paste your prompt here…";
  S.en.doctorGo = "Analyze prompt";
  S.en.doctorDetected = "Detected task:";
  S.en.doctorMissingLead = "Biggest gaps:";
  S.en.doctorAllGood = "Solid prompt: all core ingredients are present.";
  S.en.doctorChecklist = "Checklist";
  S.en.doctorOptimized = "Optimized version";
  S.en.doctorBefore = "Your prompt";
  S.en.doctorAfter = "Optimized for the selected model";
  S.en.doctorChanges = "What changed and why";
  S.en.doctorToGen = "Open in Generator";
  S.en.doctorNote = "Static analysis based on prompt-engineering best practices; the optimized version uses the same engine as the Generator. Review before using.";

  S.it.navMore = "Altro ▾";
  S.it.navStack = "Stack Optimizer";
  S.it.navDoctor = "Prompt Doctor";
  S.it.navChainsSub = "Flussi multi-step, un modello per passo";
  S.it.navStackSub = "Quali abbonamenti tenere, cosa usare gratis";
  S.it.navDoctorSub = "Valuta un prompt, vedi la versione ottimizzata";
  S.it.navGlossarySub = "Ogni termine AI in una frase semplice";
  S.it.navAboutSub = "FAQ, metodologia, strumenti simili";
  S.it.navSettingsSub = "Chiavi API gratuite, dati, backup";
  S.it.demoTitle = "Risultato di esempio";
  S.it.demoBest = "Scelta migliore:";
  S.it.demoAlt = "Alternativa gratuita:";
  S.it.demoTry = "Prova questo esempio";
  S.it.demoYours = "Il tuo in 30 secondi";
  S.it.stackTitle = "AI Stack Optimizer";
  S.it.stackSub = "Quattro scelte rapide: quale abbonamento vale la pena, cosa usare gratis e cosa puoi disdire. Tutto sul tuo dispositivo.";
  S.it.stackGo = "Costruisci il mio stack";
  S.it.stackPickOne = "Scegli prima almeno un'attività.";
  S.it.stackResult = "Il tuo stack consigliato";
  S.it.stackNewCost = "costo mensile stimato dello stack consigliato";
  S.it.stackCurrentCost = "Oggi paghi:";
  S.it.stackSaving = "risparmio stimato";
  S.it.stackRedundant = "Forse ridondanti per le tue attività:";
  S.it.stackFreeTier = "Piano gratuito";
  S.it.stackToFinder = "Ti serve una sola scelta? Usa il finder";
  S.it.doctorTitle = "Prompt Doctor";
  S.it.doctorSub = "Incolla un prompt: ottieni un punteggio, la lista di cosa manca e una versione ottimizzata per il modello che scegli. Senza API.";
  S.it.doctorPh = "Incolla qui il tuo prompt…";
  S.it.doctorGo = "Analizza il prompt";
  S.it.doctorDetected = "Attività rilevata:";
  S.it.doctorMissingLead = "Lacune principali:";
  S.it.doctorAllGood = "Prompt solido: ci sono tutti gli ingredienti fondamentali.";
  S.it.doctorChecklist = "Checklist";
  S.it.doctorOptimized = "Versione ottimizzata";
  S.it.doctorBefore = "Il tuo prompt";
  S.it.doctorAfter = "Ottimizzato per il modello scelto";
  S.it.doctorChanges = "Cosa è cambiato e perché";
  S.it.doctorToGen = "Apri nel Generator";
  S.it.doctorNote = "Analisi statica basata sulle best practice di prompt engineering; la versione ottimizzata usa lo stesso engine del Generator. Rivedi prima di usare.";

  S.fr.navMore = "Plus ▾";
  S.fr.navStack = "Stack Optimizer";
  S.fr.navDoctor = "Prompt Doctor";
  S.fr.navChainsSub = "Flux multi-étapes, un modèle par étape";
  S.fr.navStackSub = "Quels abonnements garder, quoi utiliser gratuitement";
  S.fr.navDoctorSub = "Notez un prompt, voyez la version optimisée";
  S.fr.navGlossarySub = "Chaque terme IA en une phrase simple";
  S.fr.navAboutSub = "FAQ, méthodologie, outils similaires";
  S.fr.navSettingsSub = "Clés API gratuites, données, sauvegarde";
  S.fr.demoTitle = "Résultat d'exemple";
  S.fr.demoBest = "Meilleur choix :";
  S.fr.demoAlt = "Alternative gratuite :";
  S.fr.demoTry = "Essayer cet exemple";
  S.fr.demoYours = "Le vôtre en 30 secondes";
  S.fr.stackTitle = "AI Stack Optimizer";
  S.fr.stackSub = "Quatre choix rapides : quel abonnement garder, quoi utiliser gratuitement, quoi résilier. Tout sur votre appareil.";
  S.fr.stackGo = "Construire mon stack";
  S.fr.stackPickOne = "Choisissez d'abord au moins une tâche.";
  S.fr.stackResult = "Votre stack recommandé";
  S.fr.stackNewCost = "coût mensuel estimé du stack recommandé";
  S.fr.stackCurrentCost = "Vous payez actuellement :";
  S.fr.stackSaving = "économie estimée";
  S.fr.stackRedundant = "Peut-être redondants pour vos tâches :";
  S.fr.stackFreeTier = "Offre gratuite";
  S.fr.stackToFinder = "Un seul choix suffit ? Utilisez le finder";
  S.fr.doctorTitle = "Prompt Doctor";
  S.fr.doctorSub = "Collez un prompt : score, liste de ce qui manque et version optimisée pour le modèle choisi. Sans API.";
  S.fr.doctorPh = "Collez votre prompt ici…";
  S.fr.doctorGo = "Analyser le prompt";
  S.fr.doctorDetected = "Tâche détectée :";
  S.fr.doctorMissingLead = "Principales lacunes :";
  S.fr.doctorAllGood = "Prompt solide : tous les ingrédients essentiels sont là.";
  S.fr.doctorChecklist = "Checklist";
  S.fr.doctorOptimized = "Version optimisée";
  S.fr.doctorBefore = "Votre prompt";
  S.fr.doctorAfter = "Optimisé pour le modèle choisi";
  S.fr.doctorChanges = "Ce qui a changé et pourquoi";
  S.fr.doctorToGen = "Ouvrir dans le Generator";
  S.fr.doctorNote = "Analyse statique fondée sur les bonnes pratiques de prompt engineering ; la version optimisée utilise le même moteur que le Generator. Relisez avant usage.";

  S.es.navMore = "Más ▾";
  S.es.navStack = "Stack Optimizer";
  S.es.navDoctor = "Prompt Doctor";
  S.es.navChainsSub = "Flujos multi-paso, un modelo por paso";
  S.es.navStackSub = "Qué suscripciones mantener, qué usar gratis";
  S.es.navDoctorSub = "Puntúa un prompt, mira la versión optimizada";
  S.es.navGlossarySub = "Cada término de IA en una frase simple";
  S.es.navAboutSub = "FAQ, metodología, herramientas similares";
  S.es.navSettingsSub = "Claves API gratis, tus datos, copia";
  S.es.demoTitle = "Resultado de ejemplo";
  S.es.demoBest = "Mejor opción:";
  S.es.demoAlt = "Alternativa gratis:";
  S.es.demoTry = "Probar este ejemplo";
  S.es.demoYours = "El tuyo en 30 segundos";
  S.es.stackTitle = "AI Stack Optimizer";
  S.es.stackSub = "Cuatro elecciones rápidas: qué suscripción merece la pena, qué usar gratis y qué cancelar. Todo en tu dispositivo.";
  S.es.stackGo = "Crear mi stack";
  S.es.stackPickOne = "Elige antes al menos una tarea.";
  S.es.stackResult = "Tu stack recomendado";
  S.es.stackNewCost = "coste mensual estimado del stack recomendado";
  S.es.stackCurrentCost = "Ahora pagas:";
  S.es.stackSaving = "ahorro estimado";
  S.es.stackRedundant = "Quizá redundantes para tus tareas:";
  S.es.stackFreeTier = "Nivel gratuito";
  S.es.stackToFinder = "¿Solo necesitas una opción? Usa el finder";
  S.es.doctorTitle = "Prompt Doctor";
  S.es.doctorSub = "Pega un prompt: puntuación, lista de lo que falta y versión optimizada para el modelo elegido. Sin API.";
  S.es.doctorPh = "Pega aquí tu prompt…";
  S.es.doctorGo = "Analizar prompt";
  S.es.doctorDetected = "Tarea detectada:";
  S.es.doctorMissingLead = "Mayores carencias:";
  S.es.doctorAllGood = "Prompt sólido: están todos los ingredientes básicos.";
  S.es.doctorChecklist = "Checklist";
  S.es.doctorOptimized = "Versión optimizada";
  S.es.doctorBefore = "Tu prompt";
  S.es.doctorAfter = "Optimizado para el modelo elegido";
  S.es.doctorChanges = "Qué cambió y por qué";
  S.es.doctorToGen = "Abrir en el Generator";
  S.es.doctorNote = "Análisis estático basado en buenas prácticas de prompt engineering; la versión optimizada usa el mismo motor del Generator. Revisa antes de usar.";

  S.de.navMore = "Mehr ▾";
  S.de.navStack = "Stack Optimizer";
  S.de.navDoctor = "Prompt Doctor";
  S.de.navChainsSub = "Mehrstufige Workflows, ein Modell pro Schritt";
  S.de.navStackSub = "Welche Abos behalten, was gratis nutzen";
  S.de.navDoctorSub = "Prompt bewerten, optimierte Version sehen";
  S.de.navGlossarySub = "Jeder KI-Begriff in einem einfachen Satz";
  S.de.navAboutSub = "FAQ, Methodik, ähnliche Tools";
  S.de.navSettingsSub = "Gratis-API-Schlüssel, Daten, Backup";
  S.de.demoTitle = "Beispielergebnis";
  S.de.demoBest = "Beste Wahl:";
  S.de.demoAlt = "Gratis-Alternative:";
  S.de.demoTry = "Beispiel ausprobieren";
  S.de.demoYours = "Deins in 30 Sekunden";
  S.de.stackTitle = "AI Stack Optimizer";
  S.de.stackSub = "Vier schnelle Entscheidungen: welches Abo sich lohnt, was gratis geht, was du kündigen kannst. Alles auf deinem Gerät.";
  S.de.stackGo = "Meinen Stack bauen";
  S.de.stackPickOne = "Wähle zuerst mindestens eine Aufgabe.";
  S.de.stackResult = "Dein empfohlener Stack";
  S.de.stackNewCost = "geschätzte Monatskosten des empfohlenen Stacks";
  S.de.stackCurrentCost = "Du zahlst aktuell:";
  S.de.stackSaving = "geschätzte Ersparnis";
  S.de.stackRedundant = "Für deine Aufgaben womöglich redundant:";
  S.de.stackFreeTier = "Gratis-Stufe";
  S.de.stackToFinder = "Reicht eine einzige Wahl? Nimm den Finder";
  S.de.doctorTitle = "Prompt Doctor";
  S.de.doctorSub = "Prompt einfügen: Punktzahl, Checkliste des Fehlenden und optimierte Version für dein Modell. Ohne API.";
  S.de.doctorPh = "Prompt hier einfügen…";
  S.de.doctorGo = "Prompt analysieren";
  S.de.doctorDetected = "Erkannte Aufgabe:";
  S.de.doctorMissingLead = "Größte Lücken:";
  S.de.doctorAllGood = "Solider Prompt: alle Kernzutaten sind da.";
  S.de.doctorChecklist = "Checkliste";
  S.de.doctorOptimized = "Optimierte Version";
  S.de.doctorBefore = "Dein Prompt";
  S.de.doctorAfter = "Optimiert für das gewählte Modell";
  S.de.doctorChanges = "Was sich geändert hat und warum";
  S.de.doctorToGen = "Im Generator öffnen";
  S.de.doctorNote = "Statische Analyse nach Prompt-Engineering-Best-Practices; die optimierte Version nutzt denselben Engine wie der Generator. Vor Gebrauch prüfen.";

  S.pt.navMore = "Mais ▾";
  S.pt.navStack = "Stack Optimizer";
  S.pt.navDoctor = "Prompt Doctor";
  S.pt.navChainsSub = "Fluxos multi-etapas, um modelo por etapa";
  S.pt.navStackSub = "Quais assinaturas manter, o que usar grátis";
  S.pt.navDoctorSub = "Avalie um prompt, veja a versão otimizada";
  S.pt.navGlossarySub = "Cada termo de IA em uma frase simples";
  S.pt.navAboutSub = "FAQ, metodologia, ferramentas semelhantes";
  S.pt.navSettingsSub = "Chaves API grátis, seus dados, backup";
  S.pt.demoTitle = "Resultado de exemplo";
  S.pt.demoBest = "Melhor escolha:";
  S.pt.demoAlt = "Alternativa grátis:";
  S.pt.demoTry = "Testar este exemplo";
  S.pt.demoYours = "O seu em 30 segundos";
  S.pt.stackTitle = "AI Stack Optimizer";
  S.pt.stackSub = "Quatro escolhas rápidas: qual assinatura vale a pena, o que usar grátis e o que cancelar. Tudo no seu dispositivo.";
  S.pt.stackGo = "Montar meu stack";
  S.pt.stackPickOne = "Escolha antes pelo menos uma tarefa.";
  S.pt.stackResult = "Seu stack recomendado";
  S.pt.stackNewCost = "custo mensal estimado do stack recomendado";
  S.pt.stackCurrentCost = "Hoje você paga:";
  S.pt.stackSaving = "economia estimada";
  S.pt.stackRedundant = "Talvez redundantes para suas tarefas:";
  S.pt.stackFreeTier = "Nível grátis";
  S.pt.stackToFinder = "Precisa de uma única escolha? Use o finder";
  S.pt.doctorTitle = "Prompt Doctor";
  S.pt.doctorSub = "Cole um prompt: pontuação, lista do que falta e versão otimizada para o modelo escolhido. Sem API.";
  S.pt.doctorPh = "Cole seu prompt aqui…";
  S.pt.doctorGo = "Analisar prompt";
  S.pt.doctorDetected = "Tarefa detectada:";
  S.pt.doctorMissingLead = "Maiores lacunas:";
  S.pt.doctorAllGood = "Prompt sólido: todos os ingredientes básicos presentes.";
  S.pt.doctorChecklist = "Checklist";
  S.pt.doctorOptimized = "Versão otimizada";
  S.pt.doctorBefore = "Seu prompt";
  S.pt.doctorAfter = "Otimizado para o modelo escolhido";
  S.pt.doctorChanges = "O que mudou e por quê";
  S.pt.doctorToGen = "Abrir no Generator";
  S.pt.doctorNote = "Análise estática baseada em boas práticas de prompt engineering; a versão otimizada usa o mesmo motor do Generator. Revise antes de usar.";

  S.zh.navMore = "更多 ▾";
  S.zh.navStack = "订阅优化器";
  S.zh.navDoctor = "提示词医生";
  S.zh.navChainsSub = "多步骤工作流，每步一个模型";
  S.zh.navStackSub = "该保留哪些订阅，什么可以免费用";
  S.zh.navDoctorSub = "为提示词打分，查看优化版本";
  S.zh.navGlossarySub = "每个 AI 术语一句话讲清";
  S.zh.navAboutSub = "常见问题、方法论、同类工具";
  S.zh.navSettingsSub = "免费 API 密钥、数据、备份";
  S.zh.demoTitle = "示例结果";
  S.zh.demoBest = "最佳选择：";
  S.zh.demoAlt = "免费替代：";
  S.zh.demoTry = "试试这个示例";
  S.zh.demoYours = "30 秒获得你的结果";
  S.zh.stackTitle = "订阅优化器";
  S.zh.stackSub = "四个快速选择：哪个订阅值得保留、什么可以免费用、什么可以取消。全部在你的设备上完成。";
  S.zh.stackGo = "生成我的方案";
  S.zh.stackPickOne = "请先选择至少一项任务。";
  S.zh.stackResult = "推荐方案";
  S.zh.stackNewCost = "推荐方案的预计月成本";
  S.zh.stackCurrentCost = "你目前支付：";
  S.zh.stackSaving = "预计节省";
  S.zh.stackRedundant = "对你的任务可能多余：";
  S.zh.stackFreeTier = "免费档";
  S.zh.stackToFinder = "只需要一个选择？使用引导式选择";
  S.zh.doctorTitle = "提示词医生";
  S.zh.doctorSub = "粘贴提示词：获得评分、缺失项清单，以及针对所选模型的优化版本。无需 API。";
  S.zh.doctorPh = "在此粘贴你的提示词…";
  S.zh.doctorGo = "分析提示词";
  S.zh.doctorDetected = "检测到的任务：";
  S.zh.doctorMissingLead = "主要缺口：";
  S.zh.doctorAllGood = "提示词很扎实：核心要素齐全。";
  S.zh.doctorChecklist = "检查清单";
  S.zh.doctorOptimized = "优化版本";
  S.zh.doctorBefore = "你的提示词";
  S.zh.doctorAfter = "针对所选模型优化";
  S.zh.doctorChanges = "改了什么、为什么";
  S.zh.doctorToGen = "在生成器中打开";
  S.zh.doctorNote = "基于提示词工程最佳实践的静态分析；优化版本使用与生成器相同的引擎。使用前请检查。";

  S.hi.navMore = "और ▾";
  S.hi.navStack = "Stack Optimizer";
  S.hi.navDoctor = "Prompt Doctor";
  S.hi.navChainsSub = "मल्टी-स्टेप वर्कफ़्लो, हर स्टेप का अपना मॉडल";
  S.hi.navStackSub = "कौन सी सदस्यता रखें, क्या मुफ़्त में चलेगा";
  S.hi.navDoctorSub = "प्रॉम्प्ट को स्कोर करें, बेहतर संस्करण देखें";
  S.hi.navGlossarySub = "हर AI शब्द एक सरल वाक्य में";
  S.hi.navAboutSub = "FAQ, कार्यप्रणाली, मिलते-जुलते टूल";
  S.hi.navSettingsSub = "मुफ़्त API कुंजियाँ, डेटा, बैकअप";
  S.hi.demoTitle = "उदाहरण परिणाम";
  S.hi.demoBest = "सबसे अच्छा विकल्प:";
  S.hi.demoAlt = "मुफ़्त विकल्प:";
  S.hi.demoTry = "यह उदाहरण आज़माएँ";
  S.hi.demoYours = "30 सेकंड में अपना पाएँ";
  S.hi.stackTitle = "AI Stack Optimizer";
  S.hi.stackSub = "चार त्वरित चुनाव: कौन सी सदस्यता रखने लायक है, क्या मुफ़्त चलेगा, क्या रद्द करें। सब आपके डिवाइस पर।";
  S.hi.stackGo = "मेरा स्टैक बनाएँ";
  S.hi.stackPickOne = "पहले कम से कम एक कार्य चुनें।";
  S.hi.stackResult = "आपका सुझाया स्टैक";
  S.hi.stackNewCost = "सुझाए स्टैक की अनुमानित मासिक लागत";
  S.hi.stackCurrentCost = "अभी आप देते हैं:";
  S.hi.stackSaving = "अनुमानित बचत";
  S.hi.stackRedundant = "आपके कार्यों के लिए शायद अनावश्यक:";
  S.hi.stackFreeTier = "मुफ़्त स्तर";
  S.hi.stackToFinder = "सिर्फ़ एक विकल्प चाहिए? फ़ाइंडर आज़माएँ";
  S.hi.doctorTitle = "Prompt Doctor";
  S.hi.doctorSub = "प्रॉम्प्ट चिपकाएँ: स्कोर, कमियों की सूची और चुने मॉडल के लिए बेहतर संस्करण। बिना API।";
  S.hi.doctorPh = "अपना प्रॉम्प्ट यहाँ चिपकाएँ…";
  S.hi.doctorGo = "प्रॉम्प्ट का विश्लेषण करें";
  S.hi.doctorDetected = "पहचाना गया कार्य:";
  S.hi.doctorMissingLead = "मुख्य कमियाँ:";
  S.hi.doctorAllGood = "मज़बूत प्रॉम्प्ट: सभी मूल तत्व मौजूद हैं।";
  S.hi.doctorChecklist = "चेकलिस्ट";
  S.hi.doctorOptimized = "बेहतर संस्करण";
  S.hi.doctorBefore = "आपका प्रॉम्प्ट";
  S.hi.doctorAfter = "चुने मॉडल के लिए अनुकूलित";
  S.hi.doctorChanges = "क्या बदला और क्यों";
  S.hi.doctorToGen = "Generator में खोलें";
  S.hi.doctorNote = "प्रॉम्प्ट इंजीनियरिंग की सर्वोत्तम प्रथाओं पर आधारित स्थैतिक विश्लेषण; बेहतर संस्करण वही इंजन उपयोग करता है। उपयोग से पहले जाँचें।";

  S.ru.navMore = "Ещё ▾";
  S.ru.navStack = "Stack Optimizer";
  S.ru.navDoctor = "Prompt Doctor";
  S.ru.navChainsSub = "Многошаговые процессы, модель на каждый шаг";
  S.ru.navStackSub = "Какие подписки оставить, что использовать бесплатно";
  S.ru.navDoctorSub = "Оцените промпт, посмотрите улучшенную версию";
  S.ru.navGlossarySub = "Каждый термин ИИ одним простым предложением";
  S.ru.navAboutSub = "FAQ, методология, похожие инструменты";
  S.ru.navSettingsSub = "Бесплатные API-ключи, данные, резервная копия";
  S.ru.demoTitle = "Пример результата";
  S.ru.demoBest = "Лучший выбор:";
  S.ru.demoAlt = "Бесплатная альтернатива:";
  S.ru.demoTry = "Попробовать пример";
  S.ru.demoYours = "Ваш за 30 секунд";
  S.ru.stackTitle = "AI Stack Optimizer";
  S.ru.stackSub = "Четыре быстрых выбора: какую подписку оставить, что использовать бесплатно, что отменить. Всё на вашем устройстве.";
  S.ru.stackGo = "Собрать мой стек";
  S.ru.stackPickOne = "Сначала выберите хотя бы одну задачу.";
  S.ru.stackResult = "Рекомендованный стек";
  S.ru.stackNewCost = "оценочная месячная стоимость рекомендованного стека";
  S.ru.stackCurrentCost = "Сейчас вы платите:";
  S.ru.stackSaving = "оценочная экономия";
  S.ru.stackRedundant = "Возможно, лишнее для ваших задач:";
  S.ru.stackFreeTier = "Бесплатный уровень";
  S.ru.stackToFinder = "Нужен один вариант? Пройдите финдер";
  S.ru.doctorTitle = "Prompt Doctor";
  S.ru.doctorSub = "Вставьте промпт: оценка, список недостающего и улучшенная версия для выбранной модели. Без API.";
  S.ru.doctorPh = "Вставьте промпт сюда…";
  S.ru.doctorGo = "Проанализировать промпт";
  S.ru.doctorDetected = "Определённая задача:";
  S.ru.doctorMissingLead = "Главные пробелы:";
  S.ru.doctorAllGood = "Крепкий промпт: все ключевые элементы на месте.";
  S.ru.doctorChecklist = "Чек-лист";
  S.ru.doctorOptimized = "Улучшенная версия";
  S.ru.doctorBefore = "Ваш промпт";
  S.ru.doctorAfter = "Оптимизировано под выбранную модель";
  S.ru.doctorChanges = "Что изменилось и почему";
  S.ru.doctorToGen = "Открыть в Generator";
  S.ru.doctorNote = "Статический анализ по лучшим практикам промпт-инжиниринга; улучшенная версия использует тот же движок, что и Generator. Проверьте перед использованием.";

  S.ja.navMore = "その他 ▾";
  S.ja.navStack = "Stack Optimizer";
  S.ja.navDoctor = "Prompt Doctor";
  S.ja.navChainsSub = "マルチステップのワークフロー、各ステップに最適モデル";
  S.ja.navStackSub = "残すべきサブスク、無料で済むもの";
  S.ja.navDoctorSub = "プロンプトを採点し、最適化版を見る";
  S.ja.navGlossarySub = "AI用語を1文でやさしく";
  S.ja.navAboutSub = "FAQ・方法論・類似ツール";
  S.ja.navSettingsSub = "無料APIキー、データ、バックアップ";
  S.ja.demoTitle = "結果の例";
  S.ja.demoBest = "ベストな選択：";
  S.ja.demoAlt = "無料の代替：";
  S.ja.demoTry = "この例を試す";
  S.ja.demoYours = "30秒であなたの結果を";
  S.ja.stackTitle = "AI Stack Optimizer";
  S.ja.stackSub = "4つの簡単な選択で、残す価値のあるサブスク・無料で済むもの・解約できるものが分かります。すべて端末内で完結。";
  S.ja.stackGo = "スタックを作る";
  S.ja.stackPickOne = "まずタスクを1つ以上選んでください。";
  S.ja.stackResult = "おすすめスタック";
  S.ja.stackNewCost = "おすすめスタックの推定月額";
  S.ja.stackCurrentCost = "現在の支払い：";
  S.ja.stackSaving = "推定節約額";
  S.ja.stackRedundant = "あなたのタスクには不要かも：";
  S.ja.stackFreeTier = "無料プラン";
  S.ja.stackToFinder = "1つだけ選びたい？ファインダーへ";
  S.ja.doctorTitle = "Prompt Doctor";
  S.ja.doctorSub = "プロンプトを貼るだけ：採点、足りない要素のリスト、選んだモデル向けの最適化版。APIは不要です。";
  S.ja.doctorPh = "ここにプロンプトを貼り付け…";
  S.ja.doctorGo = "プロンプトを分析";
  S.ja.doctorDetected = "検出タスク：";
  S.ja.doctorMissingLead = "主な不足：";
  S.ja.doctorAllGood = "しっかりしたプロンプトです。主要な要素はすべて揃っています。";
  S.ja.doctorChecklist = "チェックリスト";
  S.ja.doctorOptimized = "最適化版";
  S.ja.doctorBefore = "あなたのプロンプト";
  S.ja.doctorAfter = "選択モデル向けに最適化";
  S.ja.doctorChanges = "変更点と理由";
  S.ja.doctorToGen = "Generatorで開く";
  S.ja.doctorNote = "プロンプトエンジニアリングのベストプラクティスに基づく静的分析。最適化版はGeneratorと同じエンジンを使用します。使用前に確認してください。";

  S.ar.navMore = "المزيد ▾";
  S.ar.navStack = "محسّن الاشتراكات";
  S.ar.navDoctor = "طبيب الموجّهات";
  S.ar.navChainsSub = "مسارات متعددة الخطوات، نموذج لكل خطوة";
  S.ar.navStackSub = "أي اشتراك تُبقيه وما يمكن استخدامه مجانًا";
  S.ar.navDoctorSub = "قيّم موجّهًا وشاهد النسخة المحسّنة";
  S.ar.navGlossarySub = "كل مصطلح ذكاء اصطناعي في جملة بسيطة";
  S.ar.navAboutSub = "الأسئلة الشائعة، المنهجية، أدوات مشابهة";
  S.ar.navSettingsSub = "مفاتيح API مجانية، بياناتك، نسخ احتياطي";
  S.ar.demoTitle = "نتيجة مثال";
  S.ar.demoBest = "أفضل خيار:";
  S.ar.demoAlt = "بديل مجاني:";
  S.ar.demoTry = "جرّب هذا المثال";
  S.ar.demoYours = "نتيجتك في 30 ثانية";
  S.ar.stackTitle = "محسّن الاشتراكات";
  S.ar.stackSub = "أربعة اختيارات سريعة: أي اشتراك يستحق البقاء، وما يمكن استخدامه مجانًا، وما يمكنك إلغاؤه. كل ذلك على جهازك.";
  S.ar.stackGo = "ابنِ حزمتي";
  S.ar.stackPickOne = "اختر مهمة واحدة على الأقل أولًا.";
  S.ar.stackResult = "حزمتك الموصى بها";
  S.ar.stackNewCost = "التكلفة الشهرية التقديرية للحزمة الموصى بها";
  S.ar.stackCurrentCost = "تدفع حاليًا:";
  S.ar.stackSaving = "توفير تقديري";
  S.ar.stackRedundant = "ربما زائدة عن حاجتك:";
  S.ar.stackFreeTier = "الخطة المجانية";
  S.ar.stackToFinder = "تحتاج خيارًا واحدًا فقط؟ جرّب المرشد";
  S.ar.doctorTitle = "طبيب الموجّهات";
  S.ar.doctorSub = "الصق موجّهًا: درجة، قائمة بما ينقصه، ونسخة محسّنة للنموذج الذي تختاره. دون API.";
  S.ar.doctorPh = "الصق موجّهك هنا…";
  S.ar.doctorGo = "حلّل الموجّه";
  S.ar.doctorDetected = "المهمة المكتشفة:";
  S.ar.doctorMissingLead = "أكبر الثغرات:";
  S.ar.doctorAllGood = "موجّه متين: كل المكوّنات الأساسية موجودة.";
  S.ar.doctorChecklist = "قائمة التحقق";
  S.ar.doctorOptimized = "النسخة المحسّنة";
  S.ar.doctorBefore = "موجّهك";
  S.ar.doctorAfter = "محسّن للنموذج المختار";
  S.ar.doctorChanges = "ما الذي تغيّر ولماذا";
  S.ar.doctorToGen = "افتح في المولّد";
  S.ar.doctorNote = "تحليل ثابت مبني على أفضل ممارسات هندسة الموجّهات؛ النسخة المحسّنة تستخدم محرك المولّد نفسه. راجعها قبل الاستخدام.";


  /* ---------------- v0.25: official links, model radar, share cards ---------------- */

  S.en.officialOpen = "Open";
  S.en.officialSite = "Open the official app";
  S.en.navRadar = "Model Radar";
  S.en.navRadarSub = "What changed: new models, prices, free tiers";
  S.en.radarTitle = "Model Radar";
  S.en.radarSub = "New models, price moves, score snapshots and free-tier changes, curated with every data refresh.";
  S.en.radarNew = "NEW";
  S.en.radarUpcoming = "Coming up";
  S.en.radarAll = "All";
  S.en.radarFollowing = "Following";
  S.en.radarSince = "changes since your last visit";
  S.en.radarFollow = "Follow";
  S.en.radarUnfollow = "Following";
  S.en.radarTypeNew = "New models";
  S.en.radarTypePrice = "Prices";
  S.en.radarTypeScore = "Scores";
  S.en.radarTypeFree = "Free tiers";
  S.en.radarEmpty = "Nothing here yet. Follow a model with the star to build your own feed.";
  S.en.shareBtn = "Share as image";
  S.en.shareDone = "Image ready";

  S.it.officialOpen = "Apri";
  S.it.officialSite = "Apri l'app ufficiale";
  S.it.navRadar = "Model Radar";
  S.it.navRadarSub = "Cosa è cambiato: nuovi modelli, prezzi, piani gratuiti";
  S.it.radarTitle = "Model Radar";
  S.it.radarSub = "Nuovi modelli, variazioni di prezzo, snapshot dei punteggi e cambi dei piani gratuiti, curati a ogni refresh dei dati.";
  S.it.radarNew = "NUOVO";
  S.it.radarUpcoming = "In arrivo";
  S.it.radarAll = "Tutto";
  S.it.radarFollowing = "Seguiti";
  S.it.radarSince = "novità dalla tua ultima visita";
  S.it.radarFollow = "Segui";
  S.it.radarUnfollow = "Seguito";
  S.it.radarTypeNew = "Nuovi modelli";
  S.it.radarTypePrice = "Prezzi";
  S.it.radarTypeScore = "Punteggi";
  S.it.radarTypeFree = "Piani gratuiti";
  S.it.radarEmpty = "Ancora niente qui. Segui un modello con la stella per costruire il tuo feed.";
  S.it.shareBtn = "Condividi come immagine";
  S.it.shareDone = "Immagine pronta";

  S.fr.officialOpen = "Ouvrir";
  S.fr.officialSite = "Ouvrir l'app officielle";
  S.fr.navRadar = "Model Radar";
  S.fr.navRadarSub = "Ce qui a changé : nouveaux modèles, prix, offres gratuites";
  S.fr.radarTitle = "Model Radar";
  S.fr.radarSub = "Nouveaux modèles, évolutions de prix, snapshots de scores et offres gratuites, mis à jour à chaque refresh des données.";
  S.fr.radarNew = "NOUVEAU";
  S.fr.radarUpcoming = "À venir";
  S.fr.radarAll = "Tout";
  S.fr.radarFollowing = "Suivis";
  S.fr.radarSince = "nouveautés depuis votre dernière visite";
  S.fr.radarFollow = "Suivre";
  S.fr.radarUnfollow = "Suivi";
  S.fr.radarTypeNew = "Nouveaux modèles";
  S.fr.radarTypePrice = "Prix";
  S.fr.radarTypeScore = "Scores";
  S.fr.radarTypeFree = "Offres gratuites";
  S.fr.radarEmpty = "Rien ici pour l'instant. Suivez un modèle avec l'étoile pour créer votre propre flux.";
  S.fr.shareBtn = "Partager en image";
  S.fr.shareDone = "Image prête";

  S.es.officialOpen = "Abrir";
  S.es.officialSite = "Abrir la app oficial";
  S.es.navRadar = "Model Radar";
  S.es.navRadarSub = "Qué cambió: nuevos modelos, precios, niveles gratis";
  S.es.radarTitle = "Model Radar";
  S.es.radarSub = "Nuevos modelos, cambios de precios, snapshots de puntuaciones y niveles gratis, curados en cada actualización de datos.";
  S.es.radarNew = "NUEVO";
  S.es.radarUpcoming = "Próximamente";
  S.es.radarAll = "Todo";
  S.es.radarFollowing = "Siguiendo";
  S.es.radarSince = "novedades desde tu última visita";
  S.es.radarFollow = "Seguir";
  S.es.radarUnfollow = "Siguiendo";
  S.es.radarTypeNew = "Nuevos modelos";
  S.es.radarTypePrice = "Precios";
  S.es.radarTypeScore = "Puntuaciones";
  S.es.radarTypeFree = "Niveles gratis";
  S.es.radarEmpty = "Nada por aquí todavía. Sigue un modelo con la estrella para crear tu propio feed.";
  S.es.shareBtn = "Compartir como imagen";
  S.es.shareDone = "Imagen lista";

  S.de.officialOpen = "Öffnen";
  S.de.officialSite = "Offizielle App öffnen";
  S.de.navRadar = "Model Radar";
  S.de.navRadarSub = "Was sich geändert hat: neue Modelle, Preise, Gratis-Stufen";
  S.de.radarTitle = "Model Radar";
  S.de.radarSub = "Neue Modelle, Preisänderungen, Score-Snapshots und Gratis-Stufen, kuratiert bei jedem Daten-Refresh.";
  S.de.radarNew = "NEU";
  S.de.radarUpcoming = "Demnächst";
  S.de.radarAll = "Alles";
  S.de.radarFollowing = "Gefolgt";
  S.de.radarSince = "Neuigkeiten seit deinem letzten Besuch";
  S.de.radarFollow = "Folgen";
  S.de.radarUnfollow = "Gefolgt";
  S.de.radarTypeNew = "Neue Modelle";
  S.de.radarTypePrice = "Preise";
  S.de.radarTypeScore = "Scores";
  S.de.radarTypeFree = "Gratis-Stufen";
  S.de.radarEmpty = "Hier ist noch nichts. Folge einem Modell mit dem Stern für deinen eigenen Feed.";
  S.de.shareBtn = "Als Bild teilen";
  S.de.shareDone = "Bild bereit";

  S.pt.officialOpen = "Abrir";
  S.pt.officialSite = "Abrir o app oficial";
  S.pt.navRadar = "Model Radar";
  S.pt.navRadarSub = "O que mudou: novos modelos, preços, níveis grátis";
  S.pt.radarTitle = "Model Radar";
  S.pt.radarSub = "Novos modelos, mudanças de preço, snapshots de pontuações e níveis grátis, curados a cada atualização de dados.";
  S.pt.radarNew = "NOVO";
  S.pt.radarUpcoming = "Em breve";
  S.pt.radarAll = "Tudo";
  S.pt.radarFollowing = "Seguindo";
  S.pt.radarSince = "novidades desde sua última visita";
  S.pt.radarFollow = "Seguir";
  S.pt.radarUnfollow = "Seguindo";
  S.pt.radarTypeNew = "Novos modelos";
  S.pt.radarTypePrice = "Preços";
  S.pt.radarTypeScore = "Pontuações";
  S.pt.radarTypeFree = "Níveis grátis";
  S.pt.radarEmpty = "Nada por aqui ainda. Siga um modelo com a estrela para montar seu próprio feed.";
  S.pt.shareBtn = "Compartilhar como imagem";
  S.pt.shareDone = "Imagem pronta";

  S.zh.officialOpen = "打开";
  S.zh.officialSite = "打开官方应用";
  S.zh.navRadar = "模型雷达";
  S.zh.navRadarSub = "最新变化：新模型、价格、免费额度";
  S.zh.radarTitle = "模型雷达";
  S.zh.radarSub = "新模型、价格变动、分数快照与免费额度变化，每次数据更新时人工整理。";
  S.zh.radarNew = "新";
  S.zh.radarUpcoming = "即将到来";
  S.zh.radarAll = "全部";
  S.zh.radarFollowing = "关注中";
  S.zh.radarSince = "条自上次访问以来的变化";
  S.zh.radarFollow = "关注";
  S.zh.radarUnfollow = "已关注";
  S.zh.radarTypeNew = "新模型";
  S.zh.radarTypePrice = "价格";
  S.zh.radarTypeScore = "分数";
  S.zh.radarTypeFree = "免费额度";
  S.zh.radarEmpty = "这里还没有内容。用星标关注一个模型来构建你的专属动态。";
  S.zh.shareBtn = "分享为图片";
  S.zh.shareDone = "图片已生成";

  S.hi.officialOpen = "खोलें";
  S.hi.officialSite = "आधिकारिक ऐप खोलें";
  S.hi.navRadar = "मॉडल राडार";
  S.hi.navRadarSub = "क्या बदला: नए मॉडल, कीमतें, मुफ़्त स्तर";
  S.hi.radarTitle = "मॉडल राडार";
  S.hi.radarSub = "नए मॉडल, कीमतों में बदलाव, स्कोर स्नैपशॉट और मुफ़्त स्तर, हर डेटा रिफ़्रेश पर संकलित।";
  S.hi.radarNew = "नया";
  S.hi.radarUpcoming = "आने वाला";
  S.hi.radarAll = "सब";
  S.hi.radarFollowing = "फ़ॉलो किए";
  S.hi.radarSince = "आपकी पिछली विज़िट के बाद के बदलाव";
  S.hi.radarFollow = "फ़ॉलो करें";
  S.hi.radarUnfollow = "फ़ॉलो में";
  S.hi.radarTypeNew = "नए मॉडल";
  S.hi.radarTypePrice = "कीमतें";
  S.hi.radarTypeScore = "स्कोर";
  S.hi.radarTypeFree = "मुफ़्त स्तर";
  S.hi.radarEmpty = "यहाँ अभी कुछ नहीं है। अपना फ़ीड बनाने के लिए स्टार से किसी मॉडल को फ़ॉलो करें।";
  S.hi.shareBtn = "छवि के रूप में साझा करें";
  S.hi.shareDone = "छवि तैयार";

  S.ru.officialOpen = "Открыть";
  S.ru.officialSite = "Открыть официальное приложение";
  S.ru.navRadar = "Радар моделей";
  S.ru.navRadarSub = "Что изменилось: новые модели, цены, бесплатные уровни";
  S.ru.radarTitle = "Радар моделей";
  S.ru.radarSub = "Новые модели, изменения цен, снапшоты оценок и бесплатные уровни, курируются при каждом обновлении данных.";
  S.ru.radarNew = "НОВОЕ";
  S.ru.radarUpcoming = "Скоро";
  S.ru.radarAll = "Все";
  S.ru.radarFollowing = "Отслеживаемые";
  S.ru.radarSince = "изменений с вашего последнего визита";
  S.ru.radarFollow = "Следить";
  S.ru.radarUnfollow = "Отслеживается";
  S.ru.radarTypeNew = "Новые модели";
  S.ru.radarTypePrice = "Цены";
  S.ru.radarTypeScore = "Оценки";
  S.ru.radarTypeFree = "Бесплатные уровни";
  S.ru.radarEmpty = "Пока пусто. Отметьте модель звездой, чтобы собрать свой канал.";
  S.ru.shareBtn = "Поделиться картинкой";
  S.ru.shareDone = "Картинка готова";

  S.ja.officialOpen = "開く";
  S.ja.officialSite = "公式アプリを開く";
  S.ja.navRadar = "モデルレーダー";
  S.ja.navRadarSub = "変更点：新モデル、価格、無料枠";
  S.ja.radarTitle = "モデルレーダー";
  S.ja.radarSub = "新モデル、価格の変動、スコアのスナップショット、無料枠の変更。データ更新のたびにキュレーションしています。";
  S.ja.radarNew = "新着";
  S.ja.radarUpcoming = "近日";
  S.ja.radarAll = "すべて";
  S.ja.radarFollowing = "フォロー中";
  S.ja.radarSince = "件、前回の訪問以降の変更";
  S.ja.radarFollow = "フォロー";
  S.ja.radarUnfollow = "フォロー中";
  S.ja.radarTypeNew = "新モデル";
  S.ja.radarTypePrice = "価格";
  S.ja.radarTypeScore = "スコア";
  S.ja.radarTypeFree = "無料枠";
  S.ja.radarEmpty = "まだ何もありません。星でモデルをフォローして自分のフィードを作りましょう。";
  S.ja.shareBtn = "画像でシェア";
  S.ja.shareDone = "画像を作成しました";

  S.ar.officialOpen = "افتح";
  S.ar.officialSite = "افتح التطبيق الرسمي";
  S.ar.navRadar = "رادار النماذج";
  S.ar.navRadarSub = "ما الذي تغيّر: نماذج جديدة، أسعار، خطط مجانية";
  S.ar.radarTitle = "رادار النماذج";
  S.ar.radarSub = "نماذج جديدة وتغيّرات أسعار ولقطات درجات وخطط مجانية، تُنسَّق مع كل تحديث للبيانات.";
  S.ar.radarNew = "جديد";
  S.ar.radarUpcoming = "قريبًا";
  S.ar.radarAll = "الكل";
  S.ar.radarFollowing = "المتابَعة";
  S.ar.radarSince = "تغييرات منذ زيارتك الأخيرة";
  S.ar.radarFollow = "تابِع";
  S.ar.radarUnfollow = "مُتابَع";
  S.ar.radarTypeNew = "نماذج جديدة";
  S.ar.radarTypePrice = "الأسعار";
  S.ar.radarTypeScore = "الدرجات";
  S.ar.radarTypeFree = "الخطط المجانية";
  S.ar.radarEmpty = "لا شيء هنا بعد. تابع نموذجًا بالنجمة لبناء موجزك الخاص.";
  S.ar.shareBtn = "شارك كصورة";
  S.ar.shareDone = "الصورة جاهزة";

  /* v0.26: minimalist welcome screen */
  var WELCOME = {
    en: ["The right AI for the job. The right prompt for it.", "Create a prompt", "Choose an AI", "Compare models", "Explore all tools", "Start with WhichAI"],
    it: ["L'AI giusta per ogni lavoro. Il prompt giusto per usarla.", "Crea un prompt", "Scegli un'AI", "Confronta i modelli", "Esplora tutti gli strumenti", "Inizia con WhichAI"],
    fr: ["La bonne IA pour chaque tâche. Le bon prompt pour l'utiliser.", "Créer un prompt", "Choisir une IA", "Comparer les modèles", "Explorer tous les outils", "Commencer avec WhichAI"],
    es: ["La IA adecuada para cada tarea. El prompt adecuado para usarla.", "Crear un prompt", "Elegir una IA", "Comparar modelos", "Explorar todas las herramientas", "Empezar con WhichAI"],
    de: ["Die richtige KI für jede Aufgabe. Der richtige Prompt dafür.", "Prompt erstellen", "KI auswählen", "Modelle vergleichen", "Alle Werkzeuge entdecken", "Mit WhichAI starten"],
    pt: ["A IA certa para cada tarefa. O prompt certo para usá-la.", "Criar um prompt", "Escolher uma IA", "Comparar modelos", "Explorar todas as ferramentas", "Começar com o WhichAI"],
    zh: ["为每项任务选择合适的 AI，并获得合适的提示词。", "创建提示词", "选择 AI", "比较模型", "探索所有工具", "开始使用 WhichAI"],
    hi: ["हर काम के लिए सही AI। उसे चलाने के लिए सही प्रॉम्प्ट।", "प्रॉम्प्ट बनाएँ", "AI चुनें", "मॉडल की तुलना करें", "सभी टूल देखें", "WhichAI के साथ शुरू करें"],
    ru: ["Подходящий ИИ для каждой задачи. Подходящий промпт для него.", "Создать промпт", "Выбрать ИИ", "Сравнить модели", "Все инструменты", "Начать с WhichAI"],
    ja: ["仕事に最適なAIを。使いこなすための最適なプロンプトを。", "プロンプトを作成", "AIを選ぶ", "モデルを比較", "すべてのツールを見る", "WhichAIを始める"],
    ar: ["الذكاء الاصطناعي المناسب لكل مهمة، والموجّه المناسب لاستخدامه.", "أنشئ موجّهًا", "اختر ذكاءً اصطناعيًا", "قارن النماذج", "استكشف كل الأدوات", "ابدأ مع WhichAI"]
  };
  Object.keys(WELCOME).forEach(function (lang) {
    var v = WELCOME[lang];
    S[lang].welcomeValue = v[0];
    S[lang].welcomeGenerator = v[1];
    S[lang].welcomeGuide = v[2];
    S[lang].welcomeCompare = v[3];
    S[lang].welcomeExplore = v[4];
    S[lang].welcomeNavLabel = v[5];
  });


  /* ---------------- v0.28: blind arena ---------------- */

  S.en.navArena = "Blind Arena";
  S.en.navArenaSub = "Blind A/B rounds on your prompts, personal Elo";
  S.en.arenaTitle = "Blind Arena";
  S.en.arenaSub = "Two anonymous answers to YOUR prompt. Pick the better one; names are revealed after you vote and your personal Elo updates. Runs only on models your free keys can call.";
  S.en.arenaPool = "Your arena pool:";
  S.en.arenaPh = "Type a real task you care about…";
  S.en.arenaGo = "Run a blind round";
  S.en.arenaNext = "Run another round";
  S.en.arenaNeedKeys = "The arena needs at least two auto-run models. Add free API keys (Google AI Studio, Groq, OpenRouter) in Settings to unlock it.";
  S.en.arenaModel = "Model";
  S.en.arenaBetter = "is better";
  S.en.arenaRunning = "Generating…";
  S.en.arenaRoundErr = "One side failed, so this round is not counted. Run another round.";
  S.en.arenaReveal = "Revealed:";
  S.en.arenaBoard = "Your personal leaderboard";
  S.en.arenaGames = "rounds";
  S.en.arenaReset = "Reset my arena history";
  S.en.arenaNote = "This is YOUR preference on YOUR prompts, measured blind. It is not a global quality ranking; the pool only includes models your keys can run.";

  S.it.navArena = "Blind Arena";
  S.it.navArenaSub = "Sfide A/B alla cieca sui tuoi prompt, Elo personale";
  S.it.arenaTitle = "Blind Arena";
  S.it.arenaSub = "Due risposte anonime al TUO prompt. Scegli la migliore; i nomi si rivelano dopo il voto e il tuo Elo personale si aggiorna. Gira solo sui modelli che le tue chiavi gratuite possono chiamare.";
  S.it.arenaPool = "Il tuo pool:";
  S.it.arenaPh = "Scrivi un compito reale che ti interessa…";
  S.it.arenaGo = "Lancia una sfida alla cieca";
  S.it.arenaNext = "Un'altra sfida";
  S.it.arenaNeedKeys = "L'arena richiede almeno due modelli auto-run. Aggiungi chiavi API gratuite (Google AI Studio, Groq, OpenRouter) in Settings per sbloccarla.";
  S.it.arenaModel = "Modello";
  S.it.arenaBetter = "è migliore";
  S.it.arenaRunning = "Sto generando…";
  S.it.arenaRoundErr = "Una risposta è fallita, quindi la sfida non conta. Lanciane un'altra.";
  S.it.arenaReveal = "Rivelato:";
  S.it.arenaBoard = "La tua classifica personale";
  S.it.arenaGames = "sfide";
  S.it.arenaReset = "Azzera la mia cronologia arena";
  S.it.arenaNote = "È la TUA preferenza sui TUOI prompt, misurata alla cieca. Non è una classifica globale di qualità; il pool include solo i modelli che le tue chiavi possono eseguire.";

  S.fr.navArena = "Blind Arena";
  S.fr.navArenaSub = "Duels A/B à l'aveugle sur vos prompts, Elo personnel";
  S.fr.arenaTitle = "Blind Arena";
  S.fr.arenaSub = "Deux réponses anonymes à VOTRE prompt. Choisissez la meilleure ; les noms se révèlent après le vote et votre Elo personnel se met à jour. Fonctionne uniquement avec les modèles que vos clés gratuites peuvent appeler.";
  S.fr.arenaPool = "Votre pool :";
  S.fr.arenaPh = "Écrivez une tâche réelle qui compte pour vous…";
  S.fr.arenaGo = "Lancer un duel à l'aveugle";
  S.fr.arenaNext = "Un autre duel";
  S.fr.arenaNeedKeys = "L'arène demande au moins deux modèles auto-run. Ajoutez des clés API gratuites (Google AI Studio, Groq, OpenRouter) dans Settings.";
  S.fr.arenaModel = "Modèle";
  S.fr.arenaBetter = "est meilleur";
  S.fr.arenaRunning = "Génération…";
  S.fr.arenaRoundErr = "Une réponse a échoué, ce duel ne compte pas. Relancez-en un.";
  S.fr.arenaReveal = "Révélé :";
  S.fr.arenaBoard = "Votre classement personnel";
  S.fr.arenaGames = "duels";
  S.fr.arenaReset = "Réinitialiser mon historique";
  S.fr.arenaNote = "C'est VOTRE préférence sur VOS prompts, mesurée à l'aveugle. Ce n'est pas un classement global ; le pool ne contient que les modèles que vos clés peuvent exécuter.";

  S.es.navArena = "Blind Arena";
  S.es.navArenaSub = "Duelos A/B a ciegas con tus prompts, Elo personal";
  S.es.arenaTitle = "Blind Arena";
  S.es.arenaSub = "Dos respuestas anónimas a TU prompt. Elige la mejor; los nombres se revelan tras votar y tu Elo personal se actualiza. Solo funciona con los modelos que tus claves gratis pueden llamar.";
  S.es.arenaPool = "Tu pool:";
  S.es.arenaPh = "Escribe una tarea real que te importe…";
  S.es.arenaGo = "Lanzar duelo a ciegas";
  S.es.arenaNext = "Otro duelo";
  S.es.arenaNeedKeys = "La arena necesita al menos dos modelos auto-run. Añade claves API gratis (Google AI Studio, Groq, OpenRouter) en Settings.";
  S.es.arenaModel = "Modelo";
  S.es.arenaBetter = "es mejor";
  S.es.arenaRunning = "Generando…";
  S.es.arenaRoundErr = "Una respuesta falló, así que este duelo no cuenta. Lanza otro.";
  S.es.arenaReveal = "Revelado:";
  S.es.arenaBoard = "Tu clasificación personal";
  S.es.arenaGames = "duelos";
  S.es.arenaReset = "Restablecer mi historial";
  S.es.arenaNote = "Es TU preferencia con TUS prompts, medida a ciegas. No es un ranking global; el pool solo incluye modelos que tus claves pueden ejecutar.";

  S.de.navArena = "Blind Arena";
  S.de.navArenaSub = "Blinde A/B-Duelle mit deinen Prompts, persönliches Elo";
  S.de.arenaTitle = "Blind Arena";
  S.de.arenaSub = "Zwei anonyme Antworten auf DEINEN Prompt. Wähle die bessere; die Namen erscheinen nach dem Voting und dein persönliches Elo wird aktualisiert. Läuft nur mit Modellen, die deine Gratis-Schlüssel aufrufen können.";
  S.de.arenaPool = "Dein Pool:";
  S.de.arenaPh = "Schreibe eine echte Aufgabe, die dir wichtig ist…";
  S.de.arenaGo = "Blindes Duell starten";
  S.de.arenaNext = "Noch ein Duell";
  S.de.arenaNeedKeys = "Die Arena braucht mindestens zwei Auto-Run-Modelle. Füge in den Settings Gratis-API-Schlüssel hinzu (Google AI Studio, Groq, OpenRouter).";
  S.de.arenaModel = "Modell";
  S.de.arenaBetter = "ist besser";
  S.de.arenaRunning = "Generiere…";
  S.de.arenaRoundErr = "Eine Antwort ist fehlgeschlagen, dieses Duell zählt nicht. Starte ein neues.";
  S.de.arenaReveal = "Aufgedeckt:";
  S.de.arenaBoard = "Deine persönliche Rangliste";
  S.de.arenaGames = "Duelle";
  S.de.arenaReset = "Arena-Verlauf zurücksetzen";
  S.de.arenaNote = "Das ist DEINE Präferenz auf DEINEN Prompts, blind gemessen. Kein globales Qualitätsranking; der Pool enthält nur Modelle, die deine Schlüssel ausführen können.";

  S.pt.navArena = "Blind Arena";
  S.pt.navArenaSub = "Duelos A/B às cegas com seus prompts, Elo pessoal";
  S.pt.arenaTitle = "Blind Arena";
  S.pt.arenaSub = "Duas respostas anônimas ao SEU prompt. Escolha a melhor; os nomes aparecem após o voto e seu Elo pessoal é atualizado. Funciona só com modelos que suas chaves grátis podem chamar.";
  S.pt.arenaPool = "Seu pool:";
  S.pt.arenaPh = "Escreva uma tarefa real que importa para você…";
  S.pt.arenaGo = "Iniciar duelo às cegas";
  S.pt.arenaNext = "Outro duelo";
  S.pt.arenaNeedKeys = "A arena precisa de pelo menos dois modelos auto-run. Adicione chaves API grátis (Google AI Studio, Groq, OpenRouter) em Settings.";
  S.pt.arenaModel = "Modelo";
  S.pt.arenaBetter = "é melhor";
  S.pt.arenaRunning = "Gerando…";
  S.pt.arenaRoundErr = "Uma resposta falhou, então este duelo não conta. Inicie outro.";
  S.pt.arenaReveal = "Revelado:";
  S.pt.arenaBoard = "Sua classificação pessoal";
  S.pt.arenaGames = "duelos";
  S.pt.arenaReset = "Zerar meu histórico";
  S.pt.arenaNote = "É a SUA preferência nos SEUS prompts, medida às cegas. Não é um ranking global; o pool inclui só modelos que suas chaves podem executar.";

  S.zh.navArena = "盲测竞技场";
  S.zh.navArenaSub = "用你的提示词盲测 A/B，个人 Elo";
  S.zh.arenaTitle = "盲测竞技场";
  S.zh.arenaSub = "针对你的提示词给出两个匿名回答。选出更好的那个；投票后揭晓名字，并更新你的个人 Elo。仅在你的免费密钥可调用的模型间进行。";
  S.zh.arenaPool = "你的模型池：";
  S.zh.arenaPh = "输入一个你真正关心的任务…";
  S.zh.arenaGo = "开始盲测";
  S.zh.arenaNext = "再来一轮";
  S.zh.arenaNeedKeys = "竞技场至少需要两个可自动运行的模型。请在设置中添加免费 API 密钥（Google AI Studio、Groq、OpenRouter）。";
  S.zh.arenaModel = "模型";
  S.zh.arenaBetter = "更好";
  S.zh.arenaRunning = "生成中…";
  S.zh.arenaRoundErr = "有一方失败，本轮不计分。请再来一轮。";
  S.zh.arenaReveal = "揭晓：";
  S.zh.arenaBoard = "你的个人排行榜";
  S.zh.arenaGames = "轮";
  S.zh.arenaReset = "重置我的竞技场记录";
  S.zh.arenaNote = "这是你在自己提示词上的盲测偏好，不是全球质量排名；模型池仅包含你的密钥可运行的模型。";

  S.hi.navArena = "ब्लाइंड एरीना";
  S.hi.navArenaSub = "आपके प्रॉम्प्ट पर अंधाधुंध A/B, निजी Elo";
  S.hi.arenaTitle = "ब्लाइंड एरीना";
  S.hi.arenaSub = "आपके प्रॉम्प्ट के दो गुमनाम जवाब। बेहतर चुनें; वोट के बाद नाम खुलते हैं और आपका निजी Elo अपडेट होता है। केवल उन्हीं मॉडलों पर चलता है जिन्हें आपकी मुफ़्त कुंजियाँ चला सकती हैं।";
  S.hi.arenaPool = "आपका पूल:";
  S.hi.arenaPh = "कोई असली काम लिखें जो आपके लिए मायने रखता है…";
  S.hi.arenaGo = "ब्लाइंड राउंड चलाएँ";
  S.hi.arenaNext = "एक और राउंड";
  S.hi.arenaNeedKeys = "एरीना को कम से कम दो auto-run मॉडल चाहिए। Settings में मुफ़्त API कुंजियाँ (Google AI Studio, Groq, OpenRouter) जोड़ें।";
  S.hi.arenaModel = "मॉडल";
  S.hi.arenaBetter = "बेहतर है";
  S.hi.arenaRunning = "बना रहा है…";
  S.hi.arenaRoundErr = "एक जवाब विफल रहा, यह राउंड गिना नहीं जाएगा। दूसरा चलाएँ।";
  S.hi.arenaReveal = "खुलासा:";
  S.hi.arenaBoard = "आपकी निजी रैंकिंग";
  S.hi.arenaGames = "राउंड";
  S.hi.arenaReset = "मेरा एरीना इतिहास मिटाएँ";
  S.hi.arenaNote = "यह आपके प्रॉम्प्ट पर आपकी पसंद है, अंधे परीक्षण से मापी गई। यह वैश्विक रैंकिंग नहीं है; पूल में केवल वही मॉडल हैं जो आपकी कुंजियाँ चला सकती हैं।";

  S.ru.navArena = "Слепая арена";
  S.ru.navArenaSub = "Слепые A/B-раунды на ваших промптах, личный Elo";
  S.ru.arenaTitle = "Слепая арена";
  S.ru.arenaSub = "Два анонимных ответа на ВАШ промпт. Выберите лучший; имена раскрываются после голосования, личный Elo обновляется. Работает только с моделями, которые могут вызвать ваши бесплатные ключи.";
  S.ru.arenaPool = "Ваш пул:";
  S.ru.arenaPh = "Опишите реальную задачу, которая вам важна…";
  S.ru.arenaGo = "Запустить слепой раунд";
  S.ru.arenaNext = "Ещё раунд";
  S.ru.arenaNeedKeys = "Арене нужны минимум две auto-run модели. Добавьте бесплатные API-ключи (Google AI Studio, Groq, OpenRouter) в настройках.";
  S.ru.arenaModel = "Модель";
  S.ru.arenaBetter = "лучше";
  S.ru.arenaRunning = "Генерация…";
  S.ru.arenaRoundErr = "Одна сторона не ответила, раунд не засчитан. Запустите ещё один.";
  S.ru.arenaReveal = "Раскрыто:";
  S.ru.arenaBoard = "Ваш личный рейтинг";
  S.ru.arenaGames = "раундов";
  S.ru.arenaReset = "Сбросить историю арены";
  S.ru.arenaNote = "Это ВАШЕ предпочтение на ВАШИХ промптах, измеренное вслепую. Это не глобальный рейтинг; в пуле только модели, доступные вашим ключам.";

  S.ja.navArena = "ブラインドアリーナ";
  S.ja.navArenaSub = "あなたのプロンプトで匿名A/B対戦、パーソナルElo";
  S.ja.arenaTitle = "ブラインドアリーナ";
  S.ja.arenaSub = "あなたのプロンプトへの匿名回答2つ。良い方を選ぶと名前が明かされ、あなた専用のEloが更新されます。無料キーで呼べるモデル同士でのみ実行されます。";
  S.ja.arenaPool = "あなたのプール：";
  S.ja.arenaPh = "本当に気になるタスクを入力…";
  S.ja.arenaGo = "ブラインド対戦を実行";
  S.ja.arenaNext = "もう一戦";
  S.ja.arenaNeedKeys = "アリーナには自動実行できるモデルが2つ以上必要です。設定で無料APIキー（Google AI Studio、Groq、OpenRouter）を追加してください。";
  S.ja.arenaModel = "モデル";
  S.ja.arenaBetter = "が良い";
  S.ja.arenaRunning = "生成中…";
  S.ja.arenaRoundErr = "片方が失敗したため、この対戦はカウントされません。もう一度実行してください。";
  S.ja.arenaReveal = "正体：";
  S.ja.arenaBoard = "あなたのランキング";
  S.ja.arenaGames = "戦";
  S.ja.arenaReset = "アリーナ履歴をリセット";
  S.ja.arenaNote = "これはあなたのプロンプトに対するあなたの好みをブラインドで測ったものです。世界的な品質ランキングではなく、プールにはキーで実行できるモデルだけが含まれます。";

  S.ar.navArena = "الحلبة العمياء";
  S.ar.navArenaSub = "جولات A/B عمياء على موجّهاتك، تصنيف Elo شخصي";
  S.ar.arenaTitle = "الحلبة العمياء";
  S.ar.arenaSub = "إجابتان مجهولتان لموجّهك. اختر الأفضل؛ تُكشف الأسماء بعد التصويت ويتحدّث تصنيف Elo الشخصي. تعمل فقط على النماذج التي تستطيع مفاتيحك المجانية استدعاءها.";
  S.ar.arenaPool = "مجموعتك:";
  S.ar.arenaPh = "اكتب مهمة حقيقية تهمك…";
  S.ar.arenaGo = "ابدأ جولة عمياء";
  S.ar.arenaNext = "جولة أخرى";
  S.ar.arenaNeedKeys = "تحتاج الحلبة إلى نموذجين قابلين للتشغيل التلقائي على الأقل. أضف مفاتيح API مجانية (Google AI Studio وGroq وOpenRouter) في الإعدادات.";
  S.ar.arenaModel = "النموذج";
  S.ar.arenaBetter = "أفضل";
  S.ar.arenaRunning = "جارٍ التوليد…";
  S.ar.arenaRoundErr = "فشل أحد الطرفين، فلن تُحتسب هذه الجولة. ابدأ جولة أخرى.";
  S.ar.arenaReveal = "الكشف:";
  S.ar.arenaBoard = "ترتيبك الشخصي";
  S.ar.arenaGames = "جولات";
  S.ar.arenaReset = "امسح سجل الحلبة";
  S.ar.arenaNote = "هذا تفضيلك أنت على موجّهاتك أنت، مقاسًا بشكل أعمى. ليس ترتيبًا عالميًا للجودة؛ المجموعة تضم فقط النماذج التي تستطيع مفاتيحك تشغيلها.";

  var I18n = {
    LANGS: LANGS,
    STRINGS: S,
    t: function (lang, key) {
      var d = S[lang] || S.en;
      return d[key] !== undefined && d[key] !== "" ? d[key] : S.en[key];
    }
  };

  var root = typeof window !== "undefined" ? window : globalThis;
  root.PromptCompassI18n = I18n;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = I18n;
  }
})();
