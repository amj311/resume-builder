const ResumeSaveQueue_Saved  = 0;
const ResumeSaveQueue_Saving = 1;
const ResumeSaveQueue_Error =  2;

class ResumeSaveQueue {
  constructor(resumeId) {
    this.resumeId = resumeId;
    this.queue = [];
    this.processing = false;
    this.lastReqFailed = false;
  }

  add(newRequest, finishAllPrevious=false) {
    if (newRequest.resume._id != this.resumeId)
      throw new Error(`Cannot save resume ${newRequest.resume._id}. Queue is only for resume ${this.resumeId}.`);
    if (finishAllPrevious) this.queue.push(newRequest);
    else this.queue = [newRequest];
    if (this.queue.length == 1) this.sendNextRequest();
  }

  sendNextRequest() {
    if (this.processing == true) {
      console.info("Attempted to begin new request while still processing.");
      return;
    }
    if (this.queue.length <= 0) return;

    let req = this.queue[0];
    this.processing = true;
    this.queue.shift();
    let ctx = this;

    function onReqSuccess (res) {
      ctx.processing = false;
      if (req.onSuccess) req.onSuccess(res);
      ctx.lastReqFailed = false;
      ctx.sendNextRequest();
    }
    
    function onReqFailure (err) {
      ctx.processing = false;
      if (req.onFailure) req.onFailure(err);
      ctx.lastReqFailed = true;
      ctx.sendNextRequest();
    }

    try {
      req.operation(req.resume, onReqSuccess, onReqFailure);
    }
    catch (e) {
      console.log(e);
    }
  }

  size() { return this.queue.length };

  status() {
    if (this.processing) return ResumeSaveQueue_Saving;
    if (this.lastReqFailed) return ResumeSaveQueue_Error;
    return ResumeSaveQueue_Saved;
  }
}

class ResumeSaveQueueRequest {
  constructor(operation, resume, onSuccess=null, onFailure=null) {
    this.operation = operation;
    this.resume = {...resume};
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
  }
}

class ResumeSaveQueueManager {
  constructor(){
    this.activeQueues = [];
  }

  getNewQueue(resumeId) {
    this.cleanQueues();

    let newQueue = new ResumeSaveQueue(resumeId);
    this.activeQueues.push(newQueue);
    return newQueue;
  }

  cleanQueues() {
    for (let queue of [...this.activeQueues]) {
      if (queue.size() == 0) this.activeQueues = this.activeQueues.filter(q => q.resumeId != queue.resumeId);
    }
  }
}