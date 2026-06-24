export const LEFT_MODEL_URL = "/ai-pong/left-agent-policy.json";
export const RIGHT_MODEL_URL = "/ai-pong/right-agent-policy.json";

export type EnvConfig = {
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

export type BrowserPolicyJson = {
  name: string;
  format: string;
  checkpointUpdate: number;
  observationSize: number;
  actionSize: number;
  hiddenSize: number;
  actions: string[];
  side?: "left" | "right";
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

export type BrowserPolicy = {
  meta: BrowserPolicyJson;
  l0: DenseLayer;
  l1: DenseLayer;
  policy: DenseLayer;
};

export type GameState = {
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

export type HudState = {
  leftScore: number;
  rightScore: number;
  leftHits: number;
  rightHits: number;
  rallyHits: number;
  modelStatus: "loading" | "ready" | "error";
  message: string;
};

type GameMode = "human" | "ai";

export const fallbackConfig: EnvConfig = {
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

export function compilePolicy(model: BrowserPolicyJson): BrowserPolicy {
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

export function choosePolicyAction(policy: BrowserPolicy, observation: Float32Array): number {
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

export function createInitialState(config: EnvConfig): GameState {
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

export function serveBall(state: GameState, config: EnvConfig, serveDirection?: -1 | 1) {
  const angle = (Math.random() * 2 - 1) * 0.32;
  const direction = serveDirection ?? (Math.random() < 0.5 ? -1 : 1);

  state.ballX = config.width / 2;
  state.ballY = config.height / 2 + (Math.random() * 2 - 1) * (config.height * 0.15);
  state.ballVx = direction * config.serve_speed * Math.cos(angle);
  state.ballVy = config.serve_speed * Math.sin(angle);
  state.rallyHits = 0;
}

export function movePaddle(paddleY: number, action: number, config: EnvConfig): number {
  const directionByAction = [0, -1, 1];
  const halfPaddle = config.paddle_height / 2;

  return clamp(
    paddleY + directionByAction[action] * config.paddle_speed * config.dt,
    halfPaddle,
    config.height - halfPaddle
  );
}

export function reflectFromPaddle(
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

export function getLeftObservation(state: GameState, config: EnvConfig): Float32Array {
  return Float32Array.from([
    state.leftY / config.height,
    state.rightY / config.height,
    state.ballX / config.width,
    state.ballY / config.height,
    state.ballVx / config.max_ball_speed,
    state.ballVy / config.max_ball_speed,
    (state.ballY - state.leftY) / config.height,
    (state.ballY - state.rightY) / config.height,
    (state.leftScore - state.rightScore) / config.score_to_win,
  ]);
}

export function getRightObservation(state: GameState, config: EnvConfig): Float32Array {
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

export function chooseTrackerAction(ballY: number, paddleY: number): number {
  if (Math.abs(ballY - paddleY) < 8) {
    return 0;
  }

  return ballY < paddleY ? 1 : 2;
}

export function drawGame(
  canvas: HTMLCanvasElement,
  state: GameState,
  config: EnvConfig,
  message: string,
  mode: GameMode
) {
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
  context.fillText(
    mode === "ai" ? "left PPO bot vs right PPO bot" : "you vs trained PPO bot",
    20,
    config.height - 44
  );
  context.fillText(
    mode === "ai"
      ? `hits left:${state.leftHits} right:${state.rightHits} rally:${state.rallyHits}`
      : `hits you:${state.leftHits} bot:${state.rightHits} rally:${state.rallyHits}`,
    20,
    config.height - 22
  );

  if (message) {
    context.fillStyle = "rgba(16, 18, 24, 0.72)";
    context.fillRect(0, config.height / 2 - 50, config.width, 100);
    context.fillStyle = "#edf2f4";
    context.font = "24px Consolas, monospace";
    context.textAlign = "center";
    context.fillText(message, config.width / 2, config.height / 2 + 8);
  }
}

