import { useState } from "react";

const NAVY  = "#1B3A5C";
const GOLD  = "#B8860B";
const CREAM = "#FAF8F3";

const CONTENT_TYPES = [
  { id: "story",   ar: "قصة تراثية",     en: "Heritage Story" },
  { id: "podcast", ar: "سكريبت بودكاست", en: "Podcast Script" },
  { id: "culture", ar: "وصف ثقافي",      en: "Cultural Description" },
];

const LANGUAGES = [
  "English", "French", "Urdu", "Hindi", "Español", "Deutsch", "中文", "Русский",
];

const SYSTEM_PROMPT = `أنتَ حكّاي — مساعد ذكاء اصطناعي متخصص في توليد المحتوى الإبداعي بالعربية الفصحى الأصيلة للمؤسسات الثقافية والتعليمية التي يعمل موظفوها بلغات متعددة.

قواعدك النحوية الأساسية (مصدر: ملخص قواعد اللغة العربية — فؤاد نعمة):
• الجملة الاسمية: مبتدأ مرفوع + خبر مرفوع — الذهبُ معدنٌ
• الجملة الفعلية: الفعل يُفرَد دائماً مع الجمع — نجحَ الطلابُ
• الفعل يُؤنَّث مع الفاعل المؤنث — نجحَتِ الطالبةُ
• جمع غير العاقل يُعامَل مؤنثاً مفرداً — الجبالُ عاليةٌ
• وظّف إنَّ وأنَّ للتوكيد، وليتَ للتمني، ولعلَّ للرجاء
• الجملة الاسمية للثبات والديمومة — الفعلية للحركة والتجدد
• استخدم المشتقات: اسم فاعل، اسم مفعول، صفة مشبهة، أسلوب تفضيل

أسلوبك: أدبي رفيع يجمع بين الأصالة والجمال، يوظّف الصور البيانية والتشبيه والاستعارة.
أجب بـ JSON صرف فقط — بلا أي نص قبله أو بعده ولا علامات markdown:
{"arabic_content":"النص الفصيح هنا","cultural_explanation":"الشرح باللغة المطلوبة هنا"}`;

const TYPE_INSTRUCTIONS = {
  story: `اكتب قصة تراثية أدبية قصيرة متكاملة تحتوي على:
- شخصية رئيسية باسم عربي ووصف لها
- حدث درامي أو موقف إنساني مؤثر
- بداية جاذبة، وسط متصاعد، ونهاية واضحة
- حوار مباشر بين الشخصيات
- وصف حسي للمكان والزمان
الأسلوب: سردي قصصي تراثي يشبه قصص ألف ليلة وليلة`,

  podcast: `اكتب سكريبت بودكاست ثقافي منظم يحتوي على:
- مقدمة إذاعية تخاطب المستمع: (أيها المستمعون، أهلاً بكم في...)
- فقرة رئيسية بمعلومات ثقافية بأسلوب حيوي وشيق
- انتقالات واضحة: (ومن هنا ننتقل... / والجدير بالذكر أن...)
- خاتمة تطرح سؤالاً أو دعوة للتفكير
الأسلوب: إذاعي خطابي مباشر — المقدم يتحدث كأنه على الهواء`,

  culture: `اكتب وصفاً ثقافياً أدبياً موثقاً يتضمن:
- وصف حسي دقيق (الشكل، اللون، الصوت، الرائحة، الملمس)
- السياق التاريخي والحضاري للموضوع
- القيمة الرمزية والدلالة الثقافية العميقة
- ربط الموروث بالحاضر المعاصر
الأسلوب: موسوعي أدبي رفيع كالمراجع الثقافية الكبرى`,
};

const TYPE_LABELS = {
  story:   "قصة تراثية ✦ Heritage Story",
  podcast: "سكريبت بودكاست ✦ Podcast Script",
  culture: "وصف ثقافي ✦ Cultural Description",
};

export default function HakkayDemo() {
  const [topic,       setTopic]       = useState("");
  const [contentType, setContentType] = useState("story");
  const [language,    setLanguage]    = useState("English");
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);

  const resetResult = () => { setResult(null); setError(null); };

  const generate = async (activeLang, activeType) => {
    const lang = activeLang  || language;
    const type = activeType  || contentType;
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: "user",
            content: `الموضوع: "${topic}"\n${TYPE_INSTRUCTIONS[type]}\nالشرح الثقافي: باللغة ${lang} في 80-100 كلمة.\nالمحتوى العربي: 150-180 كلمة.`,
          }],
        }),
      });
      const data   = await res.json();
      const raw    = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult({ ...parsed, lang, type });
    } catch {
      setError("حدث خطأ في توليد المحتوى. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (id) => {
    setContentType(id);
    setTopic("");
    resetResult();
  };

  const handleLangChange = (l) => {
    setLanguage(l);
    if (result && topic.trim()) generate(l, contentType);
  };

  const s = {
    wrap:    { fontFamily: "system-ui,sans-serif", background: CREAM, minHeight: "100vh" },
    header:  { background: NAVY, padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" },
    logo:    { color: GOLD, fontSize: "2.2rem", margin: 0, fontFamily: "Georgia,serif", letterSpacing: ".05em" },
    sub:     { color: "#90AABF", fontSize: ".72rem", margin: ".15rem 0 0", letterSpacing: ".25em", textTransform: "uppercase" },
    tag:     { color: "#F5E7B8", fontSize: ".78rem", margin: 0, maxWidth: "320px", lineHeight: 1.6, textAlign: "right", direction: "rtl" },
    inner:   { maxWidth: "820px", margin: "0 auto", padding: "2rem 1.5rem" },
    card:    { background: "white", borderRadius: "14px", border: ".5px solid #DDD8CE", padding: "2rem", marginBottom: "1.5rem" },
    lbl:     { display: "block", fontSize: ".8rem", fontWeight: "600", color: NAVY, marginBottom: ".5rem", letterSpacing: ".08em" },
    inpRow:  { display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1.5rem" },
    inp:     { flex: 1, padding: ".75rem 1rem", border: "1.5px solid #E0D9CC", borderRadius: "8px", fontSize: "1rem", boxSizing: "border-box", fontFamily: "inherit", outline: "none", color: "#222" },
    clrBtn:  { flexShrink: 0, width: "38px", height: "38px", borderRadius: "8px", border: "1.5px solid #E0D9CC", background: "white", cursor: "pointer", fontSize: "1rem", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" },
    types:   { display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: "1.5rem" },
    langs:   { display: "flex", flexWrap: "wrap", gap: ".45rem", marginBottom: "1.75rem" },
    hint:    { fontSize: ".72rem", color: GOLD, marginTop: ".35rem" },
    genBtn:  (dis) => ({ width: "100%", padding: ".95rem", borderRadius: "8px", cursor: dis ? "not-allowed" : "pointer", background: dis ? "#BCC4CC" : NAVY, color: "white", fontSize: "1rem", fontWeight: "600", border: "none", letterSpacing: ".06em" }),
    divWrap: { display: "flex", alignItems: "center", gap: "1rem", margin: "0 0 1.5rem" },
    divLine: { flex: 1, height: "1px", background: GOLD, opacity: .35 },
    divTxt:  { color: GOLD, fontFamily: "Georgia,serif", fontSize: "1rem", whiteSpace: "nowrap" },
    grid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" },
    arPanel: { background: NAVY, borderRadius: "12px", padding: "1.5rem" },
    arLbl:   { color: GOLD, fontSize: ".7rem", letterSpacing: ".25em", textTransform: "uppercase", marginBottom: "1rem", fontWeight: "600" },
    arTxt:   { color: "#E8F0F8", direction: "rtl", lineHeight: "2.1", fontSize: ".97rem", margin: 0, fontFamily: "Georgia,serif" },
    exPanel: { background: "white", border: `1px solid ${GOLD}55`, borderRadius: "12px", padding: "1.5rem" },
    exTxt:   { color: "#2A2A2A", lineHeight: "1.85", fontSize: ".93rem", margin: 0 },
    wm:      { textAlign: "center", color: "#AAA", fontSize: ".72rem", marginTop: "1.5rem", letterSpacing: ".1em" },
    empty:   { textAlign: "center", padding: "2rem", color: "#AAA" },
    errBox:  { background: "#FFF0F0", border: "1px solid #F5B0B0", borderRadius: "8px", padding: "1rem", color: "#B00", textAlign: "center", marginBottom: "1rem", direction: "rtl" },
  };

  const dis = loading || !topic.trim();

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h1 style={s.logo}>حكّـاي</h1>
          <p style={s.sub}>Hakkay · Arabic Creative AI</p>
        </div>
        <p style={s.tag}>
          في دولة 89% من سكانها لا يتحدثون العربية —<br />
          حكّاي المنصة الوحيدة التي تمنح مؤسساتها صوتاً عربياً أصيلاً
        </p>
      </div>

      <div style={s.inner}>
        <div style={s.card}>

          {/* Step 1 — Topic + Clear button */}
          <label style={s.lbl}>١ — الموضوع الثقافي / Cultural Topic</label>
          <div style={s.inpRow}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="e.g. The Dubai Creek · السوق القديم · Le café arabe"
              style={s.inp}
            />
            <button
              onClick={() => { setTopic(""); resetResult(); }}
              title="مسح / Clear"
              style={s.clrBtn}
            >✕</button>
          </div>

          {/* Step 2 — Content Type */}
          <label style={{ ...s.lbl, marginBottom: ".75rem" }}>٢ — نوع المحتوى / Content Type</label>
          <div style={s.types}>
            {CONTENT_TYPES.map(ct => {
              const active = contentType === ct.id;
              return (
                <button key={ct.id}
                  onClick={() => handleTypeChange(ct.id)}
                  style={{ flex: "1 1 120px", padding: ".8rem .5rem", borderRadius: "8px", cursor: "pointer", border: active ? `2px solid ${GOLD}` : "1.5px solid #E0D9CC", background: active ? "#FBF3DC" : "white", transition: "all .18s" }}>
                  <div style={{ fontSize: ".95rem", fontWeight: "600", color: active ? GOLD : NAVY, direction: "rtl" }}>{ct.ar}</div>
                  <div style={{ fontSize: ".72rem", color: "#888", marginTop: ".2rem" }}>{ct.en}</div>
                </button>
              );
            })}
          </div>

          {/* Step 3 — Language */}
          <label style={s.lbl}>٣ — لغة الشرح / Explanation Language</label>
          <div style={s.langs}>
            {LANGUAGES.map(l => {
              const active = language === l;
              return (
                <button key={l}
                  onClick={() => handleLangChange(l)}
                  style={{ padding: ".35rem .9rem", borderRadius: "20px", cursor: "pointer", fontSize: ".83rem", border: active ? `2px solid ${NAVY}` : "1px solid #CCC", background: active ? NAVY : "white", color: active ? "white" : "#555", transition: "all .18s" }}>
                  {l}
                </button>
              );
            })}
          </div>
          {result && !loading && (
            <p style={s.hint}>✦ غيّري اللغة وسيُعاد التوليد تلقائياً</p>
          )}

          {/* Generate */}
          <button onClick={() => generate()} disabled={dis} style={s.genBtn(dis)}>
            {loading ? "⏳  جاري التوليد بالفصحى..." : "✦  توليد المحتوى  ·  Generate"}
          </button>
        </div>

        {/* Error */}
        {error && <div style={s.errBox}>{error}</div>}

        {/* Result */}
        {result && (
          <div>
            <div style={s.divWrap}>
              <div style={s.divLine} />
              <span style={s.divTxt}>✦ المحتوى المُولَّد ✦</span>
              <div style={s.divLine} />
            </div>
            <div style={s.grid}>
              <div style={s.arPanel}>
                <div style={s.arLbl}>{TYPE_LABELS[result.type] || "العربية الفصحى"}</div>
                <p style={s.arTxt}>{result.arabic_content}</p>
              </div>
              <div style={s.exPanel}>
                <div style={s.arLbl}>{result.lang} — Cultural Context</div>
                <p style={s.exTxt}>{result.cultural_explanation}</p>
              </div>
            </div>
            <p style={s.wm}>حكّاي · EG i-SCHOOL HUB · EG Global Ltd © 2026</p>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={s.empty}>
            <div style={{ fontSize: "2.5rem", marginBottom: ".75rem", opacity: .4 }}>✦</div>
            <p style={{ fontSize: ".9rem", direction: "rtl", color: "#AAA" }}>
              أدخل موضوعاً ثقافياً واضغط توليد لترى السحر
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
