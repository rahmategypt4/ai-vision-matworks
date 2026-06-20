export type Language = "en" | "id" | "ja";

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "GB" },
  { code: "id", label: "Bahasa Indonesia", flag: "ID" },
  { code: "ja", label: "日本語 (Japanese)", flag: "JP" },
];

// Per-language locale + market settings used by the backend & formatters.
export const LANGUAGE_META: Record<
  Language,
  { locale: string; currency: string; gl: string; hl: string; googleDomain: string }
> = {
  en: { locale: "en-US", currency: "USD", gl: "us", hl: "en", googleDomain: "google.com" },
  id: { locale: "id-ID", currency: "IDR", gl: "id", hl: "id", googleDomain: "google.co.id" },
  ja: { locale: "ja-JP", currency: "JPY", gl: "jp", hl: "ja", googleDomain: "google.co.jp" },
};

export type Dict = {
  nav: { identify: string; history: string; start: string; searchPlaceholder: string };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    subtitle: string;
    cta: string;
  };
  page: {
    title: string;
    subtitle: string;
    tabIdentify: string;
    tabHistory: string;
  };
  identify: {
    sectionTitle: string;
    historyChip: string;
    dropHere: string;
    or: string;
    pickImage: string;
    fileHint: string;
    analyzing: string;
    ready: string;
    changePhoto: string;
    errorGeneric: string;
  };
  result: {
    condition: Record<"Good" | "Fair" | "Poor", string>;
  };
  history: {
    loading: string;
    error: string;
    empty: string;
    prev: string;
    next: string;
    deleteAria: string;
  };
  market: {
    title: string;
    resultsCount: (n: number) => string;
    emptyWithQuery: (q: string) => string;
    emptyNoQuery: string;
  };
  language: {
    switcherAria: string;
    popupTitle: string;
  };
};

export const DICTS: Record<Language, Dict> = {
  en: {
    nav: {
      identify: "Identify",
      history: "History",
      start: "Start",
      searchPlaceholder: "Search items, brands, or categories",
    },
    hero: {
      eyebrow: "Sell used items, no more guesswork",
      title1: "Snap, Identify,",
      title2: "Check Market Prices",
      subtitle:
        "Upload a photo of your used item — AI recognizes the name, brand, model, and condition, then compares it with current market prices from Google Shopping.",
      cta: "Start Identifying",
    },
    page: {
      title: "Identify & check market prices",
      subtitle:
        "Upload a photo of your item — AI recognizes the name, condition, and shows similar listings.",
      tabIdentify: "Identify",
      tabHistory: "History",
    },
    identify: {
      sectionTitle: "Find similar products by image",
      historyChip: "Search History",
      dropHere: "Drop a photo here",
      or: "— or —",
      pickImage: "Pick an image",
      fileHint: "JPG, PNG, WEBP · max ~6MB",
      analyzing: "Analyzing image…",
      ready: "Ready for a new analysis",
      changePhoto: "Change photo",
      errorGeneric: "Failed to identify the item.",
    },
    result: { condition: { Good: "Good", Fair: "Fair", Poor: "Poor" } },
    history: {
      loading: "Loading history...",
      error: "Failed to load history. Try reloading the page.",
      empty: "No identification history yet.",
      prev: "Previous",
      next: "Next",
      deleteAria: "Delete",
    },
    market: {
      title: "Visually similar products",
      resultsCount: (n) => `${n} results`,
      emptyWithQuery: (q) => `No results for "${q}".`,
      emptyNoQuery: "Upload a photo to see similar products here.",
    },
    language: { switcherAria: "Change language", popupTitle: "Language" },
  },
  id: {
    nav: {
      identify: "Identifikasi",
      history: "Riwayat",
      start: "Mulai",
      searchPlaceholder: "Cari barang, brand, atau kategori",
    },
    hero: {
      eyebrow: "Jual Barang Bekas, Tanpa Tebak-Tebakan",
      title1: "Foto, Identifikasi,",
      title2: "Cek Harga Pasaran",
      subtitle:
        "Upload foto barang bekas kamu — AI mengenali nama, merek, model, hingga kondisi, lalu membandingkan dengan harga pasaran terkini dari Google Shopping.",
      cta: "Mulai Identifikasi",
    },
    page: {
      title: "Identifikasi & cari harga pasaran",
      subtitle:
        "Upload foto barang — AI mengenali nama, kondisi, dan menampilkan produk serupa.",
      tabIdentify: "Identifikasi",
      tabHistory: "Riwayat",
    },
    identify: {
      sectionTitle: "Cari produk serupa lewat gambar",
      historyChip: "Riwayat Pencarian",
      dropHere: "Tarik foto ke sini",
      or: "— atau —",
      pickImage: "Pilih gambar",
      fileHint: "JPG, PNG, WEBP · maks ~6MB",
      analyzing: "Menganalisis gambar…",
      ready: "Siap untuk analisis baru",
      changePhoto: "Ganti foto",
      errorGeneric: "Gagal mengidentifikasi barang.",
    },
    result: { condition: { Good: "Baik", Fair: "Sedang", Poor: "Rusak" } },
    history: {
      loading: "Memuat riwayat...",
      error: "Gagal memuat riwayat. Coba muat ulang halaman.",
      empty: "Belum ada riwayat identifikasi.",
      prev: "Sebelumnya",
      next: "Berikutnya",
      deleteAria: "Hapus",
    },
    market: {
      title: "Produk dengan tampilan serupa",
      resultsCount: (n) => `${n} hasil`,
      emptyWithQuery: (q) => `Tidak ada hasil untuk "${q}".`,
      emptyNoQuery: "Upload sebuah foto untuk melihat produk serupa di sini.",
    },
    language: { switcherAria: "Ganti bahasa", popupTitle: "Bahasa" },
  },
  ja: {
    nav: {
      identify: "識別",
      history: "履歴",
      start: "開始",
      searchPlaceholder: "商品、ブランド、カテゴリを検索",
    },
    hero: {
      eyebrow: "中古品の販売、もう迷わない",
      title1: "撮影、識別、",
      title2: "市場価格をチェック",
      subtitle:
        "中古品の写真をアップロードすると、AIが商品名・ブランド・モデル・状態を認識し、Googleショッピングの最新市場価格と比較します。",
      cta: "識別を開始",
    },
    page: {
      title: "識別と市場価格の確認",
      subtitle:
        "商品の写真をアップロード — AIが名前と状態を認識し、類似商品を表示します。",
      tabIdentify: "識別",
      tabHistory: "履歴",
    },
    identify: {
      sectionTitle: "画像で類似商品を検索",
      historyChip: "検索履歴",
      dropHere: "ここに写真をドロップ",
      or: "— または —",
      pickImage: "画像を選択",
      fileHint: "JPG、PNG、WEBP · 最大約6MB",
      analyzing: "画像を解析中…",
      ready: "新しい解析の準備ができました",
      changePhoto: "写真を変更",
      errorGeneric: "商品の識別に失敗しました。",
    },
    result: { condition: { Good: "良好", Fair: "普通", Poor: "難あり" } },
    history: {
      loading: "履歴を読み込み中...",
      error: "履歴の読み込みに失敗しました。ページを再読み込みしてください。",
      empty: "まだ識別履歴がありません。",
      prev: "前へ",
      next: "次へ",
      deleteAria: "削除",
    },
    market: {
      title: "見た目が似ている商品",
      resultsCount: (n) => `${n} 件`,
      emptyWithQuery: (q) => `「${q}」の結果はありません。`,
      emptyNoQuery: "写真をアップロードすると、類似商品がここに表示されます。",
    },
    language: { switcherAria: "言語を変更", popupTitle: "言語" },
  },
};
