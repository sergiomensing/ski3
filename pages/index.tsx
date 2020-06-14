import React from "react";
import { Howl, Howler } from "howler";
import FlipMove from "react-flip-move";
import { v4 as uuidv4 } from "uuid";
import GlitchHover from "../components/GlitchHover";

let sergioRate = 1;
let anneRate = 1;
let nienkeRate = 1;
let arneRate = 1;
let playing = false;

type QueuedSound = {
  id: string;
  play: () => void;
  rotate: number;
  person: string;
};

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function useAnimationFrame(callback) {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = React.useRef();
  const previousTimeRef = React.useRef();

  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      // @ts-ignore
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    // @ts-ignore
    requestRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    // @ts-ignore
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once
}

function getRandomDefaultPerson() {
  return ["anne", "arne", "nienke", "sergio"][randomIntFromInterval(0, 3)];
}

const Home: React.FC = () => {
  const [queue, setQueue] = React.useState<QueuedSound[]>([]);
  const [person, setPerson] = React.useState<string>("");

  React.useEffect(() => {
    setPerson(getRandomDefaultPerson());
  }, []);

  const anne = React.useRef(
    new Howl({
      src: ["/anne_ski_2.mp3"],
      onend: (id) => {
        playing = false;
        anneRate = anneRate + 0.1;
        setQueue((queue) => queue.filter((v, i) => i !== 0));
      },
    })
  ).current;

  const sergio = React.useRef(
    new Howl({
      src: ["/sergio_ski_2.mp3"],
      onend: (id) => {
        playing = false;
        sergioRate = sergioRate + 0.1;
        setQueue((queue) => queue.filter((v, i) => i !== 0));
      },
    })
  ).current;

  const arne = React.useRef(
    new Howl({
      src: ["/arne_ski.mp3"],
      onend: (id) => {
        playing = false;
        arneRate = arneRate + 0.1;
        setQueue((queue) => queue.filter((v, i) => i !== 0));
      },
    })
  ).current;

  const nienke = React.useRef(
    new Howl({
      src: ["/nienke_ski.mp3"],
      onend: (id) => {
        playing = false;
        nienkeRate = nienkeRate + 0.1;
        setQueue((queue) => queue.filter((v, i) => i !== 0));
      },
    })
  ).current;

  function handleClickSound() {
    setQueue((queue) => [
      ...queue,
      {
        id: uuidv4(),
        rotate: randomIntFromInterval(0, 360),
        play: () => {
          switch (person) {
            case "anne":
              return anne.play();
            case "arne":
              return arne.play();
            case "nienke":
              return nienke.play();
            case "sergio":
              return sergio.play();
            default:
              return;
          }
        },
        person: person,
      },
    ]);
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case "a":
        return setPerson("sergio");
      case "s":
        return setPerson("anne");
      case "d":
        return setPerson("arne");
      case "f":
        return setPerson("nienke");
      default:
        return;
    }
  };

  React.useEffect(() => {
    document.addEventListener("keypress", handleKeyPress);

    return () => document.removeEventListener("keypress", handleKeyPress);
  }, []);

  useAnimationFrame((deltaTime) => {
    runQueue();
  });

  React.useEffect(() => {
    runQueue();
  }, [queue]);

  const runQueue = () => {
    if (queue.length > 0) {
      if (!playing) {
        playing = true;
        switch (queue[0].person) {
          case "anne":
            anne.rate(anneRate);
          case "arne":
            arne.rate(arneRate);
          case "nienke":
            nienke.rate(nienkeRate);
          default:
            sergio.rate(sergioRate);
        }
        queue[0].play();
      }
    }
  };

  React.useEffect(() => {
    anne.once("load", () => {});
    arne.once("load", () => {});
    nienke.once("load", () => {});
    sergio.once("load", () => {});
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <img
          src="/ski_with_me.svg"
          onClick={() => handleClickSound()}
          className="skiImage"
        />
        <div className="skiQueue">
          {queue.map((v, i) => (
            <div
              className="skiQueue__dot"
              key={v.id}
              style={{
                transform: `rotate(${v.rotate}deg)`,
              }}
            >
              <svg>
                <g transform="translate(-271.5 -106)">
                  <path
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#1d1d1d"
                    d="M281.7 108.54c-3.72.35-6.36 4.08-6.58 7.65-.21 3.3 1.4 6.66 5.13 5.91 4.15-.83 8.11-3.82 8.06-8.36 0-2-.56-3.86-2.52-4.71a8.58 8.58 0 00-5.87 0c-1.67.55-1.39 1.8.33 1.24 2.88-.94 4.9.79 5.13 3.61a6.74 6.74 0 01-.92 4.14c-.82 1.27-3.34 3.39-4.94 2.44-1.4-.84-1.64-3.71-1.48-5.11s1.42-5.2 3.21-5.37c1.33-.12 2.47-1.59.45-1.39z"
                  />
                </g>
              </svg>
            </div>
          ))}
        </div>
        <div className="skiPersons">
          <div
            onClick={() => setPerson("sergio")}
            className={`sergio ${person === "sergio" ? "active" : ""}`}
          ></div>
          <div
            onClick={() => setPerson("anne")}
            className={`anne ${person === "anne" ? "active" : ""}`}
          ></div>
          <div
            onClick={() => setPerson("arne")}
            className={`arne ${person === "arne" ? "active" : ""}`}
          ></div>
          <div
            onClick={() => setPerson("nienke")}
            className={`nienke ${person === "nienke" ? "active" : ""}`}
          ></div>
        </div>
      </div>
    </>
  );
};

export default Home;
