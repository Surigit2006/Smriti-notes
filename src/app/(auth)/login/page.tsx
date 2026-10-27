
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  Command,
  FileText,
  Folder,
  Image as ImageIcon,
  Keyboard,
  Laptop,
  Link2,
  Monitor,
  MousePointer2,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  StickyNote,
  Tablet,
  WandSparkles,
  Wifi,
  X,
} from "lucide-react";

type Feature = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  demoTitle: string;
  demoDescription: string;
};

const features: Feature[] = [
  {
    id: "sync",
    title: "Sync everywhere",
    description:
      "Keep your notes available across your laptop, phone, and tablet.",
    category: "Productivity",
    tags: ["cloud", "devices", "backup", "offline", "synchronization"],
    demoTitle: "One thought, every device",
    demoDescription:
      "Your notes will be designed to follow you between your devices.",
  },
  {
    id: "sticky",
    title: "Sticky notes",
    description:
      "Turn quick thoughts, reminders, and important ideas into sticky notes.",
    category: "Organization",
    tags: ["pin", "board", "color", "reminders", "canvas"],
    demoTitle: "Capture it before you forget",
    demoDescription:
      "Create small visual notes for the things that deserve attention.",
  },
  {
    id: "sketch",
    title: "Sketch and draw",
    description:
      "Express ideas with freehand drawings, diagrams, and handwritten notes.",
    category: "Creativity",
    tags: ["drawing", "pen", "pencil", "whiteboard", "handwriting"],
    demoTitle: "Ideas don't always need words",
    demoDescription:
      "A future sketching workspace for rough ideas and visual thinking.",
  },
  {
    id: "ai",
    title: "AI writing assistant",
    description:
      "Explore tools for summarizing, rewriting, explaining, and brainstorming.",
    category: "AI",
    tags: ["artificial intelligence", "summary", "rewrite", "ideas", "writing"],
    demoTitle: "From rough notes to clear ideas",
    demoDescription:
      "Imagine turning a long note into a concise summary in seconds.",
  },
  {
    id: "media",
    title: "Notes with media",
    description:
      "Bring images, audio, documents, and other attachments into your notes.",
    category: "Creativity",
    tags: ["photo", "picture", "voice", "recording", "file", "attachment"],
    demoTitle: "More than plain text",
    demoDescription:
      "Keep supporting media alongside the thoughts they belong to.",
  },
  {
    id: "search",
    title: "Smart search",
    description:
      "Find notes by their titles, topics, keywords, and related concepts.",
    category: "Productivity",
    tags: ["find", "filter", "keywords", "discovery", "lookup"],
    demoTitle: "Find the thought you need",
    demoDescription:
      "Search ideas by topic instead of remembering the exact note title.",
  },
  {
    id: "links",
    title: "Connected notes",
    description:
      "Connect related notes and build a web of ideas that grows over time.",
    category: "Organization",
    tags: ["backlinks", "relationships", "knowledge", "graph", "folders"],
    demoTitle: "One idea leads to another",
    demoDescription:
      "Explore relationships between projects, research, and personal notes.",
  },
  {
    id: "shortcuts",
    title: "Keyboard shortcuts",
    description:
      "Navigate your workspace and create notes without interrupting your flow.",
    category: "Productivity",
    tags: ["keyboard", "commands", "quick actions", "speed", "power user"],
    demoTitle: "Keep your hands on the keyboard",
    demoDescription:
      "Quick actions are planned for creating, finding, and organizing notes.",
  },
  {
    id: "collab",
    title: "Live collaboration",
    description:
      "Work together on notes, share ideas, and collaborate in real time.",
    category: "Teamwork",
    tags: ["team", "shared notes", "cursors", "editing", "real time"],
    demoTitle: "Think better together",
    demoDescription:
      "A future collaborative workspace for shared thinking and editing.",
  },
];

const categories = [
  "All",
  "Productivity",
  "Organization",
  "Creativity",
  "AI",
  "Teamwork",
];

const sampleNotes = [
  {
    title: "Startup ideas",
    content: "business, product, brainstorming, AI",
  },
  {
    title: "Study plan",
    content: "learning, revision, summary, productivity",
  },
  {
    title: "Project research",
    content: "images, documents, links, knowledge",
  },
  {
    title: "Things to remember",
    content: "reminders, sticky notes, quick thoughts",
  },
];

const normalize = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Login() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFeatureId, setSelectedFeatureId] = useState("sync");
  const [selectedDevice, setSelectedDevice] = useState("Laptop");
  const [stickyColor, setStickyColor] = useState("yellow");
  const [sketchTool, setSketchTool] = useState("Pen");
  const [aiAction, setAiAction] = useState("Summarize");
  const [mediaType, setMediaType] = useState("Image");
  const [searchDemo, setSearchDemo] = useState("");
  const [linkedNote, setLinkedNote] = useState("Startup ideas");
  const [shortcutIndex, setShortcutIndex] = useState(0);

  const selectedFeature =
    features.find((feature) => feature.id === selectedFeatureId) ?? features[0];

  const filteredFeatures = useMemo(() => {
    const query = normalize(searchQuery);

    return features.filter((feature) => {
      const matchesCategory =
        activeCategory === "All" || feature.category === activeCategory;

      const searchableText = normalize(
        [
          feature.title,
          feature.description,
          feature.category,
          feature.demoTitle,
          feature.demoDescription,
          ...feature.tags,
        ].join(" ")
      );

      const queryWords = query.split(" ").filter(Boolean);

      const matchesSearch =
        queryWords.length === 0 ||
        queryWords.every((word) => searchableText.includes(word));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const filteredNotes = useMemo(() => {
    const query = normalize(searchDemo);

    if (!query) return sampleNotes;

    return sampleNotes.filter((note) =>
      normalize(`${note.title} ${note.content}`).includes(query)
    );
  }, [searchDemo]);

  const selectFeature = (id: string) => {
    setSelectedFeatureId(id);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        {/* Navigation */}
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--foreground)] text-[var(--background)] transition-transform group-hover:-rotate-6">
              <FileText size={21} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">Smriti Notes</p>
              <p className="text-xs text-[var(--muted)]">
                A home for your thoughts
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--hover)]"
          >
            <ArrowLeft size={15} />
            Back to notes
          </Link>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              Something thoughtful is taking shape
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your thoughts.
              <br />
              <span className="text-[var(--muted)]">Without limits.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              A calmer space for everything on your mind. Capture a thought,
              connect your ideas, and make something meaningful out of them.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-5 py-3.5 text-sm font-semibold text-[var(--background)]">
                <LockIcon />
                Login is coming soon
              </div>

              <a
                href="#future"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-[var(--hover)]"
              >
                Explore the future
                <ArrowDownRight size={16} />
              </a>
            </div>

            <p className="mt-4 max-w-lg text-xs leading-5 text-[var(--muted)]">
              Sign-in and cloud sync are not available yet. If you already use
              local notes, continue using your existing workspace.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-2">
                <Check size={14} />
                Local-first thinking
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} />
                Built for creativity
              </span>
              <span className="flex items-center gap-2">
                <Check size={14} />
                More than plain text
              </span>
            </div>
          </div>

          {/* Decorative notebook preview */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -right-3 top-8 h-40 w-40 rounded-full bg-[var(--muted)] opacity-10 blur-3xl" />
            <div className="absolute -bottom-4 -left-3 h-40 w-40 rounded-full bg-[var(--muted)] opacity-10 blur-3xl" />

            <div className="relative rotate-1 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl transition-transform duration-500 hover:rotate-0 sm:p-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-400" />
                  <div className="size-2 rounded-full bg-yellow-400" />
                  <div className="size-2 rounded-full bg-green-400" />
                </div>

                <span className="text-xs text-[var(--muted)]">
                  Your creative space
                </span>

                <Command size={16} className="text-[var(--muted)]" />
              </div>

              <div className="grid grid-cols-2 gap-3 py-5">
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-[var(--hover)]">
                    <StickyNote size={18} />
                  </div>
                  <p className="text-sm font-semibold">Quick thoughts</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Save the little things.
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-[var(--hover)]">
                    <Brain size={18} />
                  </div>
                  <p className="text-sm font-semibold">Big ideas</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Connect the dots.
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-[var(--border)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      A note to yourself
                    </span>
                    <Sparkles size={16} className="text-[var(--muted)]" />
                  </div>

                  <p className="text-sm leading-6 text-[var(--muted)]">
                    “Every great project begins with a small thought. Give it
                    somewhere to grow.”
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px]">
                      Ideas
                    </span>
                    <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px]">
                      Personal
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[var(--hover)] px-4 py-3">
                <span className="text-xs text-[var(--muted)]">
                  A little space to think
                </span>
                <WandSparkles size={16} />
              </div>
            </div>

            <div className="absolute -bottom-5 -right-2 hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--hover)]">
                  <Wifi size={17} />
                </div>
                <div>
                  <p className="text-xs font-semibold">Built to grow</p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    More possibilities ahead
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature explorer */}
        <section id="future" className="scroll-mt-8 py-12 sm:py-16">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                The roadmap
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                More than a notebook.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Explore the ideas behind Smriti. Search for a capability,
                choose a category, and interact with its concept preview.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <MousePointer2 size={15} />
              Select a feature to explore
            </div>
          </div>

          {/* Smarter feature search */}
          <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
            <div className="flex items-center gap-3 px-2">
              <Search size={19} className="shrink-0 text-[var(--muted)]" />

              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search features, ideas, AI, drawing, devices..."
                aria-label="Search planned features"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[var(--muted)]"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear feature search"
                  className="rounded-lg p-2 transition-colors hover:bg-[var(--hover)]"
                >
                  <X size={16} />
                </button>
              )}

              <span className="hidden rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--muted)] sm:inline">
                {filteredFeatures.length} results
              </span>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto border-t border-[var(--border)] pt-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "border border-[var(--border)] hover:bg-[var(--hover)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          {filteredFeatures.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFeatures.map((feature, index) => {
                const active = feature.id === selectedFeatureId;

                return (
                  <button
                    key={feature.id}
                    onClick={() => selectFeature(feature.id)}
                    aria-pressed={active}
                    className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--hover)] ${
                      active
                        ? "border-[var(--foreground)] bg-[var(--hover)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`}
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex size-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        {feature.id === "sync" && <Laptop size={20} />}
                        {feature.id === "sticky" && <StickyNote size={20} />}
                        {feature.id === "sketch" && <MousePointer2 size={20} />}
                        {feature.id === "ai" && <Brain size={20} />}
                        {feature.id === "media" && <ImageIcon size={20} />}
                        {feature.id === "search" && <Search size={20} />}
                        {feature.id === "links" && <Link2 size={20} />}
                        {feature.id === "shortcuts" && <Keyboard size={20} />}
                        {feature.id === "collab" && <Command size={20} />}
                      </div>

                      <span className="text-xs text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {feature.description}
                        </p>
                      </div>

                      <ChevronRight
                        size={17}
                        className={`mt-1 shrink-0 transition-transform ${
                          active
                            ? "translate-x-0"
                            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[10px]">
                        {feature.category}
                      </span>

                      <span className="text-[10px] text-[var(--muted)]">
                        Planned feature
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
              <CircleHelp
                size={28}
                className="mx-auto mb-3 text-[var(--muted)]"
              />
              <h3 className="font-semibold">No matching features</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Try another keyword or explore all categories.
              </p>
              <button
                onClick={clearSearch}
                className="mt-5 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--hover)]"
              >
                Show all features
              </button>
            </div>
          )}

          {/* Interactive feature playground */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-7">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                  <Sparkles size={14} />
                  INTERACTIVE CONCEPT
                </div>
                <h3 className="text-xl font-semibold">
                  {selectedFeature.demoTitle}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {selectedFeature.demoDescription}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Concept preview
              </span>
            </div>

            <div className="grid md:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-[var(--border)] p-5 sm:p-7 md:border-b-0 md:border-r">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Choose a feature
                </p>

                <div className="space-y-1">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => selectFeature(feature.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                        feature.id === selectedFeatureId
                          ? "bg-[var(--hover)] font-semibold"
                          : "hover:bg-[var(--hover)]"
                      }`}
                    >
                      <span>{feature.title}</span>
                      {feature.id === selectedFeatureId && (
                        <Check size={16} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0 p-5 sm:p-7">
                {selectedFeatureId === "sync" && (
                  <div>
                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)]">
                      <Monitor size={22} />
                    </div>
                    <h4 className="text-lg font-semibold">
                      Where will you take your notes?
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Choose a device to explore the planned experience.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        { name: "Laptop", Icon: Laptop },
                        { name: "Phone", Icon: Smartphone },
                        { name: "Tablet", Icon: Tablet },
                      ].map(({ name, Icon }) => (
                        <button
                          key={name}
                          onClick={() => setSelectedDevice(name)}
                          className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-sm transition-colors ${
                            selectedDevice === name
                              ? "border-[var(--foreground)] bg-[var(--hover)]"
                              : "border-[var(--border)] hover:bg-[var(--hover)]"
                          }`}
                        >
                          <Icon size={22} />
                          {name}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-[var(--border)] p-4 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                        <Check size={16} />
                        {selectedDevice} preview selected
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                        Cross-device synchronization is planned and is not
                        active yet.
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeatureId === "sticky" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Make a little reminder
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Choose a color for your conceptual sticky note.
                    </p>

                    <div className="mt-5 flex gap-3">
                      {[
                        { id: "yellow", label: "Sunshine", color: "#f5dc83" },
                        { id: "pink", label: "Blush", color: "#efb8c9" },
                        { id: "blue", label: "Sky", color: "#a9d6e5" },
                        { id: "green", label: "Mint", color: "#b9d9b1" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          aria-label={`${item.label} sticky note`}
                          onClick={() => setStickyColor(item.id)}
                          className={`size-9 rounded-full border-2 transition-transform hover:scale-110 ${
                            stickyColor === item.id
                              ? "border-[var(--foreground)] ring-2 ring-[var(--border)]"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: item.color }}
                        />
                      ))}
                    </div>

                    <div
                      className="mt-6 min-h-40 max-w-xs rotate-[-2deg] rounded-sm p-5 text-gray-800 shadow-lg"
                      style={{
                        backgroundColor:
                          {
                            yellow: "#f5dc83",
                            pink: "#efb8c9",
                            blue: "#a9d6e5",
                            green: "#b9d9b1",
                          }[stickyColor] ?? "#f5dc83",
                      }}
                    >
                      <StickyNote size={19} />
                      <p className="mt-5 font-semibold">Remember this idea</p>
                      <p className="mt-2 text-sm">
                        Small steps still move you forward.
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeatureId === "sketch" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Your imaginary sketchpad
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Switch between tools in this visual concept.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Pen", "Pencil", "Highlighter"].map((tool) => (
                        <button
                          key={tool}
                          onClick={() => setSketchTool(tool)}
                          className={`rounded-xl border px-3 py-2 text-xs ${
                            sketchTool === tool
                              ? "border-[var(--foreground)] bg-[var(--hover)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] p-5">
                      <svg
                        viewBox="0 0 280 100"
                        className="w-full max-w-sm"
                        role="img"
                        aria-label={`Example ${sketchTool.toLowerCase()} drawing`}
                      >
                        <path
                          d="M12 68 Q35 5 65 52 T120 45 T175 57 T230 24 T268 49"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={sketchTool === "Highlighter" ? 10 : 2.5}
                          strokeLinecap="round"
                          opacity={sketchTool === "Highlighter" ? 0.25 : 0.8}
                        />
                        <path
                          d="M38 78 Q75 90 110 70 T183 78 T248 67"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          opacity="0.45"
                        />
                      </svg>
                      <p className="mt-3 text-xs text-[var(--muted)]">
                        Previewing: {sketchTool}
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeatureId === "ai" && (
                  <div>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-[var(--border)]">
                      <Sparkles size={22} />
                    </div>
                    <h4 className="text-lg font-semibold">
                      Give your notes a little help
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Choose a possible AI action to see an example.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {["Summarize", "Rewrite", "Explain", "Brainstorm"].map(
                        (action) => (
                          <button
                            key={action}
                            onClick={() => setAiAction(action)}
                            className={`rounded-xl border px-3 py-2 text-xs ${
                              aiAction === action
                                ? "border-[var(--foreground)] bg-[var(--hover)]"
                                : "border-[var(--border)]"
                            }`}
                          >
                            {action}
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[var(--border)] p-5">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                        <WandSparkles size={15} />
                        Example output
                      </div>
                      <p className="mt-4 text-sm font-semibold">{aiAction}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {{
                          Summarize:
                            "Turn a long collection of thoughts into the essential points.",
                          Rewrite:
                            "Express the same idea in a clearer, more natural way.",
                          Explain:
                            "Break down a difficult concept into smaller, understandable steps.",
                          Brainstorm:
                            "Generate possible directions to help an idea develop.",
                        }[aiAction] ?? ""}
                      </p>
                      <p className="mt-4 text-xs text-[var(--muted)]">
                        Illustrative example only. AI actions are not connected.
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeatureId === "media" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      A home for every kind of thought
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Select the type of media you want to keep with a note.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        { name: "Image", Icon: ImageIcon },
                        { name: "Audio", Icon: AudioLines },
                        { name: "File", Icon: FileText },
                      ].map(({ name, Icon }) => (
                        <button
                          key={name}
                          onClick={() => setMediaType(name)}
                          className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-sm ${
                            mediaType === name
                              ? "border-[var(--foreground)] bg-[var(--hover)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <Icon size={22} />
                          {name}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-5 text-center">
                      {mediaType === "Image" && <ImageIcon className="mx-auto" />}
                      {mediaType === "Audio" && <AudioLines className="mx-auto" />}
                      {mediaType === "File" && <FileText className="mx-auto" />}
                      <p className="mt-3 text-sm font-medium">
                        {mediaType} attachment concept
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Attachment support is planned, not active here.
                      </p>
                    </div>
                  </div>
                )}

                {selectedFeatureId === "search" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Search your sample notes
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Try a topic such as AI, study, reminders, or images.
                    </p>

                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] px-3">
                      <Search
                        size={17}
                        className="shrink-0 text-[var(--muted)]"
                      />
                      <input
                        value={searchDemo}
                        onChange={(event) => setSearchDemo(event.target.value)}
                        placeholder="Search sample notes..."
                        aria-label="Search sample notes"
                        className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[var(--muted)]"
                      />
                      {searchDemo && (
                        <button
                          onClick={() => setSearchDemo("")}
                          aria-label="Clear sample note search"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    <div className="mt-3 space-y-2">
                      {filteredNotes.map((note) => (
                        <div
                          key={note.title}
                          className="rounded-xl border border-[var(--border)] p-3"
                        >
                          <p className="text-sm font-medium">{note.title}</p>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {note.content}
                          </p>
                        </div>
                      ))}

                      {filteredNotes.length === 0 && (
                        <p className="py-6 text-center text-sm text-[var(--muted)]">
                          No sample notes match that search.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedFeatureId === "links" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Follow your train of thought
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Select a sample note to explore its conceptual connection.
                    </p>

                    <select
                      value={linkedNote}
                      onChange={(event) => setLinkedNote(event.target.value)}
                      className="mt-5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm outline-none"
                    >
                      {sampleNotes.map((note) => (
                        <option key={note.title} value={note.title}>
                          {note.title}
                        </option>
                      ))}
                    </select>

                    <div className="mt-5 grid grid-cols-3 items-center gap-2">
                      <div className="rounded-xl border border-[var(--border)] p-3 text-center text-xs font-medium">
                        {linkedNote}
                      </div>
                      <div className="flex justify-center">
                        <Link2 size={21} className="text-[var(--muted)]" />
                      </div>
                      <div className="rounded-xl border border-[var(--border)] p-3 text-center text-xs font-medium">
                        Related idea
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                      This illustrates connected notes. Real note linking is a
                      separate feature to implement.
                    </p>
                  </div>
                )}

                {selectedFeatureId === "shortcuts" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Quick actions, fewer clicks
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Browse some shortcut ideas.
                    </p>

                    <div className="mt-5 space-y-2">
                      {[
                        ["Create a note", "Ctrl / ⌘", "N"],
                        ["Search notes", "Ctrl / ⌘", "K"],
                        ["Save changes", "Ctrl / ⌘", "S"],
                      ].map(([action, modifier, key], index) => (
                        <button
                          key={action}
                          onClick={() => setShortcutIndex(index)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                            shortcutIndex === index
                              ? "border-[var(--foreground)] bg-[var(--hover)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          <span className="text-sm">{action}</span>
                          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                            <kbd className="rounded-md border border-[var(--border)] px-2 py-1">
                              {modifier}
                            </kbd>
                            <kbd className="rounded-md border border-[var(--border)] px-2 py-1">
                              {key}
                            </kbd>
                          </span>
                        </button>
                      ))}
                    </div>

                    <p className="mt-4 text-xs text-[var(--muted)]">
                      Shortcut examples only. These commands are not registered
                      by this preview.
                    </p>
                  </div>
                )}

                {selectedFeatureId === "collab" && (
                  <div>
                    <h4 className="text-lg font-semibold">
                      Ideas are better shared
                    </h4>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Imagine several people contributing to the same note.
                    </p>

                    <div className="mt-5 rounded-2xl border border-[var(--border)] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          Team brainstorm
                        </span>
                        <div className="flex -space-x-2">
                          {["S", "A", "M"].map((letter) => (
                            <div
                              key={letter}
                              className="flex size-8 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--hover)] text-xs font-semibold"
                            >
                              {letter}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 text-sm">
                        <p className="rounded-xl bg-[var(--hover)] p-3">
                          <span className="font-medium">S:</span> Start with the
                          problem we want to solve.
                        </p>
                        <p className="rounded-xl border border-[var(--border)] p-3">
                          <span className="font-medium">A:</span> Collect ideas
                          and connect related notes.
                        </p>
                        <p className="rounded-xl border border-[var(--border)] p-3">
                          <span className="font-medium">M:</span> Turn the best
                          ideas into a plan.
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-[var(--muted)]">
                      Illustrative collaboration preview. No other users are
                      connected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Closing section */}
        <section className="my-12 rounded-3xl border border-[var(--border)] p-7 sm:my-16 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                A little more patience
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Good ideas deserve a good home.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Smriti is being built one thoughtful feature at a time. Login
                will arrive when the experience is ready.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 py-3.5 text-sm font-semibold text-[var(--background)] transition-opacity hover:opacity-80"
            >
              Back to notes
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <footer className="flex flex-col justify-between gap-3 border-t border-[var(--border)] py-6 text-xs text-[var(--muted)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Smriti Notes</p>
          <p>Made for the thoughts worth keeping.</p>
        </footer>
      </div>
    </main>
  );
}

function LockIcon() {
  return <Check size={16} />;
}
