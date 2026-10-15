class UI {
    static updateHUD(player, wave) {
        document.getElementById('waveDisplay').innerText = wave;
        document.getElementById('levelDisplay').innerText = player.level;
        document.getElementById('xpDisplay').innerText = player.xp;
        document.getElementById('maxXpDisplay').innerText = player.maxXp;
        document.getElementById('hpDisplay').innerText = Math.max(0, Math.floor(player.hp));
        document.getElementById('maxHpDisplay').innerText = player.maxHp;
        document.getElementById('goldDisplay').innerText = player.gold;

        const keyNames = ['[Espaço]', '[Q]', '[E]'];
        for (let i = 0; i < 3; i++) {
            const skill = player.equippedSkills[i];
            const skillBox = document.getElementById(`skill${i}`);
            const cdBox = document.getElementById(`cdSkill${i}`);
            
            if (skillBox) {
                const labelSpan = skillBox.querySelector('span');
                if (labelSpan) {
                    let isEv = player.isSkillEvolved(skill);
                    labelSpan.innerText = skill ? `${isEv ? '★ ' : ''}${skill.name} ${keyNames[i]}` : `[Livre] ${keyNames[i]}`;
                    labelSpan.style.color = isEv ? '#f1c40f' : '#fff';
                }
            }

            if (cdBox) {
                cdBox.style.height = skill ? `${(player.skillCooldowns[i] / skill.cd) * 100}%` : '0%';
            }
        }
    }

    static renderClassSelect() {
        const container = document.getElementById('classListContainer');
        if (!container) return;
        container.innerHTML = '';

        CONFIG.CLASSES.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-title">${cls.name}</div>
                    <div style="font-size:10px; color:#ccc">${cls.desc}</div>
                </div>
                <button class="buy-btn" style="background:#27ae60">Selecionar</button>
            `;
            card.onclick = () => window.gameInstance.startGame(cls.id);
            container.appendChild(card);
        });
    }

    static renderRouletteModal(items) {
        const grid = document.getElementById('rouletteGrid');
        grid.innerHTML = '';
        items.forEach((item, index) => {
            let card = document.createElement('div');
            card.className = `item-slot ${item.rarity.class}`;
            card.style.height = '90px';
            card.style.fontSize = '10px';
            card.innerHTML = `<b>${item.name}</b><span style="color:#2ecc71">${item.rarity.name}</span>`;
            card.onclick = () => window.gameInstance.claimRouletteItem(index);
            grid.appendChild(card);
        });
        document.getElementById('rouletteModal').style.display = 'block';
    }

    static toggleInventory() {
        if (window.gameInstance.state === 'PLAYING') {
            window.gameInstance.state = 'INVENTORY';
            UI.renderInventory();
            document.getElementById('inventoryModal').style.display = 'block';
        } else if (window.gameInstance.state === 'INVENTORY') {
            window.gameInstance.state = 'PLAYING';
            document.getElementById('inventoryModal').style.display = 'none';
        }
    }

    static toggleShop() {
        if (window.gameInstance.state === 'PLAYING') {
            window.gameInstance.state = 'SHOP';
            UI.renderShop();
            document.getElementById('shopModal').style.display = 'block';
        } else if (window.gameInstance.state === 'SHOP') {
            window.gameInstance.state = 'PLAYING';
            document.getElementById('shopModal').style.display = 'none';
        }
    }

    static toggleMetaShop() {
        if (window.gameInstance.state === 'PLAYING') {
            window.gameInstance.state = 'META';
            UI.renderMetaShop();
            document.getElementById('metaModal').style.display = 'block';
        } else if (window.gameInstance.state === 'META') {
            window.gameInstance.state = 'PLAYING';
            document.getElementById('metaModal').style.display = 'none';
        }
    }

    static formatStats(stats) {
        if (!stats) return '';
        let parts = [];
        if (stats.attackPower) parts.push(`+${stats.attackPower} Atk`);
        if (stats.maxHp) parts.push(`+${stats.maxHp} HP`);
        if (stats.speed) parts.push(`+${stats.speed} Vel`);
        if (stats.critChance) parts.push(`+${Math.round(stats.critChance * 100)}% Crit`);
        return parts.join(' | ');
    }

    static renderInventory() {
        const p = window.gameInstance.player;
        if (!p) return;
        const initial = CONFIG.INITIAL_STATS;

        let dmgPct = Math.round(((p.attackPower - initial.attackPower) / initial.attackPower) * 100);
        let hpPct = Math.round(((p.maxHp - initial.maxHp) / initial.maxHp) * 100);

        document.getElementById('statsSummaryContent').innerHTML = `
            <div><b>Atk:</b> ${p.attackPower} (+${dmgPct}%) | <b>HP Max:</b> ${p.maxHp} (+${hpPct}%)</div>
            <div><b>Velocidade:</b> ${p.speed.toFixed(1)} | <b>Crit Extra:</b> +${Math.round(p.extraCritChance * 100)}%</div>
        `;

        const passivesDiv = document.getElementById('passivesList');
        if (passivesDiv) {
            if (p.passives.length === 0) {
                passivesDiv.innerHTML = '<small>Nenhuma passiva adquirida ainda.</small>';
            } else {
                passivesDiv.innerHTML = p.passives.map(pas => {
                    const cfg = CONFIG.PASSIVES.find(cp => cp.id === pas.id);
                    return `<div class="passive-badge"><b>${cfg.name} (Lvl ${pas.level}):</b> ${cfg.getDesc(pas.level)}</div>`;
                }).join('');
            }
        }

        const formatItemDetails = (item) => {
            if (!item) return 'Vazio';
            let statsText = [];
            if (item.stats) {
                if (item.stats.attackPower) statsText.push(`+${item.stats.attackPower} Atk`);
                if (item.stats.maxHp) statsText.push(`+${item.stats.maxHp} HP`);
                if (item.stats.speed) statsText.push(`+${item.stats.speed} Vel`);
                if (item.stats.critChance) statsText.push(`+${Math.round(item.stats.critChance * 100)}% Crit`);
            }
            let effectHtml = item.effectDesc ? `<div style="font-size:7px; color:#f1c40f; margin-top:1px;">⚡ ${item.effectDesc}</div>` : '';
            return `
                <span style="font-weight:bold; font-size:9px;">${item.name}</span>
                <span style="color:#2ecc71; font-size:8px;">${statsText.join(' | ')}</span>
                ${effectHtml}
            `;
        };

        const slots = ['weapon', 'secondary', 'head', 'armor', 'boots', 'accessory'];
        slots.forEach(slot => {
            const el = document.getElementById(`slot-${slot}`);
            const item = p.equipment[slot];
            if (el) {
                if (item) {
                    el.innerHTML = formatItemDetails(item);
                    el.className = `item-slot ${item.rarity.class}`;
                } else {
                    el.innerText = 'Vazio';
                    el.className = 'item-slot';
                }
            }
        });

        const skillsContainer = document.getElementById('unlockedSkillsGrid');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            if (p.unlockedSkills.length === 0) {
                skillsContainer.innerHTML = '<small>Compre habilidades na loja (B).</small>';
            } else {
                p.unlockedSkills.forEach(skill => {
                    let equippedSlot = p.equippedSkills.indexOf(skill);
                    let isEquipped = equippedSlot !== -1;
                    let slotName = isEquipped ? `[Slot ${equippedSlot + 1}]` : '';

                    const card = document.createElement('div');
                    card.className = 'shop-item';
                    card.style.padding = '6px';
                    card.style.fontSize = '11px';
                    card.innerHTML = `
                        <div class="shop-item-info">
                            <div class="shop-item-title">${skill.name} <span style="color:#f1c40f">${slotName}</span></div>
                            <div style="font-size:9px; color:#aaa">${skill.desc}</div>
                        </div>
                        <div>
                            ${isEquipped ? 
                                `<button class="buy-btn" style="background:#e74c3c; color:white;" onclick="UI.unequipSkill(${equippedSlot})">Desequipar</button>` : 
                                `<button class="buy-btn" onclick="UI.equipSkill('${skill.id}')">Equipar</button>`
                            }
                        </div>
                    `;
                    skillsContainer.appendChild(card);
                });
            }
        }

        const backpack = document.getElementById('backpackGrid');
        backpack.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'item-slot';
            const item = p.inventory[i];
            if (item) {
                slotDiv.innerHTML = formatItemDetails(item);
                slotDiv.classList.add(item.rarity.class);
                slotDiv.onclick = () => UI.equip(i);
            } else {
                slotDiv.innerText = 'Vazio';
            }
            backpack.appendChild(slotDiv);
        }
    }

    static equipSkill(skillId) {
        const p = window.gameInstance.player;
        const skill = p.unlockedSkills.find(s => s.id === skillId);
        if (!skill) return;

        let freeSlot = p.equippedSkills.indexOf(null);
        if (freeSlot !== -1) {
            p.equippedSkills[freeSlot] = skill;
        } else {
            p.equippedSkills[0] = skill;
        }
        UI.renderInventory();
        UI.updateHUD(p, window.gameInstance.wave);
    }

    static unequipSkill(slotIndex) {
        const p = window.gameInstance.player;
        p.equippedSkills[slotIndex] = null;
        UI.renderInventory();
        UI.updateHUD(p, window.gameInstance.wave);
    }

    static equip(index) {
        const p = window.gameInstance.player;
        const item = p.inventory[index];
        if (!item) return;

        const currentEquipped = p.equipment[item.slot];
        p.inventory.splice(index, 1);
        if (currentEquipped) p.inventory.push(currentEquipped);

        p.equipment[item.slot] = item;
        p.recalculateStats();
        UI.renderInventory();
    }

    static unequip(slot) {
        const p = window.gameInstance.player;
        const item = p.equipment[slot];
        if (!item) return;

        if (p.inventory.length < 12) {
            p.inventory.push(item);
            p.equipment[slot] = null;
            p.recalculateStats();
            UI.renderInventory();
        }
    }

    static renderShop() {
        const p = window.gameInstance.player;
        document.getElementById('shopGoldDisplay').innerText = p.gold;

        const grid = document.getElementById('shopOptionsGrid');
        grid.innerHTML = '';

        CONFIG.SKILLS_STORE.forEach(skill => {
            const isUnlocked = p.unlockedSkills.some(s => s.id === skill.id);
            const reqPas = CONFIG.PASSIVES.find(cp => cp.id === skill.requiredPassive);
            const isEvolved = p.isSkillEvolved(skill);

            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-title">${skill.name} ${isEvolved ? '★ (EVOLUÍDA)' : ''}</div>
                    <div>${skill.desc}</div>
                    <small style="color:#aaa">Sinergia: ${reqPas.name} (Lvl 5)</small>
                </div>
                <button class="buy-btn" ${isUnlocked || p.gold < skill.cost ? 'disabled' : ''}>
                    ${isUnlocked ? 'COMPRADO' : `🟡 ${skill.cost}`}
                </button>
            `;
            const btn = div.querySelector('.buy-btn');
            btn.onclick = () => {
                if (p.gold >= skill.cost && !isUnlocked) {
                    p.gold -= skill.cost;
                    p.unlockedSkills.push(skill);
                    let freeSlot = p.equippedSkills.indexOf(null);
                    if (freeSlot !== -1) p.equippedSkills[freeSlot] = skill;

                    UI.renderShop();
                    UI.updateHUD(p, window.gameInstance.wave);
                }
            };
            grid.appendChild(div);
        });
    }

    static renderMetaShop() {
        const p = window.gameInstance.player;
        document.getElementById('metaGoldDisplay').innerText = p.metaStats.totalGold;

        const grid = document.getElementById('metaOptionsGrid');
        grid.innerHTML = '';

        Object.keys(CONFIG.META_UPGRADES).forEach(key => {
            const up = CONFIG.META_UPGRADES[key];
            const currentLvl = p.metaStats[key] || 0;
            const cost = up.cost * (currentLvl + 1);

            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-item-info">
                    <div class="shop-item-title">${up.name} (${currentLvl}/${up.max})</div>
                    <div>Bônus atual: +${currentLvl * up.val}</div>
                </div>
                <button class="buy-btn" ${currentLvl >= up.max || p.metaStats.totalGold < cost ? 'disabled' : ''}>
                    ${currentLvl >= up.max ? 'MÁXIMO' : `🟡 ${cost}`}
                </button>
            `;
            const btn = div.querySelector('.buy-btn');
            btn.onclick = () => {
                if (p.metaStats.totalGold >= cost && currentLvl < up.max) {
                    p.metaStats.totalGold -= cost;
                    p.metaStats[key] = currentLvl + 1;
                    localStorage.setItem('zombie_meta_upgrades', JSON.stringify(p.metaStats));
                    p.recalculateStats();
                    UI.renderMetaShop();
                }
            };
            grid.appendChild(div);
        });
    }
}