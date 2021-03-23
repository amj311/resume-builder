class VersionHistory {
  constructor(initData) {
    this.current = JSON.stringify(initData);
    this.past = [];
    this.future = [];
  }


  saveVersionOfObject(obj) {
    this.past.push(this.current);
    this.current = JSON.stringify(obj);
    this.future = [];
  }

  canUndo = () => this.past.length > 0;
  popPrev() {
    if (this.canUndo()) {
      this.future.push(this.current);
      this.current = this.past.pop();
      return JSON.parse(this.current);
    }
  }

  canRedo = () => this.future.length > 0;
  popNext() {
    if (this.canRedo()) {
      this.past.push(this.current);
      this.current = this.future.pop();
      return JSON.parse(this.current);
    }
  }
}