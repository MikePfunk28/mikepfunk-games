import React, { useState, useEffect } from 'react';

const ChainConnectionsGame = () => {
  // Game data
  const gameData = {
    normal: [
      {
        category: "Months",
        tiles: ["JANUARY", "MARCH", "MAY", "JULY"],
        chainDescription: "First, third, fifth, and seventh months of the year",
        color: "yellow",
        hint: "Time periods in a year"
      },
      {
        category: "Card Suits",
        tiles: ["CLUBS", "DIAMONDS", "HEARTS", "SPADES"],
        chainDescription: "Order of suits in bridge bidding (lowest to highest)",
        color: "green",
        hint: "Playing cards have these"
      },
      {
        category: "Chess Pieces",
        tiles: ["PAWN", "KNIGHT", "BISHOP", "ROOK"],
        chainDescription: "Increasing value in chess (1, 3, 3, 5)",
        color: "blue",
        hint: "Board game pieces"
      },
      {
        category: "Solar System Planets",
        tiles: ["MERCURY", "VENUS", "EARTH", "MARS"],
        chainDescription: "Planets in order from the Sun",
        color: "purple",
        hint: "Celestial bodies"
      }
    ],
    hard: [
      {
        category: "Car Parts",
        tiles: ["TIRE", "BRAKE", "ENGINE", "STEERING"],
        chainDescription: "From outside to inside of a car",
        color: "yellow",
        hint: "Automobile components"
      },
      {
        category: "Clothing Items",
        tiles: ["SOCKS", "SHOES", "PANTS", "SHIRT"],
        chainDescription: "Order of dressing from feet to torso",
        color: "green",
        hint: "Things you wear"
      },
      {
        category: "Email Process",
        tiles: ["COMPOSE", "ADDRESS", "ATTACH", "SEND"],
        chainDescription: "Steps in writing and sending an email",
        color: "blue",
        hint: "Communication sequence"
      },
      {
        category: "Cooking Steps",
        tiles: ["PREP", "HEAT", "COOK", "SERVE"],
        chainDescription: "Order of preparing a meal",
        color: "purple",
        hint: "Kitchen activities"
      }
    ]
  };

  // Game state
  const [currentDifficulty, setCurrentDifficulty] = useState("normal");
  const [currentGame, setCurrentGame] = useState([...gameData.normal]);
  const [boardTiles, setBoardTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [correctGroups, setCorrectGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hint, setHint] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Initialize game
  useEffect(() => {
    initGame();
  }, [currentDifficulty]);

  const initGame = () => {
    // Reset game state
    setSelectedTiles([]);
    setCorrectGroups([]);
    setMistakes(0);
    setGameOver(false);
    setHint("");
    setShowHint(false);
    
    // Create a flat array of all tiles
    let allTiles = [];
    currentGame.forEach(group => {
      group.tiles.forEach(tile => {
        allTiles.push({
          text: tile,
          group: group.category,
          color: group.color,
          isSelected: false,
          isCorrect: false,
          isIncorrect: false
        });
      });
    });
    
    // Shuffle the tiles
    shuffleArray(allTiles);
    setBoardTiles(allTiles);
  };

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const toggleTileSelection = (index) => {
    if (gameOver) return;
    if (boardTiles[index].isCorrect) return;
    
    const newBoardTiles = [...boardTiles];
    const tile = newBoardTiles[index];
    
    if (tile.isSelected) {
      // Deselect tile
      tile.isSelected = false;
      setSelectedTiles(selectedTiles.filter(t => t.index !== index));
    } else {
      // Select tile if less than 4 are already selected
      if (selectedTiles.length < 4) {
        tile.isSelected = true;
        setSelectedTiles([...selectedTiles, { index, text: tile.text, group: tile.group, color: tile.color }]);
      }
    }
    
    setBoardTiles(newBoardTiles);
  };

  const handleSubmit = () => {
    if (selectedTiles.length !== 4) return;
    
    // Check if all selected tiles belong to the same group
    const groups = selectedTiles.map(tile => tile.group);
    const uniqueGroups = [...new Set(groups)];
    
    if (uniqueGroups.length === 1) {
      // Correct group
      const groupName = uniqueGroups[0];
      const groupColor = selectedTiles[0].color;
      const groupData = currentGame.find(g => g.category === groupName);
      
      // Mark tiles as correct
      const newBoardTiles = [...boardTiles];
      selectedTiles.forEach(tile => {
        newBoardTiles[tile.index].isSelected = false;
        newBoardTiles[tile.index].isCorrect = true;
        newBoardTiles[tile.index].color = groupColor;
      });
      setBoardTiles(newBoardTiles);
      
      // Add to correct groups
      const newCorrectGroup = {
        category: groupName,
        color: groupColor,
        tiles: selectedTiles.map(t => t.text),
        chainDescription: groupData.chainDescription
      };
      setCorrectGroups([...correctGroups, newCorrectGroup]);
      
      // Check if game is over
      if (correctGroups.length + 1 === 4) {
        setGameOver(true);
      }
    } else {
      // Incorrect group
      setMistakes(mistakes + 1);
      
      // Add shake animation
      const newBoardTiles = [...boardTiles];
      selectedTiles.forEach(tile => {
        newBoardTiles[tile.index].isIncorrect = true;
      });
      setBoardTiles(newBoardTiles);
      
      // Remove shake animation after a delay
      setTimeout(() => {
        const resetBoardTiles = [...boardTiles];
        selectedTiles.forEach(tile => {
          resetBoardTiles[tile.index].isIncorrect = false;
        });
        setBoardTiles(resetBoardTiles);
      }, 500);
      
      // Check if game over (too many mistakes)
      if (mistakes + 1 >= 4) {
        setGameOver(true);
      }
    }
    
    // Clear selection
    const clearedSelectionTiles = [...boardTiles];
    selectedTiles.forEach(tile => {
      clearedSelectionTiles[tile.index].isSelected = false;
    });
    setBoardTiles(clearedSelectionTiles);
    setSelectedTiles([]);
  };

  const handleShuffle = () => {
    if (gameOver) return;
    
    // Get all ungrouped tiles
    const unsolvedTileIndices = boardTiles
      .map((tile, index) => ({ tile, index }))
      .filter(item => !item.tile.isCorrect)
      .map(item => item.index);
    
    // Create a copy of the board tiles
    const newBoardTiles = [...boardTiles];
    
    // Extract unsolved tile data
    const unsolvedTiles = unsolvedTileIndices.map(index => ({
      text: boardTiles[index].text,
      group: boardTiles[index].group,
      color: boardTiles[index].color
    }));
    
    // Shuffle them
    const shuffledTiles = shuffleArray(unsolvedTiles);
    
    // Reassign shuffled content
    unsolvedTileIndices.forEach((tileIndex, i) => {
      newBoardTiles[tileIndex].text = shuffledTiles[i].text;
      newBoardTiles[tileIndex].group = shuffledTiles[i].group;
      newBoardTiles[tileIndex].color = shuffledTiles[i].color;
      newBoardTiles[tileIndex].isSelected = false;
    });
    
    setBoardTiles(newBoardTiles);
    setSelectedTiles([]);
  };

  const getCategoryHint = () => {
    if (gameOver) return;
    
    // Find a random unsolved group
    const unsolvedGroups = currentGame.filter(group => 
      !correctGroups.some(g => g.category === group.category)
    );
    
    if (unsolvedGroups.length > 0) {
      const randomGroup = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)];
      setHint(`Hint: Look for words related to "${randomGroup.hint}"`);
      setShowHint(true);
    }
  };

  const getChainHint = () => {
    if (gameOver) return;
    
    // Find a random unsolved group
    const unsolvedGroups = currentGame.filter(group => 
      !correctGroups.some(g => g.category === group.category)
    );
    
    if (unsolvedGroups.length > 0) {
      const randomGroup = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)];
      setHint(`Hint: Find a group where the words are in this order: "${randomGroup.chainDescription}"`);
      setShowHint(true);
    }
  };

  const changeDifficulty = (difficulty) => {
    if (difficulty === currentDifficulty) return;
    
    setCurrentDifficulty(difficulty);
    setCurrentGame(difficulty === "normal" ? [...gameData.normal] : [...gameData.hard]);
  };

  const playAgain = () => {
    setCurrentGame(currentDifficulty === "normal" ? [...gameData.normal] : [...gameData.hard]);
    initGame();
  };

  const revealAllGroups = () => {
    // Add all unsolved groups to correctGroups
    const unsolvedGroups = currentGame.filter(group => 
      !correctGroups.some(g => g.category === group.category)
    );
    
    setCorrectGroups([
      ...correctGroups,
      ...unsolvedGroups.map(group => ({
        category: group.category,
        color: group.color,
        tiles: group.tiles,
        chainDescription: group.chainDescription
      }))
    ]);
  };

  // Get tile class based on its state
  const getTileClassName = (tile) => {
    let className = "tile";
    
    if (tile.isCorrect) {
      className += ` correct-${tile.color}`;
    } else if (tile.isSelected) {
      className += " selected";
    }
    
    if (tile.isIncorrect) {
      className += " incorrect";
    }
    
    return className;
  };

  return (
    <div className="game-container">
      <h1 className="text-2xl font-bold text-center mb-2">Chain Connections</h1>
      <p className="subtitle text-center italic text-gray-600 mb-4">Find groups of words that form a chain</p>
      
      <div className="bg-white rounded-lg shadow p-4">
        <div className="instructions text-sm text-gray-600 mb-4">
          <p>Find four groups of four words that share a connection AND form a sequential chain. Submit your guesses using the button below.</p>
        </div>

        {/* Difficulty selector */}
        <div className="flex justify-center mb-4">
          <button 
            className={`px-3 py-1 rounded mr-2 ${currentDifficulty === "normal" ? "bg-gray-700" : "bg-gray-500"} text-white`}
            onClick={() => changeDifficulty("normal")}
          >
            Normal
          </button>
          <button 
            className={`px-3 py-1 rounded ${currentDifficulty === "hard" ? "bg-gray-700" : "bg-gray-500"} text-white`}
            onClick={() => changeDifficulty("hard")}
          >
            Hard
          </button>
        </div>

        {/* Mistakes counter */}
        <div className="text-center mb-4 text-sm text-gray-600">
          Mistakes: <span>{mistakes}</span>/4
        </div>

        {/* Game board */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {boardTiles.map((tile, index) => (
            <div
              key={index}
              className={getTileClassName(tile)}
              onClick={() => toggleTileSelection(index)}
            >
              {tile.text}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex mb-4">
          <button
            className="flex-grow mr-2 py-2 px-4 bg-indigo-600 text-white font-bold rounded disabled:bg-gray-400"
            disabled={selectedTiles.length !== 4}
            onClick={handleSubmit}
          >
            Submit ({selectedTiles.length}/4)
          </button>
          <button
            className="w-16 py-2 px-4 bg-indigo-600 text-white font-bold rounded"
            onClick={handleShuffle}
          >
            ↻
          </button>
        </div>

        {/* Hints */}
        <div className="text-center mb-4">
          <button 
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded mx-1"
            onClick={getCategoryHint}
          >
            Category Hint
          </button>
          <button 
            className="bg-orange-500 text-white font-bold py-2 px-4 rounded mx-1"
            onClick={getChainHint}
          >
            Chain Hint
          </button>
          {showHint && (
            <div className="mt-2 p-2 bg-orange-100 rounded text-sm text-left">
              {hint}
            </div>
          )}
        </div>

        {/* Solved groups */}
        <div>
          {correctGroups.map((group, index) => (
            <div key={index} className={`mb-4 overflow-hidden rounded`}>
              <div className={`p-2 font-bold flex justify-between bg-${group.color}`}>
                <span>{group.category}</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {group.tiles.map((tile, tileIndex) => (
                  <div key={tileIndex} className="p-2 text-center font-bold bg-gray-100">
                    {tile}
                  </div>
                ))}
              </div>
              <div className="py-1 px-2 text-center text-sm italic bg-gray-100">
                {group.chainDescription}
              </div>
            </div>
          ))}
        </div>

        {/* Game over message */}
        {gameOver && (
          <div className="text-center mt-4">
            {mistakes < 4 ? (
              <>
                <div className="text-xl font-bold text-green-600 mb-2">
                  Congratulations! You found all the groups!
                </div>
                <div className="mb-4">
                  You completed the puzzle with {mistakes} mistake{mistakes !== 1 ? 's' : ''}.
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-red-600 mb-2">
                  Game Over! Too many mistakes.
                </div>
                <button 
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded mb-2"
                  onClick={revealAllGroups}
                >
                  Reveal All Groups
                </button>
              </>
            )}
            <button 
              className="ml-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded"
              onClick={playAgain}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// CSS styles to include in your project
const styles = `
  :root {
    --yellow: #f7da21;
    --green: #71aa34; 
    --blue: #6aacee;
    --purple: #b361cc;
  }

  .tile {
    height: 60px;
    border: 2px solid #ddd;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    cursor: pointer;
    background-color: white;
    transition: all 0.2s ease;
    user-select: none;
  }

  .tile.selected {
    border-color: #333;
    background-color: #eee;
    transform: scale(0.95);
  }

  .tile.correct-yellow {
    background-color: var(--yellow);
    border-color: var(--yellow);
    color: #333;
  }

  .tile.correct-green {
    background-color: var(--green);
    border-color: var(--green);
    color: white;
  }

  .tile.correct-blue {
    background-color: var(--blue);
    border-color: var(--blue);
    color: white;
  }

  .tile.correct-purple {
    background-color: var(--purple);
    border-color: var(--purple);
    color: white;
  }

  .tile.incorrect {
    animation: shake 0.5s;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }

  .bg-yellow {
    background-color: var(--yellow);
    color: #333;
  }

  .bg-green {
    background-color: var(--green);
    color: white;
  }

  .bg-blue {
    background-color: var(--blue);
    color: white;
  }

  .bg-purple {
    background-color: var(--purple);
    color: white;
  }
`;

export default ChainConnectionsGame;