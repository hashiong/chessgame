class MonteCarloNode {

  constructor(parent, action, state, unexpandedPlays) {
    this.state = state
    this.action = action
    this.parent = parent

    this.n_plays = 0
    this.n_wins = 0


    
    this.children = new Map()
    for (let play of unexpandedPlays) {
      this.children.set(play.hash(), { play: play, node: null })
    }
  }

  childNode(play) {
    let child = this.children.get(play.hash())
    if (child === undefined) {
      throw new Error('No such play!')
    }
    else if (child.node === null) {
      throw new Error("Child is not expanded!")
    }
    return child.node
  }

  expand(play, childState, unexpandedPlays) {
    if (!this.children.has(play.hash())) throw new Error("No such play!")
    let childNode = new MonteCarloNode(this, play, childState, unexpandedPlays)
    this.children.set(play.hash(), { play: play, node: childNode })
    return childNode
  }


  allPlays() {
    let ret = []
    for (let child of this.children.values()) {
      ret.push(child.play)
    }
    return ret
  }

  unexpandedPlays() {
    let ret = []
    for (let child of this.children.values()) {
      if (child.node === null) ret.push(child.play)
    }
    return ret
  }

  isFullyExpanded() {
    for (let child of this.children.values()) {
      if (child.node === null) return false
    }
    return true
  }

  isLeaf() {
    if (this.children.size === 0) return true
    else return false
  }
  

  getUCB1(biasParam) {
    return (this.n_wins / this.n_plays) + Math.sqrt(biasParam * Math.log(this.parent.n_plays) / this.n_plays);
  }

}

module.exports = MonteCarloNode