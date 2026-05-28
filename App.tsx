import { useState, useEffect, useRef } from 'react';

// --- 1. TYPESCRIPT INTERFACES ---
interface Product {
  id: number;
  name: string;
  price: string;
  desc: string;
  cat: string;
}

interface GeminiResponse {
  reason: string;
  matched_ids: number[];
}

// --- 2. LOCAL DATABASE ---
const localDatabase: Product[] = [
  { id: 1, name: "Mechanical RGB Keyboard", price: "89", desc: "Ergonomic mechanical keyboard for coding and gaming. Features tactile clicky switches, making it perfect for developers who type all day.", cat: "tech" },
  { id: 2, name: "Waterproof Minimalist Backpack", price: "49", desc: "Fully waterproof minimalist backpack with a dedicated laptop sleeve. Protects electronics on rainy days, ideal for travel and hiking.", cat: "lifestyle" },
  { id: 3, name: "Smart Fitness Watch", price: "119", desc: "Smartwatch for health monitoring. Tracks heart rate, analyzes sleep quality, and has custom sports modes for an active lifestyle.", cat: "tech" },
  { id: 4, name: "Active Noise-Cancelling Headphones", price: "199", desc: "Headphones featuring advanced hybrid ANC. Blocks out background office noise or traffic sounds, perfect for deep work and concentration.", cat: "tech" },
  { id: 5, name: "Ergonomic Memory Foam Cushion", price: "35", desc: "Ergonomic anatomical seat cushion. Corrects posture, relieves lower back pain, and reduces pressure during long hours of sitting.", cat: "lifestyle" },
  { id: 6, name: "Double-Walled Thermal Mug", price: "25", desc: "Premium stainless steel insulated flask. Keeps coffee or tea piping hot for 12 hours. The ultimate workstation accessory.", cat: "lifestyle" },
  { id: 7, name: "Compact High-Capacity Power Bank", price: "39", desc: "Compact external battery pack (20,000 mAh) with power delivery. Perfect for keeping phones, tablets, and laptops alive while traveling.", cat: "tech" },
  { id: 8, name: "Authentic Japanese Matcha Tea Set", price: "45", desc: "Traditional matcha kit for clean energy rituals. Provides steady, jitter-free focus and sustained energy without the crash of regular coffee.", cat: "lifestyle" }
];

export default function App() {
  // --- 3. STATE MANAGEMENT ---
  const [apiKey, setApiKey] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [status, setStatus] = useState<string>('System status: Ready.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  const [aiReason, setAiReason] = useState<string>('');
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);

  // Image & Voice States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('image.png');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // --- 4. LIFECYCLE & SPEECH INITIALIZATION ---
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_hackathon_key');
    if (savedKey) {
      setApiKey(savedKey);
      setStatus("Saved API Key loaded. Ready.");
    }

    // Web Speech API Initialization
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US'; 

      rec.onstart = () => {
        setIsListening(true);
        setStatus("🎙️ Microphone active. Speak now...");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setStatus("Voice captured successfully!");
      };

      rec.onerror = (e: any) => {
        console.error(e);
        setStatus("Speech recognition error or permission denied.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // --- 5. HANDLERS ---
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setApiKey(val);
    localStorage.setItem('gemini_hackathon_key', val);
    setStatus("API Key updated.");
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name);
      setImageMimeType(file.type);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setImageBase64(base64);
          setStatus("Image attached successfully.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageBase64(null);
    setImageMimeType('');
  };

  const toggleVoiceListen = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setQuery("");
      recognitionRef.current.start();
    }
  };

  // ჰენდლერი პროაქტიული "Surprise Me" ფუნქციისთვის
  const triggerAiSurprise = () => {
    const surprisePrompt = "Surprise me! Pick a highly creative combo of 2 items from the catalog that would dramatically improve my workspace workflow or wellness today, and explain your premium curations.";
    setQuery(surprisePrompt);
    
    // მცირე ტაიმაუტი, რომ იუზერმა დაინახოს ტექსტის შევსება და ძიება მყისიერად დაიწყოს
    setTimeout(() => {
      const submitBtn = document.getElementById('search-submit-btn');
      if (submitBtn) (submitBtn as HTMLButtonElement).click();
    }, 150);
  };

  const executionSearch = async () => {
    if (!query.trim() && !imageBase64) return;
    if (!apiKey) {
      alert('Please enter your Gemini API Key in the top panel!');
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setStatus("Gemini AI is computing multimodal token intent...");

    try {
      const systemInstruction = `You are an advanced AI Search Concierge for an e-commerce website.
      The user input comes from a single smart omni-bar (typed, spoken, or triggered via the proactive concierge slot).
      
      They can express themselves in three formats:
      1. Direct product intent (e.g., "I need a keyboard", "watch").
      2. Mood, vibe, physical state, or open-ended problems (e.g., "I am so tired today", "My back hurts from working").
      3. Proactive surprise request (e.g., "Surprise me! Pick a highly creative combo...").

      Your job is to read their input (and look at the image if provided) and map their current vibe, mood, surprise request, or explicit product need to our catalog.
      
      Store catalog: ${JSON.stringify(localDatabase)}
      User query: "${query}"
      
      Your response must be a valid, parseable JSON block inside curly braces, with absolutely no markdown wrapping, no \`\`\`json, and no extra text outside the JSON object:
      {
          "reason": "Explain to the user in an intelligent, premium concierge tone how these specific items match their query, current mood, or why you curated this exact surprise combination for them.",
          "matched_ids": [1, 4]
      }`;

      const parts: any[] = [{ text: systemInstruction }];

      if (imageBase64) {
        const cleanBase64 = imageBase64.split(',')[1];
        parts.push({
          inlineData: {
            mimeType: imageMimeType || "image/png",
            data: cleanBase64
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API Error");

      let rawText = data.candidates[0].content.parts[0].text.trim();
      
      if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim();
      }

      const result: GeminiResponse = JSON.parse(rawText);
      setAiReason(result.reason);
      
      const filtered = localDatabase.filter(p => result.matched_ids.includes(p.id));
      setMatchedProducts(filtered);

      setIsLoading(false);
      setShowResults(true);
      setStatus("Multimodal search completed.");
    } catch (error) {
      console.error(error);
      alert('An error occurred! Please check your API Key and connection.');
      setIsLoading(false);
      setStatus("Error encountered during AI computation.");
    }
  };

  // --- 6. INLINE CSS STYLES ---
  const styles = {
    container: {
      backgroundColor: '#020617',
      color: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      paddingTop: '3rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    wrapper: {
      width: '100%',
      maxWidth: '48rem',
    },
    sandboxPanel: {
      width: '100%',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#0f172a',
      borderRadius: '1rem',
      border: '1px solid #334155',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    evaluationText: {
      fontSize: '0.875rem',
      color: '#94a3b8',
    },
    apiKeyInput: {
      backgroundColor: '#020617',
      border: '1px solid #334155',
      borderRadius: '0.75rem',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      width: '100%',
      maxWidth: '20rem',
      textAlign: 'center' as const,
      color: '#e2e8f0',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      background: 'linear-gradient(to right, #fbbf24, #f97316, #fef08a)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      maxWidth: '32rem',
      margin: '0 auto',
    },
    interactionZone: {
      backgroundColor: '#0f172a',
      borderRadius: '1rem',
      border: '1px solid #475569',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    },
    searchBarContainer: {
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      justifyContent: 'space-between',
      gap: '1rem',
    },
    inputWrapper: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
    },
    mainInput: {
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '1.125rem',
      color: '#ffffff',
      outline: 'none',
    },
    actionButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    textButton: {
      backgroundColor: '#1e293b',
      border: '1px solid #334155',
      color: '#cbd5e1',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      transition: 'all 0.2s ease',
    },
    submitButton: {
      background: 'linear-gradient(to right, #f59e0b, #ea580c)',
      border: 'none',
      color: '#020617',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s ease',
    },
    proactiveSlot: {
      backgroundColor: '#090d16',
      padding: '0.5rem 1rem',
      borderTop: '1px solid #1e293b',
      display: 'flex',
      justifyContent: 'center',
    },
    proactiveBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#94a3b8',
      fontSize: '0.75rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      transition: 'all 0.2s ease',
    },
    imagePreviewArea: {
      padding: '0px 1rem 1rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: 'rgba(2, 6, 23, 0.3)',
    },
    imageContainer: {
      position: 'relative' as const,
      width: '3.5rem',
      height: '3.5rem',
      backgroundColor: '#1e293b',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: '1px solid #475569',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    removeImageBtn: {
      position: 'absolute' as const,
      top: '2px',
      right: '2px',
      backgroundColor: '#e11d48',
      color: 'white',
      border: 'none',
      width: '1.25rem',
      height: '1.25rem',
      borderRadius: '50%',
      fontSize: '10px',
      cursor: 'pointer',
    },
    metaBar: {
      padding: '0.625rem 1rem',
      backgroundColor: '#020617',
      fontSize: '0.75rem',
      color: '#94a3b8',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #334155',
      borderBottomLeftRadius: '1rem',
      borderBottomRightRadius: '1rem',
      borderLeft: '1px solid #334155',
      borderRight: '1px solid #334155',
      borderBottom: '1px solid #334155',
    },
    badge: {
      backgroundColor: '#1e293b',
      padding: '0.125rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '10px',
      color: '#cbd5e1',
      fontFamily: 'monospace',
      marginRight: '0.5rem',
    },
    loaderZone: {
      marginTop: '2rem',
      textAlign: 'center' as const,
      padding: '2rem',
      backgroundColor: 'rgba(15, 23, 42, 0.3)',
      borderRadius: '1rem',
      border: '1px dashed #334155',
    },
    resultsWrapper: {
      marginTop: '2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    reasoningCard: {
      background: 'linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), #0f172a, #0f172a)',
      border: '1px solid rgba(245, 158, 11, 0.2)',
      borderRadius: '1rem',
      padding: '1.25rem',
    },
    gridHeader: {
      marginBottom: '1rem',
    },
    gridTitle: {
      fontSize: '0.875rem',
      fontWeight: 'bold',
      color: '#94a3b8',
      textTransform: 'uppercase' as const,
      margin: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem',
    },
    productCard: {
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    productHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.625rem',
    },
    productName: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      margin: 0,
    },
    productPrice: {
      color: '#fbbf24',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      padding: '0.125rem 0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
    },
    productDesc: {
      color: '#94a3b8',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      margin: '0 0 1.25rem 0',
    },
    addToCartBtn: {
      width: '100%',
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      border: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
      padding: '0.625rem 1rem',
      borderRadius: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulse-glow { animation: pulseGlow 1.5s ease-in-out infinite; }
        .product-card-stagger { opacity: 0; animation: cardFadeIn 0.4s ease-out forwards; }
        .product-card-stagger:nth-child(1) { animation-delay: 0.05s; }
        .product-card-stagger:nth-child(2) { animation-delay: 0.15s; }
        .product-card-stagger:nth-child(3) { animation-delay: 0.25s; }
        .product-card-stagger:nth-child(4) { animation-delay: 0.35s; }

        button:hover { transform: translateY(-1px); filter: brightness(1.1); }
        button:active { transform: translateY(0) scale(0.98); }
        .input-glow:focus { border-color: #fbbf24 !important; box-shadow: 0 0 8px rgba(251, 191, 36, 0.2); }

        .proactive-hover:hover {
          color: #fbbf24 !important;
          text-decoration: underline;
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardFadeIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulseGlow { 0%, 100% { opacity: 0.7; border-color: #334155; } 50% { opacity: 1; border-color: #fbbf24; box-shadow: 0 0 12px rgba(251, 191, 36, 0.1); } }
        @keyframes pulseRecord { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
        .animate-recording { animation: pulseRecord 1.2s infinite ease-in-out; }
      `}</style>

      <div style={styles.wrapper}>
        
        {/* Sandbox Panel */}
        <div style={styles.sandboxPanel}>
          <div style={styles.evaluationText}>
            🔑 <strong>Jury Evaluation:</strong> Enter Gemini API Key
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={handleKeyChange}
            placeholder="Paste Gemini API Key..."
            className="input-glow"
            style={styles.apiKeyInput}
          />
        </div>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>The AI Concierge Bar</h1>
          <p style={styles.subtitle}>
            A search bar that listens, sees, and guides. Powered by Gemini Multimodal Vision.
          </p>
        </div>

        {/* Interaction Zone */}
        <div style={styles.interactionZone}>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
          />

          <div style={styles.searchBarContainer}>
            <div style={styles.inputWrapper}>
              <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executionSearch()}
                placeholder={isListening ? "Listening to your voice..." : "Type a product name, a problem, or how you feel right now..."}
                style={styles.mainInput}
              />
            </div>

            <div style={styles.actionButtons}>
              <button onClick={handlePhotoClick} style={styles.textButton} title="Upload Image">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                {imageBase64 ? "Attached" : "Image"}
              </button>
              
              <button 
                onClick={toggleVoiceListen} 
                style={{
                  ...styles.textButton, 
                  backgroundColor: isListening ? '#f43f5e' : '#1e293b',
                  borderColor: isListening ? '#f43f5e' : '#334155',
                  color: isListening ? '#ffffff' : '#cbd5e1'
                }} 
                title="Voice Search"
              >
                {isListening ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="animate-recording">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                )}
                {isListening ? "Listening" : "Mic"}
              </button>
              
              <button id="search-submit-btn" onClick={executionSearch} style={styles.submitButton} title="Search">
                <span>Search</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>

          {/* 🎯 პროაქტიული სლოტი ინტერფეისის ქვედა ნაწილში */}
          <div style={styles.proactiveSlot}>
            <button 
              onClick={triggerAiSurprise} 
              className="proactive-hover" 
              style={styles.proactiveBtn}
            >
              <span>✨ Not sure what you want? Let the AI Concierge surprise you.</span>
            </button>
          </div>

          {/* Image Preview Area */}
          {imageBase64 && (
            <div style={styles.imagePreviewArea} className="animate-slide-up">
              <div style={styles.imageContainer}>
                <img src={imageBase64} alt="preview" style={styles.previewImage} />
                <button onClick={removeImage} style={styles.removeImageBtn}>✕</button>
              </div>
              <div style={styles.imageDetails}>
                <p style={{ color: '#cbd5e1', margin: 0, fontFamily: 'monospace', fontSize: '11px' }}>{fileName}</p>
                <p style={{ color: '#fbbf24', margin: '2px 0 0 0', fontSize: '10px' }}>
                  ✨ Image attached! Ready for Gemini Vision analysis.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Context Meta Bar */}
        <div style={styles.metaBar}>
          <div>
            <span style={styles.badge}>Gemini 2.5 Flash</span>
            <span style={{ color: '#64748b' }}>Scope: Proactive Omni-Engine</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '11px' }}>{status}</span>
        </div>

        {/* Loader Component */}
        {isLoading && (
          <div style={styles.loaderZone} className="animate-pulse-glow">
            <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '0.875rem', margin: 0 }}>⚡ Gemini is thinking...</p>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>Analyzing visual items, voice semantics and emotional vibe.</p>
          </div>
        )}

        {/* Results Area */}
        {showResults && (
          <div style={styles.resultsWrapper} className="animate-slide-up">
            {/* AI Reasoning Section */}
            <div style={styles.reasoningCard}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#fbbf24', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                🔮 AI Concierge Reasoning
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.937rem', lineHeight: 1.6, margin: 0 }}>{aiReason}</p>
            </div>

            {/* Products Grid */}
            <div>
              <div style={styles.gridHeader}>
                <h4 style={styles.gridTitle}>📦 Smart Matches (Top Picks)</h4>
              </div>

              <div style={styles.grid}>
                {matchedProducts.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    😢 No matching products found. Try changing your search query or image!
                  </div>
                ) : (
                  matchedProducts.map((product) => (
                    <div key={product.id} style={styles.productCard} className="product-card-stagger">
                      <div>
                        <div style={styles.productHeader}>
                          <h5 style={styles.productName}>{product.name}</h5>
                          <span style={styles.productPrice}>${product.price}</span>
                        </div>
                        <p style={styles.productDesc}>{product.desc}</p>
                      </div>
                      <button style={styles.addToCartBtn}>
                        🛒 Add to Cart
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}