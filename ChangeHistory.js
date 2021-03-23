class ChangeHistory {
  constructor() {
    this.past = [];
    this.future = [];
  }


  execute(command) {
    this.past.push(command);
    this.future = [];
    command.execute();
  }

  canUndo = () => this.past.length > 0;
  undo() {
    if (this.canUndo()) {
      let cmd = this.past.pop();
      cmd.undo();
      this.future.push(cmd);
    }
  }

  canRedo = () => this.future.length > 0;
  redo() {
    if (this.canRedo()) {
      let cmd = this.future.pop();
      cmd.execute();
      this.past.push(cmd);
    }
  }

}

class ChangeCommand {
  constructor(execute = null, undo = null) {
    if (execute) this.execute = execute;
    if (undo) this.undo = undo;
  }

  execute() {}
  undo() {}
}

// This does not correctly replace object given as paramter!!!
// class FullDocChange extends ChangeCommand {
//   constructor(documentPtr, newDocData){
//     super();

//     let oldData = JSON.parse(JSON.stringify(documentPtr));
//     let newData = JSON.parse(JSON.stringify(newDocData));
//     this.execute = () => { documentPtr = newData };
//     this.undo =    () => { documentPtr = oldData };
//   }
// }

module.exports = {ChangeHistory, ChangeCommand}