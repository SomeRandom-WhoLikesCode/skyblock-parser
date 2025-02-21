/* eslint-disable no-plusplus */
/* eslint-disable camelcase,no-param-reassign */
const util = require('../util');
const constants = require('../constants');
const Item = require('../item/Item');
const Pet = require('../pet/Pet');

const baseStats = {
  damage: 0,
  health: 100,
  defense: 0,
  effective_health: 100,
  strength: 0,
  damage_increase: 0,
  speed: 100,
  crit_chance: 30,
  crit_damage: 50,
  bonus_attack_speed: 0,
  intelligence: 0,
  sea_creature_chance: 20,
  magic_find: 10,
  pet_luck: 0,
  true_defense: 0,
  ferocity: 0,
  ability_damage: 0,
  mining_speed: 0,
  mining_fortune: 0,
  farming_fortune: 0,
  foraging_fortune: 0,
  pristine: 0,
};

async function getInventory({ data = '' }, active = false) {
  if (data === '') return [];
  const { i } = await util.decodeData(Buffer.from(data, 'base64'));
  return Promise.all(i.map(async (item) => new Item(item, active)));
}

function getTotalDragonKills(json) {
  let totalKills = 0;
  Object.entries(json).forEach(
    (stat) => { totalKills += stat[1]; },
  );
  return totalKills;
}

// Process the stats object
function processStats({
  kills = 0,
  deaths = 0,
  ender_crystals_destroyed = 0,
  highest_critical_damage = 0,
  end_race_best_time = null,
  chicken_race_best_time_2 = null,
  gifts_given = 0,
  gifts_received = 0,
  most_winter_snowballs_hit = 0,
  most_winter_damage_dealt = 0,
  most_winter_magma_damage_dealt = 0,
  most_winter_cannonballs_hit = 0,
  items_fished = 0,
  items_fished_normal = 0,
  items_fished_treasure = 0,
  items_fished_large_treasure = 0,
  auctions_completed = 0,
  auctions_bids = 0,
  auctions_highest_bid = 0,
  auctions_won = 0,
  auctions_created = 0,
  auctions_no_bids = 0,
  auctions_fees = 0,
  auctions_gold_earned = 0,
  auctions_gold_spent = 0,
  pet_milestone_ores_mined = 0,
  pet_milestone_sea_creatures_killed = 0,
  ...rest
}) {
  const getStats = (regexp, replace) => util.pickKeys(rest, {
    regexp,
    keyMap: replace || ((key) => key.replace(regexp, '')),
  });
  const auctions = {
    created: auctions_created,
    // Auctions that got bid on
    completed: auctions_completed,
    no_bids: auctions_no_bids,
    won: auctions_won,
    bids: auctions_bids,
    highest_bid: auctions_highest_bid,
    total_fees: auctions_fees,
    gold_earned: auctions_gold_earned,
    gold_spent: auctions_gold_spent,
    sold: getStats(/^auctions_sold_/),
    bought: getStats(/^auctions_bought_/),
  };
  return {
    total_kills: kills,
    total_deaths: deaths,
    kills: getStats(/^kills_/),
    total_dragon_kills: Number(getTotalDragonKills(getStats(/^kills_(.*)_dragon/, (key) => key.replace(/^kills_(.*)_dragon/, '$1')))),
    deaths: getStats(/^deaths_/),
    highest_critical_damage: Math.round(highest_critical_damage),
    ender_crystals_destroyed,
    end_race_best_time: end_race_best_time ? end_race_best_time / 1000 : null,
    chicken_race_best_time: chicken_race_best_time_2 ? chicken_race_best_time_2 / 1000 : null,
    dungeon_hub_best_time: getStats(/^dungeon_hub_/, (key) => key.replace(/^dungeon_hub_/, '').replace(/_best_time$/, '')),
    gifts_given,
    gifts_received,
    items_fished: {
      total: items_fished,
      normal: items_fished_normal,
      treasure: items_fished_treasure,
      large_treasure: items_fished_large_treasure,
    },
    auctions,
    winter_records: {
      snowballs_hit: most_winter_snowballs_hit,
      damage: most_winter_damage_dealt,
      magma_cube_damage: most_winter_magma_damage_dealt,
      cannonballs_hit: most_winter_cannonballs_hit,
    },
    pet_milestones: {
      ore_mined: pet_milestone_ores_mined,
      sea_creatures_killed: pet_milestone_sea_creatures_killed,
    },
  };
}

/**
 * @param {String} uuid Player UUID
 * @param {Object} data Profile member object
 * @type {Promise}
 */
class Player {
  constructor(uuid, data) {
    return (async () => {
      this.uuid = uuid;
      this.attributes = { ...baseStats };

      const {
        last_save = null,
        first_join = null,
        pets = [],
        stats = {},
        coin_purse = 0,
        crafted_generators = [],
        slayer_bosses = {},
        unlocked_coll_tiers = [],
        collection = {},
        inv_armor = {},
        inv_contents = {},
        fishing_bag = {},
        potion_bag = {},
        talisman_bag = {},
        quiver = {},
        ender_chest_contents = {},
        candy_inventory_contents = {},
        wardrobe_contents = {},
        personal_vault_contents = {},
        backpack_contents = {},
        backpack_icons = {},
        // Fairy souls
        fairy_souls_collected = 0,
        fairy_souls = 0,
        fairy_exchanges = 0,
        // dungeons data for layout
        dungeons = {},
        essence_undead = 0,
        essence_diamond = 0,
        essence_dragon = 0,
        essence_gold = 0,
        essence_ice = 0,
        essence_wither = 0,
        essence_spider = 0,
        perks = {},
        // potion data
        active_effects: active_potions = [],
        paused_effects: paused_potions = [],
        disabled_potion_effects: disabled_potions = [],
        temp_stat_buffs: cake_soul_buffs = [],
        // mining data
        mining_core = {},
        forge = {},

        ...rest
      } = data;

      // Insert rest of the fields as in the API
      Object.keys(rest).forEach((key) => {
        if (!key.startsWith('experience_skill_')) {
          this[key] = rest[key];
        }
      });

      this.stats = processStats(stats);

      this.inventory = await getInventory(inv_contents, true);
      this.armor = await getInventory(inv_armor, true);
      this.talisman_bag = await getInventory(talisman_bag, true);
      this.fishing_bag = await getInventory(fishing_bag);
      this.potion_bag = await getInventory(potion_bag);
      this.quiver = await getInventory(quiver);
      this.ender_chest = await getInventory(ender_chest_contents);
      this.candy_bag = await getInventory(candy_inventory_contents);
      this.wardrobe = await getInventory(wardrobe_contents);
      this.personal_vault = await getInventory(personal_vault_contents);
      this.backpack = await Promise.all(Object.keys(backpack_contents)
        .map(async (slot) => getInventory(backpack_contents[slot])));
      this.backpack_icons = await Promise.all(Object.keys(backpack_icons)
        .map(async (slot) => getInventory(backpack_icons[slot])));
      // relocate bag types to new key
      this.player_inventories = {
        inventory: this.inventory,
        armor: this.armor,
        ender_chest: this.ender_chest,
        personal_vault: this.personal_vault,
        backpack_data: {
          backpacks: this.backpack,
          backpack_icons: this.backpack_icons,
        },
      };
      // relocate player inventory types to new key

      this.player_bags = {
        talisman_bag: this.talisman_bag,
        fishing_bag: this.fishing_bag,
        potion_bag: this.potion_bag,
        candy_bag: this.candy_bag,
        quiver: this.quiver,
      };
      const getUnlockedTier = (array) => {
        const o = {};
        array.forEach((gen) => {
          const regex = /_(-*\d+)$/;
          const name = gen.replace(regex, '');
          const tier = Number((regex.exec(gen) || [])[1] || -1);
          if (o[name] < tier || !(name in o)) {
            o[name] = tier;
          }
        });
        return o;
      };
      const getSkills = (regexp) => util.pickKeys(rest, {
        regexp,
        keyMap: (key) => key.replace(regexp, ''),
      });
      const getSlayer = ({
        claimed_levels = {},
        xp = 0,
        boss_kills_tier_0 = 0,
        boss_kills_tier_1 = 0,
        boss_kills_tier_2 = 0,
        boss_kills_tier_3 = 0,
        boss_kills_tier_4 = 0,
      }, name) => {
        const {
          xpForNext,
        } = util.getSlayerLevel({ claimedLevels: Object.keys(claimed_levels), xp }, name);
        return {
          claimed_levels: Object.keys(claimed_levels).filter((level) => !level.endsWith('_special')).length,
          xp,
          xp_for_next: Math.max(xpForNext - xp, 0),
          kills_tier: {
            1: boss_kills_tier_0,
            2: boss_kills_tier_1,
            3: boss_kills_tier_2,
            4: boss_kills_tier_3,
            5: boss_kills_tier_4,
          },
        };
      };
      const collection_tiers = getUnlockedTier(unlocked_coll_tiers);
      const skills = getSkills(/^experience_skill_/);
      let averageSkillLevel = 0.0;
      // define variabe before forEach loop so it can be used out the loop scope
      Object.entries(skills).forEach(([key, value]) => {
        skills[key] = util.getLevelByXp(value, key);
        if (!['runecrafting', 'carpentry'].includes(key)) { // array of skills that shouldn't be used in ASL sum
          averageSkillLevel += parseFloat(skills[key].floatLevel) || 0;
          // Handle things that can't be parsed as a float
        }
      });

      this.last_save = last_save;
      dungeons.essence_unlocks = perks;
      dungeons.essences = {
        essence_undead,
        essence_diamond,
        essence_dragon,
        essence_gold,
        essence_ice,
        essence_wither,
        essence_spider,
      };
      this.dungeons = dungeons;
      this.appendDungeonData();
      this.potion_data = {
        active_potions,
        paused_potions,
        disabled_potions,
        cake_buffs: cake_soul_buffs,
      };
      this.hotm_data = {
        mining_core,
        forge,
      };

      this.first_join = first_join;
      this.coin_purse = Math.round(coin_purse);
      this.fairy_souls_collected = fairy_souls_collected;
      this.fairy_souls = fairy_souls;
      this.fairy_exchanges = fairy_exchanges;
      this.pets = pets;
      this.skills = skills;
      this.average_skill_level = parseFloat((averageSkillLevel / 8).toFixed(2));
      // add average_skill_level to 'this' while also getting the average to 2 decimal places
      this.collection_data = {
        collection_totals: collection,
        collection_tiers,
        collections_unlocked: Object.keys(collection_tiers).length,
      };
      this.minions = getUnlockedTier(crafted_generators);
      this.slayer = {
        zombie: getSlayer(slayer_bosses.zombie || {}, 'zombie'),
        spider: getSlayer(slayer_bosses.spider || {}, 'spider'),
        wolf: getSlayer(slayer_bosses.wolf || {}, 'wolf'),
        enderman: getSlayer(slayer_bosses.enderman || {}, 'enderman'),
      };

      const highestRarity = {};
      this.pets = this.pets.map((p) => {
        const pet = new Pet(p);
        const { type, rarity } = pet;
        if (!(type in highestRarity) || constants.petValue[rarity] > highestRarity[type]) {
          highestRarity[type] = constants.petValue[rarity];
        }
        return pet;
      });
      this.active_pet = this.pets.find((p) => p.active) || new Pet({});
      this.pet_score = Object.values(highestRarity).reduce((a, b) => a + b, 0);

      this.bonuses = this.getBonuses();
      this.applyBonuses();
      this.getPristineStats();
      this.attributes.effective_health = this.getEHP();

      // cleanup of relocated keys:
      this.deleteObjectKeys(this, {
        player_bags: ['quiver', 'fishing_bag', 'potion_bag', 'talisman_bag', 'candy_bag'],
        player_inventories: ['inventory', 'armor', 'ender_chest', 'personal_vault', 'backpack', 'backpack_icons'],
      });

      return this;
    })();
  }

  getPristineStats() {
    const { gemstones } = constants.bonusStats;
    // check if actibe armour has any gems that are topaz
    if (this.armor.length < 1) return;
    for (let i = 0; i < this.armor.length; i++) {
      const armourPiece = this.armor[i];

      const hasGems = armourPiece.attributes?.gems;
      if (hasGems) {
        const gemKeys = Object.keys(hasGems);
        for (let t = 0; t < gemKeys.length; t++) {
          if (gemKeys[t].includes('TOPAZ_')) {
            this.attributes.pristine += gemstones.TOPAZ[hasGems[gemKeys[t]]];
          } else if (gemKeys[t].match(/UNIVERSAL_\d_gem/g) && hasGems[gemKeys[t]].includes('TOPAZ')) {
            this.attributes.pristine += gemstones.TOPAZ[`${hasGems[gemKeys[t].replace(/_gem/, '')]}`];
          }
        }
      }
    }
    // check for mining tools with pristine stat on hotbar

    let pristine_values = [];
    const temp_inv = this.inventory;
    for (let i = 0; i < 8; i++) {
      const item = temp_inv[`${i}`];
      const itemType = item?.type;
      if (['pickaxe', 'drill', 'gauntlet'].includes(itemType)) {
        const item_json = temp_inv[i];
        item_json.pristine = 0;
        if (item_json?.attributes?.gems && item_json?.attributes?.enchantments) {
          const gem_location = item_json.attributes?.gems;
          const enchants_locations = item_json.attributes?.enchantments;
          const gem_Keys = Object.keys(gem_location);
          for (let t = 0; t < gem_Keys.length; t++) {
            if (gem_Keys[t].includes('TOPAZ_')) {
              item_json.pristine += gemstones.TOPAZ[gem_location[gem_Keys[t]]];
            } else if (gem_Keys[t].match(/UNIVERSAL_\d_gem/g) && gem_location[gem_Keys[t]].includes('TOPAZ')) {
              item_json.pristine += gemstones.TOPAZ[`${gem_location[gem_Keys[t].replace(/_gem/, '')]}`];
            }
          }
          if (enchants_locations.pristine) {
            item_json.pristine += enchants_locations.pristine;
          }
          pristine_values.push(item_json.pristine);
        }
      }
    }
    if (pristine_values.length > 1) {
      pristine_values.sort((a, b) => a - b);
      this.attributes.pristine += pristine_values[0];
    }

    // reset array
    pristine_values = [];
    // check if player has power artifact
    this.active_accessories.forEach((object) => {
      if (object.attributes.id === 'POWER_ARTIFACT') {
        const gemstoneValue = gemstones.TOPAZ[object.attributes?.gems?.TOPAZ_0];
        if (gemstoneValue) {
          pristine_values.push(gemstoneValue);
        } else {
          pristine_values.push(0);
        }
      }
    });
    if (pristine_values.length > 1) {
      pristine_values.sort((a, b) => a - b);
      this.attributes.pristine += pristine_values[0];
    } else {
      this.attributes.pristine += pristine_values[0];
    }

    if (this.active_pet?.name === 'Bal' && this.active_pet?.rarity === 'LEGENDARY') {
      const { level } = this.active_pet;
      const multiplier = 0.15;
      const pristineMulti = 1 + Math.floor(level * multiplier);
      const newPristine = this.attributes.pristine * pristineMulti;
      this.attributes.pristine = newPristine;
    }
  }

  getSkillBonus(skill) {
    const bonus = { ...constants.statTemplate };
    const skillStats = constants.bonusStats[`${skill}_skill`];
    const { level, maxLevel } = this.skills[skill];
    try {
      const steps = Object.keys(skillStats).sort((a, b) => a - b).map((a) => Number(a));

      for (let x = 1; x <= maxLevel; x += 1) {
        if (level < x) break;

        const skillStep = steps.slice().reverse().find((a) => a <= x);
        const skillBonus = skillStats[skillStep];
        Object.keys(skillBonus).forEach((type) => {
          bonus[type] += skillBonus[type];
        });
      }
      return util.removeZeroes(bonus);
    } catch {
      return {};
    }
  }

  getFairyBonus() {
    const bonus = {
      speed: 0, strength: 0, defense: 0, health: 0,
    };
    bonus.speed = Math.floor(this.fairy_exchanges / 10);

    for (let i = 0; i < this.fairy_exchanges; i += 1) {
      bonus.strength += (i + 1) % 5 === 0 ? 2 : 1;
      bonus.defense += (i + 1) % 5 === 0 ? 2 : 1;
      bonus.health += 3 + Math.floor(i / 2);
    }
    return bonus;
  }

  getCakeBonus() {
    const bonus = { health: 0 };
    const cakeBag = this.active_accessories.find((item) => item.getId() === 'NEW_YEAR_CAKE_BAG') || {};
    const cakes = (cakeBag.inventory || []).filter((item) => item.getId() === 'NEW_YEAR_CAKE');
    // Get unique years
    bonus.health += [...new Set(cakes.map((i) => i.attributes.cake_year))].length;
    return bonus;
  }

  getItemBonuses(name) {
    const items = this[name];
    const bonus = { ...constants.statTemplate };
    items.forEach((item) => {
      Object.keys(item.stats || {}).forEach((stat) => {
        bonus[stat] += item.stats[stat];
      });
    });
    return util.removeZeroes(bonus);
  }

  getSlayerBonus(slayer) {
    const bonus = { ...constants.statTemplate };
    const slayerBonuses = constants.bonusStats[`${slayer}_slayer`];
    for (let level = this.slayer[slayer].claimed_levels; level > 0; level -= 1) {
      if (level in slayerBonuses) {
        Object.keys(slayerBonuses[level]).forEach((stat) => {
          bonus[stat] += slayerBonuses[level][stat];
        });
      }
    }
    return util.removeZeroes(bonus);
  }

  getPetScoreBonus() {
    let bonus = { magic_find: 0 };
    const { pet_score } = this;
    const milestones = Object.keys(constants.petRewards);
    for (let x = milestones.length; x > 0; x -= 1) {
      if (pet_score > milestones[x]) {
        bonus = constants.petRewards[milestones[x]];
        break;
      }
    }
    return bonus;
  }

  isArmorSet(startsWith, requiredPieces = 4) {
    return this.armor.filter((a) => a.getId() !== null && a.getId().startsWith(startsWith))
      .length === requiredPieces;
  }

  // Returns accessories that provide bonuses
  getActiveAccessories() {
    const { accessoryUpgrades } = constants;
    let accessories = [
      ...this.talisman_bag,
      ...this.inventory,
      ...this.armor,
    ].filter((item) => item.type === 'accessory');

    const maxCampFireTier = Math.max(...accessories.filter((i) => i.getId().startsWith('CAMPFIRE_TALISMAN_'))
      .map((a) => a.getId().split('_').pop()));
    const maxRingTier = Math.max(...accessories.filter((i) => i.getId().startsWith('WEDDING_RING_'))
      .map((a) => a.getId().split('_').pop()));
    // Don't count lower tier talismans
    accessories.forEach((item) => {
      const id = item.getId();
      if (id.startsWith('CAMPFIRE_TALISMAN_')) {
        const tier = parseInt(id.split('_').pop(), 10);
        if (tier < maxCampFireTier) item.active = false;
      }
      if (id.startsWith('WEDDING_RING_')) {
        const tier = parseInt(id.split('_').pop(), 10);
        if (tier < maxRingTier) item.active = false;
      }
      // Don't count accessories that have a higher tier
      if (id in accessoryUpgrades
        && accessories.filter((i) => accessoryUpgrades[id].includes(i.getId())).length > 0) {
        item.active = false;
      }
    });
    // Don't count duplicated accessories
    accessories = [...new Map(accessories.map((item) => [item.attributes.id, item])).values()];
    this.active_accessories = accessories.filter((item) => item.active);
  }

  getBonuses() {
    const bonuses = [];
    this.getActiveAccessories();
    // New year cake bag
    bonuses.push({
      type: 'NEW_YEAR_CAKEBAG',
      bonus: this.getCakeBonus(),
    });
    // Fairy souls
    bonuses.push({
      type: 'FAIRY_SOULS',
      bonus: this.getFairyBonus(),
    });
    // Slayers
    Object.keys(this.slayer).forEach((slayer) => {
      bonuses.push({
        type: `SLAYER_BONUS_${slayer.toUpperCase()}`,
        bonus: this.getSlayerBonus(slayer),
      });
    });
    // Pet rewards
    bonuses.push({
      type: 'PET_SCORE',
      bonus: this.getPetScoreBonus(),
    });
    // Melody
    if (this.active_accessories.some((i) => i.getId() === 'MELODY_HAIR')) {
      bonuses.push({
        type: 'MELODY',
        bonus: { intelligence: 26 },
      });
    }
    // Skills
    const { skills } = this;
    Object.keys(skills).forEach((skill) => {
      if (!['runecrafting', 'carpentry'].includes(skill)) {
        bonuses.push({
          type: `SKILL_BONUS_${skill.toUpperCase()}`,
          bonus: this.getSkillBonus(skill),
        });
      }
    });
    // Accessories
    bonuses.push({
      type: 'ACCESSORIES',
      bonus: this.getItemBonuses('active_accessories'),
    });
    // Day & Night Crystals
    if (this.active_accessories.filter((i) => ['DAY_CRYSTAL', 'NIGHT_CRYSTAL'].includes(i.getId())).length === 2) {
      bonuses.push({
        type: 'DAY_NIGHT_CRYSTAL',
        bonus: { defense: 5, strength: 5 },
      });
    }
    // Armor
    bonuses.push({
      type: 'ARMOR',
      bonus: this.getItemBonuses('armor'),
    });
    // Superior Dragon Armor bonus
    if (this.isArmorSet('SUPERIOR_DRAGON_')) {
      const superiorBonus = { ...constants.statTemplate };
      Object.keys(superiorBonus).forEach((stat) => {
        superiorBonus[stat] = 1.05;
      });
      bonuses.push({
        type: 'SUPERIOR_BLOOD',
        operation: 'multiply',
        bonus: superiorBonus,
      });
    }
    // TODO - Other special armor bonuses
    // Active weapon?
    // Pet
    bonuses.push({
      type: 'PET',
      bonus: this.active_pet.stats || {},
    });
    return bonuses;
  }

  applyBonuses() {
    function addStats(elements, player) {
      elements.forEach((element) => {
        player.attributes = util.modifyStats(element.bonus, player.attributes);
      });
    }
    function multiplyStats(elements, player) {
      elements.forEach((element) => {
        player.attributes = util.modifyStats(element.bonus, player.attributes, '*');
      });
    }
    function applyBonuses(bonuses, player) {
      const additions = [];
      const multiplications = [];
      bonuses.forEach((k) => {
        const operation = k.operation || 'add';
        if (operation === 'add') {
          additions.push(k);
        } else {
          multiplications.push(k);
        }
      });
      addStats(additions, player);
      multiplyStats(multiplications, player);
    }

    applyBonuses(this.bonuses, this);
    // Pet abilities
    const petAbilities = this.active_pet.getAbilityStats(this);
    this.bonuses = this.bonuses.concat(petAbilities);
    applyBonuses(petAbilities, this);

    if (this.isArmorSet('CHEAP_TUXEDO_', 3)) {
      this.attributes.health = 75;
    }
    if (this.isArmorSet('FANCY_TUXEDO_', 3)) {
      this.attributes.health = 150;
    }
    if (this.isArmorSet('ELEGANT_TUXEDO_', 3)) {
      this.attributes.health = 250;
    }
  }

  getEHP() {
    if (this.attributes.defense <= 0) return this.attributes.health;
    return Math.round(this.attributes.health * (1 + this.attributes.defense / 100));
  }

  //  eslint-disable-next-line class-methods-use-this
  deleteObjectKeys(object_location, key_object) {
    Object.keys(key_object).forEach((key) => {
      const key_array = key_object[key];
      for (let i = 0; i < key_array.length; i++) {
        try {
          delete object_location[key_array[i]];
        // eslint-disable-next-line no-empty
        } catch (err) {
        }
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  addLevelsToDungeonsLocation(directive) {
    /*
      This function takes in a location from the this object and loops
      over the location given to see if the location has an experience key.
      If it does, it will then calculate the floatLevel and level and add it to the key.
    */
    const location = directive;
    const location_keys = Object.keys(location);

    for (let i = 0; i < location_keys.length; i++) {
      const key = location[location_keys[i]];
      if (key?.experience) {
        const floatLevel = util.calculateCatacombsLevel(key.experience);
        const level = Math.floor(floatLevel);

        key.floatLevel = floatLevel;
        key.level = level;
      }
    }
  }

  appendDungeonData() {
    if (this.dungeons?.dungeon_types) {
      this.addLevelsToDungeonsLocation(this.dungeons.dungeon_types);
    }
    if (this.dungeons?.player_classes) {
      this.addLevelsToDungeonsLocation(this.dungeons.player_classes);
    }
  }
}

module.exports = Player;
