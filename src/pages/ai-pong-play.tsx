import { Link } from "react-router-dom";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  LEFT_MODEL_URL,
  RIGHT_MODEL_URL,
  choosePolicyAction,
  chooseTrackerAction,
  compilePolicy,
  createInitialState,
  drawGame,
  fallbackConfig,
  getLeftObservation,
  getRightObservation,
  movePaddle,
  reflectFromPaddle,
  serveBall,
  type BrowserPolicy,
  type BrowserPolicyJson,
  type EnvConfig,
  type GameState,
  type HudState,
} from "../lib/aiPongEngine";
import "../styles/ai-pong-play.css";

export default function AIPongPlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftPolicyRef = useRef<BrowserPolicy | null>(null);
  const rightPolicyRef = useRef<BrowserPolicy | null>(null);
  const configRef = useRef<EnvConfig>(fallbackConfig);
  const stateRef = useRef<GameState>(createInitialState(fallbackConfig));
  const aiModeRef = useRef(false);
  const keysRef = useRef({ up: false, down: false });
  const pointerActiveRef = useRef(false);
  const pointerTargetRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messageUntilRef = useRef(0);
  const messageRef = useRef("Loading trained bot...");
  const [hud, setHud] = useState<HudState>({
    leftScore: 0,
    rightScore: 0,
    leftHits: 0,
    rightHits: 0,
    rallyHits: 0,
    modelStatus: "loading",
    message: "Loading trained bot...",
  });
  const [modelMeta, setModelMeta] = useState<BrowserPolicyJson | null>(null);
  const [aiMode, setAiMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPolicy = (url: string) =>
      fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load model ${url}: ${response.status}`);
        }

        return response.json() as Promise<BrowserPolicyJson>;
      });

    Promise.all([loadPolicy(LEFT_MODEL_URL), loadPolicy(RIGHT_MODEL_URL)])
      .then(([leftModel, rightModel]) => {
        if (cancelled) {
          return;
        }

        const leftPolicy = compilePolicy(leftModel);
        const rightPolicy = compilePolicy(rightModel);
        leftPolicyRef.current = leftPolicy;
        rightPolicyRef.current = rightPolicy;
        configRef.current = rightModel.envConfig;
        stateRef.current = createInitialState(rightModel.envConfig);
        if (canvasRef.current) {
          canvasRef.current.width = rightModel.envConfig.width;
          canvasRef.current.height = rightModel.envConfig.height;
        }
        messageRef.current = `Loaded left and right checkpoint update ${rightModel.checkpointUpdate}`;
        messageUntilRef.current = performance.now() + 2200;
        setModelMeta(rightModel);
        setHud((previous) => ({
          ...previous,
          leftScore: 0,
          rightScore: 0,
          leftHits: 0,
          rightHits: 0,
          rallyHits: 0,
          modelStatus: "ready",
          message: messageRef.current,
        }));
      })
      .catch((error) => {
        console.error(error);
        if (cancelled) {
          return;
        }

        messageRef.current = "Model failed to load. Using tracker bot fallback.";
        messageUntilRef.current = performance.now() + 2800;
        setHud((previous) => ({
          ...previous,
          modelStatus: "error",
          message: messageRef.current,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") {
        keysRef.current.up = true;
        event.preventDefault();
      }
      if (event.code === "KeyS" || event.code === "ArrowDown") {
        keysRef.current.down = true;
        event.preventDefault();
      }
      if (event.code === "Space") {
        serveBall(stateRef.current, configRef.current);
        event.preventDefault();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") {
        keysRef.current.up = false;
      }
      if (event.code === "KeyS" || event.code === "ArrowDown") {
        keysRef.current.down = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    let accumulator = 0;
    let lastHudUpdate = 0;

    const tick = (time: number) => {
      const canvas = canvasRef.current;
      const config = configRef.current;
      const state = stateRef.current;
      const frameDelta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      accumulator += frameDelta;

      while (accumulator >= config.dt) {
        const pointerTarget = pointerTargetRef.current;
        const keyPressed = keysRef.current.up !== keysRef.current.down;
        const leftPolicy = leftPolicyRef.current;
        const rightPolicy = rightPolicyRef.current;
        const isAiMode = aiModeRef.current && leftPolicy !== null && rightPolicy !== null;
        let leftAction = 0;

        if (isAiMode) {
          leftAction = choosePolicyAction(leftPolicy, getLeftObservation(state, config));
        } else if (keyPressed) {
          leftAction = keysRef.current.up ? 1 : 2;
        } else if (pointerActiveRef.current && pointerTarget !== null) {
          if (Math.abs(pointerTarget - state.leftY) > 8) {
            leftAction = pointerTarget < state.leftY ? 1 : 2;
          }
        }

        const rightAction = rightPolicy
          ? choosePolicyAction(rightPolicy, getRightObservation(state, config))
          : chooseTrackerAction(state.ballY, state.rightY);

        state.leftY = movePaddle(state.leftY, leftAction, config);
        state.rightY = movePaddle(state.rightY, rightAction, config);
        state.ballX += state.ballVx * config.dt;
        state.ballY += state.ballVy * config.dt;

        if (state.ballY - config.ball_radius <= 0) {
          state.ballY = config.ball_radius;
          state.ballVy = Math.abs(state.ballVy);
        } else if (state.ballY + config.ball_radius >= config.height) {
          state.ballY = config.height - config.ball_radius;
          state.ballVy = -Math.abs(state.ballVy);
        }

        const leftFront = config.paddle_margin + config.paddle_width;
        const rightFront = config.width - config.paddle_margin - config.paddle_width;
        const halfPaddle = config.paddle_height / 2;

        if (
          state.ballVx < 0 &&
          state.ballX - config.ball_radius <= leftFront &&
          Math.abs(state.ballY - state.leftY) <= halfPaddle
        ) {
          state.ballX = leftFront + config.ball_radius;
          reflectFromPaddle(state, state.leftY, 1, config);
          state.leftHits += 1;
          state.rallyHits += 1;
        }

        if (
          state.ballVx > 0 &&
          state.ballX + config.ball_radius >= rightFront &&
          Math.abs(state.ballY - state.rightY) <= halfPaddle
        ) {
          state.ballX = rightFront - config.ball_radius;
          reflectFromPaddle(state, state.rightY, -1, config);
          state.rightHits += 1;
          state.rallyHits += 1;
        }

        if (state.ballX < -config.ball_radius) {
          state.rightScore += 1;
          messageRef.current = isAiMode ? "Right AI scored" : "Bot scored";
          messageUntilRef.current = time + 900;
          serveBall(state, config, -1);
        } else if (state.ballX > config.width + config.ball_radius) {
          state.leftScore += 1;
          messageRef.current = isAiMode ? "Left AI scored" : "You scored";
          messageUntilRef.current = time + 900;
          serveBall(state, config, 1);
        }

        if (state.leftScore >= config.score_to_win || state.rightScore >= config.score_to_win) {
          const leftWon = state.leftScore > state.rightScore;
          messageRef.current = isAiMode
            ? leftWon
              ? "Left AI won the match. Resetting."
              : "Right AI won the match. Resetting."
            : leftWon
              ? "You won the match. Resetting."
              : "Bot won the match. Resetting.";
          messageUntilRef.current = time + 1800;
          state.leftScore = 0;
          state.rightScore = 0;
          state.leftHits = 0;
          state.rightHits = 0;
          serveBall(state, config);
        }

        accumulator -= config.dt;
      }

      const message = time < messageUntilRef.current ? messageRef.current : "";
      if (canvas) {
        drawGame(canvas, state, config, message, aiModeRef.current ? "ai" : "human");
      }

      if (time - lastHudUpdate > 250) {
        lastHudUpdate = time;
        setHud((previous) => ({
          ...previous,
          leftScore: state.leftScore,
          rightScore: state.rightScore,
          leftHits: state.leftHits,
          rightHits: state.rightHits,
          rallyHits: state.rallyHits,
          message,
        }));
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const updatePointerTarget = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleY = configRef.current.height / rect.height;
    pointerTargetRef.current = (event.clientY - rect.top) * scaleY;
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    pointerActiveRef.current = true;
    event.currentTarget.focus();
    event.currentTarget.setPointerCapture(event.pointerId);
    updatePointerTarget(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointerActiveRef.current) {
      updatePointerTarget(event);
    }
  };

  const stopPointerControl = (event: PointerEvent<HTMLCanvasElement>) => {
    pointerActiveRef.current = false;
    pointerTargetRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = () => {
    pointerActiveRef.current = false;
    pointerTargetRef.current = null;
  };

  const resetMatch = () => {
    const config = configRef.current;
    stateRef.current = createInitialState(config);
    messageRef.current = aiModeRef.current ? "Reset AI match" : "Reset match";
    messageUntilRef.current = performance.now() + 900;
  };

  const toggleAiMode = () => {
    if (!leftPolicyRef.current || !rightPolicyRef.current) {
      messageRef.current = "AI mode needs both trained models loaded.";
      messageUntilRef.current = performance.now() + 1400;
      setHud((previous) => ({
        ...previous,
        message: messageRef.current,
      }));
      return;
    }

    const nextMode = !aiModeRef.current;
    aiModeRef.current = nextMode;
    pointerActiveRef.current = false;
    pointerTargetRef.current = null;
    keysRef.current = { up: false, down: false };
    stateRef.current = createInitialState(configRef.current);
    messageRef.current = nextMode ? "AI mode: left model vs right model" : "Player mode: you vs right model";
    messageUntilRef.current = performance.now() + 1600;
    setAiMode(nextMode);
    setHud((previous) => ({
      ...previous,
      leftScore: 0,
      rightScore: 0,
      leftHits: 0,
      rightHits: 0,
      rallyHits: 0,
      message: messageRef.current,
    }));
  };

  return (
    <main className="pong-play-page">
      <section className="pong-play-shell">
        <div className="pong-play-heading">
          <Link to="/projects/ai-pong-self-play" className="post-back-link">
            Back to AI Pong
          </Link>
          <h1>Play the trained Pong bot</h1>
          <p>
            Your browser downloads the exported PPO policies, runs the neural networks locally,
            and uses them to control the checkpoint agents.
          </p>
        </div>

        <div className="pong-stage">
          <canvas
            ref={canvasRef}
            width={fallbackConfig.width}
            height={fallbackConfig.height}
            className="pong-canvas"
            aria-label="Playable Pong game against the trained AI bot"
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPointerControl}
            onPointerCancel={stopPointerControl}
            onPointerLeave={handlePointerLeave}
          />
        </div>

        <div className="pong-controls-row" aria-live="polite">
          <div>
            <p className="pong-label">Status</p>
            <p>{hud.modelStatus === "ready" ? `Models loaded: update ${modelMeta?.checkpointUpdate}` : hud.message}</p>
          </div>
          <div>
            <p className="pong-label">Score</p>
            <p>{aiMode ? "Left AI" : "You"} {hud.leftScore} : {hud.rightScore} {aiMode ? "Right AI" : "Bot"}</p>
          </div>
          <div>
            <p className="pong-label">Rally</p>
            <p>{hud.rallyHits} returns</p>
          </div>
        </div>

        <div className="pong-actions">
          <button type="button" onClick={resetMatch}>
            Reset match
          </button>
          <button
            type="button"
            onClick={toggleAiMode}
            aria-pressed={aiMode}
            disabled={hud.modelStatus !== "ready"}
          >
            {aiMode ? "Player mode" : "AI mode"}
          </button>
          <a href={RIGHT_MODEL_URL} download="ai-pong-right-agent-policy.json">
            Download browser model
          </a>
        </div>

        <div className="pong-notes">
          <p>
            Controls: move with W/S, arrow keys, or drag with mouse or touch. Press Space to
            re-serve. AI mode runs the two trained checkpoint policies against each other.
          </p>
          <p>
            The downloadable model is a JSON export of the trained right-side ActorCritic policy.
            AI mode also loads the left-side policy in the browser: 9 inputs, two 128-unit tanh
            layers, and 3 action logits for each agent.
          </p>
        </div>
      </section>
    </main>
  );
}
