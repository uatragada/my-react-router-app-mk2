import { Link } from "react-router-dom";
import type { PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import "../styles/ai-pong-play.css";

const MODEL_URL = "/ai-pong/right-agent-policy.json";

type EnvConfig = {
  width: number;
  height: number;
  paddle_width: number;
  paddle_height: number;
  paddle_margin: number;
  paddle_speed: number;
  ball_radius: number;
  serve_speed: number;
  max_ball_speed: number;
  ball_speedup: number;
  max_bounce_angle: number;
  dt: number;
  score_to_win: number;
};

type LayerWeights = {
  weight: number[][];
  bias: number[];
};

type BrowserPolicyJson = {
  name: string;
  format: string;
  checkpointUpdate: number;
  observationSize: number;
  actionSize: number;
  hiddenSize: number;
  actions: string[];
  envConfig: EnvConfig;
  layers: {
    backbone0: LayerWeights;
    backbone2: LayerWeights;
    policyHead: LayerWeights;
  };
};

type DenseLayer = {
  weight: Float32Array[];
  bias: Float32Array;
};

type BrowserPolicy = {
  meta: BrowserPolicyJson;
  l0: DenseLayer;
  l1: DenseLayer;
  policy: DenseLayer;
};

type GameState = {
  leftY: number;
  rightY: number;
  ballX: number;
  ballY: number;
  ballVx: number;
  ballVy: number;
  leftScore: number;
  rightScore: number;
  leftHits: number;
  rightHits: number;
  rallyHits: number;
};

type HudState = {
  leftScore: number;
  rightScore: number;
  leftHits: number;
  rightHits: number;
  rallyHits: number;
  modelStatus: "loading" | "ready" | "error";
  message: string;
};

const fallbackConfig: EnvConfig = {
  width: 900,
  height: 600,
  paddle_width: 16,
  paddle_height: 96,
  paddle_margin: 36,
  paddle_speed: 540,
  ball_radius: 9,
  serve_speed: 360,
  max_ball_speed: 920,
  ball_speedup: 1.045,
  max_bounce_angle: (65 * Math.PI) / 180,
  dt: 1 / 60,
  score_to_win: 7,
};

function compileLayer(layer: LayerWeights): DenseLayer {
  return {
    weight: layer.weight.map((row) => Float32Array.from(row)),
    bias: Float32Array.from(layer.bias),
  };
}

function compilePolicy(model: BrowserPolicyJson): BrowserPolicy {
  return {
    meta: model,
    l0: compileLayer(model.layers.backbone0),
    l1: compileLayer(model.layers.backbone2),
    policy: compileLayer(model.layers.policyHead),
  };
}

function dense(layer: DenseLayer, input: Float32Array, activate = false): Float32Array {
  const output = new Float32Array(layer.bias.length);

  for (let rowIndex = 0; rowIndex < layer.weight.length; rowIndex += 1) {
    const row = layer.weight[rowIndex];
    let sum = layer.bias[rowIndex];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      sum += row[columnIndex] * input[columnIndex];
    }

    output[rowIndex] = activate ? Math.tanh(sum) : sum;
  }

  return output;
}

function choosePolicyAction(policy: BrowserPolicy, observation: Float32Array): number {
  const hidden0 = dense(policy.l0, observation, true);
  const hidden1 = dense(policy.l1, hidden0, true);
  const logits = dense(policy.policy, hidden1);
  let bestIndex = 0;
  let bestLogit = logits[0];

  for (let index = 1; index < logits.length; index += 1) {
    if (logits[index] > bestLogit) {
      bestIndex = index;
      bestLogit = logits[index];
    }
  }

  return bestIndex;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialState(config: EnvConfig): GameState {
  const state: GameState = {
    leftY: config.height / 2,
    rightY: config.height / 2,
    ballX: config.width / 2,
    ballY: config.height / 2,
    ballVx: 0,
    ballVy: 0,
    leftScore: 0,
    rightScore: 0,
    leftHits: 0,
    rightHits: 0,
    rallyHits: 0,
  };

  serveBall(state, config);
  return state;
}

function serveBall(state: GameState, config: EnvConfig, serveDirection?: -1 | 1) {
  const angle = (Math.random() * 2 - 1) * 0.32;
  const direction = serveDirection ?? (Math.random() < 0.5 ? -1 : 1);

  state.ballX = config.width / 2;
  state.ballY = config.height / 2 + (Math.random() * 2 - 1) * (config.height * 0.15);
  state.ballVx = direction * config.serve_speed * Math.cos(angle);
  state.ballVy = config.serve_speed * Math.sin(angle);
  state.rallyHits = 0;
}

function movePaddle(paddleY: number, action: number, config: EnvConfig): number {
  const directionByAction = [0, -1, 1];
  const halfPaddle = config.paddle_height / 2;

  return clamp(
    paddleY + directionByAction[action] * config.paddle_speed * config.dt,
    halfPaddle,
    config.height - halfPaddle
  );
}

function reflectFromPaddle(
  state: GameState,
  paddleY: number,
  direction: -1 | 1,
  config: EnvConfig
) {
  const offset = clamp((state.ballY - paddleY) / (config.paddle_height / 2), -1, 1);
  const speed = Math.min(
    Math.hypot(state.ballVx, state.ballVy) * config.ball_speedup,
    config.max_ball_speed
  );
  const angle = offset * config.max_bounce_angle;

  state.ballVx = direction * speed * Math.cos(angle);
  state.ballVy = speed * Math.sin(angle);
}

function getRightObservation(state: GameState, config: EnvConfig): Float32Array {
  return Float32Array.from([
    state.rightY / config.height,
    state.leftY / config.height,
    (config.width - state.ballX) / config.width,
    state.ballY / config.height,
    -state.ballVx / config.max_ball_speed,
    state.ballVy / config.max_ball_speed,
    (state.ballY - state.rightY) / config.height,
    (state.ballY - state.leftY) / config.height,
    (state.rightScore - state.leftScore) / config.score_to_win,
  ]);
}

function chooseFallbackBotAction(state: GameState): number {
  if (Math.abs(state.ballY - state.rightY) < 8) {
    return 0;
  }

  return state.ballY < state.rightY ? 1 : 2;
}

function drawGame(canvas: HTMLCanvasElement, state: GameState, config: EnvConfig, message: string) {
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.clearRect(0, 0, config.width, config.height);
  context.fillStyle = "#101218";
  context.fillRect(0, 0, config.width, config.height);

  context.strokeStyle = "#3c424e";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(config.width / 2, 0);
  context.lineTo(config.width / 2, config.height);
  context.stroke();

  context.fillStyle = "#edf2f4";
  context.beginPath();
  context.roundRect(
    config.paddle_margin,
    state.leftY - config.paddle_height / 2,
    config.paddle_width,
    config.paddle_height,
    4
  );
  context.fill();

  context.beginPath();
  context.roundRect(
    config.width - config.paddle_margin - config.paddle_width,
    state.rightY - config.paddle_height / 2,
    config.paddle_width,
    config.paddle_height,
    4
  );
  context.fill();

  context.fillStyle = "#ffbe5c";
  context.beginPath();
  context.arc(state.ballX, state.ballY, config.ball_radius, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#edf2f4";
  context.font = "28px Consolas, monospace";
  context.textAlign = "center";
  context.fillText(`${state.leftScore} : ${state.rightScore}`, config.width / 2, 48);

  context.fillStyle = "#a8b0be";
  context.font = "17px Consolas, monospace";
  context.textAlign = "left";
  context.fillText("you vs trained PPO bot", 20, config.height - 44);
  context.fillText(`hits you:${state.leftHits} bot:${state.rightHits} rally:${state.rallyHits}`, 20, config.height - 22);

  if (message) {
    context.fillStyle = "rgba(16, 18, 24, 0.72)";
    context.fillRect(0, config.height / 2 - 50, config.width, 100);
    context.fillStyle = "#edf2f4";
    context.font = "24px Consolas, monospace";
    context.textAlign = "center";
    context.fillText(message, config.width / 2, config.height / 2 + 8);
  }
}

export default function AIPongPlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const policyRef = useRef<BrowserPolicy | null>(null);
  const configRef = useRef<EnvConfig>(fallbackConfig);
  const stateRef = useRef<GameState>(createInitialState(fallbackConfig));
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

  useEffect(() => {
    let cancelled = false;

    fetch(MODEL_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load model: ${response.status}`);
        }

        return response.json() as Promise<BrowserPolicyJson>;
      })
      .then((model) => {
        if (cancelled) {
          return;
        }

        const policy = compilePolicy(model);
        policyRef.current = policy;
        configRef.current = model.envConfig;
        stateRef.current = createInitialState(model.envConfig);
        if (canvasRef.current) {
          canvasRef.current.width = model.envConfig.width;
          canvasRef.current.height = model.envConfig.height;
        }
        messageRef.current = `Loaded checkpoint update ${model.checkpointUpdate}`;
        messageUntilRef.current = performance.now() + 2200;
        setModelMeta(model);
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
        let leftAction = 0;

        if (keyPressed) {
          leftAction = keysRef.current.up ? 1 : 2;
        } else if (pointerActiveRef.current && pointerTarget !== null) {
          if (Math.abs(pointerTarget - state.leftY) > 8) {
            leftAction = pointerTarget < state.leftY ? 1 : 2;
          }
        }

        const policy = policyRef.current;
        const rightAction = policy
          ? choosePolicyAction(policy, getRightObservation(state, config))
          : chooseFallbackBotAction(state);

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
          messageRef.current = "Bot scored";
          messageUntilRef.current = time + 900;
          serveBall(state, config, -1);
        } else if (state.ballX > config.width + config.ball_radius) {
          state.leftScore += 1;
          messageRef.current = "You scored";
          messageUntilRef.current = time + 900;
          serveBall(state, config, 1);
        }

        if (state.leftScore >= config.score_to_win || state.rightScore >= config.score_to_win) {
          const userWon = state.leftScore > state.rightScore;
          messageRef.current = userWon ? "You won the match. Resetting." : "Bot won the match. Resetting.";
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
        drawGame(canvas, state, config, message);
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
    messageRef.current = "Reset match";
    messageUntilRef.current = performance.now() + 900;
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
            Your browser downloads the exported PPO policy, runs the neural network locally, and
            uses it to control the right paddle.
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
            <p>{hud.modelStatus === "ready" ? `Model loaded: update ${modelMeta?.checkpointUpdate}` : hud.message}</p>
          </div>
          <div>
            <p className="pong-label">Score</p>
            <p>You {hud.leftScore} : {hud.rightScore} Bot</p>
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
          <a href={MODEL_URL} download="ai-pong-right-agent-policy.json">
            Download browser model
          </a>
        </div>

        <div className="pong-notes">
          <p>Controls: move with W/S, arrow keys, or drag with mouse or touch. Press Space to re-serve.</p>
          <p>
            The downloadable model is a JSON export of the trained right-side ActorCritic policy:
            9 inputs, two 128-unit tanh layers, and 3 action logits.
          </p>
        </div>
      </section>
    </main>
  );
}
