class Zombie {
    constructor(x, y, wave, type = 'NORMAL') {
        this.x = x;
        this.y = y;
        this.type = type;

        if (type === 'RUNNER') {
            this.radius = 8;
            this.baseSpeed = 2.4 + (wave * 0.1);
            this.hp = 12 + (wave * 3);
            this.color = '#e67e22';
            this.shirtColor = '#d35400';
        } else if (type === 'TANK') {
            this.radius = 16;
            this.baseSpeed = 0.9 + (wave * 0.04);
            this.hp = 60 + (wave * 15);
            this.color = '#8e44ad';
            this.shirtColor = '#5e2786';
        } else if (type === 'BLOATER') {
            this.radius = 13;
            this.baseSpeed = 1.2 + (wave * 0.06);
            this.hp = 25 + (wave * 5);
            this.color = '#27ae60';
            this.shirtColor = '#1e8449';
        } else if (type === 'BOSS') {
            this.radius = 28;
            this.baseSpeed = 1.0 + (wave * 0.05);
            this.hp = 300 + (wave * 100);
            this.color = '#c0392b';
            this.shirtColor = '#922b21';
        } else {
            this.radius = 10;
            this.baseSpeed = 1.4 + (wave * 0.08);
            this.hp = 20 + (wave * 6);
            this.color = '#5c9945';
            this.shirtColor = '#3a5f27';
        }

        this.speed = this.baseSpeed;
        this.maxHp = this.hp;
        this.animFrame = Math.random() * 100;
        this.poisonTimer = 0;
        this.poisonDmg = 0;
        this.slowTimer = 0;
    }

    applyPoison(damage) {
        this.poisonTimer = 180;
        this.poisonDmg = damage;
    }

    applySlow(percentage) {
        this.slowTimer = 120;
        this.speed = this.baseSpeed * (1 - percentage);
    }

    update(player, game) {
        if (game.freezeTimer > 0) return Math.hypot(player.x - this.x, player.y - this.y);

        let fearLvl = player.getPassiveLevel('fear');
        let distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
        let isFleeing = fearLvl > 0 && distToPlayer < (fearLvl * 45) && this.type !== 'BOSS';

        let zdx = isFleeing ? (this.x - player.x) : (player.x - this.x);
        let zdy = isFleeing ? (this.y - player.y) : (player.y - this.y);
        let dist = Math.hypot(zdx, zdy);

        if (this.slowTimer > 0) {
            this.slowTimer--;
            if (this.slowTimer <= 0) this.speed = this.baseSpeed;
        }

        if (this.poisonTimer > 0) {
            this.poisonTimer--;
            if (this.poisonTimer % 60 === 0) {
                this.hp -= this.poisonDmg;
                game.addDamageText(this.x, this.y - 10, Math.round(this.poisonDmg), '#2ecc71');
            }
        }

        if (dist > 1) {
            this.x += (zdx / dist) * this.speed;
            this.y += (zdy / dist) * this.speed;
        }
        this.animFrame += 0.15;
        return distToPlayer;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        let legOffset = Math.sin(this.animFrame) * 4;

        // Sombra Projetada
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, this.radius + 2, this.radius * 0.9, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pernas
        ctx.fillStyle = '#1a2515';
        ctx.fillRect(-this.radius * 0.5 + legOffset, this.radius * 0.4, this.radius * 0.35, this.radius * 0.6);
        ctx.fillRect(this.radius * 0.15 - legOffset, this.radius * 0.4, this.radius * 0.35, this.radius * 0.6);

        // Tronco e Camisa
        ctx.fillStyle = this.poisonTimer > 0 ? '#1e8449' : (this.slowTimer > 0 ? '#2980b9' : this.shirtColor);
        ctx.fillRect(-this.radius * 0.8, -this.radius * 0.5, this.radius * 1.6, this.radius * 1.0);

        // Cabeça
        ctx.fillStyle = this.poisonTimer > 0 ? '#27ae60' : this.color;
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.7, this.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Olhos Brilhantes (Glow)
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-this.radius * 0.35, -this.radius * 0.8, 3, 3);
        ctx.fillRect(this.radius * 0.1, -this.radius * 0.8, 3, 3);

        ctx.restore();
    }
}