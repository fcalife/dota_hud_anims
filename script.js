// Calibrated against assets/hud_base.png (335px wide).
const abilityCenters = [0.303, 0.497, 0.691, 0.885];
let abilitySlotCounts = [2, 2, 2, 2];
let currentStage = "early";

const TYPES = ["power", "protection", "space", "time"];
const RARITIES = ["common", "rare", "epic"];
const RARITY_ORDER = { common: 0, rare: 1, epic: 2 };
const RARITY_MULTIPLIER = { common: 1, rare: 2, epic: 3 };
const TYPE_ORDER = { power: 0, protection: 1, space: 2, time: 3 };
const ABILITY_LABELS = ["ARCTIC BURN (Q)", "SPLINTER BLAST (W)", "COLD EMBRACE (E)", "WINTER'S CURSE (R)"];
const BASE_EFFECTS_BY_ABILITY = {
  1: {
    power: [{ value: 1, unit: "%", label: "damage per second" }],
    protection: [{ value: 10, unit: "%", label: "movement slow" }],
    space: [{ value: 125, unit: "", label: "attack range" }],
    time: [{ value: 1, unit: "s", label: "duration" }]
  },
  2: {
    power: [
      { value: 50, unit: "", label: "damage" },
      { value: 50, unit: "", label: "radius" }
    ],
    protection: [{ value: 10, unit: "%", label: "movement slow" }],
    space: [
      { value: 75, unit: "", label: "cast range" },
      { value: 50, unit: "", label: "radius" }
    ],
    time: [{ value: 200, unit: "", label: "projectile speed" }]
  },
  3: {
    power: [{ value: 1, unit: "%", label: "healing per second" }],
    protection: [{ value: 1, unit: "s", label: "duration" }],
    space: [{ value: 125, unit: "", label: "cast range" }],
    time: [
      { value: -1, unit: "s", label: "duration" },
      { value: 2, unit: "%", label: "healing per second" }
    ]
  },
  4: {
    power: [{ value: 1, unit: "s", label: "max duration" }],
    protection: [{ value: 100, unit: "", label: "area of effect radius" }],
    space: [{ value: 150, unit: "", label: "cast range" }],
    time: [{ value: 50, unit: "", label: "enemy attack speed" }]
  }
};

const abilitySlotsEl = document.getElementById("abilitySlots");
const inventoryEl = document.getElementById("inventory");
const effectsPanelEl = document.getElementById("effectsPanel");
const stageButtons = Array.from(document.querySelectorAll(".slot-count-btn"));

init();

function init() {
  setupStageButtons();
  setupInventoryDrop();
  applyStage(currentStage);
}

function setupStageButtons() {
  for (const button of stageButtons) {
    button.addEventListener("click", () => {
      const nextStage = button.dataset.stage;
      if (!nextStage || nextStage === currentStage) {
        return;
      }
      applyStage(nextStage);
    });
  }
}

function applyStage(stage) {
  currentStage = stage;
  for (const btn of stageButtons) {
    btn.classList.toggle("is-active", btn.dataset.stage === stage);
  }

  abilitySlotCounts = buildSlotCountsForStage(stage);
  renderSlots();
  renderInventoryForStage(stage);
  renderEffectsPanel();
}

function renderInventoryForStage(stage) {
  inventoryEl.innerHTML = "";
  const inventoryGems = buildInventoryGems(stage);
  for (const gemDef of inventoryGems) {
    inventoryEl.appendChild(createGemEl(gemDef));
  }
  sortInventory();
}

function buildInventoryGems(stage) {
  const gems = [];
  let index = 0;

  if (stage === "early") {
    for (let i = 0; i < 4; i += 1) {
      gems.push(createGemDef(randomType(), "common", ++index));
    }
    return gems;
  }

  if (stage === "lategame") {
    for (let i = 0; i < 4; i += 1) {
      gems.push(createGemDef(randomType(), "epic", ++index));
    }
    for (let i = 0; i < 6; i += 1) {
      gems.push(createGemDef(randomType(), "rare", ++index));
    }
    for (const type of TYPES) {
      gems.push(createGemDef(type, "common", ++index));
      gems.push(createGemDef(type, "common", ++index));
    }
    return gems;
  }

  // Midgame uses the current/default rules.
  for (const type of TYPES) {
    gems.push(createGemDef(type, "common", ++index));
  }
  for (let i = 0; i < 2; i += 1) {
    gems.push(createGemDef(randomType(), "common", ++index));
  }
  for (const type of TYPES) {
    gems.push(createGemDef(type, "rare", ++index));
  }
  const [epicTypeA, epicTypeB] = pickDistinctTypes(2);
  gems.push(createGemDef(epicTypeA, "epic", ++index));
  gems.push(createGemDef(epicTypeB, "epic", ++index));

  return gems;
}

function buildSlotCountsForStage(stage) {
  if (stage === "early") {
    const counts = [0, 0, 0, 0];
    const chosen = pickDistinctAbilityIndices(2);
    for (const index of chosen) {
      counts[index] = 1;
    }
    return counts;
  }

  if (stage === "lategame") {
    return [3, 3, 3, 3];
  }

  // Midgame: 2-3 abilities with 2 slots, others with 1.
  const counts = [1, 1, 1, 1];
  const twoSlotAbilityCount = Math.random() < 0.5 ? 2 : 3;
  const chosen = pickDistinctAbilityIndices(twoSlotAbilityCount);
  for (const index of chosen) {
    counts[index] = 2;
  }
  return counts;
}

function pickDistinctAbilityIndices(count) {
  const all = [0, 1, 2, 3];
  shuffleInPlace(all);
  return all.slice(0, count);
}

function pickDistinctTypes(count) {
  const all = [...TYPES];
  shuffleInPlace(all);
  return all.slice(0, count);
}

function randomType() {
  return TYPES[Math.floor(Math.random() * TYPES.length)];
}

function shuffleInPlace(values) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }
}

function createGemDef(type, rarity, index) {
  return {
    id: `${type}-${rarity}-${index}`,
    type,
    rarity
  };
}

function renderSlots() {
  abilitySlotsEl.innerHTML = "";

  abilityCenters.forEach((center, abilityIndex) => {
    const column = document.createElement("div");
    column.className = "ability-column";
    column.style.left = `${center * 100}%`;

    for (let i = 0; i < abilitySlotCounts[abilityIndex]; i += 1) {
      const slot = document.createElement("div");
      slot.className = "slot dropzone";
      slot.dataset.zoneType = "slot";
      slot.dataset.ability = String(abilityIndex);
      slot.dataset.slot = String(i);
      setupDropZone(slot);
      column.appendChild(slot);
    }

    abilitySlotsEl.appendChild(column);
  });
}

function setupInventoryDrop() {
  setupDropZone(inventoryEl);
}

function setupDropZone(zone) {
  zone.addEventListener("dragover", (event) => {
    if (!isGemDrag(event)) {
      return;
    }
    event.preventDefault();
    zone.classList.add("is-over");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("is-over");
  });

  zone.addEventListener("drop", (event) => {
    if (!isGemDrag(event)) {
      return;
    }

    event.preventDefault();
    zone.classList.remove("is-over");

    const gemId = event.dataTransfer.getData("text/gem-id");
    const gemEl = document.querySelector(`.gem[data-instance-id="${gemId}"]`);

    if (!gemEl) {
      return;
    }

    if (zone.dataset.zoneType === "slot") {
      const existingGem = zone.querySelector(".gem");
      if (existingGem === gemEl) {
        return;
      }
      if (existingGem) {
        moveGemToZone(existingGem, inventoryEl);
      }
    }

    moveGemToZone(gemEl, zone);
  });
}

function moveGemToZone(gemEl, zone) {
  const oldParent = gemEl.parentElement;
  if (oldParent?.dataset?.zoneType === "slot") {
    resetSlotShape(oldParent);
  }

  zone.appendChild(gemEl);

  if (zone.dataset.zoneType === "slot") {
    applySlotShape(zone, gemEl.dataset.rarity);
  }
  updateGemTooltipForZone(gemEl, zone);

  if (oldParent === inventoryEl || zone === inventoryEl) {
    sortInventory();
  }
  renderEffectsPanel();
}

function applySlotShape(slot, rarity) {
  for (const value of RARITIES) {
    slot.classList.remove(`slot-${value}`);
  }
  if (RARITIES.includes(rarity)) {
    slot.classList.add(`slot-${rarity}`);
  }
}

function resetSlotShape(slot) {
  for (const value of RARITIES) {
    slot.classList.remove(`slot-${value}`);
  }
}

function createGemEl(gemDef) {
  const gem = document.createElement("div");
  gem.className = `gem gem-${gemDef.rarity} type-${gemDef.type}`;
  gem.dataset.gem = gemDef.id;
  gem.dataset.type = gemDef.type;
  gem.dataset.rarity = gemDef.rarity;
  gem.dataset.instanceId = `gem-${crypto.randomUUID()}`;
  gem.draggable = true;
  const tooltipText = `${capitalize(gemDef.rarity)} ${capitalize(gemDef.type)} gem`;
  gem.title = tooltipText;
  gem.setAttribute("aria-label", tooltipText);

  gem.appendChild(createTypeIcon(gemDef.type));

  gem.addEventListener("dragstart", (event) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/gem-id", gem.dataset.instanceId);
  });

  return gem;
}

function createTypeIcon(type) {
  const icon = document.createElement("span");
  icon.className = "gem-icon";

  const svgMarkupByType = {
    power: '<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,1.5 9.7,5.2 13.8,5.7 10.8,8.5 11.6,12.5 8,10.4 4.4,12.5 5.2,8.5 2.2,5.7 6.3,5.2" /></svg>',
    protection: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1 L13 3 V7 C13 10 11 12.5 8 15 C5 12.5 3 10 3 7 V3 Z" /></svg>',
    space: '<svg viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="8" rx="5.2" ry="2.7" /><circle cx="12.2" cy="8" r="1" /></svg>',
    time: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><line x1="8" y1="8" x2="8" y2="4.6" /><line x1="8" y1="8" x2="10.6" y2="9.4" /></svg>'
  };

  icon.innerHTML = svgMarkupByType[type] ?? '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5" /></svg>';
  return icon;
}

function isGemDrag(event) {
  return event.dataTransfer?.types?.includes("text/gem-id");
}

function sortInventory() {
  const gems = Array.from(inventoryEl.querySelectorAll(".gem"));
  gems.sort((a, b) => {
    const rarityDiff = RARITY_ORDER[a.dataset.rarity] - RARITY_ORDER[b.dataset.rarity];
    if (rarityDiff !== 0) {
      return rarityDiff;
    }
    return TYPE_ORDER[a.dataset.type] - TYPE_ORDER[b.dataset.type];
  });
  for (const gem of gems) {
    inventoryEl.appendChild(gem);
  }
}

function updateGemTooltipForZone(gemEl, zone) {
  const baseText = `${capitalize(gemEl.dataset.rarity)} ${capitalize(gemEl.dataset.type)} gem`;

  if (zone.dataset.zoneType !== "slot") {
    gemEl.title = baseText;
    gemEl.setAttribute("aria-label", baseText);
    return;
  }

  const abilityIndex = Number(zone.dataset.ability);
  if (!Number.isInteger(abilityIndex) || abilityIndex < 0) {
    gemEl.title = baseText;
    gemEl.setAttribute("aria-label", baseText);
    return;
  }

  const effectText = getScaledEffects(gemEl.dataset.type, gemEl.dataset.rarity, abilityIndex)
    .map(formatEffect)
    .join(", ");

  const tooltipText = effectText || baseText;
  gemEl.title = tooltipText;
  gemEl.setAttribute("aria-label", tooltipText);
}

function renderEffectsPanel() {
  effectsPanelEl.innerHTML = "";

  for (let abilityIndex = 0; abilityIndex < abilityCenters.length; abilityIndex += 1) {
    const card = document.createElement("div");
    card.className = "effects-card";

    const title = document.createElement("h3");
    title.textContent = ABILITY_LABELS[abilityIndex];
    card.appendChild(title);

    const slots = Array.from(document.querySelectorAll(`.slot[data-ability="${abilityIndex}"]`));
    const slottedGems = [];

    for (const slot of slots) {
      const gem = slot.querySelector(".gem");
      if (!gem) {
        continue;
      }
      slottedGems.push(gem);
    }

    const summaryLine = document.createElement("p");
    summaryLine.className = "effects-entry";
    summaryLine.innerHTML = `Slotted: ${formatSlottedGemsSummary(slottedGems)}`;
    card.appendChild(summaryLine);

    const totalsHeader = document.createElement("p");
    totalsHeader.className = "effects-entry";
    totalsHeader.textContent = "Total effects:";
    card.appendChild(totalsHeader);

    if (slottedGems.length === 0) {
      const empty = document.createElement("p");
      empty.className = "effects-empty";
      empty.textContent = "none";
      card.appendChild(empty);
    } else {
      const totals = totalizeEffectsForAbility(slottedGems, abilityIndex);
      for (const effect of totals) {
        const entry = document.createElement("p");
        entry.className = "effects-entry";
        entry.textContent = formatEffect(effect);
        card.appendChild(entry);
      }
    }

    effectsPanelEl.appendChild(card);
  }
}

function formatSlottedGemsSummary(slottedGems) {
  if (slottedGems.length === 0) {
    return "none";
  }

  const counts = new Map();
  for (const gem of slottedGems) {
    const key = `${gem.dataset.rarity}|${gem.dataset.type}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const ordered = Array.from(counts.entries())
    .map(([key, count]) => {
      const [rarity, type] = key.split("|");
      return { rarity, type, count };
    })
    .sort((a, b) => {
      const rarityDiff = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity];
      if (rarityDiff !== 0) {
        return rarityDiff;
      }
      return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    });

  return ordered
    .map((entry) => {
      const rarityLabel = entry.rarity === "common" ? "" : `${entry.rarity} `;
      return `${rarityLabel}<strong>${capitalize(entry.type)}</strong> x${entry.count}`;
    })
    .join(", ");
}

function totalizeEffectsForAbility(slottedGems, abilityIndex) {
  const totals = new Map();
  for (const gem of slottedGems) {
    const effects = getScaledEffects(gem.dataset.type, gem.dataset.rarity, abilityIndex);
    for (const effect of effects) {
      const key = `${effect.unit}|${effect.label}`;
      if (!totals.has(key)) {
        totals.set(key, { value: 0, unit: effect.unit, label: effect.label });
      }
      totals.get(key).value += effect.value;
    }
  }
  return Array.from(totals.values());
}

function getScaledEffects(type, rarity, abilityIndex) {
  const abilityKey = abilityIndex + 1;
  const baseEffects = BASE_EFFECTS_BY_ABILITY[abilityKey]?.[type] ?? [];
  const multiplier = RARITY_MULTIPLIER[rarity] ?? 1;

  return baseEffects.map((effect) => ({
    value: effect.value * multiplier,
    unit: effect.unit,
    label: effect.label
  }));
}

function formatEffect(effect) {
  const sign = effect.value >= 0 ? "+" : "";
  return `${sign}${effect.value}${effect.unit} ${effect.label}`;
}

function capitalize(value) {
  if (!value) {
    return "";
  }
  return value[0].toUpperCase() + value.slice(1);
}

