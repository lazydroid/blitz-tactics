// instructions that fade out after you start

import Backbone from 'backbone'

import d from '../../../dispatcher.ts'

export default class Sidebar extends Backbone.View {

  get el() {
    return document.querySelector(`.speedrun-sidebar`)
  }

  initialize() {
    this.listenTo(d, `move:try`, () => {
      this.el.querySelector(`.make-a-move`).remove()
      this.el.querySelector(`.timers`).style = ``
      this.stopListening()
    })
  }
}
