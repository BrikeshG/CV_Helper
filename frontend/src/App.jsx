import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Wand2, Save, BarChart3, Layout, Upload } from 'lucide-react';
import ResumePreview from './components/ResumePreview';
import ApplicationTracker from './components/ApplicationTracker';
import HarvardTemplate from './components/templates/HarvardTemplate';
import TealTemplate from './components/templates/TealTemplate';
import MasterTemplate from './components/templates/MasterTemplate';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function App() {
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [userText, setUserText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState('Professional'); // Kept for handleGenerate function
  const [length, setLength] = useState('Short'); // 'Short' (1 page) or 'Detailed' (2 page) // Kept for handleGenerate function
  const [activeTab, setActiveTab] = useState('input'); // 'input', 'preview', 'tracker'
  const [lockedSections, setLockedSections] = useState({ summary: false, experience: false, projects: false });

  // V8: Template State
  const [activeTemplate, setActiveTemplate] = useState('harvard'); // 'harvard' | 'teal'
  const [activePreviewDoc, setActivePreviewDoc] = useState('resume');

  // Load Saved Master CV on Mount (Backend First)
  useEffect(() => {
    // Try pulling from backend
    axios.get(`${API_BASE_URL}/master-cv`)
      .then(res => {
        if (res.data.text) {
          setUserText(res.data.text);
        } else {
          // Fallback to local if empty on server (first run)
          const local = localStorage.getItem('master_cv');
          if (local) setUserText(local);
        }
      })
      .catch(err => {
        console.error("Failed to fetch Master CV from backend", err);
        // Fallback to local on error
        const local = localStorage.getItem('master_cv');
        if (local) setUserText(local);
      });
  }, []);

  const saveMasterCV = async () => {
    try {
      await axios.post(`${API_BASE_URL}/master-cv`, { text: userText });
      localStorage.setItem('master_cv', userText); // Keep local backup
      alert("Master CV saved to Backend (and LocalStorage)!");
    } catch (err) {
      console.error(err);
      alert("Failed to save to backend. Saved locally only.");
      localStorage.setItem('master_cv', userText);
    }
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/extract-text`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUserText(res.data.text);
      alert("Text extracted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to extract text. Note: Only PDF, DOCX, and TXT are supported.");
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = null;
    }
  };

  const addToTracker = () => {
    if (!companyName) return alert("Please enter a Company Name first.");

    const newApp = {
      id: Date.now(),
      company: companyName,
      role: 'See CV', // Ideally we'd parse this too, but for now placeholder
      date: new Date().toISOString(),
      score: cvData?.analysis?.matchScore || 0,
      status: 'Applied'
    };

    const existing = JSON.parse(localStorage.getItem('cv_app_tracker') || '[]');
    localStorage.setItem('cv_app_tracker', JSON.stringify([newApp, ...existing]));
    alert("Added to Application Tracker!");
    setActiveTab('tracker');
  };

  const handleGenerate = async () => {
    if (!userText.trim()) return alert("Please enter your details first.");

    setLoading(true);
    setActiveTab('preview'); // Switch to preview on mobile automatically

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-cv`, {
        userText,
        jobDescription,
        tone,
        length
      });

      // Merge Logic for Locking
      const newData = response.data.cvData;
      if (cvData) {
        if (lockedSections.summary) newData.summary = cvData.summary;
        if (lockedSections.experience) newData.experience = cvData.experience;
        if (lockedSections.projects) newData.projects = cvData.projects;
      }

      setCvData(newData);
    } catch (error) {
      console.error("Error generating CV:", error);
      alert("Failed to generate CV. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvData) return;

    // We basically grab the outerHTML of the preview node
    // In a real app, we might want to send the raw data to backend and have it render with the same template
    // But for this simple flow, we'll send the data back or just use the backend template if it matches.
    // Wait, our backend PDF service accepts HTML. Let's send the HTML  const handleDownloadPDF = async () => {
    const targetId = activePreviewDoc === 'resume' ? 'resume-preview' : 'cover-letter-preview';
    const element = document.getElementById(targetId);

    if (!element) {
      alert(`Please generate the ${activePreviewDoc === 'resume' ? 'Resume' : 'Cover Letter'} first.`);
      return;
    }

    // Wrap it in a basic html structure for the backend to render
    const htmlContent = `
      <html>
        <head>
           <meta charset="UTF-8" />
           <script src="https://cdn.tailwindcss.com"></script>
           <style>
             body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
           </style>
        </head>
      <html>
        <head>
          <title>CV</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
             @page { margin: 0; size: auto; }
             body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-pdf`, { htmlContent }, {
        responseType: 'blob' // Important for PDF download
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      const safeCompany = companyName.replace(/[^a-z0-9]/gi, '_') || 'Job';
      link.setAttribute('download', `CV_${safeCompany}_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF.");
    }
  };

  const handleDownloadDOCX = async () => {
    if (!cvData) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-docx`, { cvData }, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `CV_Optimized_${dateStr}.docx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading DOCX:", error);
      alert("Failed to download Word Document.");
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-slate-100 to-indigo-100 overflow-x-hidden">

      {/* Decorative Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-300 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-[40%] h-[40%] rounded-full bg-pink-300 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto p-4 md:p-8 max-w-7xl h-screen flex flex-col">

        {/* Header / Nav */}
        <header className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Wand2 size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-violet-800 tracking-tight">
              AI Career<span className="font-light">Forge</span>
            </h1>
          </div>

          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/40 shadow-sm">
            <button
              onClick={() => setActiveTab('input')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'input' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layout size={16} /> <span className="hidden md:inline">Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'tracker' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart3 size={16} /> <span className="hidden md:inline">Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex md:hidden items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileText size={16} /> Preview
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow flex gap-6 overflow-hidden relative">

          {/* LEFT CARD: Editor */}
          <div className={`w-full md:w-5/12 transition-all duration-500 ease-in-out ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'} flex-col`}>
            {activeTab === 'tracker' ? (
              <div className="h-full glass-card rounded-3xl overflow-hidden p-1">
                <ApplicationTracker />
              </div>
            ) : (
              <div className="h-full glass-card rounded-3xl p-6 md:p-8 flex flex-col overflow-y-auto border border-white/60 shadow-xl shadow-indigo-100/50">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    🚀 Optimize Resume
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">100% Secure</span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Tailor your CV to the job description automatically.</p>
                </div>

                <div className="space-y-6 flex-grow">
                  {/* Step 1 */}
                  <div className="bg-white/50 rounded-2xl p-5 border border-white/60 transition-all hover:bg-white/80 hover:shadow-md group">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</div>
                        Master CV
                      </label>
                      <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <input type="file" id="cv-upload" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                        <button onClick={() => document.getElementById('cv-upload').click()} className="text-[10px] flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold hover:bg-indigo-100">
                          <Upload size={10} /> Import
                        </button>
                        <button onClick={saveMasterCV} className="text-[10px] flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold hover:bg-indigo-100">
                          <Save size={10} /> Save
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="w-full h-40 bg-white border-0 rounded-xl p-3 text-sm text-slate-600 shadow-inner ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all resize-none"
                      placeholder="Paste or import your full experience..."
                      value={userText}
                      onChange={(e) => setUserText(e.target.value)}
                    />
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white/50 rounded-2xl p-5 border border-white/60 transition-all hover:bg-white/80 hover:shadow-md">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs">2</div>
                      Target Job
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white border-0 rounded-xl p-3 mb-2 text-sm text-slate-600 shadow-inner ring-1 ring-slate-100 focus:ring-2 focus:ring-pink-400 focus:outline-none"
                      placeholder="Company Name (e.g. Spotify)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <textarea
                      className="w-full h-24 bg-white border-0 rounded-xl p-3 text-sm text-slate-600 shadow-inner ring-1 ring-slate-100 focus:ring-2 focus:ring-pink-400 focus:outline-none transition-all resize-none"
                      placeholder="Paste the Job Description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  {/* Action */}
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Polishing Experience...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                          <span>Generate Optimized CV</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT CARD: Preview */}
          <div className={`w-full md:w-7/12 flex-col ${activeTab === 'input' ? 'hidden md:flex' : 'flex'} relative`}>
            {activeTab === 'input' || activeTab === 'preview' ? (
              <div className="h-full glass-card rounded-3xl p-1 flex flex-col relative border border-white/60 shadow-2xl shadow-slate-200/50 backdrop-blur-2xl">
                {/* Preview Toolbar */}
                <div className="absolute top-4 right-6 z-20 flex gap-2 items-center">

                  {/* Template Switcher (Only for Resume) */}
                  {activePreviewDoc === 'resume' && (
                    <div className="bg-white/80 p-1 rounded-xl shadow-sm border border-slate-100 flex">
                      <button onClick={() => setActiveTemplate('harvard')} className={`w-24 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex justify-center ${activeTemplate === 'harvard' ? 'bg-indigo-900 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}>Ivy (Classic)</button>
                      <button onClick={() => setActiveTemplate('teal')} className={`w-24 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex justify-center ${activeTemplate === 'teal' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}>Tech (Modern)</button>
                      <button onClick={() => setActiveTemplate('master')} className={`w-24 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex justify-center ${activeTemplate === 'master' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}>Master (Yours)</button>
                    </div>
                  )}

                  {/* Doc Type Toggle */}
                  <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200">
                    <button onClick={() => setActivePreviewDoc('resume')} className={`w-24 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex justify-center ${activePreviewDoc === 'resume' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Resume</button>
                    <button onClick={() => setActivePreviewDoc('coverletter')} className={`w-24 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex justify-center ${activePreviewDoc === 'coverletter' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Cover Letter</button>
                  </div>

                  {cvData && (
                    <>
                      <button onClick={addToTracker} className="bg-white/80 hover:bg-white text-indigo-600 w-9 h-9 flex items-center justify-center rounded-xl shadow-sm border border-slate-100 transition-all" title="Save to Tracker">
                        <BarChart3 size={16} />
                      </button>
                      <button onClick={handleDownloadDOCX} className="bg-blue-600 hover:bg-blue-700 text-white w-9 h-9 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/30 transition-all" title="Download Word Doc">
                        <FileText size={16} />
                      </button>
                      <button onClick={handleDownloadPDF} className="bg-slate-900 hover:bg-slate-800 text-white w-9 h-9 flex items-center justify-center rounded-xl shadow-lg shadow-slate-900/20 transition-all" title="Download PDF">
                        <Download size={16} />
                      </button>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto rounded-[20px] bg-slate-50/50 p-4 md:p-8 flex justify-center items-start custom-scrollbar">
                  {activePreviewDoc === 'resume' ? (
                    <div id="resume-preview" className="bg-white shadow-2xl shadow-slate-300/50 transition-all duration-500 ease-in-out transform origin-top hover:scale-[1.01]">
                      {/* Render Selected Template or Empty State */}
                      {cvData ? (
                        activeTemplate === 'harvard' ? (
                          <HarvardTemplate data={cvData} />
                        ) : activeTemplate === 'teal' ? (
                          <TealTemplate data={cvData} />
                        ) : (
                          <MasterTemplate data={cvData} />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center p-20 min-h-[600px] text-center text-slate-500">
                          <Wand2 size={48} className="mb-4 text-indigo-300" />
                          <h3 className="text-xl font-bold text-indigo-900 mb-2">Ready to Design?</h3>
                          <p>Enter your career details on the left and click <strong>Generate</strong> to see your premium CV here.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div id="cover-letter-preview" className="bg-white w-full max-w-2xl shadow-xl p-10 min-h-[600px] text-slate-700 whitespace-pre-wrap leading-relaxed font-serif animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {cvData?.coverLetter ? (
                        <>
                          <h2 className="text-2xl font-bold mb-6 text-slate-900 border-b pb-4">Cover Letter</h2>
                          <div className="text-base text-justify">{cvData.coverLetter}</div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <p>No Cover Letter Generated yet.</p>
                          <p className="text-sm">Click "Generate" to create one.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
