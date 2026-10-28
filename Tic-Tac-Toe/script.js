console.log("tic-tac-toe is loaded");
var cells = document.querySelectorAll(".cell");
var statusText = document.getElementById("status");
var resetButton = document.getElementById("reset");
var difficultySelect = document.getElementById("difficulty");
//var currentPlayer = "X";
var gameOver = false;
var computerThinking = false;
var matchStartedAt = Date.now();
var matchDifficulty = null;
var moveCount = 0;
var matchHistory = [];

var aiTimeout;
var winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
statusText.textContent = "Your turn(X)";
try
{
    var savedHistory = localStorage.getItem("tttMatchHistory");
    if(savedHistory)
    {
        matchHistory = JSON.parse(savedHistory);
        if(!Array.isArray(matchHistory))
        {
            matchHistory = [];
        }
    }
}
catch(error)
{
    matchHistory = [];
}
cells.forEach(function(cell) 
{
    cell.addEventListener("click", function() 
    {
        if (cell.textContent !== "" || gameOver || computerThinking)
        {
            return;
        }
        if (moveCount === 0) {
            matchDifficulty = difficulty.value;
            difficultySelect.disabled = true;
        }
        cell.textContent = "X";
        cell.classList.add("x-mark");
        arcadeSound.move();
        moveCount++;
        if(checkWinner("X"))
        {
            highlightWinningCells("X");
            statusText.textContent = "You win!";
            finishMatch("win");
            
            return;
        }
        if(checkDraw())
        {
            statusText.textContent = "It's a draw!";
            finishMatch("draw");
            
            return;
        }
        computerThinking = true;
        statusText.textContent = "Computer is thinking...";
        aiTimeout = setTimeout(function()
        {
            makeComputerMove();
        }, 400);
        
        
    });
    cell.addEventListener("keydown", function(event)
    {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            cell.click();
        }
    });
    
});

function makeComputerMove() {
    var difficulty = difficultySelect.value;
    var chosenIndex = -1;
    if (difficulty === "easy") 
    {
        var emptyCells = [];
        cells.forEach(function(cell, index) {
            {
                if (cell.textContent === "") {
                    emptyCells.push(index);
                                 }
            }
        });
        if (emptyCells.length > 0)
             {
                var randomPosition = Math.floor(Math.random() * emptyCells.length);
            chosenIndex = emptyCells[randomPosition];
        }
    }
    else if (difficulty === "medium")
    {
        chosenIndex = findWinningMove("O");
        if (chosenIndex === -1) 
            {
            chosenIndex = findWinningMove("X");
            }
            if (chosenIndex === -1)
            {
                var emptyCells = [];
                cells.forEach(function(cell, index) {
                    if (cell.textContent === "") {
                        emptyCells.push(index);
                    }
                });
                if (emptyCells.length > 0) 
                {
                    var randomPosition = Math.floor(Math.random() * emptyCells.length);
                    chosenIndex = emptyCells[randomPosition];
                }
            }
     }
    else if (difficulty === "unbeatable")
    {
    var board = [];
    cells.forEach(function(cell) 
    {
        board.push(cell.textContent);
    });
    var bestScore = -Infinity;
    //var bestMove = -1;
    for (var i = 0; i < board.length; i++) 
        {
        
            if (board[i] === "") 
            {
                board[i] = "O";
                var score = minimax(board, false, 1);
                board[i] = "";
                if (score > bestScore)
                {
                    bestScore = score;
                    chosenIndex = i;
                }
            }
        }
    }
        if (chosenIndex !== -1) 
            {
            cells[chosenIndex].textContent = "O";
            cells[chosenIndex].classList.add("o-mark");
            arcadeSound.move();
            moveCount++;
        }
        computerThinking = false;
        if (checkWinner("O")) 
            {
                highlightWinningCells("O");
                
            statusText.textContent = "Computer wins!";
            finishMatch("loss");
            
            return;
        }
        if (checkDraw()) 
            {
                statusText.textContent = "It's a draw!";
                finishMatch("draw");
                return;
            }
            statusText.textContent = "Your turn (X)";
    }


    
   


function findWinningMove(player) {
    for (var i = 0; i < cells.length; i++) {

        
        if (cells[i].textContent === "") {

            
            cells[i].textContent = player;

            var winningMove = checkWinner(player);

           
            cells[i].textContent = "";

            if (winningMove) {
                return i;
            }
        }
    }

    return -1;
}

function checkWinner(player)
{
  for (var i = 0; i < winningCombinations.length; i++)
  {
    var combo = winningCombinations[i];
    var a = cells[combo[0]].textContent;
    var b = cells[combo[1]].textContent;
    var c = cells[combo[2]].textContent;
    if (a === player && b === player && c === player)
    {
      return true;
    }
  }
  return false;
}
function highlightWinningCells(player)
{
    for (var i = 0; i < winningCombinations.length; i++)
    {
        var combo = winningCombinations[i];
        var a = cells[combo[0]].textContent;
        var b = cells[combo[1]].textContent;
        var c = cells[combo[2]].textContent;
        if(a === player && b === player && c === player)
        {
            cells[combo[0]].classList.add("winning-cell");
            cells[combo[1]].classList.add("winning-cell");
            cells[combo[2]].classList.add("winning-cell");
            return;
        }
    }
}
function checkDraw()
{
  for (var i = 0; i < cells.length; i++)
  {
    if (cells[i].textContent === "")
    {
      return false;
    }
  }
  return true;
}
function minimax(board, isMaximizing, depth)
 { var winner = getBoardWinner(board);
    if (winner === "O") {
        return 10 - depth;
    }
    if (winner === "X") {
        return depth - 10;
    }
    if(!board.includes("")) {
        return 0;
    }
    if (isMaximizing) {
        var bestScore = -Infinity;
        for (var i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                var score = minimax(board, false, depth + 1);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
                
            }
        }
        
        return bestScore;
    } 
    else {
        var bestScore = Infinity;
        for (var i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                var score = minimax(board, true, depth + 1);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
function getBoardWinner(board) {
    for (var i = 0; i < winningCombinations.length; i++) {
        var combo = winningCombinations[i];
        var a = board[combo[0]];
        var b = board[combo[1]];
        var c = board[combo[2]];
        if (a === b && b === c && a !== "") {
            return a;
        }
    }
    return "";
}

resetButton.addEventListener("click", function()
{
    matchStartedAt = Date.now();
    moveCount = 0;
    difficultySelect.disabled = false;
    matchDifficulty = null;
    clearTimeout(aiTimeout);
    cells.forEach(function(cell)
    {
        cell.textContent = "";
        cell.classList.remove("winning-cell", "x-mark", "o-mark");
    });
    
    gameOver = false;
    computerThinking = false;
    statusText.textContent = "Your turn(X)";
});
var navTabs = document.querySelectorAll(".nav-tab");
var tabViews = [document.getElementById("gameView"),document.getElementById("statsView"),document.getElementById("achievementsView"),document.getElementById("historyView")];
navTabs.forEach(function(tab)
{
    tab.addEventListener("click", function()
    {
       var selectedView = tab.dataset.tab;
       tabViews .forEach(function(view)
       {
        view.hidden = true;
       });
    
    document.getElementById(selectedView).hidden = false;
    if (selectedView === "historyView") {
        renderHistory();
    }
    if(selectedView === "statsView")
    {
        renderStats();
    }
    if (selectedView === "achievementsView") {
        renderAchievements();
    }
    navTabs.forEach(function(otherTab)
    {
        otherTab.classList.remove("active")
    });
    tab.classList.add("active");
});
});
function finishMatch(result)
{
    if(gameOver)
    {
        return;
    }
    gameOver = true;
    if (result === "win")
         {
        arcadeSound.win();
    }
    if (result === "loss")
         {
        arcadeSound.win();
    }
    if (result === "draw")
         {
        arcadeSound.draw();
    }
   var match = {id: Date.now() + "-" + Math.random().toString(36).slice(2, 8), date: new Date().toISOString(), result: result, difficulty: matchDifficulty || difficultySelect.value, durationSeconds: Math.floor((Date.now() - matchStartedAt)/1000), moves: moveCount
};
    matchHistory.unshift(match);
    if (matchHistory.length > 10) {
        matchHistory.pop();
    }
    try
    {
        localStorage.setItem("tttMatchHistory",JSON.stringify(matchHistory));
    }
    catch(error)
    {
        console.log("Could not get Match History.");
    }
    awardAchievements(result, match.difficulty);
    awardXP(result, match.difficulty, match.id);
    console.log("Match Recorded:",match);
}
var achievementList = [
    {
        id: "first_match",
        icon: "🎮",
        name: "INSERT COIN",
        description: "Finish your first match."
    },
     {
        id: "first_win",
        icon: "🏆",
        name: "FIRST VICTORY",
        description: "Win your first match."
    },
     {
        id: "first_draw",
        icon: "🤝",
        name: "DEAD EVEN",
        description: "Finish a match in a draw."
    },
     {
        id: "unbeatable_draw",
        icon: "⚡",
        name: "BOSS CHALLANGER",
        description: "End match with draw on AI difficulty: unbeatable."
    }
];
function renderAchievements()
{
    var list = document.getElementById("achievementList");
    var summary = document.getElementById("achievementSummary");
    var unlocked = JSON.parse(localStorage.getItem("tttUnlockedAchievements") || "[]");
    list.innerHTML = "";
    achievementList.forEach(function(achievement)
    {
        var isUnlocked = unlocked.includes(achievement.id);
        var card = document.createElement("div");
        card.className = isUnlocked ? "achievement-card unlocked" : "achievement-card locked";
        card.innerHTML = "<div class='achievement-icon'>" + (isUnlocked ? achievement.icon : "🔒") + "</div>" + "<h3>" + achievement.name + "</h3>" + "<p>" + achievement.description + "</p>" + "<p>" + (isUnlocked ? "UNLOCKED" : "LOCKED") + "</p>";
        list.appendChild(card);
    });
    summary.textContent = unlocked.length + " / " + achievementList.length + " BADGES UNLOCKED";

}
function showAchievementToast(achievement){
var toast = document.getElementById("achievementToast");
var name = document.getElementById("toastAchievementName");
if (!toast || !name) {
    return;
}
name.textContent = achievement.name;
toast.classList.remove("show");
void toast.offsetWidth;
toast.classList.add("show");
if (window.achievementToastTimer) {
    clearTimeout(window.achievementToastTimer)
}
window.achievementToastTimer = setTimeout(function()
{
    toast.classList.remove("show");
} ,3000);
}
function awardAchievements(result, difficulty)
{
    var unlocked = [];
    try
    {
        unlocked = JSON.parse(localStorage.getItem("tttUnlockedAchievements") || "[]");

    }
    catch(error)
    {
        console.log("Could not load.")
        return;
    }
    var earned = [];
    earned.push("first_match");
    if (result === "win")
         {
        earned.push("first_win");
    }
    if (result === "draw") {
        earned.push("first_draw");

    }
    if (result === "draw" && difficulty === "unbeatable") {
    earned.push("unbeatable_draw");
}
    var newUnlock = false;
    var newlyUnlocked = [];
    earned.forEach(function(id)
    {
        if (!unlocked.includes(id))
             {
            unlocked.push(id);
            newUnlock = true;
            newlyUnlocked.push(id);
        }
    });
    if(newUnlock){
        try
    {
        localStorage.setItem("tttUnlockedAchievements",JSON.stringify(unlocked));
        newlyUnlocked.forEach(function(id)
        {
          var achievement = achievementList.find(function(item)
          {
            return item.id === id;
          }  );
          if (achievement) {
            showAchievementToast(achievement);
          }
        });

    }
    catch(error)
    {
        return;
    }
    var achievementView = document.getElementById("achievementsView");
    if (achievementView && !achievementView.hidden) {
        renderAchievements();
    }
    }
}
function renderStats()
{
    var total = matchHistory.length;
    var wins = 0;
    var losses = 0;
    var draws = 0;
    var difficultyCounts = {easy: 0, medium: 0, unbeatable: 0};
    var totalDuration = 0;
    var totalMoves = 0;
    matchHistory.forEach(function(match)
    {
        totalDuration += match.durationSeconds || 0;
        totalMoves += match.moves || 0;
        if (match.result === "win")
             {
               wins++;
        }
         else if (match.result === "loss")
         {
            losses++;
        }
        else if (match.result === "draw")
         {
            draws++;
        }
        if (difficultyCounts[match.difficulty] !== undefined) 
            {
            difficultyCounts[match.difficulty]++;
        }
    });
    var winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
    var averageduration = total > 0 ? Math.round(totalDuration/total) : 0;
    var averageMoves = total > 0 ? Math.round((totalMoves/total) * 10)/10 : 0;
    var averageMinutes = Math.floor(averageduration / 60);
    var averageSeconds = averageduration % 60;
    document.getElementById("statTotal").textContent = total;
    document.getElementById("statWins").textContent = wins;
    document.getElementById("statLosses").textContent = losses;
    document.getElementById("statDraws").textContent = draws;
    document.getElementById("statWinRate").textContent = winrate + " %";
    document.getElementById("winRateBar").style.width = winrate + "%";
    document.getElementById("easyStats").textContent = difficultyCounts.easy + " matches";
    document.getElementById("mediumStats").textContent = difficultyCounts.medium + " matches";
    document.getElementById("unbeatableStats").textContent = difficultyCounts.unbeatable + " matches";
    var note = total === 0 ? "Play and finish a match to start building your statistics." : "Statistics are based on " + total + " completed matches saved in this browser.";
    document.getElementById("statsNote").textContent = note + (total > 0 ?   "\nAverage duration: " + averageMinutes + "m " + averageSeconds + "s. \nAverage moves: " + averageMoves + "." : "");
}
function renderHistory()
{
    if(matchHistory.length > 10)
    {
        matchHistory = matchHistory.slice(0,10);
        localStorage.setItem("tttMatchHistory",JSON.stringify(matchHistory));
    }
    var historyList = document.getElementById("historyList");
    if (matchHistory.length === 0) {
        historyList.innerHTML = "<p>No matches played yet, Finish a game to see it here!</p>";
        return;
    }
    historyList.innerHTML = "";
    matchHistory.forEach(function(match)
    {
        var matchCard = document.createElement("div");
        matchCard.className = "history-card " + match.result + "-card";
        var resultText = match.result.toUpperCase();
        var difficultyText = match.difficulty.toUpperCase();
        var minutes = Math.floor(match.durationSeconds / 60);
        var seconds = match.durationSeconds % 60;
        matchCard.innerHTML = "<h3>" + resultText + "</h3>" + "<p>Difficulty: " + difficultyText + "</p>" + "<p> Moves: " + match.moves + "</p>" + "<p>Duration: " + minutes + "m " + seconds + "s</p>" + "<p>Date: " + new Date(match.date).toLocaleString() + "</p>";
        historyList.appendChild(matchCard);
    });
}
renderStats();

const arcadeSound = {
  enabled: localStorage.getItem("tttSoundEnabled") !== "false",
  audioContent: null, playTone: async function (frequency, duration, type = "square", volume = 0.18) {
    if (!this.enabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            console.warn("Web Audio is not supported.");
            return;
        }

        if (!this.audioContent) {
            this.audioContent = new AudioContextClass();
        }

        const context = this.audioContent;

        if (context.state !== "running") {
            await context.resume();
        }

        if (context.state !== "running") {
            console.warn("AudioContext is not running:", context.state);
            return;
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(
            frequency,
            context.currentTime
        );

        gain.gain.setValueAtTime(volume, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    }
    catch (error) {
        console.warn("Arcade sound could not play:", error);
    }
},

toggle: function()
{
    this.enabled = !this.enabled;
    localStorage.setItem("tttSoundEnabled", String(this.enabled));
    return this.enabled;
},
move: function () {
    this.playTone(660,0.07);
},
win: function(){
this.playTone(523, 0.12);
setTimeout(() => this.playTone(659,0.12), 130);
setTimeout(() => this.playTone(784,0.2), 260);
},
  draw: function()
{
  this.playTone(440,0.12);
  setTimeout(() => this.playTone(349,0.2), 140);
}
};
const soundToggle = document.getElementById("sound-toggle");
function updateSoundButton()
{
    if (!soundToggle)
         {
        return;
    }
    soundToggle.textContent = arcadeSound.enabled ? "SOUND: ON" : "SOUND: OFF";
    soundToggle.classList.toggle("muted", !arcadeSound.enabled);
}
if (soundToggle)
     {
     updateSoundButton();
     soundToggle.addEventListener("click", function()
     {
        arcadeSound.toggle();
        updateSoundButton();
     });
}
var savedXP = Number(localStorage.getItem("tttPlayerXP"));
var playerXP = Number.isFinite(savedXP) && savedXP >= 0 ? savedXP : 0;
function getPlayerLevel(totalXP)
{
    var level = 1;
    var remainingXP = totalXP;
    var requiredXP = 200;
    while(remainingXP >= requiredXP)
    {
        remainingXP-=requiredXP;
        level ++;
        requiredXP = getXPForNextLevel(level);
    }
    return level;
}
function getXPForNextLevel(level)
{
    return 100 + (level * 100);
}
function renderPlayerProgression()
{
    var level = 1;
    var remainingXP = playerXP;
    var requiredXP = 200;

    while(remainingXP >= requiredXP)
    {
        remainingXP -= requiredXP;
        level++;
        requiredXP = getXPForNextLevel(level);
    }

    var progress = (remainingXP / requiredXP) * 100;

    document.getElementById("playerLevel").textContent = level;
    document.getElementById("playerTotalXP").textContent = playerXP;

    document.getElementById("playerCurrentXP").textContent = remainingXP + " / " + requiredXP + " XP";

    document.getElementById("playerNextLevelXP").textContent = (requiredXP - remainingXP) + " XP TO NEXT LEVEL";

    document.getElementById("playerXPBar").style.width = progress + "%";

    document.getElementById("playerXPProgress").setAttribute("aria-valuenow", Math.floor(progress));
}
function awardXP(result, difficulty, matchID)
{
    var awardedMatches = [];
    try {
        awardedMatches = JSON.parse(localStorage.getItem("tttXPAwardedMatches") || "[]");
    } catch (error) {
        return;
    }
    if (awardedMatches.includes(matchID)) {
        return;
    }
    var earnedXP = 0;
    if (result === "win") {
        earnedXP = 100;
    }
    else if (result === "draw") {
        earnedXP = 50;
    }
    else if (result === "loss") {
        earnedXP = 25;
    }

    if (difficulty === "medium") {
        earnedXP += 25;
    }
    else if (difficulty === "unbeatable") {
        earnedXP += 50;
    }
    var oldLevel = getPlayerLevel(playerXP);
    playerXP += earnedXP;
    var newLevel = getPlayerLevel(playerXP);
    try {
       localStorage.setItem("tttPlayerXP",String(playerXP));
       awardedMatches.push(matchID);
       localStorage.setItem("tttXPAwardedMatches", JSON.stringify(awardedMatches));
       if (awardedMatches.length > 500) {
        awardedMatches = awardedMatches.slice(-500);
       } 
       localStorage.setItem("tttXPAwardedMatches", JSON.stringify(awardedMatches));
       localStorage.setItem("tttPlayerLevel",String(newLevel));
    } catch (error) {
        return;
    }
    renderPlayerProgression();
    if (newLevel > oldLevel)
         {
        var levelCard = document.getElementById("playerLevelCard");
        var levelMessage = document.getElementById("levelUpMessage");
        levelMessage.textContent = "LEVEL UP! YOU ARE NOW LEVEL " + newLevel + "!";
        levelCard.classList.remove("level-up");
        void levelCard.offsetWidth;
        levelCard.classList.add("level-up")
    }
    if (newLevel > oldLevel) {
        
    }
}
if (document.readyState === "loading")
     {
    document.addEventListener("DOMContentLoaded",renderPlayerProgression);

}
else
{
    renderPlayerProgression();
}

