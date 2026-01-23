pragma Singleton
import QtQuick

/**
 * LanguageContext - Internationalization / translations
 * Mirrors React's i18n.js with 19 languages
 */
QtObject {
    id: i18n
    
    // Alias for component compatibility
    property string currentLanguage: language
    
    // Current language - default to English
    property string language: "en"
    
    // Available languages
    readonly property var languageKeys: [
        "en", "es", "fr", "de", "ja", "zh", "pt", "nl", "it", "ko",
        "ru", "ar", "hi", "tr", "pl", "vi", "th", "sv", "uk"
    ]
    
    // Language metadata
    readonly property var languages: ({
        en: { name: "English", flag: "🇺🇸" },
        es: { name: "Español", flag: "🇪🇸" },
        fr: { name: "Français", flag: "🇫🇷" },
        de: { name: "Deutsch", flag: "🇩🇪" },
        ja: { name: "日本語", flag: "🇯🇵" },
        zh: { name: "中文", flag: "🇨🇳" },
        pt: { name: "Português", flag: "🇧🇷" },
        nl: { name: "Nederlands", flag: "🇳🇱" },
        it: { name: "Italiano", flag: "🇮🇹" },
        ko: { name: "한국어", flag: "🇰🇷" },
        ru: { name: "Русский", flag: "🇷🇺" },
        ar: { name: "العربية", flag: "🇸🇦" },
        hi: { name: "हिंदी", flag: "🇮🇳" },
        tr: { name: "Türkçe", flag: "🇹🇷" },
        pl: { name: "Polski", flag: "🇵🇱" },
        vi: { name: "Tiếng Việt", flag: "🇻🇳" },
        th: { name: "ไทย", flag: "🇹🇭" },
        sv: { name: "Svenska", flag: "🇸🇪" },
        uk: { name: "Українська", flag: "🇺🇦" }
    })
    
    // Translations
    readonly property var translations: ({
        en: {
            // Navigation
            tasks: "Tasks",
            newTask: "New Task",
            profile: "Profile",
            taskDetail: "Task Detail",
            documentation: "Documentation",
            
            // Settings
            nerdMode: "Nerd Mode",
            theme: "Theme",
            language: "Language",
            
            // Task List
            filter: "Filter",
            limit: "Limit",
            current: "Current",
            archived: "Archived",
            all: "All",
            noTasks: "No tasks found",
            tasksCount: "tasks",
            view: "View",
            getPatch: "Get Patch",
            archive: "Archive",
            noRepo: "No repo",
            untitledTask: "Untitled Task",
            
            // Task Detail
            backToTasks: "Back to Tasks",
            details: "Details",
            turns: "Turns",
            patch: "Patch",
            createPR: "Create PR",
            prCreated: "PR created successfully!",
            failedCreatePR: "Failed to create PR",
            copied: "Copied to clipboard!",
            loadPatch: "Load Patch",
            noPatch: "No patch data available",
            rawTaskData: "Raw Task Data",
            currentTurn: "Current Turn",
            lines: "lines",
            
            // New Prompt
            createNewTask: "Create New Task",
            sendPromptDesc: "Send a prompt to Codex to create a new coding task",
            taskPrompt: "Task Prompt",
            promptPlaceholder: "Describe what you want Codex to do...",
            branch: "Branch",
            bestOf: "Best Of",
            creating: "Creating...",
            taskCreated: "Task created successfully!",
            failedCreate: "Failed to create task",
            enterPrompt: "Please enter a prompt",
            tips: "Tips",
            tip1: "Be specific about what you want Codex to implement",
            tip2: "Mention file paths if you know them",
            tip3: "Include any constraints or requirements",
            tip4: "Use \"Best Of\" > 1 to generate multiple solutions and pick the best",
            
            // User Info
            loading: "Loading...",
            apiConnection: "API Connection",
            connected: "Connected",
            disconnected: "Disconnected",
            unknown: "Unknown",
            connectedDesc: "Your session is active and connected to Codex API",
            disconnectedDesc: "Could not connect to Codex API. Please check your authentication.",
            apiBase: "API Base",
            refresh: "Refresh",
            accountInfo: "Account Information",
            noName: "No Name",
            userId: "User ID",
            organization: "Organization",
            role: "Role",
            connectionStatus: "Connection Status",
            authRequired: "Authentication required",
            apiInfo: "API Information",
            apiEndpoint: "API Endpoint",
            requestCount: "Request Count",
            
            // Documentation
            gettingStarted: "Getting Started",
            usingUI: "Using the UI",
            apiReference: "API Reference",
            cliCommands: "CLI Commands",
            authentication: "Authentication",
            installation: "Installation",
            quickStart: "Quick Start",
            quickStartDesc: "Here's how to get started with Codex Task Runner",
            configDesc: "Configure your environment with the following settings",
            gettingStartedIntro: "Welcome to Codex Task Runner! This guide will help you get started.",
            usingUIIntro: "The UI provides an intuitive way to manage your coding tasks.",
            navigation: "Navigation",
            navigationDesc: "Use the drawer menu to navigate between sections:",
            navTasks: "Tasks - View and manage your coding tasks",
            navNewPrompt: "New Prompt - Create new tasks by sending prompts",
            navAccount: "Account - View your profile and connection status",
            navDocs: "Documentation - Access help and API documentation",
            taskList: "Task List",
            taskListDesc: "Filter and browse tasks with different status filters and limits.",
            taskDetailDesc: "View task details, turns, patches, and create pull requests.",
            keyboardShortcuts: "Keyboard Shortcuts",
            apiReferenceIntro: "Complete API reference for the Codex Task Runner backend.",
            getTasksDesc: "List all tasks with optional filtering",
            getTaskDesc: "Get detailed information about a specific task",
            postPromptDesc: "Create a new coding task from a prompt",
            createPRDesc: "Create a pull request from task changes",
            cliCommandsIntro: "Command-line interface for power users.",
            cliTasksDesc: "List and filter tasks from the command line",
            cliRunDesc: "Run a new task with a prompt",
            cliPollDesc: "Poll a task for status updates",
            cliPRDesc: "Create a pull request for a task",
            authenticationIntro: "Authentication methods and security best practices.",
            apiKey: "API Key",
            apiKeyDesc: "Use an API key for server-to-server authentication",
            sessionCookie: "Session Cookie",
            sessionCookieDesc: "Browser sessions use secure HTTP-only cookies",
            securityTips: "Security Tips",
            securityTip1: "Never share your API key or session cookie",
            securityTip2: "Use environment variables for sensitive data",
            securityTip3: "Rotate API keys periodically",
            securityTip4: "Use HTTPS in production",
            
            // Search
            search: "Search",
            searchPlaceholder: "Search tasks, code, patches...",
            noResults: "No results found",
            searchHelp: "Enter a search term to find tasks or code",
            code: "Code",
            
            // AJAX Queue
            requests: "Requests"
        },
        
        es: {
            tasks: "Tareas",
            newTask: "Nueva Tarea",
            profile: "Perfil",
            taskDetail: "Detalle de Tarea",
            documentation: "Documentación",
            nerdMode: "Modo Nerd",
            theme: "Tema",
            language: "Idioma",
            filter: "Filtro",
            limit: "Límite",
            current: "Actual",
            archived: "Archivado",
            all: "Todos",
            noTasks: "No se encontraron tareas",
            tasksCount: "tareas",
            view: "Ver",
            getPatch: "Obtener Parche",
            archive: "Archivar",
            noRepo: "Sin repo",
            untitledTask: "Tarea sin título",
            backToTasks: "Volver a Tareas",
            details: "Detalles",
            turns: "Turnos",
            patch: "Parche",
            createPR: "Crear PR",
            prCreated: "¡PR creado exitosamente!",
            failedCreatePR: "Error al crear PR",
            copied: "¡Copiado al portapapeles!",
            loadPatch: "Cargar Parche",
            noPatch: "No hay datos de parche disponibles",
            rawTaskData: "Datos Brutos de Tarea",
            currentTurn: "Turno Actual",
            lines: "líneas",
            createNewTask: "Crear Nueva Tarea",
            sendPromptDesc: "Envía un prompt a Codex para crear una nueva tarea de código",
            taskPrompt: "Prompt de Tarea",
            promptPlaceholder: "Describe lo que quieres que Codex haga...",
            branch: "Rama",
            bestOf: "Mejor de",
            creating: "Creando...",
            taskCreated: "¡Tarea creada exitosamente!",
            failedCreate: "Error al crear tarea",
            enterPrompt: "Por favor ingresa un prompt",
            tips: "Consejos",
            tip1: "Sé específico sobre lo que quieres que Codex implemente",
            tip2: "Menciona las rutas de archivos si las conoces",
            tip3: "Incluye restricciones o requisitos",
            tip4: "Usa \"Mejor de\" > 1 para generar múltiples soluciones",
            loading: "Cargando...",
            apiConnection: "Conexión API",
            connected: "Conectado",
            disconnected: "Desconectado",
            unknown: "Desconocido",
            connectedDesc: "Tu sesión está activa y conectada a la API de Codex",
            disconnectedDesc: "No se pudo conectar a la API. Verifica tu autenticación.",
            apiBase: "Base API",
            refresh: "Actualizar",
            accountInfo: "Información de Cuenta",
            connectionStatus: "Estado de Conexión",
            gettingStarted: "Primeros Pasos",
            usingUI: "Usando la UI",
            apiReference: "Referencia API",
            cliCommands: "Comandos CLI",
            authentication: "Autenticación",
            search: "Buscar",
            searchPlaceholder: "Buscar tareas, código, parches...",
            noResults: "Sin resultados",
            code: "Código",
            requests: "Solicitudes"
        },
        
        fr: {
            tasks: "Tâches",
            newTask: "Nouvelle Tâche",
            profile: "Profil",
            taskDetail: "Détail de Tâche",
            documentation: "Documentation",
            nerdMode: "Mode Nerd",
            theme: "Thème",
            language: "Langue",
            filter: "Filtre",
            limit: "Limite",
            current: "Actuel",
            archived: "Archivé",
            all: "Tous",
            noTasks: "Aucune tâche trouvée",
            tasksCount: "tâches",
            view: "Voir",
            getPatch: "Obtenir Patch",
            archive: "Archiver",
            backToTasks: "Retour aux Tâches",
            details: "Détails",
            turns: "Tours",
            patch: "Patch",
            createPR: "Créer PR",
            createNewTask: "Créer Nouvelle Tâche",
            loading: "Chargement...",
            connected: "Connecté",
            disconnected: "Déconnecté",
            refresh: "Rafraîchir",
            search: "Rechercher",
            noResults: "Aucun résultat",
            code: "Code",
            requests: "Requêtes"
        },
        
        de: {
            tasks: "Aufgaben",
            newTask: "Neue Aufgabe",
            profile: "Profil",
            taskDetail: "Aufgabendetail",
            documentation: "Dokumentation",
            nerdMode: "Nerd-Modus",
            theme: "Thema",
            language: "Sprache",
            filter: "Filter",
            limit: "Limit",
            current: "Aktuell",
            archived: "Archiviert",
            all: "Alle",
            noTasks: "Keine Aufgaben gefunden",
            view: "Ansehen",
            backToTasks: "Zurück zu Aufgaben",
            details: "Details",
            turns: "Runden",
            patch: "Patch",
            createPR: "PR erstellen",
            createNewTask: "Neue Aufgabe erstellen",
            loading: "Laden...",
            connected: "Verbunden",
            disconnected: "Getrennt",
            refresh: "Aktualisieren",
            search: "Suchen",
            noResults: "Keine Ergebnisse",
            code: "Code",
            requests: "Anfragen"
        },
        
        ja: {
            tasks: "タスク",
            newTask: "新規タスク",
            profile: "プロフィール",
            taskDetail: "タスク詳細",
            documentation: "ドキュメント",
            nerdMode: "ナードモード",
            theme: "テーマ",
            language: "言語",
            filter: "フィルター",
            limit: "制限",
            current: "現在",
            archived: "アーカイブ済み",
            all: "すべて",
            noTasks: "タスクが見つかりません",
            view: "表示",
            backToTasks: "タスクに戻る",
            details: "詳細",
            turns: "ターン",
            patch: "パッチ",
            createPR: "PRを作成",
            createNewTask: "新規タスクを作成",
            loading: "読み込み中...",
            connected: "接続済み",
            disconnected: "切断",
            refresh: "更新",
            search: "検索",
            noResults: "結果なし",
            code: "コード",
            requests: "リクエスト"
        },
        
        zh: {
            tasks: "任务",
            newTask: "新任务",
            profile: "个人资料",
            taskDetail: "任务详情",
            documentation: "文档",
            nerdMode: "极客模式",
            theme: "主题",
            language: "语言",
            filter: "筛选",
            limit: "限制",
            current: "当前",
            archived: "已归档",
            all: "全部",
            noTasks: "未找到任务",
            view: "查看",
            backToTasks: "返回任务",
            details: "详情",
            turns: "轮次",
            patch: "补丁",
            createPR: "创建PR",
            createNewTask: "创建新任务",
            loading: "加载中...",
            connected: "已连接",
            disconnected: "已断开",
            refresh: "刷新",
            search: "搜索",
            noResults: "无结果",
            code: "代码",
            requests: "请求"
        },
        
        ko: {
            tasks: "작업",
            newTask: "새 작업",
            profile: "프로필",
            documentation: "문서",
            nerdMode: "너드 모드",
            theme: "테마",
            language: "언어",
            filter: "필터",
            current: "현재",
            archived: "보관됨",
            all: "전체",
            view: "보기",
            loading: "로딩 중...",
            connected: "연결됨",
            refresh: "새로고침",
            search: "검색",
            requests: "요청"
        },
        
        ru: {
            tasks: "Задачи",
            newTask: "Новая задача",
            profile: "Профиль",
            documentation: "Документация",
            nerdMode: "Режим гика",
            theme: "Тема",
            language: "Язык",
            filter: "Фильтр",
            current: "Текущие",
            archived: "Архив",
            all: "Все",
            view: "Просмотр",
            loading: "Загрузка...",
            connected: "Подключено",
            refresh: "Обновить",
            search: "Поиск",
            requests: "Запросы"
        }
        // Additional languages follow same pattern...
    })
    
    /**
     * Set language
     */
    function setLanguage(lang) {
        if (languages[lang]) {
            language = lang
            currentLanguage = lang
        }
    }
    
    /**
     * Get translation for key
     */
    function t(key) {
        const langTranslations = translations[language]
        if (langTranslations && langTranslations[key]) {
            return langTranslations[key]
        }
        // Fallback to English
        if (translations.en && translations.en[key]) {
            return translations.en[key]
        }
        return key
    }
    
    /**
     * Get language info
     */
    function getLanguageInfo(lang) {
        return languages[lang] || languages.en
    }
}
