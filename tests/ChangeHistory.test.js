const {test, expect,  beforeEach} = require("oliver-test");
const { ChangeHistory, ChangeCommand } = require("../ChangeHistory");

let changeHistory;
let doc;
let oldDoc = {};
let changeDoc = {msg:"I'm new!"};

function swap(prev, next) {
  prev = JSON.parse(JSON.stringify(next));
}

beforeEach(()=> {
  doc = oldDoc;
  changeHistory = new ChangeHistory();
})

test("should not redo or undo when no actions", () => {
  expect.false(changeHistory.canUndo())
  expect.false(changeHistory.canRedo())
})

test("should apply change to src as deep copy", () => {
  let oldData = JSON.parse(JSON.stringify(doc));
  let newData = JSON.parse(JSON.stringify(changeDoc));
  let change = new ChangeCommand(
    ()=>{doc = newData},
    ()=>{doc = oldData});
  changeHistory.execute(change);
  expect.notNull(doc);
  expect.notUndefined(doc.msg);
  expect.equal(doc.msg, changeDoc.msg);
  expect.false(doc == changeDoc);
  expect.equal(JSON.stringify(doc), JSON.stringify(changeDoc))
})

test("should only undo when one action", () => {
  let change = new ChangeCommand();  changeHistory.execute(change);
  expect.true(changeHistory.canUndo())
  expect.false(changeHistory.canRedo())
})

test("should revert to original when undo", () => {
  let oldData = JSON.parse(JSON.stringify(doc));
  let newData = JSON.parse(JSON.stringify(changeDoc));
  let change = new ChangeCommand(
    ()=>{doc = newData},
    ()=>{doc = oldData});
  changeHistory.execute(change);
  changeHistory.undo();
  
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
  changeHistory.execute(change);
  changeHistory.undo();
  changeHistory.redo();
  expect.notNull(doc);
  expect.notUndefined(doc.msg);
  expect.equal(doc.msg, changeDoc.msg);
  expect.false(doc == changeDoc);
  expect.equal(JSON.stringify(doc), JSON.stringify(changeDoc))
})
