/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileUp, Unlock, Clock, Loader2, 
  CheckCircle2, AlertTriangle, Terminal,
  ChevronRight, ChevronLeft, Cpu, Key
} from 'lucide-react';
import { extractPayloadFromImage, extractPayloadFromAudio, extractPayloadFromVideo } from '../lib/stego';
import { solveVDF } from '../lib/vdf';
import { decryptMessage, importKey } from '../lib/crypto';
import { EncryptedPayload } from '../types';

export default function DecodeMode() {
  const [step, setStep] = useState(1);
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [payload, setPayload] = useState<EncryptedPayload | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isVDFSolving, setIsVDFSolving] = useState(false);
  const [vdfProgress, setVdfProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [solvedKey, setSolvedKey] = useState<string | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (!payload || isUnlocked) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = payload.metadata.unlockTime - now;
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [payload, isUnlocked]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStegoFile(file);
  };

  const handleExtract = async () => {
    if (!stegoFile) return;
    setIsExtracting(true);
    try {
      let extracted;
      // Simple detection based on extension
      const ext = stegoFile.name.split('.').pop()?.toLowerCase();
      if (['png', 'bmp'].includes(ext || '')) {
        extracted = await extractPayloadFromImage(stegoFile);
      } else if (['wav'].includes(ext || '')) {
        extracted = await extractPayloadFromAudio(stegoFile);
      } else if (['mp4'].includes(ext || '')) {
        extracted = await extractPayloadFromVideo(stegoFile);
      } else {
        throw new Error('Unsupported file format');
      }
      
      setPayload(extracted);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Extraction failed: ' + (err as Error).message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSolveVDF = async () => {
    if (!payload) return;
    setIsVDFSolving(true);
    try {
      const result = await solveVDF(payload.keyCapsule, payload.metadata.vdfDifficulty, (p) => setVdfProgress(p));
      setSolvedKey(result);
      setIsUnlocked(true);
    } catch (err) {
      console.error(err);
      alert('VDF Solve failed');
    } finally {
      setIsVDFSolving(false);
    }
  };

  const handleDecrypt = async () => {
    if (!payload || !isUnlocked || !solvedKey) return;
    setIsDecrypting(true);
    try {
      const key = await importKey(solvedKey);
      const msg = await decryptMessage(payload.ciphertext, payload.iv, key);
      setDecryptedMessage(msg);
      setStep(4);
    } catch (err) {
      console.error(err);
      const msg = (err as Error).message;
      alert(msg.startsWith('Decryption failed') ? msg : `Decryption failed: ${msg}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="step-card">
              <div className="step-label">Step 01 / Extraction</div>
              <div className="step-title">Upload Stego File for Analysis</div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border border-dashed border-border bg-black/40 flex flex-col items-center justify-center gap-3 hover:border-accent/40 transition-all cursor-pointer group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                />
                
                {stegoFile ? (
                  <div className="text-center">
                    <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
                    <p className="text-xs text-text-primary font-mono">{stegoFile.name}</p>
                    <p className="text-[9px] text-text-dim uppercase">{(stegoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <FileUp className="w-8 h-8 text-text-dim group-hover:text-accent transition-all" />
                    <div className="text-center">
                      <p className="text-[11px] text-text-dim font-bold uppercase tracking-widest">Select Carrier File</p>
                      <p className="text-[9px] text-text-dim/60 uppercase mt-1">PNG, BMP, WAV, MP4 supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button 
              disabled={!stegoFile || isExtracting}
              onClick={handleExtract}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Extracting Payload...
                </>
              ) : (
                <>
                  Extract Payload <ChevronRight className="w-5 h-5" />
                </>
              )}
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
            <div className="step-card">
              <div className="step-label">
                <span>Step 02 / Analysis</span>
                <span className="text-accent">{payload?.metadata.carrierType.toUpperCase()} DETECTED</span>
              </div>
              <div className="step-title">Payload Metadata Extracted</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h4 className="text-[9px] uppercase text-text-dim font-bold mb-1">Ciphertext (Hex)</h4>
                  <div className="text-[9px] font-mono text-text-dim break-all line-clamp-2">
                    {payload?.ciphertext}
                  </div>
                </div>
                <div className="p-3 bg-input-bg rounded-sm border border-border">
                  <h4 className="text-[9px] uppercase text-text-dim font-bold mb-1">Key Capsule</h4>
                  <div className="text-[9px] font-mono text-text-dim break-all line-clamp-2">
                    {payload?.keyCapsule}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-sm border border-accent/10 flex flex-col items-center text-center">
                {timeLeft > 0 ? (
                  <>
                    <Clock className="w-8 h-8 text-amber-500 mb-2 animate-pulse" />
                    <h4 className="text-[10px] uppercase text-text-dim font-bold mb-1">Temporal Lock Active</h4>
                    <p className="text-xl font-mono text-amber-500 glow-text">{formatTime(timeLeft)}</p>
                  </>
                ) : (
                  <>
                    <Unlock className="w-8 h-8 text-success mb-2" />
                    <h4 className="text-[10px] uppercase text-text-dim font-bold mb-1">Temporal Lock Expired</h4>
                    <p className="text-xl font-mono text-success glow-text">READY FOR DECRYPTION</p>
                  </>
                )}
                <p className="text-[9px] text-text-dim/60 uppercase mt-3">Unlock Date: {new Date(payload?.metadata.unlockTime || 0).toLocaleString()}</p>
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
                disabled={timeLeft > 0 || isVDFSolving}
                onClick={isUnlocked ? () => setStep(3) : handleSolveVDF}
                className="btn-primary flex-[2] flex items-center justify-center gap-2"
              >
                {isVDFSolving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Solving VDF ({vdfProgress.toFixed(0)}%)
                  </>
                ) : isUnlocked ? (
                  <>
                    Proceed to Decrypt <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Solve VDF Puzzle <Cpu className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="step-card border-l-success">
              <div className="step-label">
                <span className="text-success">Step 03 / Key Recovery</span>
              </div>
              <div className="step-title">VDF Puzzle Solved Successfully</div>

              <div className="p-3 bg-input-bg rounded-sm border border-border text-left mb-6">
                <h4 className="text-[9px] uppercase text-text-dim font-bold mb-1">Recovered Key (K_temp)</h4>
                <div className="text-[10px] font-mono text-accent break-all">
                  {payload?.keyCapsule}
                </div>
              </div>

              <button 
                disabled={isDecrypting}
                onClick={handleDecrypt}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {isDecrypting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Decrypting...
                  </>
                ) : (
                  <>
                    Decrypt Message <Unlock className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="step-card border-l-success">
              <div className="step-label">
                <span className="text-success">Step 04 / Result</span>
              </div>
              <div className="step-title flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent" />
                DECLASSIFIED MESSAGE
              </div>
              
              <div className="p-4 bg-input-bg rounded-sm border border-border font-mono text-xs text-text-primary leading-relaxed whitespace-pre-wrap min-h-[150px]">
                {decryptedMessage}
              </div>

              <div className="flex items-center gap-2 text-[9px] text-text-dim uppercase font-bold mt-4">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span>Confidentiality Level: Top Secret</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setStep(1);
                setStegoFile(null);
                setPayload(null);
                setIsUnlocked(false);
                setDecryptedMessage(null);
              }}
              className="w-full py-3 border border-border text-text-dim font-bold uppercase tracking-widest rounded-sm hover:text-text-primary transition-all"
            >
              Close Session
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
