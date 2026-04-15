/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AboutSection from './components/AboutSection';
import EncodeMode from './components/EncodeMode';
import DecodeMode from './components/DecodeMode';
import MetricsPanel from './components/MetricsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');
  const [metrics, setMetrics] = useState<{ psnr?: number; ssim?: number; snr?: number; capacity?: number }>({});

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary font-sans border border-border overflow-x-hidden">
      {/* Header */}
      <header className="h-[70px] px-[30px] flex items-center justify-between border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-[15px]">
          <div className="font-mono text-2xl font-bold tracking-[2px] text-accent glow-text uppercase glitch-text">
            CHRONOSTEG
          </div>
          <div className="text-[10px] text-text-dim leading-tight hidden sm:block">
            M.S. KUMAR / R. BHARANIDHARAN<br />
            N.M. AADHIL / S.P. KEERTHIKA
          </div>
        </div>

        <div className="flex bg-[#060a14] p-1 rounded-md border border-border">
          <button 
            onClick={() => setActiveTab('encode')}
            className={`px-6 py-2 text-[13px] font-semibold uppercase tracking-wider cursor-pointer rounded transition-all duration-300 ${
              activeTab === 'encode' ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent-glow)]' : 'text-text-dim hover:text-text-primary'
            }`}
          >
            Encode
          </button>
          <button 
            onClick={() => setActiveTab('decode')}
            className={`px-6 py-2 text-[13px] font-semibold uppercase tracking-wider cursor-pointer rounded transition-all duration-300 ${
              activeTab === 'decode' ? 'bg-accent text-bg shadow-[0_0_15px_var(--color-accent-glow)]' : 'text-text-dim hover:text-text-primary'
            }`}
          >
            Decode
          </button>
        </div>

        <div className="text-[10px] text-accent text-right hidden md:block">
          SYSTEM STATUS: SECURE<br />
          ENCRYPTION: AES-256-GCM
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 p-5 max-w-[1440px] mx-auto w-full">
        <div className="flex flex-col gap-5">
          <AboutSection />
          
          <div className="bg-card-bg/20 border border-border/50 rounded-sm p-4 md:p-6 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {activeTab === 'encode' ? (
                <motion.div
                  key="encode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <EncodeMode onMetricsUpdate={(m) => setMetrics(prev => ({ ...prev, ...m }))} />
                </motion.div>
              ) : (
                <motion.div
                  key="decode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <DecodeMode />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <MetricsPanel 
            psnr={metrics.psnr} 
            ssim={metrics.ssim} 
            snr={metrics.snr} 
            capacity={metrics.capacity} 
          />

          <div className="bg-card-bg border border-border rounded-lg p-4">
            <div className="text-[10px] uppercase text-accent tracking-widest mb-2 font-mono">PROJECT METADATA</div>
            <div className="text-[11px] leading-relaxed space-y-2">
              <p><strong>Institution:</strong> Nandha Engineering College</p>
              <p><strong>Dept:</strong> CSE (Cyber Security)</p>
              <p className="text-text-dim mt-2">This tool implements Verifiable Delay Functions (VDF) ensuring that data cannot be decrypted before a specific computational effort has elapsed.</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="tag">COVERTNESS</span>
                <span className="tag">VDF</span>
                <span className="tag">AES-256</span>
                <span className="tag">CYBER-INTEL</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-border flex items-center justify-center text-[10px] text-text-dim bg-[#060a14] uppercase tracking-[2px]">
        DEPT OF COMPUTER SCIENCE & ENGINEERING — CYBER SECURITY | NANDHA ENGINEERING COLLEGE
      </footer>
    </div>
  );
}
