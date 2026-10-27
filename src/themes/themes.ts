export interface ThemePalette {
  background: string;
  sidebarBackground: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  hover: string;
  active: string;
  accent: string;
  accentForeground: string;
}

export type ThemeMode = "light" | "dark";

export type ThemeCategory =
  | "Modern"
  | "Brutal"
  | "World"
  | "Retro"
  | "Nature"
  | "Pastel"
  | "Dark"
  | "Neon"
  | "Cozy"
  | "Code Editor"
  | "Design Styles"
  | "Accessible"
  | "Transparent";

export interface SmritiTheme {
  id: string;
  name: string;
  description: string;
  mode: ThemeMode;
  category: ThemeCategory;
  preview: string[];
  palette: ThemePalette;
  /** true for see-through (glass) themes */
  transparent?: boolean;
  /** backdrop blur in px, used for --surface-blur */
  blur?: number;
}

/**
 * Value order (10 colors):
 * [background, sidebarBackground, surface, foreground, muted,
 *  border, hover, active, accent, accentForeground]
 */
const makePalette = (v: string[]): ThemePalette => ({
  background: v[0],
  sidebarBackground: v[1],
  surface: v[2],
  foreground: v[3],
  muted: v[4],
  border: v[5],
  hover: v[6],
  active: v[7],
  accent: v[8],
  accentForeground: v[9],
});

const t = (
  id: string,
  name: string,
  description: string,
  category: ThemeCategory,
  mode: ThemeMode,
  v: string[],
): SmritiTheme => ({
  id,
  name,
  description,
  category,
  mode,
  palette: makePalette(v),
  preview: [v[0], v[2], v[3], v[8]],
});

/**
 * Transparent (glass) theme helper.
 * Colors use 8-digit hex (#RRGGBBAA). Text and accent stay opaque for legibility.
 * `preview` is passed as solid colors so swatches look right.
 */
const tr = (
  id: string,
  name: string,
  description: string,
  mode: ThemeMode,
  blur: number,
  v: string[],
  preview: string[],
): SmritiTheme => ({
  id,
  name,
  description,
  category: "Transparent",
  mode,
  transparent: true,
  blur,
  palette: makePalette(v),
  preview,
});

export const themes: SmritiTheme[] = [
  /* ───────────────────────── MODERN ───────────────────────── */
  t("classic-dark", "Classic Dark", "Neutral dark surfaces with soft light-grey accents", "Modern", "dark",
    ["#111111", "#1A1A1A", "#242424", "#F5F5F5", "#A3A3A3", "#383838", "#2A2A2A", "#333333", "#E5E5E5", "#111111"]),
  t("slate-light", "Slate Light", "Crisp slate greys with an indigo accent", "Modern", "light",
    ["#F1F5F9", "#E2E8F0", "#FFFFFF", "#0F172A", "#64748B", "#CBD5E1", "#E8EEF5", "#DBEAFE", "#4F46E5", "#FFFFFF"]),
  t("slate-indigo", "Slate Indigo", "Focused near-black with electric indigo", "Modern", "dark",
    ["#0E1015", "#0A0C10", "#171A21", "#ECEEF3", "#9097A5", "#272B35", "#1D2129", "#262B4A", "#6E7BFF", "#0A0C10"]),
  t("nord-night", "Nord Night", "Polar night greys with glacier-cyan accents", "Modern", "dark",
    ["#2E3440", "#272C36", "#3B4252", "#ECEFF4", "#A5B0C4", "#4C566A", "#434C5E", "#3F5575", "#88C0D0", "#2E3440"]),
  t("tokyo-night", "Tokyo Night", "Neon-lit city dusk in soft blues", "Modern", "dark",
    ["#1A1B26", "#16161E", "#24283B", "#C0CAF5", "#8A94C2", "#3B4261", "#292E42", "#33467C", "#7AA2F7", "#1A1B26"]),
  t("dracula", "Dracula", "Beloved dark theme with vivid purple", "Modern", "dark",
    ["#282A36", "#21222C", "#343746", "#F8F8F2", "#9AA0C0", "#44475A", "#3A3D4F", "#44475A", "#BD93F9", "#282A36"]),
  t("catppuccin-latte", "Latte", "Creamy pastel light with violet accent", "Modern", "light",
    ["#EFF1F5", "#E6E9EF", "#FFFFFF", "#4C4F69", "#7C7F93", "#CCD0DA", "#E6E9EF", "#DCE0F5", "#8839EF", "#FFFFFF"]),
  t("catppuccin-mocha", "Mocha Mauve", "Cozy dark pastels with soft mauve", "Modern", "dark",
    ["#1E1E2E", "#181825", "#2A2A3C", "#CDD6F4", "#A6ADC8", "#45475A", "#313244", "#3B3F5C", "#CBA6F7", "#1E1E2E"]),
  t("rose-dawn", "Rosé Dawn", "Warm parchment with muted rose", "Modern", "light",
    ["#FAF4ED", "#F2E9E1", "#FFFAF3", "#575279", "#797593", "#E4D8CC", "#F4EBE1", "#EADCCB", "#B4637A", "#FFFFFF"]),
  t("obsidian", "Obsidian", "Near-black minimalism with cool silver details", "Modern", "dark",
    ["#090B0F", "#0F1218", "#171B22", "#F1F5F9", "#98A2B3", "#2B313C", "#202631", "#283342", "#A5B4FC", "#17152B"]),
  t("peacock", "Peacock", "Deep teal feathers with a gold accent", "Modern", "dark",
    ["#0B2530", "#071B24", "#12343F", "#E9F7F8", "#93B8BE", "#1F4B58", "#173C48", "#18505A", "#E7B84A", "#0B2530"]),
  t("jade-cool-blue", "Jade & Cool Blue", "Pinterest 2026: frosty cool blue with calm jade", "Modern", "light",
    ["#EAF6FF", "#D7EFFF", "#FFFFFF", "#1F2D2A", "#6B7D79", "#BFD9E8", "#DDEEFA", "#DCE3D2", "#4E7A64", "#FFFFFF"]),
  t("linen", "Linen", "Natural linen with garden green", "Modern", "light",
    ["#F5F2EC", "#EBE8E2", "#FAF9F6", "#2A2824", "#7B7974", "#D9D6D0", "#E7E4DE", "#D0D3CA", "#4C6652", "#FFFFFF"]),
  t("fog-slate", "Fog Slate", "Silver fog descending into deep slate navy", "Modern", "light",
    ["#E8EDF2", "#DAE2EA", "#F7F9FB", "#263B52", "#6C8095", "#C3CCD6", "#DFE5EB", "#C9D6E4", "#485C74", "#FFFFFF"]),
  t("mono-light", "Mono Light", "Pure grayscale, nothing but the essentials", "Modern", "light",
    ["#FFFFFF", "#F5F5F5", "#FFFFFF", "#111111", "#737373", "#E5E5E5", "#F0F0F0", "#E0E0E0", "#171717", "#FFFFFF"]),
  t("mono-dark", "Mono Dark", "Ink-black grayscale for zero distraction", "Modern", "dark",
    ["#101010", "#171717", "#1C1C1C", "#F5F5F5", "#A3A3A3", "#2E2E2E", "#262626", "#333333", "#FAFAFA", "#111111"]),
  /* ───────────────────── BRUTAL (hard ink borders, loud fills) ───────────────────── */
  t("neubrutalism", "Neubrutalism", "Cream paper, hard black lines, sunny yellow and bubblegum pink", "Brutal", "light",
    ["#FFF8E1", "#FFD93D", "#FFFFFF", "#111111", "#4A4A4A", "#1A1A1A", "#FFEB85", "#FF90E8", "#FF6B9D", "#111111"]),
  t("anti-design", "Anti-Design", "Clashing acid lime, safety orange and electric blue", "Brutal", "light",
    ["#EDEDED", "#C8FF2E", "#FFFFFF", "#0A0A0A", "#555555", "#0A0A0A", "#FFE600", "#FF5A1F", "#1A1AFF", "#FFFFFF"]),
  t("banana-riot", "Banana Riot", "Screaming banana yellow with hot pink rails and tomato ink", "Brutal", "light",
    ["#FFE45C", "#FF7AB6", "#FFFFFF", "#000000", "#3D3D3D", "#000000", "#FFF08A", "#7CF7C4", "#FF3D00", "#000000"]),
  t("tomato-slam", "Tomato Slam", "Cream page slammed by tomato red and mustard", "Brutal", "light",
    ["#FFF1E0", "#FF5A3C", "#FFFFFF", "#0A0A0A", "#4A4A4A", "#0A0A0A", "#FFD9C7", "#FFC93C", "#D90429", "#FFFFFF"]),
  t("concrete-lime", "Concrete Lime", "Raw concrete grey, acid lime sidebar, electric blue", "Brutal", "light",
    ["#D4D4D4", "#B6FF2E", "#F0F0F0", "#000000", "#444444", "#000000", "#E4E4E4", "#FFE600", "#1F1FFF", "#FFFFFF"]),
  t("pink-riot", "Pink Riot", "Bubblegum wall, lemon rail, magenta punch", "Brutal", "light",
    ["#FFC2E6", "#FFF200", "#FFFFFF", "#000000", "#4A2A40", "#000000", "#FFD9EF", "#B9F5FF", "#FF0080", "#000000"]),
  t("cobalt-block", "Cobalt Block", "Flat cobalt slab with taxi-yellow accent", "Brutal", "dark",
    ["#1F2BFF", "#0E1690", "#2C39F5", "#FFFFFF", "#C9CEFF", "#000000", "#3B47FF", "#0A1070", "#FFE600", "#000000"]),
  t("mint-slab", "Mint Slab", "Fresh mint concrete with an ultraviolet jolt", "Brutal", "light",
    ["#C8FFE0", "#00E5A0", "#FFFFFF", "#000000", "#2F5A48", "#000000", "#B0F5CF", "#FFE066", "#7A3CFF", "#FFFFFF"]),
  t("orange-crush", "Orange Crush", "Blaring orange with peach panels and pure black ink", "Brutal", "light",
    ["#FF8A1F", "#FFB347", "#FFE2B8", "#000000", "#4A2600", "#000000", "#FFC26B", "#FFF0D6", "#000000", "#FF8A1F"]),
  t("lilac-slap", "Lilac Slap", "Loud lilac, lemon sidebar, violet bolt", "Brutal", "light",
    ["#D9C2FF", "#FFE600", "#FFFFFF", "#000000", "#4B3A6B", "#000000", "#E8D9FF", "#9BFFD6", "#6A00FF", "#FFFFFF"]),
  t("sky-slap", "Sky Slap", "Cartoon sky, sunny rail, royal blue accent", "Brutal", "light",
    ["#9FE7FF", "#FFD23F", "#FFFFFF", "#000000", "#24505F", "#000000", "#C4F1FF", "#FF9FD0", "#0057FF", "#FFFFFF"]),
  t("wasabi-persimmon", "Wasabi & Persimmon", "Pinterest 2026 hits: electric wasabi with persimmon heat", "Brutal", "light",
    ["#E2F94A", "#FF6A2B", "#FFFFFF", "#111111", "#3E4A10", "#111111", "#EEFF8C", "#FFD6C2", "#111111", "#E2F94A"]),
  t("safety-vest", "Safety Vest", "Hi-vis yellow and construction orange, no subtlety", "Brutal", "light",
    ["#F5FF00", "#FF6A00", "#FFFFFF", "#000000", "#3D3D00", "#000000", "#FFFF7A", "#FFD0A8", "#000000", "#F5FF00"]),
  t("newsprint-riot", "Newsprint Riot", "Grey newsprint, headline yellow, tabloid red", "Brutal", "light",
    ["#EDE6D3", "#FFFFFF", "#F8F3E4", "#0A0A0A", "#555555", "#0A0A0A", "#E0D8BF", "#FFD400", "#E10600", "#FFFFFF"]),
  t("black-and-yellow", "Black & Yellow", "White hard lines on pure black with caution yellow", "Brutal", "dark",
    ["#0A0A0A", "#141414", "#1E1E1E", "#FFFFFF", "#BDBDBD", "#FFFFFF", "#2A2A2A", "#3A3A00", "#FFE600", "#000000"]),
  t("toxic-slab", "Toxic Slab", "Radioactive green outlines on a sealed black bunker", "Brutal", "dark",
    ["#0B0B0B", "#101810", "#17211A", "#F4FFE8", "#A8C79A", "#B6FF00", "#1F2D1F", "#26400A", "#B6FF00", "#000000"]),
  t("magenta-voltage", "Magenta Voltage", "Hot magenta wireframes on plum black", "Brutal", "dark",
    ["#12001A", "#1C0029", "#260038", "#FFF0FF", "#D7A8E8", "#FF2BD6", "#33004A", "#5A0070", "#FF2BD6", "#000000"]),
  t("red-alert", "Red Alert", "Blood-red outlines on a emergency-room black", "Brutal", "dark",
    ["#1A0000", "#260000", "#330000", "#FFFFFF", "#FFB3B3", "#FF1A1A", "#400000", "#5E0000", "#FF1A1A", "#000000"]),

  /* ───────────────────── WORLD (cultural palettes) ───────────────────── */
  // Japan
  t("ukiyo-e-wave", "Ukiyo-e Wave", "Japan: washi paper with Hokusai-wave indigo", "World", "light",
    ["#F2E9D0", "#E4D8B8", "#FBF6E6", "#12263F", "#6B7280", "#C9B98F", "#EBE1C2", "#BFD3E3", "#1B4F8F", "#FFFFFF"]),
  t("wabi-sabi", "Wabi-Sabi", "Japan: weathered clay, rust and the beauty of age", "World", "light",
    ["#E8E2D4", "#DCD4C2", "#F3EFE4", "#2B2A27", "#7A7466", "#C9C0AB", "#E0D9C8", "#D8C9B0", "#A4472C", "#FFFFFF"]),
  t("matsuri-lantern", "Matsuri Lantern", "Japan: festival night indigo lit by vermilion lanterns", "World", "dark",
    ["#14172E", "#0E1024", "#1E2342", "#F8EEDC", "#B3AFC4", "#33396A", "#252B52", "#3A2A3A", "#FF5A3C", "#14172E"]),
  // India
  t("holi-festival", "Holi Festival", "India: gulal powder violet with lime splashes", "World", "light",
    ["#FFFBEF", "#F3E8FF", "#FFFFFF", "#2A1048", "#7E6A9C", "#E1CFF5", "#F6EEFF", "#E3FF9E", "#7B2FF7", "#FFFFFF"]),
  t("diwali-lamp", "Diwali Lamp", "India: oil-lamp gold in a maroon festival night", "World", "dark",
    ["#220A06", "#190604", "#34120A", "#FFE9B8", "#C9A474", "#5A2A14", "#44190C", "#5C3A0C", "#FFB300", "#220A06"]),
  t("jaipur-pink-city", "Jaipur Pink City", "India: rose sandstone palaces and ruby red", "World", "light",
    ["#FBE3D6", "#F5CDBB", "#FFF3EB", "#4A1D1D", "#8F5E52", "#E5B7A2", "#F7D6C5", "#EFB8A0", "#B8243B", "#FFFFFF"]),
  t("peacock-silk", "Peacock Silk", "India: peacock-feather teal with fuchsia thread", "World", "dark",
    ["#052B33", "#031F26", "#0B3E49", "#E8FBF7", "#8FC7C3", "#12606B", "#0E4A56", "#0F5A5F", "#FF2E88", "#052B33"]),
  // Morocco
  t("marrakech-souk", "Marrakech Souk", "Morocco: red-city terracotta and spice-market warmth", "World", "light",
    ["#F4E1CB", "#EACBA8", "#FBF0E2", "#3B1F12", "#8A6A52", "#DDB78F", "#F0D5B4", "#E8C09A", "#C2410C", "#FFFFFF"]),
  t("majorelle-garden", "Majorelle Garden", "Morocco: Majorelle blue walls with marigold sun", "World", "dark",
    ["#1A1B5E", "#12134A", "#25277A", "#FFF6D6", "#B9BBEE", "#3B3E9E", "#2E3190", "#4A3C0B", "#FFD23F", "#1A1B5E"]),
  t("zellige-mosaic", "Zellige Mosaic", "Morocco: glazed tile turquoise on warm plaster", "World", "light",
    ["#F6EFDF", "#E6DBC0", "#FFFAEE", "#0E2A47", "#5E6F85", "#CDBF99", "#EFE5CB", "#BFE3E0", "#0A7E8C", "#FFFFFF"]),
  // Latin America
  t("oaxaca-fiesta", "Oaxaca Fiesta", "Mexico: rosa mexicano, papel picado and turquoise", "World", "light",
    ["#FFF3DD", "#FFD6E7", "#FFFFFF", "#2A0F3A", "#7C5A8E", "#F2BFD6", "#FFE5F0", "#CFF2E6", "#E4007C", "#FFFFFF"]),
  t("dia-de-muertos", "Día de Muertos", "Mexico: cempasúchil marigold glowing on violet night", "World", "dark",
    ["#150A1E", "#0F0616", "#221030", "#FFEFD0", "#C2A8C9", "#4A2A5E", "#2E1640", "#4A2A10", "#FF8A00", "#150A1E"]),
  t("andean-loom", "Andean Loom", "Peru: aguayo-weave aubergine with chili orange", "World", "dark",
    ["#2A0E2E", "#1E0922", "#3A1640", "#FFF1DA", "#CDB0C9", "#5F2D66", "#4A1F52", "#1F3A1A", "#FF6F3C", "#2A0E2E"]),
  t("rio-carnival", "Rio Carnival", "Brazil: rainforest green, parade yellow, samba magenta", "World", "dark",
    ["#05301F", "#032314", "#0A4A2E", "#FFF9D6", "#A8D5B8", "#0F6B40", "#0D5A36", "#5A0F3C", "#FFD500", "#05301F"]),
  // Africa
  t("kente-gold", "Kente Gold", "Ghana: woven kente green with royal gold", "World", "dark",
    ["#0B2A14", "#07200E", "#133A1D", "#FFF0C2", "#B8C79A", "#2E5B35", "#1B4727", "#4A3A08", "#FFC20E", "#0B2A14"]),
  t("ankara-print", "Ankara Print", "West Africa: wax-print cream, indigo ink, fire red", "World", "light",
    ["#FFF2D6", "#FFD7A8", "#FFFFFF", "#1B1B3A", "#6A5F7D", "#F0C48F", "#FFE7C2", "#BFE9E0", "#E2231A", "#FFFFFF"]),
  t("maasai-shuka", "Maasai Shuka", "Kenya: shuka-blanket red with beadwork yellow", "World", "dark",
    ["#B50D26", "#8E0A1E", "#CC1C36", "#FFFFFF", "#FFD3D9", "#1A0F0F", "#D8334B", "#6E0718", "#FFD400", "#1A0F0F"]),
  t("lapis-and-gold", "Lapis & Gold", "Egypt: lapis lazuli blue and pharaoh gold", "World", "dark",
    ["#0C1B4D", "#081239", "#142665", "#FBEBB5", "#B7BEDF", "#2A3C8C", "#1B3080", "#4A3C0B", "#E8B923", "#0C1B4D"]),
  // Oceania / Europe
  t("dreamtime-ochre", "Dreamtime Ochre", "Australia: red-earth ochre and bush-honey gold", "World", "dark",
    ["#6E2A12", "#561F0C", "#833618", "#FFF0DD", "#F0C9A8", "#A44A24", "#8F3E1E", "#4A1A08", "#F7C873", "#4A1A08"]),
  t("dala-red", "Dala Red", "Sweden: folk-art horse red on birch cream and navy", "World", "light",
    ["#F7F1E3", "#EBE1CB", "#FFFBF1", "#1C2D4F", "#6A7287", "#D7CBAE", "#EFE6D0", "#DCE4F2", "#C8372D", "#FFFFFF"]),
  t("amalfi-citrus", "Amalfi Citrus", "Italy: coastal lemon groves and blood-orange", "World", "light",
    ["#FFF8D6", "#FFEBA0", "#FFFFFF", "#17324D", "#6B7F93", "#F2DC85", "#FFF1B8", "#CDEFD3", "#F28C00", "#17324D"]),
  // East & Southeast Asia
  t("bangkok-tuk-tuk", "Bangkok Tuk-Tuk", "Thailand: taxi-pink and temple yellow street colours", "World", "light",
    ["#FFF4D1", "#FFD84D", "#FFFFFF", "#2B0F2E", "#7B5A7E", "#EFCB66", "#FFE68A", "#FFC2DD", "#E10098", "#FFFFFF"]),
  t("dancheong", "Dancheong", "Korea: palace-eave jade, vermilion and ink", "World", "dark",
    ["#101A17", "#0A120F", "#192823", "#F5EFD9", "#A8B8A9", "#2F4A3F", "#223730", "#4A1D1D", "#D9362B", "#FFFFFF"]),
  t("forbidden-city", "Forbidden City", "China: imperial wall red with golden roof tiles", "World", "dark",
    ["#7A0E1C", "#5E0916", "#8F1727", "#FFF1D0", "#F0C9C4", "#B03343", "#A01C2E", "#4A0610", "#FFD24A", "#4A0610"]),
  t("blue-and-white-porcelain", "Blue & White Porcelain", "China: cobalt brushwork on glazed porcelain white", "World", "light",
    ["#F9FBFD", "#EAF0F8", "#FFFFFF", "#10306B", "#6580AD", "#CBD8EC", "#EEF3FA", "#D5E2F7", "#1C4AA6", "#FFFFFF"]),

  

  /* ───────────────────────── RETRO ───────────────────────── */
  t("paper-ink", "Paper & Ink", "Warm notebook paper and ink-like text", "Retro", "light",
    ["#F6F0E5", "#EEE5D6", "#FFFCF5", "#38332B", "#81786C", "#DED3C2", "#EFE7DA", "#E8D9C4", "#9B6544", "#FFFFFF"]),
  t("gruvbox-dark", "Gruvbox Dark", "Warm vintage terminal with mustard yellow", "Retro", "dark",
    ["#282828", "#1D2021", "#32302F", "#EBDBB2", "#A89984", "#504945", "#3C3836", "#45403D", "#FABD2F", "#282828"]),
  t("solarized-light", "Solarized Light", "The classic low-glare balanced light scheme", "Retro", "light",
    ["#FDF6E3", "#EEE8D5", "#FFFBEB", "#073642", "#657B83", "#E0D9C2", "#F3EDD8", "#E4DDC4", "#2176C7", "#FFFFFF"]),
  t("solarized-dark", "Solarized Dark", "Teal-tinted dark with soft aqua accent", "Retro", "dark",
    ["#002B36", "#00212B", "#073642", "#EEE8D5", "#93A1A1", "#18505C", "#0D3F4B", "#124E5C", "#2AA198", "#002B36"]),
  t("commodore-64", "Commodore 64", "Iconic 8-bit blue with light-green cursor", "Retro", "dark",
    ["#40318D", "#352879", "#4B3BA0", "#E6E0FF", "#A89CE8", "#6C5DB8", "#4A3B9C", "#5A4AB0", "#9AD284", "#2A1F6B"]),
  t("amber-crt", "Amber CRT", "Glowing amber monochrome monitor", "Retro", "dark",
    ["#1A1000", "#140C00", "#241600", "#FFD58A", "#C29646", "#4A3000", "#2E1D00", "#3D2700", "#FFB000", "#1A1000"]),
  t("retro-terminal", "Retro Terminal", "Terminal black with phosphor-green highlights", "Retro", "dark",
    ["#07130D", "#0A1B12", "#102318", "#D9FFE5", "#80B891", "#254A32", "#183923", "#1C4B2A", "#59FF91", "#07130D"]),
  t("game-boy", "Pocket Handheld", "Four-shade olive LCD nostalgia", "Retro", "light",
    ["#CADC9F", "#B5C98A", "#DCE8B4", "#0F380F", "#4F6F3A", "#9BB36F", "#C0D493", "#A9C27A", "#306230", "#E0F0B8"]),
  t("blueprint", "Blueprint", "Engineer's drafting-paper blue with yellow ink", "Retro", "dark",
    ["#0E3A6B", "#0A2F58", "#164A82", "#E8F3FF", "#A9C8EA", "#2F68A3", "#1B4F8A", "#225C9C", "#FFD84D", "#0E3A6B"]),
  t("groovy-70s", "Groovy 70s", "Harvest cream, brown and burnt tangerine", "Retro", "light",
    ["#F7E7C6", "#EFD8A8", "#FFF4DA", "#4A2C17", "#8C6A48", "#E2C98F", "#F2DFB0", "#EBCB8A", "#D4561C", "#FFFFFF"]),
  t("retro-diner", "Retro Diner", "Mint-teal counters with cherry-red pop", "Retro", "light",
    ["#E6F4F1", "#D2EAE5", "#F8FFFD", "#1F3B3D", "#5F8083", "#BCDAD4", "#D9EEE9", "#C2E3DB", "#D7263D", "#FFFFFF"]),
  t("memphis", "Memphis", "80s Memphis cream with hot pink and ink navy", "Retro", "light",
    ["#FFF8E7", "#FFEFC9", "#FFFFFF", "#1F1A3D", "#6B6590", "#F1DFA8", "#FFF0C0", "#FFD9E4", "#E0207A", "#FFFFFF"]),
  t("synthwave", "Synthwave", "Retro-futuristic violet and hot pink", "Retro", "dark",
    ["#21102F", "#190C27", "#30183F", "#FFF0FF", "#C6A5D1", "#4C2A5B", "#3D2050", "#55245D", "#FF5BC8", "#2B1234"]),
  t("miami-nights", "Miami Nights", "Midnight navy with electric cyan", "Retro", "dark",
    ["#0B1026", "#080C1E", "#131A3A", "#EAF8FF", "#9FB2D6", "#2A3566", "#1B2550", "#1F3A5F", "#00F0FF", "#04121A"]),
  t("mid-century-teal", "Mid-Century Teal", "Atomic-age teal with orange teak", "Retro", "light",
    ["#EFEBDD", "#E5E2D5", "#F8F6F0", "#2B3B3A", "#79817B", "#D4D2C6", "#E1DFD2", "#EACEB2", "#D9661A", "#0B0B0F"]),
  t("bauhaus", "Bauhaus", "Cream canvas with primary blue", "Retro", "light",
    ["#F4EFE1", "#E9E4D7", "#FAF8F2", "#101010", "#6B6964", "#D4D0C4", "#E4DFD2", "#C2CBDC", "#0F4CC9", "#FFFFFF"]),
  t("art-deco", "Art Deco", "Jazz-age emerald-black with brass gold", "Retro", "dark",
    ["#0F1A1A", "#0B1313", "#1D2828", "#F2E8CF", "#A09E8E", "#363D39", "#212A28", "#3F3D1D", "#C9A227", "#0B0B0F"]),

  /* ───────────────────────── NATURE ───────────────────────── */
  t("matcha", "Matcha", "Botanical greens and handmade-paper warmth", "Nature", "light",
    ["#E9EEDC", "#DDE5CE", "#F8FAF1", "#334334", "#74816F", "#D0D9C3", "#E1E9D6", "#D2E3C4", "#648653", "#FFFFFF"]),
  t("glacier", "Glacier", "Icy aqua and watery teal accents", "Nature", "light",
    ["#DDF8F7", "#CDEDEB", "#F4FFFF", "#17474D", "#628A8D", "#BCE2E0", "#D2F1EF", "#BCE8E5", "#23A6A6", "#0B2F31"]),
  t("terracotta", "Terracotta", "Earthy clay and sand tones", "Nature", "light",
    ["#F3E4D8", "#EAD4C4", "#FFF6ED", "#54382D", "#907568", "#DEC5B4", "#F0DDD0", "#E9C8B5", "#B65F43", "#FFFFFF"]),
  t("forest-canopy", "Forest Canopy", "Rich greens inspired by shaded woodland", "Nature", "dark",
    ["#172B22", "#10231A", "#203A2D", "#EFF8F0", "#ABC0AF", "#385343", "#294534", "#2A5139", "#8BCB91", "#142719"]),
  t("ocean-depth", "Ocean Depth", "Rich ocean blues and aqua accents", "Nature", "dark",
    ["#102A43", "#0B2238", "#183B56", "#EAF6FF", "#A8C4D8", "#31536D", "#204762", "#174A62", "#4DD0E1", "#082F38"]),
  t("coral-reef", "Coral Reef", "Deep lagoon teal with living-coral accent", "Nature", "dark",
    ["#0F2A2E", "#0A2024", "#183A40", "#EAFBF8", "#9CC4C0", "#2C5359", "#1F464C", "#245C5E", "#FF7F6B", "#0F2A2E"]),
  t("aurora", "Aurora", "Dark northern sky with luminous mint accents", "Nature", "dark",
    ["#101D2A", "#0B1722", "#192B3A", "#EFFBFF", "#A4C2CE", "#304655", "#223746", "#1D4650", "#6EE7C8", "#0C2928"]),
  t("redwood", "Redwood", "Towering bark-red under a dark canopy", "Nature", "dark",
    ["#1E120D", "#160D09", "#2C201C", "#F1DFD2", "#A5958B", "#42352E", "#2F221D", "#492416", "#C4582E", "#0B0B0F"]),
  t("cactus-flower", "Cactus Flower", "Desert green with a hot-pink bloom", "Nature", "light",
    ["#EAF4E4", "#E0EBDA", "#F6FAF3", "#2C3E26", "#788772", "#CFDBC9", "#DDE7D7", "#E8CECE", "#E2487E", "#0B0B0F"]),
  t("orchid-house", "Orchid House", "Greenhouse mauve and magenta orchid", "Nature", "light",
    ["#F6EAF3", "#EDE0EA", "#FBF6FA", "#3A1F38", "#857083", "#DCCED9", "#E9DCE6", "#E8C8E1", "#B84FA0", "#FFFFFF"]),
  t("moonlit-meadow", "Moonlit Meadow", "Blue night over fresh meadow green", "Nature", "dark",
    ["#121A22", "#0D1318", "#20282F", "#E6EEF5", "#9AA2A9", "#363E46", "#232B33", "#384A39", "#A4D17C", "#0B0B0F"]),
  t("clay-and-sea", "Clay and Sea", "Terracotta clay, warm sand and cool sea teal", "Nature", "light",
    ["#FBF2C4", "#EED9A8", "#FFFAEA", "#43301B", "#8A7A5C", "#E3D3A6", "#F5E9C8", "#DCE9D9", "#008585", "#FFFFFF"]),
  t("adobe-dusk", "Adobe Dusk", "Sun-baked clay cooling into deep desert teal", "Nature", "dark",
    ["#223C3B", "#1A302F", "#2A4644", "#F0E8D8", "#A8B0A0", "#3A5452", "#28403E", "#2F4A46", "#B85233", "#FFFFFF"]),
  t("sage-grove", "Sage Grove", "Ancient sage greens and wise old browns", "Nature", "light",
    ["#F2F4E8", "#E3E8CD", "#FAFBF4", "#574742", "#8A9078", "#D4D9BD", "#E9EDDA", "#DDE4C8", "#7A9C5C", "#1F2B14"]),

  /* ───────────────────────── PASTEL ───────────────────────── */
  t("lavender-dream", "Lavender Dream", "Airy lavender with calm purple accents", "Pastel", "light",
    ["#F1ECFF", "#E8E0FA", "#FBF9FF", "#40365E", "#82779F", "#DCD2F2", "#EAE3FA", "#DCD0F8", "#9270D9", "#FFFFFF"]),
  t("rose-quartz", "Rose Quartz", "Blush surfaces with sophisticated rose accents", "Pastel", "light",
    ["#FBECEF", "#F4DFE5", "#FFF8F9", "#5A3442", "#987985", "#E8CDD6", "#F7E3E9", "#F1D3DF", "#D96C93", "#3A1424"]),
  t("butter-bloom", "Butter Bloom", "Sunny butter-yellow paper and golden details", "Pastel", "light",
    ["#FFF5CC", "#F7EAB7", "#FFFCED", "#51421F", "#8A7950", "#E9DCA9", "#FFF0B3", "#F6E39A", "#D5A629", "#3A2E0A"]),
  t("bubblegum", "Bubblegum", "Playful pink and lilac", "Pastel", "light",
    ["#FFEAF5", "#F9DDED", "#FFF8FC", "#5D3150", "#A47594", "#EBC9DE", "#FBE0F0", "#F4CDE5", "#E653A5", "#3D0B27"]),
  t("baby-blue", "Baby Blue", "Soft nursery blue with a sky accent", "Pastel", "light",
    ["#EAF4FF", "#E0EBF7", "#F6FAFF", "#23405E", "#73889E", "#CEDBE8", "#DCE7F4", "#C8E1FC", "#4F9DF0", "#0B0B0F"]),
  t("pistachio", "Pistachio", "Creamy pistachio ice cream", "Pastel", "light",
    ["#EEF6DF", "#E5EDD5", "#F7FBF1", "#34461F", "#7E8C6C", "#D4DDC4", "#E1EAD2", "#D3E5B8", "#74A92F", "#0B0B0F"]),
  t("pastel-rainbow", "Pastel Rainbow", "All eight pastel hues in one soft theme", "Pastel", "light",
    ["#FFFDF2", "#EAF3FF", "#FFFFFF", "#4A4A6A", "#9090A8", "#E8E6F0", "#F4F4FA", "#E2E9FF", "#7C8CF0", "#1A1F4D"]),
  t("purple-skies", "Purple Skies", "Layered lilac clouds at golden hour", "Pastel", "light",
    ["#F1F0FC", "#E4E2FA", "#F9F8FE", "#4A4472", "#8A86B8", "#DCDAF4", "#E9E7FB", "#DEDCF7", "#7D78C9", "#FFFFFF"]),

  /* ───────────────────────── DARK / MOODY ───────────────────────── */
  t("plum-noir", "Plum Noir", "Pinterest 2026: deep plum noir with persimmon fire", "Dark", "dark",
    ["#351E28", "#27131D", "#432A36", "#F6E9E4", "#C3A7B0", "#5E3C4D", "#4D2F40", "#5A2F2F", "#FF5E2B", "#27131D"]),
  t("cyberpunk", "Cyberpunk", "Electric magenta and violet futurism", "Dark", "dark",
    ["#130D24", "#190F2D", "#25153A", "#F5EFFF", "#B6A6CA", "#49305E", "#321D49", "#4A235A", "#F0ABFC", "#24102E"]),
  t("ultraviolet", "Ultraviolet", "Deep indigo-violet with glowing periwinkle", "Dark", "dark",
    ["#12072B", "#0D051F", "#1D0E40", "#F4ECFF", "#B4A0DC", "#392063", "#2A1750", "#3B1E7A", "#9D7BFF", "#12072B"]),
  t("sakura-night", "Sakura Night", "Moonlit plum with cherry-blossom pink", "Dark", "dark",
    ["#1F1520", "#18101A", "#2B1D2D", "#FBEAF1", "#C7A3B5", "#4A3049", "#392338", "#4D2B45", "#FFB7D1", "#2B1020"]),
  t("mocha-gold", "Mocha Gold", "Dark coffee tones with golden accents", "Dark", "dark",
    ["#2D241D", "#241C17", "#3D3026", "#F7EEE2", "#C0AD98", "#554437", "#49392D", "#5A4430", "#D9AD65", "#2B2117"]),
  t("noir", "Noir", "Black-and-gold cinema glamour", "Dark", "dark",
    ["#0B0B0D", "#080809", "#1A1A1C", "#E8E8EA", "#98989A", "#313133", "#1D1D1F", "#3F3618", "#D4AF37", "#0B0B0D"]),
  t("witching-hour", "Witching Hour", "Deep purple night, green potion glow", "Dark", "dark",
    ["#140B1E", "#0E0816", "#221A2C", "#EDE3F7", "#9F95A9", "#393043", "#251C2F", "#374A3A", "#9BFF8A", "#0B0B0F"]),
  t("obsidian-rose", "Obsidian Rose", "Volcanic glass with hot rose", "Dark", "dark",
    ["#120B0E", "#0D080A", "#201A1C", "#F5E6EA", "#A3979B", "#393033", "#241D20", "#501C2E", "#FF4D88", "#0B0B0F"]),
  t("moody-sunset", "Moody Sunset", "Dusk purples melting into coral and amber", "Dark", "dark",
    ["#262038", "#1B1627", "#2E2A4A", "#FDF0F5", "#A89AB8", "#453F63", "#322C4E", "#4A2F52", "#FF6361", "#2B0A0A"]),
  t("ember-night", "Ember Night", "Dark harbor blues warmed by ember oranges", "Dark", "dark",
    ["#111923", "#0C1219", "#1B2635", "#F5EDE8", "#8A93A8", "#2C3A50", "#1D2837", "#3B2A35", "#E08234", "#1A1206"]),

  /* ───────────────────────── NEON ───────────────────────── */
  t("neon-arcade", "Neon Arcade", "Gaming-inspired dark palette with electric lime", "Neon", "dark",
    ["#10121F", "#151827", "#1B2032", "#F5F7FF", "#A2A9C2", "#343A52", "#252B40", "#293B2A", "#B8FF3B", "#17210A"]),
  t("laser-grid", "Laser Grid", "Hot magenta laser on ultraviolet black", "Neon", "dark",
    ["#0A0716", "#070510", "#191624", "#F3EEFF", "#9F9BAB", "#322E3E", "#1D1929", "#4A113C", "#FF2DAA", "#0A0716"]),
  t("acid-rain", "Acid Rain", "Toxic green drizzle on swamp black", "Neon", "dark",
    ["#08110C", "#060C09", "#171F1B", "#E6FFE9", "#96A999", "#2E3932", "#1A241E", "#154F0E", "#39FF14", "#0B0B0F"]),
  t("plasma-orange", "Plasma Orange", "Molten orange plasma on charcoal", "Neon", "dark",
    ["#120A06", "#0D0704", "#201915", "#FFEFE3", "#AA9D93", "#3A312C", "#251C18", "#502304", "#FF6A00", "#0B0B0F"]),
  t("electric-lemon", "Electric Lemon", "Shock-yellow zing on deep olive-black", "Neon", "dark",
    ["#0F0F05", "#0B0B04", "#1D1D14", "#FFFDE0", "#A9A791", "#38372A", "#222217", "#4B4D04", "#F5FF00", "#0B0B0F"]),
  t("ice-blade", "Ice Blade", "Razor-cyan edge on frozen midnight", "Neon", "dark",
    ["#06121A", "#040D13", "#152028", "#E6FAFF", "#95A6AD", "#2C3941", "#18252C", "#044956", "#00E5FF", "#0B0B0F"]),
  t("mint-laser", "Mint Laser", "Laser mint on green-black", "Neon", "dark",
    ["#04140F", "#030E0B", "#13221D", "#E5FFF5", "#94AAA2", "#2A3C36", "#162721", "#035135", "#00FFA3", "#0B0B0F"]),

  /* ───────────────────────── COZY ───────────────────────── */
  t("bubble-tea", "Bubble Tea", "Milk-tea beige with brown-sugar pearls", "Cozy", "light",
    ["#F6ECDC", "#EDE2D2", "#FBF6EF", "#3A2619", "#857567", "#DCD0C1", "#E9DECE", "#E9D2BC", "#B9784A", "#0B0B0F"]),
  t("campfire", "Campfire", "Crackling ember glow on smoky brown", "Cozy", "dark",
    ["#1F1410", "#160E0C", "#2C221E", "#FFE9D2", "#AE9C8C", "#453831", "#312520", "#59331C", "#FF8A3D", "#0B0B0F"]),
  t("cinnamon-roll", "Cinnamon Roll", "Warm frosting and cinnamon swirl", "Cozy", "light",
    ["#FBEFE4", "#F2E5DA", "#FDF8F3", "#4A2A1E", "#91796D", "#E2D3C8", "#EFE1D6", "#EED0BF", "#C0603A", "#0B0B0F"]),
  t("winter-cabin", "Winter Cabin", "Slate night outside, lantern light inside", "Cozy", "dark",
    ["#17202A", "#11171E", "#252D37", "#E8EEF3", "#9DA4AB", "#3B434C", "#28303A", "#4D4133", "#E8A04C", "#0B0B0F"]),
  t("chai-spice", "Chai Spice", "Spiced tea browns with cinnamon fire", "Cozy", "dark",
    ["#20130E", "#170E0A", "#2D211C", "#F3DEC6", "#A79584", "#44362D", "#31231D", "#4C2E1A", "#C97B3C", "#0B0B0F"]),
  t("rainy-window", "Rainy Window", "Grey-blue drizzle and quiet lamplight", "Cozy", "dark",
    ["#1A2230", "#131823", "#282F3C", "#DCE6F0", "#969FAB", "#3B4351", "#2A323F", "#34455B", "#7FA9D6", "#0B0B0F"]),

  /* ───────────────────────── CODE EDITOR ───────────────────────── */
  t("monokai", "Monokai", "Classic editor dark with lime green", "Code Editor", "dark",
    ["#272822", "#1C1D18", "#34352F", "#F8F8F2", "#ADADA7", "#4B4B45", "#383933", "#485825", "#A6E22E", "#0B0B0F"]),
  t("ayu-mirage", "Ayu Mirage", "Muted blue-grey with warm gold", "Code Editor", "dark",
    ["#1F2430", "#161A23", "#2C313C", "#CCCAC2", "#8E8E8D", "#3C4049", "#2D313C", "#59503E", "#FFCC66", "#0B0B0F"]),
  t("everforest", "Everforest", "Gentle forest greens, easy on the eyes", "Code Editor", "dark",
    ["#2D353B", "#20262A", "#3A4147", "#D3C6AA", "#979282", "#494E4E", "#3A4144", "#434E43", "#A7C080", "#0B0B0F"]),
  t("kanagawa", "Kanagawa", "Edo-print ink with wave blue", "Code Editor", "dark",
    ["#1F1F28", "#16161D", "#2C2C35", "#DCD7BA", "#989585", "#3F3E41", "#2E2E34", "#384056", "#7E9CD8", "#0B0B0F"]),
  t("night-owl", "Night Owl", "Deep ocean blue for night coders", "Code Editor", "dark",
    ["#011627", "#01101C", "#102434", "#D6DEEB", "#8996A4", "#253848", "#122637", "#233C5F", "#82AAFF", "#0B0B0F"]),
  t("palenight", "Palenight", "Soft twilight purple with orchid", "Code Editor", "dark",
    ["#292D3E", "#1E202D", "#363A4A", "#B6BCDC", "#8389A3", "#414559", "#34384B", "#52476B", "#C792EA", "#0B0B0F"]),
  t("poimandres", "Poimandres", "Cool dark slate with soft mint", "Code Editor", "dark",
    ["#1B1E28", "#13161D", "#292C35", "#A6ACCD", "#747992", "#333644", "#262935", "#244444", "#5DE4C7", "#0B0B0F"]),
  t("clean-code-light", "Clean Code Light", "Crisp white editor with link blue", "Code Editor", "light",
    ["#FFFFFF", "#F4F4F4", "#FFFFFF", "#1F2328", "#797B7E", "#E0E0E1", "#EFF0F0", "#C9DEF7", "#0969DA", "#FFFFFF"]),
  t("horizon", "Horizon", "Warm dark with raspberry glow", "Code Editor", "dark",
    ["#1C1E26", "#14161B", "#2A2C33", "#D5D8DA", "#929599", "#3B3E45", "#2B2D34", "#512D3B", "#E95678", "#0B0B0F"]),
  t("cobalt-and-gold", "Cobalt & Gold", "Deep cobalt screen with golden yellow", "Code Editor", "dark",
    ["#193549", "#122635", "#274154", "#FFFFFF", "#ACB6BD", "#405768", "#2B4558", "#555B36", "#FFC600", "#0B0B0F"]),

  /* ───────────────────────── DESIGN STYLES ───────────────────────── */
  t("ecobrutalism", "Ecobrutalism", "Raw concrete grey softened by moss green", "Design Styles", "light",
    ["#D9D7CC", "#C9C7B8", "#ECEADF", "#1F2A1C", "#5C6552", "#8E8F7C", "#CFCDBF", "#B9C79A", "#3F6B2E", "#F4F2E8"]),
  t("structural-expressionism", "Structural Expressionism", "Steel and concrete with a signal-orange beam", "Design Styles", "dark",
    ["#1E2328", "#161A1E", "#292F36", "#ECEFF2", "#9AA4AE", "#3C454E", "#2F363D", "#3A434C", "#FF7A1A", "#1E2328"]),
  t("cybergrunge", "Cybergrunge", "Grimy teal-black with a hot magenta glitch", "Design Styles", "dark",
    ["#14181A", "#0F1213", "#1E2427", "#D7E2DA", "#8A9A92", "#34413C", "#232B2D", "#2C3B35", "#FF2E88", "#14181A"]),
  t("pixel-art-ui", "Pixel Art UI", "16-bit navy, wine and arcade yellow", "Design Styles", "dark",
    ["#1D2B53", "#141D3D", "#26356F", "#FFF1E8", "#C2C3C7", "#4C5A94", "#2A3A78", "#7E2553", "#FFEC27", "#1D2B53"]),
  t("vaporwave-mall", "Vaporwave Mall", "Pastel pink and aqua, daylight at the mall", "Design Styles", "light",
    ["#FFE9F7", "#F7D4F0", "#FFF5FC", "#3A1F5C", "#75559A", "#E6BFE0", "#FBDCF2", "#BDEFF5", "#D6309A", "#FFFFFF"]),
  t("swiss-style", "Swiss International", "Off-white grid, black type, one Swiss red", "Design Styles", "light",
    ["#F7F7F5", "#EFEFEC", "#FFFFFF", "#0A0A0A", "#666666", "#D0D0CC", "#EDEDEA", "#E2E2DE", "#E30613", "#FFFFFF"]),
  t("exaggerated-minimalism", "Exaggerated Minimalism", "Almost nothing: whisper-thin lines, pure black accent", "Design Styles", "light",
    ["#FCFCFB", "#FCFCFB", "#FFFFFF", "#000000", "#767676", "#ECECE8", "#F5F5F3", "#EDEDEA", "#000000", "#FFFFFF"]),
  t("editorial-print", "Editorial Print", "Magazine paper stock with deep ink-blue", "Design Styles", "light",
    ["#F4EFE6", "#ECE5D8", "#FBF8F2", "#1A1A1A", "#6B655A", "#CFC6B4", "#E8E0D0", "#DDD2BC", "#1F3A5F", "#FFFFFF"]),
  t("kinetic-typography", "Kinetic Typography", "Ink-violet black with a loud yellow headline", "Design Styles", "dark",
    ["#0D0B14", "#08070D", "#17142A", "#F6F3FF", "#A59FC4", "#2B2646", "#1E1A35", "#2D2760", "#FFE500", "#0D0B14"]),
  t("digital-maximalism", "Digital Maximalism", "Saturated purple, teal and amber, all at once", "Design Styles", "dark",
    ["#1A0B2E", "#12071F", "#2A1250", "#FFF5FF", "#C9A9E8", "#5B2A9C", "#34195F", "#0B7285", "#FFB400", "#1A0B2E"]),
  t("mixed-media", "Mixed Media", "Kraft paper collage with peach tape and denim", "Design Styles", "light",
    ["#E9DFCB", "#DCCFB5", "#F7F0E1", "#2D2A26", "#6F6452", "#BDAE90", "#E2D6BE", "#F2C6A0", "#2C6E91", "#FFFFFF"]),
  t("risograph", "Risograph", "Blue ink on cream paper with fluorescent pink", "Design Styles", "light",
    ["#F4EFE4", "#ECE6D6", "#FBF8F0", "#1E2A78", "#5A63A5", "#D5CCE0", "#EAE3DC", "#FFC6E4", "#FF48B0", "#1E2A78"]),
  t("punk-grunge", "Punk Grunge", "Soot black, torn-flyer cream and safety-pin red", "Design Styles", "dark",
    ["#141211", "#0E0C0B", "#1F1C1A", "#E8E2D6", "#9C9384", "#3A342F", "#272320", "#4A1F1F", "#D92B20", "#FFFFFF"]),
  t("bento-grid", "Bento Box Grid", "Soft grey tiles on white cards with a clear blue", "Design Styles", "light",
    ["#EEF0F4", "#E6E9EF", "#FFFFFF", "#1D2433", "#6B7488", "#DCE0E8", "#E8EBF1", "#DCE3FF", "#4361EE", "#FFFFFF"]),
  t("terminal-ui", "Terminal UI", "Developer-console dark with a green prompt", "Design Styles", "dark",
    ["#0D1117", "#090C10", "#161B22", "#E6EDF3", "#8B949E", "#30363D", "#1C2128", "#16301F", "#3FB950", "#0D1117"]),

  /* ───────────────────────── ACCESSIBLE ───────────────────────── */
  t("contrast-light", "High Contrast Light", "Maximum legibility, black on white", "Accessible", "light",
    ["#FFFFFF", "#F2F2F2", "#FFFFFF", "#000000", "#3D3D3D", "#6E6E6E", "#EBEBEB", "#CFE3FF", "#0033CC", "#FFFFFF"]),
  t("contrast-dark", "High Contrast Dark", "Maximum legibility, white on black with yellow", "Accessible", "dark",
    ["#000000", "#0A0A0A", "#111111", "#FFFFFF", "#C8C8C8", "#5A5A5A", "#1F1F1F", "#2B2B2B", "#FFEB3B", "#000000"]),
  t("cb-safe-light", "Colorblind-Safe Light", "Okabe-Ito blue on clean white", "Accessible", "light",
    ["#FFFFFF", "#F4F4F4", "#FFFFFF", "#1A1A1A", "#767676", "#DFDFDF", "#EFEFEF", "#C7E0EE", "#0072B2", "#FFFFFF"]),
  t("cb-safe-dark", "Colorblind-Safe Dark", "Okabe-Ito orange on soft black", "Accessible", "dark",
    ["#121212", "#0D0D0D", "#202020", "#F2F2F2", "#A1A1A1", "#383838", "#242424", "#49370D", "#E69F00", "#0B0B0F"]),
  t("dyslexia-cream", "Dyslexia Cream", "Warm cream that reduces glare", "Accessible", "light",
    ["#FAF3DD", "#EFE9D4", "#FDFAF0", "#222222", "#78766D", "#DCD6C3", "#EBE4D0", "#CCD5D3", "#2B6CB0", "#FFFFFF"]),
  t("night-reader", "Night Reader", "Low-glare warm dark for late reading", "Accessible", "dark",
    ["#1A1A1A", "#131313", "#282828", "#D8D2C4", "#949087", "#3A3937", "#292928", "#483B2B", "#C99A5B", "#0B0B0F"]),
  t("blue-light-filter", "Blue-Light Filter", "Warm amber tint for calm eyes", "Accessible", "light",
    ["#FFF4E0", "#F5EAD6", "#FFFAF1", "#3A2A10", "#897B63", "#E3D8C3", "#F1E6D1", "#F2D6AF", "#C46A00", "#0B0B0F"]),

  /* ───────────────────────── TRANSPARENT (glass) ───────────────────────── */
  tr("frosted-light", "Frosted Light", "Soft frosted glass with a hint of see-through", "light", 28,
    ["#FFFFFFEB", "#F4F6FAE6", "#FFFFFFF5", "#14181F", "#5B6573", "#0F172A2E", "#0F172A14", "#4F46E52E", "#4F46E5", "#FFFFFF"],
    ["#F2F4F8", "#FFFFFF", "#14181F", "#4F46E5"]),
  tr("frosted-dark", "Frosted Dark", "Smoked dark glass with soft light text", "dark", 28,
    ["#10121AEB", "#0A0C12E6", "#1C202CF2", "#F2F4F8", "#A0A8B8", "#FFFFFF26", "#FFFFFF14", "#7C8CFF38", "#8FA0FF", "#0A0C12"],
    ["#10121A", "#1C202C", "#F2F4F8", "#8FA0FF"]),
  tr("aero-blue", "Aero Blue", "Glossy sky-blue glass, Vista-era nostalgia", "light", 26,
    ["#D6EBFFE6", "#BFDDFAE0", "#F2F9FFF2", "#0E2A47", "#4C6F94", "#2F6DB547", "#FFFFFF73", "#2F8CFF38", "#1E7BEA", "#FFFFFF"],
    ["#D6EBFF", "#F2F9FF", "#0E2A47", "#1E7BEA"]),
  tr("ocean-glass", "Ocean Glass", "Deep teal glass with aqua glow", "dark", 26,
    ["#0A2A33EB", "#061F27E6", "#103C48F2", "#E6FAFD", "#8FC0C9", "#6FE3F533", "#6FE3F51A", "#22D3EE3D", "#4DD9EC", "#04222A"],
    ["#0A2A33", "#103C48", "#E6FAFD", "#4DD9EC"]),
  tr("mint-glass", "Mint Glass", "Fresh minty glass over light surfaces", "light", 26,
    ["#E3FAF0EB", "#CFF3E3E6", "#F6FFFBF5", "#12372B", "#58867A", "#1B7F5C3D", "#FFFFFF73", "#2DD4A038", "#14966E", "#FFFFFF"],
    ["#E3FAF0", "#F6FFFB", "#12372B", "#14966E"]),
  tr("rose-glass", "Rose Glass", "Blush frosted glass with a rose accent", "light", 26,
    ["#FFE8EFEB", "#FAD6E1E6", "#FFF7F9F5", "#4A2233", "#8F6677", "#D6537F3D", "#FFFFFF73", "#F472A238", "#D6457A", "#FFFFFF"],
    ["#FFE8EF", "#FFF7F9", "#4A2233", "#D6457A"]),
  tr("amber-glass", "Amber Glass", "Warm smoked glass with honey-amber light", "dark", 26,
    ["#221708EB", "#1A1006E6", "#33230FF2", "#FFF1DB", "#CBA877", "#FFB00033", "#FFB0001A", "#FFB0003D", "#FFB834", "#1A1006"],
    ["#221708", "#33230F", "#FFF1DB", "#FFB834"]),
  tr("violet-haze", "Violet Haze", "Dreamy purple twilight glass", "dark", 28,
    ["#1B1033EB", "#120A26E6", "#2A1A4DF2", "#F4EDFF", "#B7A5DB", "#B794FF33", "#B794FF1A", "#A78BFA3D", "#B79BFF", "#120A26"],
    ["#1B1033", "#2A1A4D", "#F4EDFF", "#B79BFF"]),
  tr("sheer-paper", "Sheer Paper", "Warm paper-toned glass, soft sepia ink", "light", 20,
    ["#F6F0E5EB", "#EEE5D6E6", "#FFFCF5F5", "#38332B", "#81786C", "#9B65443D", "#FFFFFF73", "#9B65442E", "#9B6544", "#FFFFFF"],
    ["#F6F0E5", "#FFFCF5", "#38332B", "#9B6544"]),
];

export const themeCategories: ThemeCategory[] = [
  "Modern",
  "Brutal",
  "World",
  "Retro",
  "Nature",
  "Pastel",
  "Dark",
  "Neon",
  "Cozy",
  "Code Editor",
  "Design Styles",
  "Accessible",
  "Transparent",
];

export const defaultThemeId = "paper-ink";

export const getThemeById = (id: string): SmritiTheme =>
  themes.find((item) => item.id === id) ??
  themes.find((item) => item.id === defaultThemeId) ??
  themes[0];

export const getThemesByCategory = (category: ThemeCategory): SmritiTheme[] =>
  themes.filter((item) => item.category === category);

export const getThemesByMode = (mode: ThemeMode): SmritiTheme[] =>
  themes.filter((item) => item.mode === mode);

/** Applies a theme as CSS variables (e.g. --smriti-background) on an element. */
export const applyTheme = (
  theme: SmritiTheme,
  target: HTMLElement = document.documentElement,
): void => {
  Object.entries(theme.palette).forEach(([key, value]) => {
    const cssName = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    target.style.setProperty(`--smriti-${cssName}`, value);
  });
  target.style.setProperty("--smriti-blur", `${theme.blur ?? 0}px`);
  target.style.colorScheme = theme.mode;
  target.dataset.theme = theme.id;
  target.dataset.transparent = theme.transparent ? "true" : "false";
};