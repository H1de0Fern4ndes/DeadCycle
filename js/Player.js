class Player {
    constructor(x, y, selectedClassId = 'soldier') {
        this.x = x;
        this.y = y;
        this.radius = 12;

        try {
            this.metaStats = JSON.parse(localStorage.getItem('zombie_meta_upgrades')) || {
                atkBonus: 0, hpBonus: 0, xpBonus: 0, lootBonus: 0, totalGold: 0
            };
        } catch (e) {
            this.metaStats = { atkBonus: 0, hpBonus: 0, xpBonus: 0, lootBonus: 0, totalGold: 0 };
        }

        const charClass = CONFIG.CLASSES.find(c => c.id === selectedClassId) || CONFIG.CLASSES[0];

        this.baseSpeed = CONFIG.INITIAL_STATS.speed + charClass.spdBonus;
        this.speed = this.baseSpeed;
        
        this.baseMaxHp = CONFIG.INITIAL_STATS.maxHp + charClass.hpBonus + ((this.metaStats.hpBonus || 0) * CONFIG.META_UPGRADES.hpBonus.val);
        this.maxHp = this.baseMaxHp;
        this.hp = this.maxHp;

        this.level = 1;
        this.xp = 0;
        this.maxXp = 10;
        this.gold = 0;

        this.baseAttackPower = CONFIG.INITIAL_STATS.attackPower + charClass.atkBonus + ((this.metaStats.atkBonus || 0) * CONFIG.META_UPGRADES.atkBonus.val);
        this.attackPower = this.baseAttackPower;
        this.attackRange = 160;
        this.attackCooldown = 30;
        this.cooldownTimer = 0;
        this.extraCritChance = 0;

        this.isShielded = false;
        this.shieldTimer = 0;
        this.adrenalinTimer = 0;
        this.regenTimer = 0;

        this.passives = [];
        this.unlockedSkills = [];
        this.equippedSkills = [null, null, null]; 
        this.skillCooldowns = [0, 0, 0];

        // Adiciona a habilidade inicial da classe
        const initSkill = CONFIG.SKILLS_STORE.find(s => s.id === charClass.startSkill);
        if (initSkill) {
            this.unlockedSkills.push(initSkill);
            this.equippedSkills[0] = initSkill;
        }

        this.equipment = { weapon: null, secondary: null, head: null, armor: null, boots: null, accessory: null };
        this.inventory = [];
        this.animFrame = 0;
        this.lastDirection = { dx: 1, dy: 0 };
    }

    getPassiveLevel(passiveId) {
        const pas = this.passives.find(p => p.id === passiveId);
        return pas ? pas.level : 0;
    }

    addOrUpgradePassive(passiveId) {
        const pas = this.passives.find(p => p.id === passiveId);
        if (pas) {
            const configPas = CONFIG.PASSIVES.find(cp => cp.id === passiveId);
            if (pas.level < configPas.maxLevel) pas.level++;
        } else {
            this.passives.push({ id: passiveId, level: 1 });
        }
    }

    hasLegendaryEffect(effectName) {
        return Object.values(this.equipment).some(item => item && item.effect === effectName);
    }

    isSkillEvolved(skill) {
        if (!skill || !skill.requiredPassive) return false;
        return this.getPassiveLevel(skill.requiredPassive) >= 5;
    }

    recalculateStats() {
        let totalAtk = this.baseAttackPower;
        let totalHp = this.baseMaxHp;
        let totalSpeed = this.baseSpeed;
        let totalRange = 160;
        let totalCooldown = 30;
        let totalCrit = 0;

        Object.values(this.equipment).forEach(item => {
            if (item && item.stats) {
                if (item.stats.attackPower) totalAtk += item.stats.attackPower;
                if (item.stats.maxHp) totalHp += item.stats.maxHp;
                if (item.stats.speed) totalSpeed += item.stats.speed;
                if (item.stats.attackRange) totalRange += item.stats.attackRange;
                if (item.stats.attackCooldown) totalCooldown += item.stats.attackCooldown;
                if (item.stats.critChance) totalCrit += item.stats.critChance;
            }
        });

        let spdMult = this.adrenalinTimer > 0 ? 1.8 : 1.0;

        this.attackPower = totalAtk;
        this.maxHp = totalHp;
        this.speed = totalSpeed * spdMult;
        this.attackRange = totalRange;
        this.attackCooldown = Math.max(8, totalCooldown);
        this.extraCritChance = totalCrit;

        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    useSkill(slotIndex, game) {
        const skill = this.equippedSkills[slotIndex];
        if (!skill || this.skillCooldowns[slotIndex] > 0) return;

        let isEvolved = this.isSkillEvolved(skill);
        let mult = isEvolved ? 2.2 : 1.0;

        this.skillCooldowns[slotIndex] = Math.round(skill.cd * (isEvolved ? 0.7 : 1.0));

        if (skill.id === 'flash_step') {
            game.createExplosion(this.x, this.y, 40 * mult, 10 * mult);
            this.x += this.lastDirection.dx * 130;
            this.y += this.lastDirection.dy * 130;
        } else if (skill.id === 'push') {
            game.createPushWave(this.x, this.y, 160 * mult);
        } else if (skill.id === 'stomp') {
            game.createExplosion(this.x, this.y, 120 * mult, this.attackPower * 3 * mult);
        } else if (skill.id === 'drone') {
            game.spawnDrone(this.x, this.y, isEvolved);
        } else if (skill.id === 'turret') {
            game.spawnTurret(this.x, this.y, isEvolved);
        } else if (skill.id === 'frost_nova') {
            game.triggerFrostNova(isEvolved);
        } else if (skill.id === 'shield') {
            this.isShielded = true;
            this.shieldTimer = isEvolved ? 360 : 240;
        } else if (skill.id === 'beam') {
            game.fireBeam(this.x, this.y, this.lastDirection, isEvolved);
        } else if (skill.id === 'missiles') {
            game.fireMissiles(isEvolved ? 10 : 5);
        } else if (skill.id === 'adrenalin') {
            this.adrenalinTimer = isEvolved ? 500 : 360;
            this.recalculateStats();
        }
    }

    update(keys, touchPos, game) {
        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
            this.lastDirection = { dx, dy };
            this.animFrame += 0.2;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        this.x = Math.max(this.radius, Math.min(CONFIG.CANVAS_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.CANVAS_HEIGHT - this.radius, this.y));

        if (this.hasLegendaryEffect('vampiric_aura')) {
            this.regenTimer++;
            if (this.regenTimer >= 60) {
                this.hp = Math.min(this.maxHp, this.hp + 2);
                this.regenTimer = 0;
            }
        }

        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) this.isShielded = false;
        }

        if (this.adrenalinTimer > 0) {
            this.adrenalinTimer--;
            if (this.adrenalinTimer <= 0) this.recalculateStats();
        }

        if (this.cooldownTimer > 0) this.cooldownTimer--;

        for (let i = 0; i < 3; i++) {
            if (this.skillCooldowns[i] > 0) this.skillCooldowns[i]--;
        }

        if (keys[' '] || keys['space']) this.useSkill(0, game);
        if (keys['q']) this.useSkill(1, game);
        if (keys['e']) this.useSkill(2, game);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 12, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.isShielded) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        let legOffset = Math.sin(this.animFrame) * 3;

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-6 + legOffset, 4, 4, 8);
        ctx.fillRect(2 - legOffset, 4, 4, 8);

        ctx.fillStyle = this.adrenalinTimer > 0 ? '#e74c3c' : '#2980b9';
        ctx.fillRect(-7, -6, 14, 11);

        ctx.fillStyle = '#d35400';
        ctx.fillRect(-10, -5, 3, 8);

        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-5, -15, 10, 9);

        ctx.fillStyle = '#6e2c00';
        ctx.fillRect(-6, -17, 12, 4);

        ctx.restore();
    }
}