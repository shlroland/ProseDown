export class SelectionTracker {
    from: number | undefined = undefined
    to: number | undefined = undefined
  
    append(from: number, to: number) {
      this.from = this.from == null ? from : Math.min(this.from, from)
      this.to = this.to == null ? to : Math.max(this.to, to)
    }
  
    get() {
      if (this.from != null && this.to != null) {
        return {
          from: this.from,
          to: this.to,
        }
      }
  
      return null
    }
  }
  