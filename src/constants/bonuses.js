module.exports = {
  // Object with skill, slayer bonuses and enchantment bonuses
  bonusStats: {
    taming_skill: {
      1: {
        pet_luck: 1,
      },
    },

    farming_skill: {
      1: {
        health: 2,
        farming_fortune: 4,
      },
      15: {
        health: 3,
        farming_fortune: 4,
      },
      20: {
        health: 4,
        farming_fortune: 4,
      },
      26: {
        health: 5,
        farming_fortune: 4,
      },
    },

    combat_skill: {
      1: {
        crit_chance: 0.5,
        damage_increase: 0.04,
      },
    },

    mining_skill: {
      1: {
        defense: 1,
        mining_fortune: 4,
      },
      15: {
        defense: 2,
        mining_fortune: 4,
      },
    },

    foraging_skill: {
      1: {
        strength: 1,
        foraging_fortune: 4,
      },
      15: {
        strength: 2,
        foraging_fortune: 4,
      },
    },

    fishing_skill: {
      1: {
        health: 2,
      },
      15: {
        health: 3,
      },
      20: {
        health: 4,
      },
      26: {
        health: 5,
      },
    },

    enchanting_skill: {
      1: {
        intelligence: 1,
        ability_damage: 0.5,
      },
      15: {
        intelligence: 2,
        ability_damage: 0.5,
      },
    },

    alchemy_skill: {
      1: {
        intelligence: 1,
      },
      15: {
        intelligence: 2,
      },
    },

    carpentry_skill: {
      1: {

      },
    },

    runecrafting_skill: {
      1: {

      },
    },

    zombie_slayer: {
      1: {
        health: 2,
      },
      3: {
        health: 3,
      },
      5: {
        health: 4,
      },
      7: {
        health: 5,
      },
      9: {
        health: 6,
      },
    },

    spider_slayer: {
      1: {
        crit_damage: 1,
      },
      5: {
        crit_damage: 2,
      },
      7: {
        crit_damage: 0,
        crit_chance: 1,
      },
      8: {
        crit_chance: 0,
        crit_damage: 3,
      },
    },

    wolf_slayer: {
      1: {
        speed: 1,
      },
      2: {
        health: 2,
      },
      3: {
        speed: 1,
      },
      4: {
        health: 2,
      },
      5: {
        crit_damage: 1,
      },
      6: {
        health: 3,
      },
      7: {
        crit_damage: 2,
      },
      8: {
        speed: 1,
      },
    },
    enderman_slayer: {
      1: {
        health: 1,
      },
      2: {
        intelligence: 1,
      },
      3: {
        health: 2,
      },
      4: {
        intelligence: 2,
      },
      5: {
        health: 3,
      },
      6: {
        intelligence: 3,
      },
      7: {
        health: 4,
      },
      8: {
        intelligence: 4,
      },
    },
    gemstones: {
      TOPAZ: {
        ROUGH: 0.4,
        FLAWED: 0.8,
        FINE: 1.2,
        FLAWLESS: 1.6,
        PERFECT: 2,
      },
    },
    enchantments: {
      sharpness: {
        1: {
          damage_multiplicator: 0.05,
        },
      },

      ender: {
        1: {
          damage_multiplicator: 0.12,
        },
      },

      giant_killer: {
        1: {
          damage_multiplicator: 0.05,
        },
      },

      cubism: {
        1: {
          damage_multiplicator: 0.1,
        },
      },

      impaling: {
        1: {
          damage_multiplicator: 0.125,
        },
      },

      critical: {
        1: {
          crit_damage: 10,
        },
      },

      first_strike: {
        1: {
          damage_multiplicator: 0.25,
        },
      },

      power: {
        1: {
          damage_multiplicator: 0.08,
        },
      },
    },
  },
};
