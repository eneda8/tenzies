import React, {useState, useEffect} from "react";
import Die from "./Die";
import {nanoid} from "nanoid";
import Confetti from "react-confetti";
import useWindowSize from 'react-use-window-size';

export default function App() {
    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }

    function allNewDice() {
        const newDice = []
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie())
        }
        return newDice;
    }

    const [gameState, setGameState] = useState({
        dice: allNewDice(),
        tenzies: false,
        roll: 0,
        start: false,
        time: {hours: 0, minutes: 0, seconds: 0}
    });

    useEffect(() => {
        let interval = null;
        if (gameState.start) {
          interval = setInterval(() => {
            setGameState((prevState) => {
              const { hours, minutes, seconds } = prevState.time;
              let newSeconds = seconds + 1;
              let newMinutes = minutes;
              let newHours = hours;
              if (newSeconds >= 60) {
                newSeconds = 0;
                newMinutes = minutes + 1;
              }
              if (newMinutes >= 60) {
                newMinutes = 0;
                newHours = hours + 1;
              }
              return {
                ...prevState,
                time: {
                  hours: newHours,
                  minutes: newMinutes,
                  seconds: newSeconds,
                },
              };
            });
          }, 1000);
        }
        return () => clearInterval(interval);
      },);

   useEffect(() => {
        const value = gameState.dice[0].value;
        const allHeld = gameState.dice.every((die) => die.isHeld);
        const sameValue = gameState.dice.every((die) => die.value === value);
        if (allHeld && sameValue) {
            setGameState((prevState) => ({
            ...prevState,
            tenzies: true,
            start: false,
            }));
        }
    }, [gameState.dice]);

    function rollDice() {
        if (!gameState.tenzies) {
            setGameState(prevState => ({
              ...prevState,
              dice: prevState.dice.map(die => (die.isHeld ? die : generateNewDie())),
              roll: prevState.roll + 1
            }));
        } else {
          setGameState(prevState => ({
            ...prevState,
            time: {hours:0, minutes: 0, seconds: 0},
            tenzies: false,
            dice: allNewDice(),
            roll: 0
          }));
        }
    }
    
    function holdDice(id) {
        setGameState((prevState) => ({
          ...prevState,
          start: true,
          dice: prevState.dice.map((die) =>
            die.id === id ? { ...die, isHeld: !die.isHeld } : die
          ),
        }));
    }
    
    const diceElements = gameState.dice.map(die => (
        <Die 
            key={die.id} 
            value={die.value} 
            isHeld={die.isHeld} 
            holdDice={() => holdDice(die.id)}
        />
    ))
    
    const { width, height } = useWindowSize()
    return (
        <div className="container">
          <main>
            {gameState.tenzies && <Confetti />}
            <h1 className="title">Tenzies</h1>
            {!gameState.tenzies && <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>}
            <div className='timer-container'>
                <h3 className='timer'>Timer: {String(gameState.time.hours).padStart(2, '0')}:{String(gameState.time.minutes).padStart(2, '0')}:{String(gameState.time.seconds).padStart(2, '0')}</h3>
                <h3 className='roll-count'>Count: {gameState.roll}</h3>
            </div>
            {!gameState.tenzies && <div className="dice-container">{diceElements}</div>}
            {gameState.tenzies && 
            <h2>You won!</h2> 
            
            }
            <button className="roll-dice" onClick={rollDice}>{gameState.tenzies ? "New Game" : "Roll"}</button>
          </main>
        </div>
    );
}