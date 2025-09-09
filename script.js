class DigitalOceanWinnerWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // High DPI canvas setup for crisp rendering
        this.setupHighDPICanvas();
        
        this.participants = [];
        this.isSpinning = false;
        this.currentAngle = 0;
        this.spinAngle = 0;
        this.spinSpeed = 0;
        
        // Audio context for sound effects
        this.audioContext = null;
        this.spinningSound = null;
        this.soundEnabled = true;
        this.soundTheme = 'modern';
        this.clickInterval = null;
        this.lastSegment = -1;
        this.initAudio();
        
        // DigitalOcean brand colors for wheel segments
        this.colors = [
            '#0080FF', // DO Blue
            '#031B4E', // DO Dark Blue
            '#10B981', // Success Green
            '#F59E0B', // Warning Orange
            '#EF4444', // Error Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#84CC16', // Lime
            '#F97316', // Orange
            '#EC4899', // Pink
            '#6366F1', // Indigo
            '#14B8A6'  // Teal
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.initializeSoundDropdown();
        this.drawWheel();
    }
    
    setupHighDPICanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Set actual canvas size in memory (scaled up for high DPI)
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale the canvas back down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        this.ctx.scale(dpr, dpr);
        
        // Enable image smoothing for better text rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textRenderingOptimization = 'optimizeQuality';
        
        // Store display dimensions for calculations
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    initializeSoundDropdown() {
        // Set initial active option
        this.updateActiveOption();
        
        // Set initial button title
        this.soundBtn.title = 'Sound Options';
    }
    
    playSpinSound() {
        if (!this.audioContext || !this.soundEnabled || this.soundTheme === 'none') return;
        
        switch (this.soundTheme) {
            case 'modern':
                this.playModernSpinSound();
                break;
            case 'classic':
                this.startClassicWheelSound();
                break;
            case 'arcade':
                this.playArcadeSpinSound();
                break;
            case 'minimal':
                this.playMinimalSpinSound();
                break;
        }
    }
    
    playModernSpinSound() {
        // Original whoosh sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 3);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 3);
        
        this.spinningSound = oscillator;
    }
    
    startClassicWheelSound() {
        // Wheel of Fortune style clicking - start clicking rapidly and slow down
        this.stopClassicWheelSound(); // Clear any existing interval
        
        let clickSpeed = 50; // Start with fast clicks (50ms interval)
        const maxSpeed = 300; // Slow down to 300ms interval
        
        this.clickInterval = setInterval(() => {
            this.playClickSound();
            
            // Gradually slow down the clicking
            clickSpeed += 8;
            if (clickSpeed >= maxSpeed) {
                clickSpeed = maxSpeed;
            }
            
            // Update the interval timing
            clearInterval(this.clickInterval);
            if (this.isSpinning && clickSpeed < 400) {
                this.clickInterval = setInterval(() => {
                    this.playClickSound();
                }, clickSpeed);
            }
        }, clickSpeed);
    }
    
    playClickSound() {
        if (!this.audioContext || !this.soundEnabled) return;
        
        // Sharp click sound like wheel segments hitting a clicker
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    stopClassicWheelSound() {
        if (this.clickInterval) {
            clearInterval(this.clickInterval);
            this.clickInterval = null;
        }
    }
    
    playArcadeSpinSound() {
        // Fun arcade-style sound with rising and falling tones
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'triangle';
                const baseFreq = 220 + (i * 110);
                oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + 0.2);
                oscillator.frequency.linearRampToValueAtTime(baseFreq * 0.7, this.audioContext.currentTime + 0.4);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);
            }, i * 150);
        }
    }
    
    playMinimalSpinSound() {
        // Simple beep that fades
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 1.5);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.5);
    }
    
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    playWinnerSound() {
        if (!this.audioContext || !this.soundEnabled || this.soundTheme === 'none') return;
        
        // Stop any ongoing clicking sounds
        this.stopClassicWheelSound();
        
        switch (this.soundTheme) {
            case 'modern':
            case 'classic':
                this.playClassicWinnerSound();
                break;
            case 'arcade':
                this.playArcadeWinnerSound();
                break;
            case 'minimal':
                this.playMinimalWinnerSound();
                break;
        }
    }
    
    playClassicWinnerSound() {
        // Create celebratory winner sound
        const playNote = (frequency, startTime, duration = 0.2) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // Play a celebratory chord progression
        const now = this.audioContext.currentTime;
        playNote(523.25, now); // C5
        playNote(659.25, now + 0.1); // E5
        playNote(783.99, now + 0.2); // G5
        playNote(1046.50, now + 0.3, 0.4); // C6
    }
    
    playArcadeWinnerSound() {
        // Upbeat arcade victory sound
        const frequencies = [440, 554, 659, 880, 1109, 1318];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.12, this.audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.15);
            }, i * 80);
        });
    }
    
    playMinimalWinnerSound() {
        // Simple success beeps
        [440, 554, 659].forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, i * 150);
        });
    }
    
    initializeElements() {
        this.spinButton = document.getElementById('spinButton');
        this.participantInput = document.getElementById('participantInput');
        this.addNamesBtn = document.getElementById('addNamesBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.participantsList = document.getElementById('participantsList');
        this.participantCount = document.getElementById('participantCount');
        this.winnerModal = document.getElementById('winnerModal');
        this.winnerName = document.getElementById('winnerName');
        this.removeWinnerBtn = document.getElementById('removeWinnerBtn');
        this.keepWinnerBtn = document.getElementById('keepWinnerBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.soundBtn = document.getElementById('soundBtn');
        this.soundDropdown = document.getElementById('soundDropdown');
    }
    
    bindEvents() {
        this.spinButton.addEventListener('click', () => this.spin());
        this.addNamesBtn.addEventListener('click', () => this.addNames());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.shuffleBtn.addEventListener('click', () => this.shuffle());
        this.removeWinnerBtn.addEventListener('click', () => this.removeWinner());
        this.keepWinnerBtn.addEventListener('click', () => this.closeModal());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.soundBtn.addEventListener('click', (e) => this.toggleSoundDropdown(e));
        
        // Sound dropdown option clicks
        document.querySelectorAll('.sound-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = option.getAttribute('data-theme');
                this.selectSoundTheme(theme);
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sound-dropdown-container')) {
                this.hideSoundDropdown();
            }
        });
        
        // Allow Enter key to add names
        this.participantInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.addNames();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.winnerModal.classList.contains('show')) {
                this.closeModal();
            }
        });
        
        // Handle fullscreen changes (including F11, browser controls, etc.)
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement) {
                document.body.classList.add('fullscreen-mode');
            } else {
                document.body.classList.remove('fullscreen-mode');
            }
        });
    }
    
    addNames() {
        const input = this.participantInput.value.trim();
        if (!input) return;
        
        // Split by newlines or commas and clean up
        const newNames = input
            .split(/[,\n]/)
            .map(name => name.trim())
            .filter(name => name.length > 0)
            .filter(name => !this.participants.includes(name));
        
        if (newNames.length === 0) {
            this.showNotification('No new names to add', 'warning');
            return;
        }
        
        this.participants.push(...newNames);
        this.participantInput.value = '';
        this.updateParticipantsList();
        this.drawWheel();
        
        this.showNotification(`Added ${newNames.length} participant(s)`, 'success');
    }
    
    clearAll() {
        if (this.participants.length === 0) return;
        
        if (confirm('Are you sure you want to clear all participants?')) {
            this.participants = [];
            this.updateParticipantsList();
            this.drawWheel();
            this.showNotification('All participants cleared', 'info');
        }
    }
    
    shuffle() {
        if (this.participants.length < 2) return;
        
        for (let i = this.participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.participants[i], this.participants[j]] = [this.participants[j], this.participants[i]];
        }
        
        this.updateParticipantsList();
        this.drawWheel();
        this.showNotification('Participants shuffled', 'info');
    }
    
    removeParticipant(name) {
        const index = this.participants.indexOf(name);
        if (index > -1) {
            this.participants.splice(index, 1);
            this.updateParticipantsList();
            this.drawWheel();
            this.showNotification(`Removed ${name}`, 'info');
        }
    }
    
    updateParticipantsList() {
        this.participantCount.textContent = this.participants.length;
        
        if (this.participants.length === 0) {
            this.participantsList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <p>Add participants to get started</p>
                </div>
            `;
            this.spinButton.disabled = true;
            return;
        }
        
        this.spinButton.disabled = false;
        
        const participantsHTML = this.participants
            .map(name => `
                <div class="participant-item">
                    <span class="participant-name">${this.escapeHtml(name)}</span>
                    <button class="remove-participant" onclick="wheel.removeParticipant('${this.escapeHtml(name)}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            `)
            .join('');
        
        this.participantsList.innerHTML = participantsHTML;
    }
    
    drawWheel() {
        const centerX = this.displayWidth / 2;
        const centerY = this.displayHeight / 2;
        const radius = Math.min(centerX, centerY) - 5; // Reduced margin for less whitespace
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        
        if (this.participants.length === 0) {
            // Draw empty wheel
            this.drawEmptyWheel(centerX, centerY, radius);
            return;
        }
        
        const anglePerSegment = (2 * Math.PI) / this.participants.length;
        
        // Draw center circle FIRST
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.strokeStyle = '#0080FF';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Draw segments on top
        this.participants.forEach((participant, index) => {
            const startAngle = (index * anglePerSegment) + this.currentAngle;
            const endAngle = ((index + 1) * anglePerSegment) + this.currentAngle;
            
            // Draw segment (donut shape starting just outside center circle)
            const innerRadius = 52; // Start just outside the center circle
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            this.ctx.closePath();
            
            // Create gradient for each segment
            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const color = this.colors[index % this.colors.length];
            gradient.addColorStop(0, this.lightenColor(color, 0.3));
            gradient.addColorStop(1, color);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add subtle border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw text
            this.drawSegmentText(participant, centerX, centerY, radius * 0.7, startAngle, endAngle);
        });
    }
    
    drawEmptyWheel(centerX, centerY, radius) {
        // Draw empty wheel with DO branding
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#EBF5FF');
        gradient.addColorStop(1, '#CBD5E1');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#0080FF';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // Draw placeholder text
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = 'bold 24px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Add participants', centerX, centerY - 10);
        this.ctx.font = '18px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.fillText('to start spinning!', centerX, centerY + 20);
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.strokeStyle = '#0080FF';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
    
    drawSegmentText(text, centerX, centerY, textRadius, startAngle, endAngle) {
        const midAngle = (startAngle + endAngle) / 2;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        this.ctx.save();
        this.ctx.translate(textX, textY);
        this.ctx.rotate(midAngle + (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2 ? Math.PI : 0));
        
        // Enhanced text rendering settings
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 18px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Improved text rendering with better shadow
        this.ctx.strokeText(text, 0, 0);
        this.ctx.fillText(text, 0, 0);
        
        this.ctx.restore();
    }
    
    spin() {
        if (this.isSpinning || this.participants.length === 0) return;
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.innerHTML = `
            <svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38"/>
            </svg>
            SPINNING...
        `;
        
        // Reset arrow color to default blue
        const pointer = document.querySelector('.wheel-pointer');
        if (pointer) {
            pointer.style.borderTopColor = '#0080FF';
        }
        
        // Play spinning sound effect
        this.resumeAudioContext();
        this.playSpinSound();
        
        // Random spin: 4-8 full rotations plus random angle for more suspense
        const fullRotations = Math.random() * 4 + 4;
        const randomAngle = Math.random() * 2 * Math.PI;
        this.spinAngle = (fullRotations * 2 * Math.PI) + randomAngle;
        this.spinSpeed = 0.4; // Higher initial speed for longer spin
        
        this.animateSpin();
    }
    
    animateSpin() {
        if (this.spinSpeed > 0.005) { // Lower threshold for longer spin
            this.currentAngle += this.spinSpeed;
            this.spinSpeed *= 0.985; // Slower deceleration for more suspense
            this.drawWheel();
            requestAnimationFrame(() => this.animateSpin());
        } else {
            this.finishSpin();
        }
    }
    
    finishSpin() {
        this.isSpinning = false;
        this.spinButton.disabled = false;
        this.spinButton.innerHTML = `
            <svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38"/>
            </svg>
            SPIN THE WHEEL
        `;
        
        // Calculate winner - arrow points at top (0 degrees / -π/2 in canvas coordinates)
        const anglePerSegment = (2 * Math.PI) / this.participants.length;
        // The arrow points at -π/2 (top), so we need to find which segment is at that position
        // Since segments start at angle (index * anglePerSegment) + this.currentAngle
        // We need to find the index where: (index * anglePerSegment) + this.currentAngle ≈ -π/2
        const targetAngle = -Math.PI/2; // Top position where arrow points
        let normalizedCurrentAngle = this.currentAngle % (2 * Math.PI);
        if (normalizedCurrentAngle < 0) normalizedCurrentAngle += 2 * Math.PI;
        
        // Find which segment covers the target angle
        let winnerIndex = 0;
        for (let i = 0; i < this.participants.length; i++) {
            let segmentStart = (i * anglePerSegment + normalizedCurrentAngle) % (2 * Math.PI);
            let segmentEnd = ((i + 1) * anglePerSegment + normalizedCurrentAngle) % (2 * Math.PI);
            
            // Handle wrap-around case
            let normalizedTarget = (targetAngle + 2 * Math.PI) % (2 * Math.PI);
            
            if (segmentEnd < segmentStart) {
                // Segment wraps around 0
                if (normalizedTarget >= segmentStart || normalizedTarget < segmentEnd) {
                    winnerIndex = i;
                    break;
                }
            } else {
                // Normal case
                if (normalizedTarget >= segmentStart && normalizedTarget < segmentEnd) {
                    winnerIndex = i;
                    break;
                }
            }
        }
        
        const winner = this.participants[winnerIndex];
        
        // Change arrow color to match winning segment
        this.updateArrowColor(winnerIndex);
        
        // Stop any spinning sounds
        this.stopClassicWheelSound();
        
        // Play winner celebration sound
        this.playWinnerSound();
        
        this.showWinner(winner);
    }
    
    updateArrowColor(winnerIndex) {
        const winnerColor = this.colors[winnerIndex % this.colors.length];
        const pointer = document.querySelector('.wheel-pointer');
        if (pointer) {
            pointer.style.borderTopColor = winnerColor;
        }
    }
    
    showWinner(winner) {
        this.currentWinner = winner;
        this.winnerName.textContent = winner;
        this.winnerModal.classList.add('show');
        
        // Add confetti effect
        this.createConfetti();
    }
    
    removeWinner() {
        if (this.currentWinner) {
            this.removeParticipant(this.currentWinner);
            this.currentWinner = null;
            this.closeModal();
        }
    }
    
    closeModal() {
        this.winnerModal.classList.remove('show');
        this.currentWinner = null;
    }
    
    createConfetti() {
        // Simple confetti animation
        const confettiCount = 50;
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        
        document.body.appendChild(confettiContainer);
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
        }
        
        // Add CSS animation
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove confetti after animation
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 5000);
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            
            // Hide sidebar in fullscreen
            document.body.classList.add('fullscreen-mode');
        } else {
            document.exitFullscreen();
            
            // Show sidebar when exiting fullscreen
            document.body.classList.remove('fullscreen-mode');
        }
    }
    
    toggleSoundDropdown(e) {
        e.stopPropagation();
        const isVisible = this.soundDropdown.classList.contains('show');
        
        if (isVisible) {
            this.hideSoundDropdown();
        } else {
            this.showSoundDropdown();
        }
    }
    
    showSoundDropdown() {
        this.soundDropdown.classList.add('show');
        // Update active option
        this.updateActiveOption();
    }
    
    hideSoundDropdown() {
        this.soundDropdown.classList.remove('show');
    }
    
    updateActiveOption() {
        document.querySelectorAll('.sound-option').forEach(option => {
            option.classList.remove('active');
            const checkmark = option.querySelector('.sound-option-check');
            if (checkmark) checkmark.style.opacity = '0';
        });
        
        const activeOption = document.querySelector(`[data-theme="${this.soundTheme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
            const checkmark = activeOption.querySelector('.sound-option-check');
            if (checkmark) checkmark.style.opacity = '1';
        }
    }
    
    selectSoundTheme(theme) {
        // Stop any ongoing sounds
        this.stopClassicWheelSound();
        
        this.soundTheme = theme;
        
        // Update sound enabled state based on theme
        if (theme === 'none') {
            this.soundEnabled = false;
            const soundOnIcon = document.getElementById('soundOnIcon');
            const soundOffIcon = document.getElementById('soundOffIcon');
            soundOnIcon.style.display = 'none';
            soundOffIcon.style.display = 'block';
            this.soundBtn.title = 'Sound Options (Muted)';
        } else {
            this.soundEnabled = true;
            const soundOnIcon = document.getElementById('soundOnIcon');
            const soundOffIcon = document.getElementById('soundOffIcon');
            soundOnIcon.style.display = 'block';
            soundOffIcon.style.display = 'none';
            this.soundBtn.title = 'Sound Options';
        }
        
        // Update active option
        this.updateActiveOption();
        
        // Close dropdown
        this.hideSoundDropdown();
        
        // Show notification
        const themeNames = {
            'modern': 'Modern Whoosh',
            'classic': 'Classic Wheel',
            'arcade': 'Arcade Style',
            'minimal': 'Minimal Beeps',
            'none': 'No Sound'
        };
        
        this.showNotification(`Sound theme: ${themeNames[theme]}`, 'info');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : type === 'error' ? '#EF4444' : '#0080FF'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            z-index: 1001;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the wheel when the page loads
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new DigitalOceanWinnerWheel();
    
    // Add sample participants for demo - perfect for conferences!
    const sampleNames = [
        'Alex Rivera',
        'Jordan Kim', 
        'Casey Thompson',
        'Morgan Chen',
        'Riley Johnson',
        'Avery Rodriguez',
        'Dakota Williams',
        'Phoenix Martinez',
        'Sage Davis',
        'River Anderson',
        'Quinn Taylor',
        'Emery Wilson'
    ];
    
    // Load sample data automatically for conference demos
    wheel.participants = sampleNames;
    wheel.updateParticipantsList();
    wheel.drawWheel();
});