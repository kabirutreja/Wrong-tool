function onOpen() 
{

  //var offlineShards = calculateOfflineEarnings();
  

  updateShopMenu();
  syncLeaderboard();

  //if (offlineShards > 0) 
 // {
    

  //  showOfflineEarnings(offlineShards);
  //}
}
function createOpenTrigger()
{
  var triggers = ScriptApp.getProjectTriggers();

  for(var i = 0; i < triggers.length; i++)
  {
    if(triggers[i].getHandlerFunction() == 'onSpreadsheetOpen')
    {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('onSpreadsheetOpen')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();
}
function onSpreadsheetOpen()
{
  var offlineShards = calculateOfflineEarnings();

  updateShopMenu();

  if(offlineShards > 0)
  {
    showOfflineEarnings(offlineShards);
  }
}
function showOfflineEarnings(offlineShards)
 {
     var template = HtmlService.createTemplateFromFile('OfflineEarnings');

  template.offlineShards = formatNumber(offlineShards);

  var html = template.evaluate().setWidth(400).setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Welcome Back!');
}
function buyMiner() {
  var cost = getBuildingCost(15, 'miner');
  buyminer(cost, 0.1, 'miner');
}

function buyMinecart() {
  var cost = getBuildingCost(100, 'minecart');
  buyminer(cost, 0.3, 'minecart');
}

function buyCrystalMage() {
  var cost = getBuildingCost(1100, 'crystalmage');
  buyminer(cost, 1, 'crystalmage');
}

function buyCaveDragon() {
  var cost = getBuildingCost(12000, 'cavedragon');
  buyminer(cost, 4, 'cavedragon');
}

function buyMagmaEngine() {
  var cost = getBuildingCost(1500000, 'magmaengine');
  buyminer(cost, 15, 'magmaengine');
}

function buyAliens() {
  var cost = getBuildingCost(20000000, 'aliens');
  buyminer(cost, 75, 'aliens');
}
function Setup()
{

  
  //get prop
  const userProperties = PropertiesService.getUserProperties();

userProperties.setProperty('goldenCrystalUnlocked', 'false');
  
  userProperties.setProperty('shards',1);
  var count = Number(userProperties.getProperty('shards') || 0);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DIAMOND");
  var range = sheet.getRange("A2");
  
  range.setValue(count);

  userProperties.setProperty('shardspersecond',0);
  var countpersecond = Number(userProperties.getProperty('shardspersecond') || 0);
  var clickrate = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DIAMOND").getRange("A3");
  
  
  clickrate.setValue(countpersecond.toString() +' Shards/Second')
  // building count
  userProperties.setProperty('miner',0);
  userProperties.setProperty('minecart',0);
  userProperties.setProperty('crystalmage',0);
  userProperties.setProperty('cavedragon',0);
  userProperties.setProperty('magmaengine',0);
  userProperties.setProperty('aliens',0);
  userProperties.setProperty('clickPower',1);
  userProperties.setProperty('clickUpgradeLevel',0);
  //////////////////
  userProperties.setProperty('lastPlayed',Date.now().toString())
  userProperties.setProperty('totalClicks','0');
  userProperties.setProperty('lifetimeShardsEarned','0');
  var achievementIds = ['firstSpark','crystalCollector','gettingRich','crystalTycoon','dedicatedClicker'];
  achievementIds.forEach(function(id)
  {
    userProperties.deleteProperty('achievement_claimed_' + id);
  });
  
  MinerTrigger();
  updateShopMenu();
}
function getOwned(building)
{
  const userProperties = PropertiesService.getUserProperties();
  return Number(userProperties.getProperty(building) || 0);
}

function minerclick()
{
  const userProperties = PropertiesService.getUserProperties();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND');
  var count = Number(userProperties.getProperty('shards') || 0);
  var shardspersecond = Number(userProperties.getProperty('shardspersecond') || 0);
  var shardsToAdd = getEffectiveShardsPerSecond() * 60;
  count += shardsToAdd;
  userProperties.setProperty('shards', count);
  
  sheet.getRange("A2").setValue(formatNumber(count));
  trackAchievementProgress(shardsToAdd,false);
  
  syncLeaderboard();
}
function MinerTrigger()
{
  var triggers = ScriptApp.getProjectTriggers();
   for(var i = 0; i < triggers.length; i++)
  {
    if(triggers[i].getHandlerFunction() == 'minerclick')
    {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('minerclick').timeBased().everyMinutes(1).create();
}
function createOpenTrigger()
{
  var triggers = ScriptApp.getProjectTriggers();

  for(var i = 0; i < triggers.length; i++)
  {
    if(triggers[i].getHandlerFunction() == 'onSpreadsheetOpen')
    {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('onSpreadsheetOpen')
    .forSpreadsheet(SpreadsheetApp.getActive()).onOpen().create();
}
function buyminer(cost,production,building) 
{
  const userProperties = PropertiesService.getUserProperties();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND');

  var count = Number(userProperties.getProperty('shards') || 0);

  if (count >= cost) 
  {

    
    count -= cost;
    userProperties.setProperty('shards', count);
    sheet.getRange("A2").setValue(formatNumber(count));

    
    var shardspersecond = Number(userProperties.getProperty('shardspersecond') || 0);

    shardspersecond += production;

    
    userProperties.setProperty('shardspersecond',shardspersecond);

    
    sheet.getRange("A3").setValue(formatNumber(getEffectiveShardsPerSecond()) + ' Shards/Second');
    
    var owned = Number(userProperties.getProperty(building)|| 0);
    owned++;
    userProperties.setProperty(building,owned);
    checkAchievements();
    updateShopMenu();
    syncLeaderboard();
    
    

  } else {
    SpreadsheetApp.getUi().alert("You Don't have enough shards. Maybe some click could help.");
  }
}
function formatPrice(price)
{
  if(price < 1000)
  {
    return price.toFixed(1).replace(/\.0$/,'');
  }
  if(price < 1000000)
  {
    return (price/1000).toFixed(1).replace(/\.0$/,'') + 'K';
  }
  if(price < 1000000000)
  {
    return (price/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
  }
  
  
    if(price < 1000000000000)
  {
    return (price/1000000000).toFixed(1).replace(/\.0$/,'') + 'B';
    }
    return (price/1000000000000).toFixed(1).replace(/\.0$/,'') + 'T';
  

}
function formatNumber(number)
{
  if(number < 1000)
  {
    return number.toFixed(1).replace(/\.0$/,'');
  }
  if(number < 1000000)
  {
    return (number/1000).toFixed(1).replace(/\.0$/,'') + 'K';
  }
  if(number < 1000000000)
  {
    return (number/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
  }
  
  if(number < 1000000000000)
  {
    return (number/1000000000).toFixed(1).replace(/\.0$/,'') + 'B';
    }
    return (number/1000000000000).toFixed(1).replace(/\.0$/,'') + 'T';

  

}
function updateShopMenu()
{
  var clickPower = getClickPower();
  var clickUpgradeCost = getClickUpgradeCost();
  var clickUpgradeLevel = getClickUpgradeLevel();
  var ui = SpreadsheetApp.getUi()
  var userProperties = PropertiesService.getUserProperties();
  var minerCost = getBuildingCost(15,'miner')
  var minecartCost = getBuildingCost(100,'minecart')
  var crystalMageCost = getBuildingCost(1100,'crystalmage')
  var caveDragonCost = getBuildingCost(12000,'cavedragon')
  var magmaEngineCost = getBuildingCost(1500000,'magmaengine')
  var aliensCost = getBuildingCost(20000000,'aliens')

   var minerOwned = getOwned('miner');
   var minecartOwned = getOwned('minecart');
   var crystalMageOwned = getOwned('crystalmage');
   var caveDragonOwned = getOwned('cavedragon');
   var magmaEngineOwned = getOwned('magmaengine');
   var aliensOwned = getOwned('aliens');

  ui.createMenu('Shards Menu')
      .addItem('Set Up Game', 'Setup')
      .addSeparator()
      .addItem('Join/Change Leaderboard Name', 'registerLeaderboardName')
      .addItem('Refresh Leaderboard', 'syncLeaderboard')
      .addSeparator()
      .addItem('Click Power x2 - ' + formatPrice(clickUpgradeCost) + ' | Level ' + clickUpgradeLevel + ' | ' + formatNumber(clickPower) + '/ click', 'buyClickUpgrade')
      .addSeparator()
      .addItem('Buy Miner - ' + formatPrice(minerCost) + ' | owned (' + minerOwned + ')', 'buyMiner')
      .addItem('Buy Minecart - ' + formatPrice(minecartCost) + ' | owned (' + minecartOwned + ')', 'buyMinecart')
      .addItem('Buy CrystalMage - ' + formatPrice(crystalMageCost) + ' | owned (' + crystalMageOwned + ')', 'buyCrystalMage')
      .addItem('Buy CaveDragon - ' + formatPrice(caveDragonCost) + ' | owned (' + caveDragonOwned + ')', 'buyCaveDragon')
      .addItem('Buy MagmaEngine - ' + formatPrice(magmaEngineCost) + ' | owned (' + magmaEngineOwned + ')', 'buyMagmaEngine')
      .addItem('Buy Aliens - ' + formatPrice(aliensCost) + ' | owned (' + aliensOwned + ')', 'buyAliens')
      .addSeparator()
      .addItem('View Achievements','showAchievements')
      .addToUi()
}
function getBuildingCost(baseCost,building)
{
  const userProperties = PropertiesService.getUserProperties();
  var owned = Number(userProperties.getProperty(building)|| 0);
  var updatedcost = baseCost * Math.pow(1.15, owned)
  return Math.round(updatedcost*10)/10;

}
function calculateOfflineEarnings()
{
  const userProperties = PropertiesService.getUserProperties();
  
  var lastPlayed = Number(userProperties.getProperty('lastPlayed') || Date.now());
  var currentTime = Date.now();
  var timeAway = currentTime - lastPlayed;
  //milli to sec
  var secondsAway = timeAway/1000;
  updateGoldenCrystalStatus();
  var shardspersecond = getEffectiveShardsPerSecond();
  var offlineShards = secondsAway * shardspersecond;
 
  
  return offlineShards;
}
function debugOffline()
{
  var offlineShards = calculateOfflineEarnings();

  SpreadsheetApp.getUi().alert(
    "Offline Debug\n\n" +
    "Offline Shards: " + offlineShards
  );
}
function collectOfflineEarnings()
{
  const userProperties = PropertiesService.getUserProperties();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND');
  var offlineShards = calculateOfflineEarnings();
  var shards = Number(userProperties.getProperty('shards') || 0);
  shards += offlineShards;
  userProperties.setProperty('shards',String(shards));
  userProperties.setProperty('lastPlayed',Date.now().toString());
  sheet.getRange("A2").setValue(formatNumber(shards));
  trackAchievementProgress(offlineShards,false);
  //updateShopMenu();
  //syncLeaderboard();
}
function onEdit(e)
{
  var activeSheet = SpreadsheetApp.getActiveSheet().getName()
  

  if(e.range.getRow() == 2 && e.range.getColumn() == 1 && activeSheet == 'DIAMOND')
  {
    var userProperties = PropertiesService.getUserProperties();
    var count = Number(userProperties.getProperty('shards') || 0);
    
  
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND').getRange("A2").setValue(formatNumber(count))

  }
}


function clickCrystal() {
    
  
  const userProperties = PropertiesService.getUserProperties();
  var count = Number(userProperties.getProperty('shards') || 0);
  var clickPower = getClickPower();
  count += clickPower;
  userProperties.setProperty('shards', count);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DIAMOND");
  var range = sheet.getRange("A2");
  
  
  range.setValue(formatNumber(count));
  trackAchievementProgress(clickPower, true);
  count = Number(userProperties.getProperty('shards') || 0);
  return
  {
    shards: count,clickPower
  };
    
  
  
}
function getClickPower()
{
  const userProperties = PropertiesService.getUserProperties();
  return Number(userProperties.getProperty('clickPower')||1);
}
function getClickUpgradeLevel()
{
  const userProperties = PropertiesService.getUserProperties();
  return Number(userProperties.getProperty('clickUpgradeLevel')||0);
}
function getClickUpgradeCost()
{
  const level = getClickUpgradeLevel();
  return 50 *  Math.pow(5,level);
}
function buyClickUpgrade()
{
  const userProperties = PropertiesService.getUserProperties();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND');
   var cost = getClickUpgradeCost();
  var shards = Number(userProperties.getProperty('shards') || 0);
  if (shards < cost)
  {
    SpreadsheetApp.getUi().alert("Not enough shards! You need " + formatPrice(cost) + " shards.");
    return;
  }
  var remainingShards = shards - cost;
  userProperties.setProperty('shards', String(remainingShards));
  syncLeaderboard();
  var newPower = getClickPower() * 2;
  userProperties.setProperty('clickPower',String(newPower));
  var newLevel = getClickUpgradeLevel() + 1;
  userProperties.setProperty('clickUpgradeLevel',String(newLevel));
  sheet.getRange('A2').setValue(formatNumber(remainingShards));
  updateShopMenu();
  SpreadsheetApp.getUi().alert("CLICK POWER UPGRADED!\n\n" + "Click strength: " + formatNumber(newPower) + " shards per click\n" + "Upgrade Level: " + newLevel + "\n" + "Next Upgrade: " + formatPrice(getClickUpgradeCost()));
}
 function registerLeaderboardName()
 {
  const ui = SpreadsheetApp.getUi();
  const userProperties = PropertiesService.getUserProperties();
  const response = ui.prompt('Join the Leaderboard' , 'Enter the display name you want other players to see: ', ui.ButtonSet.OK_CANCEL);
  if(response.getSelectedButton() !== ui.Button.OK)
  {
    return;
  }
  const playerName = response.getResponseText().trim();
  if(!playerName)
  {
    ui.alert('Please enter a display name.');
    return;
  }
  if(playerName.length > 25)
  {
    ui.alert('Your display name must be 25 letters or fewer. ');
    return;
  }
  userProperties.setProperty('leaderboardPlayerName', playerName);
  if(!userProperties.getProperty('leaderboardPlayerId'))
  {
    userProperties.setProperty('leaderboardPlayerId',Utilities.getUuid());
  }
  syncLeaderboard();
  ui.alert('You joined the leaderboard as ' + playerName + '!');
  

 }
 function syncLeaderboard()
 {
  const userProperties = PropertiesService.getUserProperties();
  const playerName = userProperties.getProperty('leaderboardPlayerName');
  if(!playerName)
  {
    return;
  }
  const playerId = userProperties.getProperty('leaderboardPlayerId');
  if(!playerId)
  {
    userProperties.setProperty('leaderboardPlayerId', Utilities.getUuid());
    return syncLeaderboard();
  }
  const shards = Number(userProperties.getProperty('shards') || 0);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leaderboard');
  const lock = LockService.getScriptLock();
  if(!lock.tryLock(3000))
  {
    return;
  }
  try{
    const lastRow = sheet.getLastRow();
    let playerRow = 0;
    if(lastRow >= 2)
    {
      const ids = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
      for(let i = 0; i < ids.length; i++)
      {
        if (ids[i][0] === playerId)
        {
          playerRow = i + 2;
          break;
        }
      }
    }
    if(playerRow === 0)
    {
      playerRow = sheet.getLastRow() + 1;
    }
    sheet.getRange(playerRow,1,1,4).setValues([[playerName,shards,new Date(),playerId]]);
    const updatedLastRow = sheet.getLastRow();
    if(updatedLastRow > 2)
    {
      sheet.getRange(2,1,updatedLastRow - 1, 4).sort({  column: 2, ascending: false});
    }
  }
  finally
  {
    lock.releaseLock();
  }
 }
 function showLeaderboard()
 {
  const sheet  = getLeaderboardSheet();
  const lastRow = sheets.getLastRow();
  if(lastRow < 2)
  {
    SpreadsheetApp.getUi().alert('The Leaderboard is empty. Register your name to get started');
    return;
  }
  const rows = sheet.getRange(2, 1, Math.min(10, lastRow - 1), 2).getValues();
  let message = '🏆 SHARDS CLICKER TOP PLAYERS\n\n';

  rows.forEach (function(row, index)
  {
    message += (index + 1) + '. ' + row[0]+ ' - ' + formatNumber(Number(row[1])) + ' shards\n';
  });
  SpreadsheetApp.getUi(). alert(message);
 }

 //////////////////////////////////////////
 /// Achievement system ///////////////////
 //////////////////////////////////////////

 function getAchievementDefinitions()
 {
  var props = PropertiesService.getUserProperties();
  var totalClicks = Number(props.getProperty('totalClicks') || 0);
  var lifetimeShards = Number(props.getProperty('lifetimeShardsEarned') || 0);
  var totalBuildings = getOwned('miner') + getOwned('minecart') + getOwned('crystalmage') + getOwned('cavedragon') + getOwned('magmaengine') + getOwned('aliens');
  var production = Number(props.getProperty('shardspersecond') || 0);
  return[
    {
      id: 'firstSpark', name: 'First Spark', description: 'Click the crystal once', current: totalClicks, target: 1, reward: 10
    },
    {
      id: 'crystalCollector',name: 'Crystal Collector',description: 'Earn 1,000 lifetime shards',current: lifetimeShards,target: 1000,reward: 100
    },
    {
      id: 'gettingRich', name: 'Getting Rich', description: 'Own 10 buildings', current: totalBuildings, target: 10, reward: 250
    },
    {
      id: 'crystalTycoon', name: 'Crystal Tycoon', description: 'Reach 100 shards per second', current: production, target: 100, reward: 1000
    },
    {
      id: 'dedicatedClicker', name: 'Dedicated Clicker', description: 'Click the crystal 500 times', current: totalClicks, target: 500, reward: 500
    }
  ];
 }
 
function trackAchievementProgress(shardsEarned, didClick) {
  const props = PropertiesService.getUserProperties();

  let lifetime = Number(
    props.getProperty('lifetimeShardsEarned') || 0
  );
  let clicks = Number(props.getProperty('totalClicks') || 0);

  lifetime += Math.max(0, Number(shardsEarned) || 0);

  if (didClick) {
    clicks++;
  }

  props.setProperty('lifetimeShardsEarned', String(lifetime));
  props.setProperty('totalClicks', String(clicks));

  checkAchievements();
}

 function checkAchievements()
 {
  var props = PropertiesService.getUserProperties();
  var achievements = getAchievementDefinitions();
  var unlocked = [];
  var shards = Number(props.getProperty('shards') || 0);
  achievements.forEach(function(achievement)
  {
    var key = 'achievement_claimed_' + achievement.id;
    var alreadyClaimed = props.getProperty(key) === 'true';
    var completed = achievement.current >= achievement.target;
    if(completed && !alreadyClaimed)
    {
      props.setProperty(key,'true');
      shards += achievement.reward;
      unlocked.push(achievement.name + ' (+' + formatNumber(achievement.reward) + ' shards)');
    }
  });
  if(unlocked.length > 0)
  {
    props.setProperty('shards',String(shards));
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND');
    sheet.getRange('A2').setValue(formatNumber(shards));
  
  try{
    SpreadsheetApp.getActiveSpreadsheet().toast(unlocked.join('\n'), '🏆 Achievement Unlocked!',5);}
   catch(error)
  {
    //toast not shown
  }
  }
  updateGoldenCrystalStatus();
  
 }
 function showAchievements()
 {
  checkAchievements();
  var props = PropertiesService.getUserProperties();
  var achievements = getAchievementDefinitions();
  var message = '🏆 YOUR ACHIEVEMENTS\n\n'
  achievements.forEach(function(achievement)
  {
    var key = 'achievement_claimed_' + achievement.id;
    var claimed = props.getProperty(key) === 'true';
    var progress = Math.min(achievement.current,achievement.target);
    message += (claimed ? '✅ ' : '⬜ ') + achievement.name + '\n';
    message += achievement.description + '\n';
    if(claimed)
    {
      message += 'Status: UNLOCKED\n';
    }
    else
    {
      message += 'Progress: ' + formatNumber(progress) + ' / ' + formatNumber(achievement.target) + '\n';
    }
    message += 'Reward: ' + formatNumber(achievement.reward) + ' shards\n\n';
  });
  SpreadsheetApp.getUi().alert(message);
 }
 function isGoldenCrystalUnlocked()
 {
  return PropertiesService.getUserProperties().getProperty('goldenCrystalUnlocked') === 'true';
 }
 function getEffectiveShardsPerSecond()
 {
  const props = PropertiesService.getUserProperties();
  const baseProduction = Number(props.getProperty('shardspersecond') || 0);
  return baseProduction * (isGoldenCrystalUnlocked() ? 1.5 : 1);
 }
 function updateGoldenCrystalStatus()
 {
   const props = PropertiesService.getUserProperties();
   if(isGoldenCrystalUnlocked())
   {
    return true;
   }
   const shards = Number(props.getProperty('shards') || 0);
   if(shards < 100000)
   {
    return false;
   }
   props.setProperty('goldenCrystalUnlocked','true');
   const sheet  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('DIAMOND').getRange('A3');
   sheet.setValue(formatNumber(getEffectiveShardsPerSecond()) + ' Shards/Second');
   SpreadsheetApp.getActiveSpreadsheet().toast('Permanent production bonus unlocked: 1.5x!','Golden Age!',5);
   return true;
 }

 

