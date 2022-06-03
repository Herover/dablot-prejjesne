<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { io, Socket } from "socket.io-client"

const props = defineProps<{
  gameId: string
}>()

let socket: Socket
const connected = ref(false)

const board: { [key in string]: string[] } = {
  //       RGT    LFT    RGTDWN     LFTDWN     DWN    RGTUP      LFTUP      UP
  "0,0": ["1,0",        "0.5,0.5",            "0,1"                             ],
  "1,0": ["2,0", "0,0", "1.5,0.5", "0.5,0.5", "1,1"                             ],
  "2,0": ["3,0", "1.0", "2.5,0.5", "1.5,0.5", "2,1"                             ],
  "3,0": ["4,0", "2,0", "3.5,0.5", "2.5,0.5", "3,1"                             ],
  "4,0": ["5,0", "3,0", "4.5,0.5", "3.5,0.5", "4,1"                             ],
  "5,0": [       "4,0",            "4.5,0.5", "5,1"                             ],

  "0,1": ["1,1",        "0.5,1.5",            "0,2", "0.5,0.5",            "0,0"],
  "1,1": ["2,1", "0,1", "1.5,1.5", "0.5,1.5", "1,2", "1.5,0.5", "0.5,0.5", "1,0"],
  "2,1": ["3,1", "1,1", "2.5,1.5", "1.5,1.5", "2,2", "2.5,0.5", "1.5,0.5", "2,0"],
  "3,1": ["4,1", "2,1", "3.5,1.5", "2.5,1.5", "3,2", "3.5,0.5", "2.5,0.5", "3,0"],
  "4,1": ["5,1", "3,1", "4.5,1.5", "3.5,1.5", "4,2", "4.5,0.5", "3.5,0.5", "4,0"],
  "5,1": [       "4,1",            "4.5,1.5", "5,2",            "4.5,0.5", "5,0"],

  "0,2": ["1,2",        "0.5,2.5",            "0,3", "0.5,1.5",            "0,1"],
  "1,2": ["2,2", "0,2", "1.5,2.5", "0.5,2.5", "1,3", "1.5,1.5", "0.5,1.5", "1,1"],
  "2,2": ["3,2", "1,2", "2.5,2.5", "1.5,2.5", "2,3", "2.5,1.5", "1.5,1.5", "2,1"],
  "3,2": ["4,2", "2,2", "3.5,2.5", "2.5,2.5", "3,3", "3.5,1.5", "2.5,1.5", "3,1"],
  "4,2": ["5,2", "3,2", "4.5,2.5", "3.5,2.5", "4,3", "4.5,1.5", "3.5,1.5", "4,1"],
  "5,2": [       "4,2",            "4.5,2.5", "5,3",            "4.5,1.5", "5,1"],

  "0,3": ["1,3",        "0.5,3.5",            "0,4", "0.5,2.5",            "0,2"],
  "1,3": ["2,3", "0,3", "1.5,3.5", "0.5,3.5", "1,4", "1.5,2.5", "0.5,2.5", "1,2"],
  "2,3": ["3,3", "1,3", "2.5,3.5", "1.5,3.5", "2,4", "2.5,2.5", "1.5,2.5", "2,2"],
  "3,3": ["4,3", "2,3", "3.5,3.5", "2.5,3.5", "3,4", "3.5,2.5", "2.5,2.5", "3,2"],
  "4,3": ["5,3", "3,3", "4.5,3.5", "3.5,3.5", "4,4", "4.5,2.5", "3.5,2.5", "4,2"],
  "5,3": [       "4,3",            "4.5,3.5", "5,4",            "4.5,2.5", "5,2"],

  "0,4": ["1,4",        "0.5,4.5",            "0,5", "0.5,3.5",            "0,3"],
  "1,4": ["2,4", "0,4", "1.5,4.5", "0.5,4.5", "1,5", "1.5,3.5", "0.5,3.5", "1,3"],
  "2,4": ["3,4", "1,4", "2.5,4.5", "1.5,4.5", "2,5", "2.5,3.5", "1.5,3.5", "2,3"],
  "3,4": ["4,4", "2,4", "3.5,4.5", "2.5,4.5", "3,5", "3.5,3.5", "2.5,3.5", "3,3"],
  "4,4": ["5,4", "3,4", "4.5,4.5", "3.5,4.5", "4,5", "4.5,3.5", "3.5,3.5", "4,3"],
  "5,4": [       "4,4",            "4.5,4.5", "5,5",            "4.5,3.5", "5,3"],

  "0,5": ["1,5",        "0.5,5.5",            "0,6", "0.5,4.5",            "0,4"],
  "1,5": ["2,5", "0,5", "1.5,5.5", "0.5,5.5", "1,6", "1.5,4.5", "0.5,4.5", "1,4"],
  "2,5": ["3,5", "1,5", "2.5,5.5", "1.5,5.5", "2,6", "2.5,4.5", "1.5,4.5", "2,4"],
  "3,5": ["4,5", "2,5", "3.5,5.5", "2.5,5.5", "3,6", "3.5,4.5", "2.5,4.5", "3,4"],
  "4,5": ["5,5", "3,5", "4.5,5.5", "3.5,5.5", "4,6", "4.5,4.5", "3.5,4.5", "4,4"],
  "5,5": [       "4,5",            "4.5,5.5", "5,6",            "4.5,4.5", "5,4"],

  "0,6": ["1,6",                                     "0.5,5.5",            "0,5"],
  "1,6": ["2,6", "0,6",                              "1.5,5.5", "0.5,5.5", "1,5"],
  "2,6": ["3,6", "1,6",                              "2.5,5.5", "1.5,5.5", "2,5"],
  "3,6": ["4,6", "2,6",                              "3.5,5.5", "2.5,5.5", "3,5"],
  "4,6": ["5,6", "3,6",                              "4.5,5.5", "3.5,5.5", "4,5"],
  "5,6": [       "4,6",                                         "4.5,5.5", "5,5"],


  "0.5,0.5": [         "1,1",     "0,1",            "1,0",     "0,0"           ],
  "1.5,0.5": [         "2,1",     "1,1",            "2,0",     "1,0"           ],
  "2.5,0.5": [         "3,1",     "2,1",            "3,0",     "2,0"           ],
  "3.5,0.5": [         "4,1",     "3,1",            "4,0",     "3,0"           ],
  "4.5,0.5": [         "5,1",     "4,1",            "5,0",     "4,0"           ],

  "0.5,1.5": [         "1,2",     "0,2",            "1,1",     "0,1"           ],
  "1.5,1.5": [         "2,2",     "1,2",            "2,1",     "1,1"           ],
  "2.5,1.5": [         "3,2",     "2,2",            "3,1",     "2,1"           ],
  "3.5,1.5": [         "4,2",     "3,2",            "4,1",     "3,1"           ],
  "4.5,1.5": [         "5,2",     "4,2",            "5,1",     "4,1"           ],

  "0.5,2.5": [         "1,3",     "0,3",            "1,2",     "0,2"           ],
  "1.5,2.5": [         "2,3",     "1,3",            "2,2",     "1,2"           ],
  "2.5,2.5": [         "3,3",     "2,3",            "3,2",     "2,2"           ],
  "3.5,2.5": [         "4,3",     "3,3",            "4,2",     "3,2"           ],
  "4.5,2.5": [         "5,3",     "4,3",            "5,2",     "4,2"           ],

  "0.5,3.5": [         "1,4",     "0,4",            "1,3",     "0,3"           ],
  "1.5,3.5": [         "2,4",     "1,4",            "2,3",     "1,3"           ],
  "2.5,3.5": [         "3,4",     "2,4",            "3,3",     "2,3"           ],
  "3.5,3.5": [         "4,4",     "3,4",            "4,3",     "3,3"           ],
  "4.5,3.5": [         "5,4",     "4,4",            "5,3",     "4,3"           ],

  "0.5,4.5": [         "1,5",     "0,5",            "1,4",     "0,4"           ],
  "1.5,4.5": [         "2,5",     "1,5",            "2,4",     "1,4"           ],
  "2.5,4.5": [         "3,5",     "2,5",            "3,4",     "2,4"           ],
  "3.5,4.5": [         "4,5",     "3,5",            "4,4",     "3,4"           ],
  "4.5,4.5": [         "5,5",     "4,5",            "5,4",     "4,4"           ],

  "0.5,5.5": [         "1,6",     "0,6",            "1,5",     "0,5"           ],
  "1.5,5.5": [         "2,6",     "1,6",            "2,5",     "1,5"           ],
  "2.5,5.5": [         "3,6",     "2,6",            "3,5",     "2,5"           ],
  "3.5,5.5": [         "4,6",     "3,6",            "4,5",     "3,5"           ],
  "4.5,5.5": [         "5,6",     "4,6",            "5,5",     "4,5"           ],
}

const coordinates = Object.keys(board).map(e => {
    const [sx, sy] = e.split(",")
    return [Number.parseFloat(sx), Number.parseFloat(sy)]
  })

const links = Object.keys(board).reduce<number[][][]>((links, key) => {
    const [sx, sy] = key.split(",")
    const [nx, ny] = [Number.parseFloat(sx), Number.parseFloat(sy)]
    
    board[key].forEach(next => {
      const [nsx, nsy] = next.split(",")
      const [nnx, nny] = [Number.parseFloat(nsx), Number.parseFloat(nsy)]

      if (nx <= nnx || ny <= nny) {
        links.push([[nx, ny], [nnx, nny]])
      }
    }, [])

    return links
  }, [])

let pieces = [
  reactive({
    id: 0,
    x: 1,
    y: 0,
    rawX: 0,
    rawY: 0,
  }),
  reactive({
    id: 1,
    x: 1,
    y: 1,
    rawX: 0,
    rawY: 0,
  }),
]

const boardWidth = 600
const pointRadius = 10
const scale = (boardWidth - pointRadius * 2)/5
//const boardHeight = (boardWidth/6) * 7
const boardHeight = scale*6 + pointRadius*2


const boardHolder = ref<any>(null)

let selectedPieceOffset = { x: 0, y: 0 };
let selectedPieceId = ref(-1)
let mouseCoordinate: { x: number, y: number }

const updatePieceRawPosition = (piece: any) => {
  if (piece.id === selectedPieceId.value) {
    piece.rawX = piece.x * scale - selectedPieceOffset.x
    piece.rawY = piece.y * scale - selectedPieceOffset.y
  }
  piece.rawX = piece.x * scale
  piece.rawY = piece.y * scale
}

pieces.forEach(p => {
  updatePieceRawPosition(p)
})

const getMousePositionOnBoard = (e: MouseEvent) => {
  if (boardHolder.value === null) {
    return { x: 0, y: 0}
  }
  const ctm = boardHolder.value.getScreenCTM()
  return {
    x: (e.clientX - ctm.e) / ctm.a,
    y: (e.clientY - ctm.f) / ctm.d,
  }
}

const piecePressed = (e: MouseEvent, piece: any) => {
  selectedPieceOffset = getMousePositionOnBoard(e);
  selectedPieceOffset.x -= piece.rawX
  selectedPieceOffset.y -= piece.rawY

  selectedPieceId.value = piece.id;

  // Sort piece so that the selected is last and overlays all other pieces in DOM
  // Not doing this will de-select currently selected when hovering over other pieces
  pieces = pieces.sort((a, b) => a.id == selectedPieceId.value ? 1 : b.id == selectedPieceId.value ? -1 : 0)
}

const pieceDragged = (e: MouseEvent, piece: any) => {
  if (selectedPieceId.value === piece.id) {
    e.preventDefault()
    mouseCoordinate = getMousePositionOnBoard(e);

    piece.rawX = mouseCoordinate.x - selectedPieceOffset.x
    piece.rawY = mouseCoordinate.y - selectedPieceOffset.y
  }
}
const pieceDropped = (e: MouseEvent, piece: any) => {
  if (piece.id !== selectedPieceId.value) {
    return;
  }

  let moved = false

  selectedPieceId.value = -1;

  const oldBoardPos =`${piece.x},${piece.y}`
  
  // Find approximate position on board
  let newX = Math.round((piece.rawX/scale)*2)/2
  let newY = Math.round((piece.rawY/scale)*2)/2
  let newBoardPos = `${newX},${newY}`

  if (board[oldBoardPos] && board[oldBoardPos].includes(newBoardPos)) {
    piece.x = newX
    piece.y = newY

    moved = true
  } else {
    // Simply multiplying/dividing by 2 might give us a position "in between" nodes, if this
    // happens then we just assume not dividing will give us the correct position without
    // fractions.
    newX = Math.round(piece.rawX/scale)
    newY = Math.round(piece.rawY/scale)
    newBoardPos = `${newX},${newY}`

    if (board[oldBoardPos] && board[oldBoardPos].includes(newBoardPos)) {
      piece.x = newX
      piece.y = newY

      moved = true
    }

    // If we still can't find a valid path from the old position to the new one, assume there's
    // none.
  }

  updatePieceRawPosition(piece)

  if (moved) {
    networkUpdatePiece(piece)
  }
}


const networkUpdatePiece = (piece: any) => {
  socket.emit("move", {
    id: piece.id,
    x: piece.x,
    y: piece.y,
  })
}


onMounted(() => {
  console.log(boardHolder, boardHolder.value)
  socket = io("http://localhost:4000/game")

  socket.on("connect", () => {
    connected.value = true
  })
  socket.on("disconnect", () => {
    connected.value = false
  })


  socket.on("move", ({ id, x, y }) => {
    console.log("MOVE", id, x, y)
    const piece = pieces.find(p => p.id === id)
    if (!piece) {
      console.error(`Piece ${id} not found!`)
      return
    }
    piece.x = x
    piece.y = y
  updatePieceRawPosition(piece)
  })


  socket.emit("join", { gameId: props.gameId })
})

onUnmounted(() => {
  socket.disconnect()
})
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
        v-for="link in links"
        :x1="link[0][0] * scale"
        :y1="link[0][1] * scale"
        :x2="link[1][0] * scale"
        :y2="link[1][1] * scale"
        stroke="hsla(160, 100%, 37%, 1)"
        stroke-width="4"
      ></line>
      <circle
        v-for="coordinate in coordinates"
        :cx = "coordinate[0] * scale"
        :cy = "coordinate[1] * scale"
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
          r="17"
          cx="0"
          cy="0"
          fill="hsla(240, 100%, 37%, 1)"
        ></circle>
        <circle
          :r="selectedPieceId == piece.id ? scale * 10 : scale/2"
          cx="0"
          cy="0"
          fill="#00000000"
        ></circle>
      </g>
    </g>
  </svg>
</template>

<style scoped>

</style>
