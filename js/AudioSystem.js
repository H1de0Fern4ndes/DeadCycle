class AudioSystem {
    static init() {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    static playShoot() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    static playExplosion() {
        if (!this.ctx) return;
        let node = this.ctx.createBufferSource();
        let buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
        node.buffer = buffer;
        let gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        node.connect(gain);
        gain.connect(this.ctx.destination);
        node.start();
    }

    static playCoin() {
        if (!this.ctx) return;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // Nota B5
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // Nota E6
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    static playLevelUp() {
        if (!this.ctx) return;
        let notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (idx * 0.08));
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime + (idx * 0.08));
            gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + (idx * 0.08) + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + (idx * 0.08));
            osc.stop(this.ctx.currentTime + (idx * 0.08) + 0.15);
        });
    }
}