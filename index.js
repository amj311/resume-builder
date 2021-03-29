const iconClasses = {
  "email": "fa fa-envelope",
  "phone": "fa fa-phone-alt",
  "cell": "fa fa-mobile-alt",
  "website": "fa fa-desktop",
  "linkedin": "fab fa-linkedin",
  "github": "fab fa-github",
  "award": "fa fa-bookmark",
}

function iconClass(code) {
  return iconClasses[code] || "";
}

const saveQueueManager = new ResumeSaveQueueManager();


Vue.component('editable', {
  template: `<div class="editable" contenteditable="true" v-once v-html="value" :value="value" @input="$emit('input', $event.target.innerHTML)"></div>`,
  props: ['value'],
  watch: {
    value: function (newValue) {
      saveState();

      if (document.activeElement == this.$el) {
        return;
      }

      this.$el.innerHTML = DOMPurify.sanitize( newValue , {USE_PROFILES: {html: true}} );
    }
  }
});


Vue.component('pointListItemControls',{
  template: `
  <div class='toolbar-button-list'>
    <a @click="toggleMenu('icon')"><i class="far fa-star"></i>
      <div v-if="showMenu == 'icon'" class="toolbar-button-submenu inline-toolbar">
        <a @click="setIcon(null)"><i class="fa fa-ban"></i></a>
        <a v-for="iconCode in Object.keys(iconClasses)" @click="setIcon(iconCode)"><i :class="iconClass(iconCode)"></i></a>
      </div>
    </a>
  </div>
  `,
  props: ['list','idx'],
  data() { return {
    iconClasses: iconClasses,
    showMenu: null,
  }},
  computed: {
  },
  methods: {
    iconClass(code) { return iconClass(code) },
    toggleMenu(code) {
      this.showMenu = this.showMenu == code? null : code;
    },
    setIcon(code) {
      this.list[this.idx].icon = code;
      saveState();
    }
  }
})

Vue.component('listItemControls',{
  template: `
  <div class='toolbar-button-list'>
    <a :disabled="!canBumpUp" @click="swapDist(-1)"><i class="fa fa-arrow-up"></i></a>
    <a :disabled="!canBumpDown" @click="swapDist(1)"><i class="fa fa-arrow-down"></i></a>
    <a @click="duplicate"><i class="far fa-clone"></i></a>
    <a @click="remove"><i class="fa fa-trash"></i></a>
  </div>
  `,
  props: ['list','idx'],
  computed: {
    canBumpUp() { return this.idx > 0 },
    canBumpDown() { return this.idx < this.list.length-1 },
  },
  methods: {
    swapDist(dist) {
      let targetIdx = this.idx+dist;
      let item = this.list[this.idx];
      let target = this.list[this.idx+dist]
      Vue.set(this.list,this.idx,target);
      Vue.set(this.list,targetIdx,item);
    },
    duplicate() {
      let newObj = createDuplicate(this.list[this.idx]);
      this.list.push(newObj);
      saveState();
    },
    remove() {
      this.$delete(this.list,this.idx);
      saveState();
    }
  }
})


Vue.component('editableList',{
  template: `
  <div class='editable-list' :class="{'can-insert': defaultNew}">
    <div v-for="(item,i) in list">
      <div class="inline-toolbar-trigger-wrapper">
        <div class="inline-toolbar-target"><slot :item="item"></slot></div>
        <div ui class="inline-toolbar-wrapper">
          <div class="inline-toolbar toolbar-row" >
            <slot name="preControls" :list="list" :idx="i"></slot>
            <listItemControls :list="list" :idx="i" />
            <slot name="postControls" :list="list" :idx="i"></slot>
          </div>
        </div>
      </div>
    </div>
    <div v-if="defaultNew" ui class="insert-item-button" @click="insertNew"><i class="fa fa-plus"></i></div>
  </div>
  `,
  props: ['list', 'defaultNew'],
  methods: {
    insertNew() {
      this.list.push(createDuplicate(this.defaultNew));
      saveState();
    }
  }
})


Vue.component('sectionlist',{
  template: `
  <div class='section-list'>
    <editableList :list="list" :defaultNew="newSection">
      <template v-slot:default="slotProps">
        <resumesection :section='slotProps.item' />
      </template>
    </editableList>
  </div>
  `,
  data() { return {
    newSection: defaultNewSection,
  }},
  props: ['list']
})

Vue.component('resumesection',{
  template: `
  <div class='resume-section'>
    <h2><editable v-model="section.title" /></h2>
    <h3 v-if="section.subtitle"><editable v-model="section.subtitle" /></h3>
    <div class="section-content">
      <div v-if="section.summary" class="section-summary"><editable v-model="section.summary" /></div>
      <editableList v-if="section.points?.length > 0" :list="section.points" :defaultNew="newSection">
        <template v-slot:default="slotProps" class="point-list">
          <ul class="point-list-item-wrapper">
            <li :class="{'icon-list-item': slotProps.item.icon}">
              <i v-if="slotProps.item.icon" :class="iconClass(slotProps.item.icon)"></i><span><editable v-model="slotProps.item.content" /></span>
            </li>
          </ul>
        </template>
        <template v-slot:preControls="slotProps">
          <pointListItemControls :list="slotProps.list" :idx="slotProps.idx" />
        </template>
      </editableList>
      <sectionlist v-if="section.sections?.length > 0" :list="section.sections" class="sublist" />
    </div>
  </div>
  `,
  props: ['section'],
  data() { return {
    newSection: defaultNewPoint,
  }},
  methods: {
    iconClass(code) { return iconClass(code) }
  }
})


const app = new Vue({
  el: "#app",

  data: {
    loading: true,
    showOpenModal: false,
    allResumes: null,
    apiUrl: "https://amj311-resume-builder.herokuapp.com/api",
    resume: null,
    currentSaveQueue: null,
    allowSave: true,
    history: new VersionHistory(),
    pdfImg: null,
    generatingImage: false,
    showPdfModal: false,
    showJsonModal: false,
    showPrintModal: false,
    printGrayscale: false,

    pageZoom: 1,
    minZoom: .5,
    maxZoom: 2,
  },

  beforeMount() {
    
    window.onbeforeunload = confirmExit;
    function confirmExit() {
        return "You have attempted to leave this page. Are you sure?";
    }

    let ctx = this;
    window.addEventListener('keydown', function (event) {
      let keyChar = String.fromCharCode(event.which).toLowerCase();
      if (keyChar == 's' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          ctx.saveState();
      }
      if (keyChar == 'z') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (event.shiftKey) {
            if (document.activeElement?.classList?.contains("editable")) document.activeElement.blur();
            ctx.redo();
          }
          else {
            if (document.activeElement?.classList?.contains("editable")) document.activeElement.blur();
            ctx.undo();
          }
        }
      }
      if (keyChar == 'y') {
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (document.activeElement?.classList?.contains("editable")) document.activeElement.blur();
          ctx.redo();
        }
      }
    });

    setTimeout(this.startOpenSequence,2000);
  },

  watch: {
    resume(val) {
      document.title = val?.fileName? val.bio?.name+" "+val.fileName : "Resume Builder"
    },
    pageZoom(val) {
      document.querySelector(':root').style.setProperty("--pageZoom", val);
    }
  },

  methods: {
    iconClass(code) {
      return iconClasses[code] || "";
    },

    startOpenSequence() {
      this.showOpenModal = true;
      if (!this.allResumes) this.loadResumes();
    },

    setCurrentResume(resume) {
      this.initSave();

      this.allowSave = false;
      this.resume = resume;
      this.currentSaveQueue = saveQueueManager.getNewQueue(resume._id);
      this.history = new VersionHistory(this.resume);
      let ctx = this;
      setTimeout(()=> ctx.allowSave = true, 500);
    },

    loadResumes() {
      axios.get(this.apiUrl+"/resume/all")
      .then((res)=>{
        console.log(res)
        this.allResumes = res.data.resumes;
      })
      .catch( (err)=>{
        alert("Could not load resumes!");
        console.log(err);
      })
    },

    createNewResumeOnServer(givenData) {
      let resumeData;
      if (!givenData) resumeData = createDuplicate(defaultResumeData);
      else {
        resumeData = createDuplicate(givenData)
        resumeData.fileName = "Copy of " + resumeData.fileName;
      }
      delete resumeData._id;

      this.resume = null;

      axios.post(this.apiUrl+"/resume/create", resumeData)
      .then((res)=>{
        console.log(res.data.newId)
        let newResume = {_id:res.data.newId, ...resumeData};
        this.setCurrentResume(newResume);
        this.allResumes.push(newResume);
      })
      .catch( (err)=>{
        console.log(err);
        alert("Could not save!");
      })
    },

    saveState() {
      if (!this.resume || !this.allowSave) return;
      this.allowSave = false;
      this.history.saveVersionOfObject(this.resume);
      this.initSave();
      let ctx = this;
      setTimeout(()=> ctx.allowSave = true, 0);
    },
    
    undo() {
      if (!this.resume || !this.allowSave || !this.history.canUndo()) return;
      this.allowSave = false;
      this.resume = this.history.popPrev();
      this.initSave();
      let ctx = this;
      setTimeout(()=>ctx.allowSave = true, 0);
    },
    
    redo() {
      if (!this.resume || !this.allowSave || !this.history.canRedo()) return;
      this.allowSave = false;
      this.resume = this.history.popNext();
      this.initSave();
      let ctx = this;
      setTimeout(()=>ctx.allowSave = true, 0);
    },

    initSave() {
      if (!this.resume) return;
      this.currentSaveQueue.add(new ResumeSaveQueueRequest(this.sendSaveRequest, this.resume))
    },

    sendSaveRequest(payload,onSuccess=null,onFailure=null) {
      axios.put(this.apiUrl+"/resume/update", payload)
      .then((res)=>{
        console.log("Saved!")
        if (onSuccess) onSuccess(res);
      })
      .catch( (err)=>{
        console.log(err);
        alert("Could not save!");
        if (onFailure) onFailure(err);
      })
    },

    sendDeleteRequest(id,onSuccess=null,onFailure=null) {
      axios.delete(this.apiUrl+"/resume/"+id)
      .then((res)=>{
        console.log("Deleted!")
        if (id == this.resume?._id) this.resume = null;
        this.allResumes = this.allResumes.filter(r => r._id != id);
        if (onSuccess) onSuccess(res);
      })
      .catch( (err)=>{
        console.log(err);
        alert("Could not delete!");
        if (onFailure) onFailure(err);
      })
    },

    browserPrint(){
      window.print();
    },

    decZoom() {
      this.pageZoom = Math.max(this.pageZoom-.1,this.minZoom);
    },

    incZoom() {
      this.pageZoom = Math.min(this.pageZoom+.1,this.maxZoom);
    }

  },

  computed: {
    saveStatus() {
      if (!this.currentSaveQueue) return null;
      let status = this.currentSaveQueue.status();
      if (status == ResumeSaveQueue_Error) return "Saving error"
      if (status == ResumeSaveQueue_Saving) return "Saving..."
      
      if (this.currentSaveQueue.lastSaved && this.currentSaveQueue.lastSaved != JSON.stringify(this.resume))
        return "Unsaved"

      if (status == ResumeSaveQueue_Saved) return "All changes saved"

    }
  }
})

function saveState() {
  app.saveState();
}

function createDuplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}