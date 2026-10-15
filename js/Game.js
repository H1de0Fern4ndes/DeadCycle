class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = 'MENU'; // Começa no menu de seleção
        this.wave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.freezeTimer = 0;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        this.selectedClassId = 'soldier';
        this.player = null;
        this.zombies = [];
        this.particles = [];
        this.projectiles = [];
        this.xpOrbs = [];
        this.goldOrbs = [];
        this.itemLoot = [];
        this.powerups = [];
        this.barrels = [];
        this.damageTexts = [];
        this.summons = [];
        this.mapDecorations = [];
        this.bossChestActive = false;
        this.rouletteItems = [];

        this.keys = {};
        this.initInputs();
        this.generateMapDecorations();
        UI.renderClassSelect();
    }

    startGame(classId) {
        AudioSystem.init();
        this.selectedClassId = classId;
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2, classId);
        this.state = 'PLAYING';
        document.getElementById('menuModal').style.display = 'none';
        this.spawnBarrels(4);
    }

    initInputs() {
        window.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'i') UI.toggleInventory();
            if (e.key.toLowerCase() === 'b') UI.toggleShop();
            if (e.key.toLowerCase() === 'm') UI.toggleMetaShop();
        });
        window.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);
    }

    triggerShake(duration, intensity) {
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    generateMapDecorations() {
        for (let i = 0; i < 35; i++) {
            this.mapDecorations.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 2,
                type: Math.random() > 0.5 ? 'crack' : 'pebble'
            });
        }
    }

    spawnBarrels(count) {
        for (let i = 0; i < count; i++) {
            this.barrels.push({
                x: 100 + Math.random() * (this.canvas.width - 200),
                y: 100 + Math.random() * (this.canvas.height - 200)
            });
        }
    }

    addDamageText(x, y, damage, color = '#f1c40f', prefix = '') {
        this.damageTexts.push({ x, y, text: `${prefix}${damage}`, life: 30, color });
    }

    spawnZombie() {
        if (this.wave % 5 === 0 && !this.zombies.some(z => z.type === 'BOSS')) {
            this.zombies.push(new Zombie(this.canvas.width / 2, -40, this.wave, 'BOSS'));
            return;
        }

        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * this.canvas.width; y = -20; }
        else if (side === 1) { x = this.canvas.width + 20; y = Math.random() * this.canvas.height; }
        else if (side === 2) { x = Math.random() * this.canvas.width; y = this.canvas.height + 20; }
        else { x = -20; y = Math.random() * this.canvas.height; }

        let rand = Math.random();
        let type = 'NORMAL';
        if (rand < 0.25) type = 'RUNNER';
        else if (rand < 0.40) type = 'TANK';
        else if (rand < 0.50) type = 'BLOATER';

        this.zombies.push(new Zombie(x, y, this.wave, type));
    }

    createExplosion(x, y, radius, damage) {
        this.triggerShake(12, 6);
        AudioSystem.playExplosion();
        this.particles.push({ x: x, y: y, radius: radius, life: 15, color: '#e67e22' });
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            let z = this.zombies[i];
            if (Math.hypot(z.x - x, z.y - y) <= radius) {
                z.hp -= damage;
                this.addDamageText(z.x, z.y, Math.round(damage), '#e67e22');
                if (z.hp <= 0) this.killZombie(i, true);
            }
        }
    }

    createPushWave(x, y, radius) {
        this.triggerShake(8, 4);
        this.particles.push({ x: x, y: y, radius: radius, life: 10, color: '#3498db' });
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            let z = this.zombies[i];
            if (Math.hypot(z.x - x, z.y - y) <= radius) {
                let angle = Math.atan2(z.y - y, z.x - x);
                z.x += Math.cos(angle) * 70;
                z.y += Math.sin(angle) * 70;
                z.hp -= 15;
                this.addDamageText(z.x, z.y, 15, '#3498db');
                if (z.hp <= 0) this.killZombie(i);
            }
        }
    }

    spawnDrone(x, y, isEvolved) {
        this.summons.push({ type: 'drone', x, y, timer: isEvolved ? 700 : 480, cd: 0, isEvolved });
    }

    spawnTurret(x, y, isEvolved) {
        this.summons.push({ type: 'turret', x, y, timer: isEvolved ? 800 : 600, cd: 0, isEvolved });
    }

    triggerFrostNova(isEvolved) {
        this.particles.push({ x: 400, y: 300, radius: 500, life: 20, color: 'rgba(52, 152, 219, 0.4)' });
        for (let z of this.zombies) {
            z.applySlow(isEvolved ? 0.95 : 0.8);
            z.hp -= isEvolved ? 50 : 20;
            this.addDamageText(z.x, z.y, isEvolved ? 50 : 20, '#3498db');
        }
    }

    fireBeam(x, y, dir, isEvolved) {
        this.triggerShake(10, 5);
        let bx = x;
        let by = y;
        for (let i = 0; i < (isEvolved ? 60 : 40); i++) {
            bx += dir.dx * 15;
            by += dir.dy * 15;
            this.particles.push({ x: bx, y: by, radius: isEvolved ? 12 : 8, life: 10, color: isEvolved ? '#f1c40f' : '#9b59b6' });
            for (let j = this.zombies.length - 1; j >= 0; j--) {
                let z = this.zombies[j];
                if (Math.hypot(z.x - bx, z.y - by) < (isEvolved ? 30 : 20)) {
                    let dmg = this.player.attackPower * (isEvolved ? 2.5 : 1.5);
                    z.hp -= dmg;
                    this.addDamageText(z.x, z.y, Math.round(dmg), '#9b59b6');
                    if (z.hp <= 0) this.killZombie(j);
                }
            }
        }
    }

    fireMissiles(count) {
        for (let i = 0; i < count; i++) {
            if (this.zombies.length > 0) {
                let target = this.zombies[Math.floor(Math.random() * this.zombies.length)];
                this.createExplosion(target.x, target.y, 50, this.player.attackPower * 2);
            }
        }
    }

    killZombie(index, isFromExplosion = false) {
        let z = this.zombies[index];
        if (!z) return;

        if (z.type === 'BOSS') {
            this.triggerBossChest();
        }

        if (z.type === 'BLOATER' && !isFromExplosion) {
            this.zombies.splice(index, 1);
            this.createExplosion(z.x, z.y, 60, 30);
        } else {
            this.zombies.splice(index, 1);
        }

        this.mapDecorations.push({ x: z.x, y: z.y, size: Math.random() * 6 + 3, type: 'blood' });

        let xpVal = z.type === 'BOSS' ? 1 : (z.type === 'TANK' ? 12 : 5);
        let xpBonusMult = 1 + (this.player.metaStats.xpBonus * CONFIG.META_UPGRADES.xpBonus.val / 100);
        this.xpOrbs.push({ x: z.x, y: z.y, value: Math.round(xpVal * xpBonusMult) });

        if (Math.random() < 0.7) {
            this.goldOrbs.push({ x: z.x, y: z.y, value: z.type === 'BOSS' ? 100 : Math.floor(Math.random() * 5) + 3 });
        }

        let lootChance = 0.18 + (this.player.metaStats.lootBonus * CONFIG.META_UPGRADES.lootBonus.val / 100);
        if (z.type === 'BOSS' || Math.random() < lootChance) {
            const itemGenerated = ItemFactory.generateLoot();
            if (itemGenerated) this.itemLoot.push({ x: z.x, y: z.y, item: itemGenerated });
        }

        if (Math.random() < 0.05) {
            let pTypes = ['MAGNET', 'NUKE', 'FREEZE'];
            this.powerups.push({ x: z.x, y: z.y, type: pTypes[Math.floor(Math.random() * pTypes.length)] });
        }

        let vampLvl = this.player.getPassiveLevel('vampirism');
        if (vampLvl > 0) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + (vampLvl * 2));
        }
    }

    triggerBossChest() {
        this.state = 'ROULETTE';
        this.rouletteItems = [];
        for (let i = 0; i < 3; i++) {
            let item = ItemFactory.generateLoot();
            if (item) this.rouletteItems.push(item);
        }
        UI.renderRouletteModal(this.rouletteItems);
    }

    claimRouletteItem(index) {
        let item = this.rouletteItems[index];
        if (item && this.player.inventory.length < 12) {
            this.player.inventory.push(item);
        }
        document.getElementById('rouletteModal').style.display = 'none';
        this.state = 'PLAYING';
    }

    triggerPowerup(type) {
        if (type === 'MAGNET') {
            for (let orb of this.xpOrbs) { orb.x = this.player.x; orb.y = this.player.y; }
            for (let gold of this.goldOrbs) { gold.x = this.player.x; gold.y = this.player.y; }
        } else if (type === 'NUKE') {
            this.triggerShake(15, 8);
            for (let i = this.zombies.length - 1; i >= 0; i--) {
                if (this.zombies[i] && this.zombies[i].type !== 'BOSS') {
                    this.killZombie(i);
                }
            }
        } else if (type === 'FREEZE') {
            this.freezeTimer = 300;
        }
    }

    levelUp() {
        AudioSystem.playLevelUp();
        this.player.level++;
        this.player.xp = 0;
        this.player.maxXp = Math.floor(this.player.maxXp * 1.5);
        this.state = 'LEVELUP';

        const modal = document.getElementById('levelUpModal');
        const optionsDiv = document.getElementById('upgradeOptions');
        optionsDiv.innerHTML = '';

        const statUpgrades = [
            { title: '+6 Dano Base', desc: 'Aumenta o ataque base', apply: () => this.player.baseAttackPower += 6 },
            { title: '-3 Cooldown Ataque', desc: 'Atira mais rápido', apply: () => this.player.attackCooldown = Math.max(8, this.player.attackCooldown - 3) },
            { title: '+30 HP & Cura Total', desc: 'Aumenta a vida máxima', apply: () => { this.player.baseMaxHp += 30; this.player.hp = this.player.maxHp; } },
            { title: '+0.5 Velocidade', desc: 'Aumenta mobilidade', apply: () => this.player.baseSpeed += 0.5 }
        ];

        const availablePassives = CONFIG.PASSIVES.filter(pas => {
            let currentLvl = this.player.getPassiveLevel(pas.id);
            return currentLvl < pas.maxLevel;
        }).map(pas => {
            let nextLvl = this.player.getPassiveLevel(pas.id) + 1;
            return {
                title: `Passiva: ${pas.name} (Lvl ${nextLvl})`,
                desc: pas.getDesc(nextLvl),
                apply: () => this.player.addOrUpgradePassive(pas.id)
            };
        });

        const pool = [...statUpgrades, ...availablePassives];
        let shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);

        shuffled.forEach(up => {
            let btn = document.createElement('button');
            btn.className = 'upgrade-btn';
            btn.innerHTML = `<b>${up.title}</b><br><small style="font-size:10px">${up.desc}</small>`;
            btn.onclick = () => {
                up.apply();
                this.player.recalculateStats();
                modal.style.display = 'none';
                this.state = 'PLAYING';
            };
            optionsDiv.appendChild(btn);
        });

        modal.style.display = 'block';
    }

    update() {
        if (this.state !== 'PLAYING') return;

        if (this.shakeTimer > 0) this.shakeTimer--;
        if (this.freezeTimer > 0) this.freezeTimer--;

        this.player.update(this.keys, null, this);

        let cdMult = this.player.adrenalinTimer > 0 ? 0.5 : 1.0;
        if (this.player.cooldownTimer <= 0) {
            let nearestZombie = null;
            let minDist = this.player.attackRange;

            for (let z of this.zombies) {
                let dist = Math.hypot(z.x - this.player.x, z.y - this.player.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearestZombie = z;
                }
            }

            if (nearestZombie) {
                AudioSystem.playShoot();
                let angle = Math.atan2(nearestZombie.y - this.player.y, nearestZombie.x - this.player.x);
                let ricochetLvl = this.player.getPassiveLevel('ricochet');

                this.projectiles.push({
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angle) * 12,
                    vy: Math.sin(angle) * 12,
                    damage: this.player.attackPower,
                    bouncesLeft: ricochetLvl,
                    hitZombies: [],
                    life: 30
                });
                this.player.cooldownTimer = Math.round(this.player.attackCooldown * cdMult);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            this.particles.push({ x: p.x, y: p.y, radius: 2, life: 6, color: 'rgba(241, 196, 15, 0.6)' });

            for (let bIndex = this.barrels.length - 1; bIndex >= 0; bIndex--) {
                let b = this.barrels[bIndex];
                if (Math.hypot(b.x - p.x, b.y - p.y) < 15) {
                    this.createExplosion(b.x, b.y, 90, 80);
                    this.barrels.splice(bIndex, 1);
                    this.projectiles.splice(i, 1);
                    break;
                }
            }

            if (!this.projectiles[i]) continue;

            for (let j = this.zombies.length - 1; j >= 0; j--) {
                let z = this.zombies[j];
                if (!p.hitZombies.includes(z) && Math.hypot(z.x - p.x, z.y - p.y) < z.radius + 4) {
                    
                    let critLvl = this.player.getPassiveLevel('crit');
                    let isCrit = Math.random() < ((critLvl * 0.08) + this.player.extraCritChance);
                    let finalDamage = isCrit ? p.damage * 2 : p.damage;

                    z.hp -= finalDamage;
                    p.hitZombies.push(z);

                    this.addDamageText(z.x, z.y, Math.round(finalDamage), isCrit ? '#e74c3c' : '#f1c40f', isCrit ? 'CRÍTICO! ' : '');
                    this.particles.push({ x: p.x, y: p.y, radius: 5, life: 5, color: '#e74c3c' });

                    let poisonLvl = this.player.getPassiveLevel('poison');
                    if (poisonLvl > 0) z.applyPoison(poisonLvl * 4);

                    let slowLvl = this.player.getPassiveLevel('slow');
                    if (slowLvl > 0) z.applySlow(slowLvl * 0.12);

                    if (p.bouncesLeft > 0) {
                        p.bouncesLeft--;
                        let nextTarget = null;
                        let nextDist = 180;

                        for (let otherZ of this.zombies) {
                            if (!p.hitZombies.includes(otherZ)) {
                                let d = Math.hypot(otherZ.x - z.x, otherZ.y - z.y);
                                if (d < nextDist) {
                                    nextDist = d;
                                    nextTarget = otherZ;
                                }
                            }
                        }

                        if (nextTarget) {
                            let nAngle = Math.atan2(nextTarget.y - z.y, nextTarget.x - z.x);
                            p.vx = Math.cos(nAngle) * 12;
                            p.vy = Math.sin(nAngle) * 12;
                            p.life = 25;
                        } else {
                            this.projectiles.splice(i, 1);
                        }
                    } else {
                        this.projectiles.splice(i, 1);
                    }

                    if (z.hp <= 0) this.killZombie(j);
                    break;
                }
            }

            if (p && p.life <= 0) this.projectiles.splice(i, 1);
        }

        for (let i = this.summons.length - 1; i >= 0; i--) {
            let s = this.summons[i];
            s.timer--;
            s.cd--;

            if (s.type === 'drone') {
                s.x = this.player.x + Math.cos(s.timer * 0.05) * 40;
                s.y = this.player.y + Math.sin(s.timer * 0.05) * 40;
            }

            if (s.cd <= 0 && this.zombies.length > 0) {
                let target = this.zombies[0];
                let angle = Math.atan2(target.y - s.y, target.x - s.x);
                this.projectiles.push({
                    x: s.x, y: s.y,
                    vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10,
                    damage: s.isEvolved ? 25 : 12, bouncesLeft: 0, hitZombies: [], life: 20
                });
                s.cd = s.isEvolved ? 10 : 20;
            }

            if (s.timer <= 0) this.summons.splice(i, 1);
        }

        for (let i = this.zombies.length - 1; i >= 0; i--) {
            let z = this.zombies[i];
            let dist = z.update(this.player, this);

            if (dist < this.player.radius + z.radius && !this.player.isShielded) {
                this.player.hp -= 0.4;
                this.triggerShake(4, 3);
                if (this.player.hp <= 0) {
                    this.player.metaStats.totalGold += this.player.gold;
                    localStorage.setItem('zombie_meta_upgrades', JSON.stringify(this.player.metaStats));
                    this.state = 'GAMEOVER';
                }
            }
        }

        for (let i = this.powerups.length - 1; i >= 0; i--) {
            let pu = this.powerups[i];
            if (pu && Math.hypot(this.player.x - pu.x, this.player.y - pu.y) < this.player.radius + 15) {
                let pType = pu.type;
                this.powerups.splice(i, 1);
                this.triggerPowerup(pType);
            }
        }

        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            let orb = this.xpOrbs[i];
            if (Math.hypot(this.player.x - orb.x, this.player.y - orb.y) < this.player.radius + 15) {
                this.player.xp += orb.value;
                this.xpOrbs.splice(i, 1);
                if (this.player.xp >= this.player.maxXp) this.levelUp();
            }
        }

        for (let i = this.goldOrbs.length - 1; i >= 0; i--) {
            let gold = this.goldOrbs[i];
            if (Math.hypot(this.player.x - gold.x, this.player.y - gold.y) < this.player.radius + 15) {
                AudioSystem.playCoin();
                this.player.gold += gold.value;
                this.goldOrbs.splice(i, 1);
            }
        }

        for (let i = this.itemLoot.length - 1; i >= 0; i--) {
            let loot = this.itemLoot[i];
            if (Math.hypot(this.player.x - loot.x, this.player.y - loot.y) < this.player.radius + 15) {
                if (this.player.inventory.length < 12) {
                    this.player.inventory.push(loot.item);
                    this.itemLoot.splice(i, 1);
                    if (this.state === 'INVENTORY') UI.renderInventory();
                }
            }
        }

        this.spawnTimer++;
        if (this.spawnTimer > 60 - Math.min(this.wave * 2, 45)) {
            this.spawnZombie();
            this.spawnTimer = 0;
        }

        this.waveTimer++;
        if (this.waveTimer > 900) {
            this.wave++;
            this.waveTimer = 0;
            if (this.barrels.length < 3) this.spawnBarrels(2);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].life--;
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            let dt = this.damageTexts[i];
            dt.y -= 0.5;
            dt.life--;
            if (dt.life <= 0) this.damageTexts.splice(i, 1);
        }

        UI.updateHUD(this.player, this.wave);
    }

    drawMapBackground() {
        this.ctx.fillStyle = '#141414';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#222222';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        for (let dec of this.mapDecorations) {
            if (dec.type === 'blood') {
                this.ctx.fillStyle = 'rgba(146, 43, 33, 0.4)';
                this.ctx.beginPath();
                this.ctx.arc(dec.x, dec.y, dec.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fillRect(dec.x, dec.y, dec.size, dec.size);
            }
        }
    }

    drawLighting() {
        if (!this.player) return;
        const lightCanvas = document.createElement('canvas');
        lightCanvas.width = this.canvas.width;
        lightCanvas.height = this.canvas.height;
        const lctx = lightCanvas.getContext('2d');

        lctx.fillStyle = 'rgba(10, 10, 15, 0.45)';
        lctx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);

        lctx.globalCompositeOperation = 'destination-out';
        let grad = lctx.createRadialGradient(this.player.x, this.player.y, 10, this.player.x, this.player.y, 220);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = grad;
        lctx.beginPath();
        lctx.arc(this.player.x, this.player.y, 220, 0, Math.PI * 2);
        lctx.fill();

        this.ctx.drawImage(lightCanvas, 0, 0);
    }

    draw() {
        this.ctx.save();

        if (this.shakeTimer > 0) {
            let rx = (Math.random() - 0.5) * this.shakeIntensity;
            let ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(rx, ry);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMapBackground();

        for (let b of this.barrels) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(b.x - 8, b.y + 8, 16, 5);
            this.ctx.fillStyle = '#c0392b';
            this.ctx.fillRect(b.x - 8, b.y - 10, 16, 20);
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillRect(b.x - 8, b.y - 2, 16, 4);
        }

        for (let pu of this.powerups) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = pu.type === 'MAGNET' ? '#3498db' : (pu.type === 'NUKE' ? '#e74c3c' : '#00ffff');
            this.ctx.fillStyle = this.ctx.shadowColor;
            this.ctx.beginPath();
            this.ctx.arc(pu.x, pu.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        this.ctx.fillStyle = '#00ffff';
        for (let orb of this.xpOrbs) this.ctx.fillRect(orb.x - 3, orb.y - 3, 6, 6);

        this.ctx.fillStyle = '#f1c40f';
        for (let gold of this.goldOrbs) {
            this.ctx.beginPath();
            this.ctx.arc(gold.x, gold.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }

        for (let loot of this.itemLoot) {
            this.ctx.fillStyle = loot.item.rarity.color;
            this.ctx.fillRect(loot.x - 7, loot.y - 5, 14, 10);
        }

        this.ctx.fillStyle = '#f39c12';
        for (let p of this.projectiles) this.ctx.fillRect(p.x - 3, p.y - 3, 6, 6);

        for (let s of this.summons) {
            this.ctx.fillStyle = s.isEvolved ? '#f1c40f' : (s.type === 'drone' ? '#3498db' : '#e67e22');
            this.ctx.fillRect(s.x - 6, s.y - 6, 12, 12);
        }

        for (let z of this.zombies) z.draw(this.ctx);
        if (this.player) this.player.draw(this.ctx);

        for (let p of this.particles) {
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.drawLighting();

        let boss = this.zombies.find(z => z.type === 'BOSS');
        if (boss) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
            this.ctx.fillRect(200, 15, 400, 20);
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(202, 17, (boss.hp / boss.maxHp) * 396, 16);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CHEFE DA HORDA', 400, 31);
        }

        this.ctx.font = 'bold 12px Courier New';
        this.ctx.textAlign = 'center';
        for (let dt of this.damageTexts) {
            this.ctx.fillStyle = dt.color;
            this.ctx.fillText(dt.text, dt.x, dt.y);
        }

        if (this.state === 'GAMEOVER') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.font = '28px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('VOCÊ FOI DEVORADO!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText('Recarregue para jogar novamente', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }

        this.ctx.restore();
    }

    loop() {
        if (this.state === 'PLAYING') {
            this.update();
        }
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.addEventListener('load', () => {
    window.gameInstance = new Game();
    window.gameInstance.loop();
});