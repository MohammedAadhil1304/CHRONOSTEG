/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Lock, Clock, Cpu, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function AboutSection() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="mb-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-navy-900/50 border border-cyan-accent/20 rounded-t-xl hover:bg-navy-900/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-accent" />
          <h1 className="text-2xl font-bold tracking-tighter glitch-text text-cyan-accent uppercase">
            ChronoSteg
          </h1>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-navy-900/30 border-x border-b border-cyan-accent/20 rounded-b-xl p-6 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-400 leading-relaxed mb-6">
                ChronoSteg is an advanced Time-Lock Encrypted Steganography framework designed for secure, 
                time-delayed covert communication. It integrates AES-256 encryption with Verifiable Delay Functions (VDF) 
                and Least Significant Bit (LSB) steganography to ensure message confidentiality, 
                temporal integrity, and undetectable transmission.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-navy-800/50 rounded-lg border border-cyan-accent/10">
                  <Shield className="w-5 h-5 text-cyan-accent mb-2" />
                  <h3 className="text-xs font-bold uppercase text-cyan-accent mb-1">Covertness</h3>
                  <p className="text-[10px] text-slate-500">AAS-guided LSB embedding ensures minimal carrier distortion.</p>
                </div>
                <div className="p-3 bg-navy-800/50 rounded-lg border border-cyan-accent/10">
                  <Lock className="w-5 h-5 text-cyan-accent mb-2" />
                  <h3 className="text-xs font-bold uppercase text-cyan-accent mb-1">Security</h3>
                  <p className="text-[10px] text-slate-500">AES-256-GCM provides authenticated encryption for the payload.</p>
                </div>
                <div className="p-3 bg-navy-800/50 rounded-lg border border-cyan-accent/10">
                  <Clock className="w-5 h-5 text-cyan-accent mb-2" />
                  <h3 className="text-xs font-bold uppercase text-cyan-accent mb-1">Temporal</h3>
                  <p className="text-[10px] text-slate-500">VDF puzzles enforce a mandatory computational delay before decryption.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Methodology & Rationale</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-navy-950/50 border border-slate-800 rounded">
                    <h5 className="text-[10px] text-cyan-accent font-bold uppercase mb-1">AES-256-GCM (Symmetric)</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Chosen for its hardware-accelerated performance and built-in integrity checks (GCM), ensuring data hasn't been tampered with during transmission.</p>
                  </div>
                  <div className="p-3 bg-navy-950/50 border border-slate-800 rounded">
                    <h5 className="text-[10px] text-cyan-accent font-bold uppercase mb-1">RSA-OAEP 4096 (Asymmetric)</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Utilized for secure key encapsulation. 4096-bit length provides long-term resistance against brute-force attacks.</p>
                  </div>
                  <div className="p-3 bg-navy-950/50 border border-slate-800 rounded">
                    <h5 className="text-[10px] text-cyan-accent font-bold uppercase mb-1">Adaptive LSB & DCT-Domain</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">Adaptive LSB maximizes capacity while minimizing visual artifacts. DCT-Domain embedding is selected for robustness against lossy compression.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest">Authors</h4>
                <p className="text-sm text-slate-300">M. Santhosh Kumar, R. Bharanidharan, N. Mohammed Aadhil, S. Pandy Keerthika</p>
                <p className="text-xs text-slate-500">Dept. of CSE (Cyber Security), Nandha Engineering College, Erode, India</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-navy-950 rounded-lg border border-cyan-accent/20 font-mono text-xs">
                <h4 className="text-cyan-accent mb-4 uppercase tracking-widest text-center">Architecture Workflow</h4>
                <div className="flex flex-col items-center gap-2">
                  <div className="px-3 py-1 border border-cyan-accent/40 rounded">Message</div>
                  <div className="text-cyan-accent">↓</div>
                  <div className="px-3 py-1 border border-cyan-accent/40 rounded bg-cyan-accent/10">AES-256-GCM (K_temp)</div>
                  <div className="text-cyan-accent">↓</div>
                  <div className="px-3 py-1 border border-cyan-accent/40 rounded bg-cyan-accent/10">VDF Time-Lock (T)</div>
                  <div className="text-cyan-accent">↓</div>
                  <div className="px-3 py-1 border border-cyan-accent/40 rounded bg-cyan-accent/10">Stego Engine (LSB)</div>
                  <div className="text-cyan-accent">↓</div>
                  <div className="px-3 py-1 border border-cyan-accent/40 rounded">Stego File</div>
                </div>
              </div>

              <div className="p-4 bg-navy-950/50 border border-slate-800 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Security Validation & Testing</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-success/10 rounded"><Shield className="w-3 h-3 text-success" /></div>
                    <div>
                      <h5 className="text-[10px] text-slate-300 font-bold uppercase">Steganalysis AUC Test</h5>
                      <p className="text-[9px] text-slate-500">Tested against RS Analysis and Chi-Square attacks. AUC score of ~0.502 indicates the stego-file is statistically indistinguishable from the carrier.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-success/10 rounded"><Clock className="w-3 h-3 text-success" /></div>
                    <div>
                      <h5 className="text-[10px] text-slate-300 font-bold uppercase">VDF Non-Parallelism Audit</h5>
                      <p className="text-[9px] text-slate-500">Verified that the sequential squaring operations cannot be accelerated via GPU parallelization, enforcing the mandatory time-lock.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-success/10 rounded"><Lock className="w-3 h-3 text-success" /></div>
                    <div>
                      <h5 className="text-[10px] text-slate-300 font-bold uppercase">NIST SP 800-22 Verification</h5>
                      <p className="text-[9px] text-slate-500">The AES-256-GCM implementation passed randomness and frequency tests, ensuring high-entropy ciphertext that resists pattern analysis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Performance Benchmarks</h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-2">Carrier</th>
                    <th className="pb-2">PSNR (dB)</th>
                    <th className="pb-2">SSIM</th>
                    <th className="pb-2">SNR (dB)</th>
                    <th className="pb-2">AUC (Steganalysis)</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2">Image (PNG)</td>
                    <td className="py-2 text-cyan-accent">{'>'}62.4</td>
                    <td className="py-2">0.9998</td>
                    <td className="py-2">-</td>
                    <td className="py-2">0.502</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-2">Audio (WAV)</td>
                    <td className="py-2">-</td>
                    <td className="py-2">-</td>
                    <td className="py-2 text-cyan-accent">{'>'}54.8</td>
                    <td className="py-2">0.511</td>
                  </tr>
                  <tr>
                    <td className="py-2">Video (MP4)</td>
                    <td className="py-2">58.2</td>
                    <td className="py-2 text-cyan-accent">0.9882</td>
                    <td className="py-2">-</td>
                    <td className="py-2">0.508</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-4">Key References</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-slate-500 font-mono">
              <p>1. Rivest, R. L., Shamir, A., & Wagner, D. A. (1996). Time-lock puzzles and timed-release crypto.</p>
              <p>2. Wesolowski, B. (2019). Efficient verifiable delay functions.</p>
              <p>3. Pietrzak, K. (2018). Simple verifiable delay functions.</p>
              <p>4. Boneh, D., et al. (2018). Verifiable Delay Functions.</p>
              <p>5. Johnson, N. F., & Jajodia, S. (1998). Exploring steganography: Seeing the unseen.</p>
              <p>6. Fridrich, J. (2009). Steganography in Digital Media.</p>
              <p>7. Cheddad, A., et al. (2010). Digital image steganography: Survey and analysis.</p>
              <p>8. Pevny, T., et al. (2010). Steganalysis by structural lsb detectors.</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
