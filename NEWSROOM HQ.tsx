"use client";

import { useState, useEffect, useRef } from "react";
import {
    Template,
    initialTemplates,
    LogoPosition,
    LogoPreset,
    LogoShape,
    LogoType,
} from "@/types/template";
import { LogoBadge } from "@/components/template/LogoBadge";

const STORAGE_KEY = "newsroom_hq_templates";

function highlightSampleText(text: string, ac: string) {
    const words = text.toUpperCase().split(" ");
    const splitIdx = Math.max(0, words.length - 2);
    const head = words.slice(0, splitIdx).join(" ");
    const tail = words.slice(splitIdx).join(" ");
    return (
        <>
            {head}{" "}
            <i style={{ color: ac, fontStyle: "normal" }}>{tail}</i>
        </>
    );
}

function renderMiniPreview(t: Template) {
    const ar = t.uk === "1:1" ? "1/1" : "4/5";
    const bgGradient = "linear-gradient(150deg,#475569,#1e293b)";
    const headlineFont = t.fontFamily || "Anton, Impact, sans-serif";

    return (
        <div className="pvx" style={{ aspectRatio: ar, position: "relative" }}>
            {t.fontUrl && t.fontFamily && (
                <style>{`
          @font-face {
            font-family: '${t.fontFamily}';
            src: url('${t.fontUrl}');
            font-display: swap;
          }
        `}</style>
            )}
            <LogoBadge t={t} />
            {t.lay === "foto-atas" ? (
                <>
                    <div style={{ background: bgGradient, flex: 55, minHeight: 0 }} />
                    <div className="pvb" style={{ background: t.bg, color: "#fff", flex: 45 }}>
                        <span className="pvg" style={{ background: t.ac, color: "#111" }}>
                            AI
                        </span>
                        <div className="pvt" style={{ fontSize: `${t.fs * 0.263}cqw`, fontFamily: headlineFont }}>
                            {highlightSampleText("Contoh headline untuk pratinjau template", t.ac)}
                        </div>
                        <div className="pvf">{t.ft}</div>
                    </div>
                </>
            ) : t.lay === "foto-penuh" ? (
                <div
                    className="pvb"
                    style={{
                        background: bgGradient,
                        flex: 1,
                        justifyContent: "flex-end",
                        position: "relative",
                        color: "#fff",
                    }}
                >
                    <div className="pvo" />
                    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "2.4cqw" }}>
                        <span className="pvg" style={{ background: t.ac, color: "#111" }}>
                            AI
                        </span>
                        <div className="pvt" style={{ fontSize: `${t.fs * 0.263}cqw`, fontFamily: headlineFont }}>
                            {highlightSampleText("Contoh headline untuk pratinjau template", t.ac)}
                        </div>
                        <div className="pvf">{t.ft}</div>
                    </div>
                </div>
            ) : (
                <div
                    className="pvb"
                    style={{ background: t.bg, color: "#fff", flex: 1, justifyContent: "center" }}
                >
                    <span className="pvg" style={{ background: t.ac, color: "#111" }}>
                        AI
                    </span>
                    <div className="pvt" style={{ fontSize: `${t.fs * 0.263}cqw`, fontFamily: headlineFont }}>
                        {highlightSampleText("Contoh headline untuk pratinjau template", t.ac)}
                    </div>
                    <div className="pvf">{t.ft}</div>
                </div>
            )}
        </div>
    );
}

const PRESET_ICONS: { id: LogoPreset; name: string; desc: string }[] = [
    { id: "newsroom", name: "Newsroom", desc: "Badge Berita HQ" },
    { id: "radar", name: "Radar", desc: "Sinyal Pantauan" },
    { id: "globe", name: "Globe", desc: "Berita Global" },
    { id: "bolt", name: "Kilat", desc: "Breaking / Flash" },
    { id: "broadcast", name: "Siaran", desc: "Siaran Langsung" },
];

const FONT_PRESETS = [
    { id: "Anton, Impact, sans-serif", name: "Anton", desc: "Tebal editorial koran (Bawaan)" },
    { id: "'Bebas Neue', sans-serif", name: "Bebas Neue", desc: "Tinggi ramping modern" },
    { id: "'Montserrat', sans-serif", name: "Montserrat Black", desc: "Geometris tegas" },
    { id: "'Playfair Display', serif", name: "Playfair Display", desc: "Serif elegan premium" },
    { id: "'Instrument Sans', sans-serif", name: "Instrument Sans", desc: "Sans modern netral" },
];

export default function TemplatePage() {
    const [templateList, setTemplateList] = useState<Template[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                }
            } catch { }
        }
        return initialTemplates;
    });
    const [selectedId, setSelectedId] = useState<number>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed[0].id;
                    }
                }
            } catch { }
        }
        return 1;
    });
    const [activeTab, setActiveTab] = useState<"logo" | "font" | "desain">("font");
    const [toastMsg, setToastMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fontFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch("/api/templates")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.success && Array.isArray(data.templates) && data.templates.length > 0) {
                    setTemplateList(data.templates);
                }
            })
            .catch((err) => console.warn("Failed to fetch templates from backend:", err));
    }, []);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 2200);
    };

    const selectedTemplate =
        templateList.find((t) => t.id === selectedId) || templateList[0];

    const handleUpdate = <K extends keyof Template>(field: K, val: Template[K]) => {
        setTemplateList((prev) => {
            const updated = prev.map((t) =>
                t.id === selectedId ? { ...t, [field]: val } : t
            );
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch (err) {
                console.warn("Storage quota warning:", err);
            }
            return updated;
        });

        // Sync to backend
        fetch(`/api/templates/${selectedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: val }),
        }).catch(() => { });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast("Ukuran file maksimal 2MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                handleUpdate("logoType", "upload");
                handleUpdate("logoUrl", result);
                showToast("Logo berhasil diunggah");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFontFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            showToast("Ukuran file font maksimal 4MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
                const uniqueFontFamily = `CustomFont_${safeName}_${selectedTemplate.id}`;

                try {
                    const fontFace = new FontFace(uniqueFontFamily, `url(${result})`);
                    fontFace.load().then((loaded) => {
                        document.fonts.add(loaded);
                    }).catch((err) => console.warn("FontFace load:", err));
                } catch (err) {
                    console.warn("FontFace API:", err);
                }

                handleUpdate("fontFamily", uniqueFontFamily);
                handleUpdate("fontUrl", result);
                handleUpdate("fontName", file.name);
                showToast(`✓ Font "${file.name}" berhasil diunggah`);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFont = () => {
        handleUpdate("fontFamily", "Anton, Impact, sans-serif");
        handleUpdate("fontUrl", undefined);
        handleUpdate("fontName", "Anton");
        showToast("Font kustom dihapus, kembali ke default");
    };

    const handleNew = () => {
        const newTpl: Template = {
            id: Date.now(),
            n: "Template Baru",
            tipe: "Single post",
            lay: "foto-atas",
            uk: "4:5",
            bg: "#1d4ed8",
            ac: "#c8f53c",
            fs: 22,
            ft: "@namaakun",
            def: 0,
            showLogo: true,
            logoType: "preset",
            logoPreset: "newsroom",
            logoText: "HQ",
            logoPos: "top-right",
            logoSize: 7.5,
            logoShape: "pill",
            logoOpacity: 1,
            fontFamily: "Anton, Impact, sans-serif",
            fontName: "Anton",
        };
        const updated = [...templateList, newTpl];
        setTemplateList(updated);
        setSelectedId(newTpl.id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { }
        showToast("Template baru ditambahkan");
    };

    const handleDuplicate = (id: number) => {
        const target = templateList.find((t) => t.id === id);
        if (!target) return;
        const copy: Template = {
            ...target,
            id: Date.now(),
            n: target.n + " (salinan)",
            def: 0,
        };
        const updated = [...templateList, copy];
        setTemplateList(updated);
        setSelectedId(copy.id);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { }
        showToast("Template diduplikat");
    };

    const handleSetDefault = (id: number) => {
        const target = templateList.find((t) => t.id === id);
        if (!target) return;
        const updated = templateList.map((t) => {
            if (t.tipe === target.tipe) {
                return { ...t, def: t.id === id ? 1 : 0 };
            }
            return t;
        });
        setTemplateList(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { }
        showToast(`Jadi default untuk ${target.tipe}`);
    };

    const handleDelete = (id: number) => {
        const target = templateList.find((t) => t.id === id);
        if (target?.def) {
            showToast("Template default tidak bisa dihapus");
            return;
        }
        const updated = templateList.filter((t) => t.id !== id);
        setTemplateList(updated);
        setSelectedId(updated[0]?.id || 1);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch { }
        showToast("Template dihapus");
    };

    const handleResetDefaults = () => {
        if (confirm("Kembalikan semua template ke pengaturan awal?")) {
            setTemplateList(initialTemplates);
            setSelectedId(1);
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch { }
            showToast("Template direset ke default");
        }
    };

    // Safe logo values with fallbacks
    const currentLogoPos: LogoPosition = selectedTemplate.logoPos || "top-right";
    const currentLogoSize: number = selectedTemplate.logoSize ?? 7.5;
    const currentLogoType: LogoType = selectedTemplate.logoType || "preset";
    const currentLogoPreset: LogoPreset = selectedTemplate.logoPreset || "newsroom";
    const currentLogoShape: LogoShape = selectedTemplate.logoShape || "pill";
    const currentLogoOpacity: number = selectedTemplate.logoOpacity ?? 1;
    const isLogoEnabled: boolean = selectedTemplate.showLogo !== false;

    return (
        <>
            <div className="hd">
                <span className="ey">Sistem desain & Merek</span>
                <h1>Template & Identitas Logo</h1>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button className="btn" onClick={handleResetDefaults} title="Kembalikan template bawaan">
                        ↺ Reset Bawaan
                    </button>
                    <button className="btn p" onClick={handleNew}>
                        + Template baru
                    </button>
                </div>
                <p>
                    Kelola desain template, logo, tata letak, dan watermark merek. Template ini otomatis
                    digunakan oleh editor konten dan perancang visual Newsroom HQ.
                </p>
            </div>

            {/* Grid of Templates */}
            <div className="grid g3">
                {templateList.map((t) => {
                    const hasLogo = t.showLogo !== false;
                    return (
                        <div
                            key={t.id}
                            className="card"
                            style={t.id === selectedId ? { borderColor: "var(--acc)", boxShadow: "0 0 0 1px var(--acc)" } : undefined}
                        >
                            <div className="pvw">{renderMiniPreview(t)}</div>
                            <h3 style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>{t.n}</span>
                                {t.def === 1 && <span className="pill">default</span>}
                            </h3>
                            <p style={{ color: "var(--mut)", margin: "0 0 10px", fontSize: "13px" }}>
                                <span>{t.tipe} · {t.uk} · {t.lay}</span>
                                <span style={{ display: "block", color: "var(--mut)", fontSize: "12px", marginTop: "2px" }}>
                                    🔤 Font: <strong style={{ color: "#fff" }}>{t.fontName || (t.fontFamily ? t.fontFamily.split(",")[0].replace(/['"]/g, "") : "Anton")}</strong>
                                </span>
                                {hasLogo ? (
                                    <span style={{ display: "block", color: "var(--acc)", fontSize: "12px", marginTop: "2px" }}>
                                        🏷️ Logo: {t.logoType === "upload" ? "Upload Gambar" : t.logoType === "text" ? "Teks Monogram" : `Ikon ${t.logoPreset || "Preset"}`} ({t.logoPos || "top-right"})
                                    </span>
                                ) : (
                                    <span style={{ display: "block", color: "var(--mut)", fontSize: "12px", marginTop: "2px" }}>
                                        Tanpa Logo
                                    </span>
                                )}
                            </p>
                            <div className="tabs" style={{ margin: 0 }}>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        setSelectedId(t.id);
                                        showToast(`Template ${t.n} siap digunakan`);
                                    }}
                                >
                                    Pakai
                                </button>
                                <button
                                    className="btn"
                                    style={t.id === selectedId ? { background: "var(--acc)", color: "#000", fontWeight: 700 } : undefined}
                                    onClick={() => setSelectedId(t.id)}
                                >
                                    Edit
                                </button>
                                <button className="btn" onClick={() => handleDuplicate(t.id)}>
                                    Duplikat
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Selected Template */}
            <div className="card sec" style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
                    <div>
                        <span className="ey">Kustomisasi Template #{selectedTemplate.id}</span>
                        <h3 style={{ margin: "2px 0 0", fontSize: "20px" }}>Edit: {selectedTemplate.n}</h3>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            className="btn p"
                            onClick={() => {
                                try {
                                    localStorage.setItem(STORAGE_KEY, JSON.stringify(templateList));
                                } catch { }
                                showToast("✓ Template berhasil disimpan");
                            }}
                        >
                            ✓ Simpan Template
                        </button>
                        <button className="btn" onClick={() => handleSetDefault(selectedTemplate.id)}>
                            Jadikan default
                        </button>
                        <button
                            className="btn"
                            onClick={() => handleDelete(selectedTemplate.id)}
                            style={{ color: "var(--bad)" }}
                        >
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Section Tabs: Font vs Logo vs Desain */}
                <div className="tabs" style={{ marginBottom: "16px" }}>
                    <button
                        type="button"
                        aria-pressed={activeTab === "font"}
                        onClick={() => setActiveTab("font")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <span>🔤 Font Headline</span>
                        <span
                            style={{
                                fontSize: "11px",
                                padding: "1px 6px",
                                borderRadius: "99px",
                                background: selectedTemplate.fontUrl ? "rgba(52, 211, 153, 0.2)" : "rgba(255,255,255,0.1)",
                                color: selectedTemplate.fontUrl ? "var(--ok)" : "var(--mut)",
                            }}
                        >
                            {selectedTemplate.fontName || (selectedTemplate.fontFamily ? selectedTemplate.fontFamily.split(",")[0].replace(/['"]/g, "") : "Anton")}
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-pressed={activeTab === "logo"}
                        onClick={() => setActiveTab("logo")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <span>🏷️ Pengaturan Logo & Watermark</span>
                        <span
                            style={{
                                fontSize: "11px",
                                padding: "1px 6px",
                                borderRadius: "99px",
                                background: isLogoEnabled ? "rgba(52, 211, 153, 0.2)" : "rgba(255,255,255,0.1)",
                                color: isLogoEnabled ? "var(--ok)" : "var(--mut)",
                            }}
                        >
                            {isLogoEnabled ? "Aktif" : "Mati"}
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-pressed={activeTab === "desain"}
                        onClick={() => setActiveTab("desain")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <span>🎨 Tata Letak & Warna Dasar</span>
                    </button>
                </div>

                <div className="grid g2e" style={{ alignItems: "start", gap: "24px" }}>
                    {/* Form Side */}
                    <div>
                        {activeTab === "font" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {/* 1. Status Font Aktif & Mini Pratinjau */}
                                <div
                                    style={{
                                        padding: "16px",
                                        background: "var(--bg)",
                                        borderRadius: "12px",
                                        border: "1px solid var(--line)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <strong style={{ fontSize: "14px", color: "#fff" }}>🔤 Font Headline Terpilih</strong>
                                        <span style={{ fontSize: "12px", color: "var(--acc)", fontWeight: 700 }}>
                                            {selectedTemplate.fontName || (selectedTemplate.fontFamily ? selectedTemplate.fontFamily.split(",")[0].replace(/['"]/g, "") : "Anton (Bawaan)")}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            padding: "14px 16px",
                                            background: "rgba(0, 0, 0, 0.5)",
                                            borderRadius: "8px",
                                            border: "1px solid var(--line)",
                                            fontFamily: selectedTemplate.fontFamily || "Anton, Impact, sans-serif",
                                            fontSize: "22px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.02em",
                                            color: "#fff",
                                            lineHeight: 1.15,
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        CONTOH HEADLINE BERITA DENGAN FONT INI
                                    </div>
                                    <p style={{ fontSize: "12px", color: "var(--mut)", margin: "8px 0 0" }}>
                                        Font ini digunakan untuk rendering judul berita utama template di seluruh antrian dan media postingan.
                                    </p>
                                </div>

                                {/* 2. Upload File Font Kustom */}
                                <div
                                    style={{
                                        padding: "16px",
                                        background: "var(--bg)",
                                        borderRadius: "12px",
                                        border: selectedTemplate.fontUrl ? "1px solid var(--acc)" : "1px solid var(--line)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <strong style={{ fontSize: "14px", color: "#fff" }}>📁 Unggah File Font Kustom</strong>
                                        {selectedTemplate.fontUrl && (
                                            <span style={{ fontSize: "12px", color: "var(--ok)", fontWeight: 700 }}>
                                                ✓ Font Kustom Aktif
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: "12px", color: "var(--mut)", margin: "0 0 12px" }}>
                                        Unggah file font brand Anda dalam format <code>.ttf</code>, <code>.otf</code>, <code>.woff</code>, atau <code>.woff2</code> (maksimal 4MB).
                                    </p>

                                    <input
                                        type="file"
                                        ref={fontFileInputRef}
                                        accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2,application/x-font-ttf,application/font-woff"
                                        style={{ display: "none" }}
                                        onChange={handleFontFileUpload}
                                    />

                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            className="btn p"
                                            onClick={() => fontFileInputRef.current?.click()}
                                        >
                                            📁 Pilih File Font (.ttf / .otf / .woff / .woff2)
                                        </button>

                                        {selectedTemplate.fontUrl && (
                                            <button
                                                type="button"
                                                className="btn"
                                                style={{ color: "var(--bad)" }}
                                                onClick={handleRemoveFont}
                                            >
                                                ✕ Hapus Font Kustom
                                            </button>
                                        )}
                                    </div>

                                    {selectedTemplate.fontUrl && (
                                        <div
                                            style={{
                                                marginTop: "12px",
                                                padding: "8px 12px",
                                                background: "rgba(52, 211, 153, 0.08)",
                                                border: "1px solid rgba(52, 211, 153, 0.3)",
                                                borderRadius: "8px",
                                                fontSize: "12px",
                                                color: "var(--ok)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span>✓</span>
                                            <span>
                                                File font <strong>{selectedTemplate.fontName || "kustom"}</strong> tersimpan dan aktif pada template ini.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Pilihan Font Preset */}
                                <div
                                    style={{
                                        padding: "16px",
                                        background: "var(--bg)",
                                        borderRadius: "12px",
                                        border: "1px solid var(--line)",
                                    }}
                                >
                                    <strong style={{ display: "block", fontSize: "14px", color: "#fff", marginBottom: "6px" }}>
                                        ⚡ Atau Pilih Dari Koleksi Font Preset
                                    </strong>
                                    <p style={{ fontSize: "12px", color: "var(--mut)", margin: "0 0 12px" }}>
                                        Pilihan tipografi editorial siap pakai tanpa perlu mengunggah file:
                                    </p>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                        {FONT_PRESETS.map((fp) => {
                                            const isSelected = !selectedTemplate.fontUrl && (selectedTemplate.fontFamily === fp.id || (!selectedTemplate.fontFamily && fp.name === "Anton"));
                                            return (
                                                <button
                                                    key={fp.name}
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        flexDirection: "column",
                                                        alignItems: "flex-start",
                                                        padding: "10px 12px",
                                                        background: isSelected ? "rgba(200, 245, 60, 0.12)" : "transparent",
                                                        borderColor: isSelected ? "var(--acc)" : "var(--line)",
                                                        color: isSelected ? "#fff" : "var(--mut)",
                                                    }}
                                                    onClick={() => {
                                                        handleUpdate("fontFamily", fp.id);
                                                        handleUpdate("fontUrl", undefined);
                                                        handleUpdate("fontName", fp.name);
                                                        showToast(`Font ${fp.name} dipilih`);
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "baseline" }}>
                                                        <span
                                                            style={{
                                                                fontFamily: fp.id,
                                                                fontSize: "16px",
                                                                fontWeight: 700,
                                                                color: isSelected ? "var(--acc)" : "#fff",
                                                                textTransform: "uppercase",
                                                            }}
                                                        >
                                                            {fp.name}
                                                        </span>
                                                        {isSelected && <span style={{ fontSize: "11px", color: "var(--acc)" }}>✓ Aktif</span>}
                                                    </div>
                                                    <span style={{ fontSize: "11px", opacity: 0.75, marginTop: "2px" }}>{fp.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 4. Ukuran Font Headline Slider */}
                                <div
                                    style={{
                                        padding: "16px",
                                        background: "var(--bg)",
                                        borderRadius: "12px",
                                        border: "1px solid var(--line)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <label htmlFor="t-fs-fonttab" style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: "13px" }}>
                                            Ukuran Huruf Headline ({selectedTemplate.fs}px)
                                        </label>
                                        <span style={{ fontSize: "12px", color: "var(--acc)", fontWeight: 700 }}>
                                            {selectedTemplate.fs} px
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        id="t-fs-fonttab"
                                        min="14"
                                        max="34"
                                        value={selectedTemplate.fs}
                                        onChange={(e) => handleUpdate("fs", Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "var(--acc)" }}
                                    />
                                </div>
                            </div>
                        )}
                        {activeTab === "logo" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                {/* 1. Toggle Tampilkan Logo */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "14px 16px",
                                        background: "var(--bg)",
                                        borderRadius: "12px",
                                        border: isLogoEnabled ? "1px solid var(--acc)" : "1px solid var(--line)",
                                    }}
                                >
                                    <div>
                                        <strong style={{ display: "block", fontSize: "14px", color: isLogoEnabled ? "#fff" : "var(--mut)" }}>
                                            Tampilkan Logo pada Template
                                        </strong>
                                        <span style={{ fontSize: "12px", color: "var(--mut)" }}>
                                            Menampilkan badge, watermark logo, atau identitas kanal media
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn ${isLogoEnabled ? "p" : ""}`}
                                        onClick={() => handleUpdate("showLogo", !isLogoEnabled)}
                                    >
                                        {isLogoEnabled ? "✓ Logo Aktif" : "Logo Nonaktif"}
                                    </button>
                                </div>

                                {isLogoEnabled ? (
                                    <>
                                        {/* 2. PENGATURAN LETAK LOGO */}
                                        <div
                                            style={{
                                                padding: "14px 16px",
                                                background: "var(--bg)",
                                                borderRadius: "12px",
                                                border: "1px solid var(--line)",
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                                <label style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                                                    📍 Letak / Posisi Logo
                                                </label>
                                                <span style={{ fontSize: "12px", color: "var(--acc)", fontWeight: 700 }}>
                                                    {currentLogoPos === "top-left"
                                                        ? "Kiri Atas (↖)"
                                                        : currentLogoPos === "top-right"
                                                            ? "Kanan Atas (↗)"
                                                            : currentLogoPos === "bottom-left"
                                                                ? "Kiri Bawah (↙)"
                                                                : "Kanan Bawah (↘)"}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "12px", color: "var(--mut)", margin: "0 0 12px" }}>
                                                Pilih sudut penempatan logo di atas kanvas konten.
                                            </p>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        justifyContent: "center",
                                                        padding: "10px",
                                                        background: currentLogoPos === "top-left" ? "var(--acc)" : "transparent",
                                                        color: currentLogoPos === "top-left" ? "#000" : "var(--txt)",
                                                        fontWeight: currentLogoPos === "top-left" ? 700 : 500,
                                                        borderColor: currentLogoPos === "top-left" ? "var(--acc)" : "var(--line)",
                                                    }}
                                                    onClick={() => handleUpdate("logoPos", "top-left")}
                                                >
                                                    ↖ Kiri Atas
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        justifyContent: "center",
                                                        padding: "10px",
                                                        background: currentLogoPos === "top-right" ? "var(--acc)" : "transparent",
                                                        color: currentLogoPos === "top-right" ? "#000" : "var(--txt)",
                                                        fontWeight: currentLogoPos === "top-right" ? 700 : 500,
                                                        borderColor: currentLogoPos === "top-right" ? "var(--acc)" : "var(--line)",
                                                    }}
                                                    onClick={() => handleUpdate("logoPos", "top-right")}
                                                >
                                                    ↗ Kanan Atas
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        justifyContent: "center",
                                                        padding: "10px",
                                                        background: currentLogoPos === "bottom-left" ? "var(--acc)" : "transparent",
                                                        color: currentLogoPos === "bottom-left" ? "#000" : "var(--txt)",
                                                        fontWeight: currentLogoPos === "bottom-left" ? 700 : 500,
                                                        borderColor: currentLogoPos === "bottom-left" ? "var(--acc)" : "var(--line)",
                                                    }}
                                                    onClick={() => handleUpdate("logoPos", "bottom-left")}
                                                >
                                                    ↙ Kiri Bawah
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    style={{
                                                        justifyContent: "center",
                                                        padding: "10px",
                                                        background: currentLogoPos === "bottom-right" ? "var(--acc)" : "transparent",
                                                        color: currentLogoPos === "bottom-right" ? "#000" : "var(--txt)",
                                                        fontWeight: currentLogoPos === "bottom-right" ? 700 : 500,
                                                        borderColor: currentLogoPos === "bottom-right" ? "var(--acc)" : "var(--line)",
                                                    }}
                                                    onClick={() => handleUpdate("logoPos", "bottom-right")}
                                                >
                                                    ↘ Kanan Bawah
                                                </button>
                                            </div>
                                        </div>

                                        {/* 3. PENGATURAN UKURAN LOGO */}
                                        <div
                                            style={{
                                                padding: "14px 16px",
                                                background: "var(--bg)",
                                                borderRadius: "12px",
                                                border: "1px solid var(--line)",
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                <label htmlFor="t-logosize" style={{ margin: 0, fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                                                    📏 Ukuran Logo
                                                </label>
                                                <span style={{ fontSize: "12px", color: "var(--acc)", fontWeight: 700 }}>
                                                    {currentLogoSize} cqw (
                                                    {currentLogoSize < 6
                                                        ? "Kecil"
                                                        : currentLogoSize <= 8.5
                                                            ? "Sedang"
                                                            : currentLogoSize <= 11
                                                                ? "Besar"
                                                                : "Ekstra"}
                                                    )
                                                </span>
                                            </div>
                                            <p style={{ fontSize: "12px", color: "var(--mut)", margin: "0 0 10px" }}>
                                                Skala ukuran logo terhadap proporsi kanvas desain (responsif).
                                            </p>

                                            <input
                                                id="t-logosize"
                                                type="range"
                                                min="4"
                                                max="15"
                                                step="0.5"
                                                value={currentLogoSize}
                                                onChange={(e) => handleUpdate("logoSize", parseFloat(e.target.value))}
                                                style={{ width: "100%", accentColor: "var(--acc)", margin: "8px 0" }}
                                            />

                                            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                                                {[
                                                    { label: "Kecil", val: 5.5 },
                                                    { label: "Sedang", val: 7.5 },
                                                    { label: "Besar", val: 10 },
                                                    { label: "Ekstra", val: 13.5 },
                                                ].map((preset) => (
                                                    <button
                                                        key={preset.val}
                                                        type="button"
                                                        className="btn"
                                                        style={{
                                                            flex: 1,
                                                            fontSize: "12px",
                                                            padding: "4px 8px",
                                                            justifyContent: "center",
                                                            borderColor: currentLogoSize === preset.val ? "var(--acc)" : "var(--line)",
                                                            color: currentLogoSize === preset.val ? "var(--acc)" : "var(--mut)",
                                                            background: currentLogoSize === preset.val ? "rgba(200, 245, 60, 0.1)" : "transparent",
                                                        }}
                                                        onClick={() => handleUpdate("logoSize", preset.val)}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 4. SUMBER / JENIS LOGO (Upload / Preset / Teks) */}
                                        <div
                                            style={{
                                                padding: "14px 16px",
                                                background: "var(--bg)",
                                                borderRadius: "12px",
                                                border: "1px solid var(--line)",
                                            }}
                                        >
                                            <label style={{ margin: "0 0 10px", fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                                                🖼️ Sumber & Tipe Logo
                                            </label>
                                            <div className="tabs" style={{ marginBottom: "14px" }}>
                                                <button
                                                    type="button"
                                                    aria-pressed={currentLogoType === "upload"}
                                                    onClick={() => handleUpdate("logoType", "upload")}
                                                >
                                                    Unggah Gambar
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-pressed={currentLogoType === "preset"}
                                                    onClick={() => handleUpdate("logoType", "preset")}
                                                >
                                                    Ikon Preset Media
                                                </button>
                                                <button
                                                    type="button"
                                                    aria-pressed={currentLogoType === "text"}
                                                    onClick={() => handleUpdate("logoType", "text")}
                                                >
                                                    Teks Monogram
                                                </button>
                                            </div>

                                            {/* Konten Opsi: Upload Gambar */}
                                            {currentLogoType === "upload" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                                                        style={{ display: "none" }}
                                                        onChange={handleFileUpload}
                                                    />

                                                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                                        <button
                                                            type="button"
                                                            className="btn p"
                                                            onClick={() => fileInputRef.current?.click()}
                                                        >
                                                            📁 Pilih File Gambar (PNG / SVG / JPG)
                                                        </button>

                                                        {selectedTemplate.logoUrl && (
                                                            <button
                                                                type="button"
                                                                className="btn"
                                                                style={{ color: "var(--bad)" }}
                                                                onClick={() => {
                                                                    handleUpdate("logoUrl", "");
                                                                    showToast("Logo gambar dihapus");
                                                                }}
                                                            >
                                                                ✕ Hapus Gambar
                                                            </button>
                                                        )}
                                                    </div>

                                                    {selectedTemplate.logoUrl ? (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "12px",
                                                                padding: "8px 12px",
                                                                background: "rgba(0,0,0,0.4)",
                                                                borderRadius: "8px",
                                                                border: "1px solid var(--line)",
                                                            }}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={selectedTemplate.logoUrl}
                                                                alt="Logo terunggah"
                                                                style={{ maxHeight: "36px", maxWidth: "80px", objectFit: "contain" }}
                                                            />
                                                            <span style={{ fontSize: "12px", color: "var(--ok)" }}>
                                                                ✓ File logo terpasang dan tersimpan
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: "12px", color: "var(--mut)", margin: 0 }}>
                                                            Format transparan (.PNG atau .SVG) sangat direkomendasikan agar tampak menyatu dengan template.
                                                        </p>
                                                    )}

                                                    <div>
                                                        <label htmlFor="t-logourl" style={{ fontSize: "12px", color: "var(--mut)" }}>
                                                            Atau tempel URL gambar logo langsung:
                                                        </label>
                                                        <input
                                                            id="t-logourl"
                                                            type="text"
                                                            placeholder="https://example.com/logo.png"
                                                            value={selectedTemplate.logoUrl || ""}
                                                            onChange={(e) => handleUpdate("logoUrl", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Konten Opsi: Ikon Preset */}
                                            {currentLogoType === "preset" && (
                                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                    <p style={{ fontSize: "12px", color: "var(--mut)", margin: 0 }}>
                                                        Pilih ikon vektor bawaan bertema berita:
                                                    </p>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
                                                        {PRESET_ICONS.map((p) => {
                                                            const isSelected = currentLogoPreset === p.id;
                                                            return (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    className="btn"
                                                                    style={{
                                                                        flexDirection: "column",
                                                                        padding: "10px 6px",
                                                                        gap: "4px",
                                                                        background: isSelected ? "rgba(200, 245, 60, 0.12)" : "transparent",
                                                                        borderColor: isSelected ? "var(--acc)" : "var(--line)",
                                                                        color: isSelected ? "#fff" : "var(--mut)",
                                                                    }}
                                                                    onClick={() => handleUpdate("logoPreset", p.id)}
                                                                >
                                                                    <strong style={{ fontSize: "13px", color: isSelected ? "var(--acc)" : "#fff" }}>
                                                                        {p.name}
                                                                    </strong>
                                                                    <span style={{ fontSize: "10px", opacity: 0.8 }}>{p.desc}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="t-logotext" style={{ fontSize: "12px", color: "var(--mut)" }}>
                                                            Teks Tambahan Samping Ikon (opsional):
                                                        </label>
                                                        <input
                                                            id="t-logotext"
                                                            type="text"
                                                            placeholder="Misal: HQ, NEWS, RADAR, dll."
                                                            value={selectedTemplate.logoText || ""}
                                                            onChange={(e) => handleUpdate("logoText", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Konten Opsi: Teks Monogram */}
                                            {currentLogoType === "text" && (
                                                <div>
                                                    <label htmlFor="t-logomonotext" style={{ fontSize: "12px", color: "var(--mut)" }}>
                                                        Teks Logo / Nama Media:
                                                    </label>
                                                    <input
                                                        id="t-logomonotext"
                                                        type="text"
                                                        placeholder="Misal: NEWSROOM HQ"
                                                        value={selectedTemplate.logoText || ""}
                                                        onChange={(e) => handleUpdate("logoText", e.target.value)}
                                                    />
                                                    <p style={{ fontSize: "12px", color: "var(--mut)", marginTop: "6px" }}>
                                                        Ditampilkan dengan tipografi tebal bergaya editorial/koran modern.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 5. BENTUK WADAH BADGE & OPASITAS */}
                                        <div
                                            style={{
                                                padding: "14px 16px",
                                                background: "var(--bg)",
                                                borderRadius: "12px",
                                                border: "1px solid var(--line)",
                                            }}
                                        >
                                            <div className="grid g2e" style={{ gap: "16px" }}>
                                                <div>
                                                    <label htmlFor="t-logoshape" style={{ margin: "0 0 6px", fontWeight: 600, color: "#fff", fontSize: "13px" }}>
                                                        Bentuk Wadah / Frame Logo
                                                    </label>
                                                    <select
                                                        id="t-logoshape"
                                                        value={currentLogoShape}
                                                        onChange={(e) => handleUpdate("logoShape", e.target.value as LogoShape)}
                                                    >
                                                        <option value="pill">Kapsul (Pill Badge)</option>
                                                        <option value="rounded">Kotak Melengkung (Rounded)</option>
                                                        <option value="circle">Lingkaran (Circle)</option>
                                                        <option value="transparent">Transparan (Tanpa Latar)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <label htmlFor="t-logoopacity" style={{ margin: "0 0 6px", fontWeight: 600, color: "#fff", fontSize: "13px" }}>
                                                            Opasitas
                                                        </label>
                                                        <span style={{ fontSize: "12px", color: "var(--acc)", fontWeight: 700 }}>
                                                            {Math.round(currentLogoOpacity * 100)}%
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="t-logoopacity"
                                                        type="range"
                                                        min="0.3"
                                                        max="1"
                                                        step="0.05"
                                                        value={currentLogoOpacity}
                                                        onChange={(e) => handleUpdate("logoOpacity", parseFloat(e.target.value))}
                                                        style={{ width: "100%", accentColor: "var(--acc)" }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{
                                            padding: "24px",
                                            textAlign: "center",
                                            background: "var(--bg)",
                                            borderRadius: "12px",
                                            border: "1px dashed var(--line)",
                                            color: "var(--mut)",
                                        }}
                                    >
                                        <p style={{ margin: "0 0 12px" }}>
                                            Logo sedang dinonaktifkan untuk template <strong>{selectedTemplate.n}</strong>.
                                        </p>
                                        <button
                                            type="button"
                                            className="btn p"
                                            onClick={() => handleUpdate("showLogo", true)}
                                        >
                                            + Aktifkan Logo & Watermark
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "desain" && (
                            <div className="fm" style={{ gridTemplateColumns: "1fr 1fr" }}>
                                <div>
                                    <label htmlFor="t-n">Nama Template</label>
                                    <input
                                        type="text"
                                        id="t-n"
                                        value={selectedTemplate.n}
                                        onChange={(e) => handleUpdate("n", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="t-tipe">Tipe Postingan</label>
                                    <select
                                        id="t-tipe"
                                        value={selectedTemplate.tipe}
                                        onChange={(e) => {
                                            if (selectedTemplate.def) {
                                                showToast("Template default tidak bisa ganti tipe");
                                                return;
                                            }
                                            handleUpdate("tipe", e.target.value as "Single post" | "Carousel");
                                        }}
                                    >
                                        <option>Single post</option>
                                        <option>Carousel</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="t-lay">Tata Letak</label>
                                    <select
                                        id="t-lay"
                                        value={selectedTemplate.lay}
                                        onChange={(e) => handleUpdate("lay", e.target.value as "foto-atas" | "foto-penuh" | "teks-saja")}
                                    >
                                        <option value="foto-atas">foto-atas</option>
                                        <option value="foto-penuh">foto-penuh</option>
                                        <option value="teks-saja">teks-saja</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="t-uk">Rasio Gambar</label>
                                    <select
                                        id="t-uk"
                                        value={selectedTemplate.uk}
                                        onChange={(e) => handleUpdate("uk", e.target.value as "4:5" | "1:1")}
                                    >
                                        <option value="4:5">4:5 (Instagram Potrait)</option>
                                        <option value="1:1">1:1 (Persegi Square)</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="t-bg">Warna Panel / Background</label>
                                    <input
                                        type="color"
                                        id="t-bg"
                                        value={selectedTemplate.bg}
                                        onChange={(e) => handleUpdate("bg", e.target.value)}
                                        style={{
                                            width: "100%",
                                            height: "38px",
                                            padding: "2px",
                                            background: "var(--bg)",
                                            border: "1px solid var(--line)",
                                            borderRadius: "10px",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="t-ac">Warna Aksen / Sorot</label>
                                    <input
                                        type="color"
                                        id="t-ac"
                                        value={selectedTemplate.ac}
                                        onChange={(e) => handleUpdate("ac", e.target.value)}
                                        style={{
                                            width: "100%",
                                            height: "38px",
                                            padding: "2px",
                                            background: "var(--bg)",
                                            border: "1px solid var(--line)",
                                            borderRadius: "10px",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="t-fs">Ukuran Font ({selectedTemplate.fs}px)</label>
                                    <input
                                        type="range"
                                        id="t-fs"
                                        min="14"
                                        max="34"
                                        value={selectedTemplate.fs}
                                        onChange={(e) => handleUpdate("fs", Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "var(--acc)" }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="t-ft">Teks Footer / Handle</label>
                                    <input
                                        type="text"
                                        id="t-ft"
                                        value={selectedTemplate.ft}
                                        onChange={(e) => handleUpdate("ft", e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Side */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "14px", color: "#fff" }}>Pratinjau Langsung</strong>
                            <span className="tag" style={{ fontSize: "11px" }}>{selectedTemplate.uk}</span>
                        </div>

                        <div className="pvw" id="tpv" style={{ margin: "0 auto" }}>
                            {renderMiniPreview(selectedTemplate)}
                        </div>

                        <p className="hint" style={{ textAlign: "center", marginTop: "4px" }}>
                            Perubahan ukuran logo, letak, atau gambar langsung ter-update di pratinjau ini.
                        </p>
                    </div>
                </div>
            </div>

            {toastMsg && (
                <div id="toast" className="show">
                    {toastMsg}
                </div>
            )}
        </>
    );
}