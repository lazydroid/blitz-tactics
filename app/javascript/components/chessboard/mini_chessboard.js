import Backbone from 'backbone'
import Chess from 'chess.js'

import Pieces from './concerns/pieces'
import { uciToMove } from '../../utils'

export default class MiniChessboard extends Backbone.View {

  // options.fen         - fen string
  // options.initialMove - uci string

  initialize(options = {}) {
    this.cjs = new Chess()
    this.pieces = new Pieces(this)
    if (options.fen) {
      const fen = options.fen
      this.render(fen)
      if (options.initialMove) {
        this.cjs.load(fen)
        const { from, to } = this.cjs.move(uciToMove(options.initialMove))
        setTimeout(() => {
          this.highlightSquare(from, "#fffcdd")
          this.highlightSquare(to, "#fff79b")
          this.render(this.cjs.fen())
        }, 1000)
      }
    }
  }

  render(fen) {
    if (fen.split(" ").length === 4) {
      fen += " 0 1"
    }
    this.renderFen(fen)
  }

  renderFen(fen) {
    const columns = ['a','b','c','d','e','f','g','h']
    this.cjs.load(fen)
    this.pieces.reset()
    for (let row = 8; row > 0; row--) {
      for (let j = 0; j < 8; j++) {
        let id = columns[j] + row
        let piece = this.cjs.get(id)
        if (piece) {
          this.pieces.$getPiece(piece).appendTo(this.$getSquare(id))
        }
      }
    }
  }

  highlightSquare(id, color) {
    this.$getSquare(id).css({ background: color })
  }

  $getSquare(id) {
    return this.$(`.${id}`)
  }
}
