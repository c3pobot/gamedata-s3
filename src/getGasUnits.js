'use strict'
const getUnitTier = (unitTier = [])=>{
  let res = []
  for(let i in unitTier) res.push({ tier: unitTier[i].tier, equipmentSet: unitTier[i].equipmentSet })
  return res
}
module.exports = (units = [])=>{
  let res = []
  for(let i in units){
    let tempObj = {
      baseId: units[i].baseId,
      categoryId: units[i].categoryId,
      combatType: units[i].combatType,
      crew: units[i].crew,
      descKey: units[i].descKey,
      exampleSquad: units[i].exampleSquad,
      forceAlignment: units[i].forceAlignment,
      id: units[i].id,
      legend: units[i].legend,
      maxRarity: units[i].maxRarity,
      maxLevelOverride: units[i].maxLevelOverride,
      nameKey: units[i].nameKey,
      obtainable: units[i].obtainable,
      obtainableTime: units[i].obtainableTime,
      rarity: units[i].rarity,
      skillReference: units[i].skillReference,
      limitBreakRef: units[i].limitBreakRef,
      uniqueAbilityRef: units[i].uniqueAbilityRef,
      basicAttackRef: units[i].basicAttackRef,
      leaderAbilityRef: units[i].leaderAbilityRef,
      thumbnailName: units[i].thumbnailName,
      unitTier: getUnitTier(units[i].unitTier || [])
    }
    res.push(tempObj)
  }
  return res
}
