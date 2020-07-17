/* eslint-disable camelcase */
const { removeFormatting, getNestedObjects } = require('../util');
const constants = require('../constants');

const itemSchema = {
  item_id: 'id',
  count: 'Count',
  name: 'tag.display.Name',
  damage: 'Damage',
  lore: 'tag.display.Lore',
};

const attributeSchema = {
  modifier: 'tag.ExtraAttributes.modifier',
  enchantments: 'tag.ExtraAttributes.enchantments',
  anvil_uses: 'tag.ExtraAttributes.anvil_uses',
  hot_potato_count: 'tag.ExtraAttributes.hot_potato_count',
  origin: 'tag.ExtraAttributes.originTag',
  id: 'tag.ExtraAttributes.id',
  uuid: 'tag.ExtraAttributes.uuid',
  timestamp: 'tag.ExtraAttributes.timestamp',
  color: 'tag.ExtraAttribute.color',
  rarity_upgrades: 'tag.ExtraAttributes.rarity_upgrades',
  baseStatBoostPercentage: 'tag.ExtraAttributes.baseStatBoostPercentage',
  dungeon_floor: 'tag.ExtraAttributes.item_tier',
  texture: 'tag.SkullOwner.Properties.textures',
};

/**
* Represents a SkyBlock item
 */
class Item {
  /**
  * @param {Object} nbt raw simplified NBT data
  * @param {Boolean} active Item state, indicating whether item provides bonuses
   */
  constructor(nbt, active = true) {
    this.active = active;
    this.stats = {};
    this.damage = 0;
    this.lore = [];
    this.attributes = {};
    // Extract basic fields from NBT
    Object.keys(itemSchema).forEach((key) => {
      const value = getNestedObjects(nbt, itemSchema[key]);
      if (value) {
        this[key] = value;
      }
    });
    // Extract attributes from NBT
    Object.keys(attributeSchema).forEach((key) => {
      const value = getNestedObjects(nbt, attributeSchema[key]);
      if (value) {
        this.attributes[key] = value;
      }
    });
    const { hot_potato_count } = this.attributes;
    let { texture, timestamp } = this.attributes;
    if (texture) {
      texture = null;
      try {
        texture = JSON.parse(Buffer.from(this.attributes.texture[0].Value, 'base64').toString()).textures.SKIN.url.split('/').pop();
      } catch (e) {
        // do nothing
      }
      this.attributes.texture = texture;
    }
    if (hot_potato_count) {
      this.attributes.anvil_uses -= hot_potato_count;
    }
    if (timestamp) {
      // todo
    }
    this.getStats();
  }

  /**
   * Return stats modified by the item
   * @type {object}
   */
  parseStats() {
    const bonus = { ...constants.statTemplate };
    this.lore.forEach((line) => {
      const split = removeFormatting(line).split(':');

      if (split.length < 2) return;
      const statType = split[0];
      const statValue = parseFloat(split[1].trim().replace(/,/g, ''));
      // eslint-disable-next-line default-case
      switch (statType) {
        case 'Damage':
          bonus.damage = statValue;
          break;
        case 'Health':
          bonus.health = statValue;
          break;
        case 'Defense':
          bonus.defense = statValue;
          break;
        case 'Strength':
          bonus.strength = statValue;
          break;
        case 'Speed':
          bonus.speed = statValue;
          break;
        case 'Crit Chance':
          bonus.crit_chance = statValue;
          break;
        case 'Crit Damage':
          bonus.crit_damage = statValue;
          break;
        case 'Bonus Attack Speed':
          bonus.bonus_attack_speed = statValue;
          break;
        case 'Intelligence':
          bonus.intelligence = statValue;
          break;
        case 'Sea Creature Chance':
          bonus.sea_creature_chance = statValue;
          break;
        case 'Magic Find':
          bonus.magic_find = statValue;
          break;
        case 'Pet Luck':
          bonus.pet_luck = statValue;
          break;
      }
    });
    return bonus;
  }

  getStats() {
    if (!this.active) return;
    this.stats = this.parseStats();
  }

  getSkullTexture() {
    return `http://textures.minecraft.net/texture/${this.texture}`;
  }
}

module.exports = Item;
