import React from "react";
import { v4 as uuidv4 } from "uuid";

import { gsap } from "gsap";

type Props = {
  style?: CSSStyleDeclaration;
};
const GlitchHover: React.FC<Props> = ({ children, style }) => {
  const id = React.useRef(uuidv4()).current;

  const elRef = React.useRef<HTMLDivElement>();
  const filterRef = React.useRef<SVGFilterElement>();
  const seed = React.useRef<number>(1);

  const primitiveValues = React.useRef({ turbulence: 0 }).current;

  const handleTimlineValueUpdate = () => {
    filterRef.current
      .querySelector("feTurbulence")
      .setAttribute("baseFrequency", `${primitiveValues.turbulence}`);
  };

  const handleTimlineComplete = () => {
    seed.current = seed.current + 1;
    filterRef.current
      .querySelector("feTurbulence")
      .setAttribute("seed", `${seed.current}`);
    elRef.current.style.filter = `none`;
  };

  const handleTimlineStart = () => {
    elRef.current.style.filter = `url(#${id})`;
  };

  const timeline = React.useRef(
    gsap
      .timeline({
        paused: true,
        onUpdate: handleTimlineValueUpdate,
        onComplete: handleTimlineComplete,
        onStart: handleTimlineStart,
      })
      .to(primitiveValues, {
        duration: 1,
        startAt: {
          turbulence: 0.02,
        },
        turbulence: 0,
      })
  ).current;

  const onMouseEnter = (e: MouseEvent) => {
    timeline.restart();
  };

  const onMouseLeave = (e: MouseEvent) => {
    // timeline.progress(1).kill();
  };

  React.useEffect(() => {
    if (elRef.current) {
      elRef.current.addEventListener("mouseenter", onMouseEnter);
      elRef.current.addEventListener("mouseleave", onMouseLeave);

      return () => {
        elRef.current.removeEventListener("mouseenter", onMouseEnter);
        elRef.current.removeEventListener("mouseleave", onMouseLeave);
      };
    }
  }, [elRef]);

  return (
    <>
      <div ref={elRef}>{children}</div>
      <svg style={{ display: "none" }}>
        <defs>
          <filter id={id} ref={filterRef}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0"
              numOctaves="1"
              result="warp"
            />
            <feDisplacementMap
              xChannelSelector="R"
              yChannelSelector="G"
              scale="30"
              in="SourceGraphic"
              in2="warpOffset"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default GlitchHover;
