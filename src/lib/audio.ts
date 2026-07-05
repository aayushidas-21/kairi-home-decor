/**
 * Web Audio API synthesizer for premium, zero-asset UI sound feedback.
 * Synthesized dynamically in the browser to avoid network lag, bandwidth usage, and assets bloat.
 */

// Premium physical haptic tap feedback (fast pitch-decayed low frequency sine wave)
export const playPremiumTap = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    // Decays rapidly from 140Hz to 60Hz in 65ms for a subtle physical "tap/thud"
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.065);
    
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.065);
  } catch (e) {
    // AudioContext might be blocked until user interacts, which is handled gracefully
    console.debug("AudioContext tap feedback blocked/not supported:", e);
  }
};

// Premium success chime (overlapping dual-tone high frequency sine waves, like Apple Pay confirmation)
export const playPremiumChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.start(start);
      osc.stop(start + duration);
    };
    
    // First tone (G5) then a second, brighter tone (C6) shortly after
    playTone(783.99, now, 0.22, 0.08); 
    playTone(1046.50, now + 0.06, 0.32, 0.08);
  } catch (e) {
    console.debug("AudioContext chime feedback blocked/not supported:", e);
  }
};
