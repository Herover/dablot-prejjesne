<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { io, Socket } from "socket.io-client";
import { board, initPieces } from "../board";
import { MoveType, type Move, type Piece } from "./GameDefs";

const props = defineProps<{
  gameId: string;
}>();

// These typedefs come from the shared .d.ts files and are unknown to eslint
// eslint-disable-next-line no-undef
let socket: Socket<GameServerToClientEvents, GameClientToServerEvents>;
const connected = ref(false);

const coordinates = Object.keys(board).map((e) => {
  const [sx, sy] = e.split(",");
  return [Number.parseFloat(sx), Number.parseFloat(sy)];
});

const links = Object.keys(board).reduce<number[][][]>((links, key) => {
  const [sx, sy] = key.split(",");
  const [nx, ny] = [Number.parseFloat(sx), Number.parseFloat(sy)];

  board[key].forEach((next) => {
    const [nsx, nsy] = next.split(",");
    const [nnx, nny] = [Number.parseFloat(nsx), Number.parseFloat(nsy)];

    if (nx <= nnx || ny <= nny) {
      links.push([
        [nx, ny],
        [nnx, nny],
      ]);
    }
  }, []);

  return links;
}, []);

let pieces: Piece[] = initPieces().map((e) => reactive(e));

const boardWidth = 600;
const pointRadius = 10;
const scale = (boardWidth - pointRadius * 2) / 5;
//const boardHeight = (boardWidth/6) * 7
const boardHeight = scale * 6 + pointRadius * 2;

const boardHolder = ref<SVGGElement | null>(null);

let selectedPieceOffset = { x: 0, y: 0 };
let selectedPieceId = ref(-1);
let mouseCoordinate: { x: number; y: number };

const updatePieceRawPosition = (piece: Piece) => {
  if (piece.id === selectedPieceId.value) {
    piece.rawX = piece.x * scale - selectedPieceOffset.x;
    piece.rawY = piece.y * scale - selectedPieceOffset.y;
  }
  piece.rawX = piece.x * scale;
  piece.rawY = piece.y * scale;
};

pieces.forEach((p) => {
  updatePieceRawPosition(p);
});

const getValidMoves = (piece: Piece) => {
  const posStr = `${piece.x},${piece.y}`;
  const attackMoves: Move[] = [];
  const candidates: Move[] = board[posStr]
    .filter((candidate) => {
      const onCandidate = pieces.find((p) => candidate == `${p.x},${p.y}`);
      // If there's a enemy piece on the move candidate, check if we can attack it
      if (onCandidate) {
        if (
          onCandidate.color != piece.color &&
          onCandidate.type <= piece.type
        ) {
          const attackX = piece.x + (onCandidate.x - piece.x) * 2;
          const attackY = piece.y + (onCandidate.y - piece.y) * 2;
          const attackPos = `${attackX},${attackY}`;
          if (
            board[attackPos] &&
            !pieces.find((p) => attackPos == `${p.x},${p.y}`)
          ) {
            attackMoves.push({
              type: MoveType.ATTACK,
              x: attackX,
              y: attackY,
              key: attackPos,
            });
          }
        }
        return false;
      } else {
        return true;
      }
    })
    .map((m) => {
      const [x, y] = m.split(",");
      return {
        type: MoveType.MOVE,
        x: Number.parseFloat(x),
        y: Number.parseFloat(y),
        key: m,
      };
    });

  return [...candidates, ...attackMoves];
};

const getMousePositionOnBoard = (e: MouseEvent) => {
  if (boardHolder.value === null) {
    return { x: 0, y: 0 };
  }
  const ctm = boardHolder.value.getScreenCTM();
  if (ctm === null) {
    return { x: 0, y: 0 };
  }
  return {
    x: (e.clientX - ctm.e) / ctm.a,
    y: (e.clientY - ctm.f) / ctm.d,
  };
};

const piecePressed = (e: MouseEvent, piece: Piece) => {
  selectedPieceOffset = getMousePositionOnBoard(e);
  selectedPieceOffset.x -= piece.rawX;
  selectedPieceOffset.y -= piece.rawY;

  selectedPieceId.value = piece.id;

  // Sort piece so that the selected is last and overlays all other pieces in DOM
  // Not doing this will de-select currently selected when hovering over other pieces
  pieces = pieces.sort((a, b) =>
    a.id == selectedPieceId.value ? 1 : b.id == selectedPieceId.value ? -1 : 0
  );
};

const pieceDragged = (e: MouseEvent, piece: Piece) => {
  if (selectedPieceId.value === piece.id) {
    e.preventDefault();
    mouseCoordinate = getMousePositionOnBoard(e);

    piece.rawX = mouseCoordinate.x - selectedPieceOffset.x;
    piece.rawY = mouseCoordinate.y - selectedPieceOffset.y;
  }
};
const pieceDropped = (e: MouseEvent, piece: Piece) => {
  if (piece.id !== selectedPieceId.value) {
    return;
  }

  let moved = false;

  selectedPieceId.value = -1;

  // Find approximate position on board
  let newX = Math.round((piece.rawX / scale) * 2) / 2;
  let newY = Math.round((piece.rawY / scale) * 2) / 2;
  let newBoardPos = `${newX},${newY}`;

  const moves = getValidMoves(piece);

  let m;
  if ((m = moves.find((m) => m.key == newBoardPos))) {
    piece.x = m.x;
    piece.y = m.y;

    moved = true;
  } else {
    // Simply multiplying/dividing by 2 might give us a position "in between" nodes, if this
    // happens then we just assume not dividing will give us the correct position without
    // fractions.
    newX = Math.round(piece.rawX / scale);
    newY = Math.round(piece.rawY / scale);
    newBoardPos = `${newX},${newY}`;

    if ((m = moves.find((m) => m.key == newBoardPos))) {
      piece.x = m.x;
      piece.y = m.y;

      moved = true;
    }

    // If we still can't find a valid path from the old position to the new one, assume there's
    // none.
  }

  updatePieceRawPosition(piece);

  if (moved) {
    networkUpdatePiece(piece);
  }
};

const networkUpdatePiece = (piece: Piece) => {
  socket.emit("move", {
    id: piece.id,
    x: piece.x,
    y: piece.y,
  });
};

onMounted(() => {
  socket = io("http://localhost:4000/game");

  socket.on("connect", () => {
    connected.value = true;
  });
  socket.on("disconnect", () => {
    connected.value = false;
  });

  socket.on("move", ({ id, x, y }) => {
    console.log("MOVE", id, x, y);
    const piece = pieces.find((p) => p.id === id);
    if (!piece) {
      console.error(`Piece ${id} not found!`);
      return;
    }
    piece.x = x;
    piece.y = y;
    updatePieceRawPosition(piece);
  });

  socket.emit("join", { gameId: props.gameId });
});

onUnmounted(() => {
  socket.disconnect();
});
</script>

<template>
  <p v-if="connected">Online</p>
  <p v-else>Disconnected</p>

  <svg :width="boardWidth" :height="boardHeight">
    <g
      :transform="`translate(${pointRadius}, ${pointRadius})`"
      ref="boardHolder"
    >
      <line
        v-for="(link, i) in links"
        :key="i"
        :x1="link[0][0] * scale"
        :y1="link[0][1] * scale"
        :x2="link[1][0] * scale"
        :y2="link[1][1] * scale"
        style="stroke: hsla(160, 100%, 37%, 1); stroke-width: 4"
      ></line>
      <circle
        v-for="(coordinate, i) in coordinates"
        :key="i"
        :cx="coordinate[0] * scale"
        :cy="coordinate[1] * scale"
        r="10"
        fill="hsla(160, 100%, 37%, 1)"
      ></circle>
      <g
        v-for="piece in pieces"
        :key="piece.id"
        :transform="`translate(${piece.rawX}, ${piece.rawY})`"
        @mousedown="(e) => piecePressed(e, piece)"
        @mousemove="(e) => pieceDragged(e, piece)"
        @mouseup="(e) => pieceDropped(e, piece)"
        @mouseleave="(e) => pieceDropped(e, piece)"
      >
        <circle
          :fill="
            piece.color == 0
              ? 'hsla(33.6, 100%, 50%, 1)'
              : 'hsla(320, 100%, 47%, 1)'
          "
          :r="17 + (piece.type - 1) * 3"
          cx="0"
          cy="0"
        ></circle>
        <circle
          :r="selectedPieceId == piece.id ? scale * 10 : scale / 2"
          cx="0"
          cy="0"
          fill="#00000000"
        ></circle>
      </g>
    </g>
  </svg>
</template>

<style scoped></style>
