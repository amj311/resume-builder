const {test, expect,  beforeEach} = require("oliver-test");
const { CommandManager, ChangeCommand } = require("../CommandManager");

let cmdManager;
let doc;
let oldDoc = {};
let changeDoc = {msg:"I'm new!"};

function swap(prev, next) {
  prev = JSON.parse(JSON.stringify(next));
}

beforeEach(()=> {
  doc = oldDoc;
  cmdManager = new CommandManager();
})

test("should not redo or undo when no actions", () => {
  expect.false(cmdManager.canUndo())
  expect.false(cmdManager.canRedo())
})

test("should apply change to src as deep copy", () => {
  let oldData = JSON.parse(JSON.stringify(doc));
  let newData = JSON.parse(JSON.stringify(changeDoc));
  let change = new ChangeCommand(
    ()=>{doc = newData},
    ()=>{doc = oldData});
  cmdManager.execute(change);
  expect.notNull(doc);
  expect.notUndefined(doc.msg);
  expect.equal(doc.msg, changeDoc.msg);
  expect.false(doc == changeDoc);
  expect.equal(JSON.stringify(doc), JSON.stringify(changeDoc))
})

test("should only undo when one action", () => {
  let change = new ChangeCommand();  cmdManager.execute(change);
  expect.true(cmdManager.canUndo())
  expect.false(cmdManager.canRedo())
})

test("should revert to original when undo", () => {
  let oldData = JSON.parse(JSON.stringify(doc));
  let newData = JSON.parse(JSON.stringify(changeDoc));
  let change = new ChangeCommand(
    ()=>{doc = newData},
    ()=>{doc = oldData});
  cmdManager.execute(change);
  cmdManager.undo();
  
  expect.notNull(doc);
  expect.undefined(doc.msg);
  expect.equal(JSON.stringify(doc), JSON.stringify(oldDoc))
})


test("should apply change when redo", () => {
  let oldData = JSON.parse(JSON.stringify(doc));
  let newData = JSON.parse(JSON.stringify(changeDoc));
  let change = new ChangeCommand(
    ()=>{doc = newData},
    ()=>{doc = oldData});
  cmdManager.execute(change);
  cmdManager.undo();
  cmdManager.redo();
  expect.notNull(doc);
  expect.notUndefined(doc.msg);
  expect.equal(doc.msg, changeDoc.msg);
  expect.false(doc == changeDoc);
  expect.equal(JSON.stringify(doc), JSON.stringify(changeDoc))
})
