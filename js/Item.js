class ItemFactory {
    static generateLoot() {
        if (!CONFIG.UNIQUE_LOOT_POOL || CONFIG.UNIQUE_LOOT_POOL.length === 0) {
            return null; // Sem mais itens para dropar
        }

        // Escolhe um item do pool único e remove ele para não repetir na mesma partida
        const randomIndex = Math.floor(Math.random() * CONFIG.UNIQUE_LOOT_POOL.length);
        const chosenItem = CONFIG.UNIQUE_LOOT_POOL.splice(randomIndex, 1)[0];

        return {
            id: chosenItem.id,
            name: chosenItem.name,
            slot: chosenItem.slot,
            rarity: chosenItem.rarity,
            stats: chosenItem.stats || {},
            effect: chosenItem.effect || null,
            effectDesc: chosenItem.effectDesc || null
        };
    }
}