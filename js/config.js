const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    INITIAL_STATS: {
        attackPower: 15,
        maxHp: 100,
        speed: 3
    },
    // CLASSES DE PERSONAGENS
    CLASSES: [
        { id: 'soldier', name: 'Soldado', desc: '+20% Dano de Arma e começa com Passo Sombrio.', atkBonus: 5, hpBonus: 0, spdBonus: 0, startSkill: 'flash_step' },
        { id: 'survivor', name: 'Sobrevivente', desc: '+30% Velocidade e alcance de coleta de XP.', atkBonus: 0, hpBonus: 0, spdBonus: 1.0, startSkill: 'push' },
        { id: 'juggernaut', name: 'Juggernaut', desc: '+60 HP Máximo e resistência inicial pesada.', atkBonus: 0, hpBonus: 60, spdBonus: -0.5, startSkill: 'shield' },
        { id: 'scientist', name: 'Cientista', desc: '+25% de XP ganho e ganha Torreta.', atkBonus: -2, hpBonus: 10, spdBonus: 0.2, startSkill: 'turret' }
    ],
    UNIQUE_LOOT_POOL: [
        { id: 'w1', name: 'Pistola 9mm', slot: 'weapon', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { attackPower: 8 } },
        { id: 'w2', name: 'Espingarda 12', slot: 'weapon', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { attackPower: 18, attackRange: 20 } },
        { id: 'w3', name: 'Submetralhadora', slot: 'weapon', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { attackPower: 25, attackCooldown: -4 } },
        { id: 'w4', name: 'Fuzil de Assalto', slot: 'weapon', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { attackPower: 40, critChance: 0.1 } },
        { id: 'w5', name: 'Canhão Plasmático', slot: 'weapon', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { attackPower: 65, critChance: 0.2, attackRange: 50 }, effect: 'double_shot', effectDesc: '20% de chance de disparar 2 tiros.' },

        { id: 's1', name: 'Faca Tática', slot: 'secondary', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { attackPower: 5, speed: 0.2 } },
        { id: 's2', name: 'Escudo Tático', slot: 'secondary', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { maxHp: 35, attackPower: 5 } },
        { id: 's3', name: 'Lança-Granadas', slot: 'secondary', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { attackPower: 25, critChance: 0.15 } },
        { id: 's4', name: 'Sabre Psíquico', slot: 'secondary', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { attackPower: 45, speed: 0.6, critChance: 0.2 }, effect: 'executioner', effectDesc: '+50% dano em alvos com vida baixa.' },

        { id: 'h1', name: 'Boné Resistente', slot: 'head', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { maxHp: 15 } },
        { id: 'h2', name: 'Capacete Balístico', slot: 'head', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { maxHp: 40, attackPower: 5 } },
        { id: 'h3', name: 'Visor Infravermelho', slot: 'head', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { attackPower: 20, critChance: 0.15 } },
        { id: 'h4', name: 'Elmo Tático Cyber', slot: 'head', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { maxHp: 80, attackPower: 25, critChance: 0.15 }, effect: 'vampiric_aura', effectDesc: 'Regenera +2 HP por segundo.' },

        { id: 'a1', name: 'Colete Leve', slot: 'armor', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { maxHp: 30 } },
        { id: 'a2', name: 'Colete Tático', slot: 'armor', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { maxHp: 65, speed: 0.3 } },
        { id: 'a3', name: 'Kevlar Pesado', slot: 'armor', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { maxHp: 120, attackPower: 15 } },
        { id: 'a4', name: 'Exoesqueleto Titã', slot: 'armor', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { maxHp: 200, attackPower: 30, speed: 0.5 }, effect: 'shockwave_on_hit', effectDesc: 'Emite onda de choque ao sofrer dano.' },

        { id: 'b1', name: 'Tênis de Corrida', slot: 'boots', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { speed: 0.5 } },
        { id: 'b2', name: 'Botas Militares', slot: 'boots', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { speed: 0.8, maxHp: 25 } },
        { id: 'b3', name: 'Propulsores', slot: 'boots', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { speed: 1.2, attackPower: 15 } },
        { id: 'b4', name: 'Passos Antigravidade', slot: 'boots', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { speed: 1.8, maxHp: 50, attackPower: 20 }, effect: 'speed_burst', effectDesc: 'Eliminar inimigos concede velocidade extra.' },

        { id: 'ac1', name: 'Anel de Prata', slot: 'accessory', rarity: { name: 'Comum', color: '#aaa', class: 'rarity-common' }, stats: { attackPower: 8 } },
        { id: 'ac2', name: 'Amuleto de Sangue', slot: 'accessory', rarity: { name: 'Raro', color: '#3498db', class: 'rarity-rare' }, stats: { maxHp: 40, attackPower: 10 } },
        { id: 'ac3', name: 'Insígnia do Mestre', slot: 'accessory', rarity: { name: 'Épico', color: '#9b59b6', class: 'rarity-epic' }, stats: { attackPower: 25, critChance: 0.12, speed: 0.4 } },
        { id: 'ac4', name: 'Núcleo do Apocalipse', slot: 'accessory', rarity: { name: 'Lendário', color: '#f39c12', class: 'rarity-legendary' }, stats: { attackPower: 45, maxHp: 90, critChance: 0.25, speed: 0.8 }, effect: 'double_shot', effectDesc: 'Aumenta disparos duplos.' }
    ],
    PASSIVES: [
        { id: 'ricochet', name: 'Ricochete', maxLevel: 5, getDesc: (lvl) => `Projéteis rebatem em até +${lvl} inimigos.` },
        { id: 'magnetic_ricochet', name: 'Ricochete Magnético', maxLevel: 1, getDesc: () => `Projéteis perseguem zumbis.` },
        { id: 'poison', name: 'Toxina Residual', maxLevel: 5, getDesc: (lvl) => `Infecta causando ${lvl * 4} de dano/s por 3s.` },
        { id: 'slow', name: 'Munição Crio', maxLevel: 5, getDesc: (lvl) => `Lentidão de ${lvl * 12}% nos alvos.` },
        { id: 'vampirism', name: 'Vampirismo Tático', maxLevel: 5, getDesc: (lvl) => `Recupera +${lvl * 2} HP ao matar zumbis.` },
        { id: 'crit', name: 'Execução Crítica', maxLevel: 5, getDesc: (lvl) => `+${lvl * 8}% de chance de Critico Dobrado.` },
        { id: 'fear', name: 'Aura do Terror', maxLevel: 3, getDesc: (lvl) => `Zumbis num raio de ${lvl * 40}px fogem.` }
    ],
    SKILLS_STORE: [
        { id: 'flash_step', name: 'Passo Sombrio', desc: 'Teleporta e deixa névoa tóxica.', cost: 35, cd: 150, requiredPassive: 'ricochet' },
        { id: 'push', name: 'Onda de Choque', desc: 'Empurra zumbis ao redor.', cost: 45, cd: 200, requiredPassive: 'fear' },
        { id: 'stomp', name: 'Pisotão Brutal', desc: 'Impacto forte em área.', cost: 60, cd: 250, requiredPassive: 'crit' },
        { id: 'drone', name: 'Droid de Combate', desc: 'Invoca drone orbital.', cost: 75, cd: 400, requiredPassive: 'vampirism' },
        { id: 'turret', name: 'Torreta Sentinela', desc: 'Planta torreta fixa.', cost: 85, cd: 450, requiredPassive: 'poison' },
        { id: 'frost_nova', name: 'Nova de Gelo', desc: 'Congela zumbis no mapa.', cost: 90, cd: 300, requiredPassive: 'slow' },
        { id: 'shield', name: 'Escudo Absorvente', desc: 'Imune a dano por 4s.', cost: 100, cd: 360, requiredPassive: 'vampirism' },
        { id: 'beam', name: 'Feixe Soliton', desc: 'Raio laser cortante.', cost: 110, cd: 280, requiredPassive: 'crit' },
        { id: 'missiles', name: 'Chuva de Mísseis', desc: 'Mísseis teleguiados.', cost: 130, cd: 350, requiredPassive: 'ricochet' },
        { id: 'adrenalin', name: 'Seringa Adrenalina', desc: 'Dobra velocidade e cadência.', cost: 150, cd: 500, requiredPassive: 'poison' }
    ],
    META_UPGRADES: {
        atkBonus: { name: '+Dano Permanente', cost: 100, max: 10, val: 3 },
        hpBonus: { name: '+HP Inicial', cost: 80, max: 10, val: 15 },
        xpBonus: { name: '+% Ganho de XP', cost: 120, max: 5, val: 10 },
        lootBonus: { name: '+% Drop de Loot', cost: 150, max: 5, val: 5 }
    }
};