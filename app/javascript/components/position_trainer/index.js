import Chess from 'chess.js'

import StockfishEngine from '../../workers/stockfish_engine'
import InteractiveBoard from '../interactive_board'
import Instructions from './views/instructions'
import Actions from './views/actions'
import { uciToMove, getConfig } from '../../utils'
import { dispatch, subscribe } from '../../store'

const SEARCH_DEPTH = 15
const START_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`


export default class PositionTrainer {

  constructor() {
    new InteractiveBoard
    this.listenForEvents()
    if (this.computerColor === `w`) {
      dispatch(`board:flip`)
    }
    this.depth = getConfig(`depth`) || SEARCH_DEPTH
    this.engine = new StockfishEngine
    this.setDebugHelpers()
    dispatch(`fen:set`, this.initialFen)
    new Instructions({ fen: this.initialFen })
    new Actions()
  }

  get initialFen() {
    let fen = getConfig(`fen`) || START_FEN
    return fen.length === 4 ? `${fen} - -` : fen
  }

  get computerColor() {
    return this.initialFen.indexOf(`w`) > 0 ? `b` : `w`
  }

  setDebugHelpers() {
    window.analyzeFen = (fen, depth) => {
      this.engine.analyze(fen, { multipv: 1, depth })
    }
  }

  isComputersTurn(fen) {
    return fen.indexOf(` ${this.computerColor} `) > 0
  }

  listenForEvents() {
    subscribe({
      'position:reset': () => {
        dispatch(`fen:set`, this.initialFen)
      },

      'fen:set': fen => {
        this.currentFen = fen
        const analysisOptions = {
          depth: this.depth,
          multipv: 1
        }
        this.engine.analyze(fen, analysisOptions).then(output => {
          const { fen, state } = output
          const computerMove = state.evaluation.best
          if (fen !== this.currentFen) {
            return
          }
          if (this.isComputersTurn(fen)) {
            dispatch(`move:make`, uciToMove(computerMove), { opponent: true })
          }
        })
        this.notifyIfGameOver(fen)
      },

      'move:try': move => dispatch(`move:make`, move),
    })
  }

  notifyIfGameOver(fen) {
    let c = new Chess
    c.load(fen)
    if (!c.game_over()) {
      return
    }
    let result
    if (c.in_draw()) {
      result = `1/2-1/2`
    } else if (c.turn() === `b`) {
      result = `1-0`
    } else {
      result = `0-1`
    }
    setTimeout(() => dispatch(`game:over`, result), 500)
  }
}
