import * as Tone from "tone";
import { useRef, useState, useEffect, useCallback } from "react";
import { Sampler } from "tone";

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <div {...delegated}>{children}</div>;
}

function Daw() {
  return (
    <ClientOnly>
      <ClientOnlyDaw />
    </ClientOnly>
  );
}

const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const keyToneMap = {
  a: "C",
  w: "C#",
  s: "D",
  e: "D#",
  d: "E",
  f: "F",
  t: "F#",
  g: "G",
  y: "G#",
  h: "A",
  u: "A#",
  j: "B",
  k: "C+",
};

const persons = {
  sonja: {
    url: "sonja_ski.mp3",
    base: "E3",
  },
  aileen: {
    url: "aileen_ski.mp3",
    base: "G2",
  },
  anne: {
    url: "anne_ski.mp3",
    base: "G#2",
  },
  sergio: {
    url: "sergio_ski.mp3",
    base: "C#3",
  },
  arne: {
    url: "arne_ski.mp3",
    base: "E3",
  },
  stefan: {
    url: "stefan_ski.mp3",
    base: "B2",
  },
  nienke: {
    url: "nienke_ski.mp3",
    base: "E3",
  },
  rob: {
    url: "rob_ski_2.mp3",
    base: "D2",
  },
  rob_special: {
    url: "rob_ski.mp3",
    base: "D3",
  },
};

const names = [
  "sonja",
  "aileen",
  "nienke",
  "stefan",
  "arne",
  "sergio",
  "anne",
  "rob",
  "rob_special",
];

function ClientOnlyDaw() {
  const [octave, setOctave] = useState(3);
  const [notesDown, setNotesDown] = useState<string[]>([]);

  const [decay, setDecay] = useState<number>(1);

  const [person, setPerson] = useState<string>(() => {
    return names[Math.floor(Math.random() * names.length)];
  });

  const samples = useRef(
    Object.keys(persons).reduce(
      (obj, key) => ({
        ...obj,
        [key]: new Tone.Sampler({
          urls: {
            [persons[key].base]: persons[key].url,
          },
          release: 4,
        }).toDestination(),
      }),
      {}
    )
  );

  const ski: Sampler = samples.current[person];

  const verb = useRef(new Tone.Reverb().toDestination());

  useEffect(() => {
    verb.current.set({ decay });
  }, [decay]);

  const comp = useRef(new Tone.Compressor(-50, 6)).current;

  ski.chain(verb.current, comp);

  function handleToneUp(key: string) {
    setNotesDown((keys) => keys.filter((k) => k !== key));
    ski.triggerRelease(key);
    ski.toDestination();
  }

  function handleToneDown(key: string) {
    setNotesDown((keys) => [...keys, key]);
    ski.triggerAttack(key);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }

    if (e.key in keyToneMap) {
      const _octave = keyToneMap[e.key].includes("+") ? octave + 1 : octave;
      const _key = `${keyToneMap[e.key]}${_octave}`.replace("+", "");
      handleToneDown(_key);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.repeat) {
      return;
    }

    if (e.key === "1") {
      setPerson("sonja");
    }
    if (e.key === "2") {
      setPerson("sergio");
    }
    if (e.key === "3") {
      setPerson("anne");
    }
    if (e.key === "4") {
      setPerson("arne");
    }
    if (e.key === "5") {
      setPerson("aileen");
    }
    if (e.key === "6") {
      setPerson("stefan");
    }
    if (e.key === "7") {
      setPerson("nienke");
    }
    if (e.key === "8") {
      setPerson("rob");
    }
    if (e.key === "9") {
      setPerson("rob_special");
    }

    if (e.key === "z") {
      setOctave((o) => clamp(o - 1, 2, 4));
    }
    if (e.key === "x") {
      setOctave((o) => clamp(o + 1, 2, 4));
    }
    if (e.key in keyToneMap) {
      const _octave = keyToneMap[e.key].includes("+") ? octave + 1 : octave;
      const _key = `${keyToneMap[e.key]}${_octave}`.replace("+", "");
      handleToneUp(_key);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [octave, person]);

  return (
    <>
      <div className="container">
        <div style={{ paddingTop: "5rem" }}>
          <p>
            Current octave:{" "}
            <select
              value={octave}
              onKeyPress={(e) => {
                e.preventDefault();
              }}
              onChange={(e) => {
                setOctave(parseInt(e.target.value));
              }}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </p>
          <p>
            Current person:{" "}
            <select
              value={person}
              onKeyPress={(e) => {
                e.preventDefault();
              }}
              onChange={(e) => {
                setPerson(e.target.value);
              }}
            >
              <option value="nienke">Nienke</option>
              <option value="arne">Arne</option>
              <option value="sonja">Sonja</option>
              <option value="sergio">Sergio</option>
              <option value="anne">Anne</option>
              <option value="stefan">Stefan</option>
              <option value="aileen">Aileen</option>
              <option value="rob">Rob</option>
              <option value="rob_special">Rob (special)</option>
            </select>
          </p>
          <p>
            Reverb length:{" "}
            <select
              value={decay}
              onKeyPress={(e) => {
                e.preventDefault();
              }}
              onChange={(e) => {
                setDecay(parseInt(e.target.value));
              }}
            >
              <option value="1">Short</option>
              <option value="2">Medium</option>
              <option value="10">Long</option>
              <option value="80">Extra long</option>
            </select>
          </p>
        </div>
        <div className="piano">
          {[octave - 1, octave, octave + 1].map((oct) => (
            <div className="pianoOctave" key={oct}>
              {keys.map((key, index) => {
                const _key = `${key}${oct}`;
                return (
                  <div
                    key={index}
                    onMouseDown={() => handleToneDown(_key)}
                    onMouseLeave={() => handleToneUp(_key)}
                    onMouseUp={() => handleToneUp(_key)}
                    className={`key ${key.includes("#") ? "black" : "white"} ${
                      notesDown.includes(_key) ? "down" : ""
                    }`}
                  >
                    <span>{key === "C" && oct === octave && `c${oct}`}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p>
          Use the keyboard to play:
          <ul>
            {Object.keys(keyToneMap).map((key) => (
              <li>
                <span style={{ color: "#999" }}>{key}</span>:{" "}
                {keyToneMap[key].replace("+", "")}
              </li>
            ))}
          </ul>
        </p>
        <p>
          Use <span style={{ color: "#999" }}>z</span> or{" "}
          <span style={{ color: "#999" }}>x</span> to change octave:
        </p>
        <p>
          Use numbers <span style={{ color: "#999" }}>1</span> trough{" "}
          <span style={{ color: "#999" }}>9</span> to change the person
        </p>
        <p>The default selected person is chosen at random.</p>
      </div>
    </>
  );
}

export default Daw;
