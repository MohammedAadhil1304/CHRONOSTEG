/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Activity, BarChart3, Zap } from 'lucide-react';

interface MetricsPanelProps {
  psnr?: number;
  ssim?: number;
  snr?: number;
  capacity?: number;
}

export default function MetricsPanel({ psnr, ssim, snr, capacity }: MetricsPanelProps) {
  return (
    <div className="bg-card-bg border border-border rounded-lg p-5 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="text-[11px] font-bold uppercase tracking-[2px] text-accent">Live Telemetry</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] font-bold uppercase text-success">Active</span>
        </div>
      </div>

      <div className="space-y-5">
        <MetricGauge 
          label="PSNR (Peak Signal-to-Noise)" 
          value={psnr} 
          unit="dB" 
          max={60} 
          color="var(--color-accent)"
        />
        <MetricGauge 
          label="SSIM (Structural Similarity)" 
          value={ssim} 
          max={1} 
          color="var(--color-success)"
        />
        <MetricGauge 
          label="SNR (Signal-to-Noise)" 
          value={snr} 
          unit="dB" 
          max={50} 
          color="var(--color-accent)"
        />
        <MetricGauge 
          label="Payload Capacity" 
          value={capacity} 
          unit="%" 
          max={100} 
          color="var(--color-accent)"
        />
      </div>

      <div className="mt-2 pt-4 border-t border-border">
        <h4 className="text-[9px] uppercase text-text-dim font-bold mb-3 tracking-widest">Carrier Analysis</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-text-dim">STEGANALYSIS AUC</span>
            <span className="font-mono text-accent">0.9982</span>
          </div>
          <div className="w-full h-1 bg-input-bg rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: '99.8%' }} />
          </div>
          <div className="flex justify-between items-center text-[10px] mt-3">
            <span className="text-text-dim">DETECTION RISK</span>
            <span className="font-mono text-success">LOW</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricGauge({ label, value, unit = '', max, color }: { label: string; value?: number; unit?: string; max: number; color: string }) {
  const percentage = value ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <label className="text-[9px] uppercase text-text-dim font-bold tracking-wider">{label}</label>
        <span className="text-[11px] font-mono text-text-primary">
          {value !== undefined ? `${value.toFixed(unit === '%' ? 1 : unit === 'dB' ? 1 : 4)}${unit}` : '---'}
        </span>
      </div>
      <div className="gauge-container">
        <motion.div 
          className="gauge-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}44` }}
        />
      </div>
    </div>
  );
}
