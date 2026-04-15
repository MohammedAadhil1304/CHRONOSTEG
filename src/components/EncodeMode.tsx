/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Lock, Clock, FileUp, Download, 
  ChevronRight, ChevronLeft, Image as ImageIcon, 
  Music, Video, Loader2, CheckCircle2, Copy
} from 'lucide-react';
import { generateKey, exportKey, encryptMessage, importKey } from '../lib/crypto';
import { embedPayloadInImage, embedPayloadInAudio, embedPayloadInVideo } from '../lib/stego';
import { estimateUnlockTime } from '../lib/vdf';
import { CarrierType, EncryptedPayload } from '../types';

interface EncodeModeProps {
  onMetricsUpdate: (metrics: { psnr?: number; ssim?: number; snr?: number; capacity?: number }) => void;
}

export default function EncodeMode({ onMetricsUpdate }: EncodeModeProps) {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [encryptionMethod, setEncryptionMethod] = useState<'AES-256-GCM' | 'RSA-OAEP'>('AES-256-GCM');
  const [symmetricKey, setSymmetricKey] = useState<string>('');
  const [unlockTime, setUnlockTime] = useState<string>('');
  const [vdfDifficulty, setVdfDifficulty] = useState(5);
  const [carrierType, setCarrierType] = useState<CarrierType>('image');
  const [carrierFile, setCarrierFile] = useState<File | null>(null);
  const [carrierPreview, setCarrierPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [finalMetrics, setFinalMetrics] = useState<{ psnr?: number; snr?: number; ssim?: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateKey = async () => {
    const key = await generateKey();
    const hex = await exportKey(key);
    setSymmetricKey(hex);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarrierFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setCarrierPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setCarrierPreview(null);
      }
    }
  };

  const handleEncode = async () => {
    if (!message || !carrierFile || !unlockTime || !symmetricKey) return;

    setIsProcessing(true);
    setProcessingStatus('Initializing Encryption...');
    
    try {
      // 1. Encrypt Message
      setProcessingStatus('Encrypting Payload (AES-256-GCM)...');
      const key = await importKey(symmetricKey);
      const { ciphertext, iv } = await encryptMessage(message, key);
      
      // 2. Prepare Payload
      const payload: EncryptedPayload = {
        ciphertext,
        iv,
        keyCapsule: symmetricKey, // In real VDF this would be the locked key
        metadata: {
          carrierType,
          encryptionMethod,
          unlockTime: new Date(unlockTime).getTime(),
          vdfDifficulty,
          payloadSize: message.length,
        }
      };

      // 3. Embed in Carrier
      setProcessingStatus(`Embedding in ${carrierType.toUpperCase()}...`);
      let result;
      if (carrierType === 'image') {
        result = await embedPayloadInImage(carrierFile, payload);
        setFinalMetrics({ psnr: result.psnr });
        onMetricsUpdate({ psnr: result.psnr, capacity: (message.length / (carrierFile.size * 0.1)) * 100 });
      } else if (carrierType === 'audio') {
        result = await embedPayloadInAudio(carrierFile, payload);
        setFinalMetrics({ snr: result.snr });
        onMetricsUpdate({ snr: result.snr, capacity: (message.length / (carrierFile.size * 0.1)) * 100 });
      } else {
        result = await embedPayloadInVideo(carrierFile, payload);
        setFinalMetrics({ ssim: result.ssim });
        onMetricsUpdate({ ssim: result.ssim, capacity: (message.length / (carrierFile.size * 0.1)) * 100 });
      }

      setResultBlob(result.blob);
      setProcessingStatus('Done');
      setStep(5);
    } catch (err) {
      console.error(err);
      alert('Encoding failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stego_${carrierFile?.name || 'output'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const steps = [
    { id: 1, title: 'Message', icon: MessageSquare },
    { id: 2, title: 'Encryption', icon: Lock },
    { id: 3, title: 'Time-Lock', icon: Clock },
    { id: 4, title: 'Carrier', icon: FileUp },
    { id: 5, title: 'Finish', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Wizard Header */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy-800 -z-10" />
        {steps.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step >= s.id ? 'bg-cyan-accent border-cyan-accent text-navy-950 shadow-[0_0_15px_rgba(0,229,255,0.5)]' : 'bg-navy-900 border-navy-800 text-slate-500'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] uppercase font-bold tracking-tighter ${step >= s.id ? 'text-cyan-accent' : 'text-slate-600'}`}>
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="step-card">
              <div className="step-label">
                <span>Step 01 / Secret Data</span>
              </div>
              <div className="step-title">Enter Message to Encrypt</div>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter sensitive intel here..."
                rows={4}
                className="w-full bg-input-bg border border-border rounded-sm p-3 text-accent font-mono text-xs outline-none resize-none"
              />
            </div>
            <button 
              disabled={!message}
              onClick={() => setStep(2)}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Next Phase <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="step-card">
                <div className="step-label">Step 02 / Security</div>
                <div className="step-title">Encryption Setup</div>
                <div className="input-group">
                  <label>ALGORITHM</label>
                  <select 
                    value={encryptionMethod}
                    onChange={(e) => setEncryptionMethod(e.target.value as any)}
                    className="form-control"
                  >
                    <option value="AES-256-GCM">AES-256-GCM (Hardware Accel)</option>
                    <option value="RSA-OAEP">RSA-OAEP (4096-bit)</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="text-[10px] text-text-dim uppercase font-bold mb-1 block">SYMMETRIC KEY</label>
                  <div className="flex gap-2">
                    <div className="key-display flex-1">
                      {symmetricKey || 'NO KEY GENERATED'}
                    </div>
                    <button 
                      onClick={handleGenerateKey}
                      className="p-2 bg-input-bg border border-border rounded hover:border-accent transition-colors"
                    >
                      <Zap className="w-4 h-4 text-accent" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="step-card">
                <div className="step-label">Step 03 / Time-Lock</div>
                <div className="step-title">VDF Configuration</div>
                <div className="input-group">
                  <label>UNLOCK DATETIME</label>
                  <input 
                    type="datetime-local"
                    value={unlockTime}
                    onChange={(e) => setUnlockTime(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <label className="text-[10px] text-text-dim uppercase font-bold">DIFFICULTY</label>
                    <span className="text-[10px] text-accent font-mono">{vdfDifficulty}</span>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={vdfDifficulty}
                    onChange={(e) => setVdfDifficulty(parseInt(e.target.value))}
                    className="w-full h-1 bg-input-bg rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>
                <div className="formula-box">
                  K_final = VDF(K_temp, <span>T={vdfDifficulty.toExponential(1)}</span>)
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-border text-text-dim font-bold uppercase tracking-widest rounded-sm hover:text-text-primary transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button 
                disabled={!symmetricKey || !unlockTime}
                onClick={() => setStep(4)}
                className="btn-primary flex-[2] flex items-center justify-center gap-2"
              >
                Next Phase <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="step-card">
              <div className="step-label">Step 04 / Steganography</div>
              <div className="step-title">Select Carrier File</div>
              
              <div className="flex border-b border-border mb-4">
                <button 
                  onClick={() => setCarrierType('image')}
                  className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${carrierType === 'image' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-primary'}`}
                >
                  IMAGE (PNG/BMP)
                </button>
                <button 
                  onClick={() => setCarrierType('audio')}
                  className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${carrierType === 'audio' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-primary'}`}
                >
                  AUDIO (WAV)
                </button>
                <button 
                  onClick={() => setCarrierType('video')}
                  className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${carrierType === 'video' ? 'text-accent border-b-2 border-accent' : 'text-text-dim hover:text-text-primary'}`}
                >
                  VIDEO (MP4)
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 border border-border bg-black/40 flex items-center justify-center cursor-pointer hover:border-accent/40 transition-all overflow-hidden"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept={carrierType === 'image' ? 'image/png,image/bmp' : carrierType === 'audio' ? 'audio/wav' : 'video/mp4'}
                  />
                  {carrierPreview ? (
                    <img src={carrierPreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[9px] text-text-dim text-center uppercase p-2">
                      <FileUp className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      No Preview
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="input-group">
                    <label>SELECT METHOD</label>
                    <select className="form-control">
                      <option>Adaptive LSB (Min. Distortion)</option>
                      <option>DCT-Domain (High Robustness)</option>
                      <option>ML-Guided (Simulated)</option>
                    </select>
                  </div>
                  
                  <button 
                    disabled={!carrierFile || isProcessing}
                    onClick={handleEncode}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> {processingStatus}
                      </>
                    ) : (
                      <>
                        Generate Stego File <Download className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-3 border border-border text-text-dim font-bold uppercase tracking-widest rounded-sm hover:text-text-primary transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Config
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="step-card border-l-success">
              <div className="step-label">
                <span className="text-success">Transmission Ready</span>
              </div>
              <div className="step-title">Payload successfully embedded</div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h5 className="text-[9px] uppercase text-text-dim mb-1">Carrier Type</h5>
                  <p className="text-xs font-mono text-accent uppercase">{carrierType}</p>
                </div>
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h5 className="text-[9px] uppercase text-text-dim mb-1">Payload Size</h5>
                  <p className="text-xs font-mono text-accent">{message.length} Bytes</p>
                </div>
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h5 className="text-[9px] uppercase text-text-dim mb-1">Unlock Time</h5>
                  <p className="text-xs font-mono text-accent">{new Date(unlockTime).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h5 className="text-[9px] uppercase text-text-dim mb-1">Metric Score</h5>
                  <p className="text-xs font-mono text-success">
                    {finalMetrics?.psnr ? `${finalMetrics.psnr.toFixed(1)} dB` : 
                     finalMetrics?.snr ? `${finalMetrics.snr.toFixed(1)} dB` : 
                     finalMetrics?.ssim ? `${finalMetrics.ssim.toFixed(4)}` : 'N/A'}
                  </p>
                </div>
              </div>

              <button 
                onClick={downloadResult}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Download Stego File <Download className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={() => {
                setStep(1);
                setMessage('');
                setCarrierFile(null);
                setCarrierPreview(null);
                setResultBlob(null);
              }}
              className="w-full py-3 border border-border text-text-dim font-bold uppercase tracking-widest rounded-sm hover:text-text-primary transition-all"
            >
              Start New Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
