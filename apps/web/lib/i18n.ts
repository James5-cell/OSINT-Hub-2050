export type Locale = "en" | "zh-TW";
export const LOCALES: readonly Locale[] = ["en", "zh-TW"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_LABELS: Record<Locale, string> = {
  en:      "EN",
  "zh-TW": "中文",
};

/* ══════════════════════════════════════════════════════════════
   DICTIONARY INTERFACE
   ══════════════════════════════════════════════════════════════ */
interface Dict {
  nav: {
    index:     string;
    workflows: string;
    search:    string;
  };

  footer: {
    tagline:         string;
    taglineZh:       string;
    quickLinks:      string;
    builtOn:         string;
    upstreamRepo:    string;
    upstreamAuthor:  string;
    attributionDesc: string;
    copyright:       string;
    openSource:      string;
    mitLicense:      string;
    viewSource:      string;
  };

  hero: {
    searchPlaceholder: string;
    /** Full sentence — rendered without a separate <kbd> element. */
    pressEnter:        string;
    toolsIndexed:      string; // {n}
    titleMain:         string;
    titleAccent:       string;
    subtitle:          string;
  };

  search: {
    title:          string;
    topMatches:     string;
    tools:          string;
    workflows:      string;
    categories:     string;
    noResults:      string;  // {q}
    noResultsHint:  string;
    resultCount:    string;  // {n}
    commonSearches: string[];
    browse:         string;
    toolCount:      string;  // {n}
    filters:        string;
    filterLevel:    string;
    filterMode:     string;
    filterAccess:   string;
    clearFilters:   string;
    recentSearches: string;
    clearHistory:   string;
    topMatch:       string;
    viewDetails:    string;
    moreResults:    string;  // {n}
    clearSearch:    string;
    searchAction:   string;
    searchBy:       string;
    placeholder:    string;
  };

  tool: {
    inspect:       string;
    openTool:      string;
    noDescription: string;
    useCases:      string;
    ethicsNote:    string;
    description:   string;
    targets:       string;
    platforms:     string;
    tags:          string;
    pricing:       string;
    difficulty:    string;
    review:        string;
    source:         string;
    originalSource: string;
    legalNote:      string;
    caution:        string;
    offline:        string;
    reviewReviewed: string;
    reviewRejected: string;
    reviewPending:  string;
  };

  workflow: {
    /* Page / section headers */
    investigationPlaybooks: string;
    guidedWorkflows:        string;
    sectionLabel:           string; // "// guided workflows"
    stepByStepDesc:         string;
    passiveFirstDesc:       string;
    workflowsAvailable:     string; // {n}
    noWorkflows:            string;
    /* Metadata labels */
    difficulty:             string;
    estimatedTime:          string;
    stepsCount:             string; // {n}
    riskLevel:              string;
    startingPoint:          string;
    endGoal:                string;
    metadata:               string;
    publicSafe:             string;
    authNeeded:             string;
    forGroups:              string;
    signals:                string;
    yes:                    string;
    no:                     string;
    /* Body section labels */
    ethicalCheckpoint:      string;
    investigationSteps:     string;
    whatToDo:               string;
    tools:                  string;
    whatToLookFor:          string;
    commonPitfall:          string;
    safetyNote:             string;
    relatedTools:           string;
    relatedCategories:      string;
    backToWorkflows:        string;
    /* Breadcrumb */
    allWorkflows:           string;
    /* Misc */
    step:                   string;
    moreTools:              string; // +{n} more
  };

  /** Translatable enum values */
  labels: {
    difficulty: Record<string, string>;
    riskLevel:  Record<string, string>;
    safetyBadge: Record<string, string>;
    pricing:    Record<string, string>;
    platforms:  Record<string, string>;
    targets:    Record<string, string>;
  };

  settings: {
    title:                      string;
    close:                      string;
    /* Language */
    language:                   string;
    /* Safety */
    safetyDisplay:              string;
    showFullEthicalGuidance:    string;
    showFullEthicalGuidanceHint: string;
    /* Navigation */
    navigation:                 string;
    defaultStartView:           string;
    startViewIndex:             string;
    startViewWorkflows:         string;
    startViewSearch:            string;
    /* Appearance */
    appearance:                 string;
    theme:                      string;
    themePlanned:               string;
    themeDark:                  string;
    themeLight:                 string;
    preferences:                string;
    defaultCategoryFilter:      string;
  };

  common: {
    backToIndex:          string;
    comingSoon:           string;
    plannedCategories:    string;
    ethicsDisclaimer:     string;
    categoryNotFound:     string;
    categoryNotFoundDesc: string;
    categoryIndexing:     string;
    toolsCountInCategory: string;
    investigatingTitle:   string;
    investigatingSubtitle: string;
    soonBadge:            string;
    goHome:               string;
    recommendedStarts:    string;
    clear:                string;
    closePanel:           string;
    notIndexed:           string;
  };

  categories: Record<string, {
    name:        string;
    description: string;
    detail:      string;
  }>;
  seo: {
    title:       string;
    description: string;
  };
}

/* ══════════════════════════════════════════════════════════════
   ENGLISH
   ══════════════════════════════════════════════════════════════ */
const en: Dict = {
  nav: {
    index:     "Index",
    workflows: "Workflows",
    search:    "Search",
  },

  footer: {
    tagline:         "A curated, workflow-guided OSINT tool index.",
    taglineZh:       "最容易開始、最安全、最有工作流指引的 OSINT 工具索引。",
    quickLinks:      "Quick Links",
    builtOn:         "Built on",
    upstreamRepo:    "Awesome-OSINT-For-Everything",
    upstreamAuthor:  "@Astrosp",
    attributionDesc: "OSINT Hub adds workflow guidance, ethical annotations, and bilingual descriptions to the upstream source.",
    copyright:       "© 2026 OSINT Hub",
    openSource:      "Open source",
    mitLicense:      "MIT License",
    viewSource:      "View source ↗",
  },

  hero: {
    searchPlaceholder: `Try "username", "domain", "image verification", or "beginner"`,
    pressEnter:        "Press Enter to search across tools, workflows, and categories.",
    toolsIndexed:      "{n} tools indexed",
    titleMain:         "Find the right OSINT tool",
    titleAccent:       "for the job.",
    subtitle:
      "A scenario-based index for public-source research, verification, and defensive intelligence workflows.",
  },

  search: {
    title:         "Search",
    topMatches:    "Top Matches",
    topMatch:      "Top Match",
    tools:         "Tools",
    workflows:     "Workflows",
    categories:    "Categories",
    noResults:     `No results for "{q}"`,
    noResultsHint: "Try a broader term, or explore by category below.",
    resultCount:   "{n} result",
    commonSearches: ["username", "domain", "email", "image verification", "beginner"],
    browse:         "Browse by Category",
    toolCount:      "{n} tools",
    filters:        "Filters",
    filterLevel:    "Level",
    filterMode:     "Mode",
    filterAccess:   "Access",
    clearFilters:   "Clear filters",
    recentSearches: "Recent Searches",
    clearHistory:   "Clear history",
    viewDetails:    "View details",
    moreResults:    "+{n} more — refine your search or adjust filters",
    clearSearch:    "Clear search",
    searchAction:   "Search",
    searchBy:       "Search tools by name, description, or tag",
    placeholder:    "Search tools...",
  },

  tool: {
    inspect:       "Inspect",
    openTool:      "Open tool",
    noDescription: "No description available.",
    useCases:      "Use Cases",
    ethicsNote:    "Use with care",
    description:   "Description",
    targets:       "Targets",
    platforms:     "Platforms",
    tags:          "Tags",
    pricing:       "Pricing",
    difficulty:    "Difficulty",
    review:        "Review",
    source:         "Source",
    originalSource: "Original Source",
    legalNote:      "Use only for lawful, authorized, and public-source research.",
    caution:        "Caution",
    offline:        "Offline?",
    reviewReviewed: "Manually reviewed",
    reviewRejected: "Rejected",
    reviewPending:  "AI candidate — pending review",
  },

  workflow: {
    investigationPlaybooks: "Investigation Playbooks",
    guidedWorkflows:        "Guided Investigation Workflows",
    sectionLabel:           "// guided workflows",
    stepByStepDesc:
      "Step-by-step investigation playbooks for public-source research.",
    passiveFirstDesc:       "Passive-first methodology. Safety checkpoints included.",
    workflowsAvailable:     "{n} workflows available",
    noWorkflows:            "No workflows available.",
    difficulty:             "Difficulty",
    estimatedTime:          "Estimated Time",
    stepsCount:             "{n} steps",
    riskLevel:              "Risk Level",
    startingPoint:          "Starting Point",
    endGoal:                "End Goal",
    metadata:               "Metadata",
    publicSafe:             "Public Safe",
    authNeeded:             "Auth Needed",
    forGroups:              "For",
    signals:                "Signals",
    yes:                    "Yes",
    no:                     "No",
    ethicalCheckpoint:      "Ethical Checkpoint",
    investigationSteps:     "// investigation steps",
    whatToDo:               "What to do",
    tools:                  "Tools",
    whatToLookFor:          "What to look for",
    commonPitfall:          "Pitfalls",
    safetyNote:             "Safety",
    relatedTools:           "Related Tools",
    relatedCategories:      "Related Categories",
    backToWorkflows:        "← All workflows",
    allWorkflows:           "Workflows",
    step:                   "Step",
    moreTools:              "+{n} more",
  },

  labels: {
    difficulty: {
      beginner:     "Beginner",
      intermediate: "Intermediate",
      advanced:     "Advanced",
      unknown:      "Unknown",
    },
    riskLevel: {
      low:    "Low Risk",
      medium: "Medium Risk",
      high:   "High Risk",
    },
    safetyBadge: {
      "passive-first":          "Passive First",
      "use-with-care":          "Use with Care",
      "requires-authorization": "Requires Authorization",
    },
    pricing: {
      free:          "Free",
      freemium:      "Freemium",
      paid:          "Paid",
      "open-source": "Open Source",
      unknown:       "Unknown",
    },
    platforms: {
      web:               "Web",
      cli:               "CLI",
      api:               "API",
      desktop:           "Desktop",
      mobile:            "Mobile",
      "browser-extension": "Browser Extension",
      other:             "Other",
    },
    targets: {
      person:         "Person",
      email:          "Email",
      phone:          "Phone",
      username:       "Username",
      domain:         "Domain",
      ip:             "IP Address",
      organization:   "Organization",
      cryptocurrency: "Cryptocurrency",
      image:          "Image",
      vehicle:        "Vehicle",
      "social-media": "Social Media",
      document:       "Document",
      network:        "Network",
      geolocation:    "Geolocation",
      other:          "Other",
    },
  },

  settings: {
    title:                       "Settings",
    close:                       "Close",
    language:                    "Language",
    safetyDisplay:               "Safety Display",
    showFullEthicalGuidance:     "Show full ethical guidance",
    showFullEthicalGuidanceHint: "When off, safety indicators remain visible but are more compact.",
    navigation:                  "Navigation",
    defaultStartView:            "Default start view",
    startViewIndex:              "Investigation Index",
    startViewWorkflows:          "Workflows",
    startViewSearch:             "Search",
    appearance:                  "Appearance",
    theme:                       "Theme",
    themePlanned:                "Planned",
    themeDark:                   "Dark",
    themeLight:                  "Light",
    preferences:                 "Preferences",
    defaultCategoryFilter:       "Default category filter",
  },

  common: {
    backToIndex:       "← Back to Index",
    comingSoon:        "Coming soon",
    plannedCategories: "Planned categories",
    ethicsDisclaimer:  "For lawful, authorized, public-source research only.",
    categoryNotFound:     "Category not found",
    categoryNotFoundDesc: "This investigation category does not exist.",
    categoryIndexing:     "Tools for this category are being indexed.",
    toolsCountInCategory: "{n} tools in this category",
    investigatingTitle:   "What are you investigating?",
    investigatingSubtitle: "Select a category to open the tool set.",
    soonBadge:            "SOON",
    goHome:               "Go to home page",
    recommendedStarts:    "Recommended starting points",
    clear:                "clear",
    closePanel:           "Close panel",
    notIndexed:           "not yet indexed",
  },

  categories: {
    people: {
      name: "People & Identity",
      description: "Verify identities and trace personal records across public sources.",
      detail: "Aggregate public records, social profiles, and cross-referenced data points to verify an individual's identity or trace their digital and physical activity footprint."
    },
    usernames: {
      name: "Usernames",
      description: "Enumerate accounts and map social presence from a username.",
      detail: "Search hundreds of platforms for a given username to build a cross-platform presence map, surface aliases, and establish social footprints for persons of interest."
    },
    emails: {
      name: "Emails",
      description: "Investigate email addresses, breach exposure, and associated identities.",
      detail: "Verify email validity, check for breach exposure, resolve associated identities, and enumerate connected services from a single email address."
    },
    domains: {
      name: "Domains",
      description: "Enumerate infrastructure, certificates, and subdomains for a target domain.",
      detail: "Map a domain's full infrastructure including DNS records, WHOIS data, certificate transparency logs, and subdomain enumeration to understand its attack surface."
    },
    ips: {
      name: "IPs & Infrastructure",
      description: "Map exposed hosts, services, and network topology.",
      detail: "Scan and query internet-facing IP addresses for open ports, running services, banner information, and geographic context to map an organization's network footprint."
    },
    social: {
      name: "Social Media",
      description: "Verify accounts, trace activity, and analyze social graphs.",
      detail: "Cross-reference social media accounts to verify authenticity, trace activity history, detect coordinated behavior, and map relationships between accounts."
    },
    images: {
      name: "Images & Geolocation",
      description: "Extract metadata, verify provenance, and geolocate images.",
      detail: "Extract EXIF metadata including GPS coordinates and device fingerprints from images, perform reverse image searches, and verify the origin and authenticity of visual content."
    },
    companies: {
      name: "Companies & Organizations",
      description: "Research organizational structure, filings, and public exposure.",
      detail: "Investigate corporate entities through public filings, registration records, personnel data, and their network and web infrastructure exposure."
    },
    leaks: {
      name: "Leaks & Breaches",
      description: "Search credential databases and leaked datasets for exposure.",
      detail: "Query known data breach collections and leaked credential datasets to determine exposure of email addresses, usernames, and passwords across historical incidents."
    },
    crypto: {
      name: "Cryptocurrency",
      description: "Trace wallet addresses, transactions, and on-chain activity.",
      detail: "Analyze blockchain transactions, trace wallet addresses, identify exchange flows, and cluster related addresses to follow cryptocurrency movements."
    },
    threat: {
      name: "Threat Intelligence",
      description: "Correlate indicators of compromise across threat data sources.",
      detail: "Search threat intelligence feeds and internet scan data to correlate IPs, domains, and certificates against known malicious indicators and attack infrastructure."
    },
    documents: {
      name: "Documents & Metadata",
      description: "Analyze file metadata, authorship, and document history.",
      detail: "Extract authorship details, software fingerprints, revision history, and embedded metadata from documents to establish provenance and attribution."
    },
    phones: {
      name: "Phone Numbers",
      description: "Investigate phone numbers, carrier data, and caller identity.",
      detail: "Look up phone number ownership, carrier, geographic origin, and public associations to verify caller identity or map contact networks. Use only for authorized research."
    },
    government: {
      name: "Government & Public Records",
      description: "Search court filings, company registers, and official databases.",
      detail: "Access publicly available government records including court documents, corporate filings, regulatory data, sanctions lists, and FOIA-released materials for investigative research."
    },
    "ai-osint": {
      name: "AI-Assisted OSINT",
      description: "Detect AI-generated content, deepfakes, and assist analysis.",
      detail: "Leverage AI-powered tools for detecting synthetic media, verifying image authenticity, capturing web evidence, and augmenting investigative research workflows."
    },
    malware: {
      name: "Malware & File Analysis",
      description: "Triage suspicious URLs, files, and malware samples safely.",
      detail: "Analyze suspicious files, URLs, and domains in sandboxed environments. Query threat intelligence feeds and malware repositories for defensive triage without executing unknown code locally."
    },
    darkweb: {
      name: "Dark Web & Tor",
      description: "Monitor public Tor services and detect dark web mentions.",
      detail: "Search publicly indexed Tor hidden services and dark web archives for defensive monitoring, brand protection, and public-interest research. Always frame usage within lawful, authorized contexts."
    },
    rf: {
      name: "Radio & RF Intelligence",
      description: "Monitor public radio frequencies, ADS-B, and signal intelligence.",
      detail: "Track aircraft via ADS-B, monitor public maritime traffic, analyze publicly broadcast radio signals, and map RF activity for open-source signals intelligence research."
    },
    iot: {
      name: "IoT & Smart Devices",
      description: "Discover and analyze exposed IoT devices and smart infrastructure.",
      detail: "Identify publicly accessible IoT devices, smart home infrastructure, and embedded systems through open-source scan data — for exposure assessment and defensive research."
    },
    opsec: {
      name: "Privacy / Investigator Safety",
      description: "Protect analyst identity and maintain operational security.",
      detail: "Tools and practices for maintaining investigator anonymity, securing communications, compartmentalizing research environments, and verifying your own digital footprint before conducting sensitive investigations."
    }
  },
  seo: {
    title:       "OSINT Hub — Operational Intelligence Index",
    description: "A scenario-based index of public-source intelligence tools for research, verification, and defensive workflows. 51 tools. 8 guided workflows."
  }
};

/* ══════════════════════════════════════════════════════════════
   TRADITIONAL CHINESE
   ══════════════════════════════════════════════════════════════ */
const zhTW: Dict = {
  nav: {
    index:     "工具索引",
    workflows: "調查流程",
    search:    "搜尋",
  },

  footer: {
    tagline:         "A curated, workflow-guided OSINT tool index.",
    taglineZh:       "最容易開始、最安全、最有工作流指引的 OSINT 工具索引。",
    quickLinks:      "快速連結",
    builtOn:         "資料來源",
    upstreamRepo:    "Awesome-OSINT-For-Everything",
    upstreamAuthor:  "@Astrosp",
    attributionDesc: "OSINT Hub 在原始資料來源的基礎上，增加了工作流程指引、倫理標注和雙語描述。",
    copyright:       "© 2026 OSINT Hub",
    openSource:      "開源",
    mitLicense:      "MIT 授權",
    viewSource:      "檢視原始碼 ↗",
  },

  hero: {
    searchPlaceholder: "搜尋工具、目標類型或調查情境，例如 username、domain…",
    pressEnter:        "按 Enter 搜尋工具、調查流程與分類。",
    toolsIndexed:      "已收錄 {n} 個工具",
    titleMain:         "尋找適合的 OSINT 工具",
    titleAccent:       "助力調查工作。",
    subtitle:          "以情境為核心的公開資訊調查工具索引，涵蓋驗證與防禦性情報工作流程。",
  },

  search: {
    title:         "搜尋",
    topMatches:    "最佳匹配",
    topMatch:      "最佳匹配",
    tools:         "工具",
    workflows:     "調查流程",
    categories:    "分類",
    noResults:     "找不到「{q}」的結果",
    noResultsHint: "試試更寬泛的關鍵字，或按分類瀏覽。",
    resultCount:   "{n} 個結果",
    commonSearches: ["username", "domain", "email", "image verification", "beginner"],
    browse:         "按分類瀏覽",
    toolCount:      "{n} 個工具",
    filters:        "篩選",
    filterLevel:    "難度",
    filterMode:     "付費方式",
    filterAccess:   "平台",
    clearFilters:   "清除篩選",
    recentSearches: "最近搜尋",
    clearHistory:   "清除記錄",
    viewDetails:    "查看詳情",
    moreResults:    "還有 {n} 個結果 — 嘗試更精確的關鍵字",
    clearSearch:    "清除搜尋",
    searchAction:   "搜尋",
    searchBy:       "按名稱、說明或標籤搜尋工具",
    placeholder:    "搜尋工具...",
  },

  tool: {
    inspect:       "查看詳情",
    openTool:      "開啟工具",
    noDescription: "暫無說明。",
    useCases:      "使用情境",
    ethicsNote:    "謹慎使用",
    description:   "說明",
    targets:       "目標類型",
    platforms:     "平台",
    tags:          "標籤",
    pricing:       "收費模式",
    difficulty:    "難度",
    review:        "審核狀態",
    source:         "來源",
    originalSource: "原始來源",
    legalNote:      "僅限合法、獲授權的公開資訊研究用途。",
    caution:        "警示",
    offline:        "離線？",
    reviewReviewed: "人工審核完成",
    reviewRejected: "未通過",
    reviewPending:  "AI 候選（待手動審核）",
  },

  workflow: {
    investigationPlaybooks: "調查流程手冊",
    guidedWorkflows:        "引導式調查流程",
    sectionLabel:           "// 調查流程",
    stepByStepDesc:         "逐步調查手冊，適用於公開資訊研究。",
    passiveFirstDesc:       "被動優先方法論，內含安全檢核點。",
    workflowsAvailable:     "共 {n} 個調查流程",
    noWorkflows:            "暫無調查流程。",
    difficulty:             "難度",
    estimatedTime:          "預計時間",
    stepsCount:             "{n} 個步驟",
    riskLevel:              "風險等級",
    startingPoint:          "調查起點",
    endGoal:                "調查目標",
    metadata:               "基本資訊",
    publicSafe:             "公開安全",
    authNeeded:             "需要授權",
    forGroups:              "適用對象",
    signals:                "調查信號",
    yes:                    "是",
    no:                     "否",
    ethicalCheckpoint:      "倫理檢核點",
    investigationSteps:     "// 調查步驟",
    whatToDo:               "操作說明",
    tools:                  "工具",
    whatToLookFor:          "觀察重點",
    commonPitfall:          "常見錯誤",
    safetyNote:             "安全注意",
    relatedTools:           "相關工具",
    relatedCategories:      "相關分類",
    backToWorkflows:        "← 所有流程",
    allWorkflows:           "調查流程",
    step:                   "步驟",
    moreTools:              "+{n} 個更多",
  },

  labels: {
    difficulty: {
      beginner:     "初階",
      intermediate: "中階",
      advanced:     "進階",
      unknown:      "未知",
    },
    riskLevel: {
      low:    "低風險",
      medium: "中等風險",
      high:   "高風險",
    },
    safetyBadge: {
      "passive-first":          "被動優先",
      "use-with-care":          "謹慎使用",
      "requires-authorization": "需要授權",
    },
    pricing: {
      free:          "免費",
      freemium:      "部分免費",
      paid:          "付費",
      "open-source": "開源",
      unknown:       "未知",
    },
    platforms: {
      web:               "網頁",
      cli:               "CLI",
      api:               "API",
      desktop:           "桌面應用",
      mobile:            "行動裝置",
      "browser-extension": "瀏覽器擴充",
      other:             "其他",
    },
    targets: {
      person:         "人物",
      email:          "電子郵件",
      phone:          "電話",
      username:       "用戶名",
      domain:         "域名",
      ip:             "IP 地址",
      organization:   "組織",
      cryptocurrency: "加密貨幣",
      image:          "圖像",
      vehicle:        "車輛",
      "social-media": "社交媒體",
      document:       "文件",
      network:        "網路",
      geolocation:    "地理位置",
      other:          "其他",
    },
  },

  settings: {
    title:                       "設定",
    close:                       "關閉",
    language:                    "語言",
    safetyDisplay:               "安全顯示",
    showFullEthicalGuidance:     "顯示完整倫理指引",
    showFullEthicalGuidanceHint: "關閉後，安全警示仍會顯示，但將以精簡模式呈現。",
    navigation:                  "導覽",
    defaultStartView:            "預設起始畫面",
    startViewIndex:              "工具索引",
    startViewWorkflows:          "調查流程",
    startViewSearch:             "搜尋",
    appearance:                  "外觀",
    theme:                       "主題",
    themePlanned:                "規劃中",
    themeDark:                   "深色",
    themeLight:                  "淺色",
    preferences:                 "偏好設定",
    defaultCategoryFilter:       "預設分類篩選",
  },

  common: {
    backToIndex:       "← 返回索引",
    comingSoon:        "即將推出",
    plannedCategories: "規劃中的分類",
    ethicsDisclaimer:  "僅限合法、獲授權的公開資訊研究用途。",
    categoryNotFound:     "找不到分類",
    categoryNotFoundDesc: "該調查分類不存在。",
    categoryIndexing:     "此分類的工具正在收錄中。",
    toolsCountInCategory: "此分類中共有 {n} 個工具",
    investigatingTitle:   "您想調查什麼？",
    investigatingSubtitle: "選擇一個分類以開啟工具集。",
    soonBadge:            "規劃中",
    goHome:               "返回首頁",
    recommendedStarts:    "推薦入門工具",
    clear:                "清除",
    closePanel:           "關閉面板",
    notIndexed:           "尚未收錄",
  },

  categories: {
    people: {
      name: "人物與身份",
      description: "在公開來源中驗證身份並追蹤個人記錄。",
      detail: "整合公共檔案、社交網絡檔案及交叉對照數據，以驗證個人身份或追蹤其數位與物理活動足跡。"
    },
    usernames: {
      name: "用戶名",
      description: "從用戶名枚舉帳號並繪製社交活動圖譜。",
      detail: "搜尋數百個平台以查找給定的用戶名，建立跨平台的存在地圖、辨識別名，並為調查對象建立社交活動足跡。"
    },
    emails: {
      name: "電子郵件",
      description: "調查電子郵件地址、洩露暴露及關聯身份。",
      detail: "驗證電子郵件的有效性、檢查洩露暴露、解析關聯身份，並從單一電子郵件地址枚舉關聯的服務。"
    },
    domains: {
      name: "域名",
      description: "枚舉目標域名的基礎設施、憑證與子域名。",
      detail: "繪製域名的完整基礎設施圖譜，包括 DNS 記錄、WHOIS 數據、憑證透明度日誌和子域名枚舉，以評估其攻擊面。"
    },
    ips: {
      name: "IP 與基礎設施",
      description: "映射暴露的主機、服務與網路拓撲。",
      detail: "掃描和查詢面向網際網路的 IP 地址以獲取開放端口、運行服務、橫幅資訊和地理背景，從而繪製組織的網路足跡。"
    },
    social: {
      name: "社交媒體",
      description: "驗證帳號、追蹤活動並分析社交關係圖譜。",
      detail: "交叉比對社交媒體帳號以驗證其真實性、追蹤活動歷史、檢測協同行為並繪製帳號之間的關係圖譜。"
    },
    images: {
      name: "圖像與地理定位",
      description: "提取元數據、驗證來源並進行圖像地理定位。",
      detail: "從圖像中提取包括 GPS 坐標和裝置指紋在內的 EXIF 元數據，進行反向圖片搜尋，並驗證視覺內容的來源和真實性。"
    },
    companies: {
      name: "公司與組織",
      description: "研究組織結構、申報文件與公開暴露情況。",
      detail: "通過官方申報、註冊記錄、人員數據以及網路和網站基礎設施暴露情況來調查企業實體。"
    },
    leaks: {
      name: "數據洩露",
      description: "在憑證資料庫和洩露數據集中搜尋暴露情況。",
      detail: "查詢已知的數據洩露集合和洩露憑證數據集，以確定電子郵件地址、用戶名和密碼在歷史事件中的暴露程度。"
    },
    crypto: {
      name: "加密貨幣",
      description: "追蹤錢包地址、交易和鏈上活動。",
      detail: "分析區塊鏈交易、追蹤錢包地址、識別交易所資金流並聚類相關地址以追蹤加密貨幣的流向。"
    },
    threat: {
      name: "威脅情報",
      description: "在威脅數據源中關聯入侵指標（IOC）。",
      detail: "搜尋威脅情報數據源和網路掃描數據，以將 IP、域名和憑證與已知的惡意指標和攻擊基礎設施進行關聯。"
    },
    documents: {
      name: "文件與元數據",
      description: "分析文件元數據、作者身份和修改歷史。",
      detail: "從文件中提取作者詳情、軟體指紋、修改歷史和嵌入的元數據，以建立來源歸屬。"
    },
    phones: {
      name: "電話號碼",
      description: "調查電話號碼、電信商數據與來電者身份。",
      detail: "查詢電話號碼所有權、電信商、地理來源和公開關聯，以驗證來電者身份或繪製聯絡人網絡。僅用於獲授權的調查。"
    },
    government: {
      name: "政府與公開記錄",
      description: "搜尋法院卷宗、企業登記處和官方資料庫。",
      detail: "訪問公開的政府記錄，包括法院文件、企業申報、監管數據、制裁名單和資訊公開法（FOIA）發布的材料，以進行調查研究。"
    },
    "ai-osint": {
      name: "AI 輔助 OSINT",
      description: "檢測 AI 生成內容、深偽影音並輔助分析。",
      detail: "利用 AI 驅動的工具來檢測合成媒體、驗證圖像真實性、擷取網頁證據並增強調查研究工作流程。"
    },
    malware: {
      name: "惡意軟體與文件分析",
      description: "安全地對可疑 URL、文件和惡意軟體樣本進行分類分流。",
      detail: "在沙箱環境中分析可疑文件、URL 和網域。查詢威脅情報數據源和惡意軟體庫以進行防禦性分類分流，而無需在本地執行未知代碼。"
    },
    darkweb: {
      name: "暗網與 Tor",
      description: "監控公共 Tor 服務並檢測暗網提及。",
      detail: "搜尋公開索引的 Tor 隱藏服務和暗網檔案，以進行防禦性監控、品牌保護 and 公共利益研究。始終在合法授權的框架下使用。"
    },
    rf: {
      name: "無線電與訊號情報",
      description: "監控公共無線電頻率、ADS-B 和訊號情報。",
      detail: "通過 ADS-B 追蹤飛機、監控公共海上交通、分析公開廣播的無線電訊號，並為開源訊號情報研究繪製射頻活動圖譜。"
    },
    iot: {
      name: "物聯網與智能裝置",
      description: "發現並分析暴露的物聯網裝置與智能基礎設施。",
      detail: "通過開源掃描數據識別公開可訪問的物聯網裝置、智能家居基礎設施和嵌入式系統——用於暴露評估和防禦性研究。"
    },
    opsec: {
      name: "隱私與調查員安全",
      description: "保護調查員身份並維護作業安全。",
      detail: "用於維護調查員匿名性、保障通信安全、隔離研究環境，以及在進行敏感調查前驗證自身數位足跡的工具和實踐。"
    }
  },
  seo: {
    title:       "OSINT Hub — 開源情報工具與調查流程索引",
    description: "基於調查情境的開源情報工具索引，適用於公開來源研究、事實核查與防禦性情報工作流。收錄 51 個工具，8 個調查流程。"
  }
};

export const DICT: Record<Locale, Dict> = { en, "zh-TW": zhTW };

/** Interpolate {key} placeholders: t("Found {n} results", { n: 5 }) */
export function t(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
