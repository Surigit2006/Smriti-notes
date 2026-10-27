import { defaultThemeId, themes } from "@/themes/themes";

const STORAGE_KEY = "smriti-theme";

export default function ThemeScript() {
  const data = themes.map((theme) => ({
    id: theme.id,
    mode: theme.mode,
    transparent: Boolean(theme.transparent),
    blur: theme.blur ?? 18,
    palette: theme.palette,
  }));

  const script = `(function(){try{
var themes=${JSON.stringify(data).replace(/</g, "\\u003c")};
var saved=null;
try{saved=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});}catch(e){}
var t=themes.find(function(x){return x.id===saved})
  ||themes.find(function(x){return x.id===${JSON.stringify(defaultThemeId)}})
  ||themes[0];
if(!t)return;
var p=t.palette,r=document.documentElement,s=r.style;
var v={
"--background":p.background,
"--sidebar-background":p.sidebarBackground,
"--surface":p.surface,
"--foreground":p.foreground,
"--theme-color-scheme": t.mode,
"--muted":p.muted,
"--border":p.border,
"--hover":p.hover,
"--active":p.active,
"--accent":p.accent,
"--accent-foreground":p.accentForeground,
"--surface-blur":(t.transparent?t.blur:0)+"px",
"--surface-shadow":t.transparent?"0 8px 32px rgba(0, 0, 0, 0.18)":"none"
};
for(var k in v){s.setProperty(k,v[k]);}
r.dataset.theme=t.id;
r.dataset.themeMode=t.mode;
r.dataset.transparent=t.transparent?"true":"false";
s.colorScheme=t.mode;
}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}