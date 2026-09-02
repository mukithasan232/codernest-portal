"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, Scissors, Camera, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3 | 4;

export default function FreeTrialPage() {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const services = [
    { id: 'clipping', name: 'Clipping Path', icon: Scissors },
    { id: 'ghost', name: 'Ghost Mannequin', icon: Camera },
    { id: 'retouching', name: 'High-End Retouching', icon: Sparkles },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 3);
      setFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 3);
      setFiles(droppedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return toast.error("Please upload at least 1 image.");
    if (!name || !email) return toast.error("Please provide your contact details.");
    
    setIsSubmitting(true);
    try {
      // 1. Upload Files
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      
      const uploadRes = await fetch('/api/upload/trial', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
      
      // 2. Submit Lead
      const leadRes = await fetch('/api/webhooks/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          source: 'IMAGE_TRIAL',
          requirements: `Requested Free Trial for ${service}. Images uploaded: \n${uploadData.urls.join('\n')}`
        })
      });
      if (!leadRes.ok) throw new Error('Lead creation failed');
      
      setStep(4);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen bg-[#050505] text-white pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Request a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Free Trial</span></h1>
            <p className="text-slate-400">Test our pixel-perfect quality. Upload up to 3 images, and we'll process them for free within 24 hours.</p>
          </div>

          <div className="glass rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                style={{ width: `${(step / 4) * 100}%` }} 
              />
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Service */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold">What service do you want to test?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {services.map(s => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setService(s.id)}
                          className={`p-6 rounded-2xl border text-left transition-all ${service === s.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'}`}
                        >
                          <Icon className={`w-8 h-8 mb-4 ${service === s.id ? 'text-blue-400' : 'text-slate-400'}`} />
                          <div className={`font-bold ${service === s.id ? 'text-blue-400' : 'text-white'}`}>{s.name}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => setStep(2)}
                      disabled={!service}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Upload */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold">Upload Test Images (Max 3)</h3>
                  
                  <div 
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-3xl p-12 text-center cursor-pointer transition-all"
                  >
                    <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-300 font-medium mb-1">Drag and drop images here</p>
                    <p className="text-sm text-slate-500">or click to browse from your computer (JPEG, PNG)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-400">Selected Files:</p>
                      {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-black/40 px-4 py-3 rounded-xl border border-white/5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-slate-300 truncate">{f.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-400 hover:text-white font-medium">Back</button>
                    <button 
                      onClick={() => setStep(3)}
                      disabled={files.length === 0}
                      className="px-6 py-3 bg-white text-black font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold">Where should we send the results?</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                      <input 
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                      <input 
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="john@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Company (Optional)</label>
                      <input 
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder="Acme Corp"
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setStep(2)} className="px-6 py-3 text-slate-400 hover:text-white font-medium">Back</button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isSubmitting ? 'Uploading & Submitting...' : 'Submit Trial'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold">Trial Submitted Successfully!</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    We've received your images. Our expert retouchers will process them and email you the results within 24 hours.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
