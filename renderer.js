const {ipcRenderer} = require('electron');
// DOM
const l = (m) => console.log(m);
const settings = document.getElementById('task-settings');
const taskStartTemplateContainer = document.getElementById('task-start-template-container');
const taskStartTitle = document.getElementById('task-start-title');
const taskStartTags = document.getElementById('task-start-tags');
const taskStartTagsContainer = document.querySelector('.start-task-tags');

const gearIcon = document.getElementById('gear-icon');
const menuOverlay = document.getElementById('menu-overlay');
const drag = document.getElementById('drag');
const menuBtnAddSwitchBtn = document.getElementById('menu-btn-add-switch');
const menuBtnPause = document.getElementById('menu-btn-pause');
const menuBtnFinish = document.getElementById('menu-btn-finish');
const menuBtnSettings = document.getElementById('menu-btn-settings');
const menuBtnAbout = document.getElementById('menu-btn-about');

const taskShow = document.getElementById('task-show');
const taskShowTitle = document.getElementById('task-show-title');
const taskShowQuote = document.getElementById('task-show-quote');
const taskShowCountdown = document.getElementById('task-show-countdown');
const taskShowProgress = document.getElementById('task-show-progress');
const taskShowProgressContainer = document.getElementById('task-show-progress-container');

const timeUpMini = document.getElementById('task-time-up-mini');
const timeUpMiniTitle = document.getElementById('task-time-up-mini-title');
const timeUpMiniTimeSpent = document.getElementById('task-time-up-mini-time-spent');
const timeUp = document.getElementById('task-time-up');
const timeUpTitle = document.getElementById('task-time-up-title');
const timeUpTimeSpent = document.getElementById('task-time-up-time-spent');


const taskPaused = document.getElementById('task-paused');
const taskPausedTitle = document.getElementById('task-paused-title');
const taskPausedQuote = document.getElementById('task-paused-quote');
const taskPausedTiming = document.getElementById('task-paused-timing');
const taskPausedProgress = document.getElementById('task-paused-progress');


const taskSaveForm = document.getElementById('task-save-form');
const taskSaveTitle = document.getElementById('task-save-title');
const taskSaveSuccessRange = document.getElementById('task-save-success');
const taskSaveTags = document.getElementById('task-save-tags');
const taskSaveTagsContainer = document.querySelector('.task-save-tags-container');
const taskSaveReflection = document.getElementById('task-save-reflection');
const taskSaveBackBtn = document.getElementById('task-save-back-btn');
const taskSaveSuccessDisplay = document.getElementById('task-save-success-display');


const settingsTemplateTagsContainer = document.querySelector('.settings-template-tags-container');
const todayTaskListTagsContainer = document.querySelector('.today-task-list-tags-container');
const tomorrowTaskListTagsContainer = document.querySelector('.tomorrow-task-list-tags-container');
const historyContainer = document.getElementById('history');
const historyTab = document.getElementById('history-tab');
const importLogFile = document.querySelector('.import-log-file');
const exportLogBtn = document.querySelector('.export-log-btn');

const timeUpMiniFallbackDuration = 3; // sec
let timer = null;
let hovered = false;
let timeUpMiniFallback;
let currentSectionId = 'task-start';
let perviousSectionId = null;
let justSaved = false;
// const logs = await readLogs();
const tasks = {
  '1st': null,
  '2nd': null
}
let currTasks = '1st';

const dummySettings = {
  'general-Settings': {
    'theme': 'dark',
    'language': 'English',
    'preferances': {
      'editTemplateBeforeStart': true
    }
  }
}
const dummyTaskTemplate = [
  {
    title: 'Solve 2 Math Problems',
    time: 30,
    tags : ['study', 'math'],
    editing: false
  },
  {
    title: 'Revise Biology Diagrams',
    time: 25,
    tags : ['study', 'biology'],
    editing: false
  },
  {
    title: 'Work on IronFocus UI',
    time: 45,
    tags : ['work', 'ui'],
    editing: false
  },
  {
    title: 'Quran Hifz Revision',
    time: 35,
    tags : ['study', 'quran'],
    editing: false
  }
] 

let selectedIndex = -1;

    const dummytagTree = {
      study: {
        math: {
          calculus: {},
          algebra: {}
        },
        physics: {}
      },
      work: {
        js: {},
        design: {}
      },
      'bro hey' : {}
    };



  class TagInput {
    constructor(container, tree, preFillTags = []) {
      this.container = container;
      this.tree = tree;
      this.selectedTags = [...preFillTags];
      this.selectedIndex = -1;

      // Create input
      this.input = document.createElement("input");
      this.input.type = "text";
      this.input.autocomplete = "off";
      // this.input.className = "tags-input"
      this.input.className = "invisible-input";

      if(this.container) {
        this.container.appendChild(this.input);
        this.updateUI();  
        this.bindEvents();
      }

      // Create fixed suggestion box
      this.suggestionBox = document.createElement("div");
      this.suggestionBox.className = "suggestion-box";
      document.body.appendChild(this.suggestionBox);

      
      
    }

    bindEvents() {
      if(this._eventBound) return;
      this._eventBound = true;
      this.input.addEventListener("input", () => this.showSuggestions());
      this.input.addEventListener("keydown", e => this.onKeyDown(e));
      document.addEventListener("click", e => {
        if (!this.container.contains(e.target) && !this.suggestionBox.contains(e.target)) {
          this.suggestionBox.style.display = "none";
        }
      });
        this.container.addEventListener("click", () => {
        this.input.focus();
        this.showSuggestions();
        });
    }

    updateUI() {
      this.container.innerHTML = "";
      this.selectedTags.forEach((tag, i) => {
        const span = document.createElement("span");
        span.className = "tag-chip";
        span.textContent = tag;

        // Remove button
        // const btn = document.createElement("button");
        // btn.textContent = "×";
        // btn.className = "remove";
        // btn.onclick = () => {
        //   this.selectedTags.splice(i, 1);
        //   this.updateUI();
        // };

        // span.appendChild(btn);
        this.container.appendChild(span);
      });
      this.container.appendChild(this.input);
      this.input.focus();
      setTimeout(() => this.showSuggestions(), 100);
    }

    getTagsAtPath(path) {
      let node = this.tree;
      for (const part of path) {
        if (!node[part]) return [];
        node = node[part];
      }
      return Object.keys(node);
    }

    getFilteredSuggestions(inputValue) {
      const parts = inputValue.split(",").map(p => p.trim()).filter(Boolean);
      const path = parts.slice(0, -1);
      const token = parts[parts.length - 1] || "";
      const children = this.getTagsAtPath(this.selectedTags);
      return children.filter(child => child.toLowerCase().startsWith(token.toLowerCase()));
    }

    showSuggestions() {
      this.selectedIndex = -1;
      const val = this.input.value;
      const suggestions = this.getFilteredSuggestions(val);
      this.suggestionBox.innerHTML = "";
      if (suggestions.length === 0) {
        this.suggestionBox.style.display = "none";
        return;
      }

      suggestions.forEach(suggestion => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = suggestion;
        item.onclick = () => {
          this.selectedTags.push(suggestion);
          this.input.value = "";
          this.updateUI();
          this.suggestionBox.style.display = "none";
        };
        this.suggestionBox.appendChild(item);
      });

      const rect = this.container.getBoundingClientRect();
      this.suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
      this.suggestionBox.style.left = `${rect.left + window.scrollX}px`;
      this.suggestionBox.style.width = `${rect.width}px`;
      this.suggestionBox.style.display = "block";
    }

    highlightSuggestion(items, index) {
      items.forEach((item, i) => {
        item.classList.toggle("highlighted", i === index);
      });
    }

    onKeyDown(e) {
      const items = this.suggestionBox.querySelectorAll(".suggestion-item");

      if ((e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) && items.length > 0) {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
        this.highlightSuggestion(items, this.selectedIndex);
      } else if ((e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) && items.length > 0) {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
        this.highlightSuggestion(items, this.selectedIndex);
      } else if (e.key === "Enter" && this.selectedIndex !== -1 && items.length > 0) {
        e.preventDefault();
        items[this.selectedIndex].click();
      } else if (e.key === "," && this.input.value.trim()) {
        e.preventDefault();
        this.selectedTags.push(this.input.value.trim());
        this.input.value = "";
        this.updateUI();
        this.selectedIndex = -1;
      } else if (e.key === "Backspace" && this.input.value === "") {
        this.selectedTags.pop();
        this.updateUI();
        this.selectedIndex = -1;
      }
    }

    // Public method: update tags externally
    updateTags(newTags) {
      this.selectedTags = [...newTags];
      this.updateUI();
    }

    // Public method: get current tags
    getTags() {
      return [...this.selectedTags];
    }
  // update container
    updateContainer(container) {
      if(!container || !(container instanceof HTMLElement)) {
        throw new Error('Invalid container element');
      }
      // if(!this._containerBound){
      //     this.container.addEventListener("click", () => {
      //     this.input.focus();
      //     this.showSuggestions();
      // });
      // this._containerBound = true;
      // }
      this.container = container;
      this.updateUI();
      this.bindEvents();
    }
    // Cleanup if needed
    destroy() {
      this.suggestionBox.remove();
      this.container.innerHTML = "";
    }
  }

  function displayPaused() {
    taskPausedTitle.textContent = tasks[currTasks].title;
    taskPausedTiming.innerHTML = `⏱ Elapsed: ${formatTime(tasks[currTasks].secondsPassed)}&nbsp;&nbsp;&nbsp;  &nbsp;&nbsp;&nbsp;⌛ Remaining: ${formatTime(tasks[currTasks].secondsLeft)}`;

    taskPausedProgress.style.width = `${(tasks[currTasks].secondsPassed / (tasks[currTasks].givenTime * 60 + tasks[currTasks].extraAlocatedTime * 60)) * 100}%`;
    switchSection('task-paused');
  }
  function injectDataToTimeUps(){
    timeUpMiniTitle.textContent = tasks[currTasks].title;
    timeUpMiniTimeSpent.textContent = `⏳ ${formatTime(tasks[currTasks].secondsPassed)}`;
    timeUpTitle.textContent = tasks[currTasks].title;
    timeUpTimeSpent.textContent = `⏳ ${formatTime(tasks[currTasks].secondsPassed)}`;
  }
   function addOrSwitchTask() {
    // menuOverlay.style.display = 'none';
    if(tasks[getAlternateTask()]) {
      switchCurrTask();

    } else {
      switchSection('task-start');
    }
   }
   function switchSettingsSection(button, sectionId, display = 'block') {
      console.log('switching to section: ' + sectionId);
      document.querySelectorAll('.settings-section').forEach(sec => sec.style.display = 'none');
      document.getElementById(sectionId).style.display = display;
      document.querySelectorAll('.settings-sidebar button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    }

    function switchSection(sectionId, display = 'flex') {
      // if(currentSectionId === sectionId) return;
      perviousSectionId = currentSectionId;
      currentSectionId = sectionId;
      document.querySelectorAll('section').forEach(sec => {
        sec.style.display = 'none'
        sec.classList.remove('visible');
        if(sec.id == sectionId) {
          sec.style.display = display;
          sec.classList.add('visible');
        }
      });
      console.log('the section id is ' + sectionId);
      console.log('the display is ' + display);
      menuOverlay.style.display = 'none';
      // document.getElementById(sectionId).style.display = display;
      if(sectionId === 'task-show' || sectionId === 'task-time-up-mini') {
        gearIcon.classList.remove('show');
        fullScreen(false);
      } else {
        gearIcon.classList.add('show');
        fullScreen(true);
      }
      if(sectionId === 'task-save') {
        drag.classList.remove('show');
      }
      if(sectionId === 'task-settings'){
        gearIcon.classList.remove('show');
        drag.classList.remove('show');
      }

      if(sectionId === 'task-show' || sectionId === 'task-paused') {
        menuBtnFinish.classList.remove('disabled');
        menuBtnPause.classList.remove('disabled');
      } else if(sectionId === 'task-time-up-mini' || sectionId === 'task-time-up') {
        menuBtnFinish.classList.remove('disabled');
        menuBtnPause.classList.add('disabled');

      } else {
        menuBtnFinish.classList.add('disabled');
        menuBtnPause.classList.add('disabled');
      }
    }


    function updateSliderBackground(timeSlider) {
    const value = timeSlider.value;
    const min = timeSlider.min;
    const max = timeSlider.max;
    const percent = ((value - min) / (max - min)) * 100;
    // Color left of thumb, transparent right
    timeSlider.style.background = `linear-gradient(to right, var(--accent1) ${percent}%, transparent ${percent}%)`;
  }

  // switchSection('task-paused');
  let justSwitched = false;
  function switchCurrTask() {
    if(justSwitched) return {success: false, message: 'already switched'};
    if(!tasks[getAlternateTask()]) return {success: false, message: 'no other task to switch to'};
    justSwitched = true;
    currTasks = getAlternateTask();
    taskShowTitle.textContent = tasks[currTasks].title;
    setTimeout(() => {
      justSwitched = false;
    }, 2000);
  }

  function togglePause() {
    if(menuBtnPause.classList.contains('disabled')) return;
    // menuOverlay.style.display = 'none';
    if(!tasks[currTasks]) return;
    if(tasks[currTasks].secondsLeft <= 0) return;
    tasks[currTasks].paused = !tasks[currTasks].paused;
    if(tasks[currTasks].paused) {
      displayPaused();
    } else {
      switchSection('task-show'); 
    }
  }
  function handleFinish() {
    if(!tasks[currTasks]) return;
    if(menuBtnFinish.classList.contains('disabled')) return;
    // menuOverlay.style.display = 'none';
    updateSliderBackground(taskSaveSuccessRange)
    if(tasks[currTasks].secondsLeft > 0) {
      tasks[currTasks].paused = true;
      displayTaskSave();
    } else {
      taskSaveBackBtn.style.display = 'none';
      displayTaskSave();
    }
  }
  function getAlternateTask() {
    return currTasks === '1st' ? '2nd' : '1st'; 
  }
  function updateTimer() {
    if(!tasks[currTasks]) return;
    if(tasks[currTasks].secondsLeft > 0 && !tasks[currTasks].paused) {
      tasks[currTasks].secondsLeft--;
      tasks[currTasks].secondsPassed++; 
      taskShowCountdown.textContent = hovered ? formatTime(tasks[currTasks]?.secondsPassed) : formatTime(tasks[currTasks]?.secondsLeft);
      const percent = (tasks[currTasks].secondsPassed / (tasks[currTasks].givenTime * 60 + tasks[currTasks].extraAlocatedTime * 60)) * 100;
      taskShowProgress.style.width = `${percent}%`;
    } else if(tasks[currTasks] && tasks[currTasks]?.paused){
      // do nothing
    } else if(taskShow.classList.contains('visible')) {
        switchSection('task-time-up-mini');
        injectDataToTimeUps();
        if(timeUpMiniFallback) clearTimeout(timeUpMiniFallback);
        timeUpMiniFallback = setTimeout(() => {
          tasks[currTasks].extraAlocatedTime += timeUpMiniFallbackDuration;
          switchSection('task-time-up');
        }, timeUpMiniFallbackDuration * 1000 * 60);
    } else {
      // do nothing for now.
    }

  }
  function formatTime(secondsLeft){
    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    if(hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } 
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
  function fullScreen(f){
      if(f){
          ipcRenderer.send('fullScreen');
      } else {
          ipcRenderer.send('exitFullScreen')
      }
  }
  function startTask(title, time, tags) {
    // next work  
    console.log(`Starting task: ${title}, Time: ${time} min, Tags: ${JSON.stringify(tags)}`);
    switchSection('task-show');
    
    totalSeconds = time * 60;
    function setTask(currTasks) {
      tasks[currTasks] = {
        title : title,
        givenTime: time,
        secondsLeft : totalSeconds,
        secondsPassed : 0,
        extraAlocatedTime : 0, 
        tags : tags,
        paused : false,
        startAt : new Date().toISOString().slice(0, 10),
        timestamp : null
      }
      if(!timer) timer = setInterval(updateTimer, 1000);
      taskShowTitle.textContent = title;
      taskShowCountdown.textContent = formatTime(totalSeconds);
      taskShowProgress.style.width = `0%`;


    }
    if(!tasks[currTasks]) {
      setTask(currTasks); 
    } else if(!tasks[getAlternateTask()]) {
      menuBtnAddSwitchBtn.innerHTML = `🔁 <span>Switch</span>`;
      currTasks = getAlternateTask();
      setTask(currTasks);
    } else {
      alert('hey, you already have 2 task running, to make a new one finish the current one');
    }
  }

menuBtnAbout.addEventListener('click', () => {
  // menuOverlay.style.display = 'none';
  window.open('https://nazmul-alom-shanto.github.io/', '_blank');
});

taskShow.addEventListener('mouseenter', () => {
  hovered = true;
  if(taskShow.classList.contains('visible')) taskShowCountdown.textContent = formatTime(tasks[currTasks].secondsPassed);
});
document.body.addEventListener('mouseleave', () => {
  hovered = false;
  if(tasks[currTasks]) taskShowCountdown.textContent = formatTime(tasks[currTasks].secondsLeft);  
});
// gear icon & menu overlay & move drag

gearIcon.addEventListener('click', () => {
  menuOverlay.style.display = 'grid';
});

// taskShow.addEventListener('mouseenter', ()=> gearIcon.classList.add('show'));
// taskShow.addEventListener('mouseleave', () =>{
//   setTimeout(() => {
//     gearIcon.classList.remove('show');
//   }, 1000);
// });
// timeUpMini.addEventListener('mouseenter', ()=> gearIcon.classList.add('show'));
// timeUpMini.addEventListener('mouseleave', () => gearIcon.classList.remove('show'));
// document.body.addEventListener('mouseenter', () => {
//   if(!hovered) gearIcon.classList.add('show');
// });
document.body.addEventListener('mouseleave', () => {
  if(taskShow.classList.contains('visible') || timeUpMini.classList.contains('visible')) {
    gearIcon.classList.remove('show');
  } 
  drag.classList.remove('show');
});

taskShow.addEventListener('mouseenter', () => {
  drag.classList.add('show');
  gearIcon.classList.add('show');
});
timeUpMini.addEventListener('mouseenter', () => {
  drag.classList.add('show');
  gearIcon.classList.add('show');
});



// start task

startTaskTimeSlider = document.getElementById('start-task-time-slider');
startTaskTimeDisplay = document.getElementById('start-task-time-display');
updateSliderBackground(startTaskTimeSlider);
startTaskTimeSlider.addEventListener('input', () => {
  startTaskTimeDisplay.textContent = `${startTaskTimeSlider.value} min`;
  updateSliderBackground(startTaskTimeSlider);
});

// start task tamplate rendering
//<button class="template-btn" data-title="📘 Solve 2 Math Problems" data-time="30">
					//	📘 Solve 2 Math Problems <span class="time">30 min</span>
					//</button>
dummyTaskTemplate.forEach(task => {
  const templateBtn = document.createElement('button');
  templateBtn.classList.add('template-btn');
  templateBtn.dataset.title = task.title;
  templateBtn.dataset.time = task.time;
  templateBtn.innerHTML = `${task.title} <span class="time">${task.time} min</span>`;
  taskStartTemplateContainer.appendChild(templateBtn);

  templateBtn.addEventListener('click', () => {
    if(dummySettings['general-Settings']['preferances']['editTemplateBeforeStart']) {
      taskStartTitle.value = task.title;
      startTaskTimeSlider.value = task.time;
      startTaskTimeDisplay.textContent = `${task.time} min`;
      updateSliderBackground(startTaskTimeSlider);
      taskStartTagInputSuggestor.updateTags(task.tags);
    } else {
      startTask(task.title, task.time, task.tags);
    }
  });

});

// start task form submit
const startTaskForm = document.getElementById('custom-form');
startTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const tags = taskStartTagInputSuggestor.getTags();
  startTask(taskStartTitle.value, startTaskTimeSlider.value, tags);
});

// task paused
document.addEventListener('keypress', (e) => {
  if(e.ctrlKey && e.key.toLowerCase() == 'p') {
    e.preventDefault();
    togglePause();
  }
});


// drag & gear han




switchSection('task-start');
// fullScreen(false);

function extendTime(min){
  if(timeUpMiniFallback) clearTimeout(timeUpMiniFallback);
  timeUpMiniFallback = null;
  tasks[currTasks].secondsLeft += min * 60;
  tasks[currTasks].extraAlocatedTime += min;
  if(!taskShow.classList.contains('visible')) {
    switchSection('task-show');
  }
}
// task save
function preFillSaveForm() {
  taskSaveTitle.value = tasks[currTasks].title;
  taskSaveSuccessRange.value = 75;
  // taskSaveTags.value = s
  taskSaveTagInputSuggestor.updateTags(tasks[currTasks].tags);
}

taskSaveForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if(justSaved) return;
  justSaved = true;
  setTimeout(()=> {
    justSaved = false;
  }, 30 * 1000);
  const title = taskSaveTitle.value;
  const success = parseInt(taskSaveSuccessRange.value);
  const tags = taskSaveTagInputSuggestor.getTags();
  const description = taskSaveReflection.value;
  tasks[currTasks].title = title;
  tasks[currTasks].success = success;
  tasks[currTasks].tags = tags;
  tasks[currTasks].description = description;
  tasks[currTasks].timestamp = new Date().toISOString();
  tasks[currTasks].extraAlocatedTime -= Math.round(tasks[currTasks].secondsLeft / 60);
  updateLogs(tasks[currTasks]);
  tasks[currTasks] = null;
  currTasks = getAlternateTask();
  taskShowTitle.textContent = tasks[currTasks]?.title || '';
  switchSection(tasks[currTasks] ? 'task-show' : 'task-start');
});
async function updateLogs(log){
    try{
        const logs = await readLogs();
    logs.push(log);
    const temp = {
        logs : logs
    }
    const response = await ipcRenderer.invoke('update-log', temp);
    if(response.success){
      console.log('log has been updated sucessfully');
      
    } else{
      throw new Error(`Someting went wrong when trying to update logs. Err Message: ${response.message}`);
    }
    l(JSON.stringify(log));
    // location.reload();
    } catch (err){
        console.error(err.message);
    }
}


function displayTaskSave() {
  updateSliderBackground(taskSaveSuccessRange);
  if(timeUpMiniFallback) clearTimeout(timeUpMiniFallback);
  timeUpMiniFallback = null;
  taskSaveBackBtn.style.display = tasks[currTasks].paused ? 'inline-block' : 'none';
  if(!tasks[currTasks]) return;
  preFillSaveForm();
  switchSection('task-save');
}

taskSaveSuccessRange.addEventListener('input', () => {
  updateSliderBackground(taskSaveSuccessRange);
  taskSaveSuccessDisplay.textContent = `${taskSaveSuccessRange.value}%`;
});

function handleFinishBack(){
  tasks[currTasks].paused = false;
  switchSection('task-show');
}

// castom drag

function makeWindowDraggable(elem) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  elem.addEventListener('mousedown', async (e) => {
    isDragging = true;
    console.log('dragging started');
    const { x, y } = await ipcRenderer.invoke('get-window-position');
    console.log(`Current window position: x=${x}, y=${y}`);
    offsetX = e.screenX - x;
    offsetY = e.screenY - y;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.screenX - offsetX;
    const y = e.screenY - offsetY;
    console.log(`Dragging to: x=${x}, y=${y}`);
    ipcRenderer.send('drag-window', x, y);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// ✅ Just call it:
makeWindowDraggable(document.querySelector('.drag'));


    function switchTab(button, tabId) {
      document.querySelectorAll('.task-tab, .report-tab, .template-tab').forEach(tab => tab.style.display = 'none');
      document.getElementById(tabId).style.display = 'block';
      document.querySelectorAll('.tab-nav button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    }

    const selectTheme = document.getElementById('theme');
    const theme = localStorage.getItem('theme');
    if(theme === 'light') {
        selectTheme.value = 'light';
        toggleTheme(theme);
    } else if(theme === 'dark'){
        selectTheme.value = 'dark';
        toggleTheme(theme);
    } else {
      selectTheme.value = 'default';
      toggleTheme('');
    }
    function toggleTheme(theme) {
      if(theme === 'dark') {
        document.body.className = "dark-mode";
        localStorage.setItem('theme' , 'dark');
      } else if(theme === 'light'){
        document.body.className = "";
        localStorage.setItem('theme', 'light');
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = isDark ? 'dark-mode' : ''; 
        localStorage.setItem('theme' , 'default');
      }
    }

    function closeSettings() {
              switchSection(perviousSectionId);
    }



    document.querySelectorAll('.overlay .option').forEach(option => {
  option.addEventListener('click', () => {
    if(option.classList.contains('disabled')) return; // Ignore disabled options
    menuOverlay.style.display = 'none';
  });
    });


    /*settings template*/
function addTaskToTemplate(taskList = dummyTaskTemplate, containerId = "taskList") {
      console.log(`the task list is ${JSON.stringify(taskList)}`);
      console.log('Adding task to template'); 
           
      const title = document.getElementById(`${containerId}-title`).value.trim();
      const time = document.getElementById(`${containerId}-time`).value.trim();
      // const tags = document.getElementById(`${containerId}-tags`).value.trim().split(',').map(t => t.trim()).filter(Boolean);
      const templateTagInputMap = {
        taskList: settingsTemplateTagInputSuggestor,
        todayTaskList: todayTaskListTagInputSuggestor,
        tomorrowTaskList: tomorrowTaskListTagInputSuggestor
      }
      const tags = templateTagInputMap[containerId]?.getTags() ?? [];
      console.log(`Title: ${title}, Time: ${time}, Tags: ${tags.join(', ')}`);
      if (!title || !time) return;

      dummyTaskTemplate.push({ title, time, tags, editing: false });
      console.log('Task added:', { title, time, tags });
      renderTasks(taskList, containerId);
      console.log(`Rendered tasks in container: ${containerId}`);
      document.getElementById(`${containerId}-title`).value = "";
      document.getElementById(`${containerId}-time`).value = "";
      templateTagInputMap[containerId]?.updateTags([]);
    }
    // const tagInputContainerEdit = container.querySelectorAll('.settings-template-tags-container-edit');
    const tagInputContainerEditSuggestor = new TagInput(null, dummytagTree, [] );
     
renderTasks(dummyTaskTemplate, 'taskList');
    function renderTasks(taskList = dummyTaskTemplate, containerId = "taskList") {
      console.log(`Rendering tasks in container: ${containerId}`);
      const container = document.getElementById(containerId);
      container.innerHTML = "";

      taskList.forEach((task, index) => {
        const card = document.createElement("div");
        card.className = "task-card" + (task.editing ? " editing-card" : "");
        // const taggForPreFill = tagInputContainerEditSuggestor.getTags();
        if (task.editing) {
          card.innerHTML = `
            <input class="task-editing" type="text" value="${task.title}" id="edit-title-${index}">
            <input class="task-editing" type="number" value="${task.time}" id="edit-time-${index}">
            <!--input class="task-editing" type="text" value="${task.tags.join(', ')}" id="edit-tags-${index}"-->
						<div class="settings-template-tags-container-edit tag-input-container"></div>
            <div class="task-actions">
              <button class="edit-btn save" data-index="${index}" ><i class="fas fa-check"></i></button>
              <button class="delete-btn cancel" data-index="${index}"><i class="fas fa-xmark"></i></button>
            </div>
          `;
          tagInputContainerEditSuggestor.updateContainer(card.querySelector('.settings-template-tags-container-edit'));
          tagInputContainerEditSuggestor.updateTags(task.tags);
        } else {
          card.innerHTML = `
            <div class="task-main">
              <div class="task-title">${task.title}</div>
              <div class="task-tags">${task.tags.map(tag => `<span>${tag}</span>`).join(' ')}</div>
            </div>
            <div class="task-time">${task.time} min</div>
            <div class="task-actions">
              <button class="edit-btn edit" data-index="${index}"><i class="fas fa-pen"></i></button>
              <button class="delete-btn delete" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
          `;
        }

        container.appendChild(card);
      });
     container.querySelectorAll('.edit').forEach(btn => {
        btn.onclick = () => editTask(+btn.dataset.index, taskList, containerId);
      });
       container.querySelectorAll('.delete').forEach(btn => {
        btn.onclick = () => deleteTask(+btn.dataset.index, taskList, containerId);
      }); container.querySelectorAll('.save').forEach(btn => {
        btn.onclick = () => saveTask(+btn.dataset.index, taskList, containerId);
      }); container.querySelectorAll('.cancel').forEach(btn => {
        btn.onclick = () => cancelEdit(+btn.dataset.index, taskList, containerId);
      });

    }

    function editTask(index, taskList = dummyTaskTemplate, containerId = "taskList") {
      // save all other 
        const container = document.getElementById(containerId);
        container.querySelectorAll('.save').forEach(btn => {
        btn.click();
      });
      console.log(`Editing task at index ${index}`);
      taskList[index].editing = true;
      renderTasks(taskList, containerId);
    }

    function cancelEdit(index, taskList = dummyTaskTemplate, containerId = "taskList") {
      taskList[index].editing = false;
      renderTasks(taskList, containerId);
    }

    function saveTask(index, taskList = dummyTaskTemplate, containerId = "taskList") {
      const title = document.getElementById(`edit-title-${index}`).value.trim();
      const time = document.getElementById(`edit-time-${index}`).value.trim();
      // const tags = document.getElementById(`edit-tags-${index}`).value.trim().split(',').map(t => t.trim()).filter(Boolean);
      const tags = tagInputContainerEditSuggestor.getTags();
      if (!title || !time) return;

      dummyTaskTemplate[index] = { title, time, tags, editing: false };
      renderTasks(taskList, containerId);
    }

    function deleteTask(index, taskList = dummyTaskTemplate, containerId = "taskList") {
      dummyTaskTemplate.splice(index, 1);
      renderTasks(taskList, containerId);
    }
 
    const dummyTaskListToday = dummyTaskTemplate;
    const dummyTaskListTomorrow = dummyTaskTemplate;
    renderTasks(dummyTaskListToday, 'todayTaskList');
    renderTasks(dummyTaskListTomorrow, 'tomorrowTaskList');
    // pie Chart

    const listForPieChart = [
  // { tags: ["study16", "math", "calculus"], duration: 2 },
  // { tags: ["study15", "math", "calculus"], duration: 2 },
  // { tags: ["study14", "math", "calculus"], duration: 2 },
  // { tags: ["study13", "math", "calculus"], duration: 2 },
  // { tags: ["study12", "math", "calculus"], duration: 2 },
  // { tags: ["study11", "math", "calculus"], duration: 2 },
  // { tags: ["study10", "math", "calculus"], duration: 2 },
  // { tags: ["study9", "math", "calculus"], duration: 2 },
  // { tags: ["study8", "math", "calculus"], duration: 2 },
  // { tags: ["study7", "math", "calculus"], duration: 2 },
  // { tags: ["study6", "math", "calculus"], duration: 2 },
  // { tags: ["study5", "math", "calculus"], duration: 2 },
  // { tags: ["study4", "math", "calculus"], duration: 2 },
  // { tags: ["study3", "math", "calculus"], duration: 2 },
  // { tags: ["study2", "math", "calculus"], duration: 2 },
  // { tags: ["study1", "math", "calculus"], duration: 2 },
  // { tags: ["study0", "math", "calculus"], duration: 2 },

  // Academic - Math
  { tags: ["study", "math", "calculus"], duration: 2 },
  { tags: ["study", "math", "linear algebra"], duration: 1.5 },
  { tags: ["study", "math", "probability"], duration: 1 },
  { tags: ["study", "math", "statistics"], duration: 1.5 },
  { tags: ["study", "math", "differential equations"], duration: 2 },

  // Academic - Physics
  { tags: ["study", "physics", "mechanics"], duration: 1.5 },
  { tags: ["study", "physics", "thermodynamics"], duration: 1 },
  { tags: ["study", "physics", "optics"], duration: 1 },
  { tags: ["study", "physics", "quantum physics"], duration: 2 },
  { tags: ["study", "physics", "electromagnetism"], duration: 2 },

  // Academic - Chemistry & Biology
  { tags: ["study", "chemistry", "organic"], duration: 1 },
  { tags: ["study", "chemistry", "inorganic"], duration: 1 },
  { tags: ["study", "biology", "cell biology"], duration: 1 },
  { tags: ["study", "biology", "genetics"], duration: 1 },

  // Coding & Software
  { tags: ["coding", "web development", "frontend"], duration: 2 },
  { tags: ["coding", "web development", "backend"], duration: 2 },
  { tags: ["coding", "python", "scripts"], duration: 1 },
  { tags: ["coding", "projects", "personal website"], duration: 1.5 },
  { tags: ["coding", "data structures", "algorithms"], duration: 2 },
  { tags: ["coding", "machine learning", "models"], duration: 2 },
  { tags: ["coding", "debugging"], duration: 1 },

  // Problem Solving
  { tags: ["problem solving", "leetcode", "medium"], duration: 1 },
  { tags: ["problem solving", "math olympiad"], duration: 1.5 },
  { tags: ["problem solving", "contest preparation"], duration: 2 },

  // Research & Reading
  { tags: ["academic", "research", "papers"], duration: 1 },
  { tags: ["academic", "reading", "textbooks"], duration: 1.5 },
  { tags: ["academic", "note taking"], duration: 1 },

  // Entertainment
  { tags: ["entertainment", "youtube", "educational"], duration: 0.5 },
  { tags: ["entertainment", "youtube", "comedy"], duration: 1 },
  { tags: ["entertainment", "netflix", "movies"], duration: 2 },
  { tags: ["entertainment", "spotify", "music"], duration: 1 },
  { tags: ["entertainment", "facebook", "scrolling"], duration: 0.5 },
  { tags: ["entertainment", "instagram", "reels"], duration: 0.5 },
  { tags: ["entertainment", "gaming", "casual"], duration: 1.5 },

  // Communication
  { tags: ["communication", "email", "academic"], duration: 0.5 },
  { tags: ["communication", "messaging", "friends"], duration: 0.5 },
  { tags: ["communication", "meet", "group project"], duration: 1 },

  // Planning & Productivity
  { tags: ["planning", "task list", "todo app"], duration: 0.5 },
  { tags: ["planning", "calendar", "scheduling"], duration: 0.5 },
  { tags: ["planning", "goal review"], duration: 0.5 },

  // Breaks / Others
  { tags: ["break", "snack", "relax"], duration: 0.5 },
  { tags: ["break", "walk", "refresh"], duration: 0.5 },
  { tags: ["other", "file organization"], duration: 0.5 },
  { tags: ["other", "system updates"], duration: 0.5 },
  { tags: ["other", "exploring new tools"], duration: 1 },
  { tags: ["other", "random browsing"], duration: 1 },
  { tags: ["other", "procrastination"], duration: 0.5 },
];

const previousBtn = document.getElementById("backBtn");

const tagTree = buildTagTree(listForPieChart);
// navigator.clipboard.writeText(JSON.stringify(tagTree, null, 2));
let currentPath = ['Pie Chart'];



function buildTagTree(listForPieChart) {
  const tree = { total: 0, children: {} };

  for (const task of listForPieChart) {
    tree.total += task.duration; // Add to global total
    let current = tree.children;

    for (const tag of task.tags) {
      if (!current[tag]) current[tag] = { total: 0, children: {} };
      current[tag].total += task.duration;
      current = current[tag].children;
    }
  }

  return {'Pie Chart' : tree};
}


// Step 2: Go to current path in tree
function getNodeFromPath(path, tree) {
  let node = tree;
  for (const tag of path) {
    node = node[tag]?.children || {};
  }
  return node;
}

// Step 3: Get current node's data and parent’s total
function getCurrentNodeMeta(path, tree) {
  let node = tree;
  let parent = null;

  for (const tag of path) {
    parent = node;
    node = node[tag]?.children || {};
  }

  const parentTag = path[path.length - 1];
  const total = parent?.[parentTag]?.total || 0;

  return { node, total };
}

// Step 4: Render chart
function renderChart() {
 const summaryContainer = document.querySelector('.tag-summary-container');
 summaryContainer.innerHTML = '';
  const { node, total } = getCurrentNodeMeta(currentPath, tagTree);
  console.log(`currentPath is ${currentPath}`);
  console.log(`total value at the top of renderChart ${total}`);
  const labels = [];
  const data = []; 
 const backgroundColor = [
  // Original 6
  "#4BC0C0", // Teal
  "#FF6384", // Pinkish red
  "#FFCD56", // Soft yellow
  "#36A2EB", // Sky blue
  "#9966FF", // Purple
  "#FF9F40", // Orange

  // 9 additional colors
  "#8BC34A", // Light green
  "#E91E63", // Deep pink
  "#00ACC1", // Cyan blue
  "#F44336", // Bright red
  "#FFEB3B", // Lemon yellow
  "#3F51B5", // Indigo
  "#795548", // Brown
  "#009688", // Teal green
  "#C2185B"  // Raspberry pink
];


  let sumOfChildren = 0;

  for (const [tag, val] of Object.entries(node)) {
    if (val.total > 0) {
      labels.push(tag);
      data.push(val.total);
      sumOfChildren += val.total;
    }
  }

  const otherAmount = total - sumOfChildren;

  if (otherAmount > 0) {
    labels.push("others");
    data.push(otherAmount);
  }

  if (window.pieChart) {
    window.pieChart.destroy();
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

  const labelPlugin = {
  id: 'tagLabels',
  afterDraw(chart) {
    const { ctx, data } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((arc, index) => {
      const { x, y } = arc.tooltipPosition();
      const value = data.datasets[0].data[index];
      const label = data.labels[index];

      const percent = ((value / total) * 100).toFixed(1);
      const formatted = formatHours(value);
      const lines = [
        `${label}`,
        `${formatted}`, `(${percent}%)`
      ];

      // Draw background box
      const padding = 6;
      const lineHeight = 16;
      const width = 80;
      const height = lines.length * lineHeight + padding * 2;

      const boxX = x - 50;
      const boxY = y - height / 2;

      // Box with rounded corners
      drawRoundedRect(ctx, boxX, boxY, width, height, 6);
      ctx.fillStyle = "#3339";
      ctx.fill();

      // Pointer arrow (triangle)
      ctx.beginPath();
      ctx.moveTo(x - 60, y);
      ctx.lineTo(boxX, y - 6);
      ctx.lineTo(boxX, y + 6);
      ctx.closePath();
      ctx.fillStyle = "#3339";
      ctx.fill();

      // Draw text
      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "left";

      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + padding, boxY + padding + lineHeight * (i + 0.8));
      });
    });
  }
};
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const {ctx, chartArea: {width, height, left, top}} = chart;
    ctx.save();

    const text = 'Your Text Here'; // e.g. total or label
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = left + width / 2;
    const centerY = top + height / 2;
    ctx.fillText(text, centerX, centerY);

    ctx.restore();
  }
};


  const ctx = document.getElementById("tagChart").getContext("2d");
  window.pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 0
      }]
    }, 
    plugins: [],
    options: {
     onClick: function (evt, elements) {
  // const tagInfoDiv = document.getElementById("tagDetails");

  if (elements.length > 0) {
    const i = elements[0].index;
    const clicked = labels[i];

    if (clicked !== "others" && node[clicked]) {
      const fullPath = [...currentPath, clicked];
      const time = node[clicked].total;
      const percent = ((time / total) * 100).toFixed(1);

      // tagInfoDiv.innerHTML = `
      //   <strong>Tag:</strong> ${fullPath.join(" > ")}<br>
      //   <strong>Total Time:</strong> ${time} h<br>
      //   <strong>Share of Parent:</strong> ${percent}%
      // `;
      // tagInfoDiv.style.display = "block";

      if (hasVisibleChildren(node[clicked].children)) {
        currentPath.push(clicked);
        updateTitle();
        renderChart();
      }
    } else {
      // tagInfoDiv.style.display = "none";
    }
  } else {
    // Clicked center — go up
    if (currentPath.length > 1) {
      currentPath.pop();
      updateTitle();
      renderChart();
    }
    // tagInfoDiv.style.display = "none";
  }
}
,
      plugins: {
        tooltip: {
           enabled: true  ,
      callbacks: {
        label: function(context) {
          const tag = context.label;
          const value = context.raw; // duration in hours 
          const percent = ((value / total) * 100).toFixed(1);
          const formatted = formatHours(value); // e.g., 2.5h → 2h 30m
          return [
            `${tag}`,
            `${formatted}`,
            `(${percent}%)`
          ];
        },
        title: function() {
          // Return empty array to remove title (optional)
          return [];
        }
      }
    },
        legend: { position: "bottom" }
      },
      cutout: "60%"
    }
  });
  const meta = pieChart.getDatasetMeta(0);
const firstArc = meta.data[0]; // A Chart.ArcElement

const centerX = firstArc.x;
const centerY = firstArc.y;
previousBtn.style.left = `${centerX}px`;
previousBtn.style.top = `${centerY}px`;

  labels.forEach((label, i) => {
    const value = data[i];
    const percent = total === 0 ? 100 : ((value / total) * 100).toFixed(1);
  console.log(`total value progress show ${total}`);
    const formatted = formatHours(value);

    const item = document.createElement('div');
    item.classList.add('tag-summary-item');
    item.style.borderLeftColor = backgroundColor[i % backgroundColor.length];

    item.innerHTML = `
      <span class="color-dot" style="background:${backgroundColor[i % backgroundColor.length]}"></span>
      <div class="tag-label">${label}</div>
      <div class="time">${formatted}</div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percent}%; background: ${backgroundColor[i % backgroundColor.length]}"></div>
      </div>
      <div class="percent-label" style"width : '50px'">${percent}%</div>
    `;

    summaryContainer.appendChild(item);
  });

}

// Step 5: Check if children have values
function hasVisibleChildren(children) {
  return Object.values(children).some(c => c.total > 0);
}

// Step 6: Update header label
function updateTitle() {
  const title = currentPath.length > 1 ? currentPath.slice(1,).join(" → ") : "Total Time";
  document.getElementById("chartTitle").textContent = title;

  previousBtn.style.display = currentPath.length > 1 ? "block" : "none";
}
document.getElementById("backBtn").addEventListener("click", () => {
  if (currentPath.length > 1) {
    currentPath.pop();
    updateTitle();
    renderChart();
  }
});
function formatHours(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}
renderChart();

/// intigrate the auto tag suggestion


// Initialize the tag input with the dummy tree and pre-filled tags
const taskStartTagInputSuggestor = new TagInput(
   taskStartTagsContainer,
  dummytagTree,
  []
);
const taskSaveTagInputSuggestor = new TagInput(
  taskSaveTagsContainer,
  dummytagTree,
  []
);
const settingsTemplateTagInputSuggestor = new TagInput(
  settingsTemplateTagsContainer,
  dummytagTree,
  []
);
const todayTaskListTagInputSuggestor = new TagInput(
  todayTaskListTagsContainer,
  dummytagTree,
  []
);
const tomorrowTaskListTagInputSuggestor = new TagInput(
  tomorrowTaskListTagsContainer,
  dummytagTree,
  []
);

// history load logic
showHistory();
 async function showHistory() {
  // const wasSmall = window.innerWidth < screen.width * 0.5;
  // if(wasSmall){
  //   fullScreen(true);
  // }
  l('log btn is clicked');

  // const closeBtn = historyContainer.querySelector('.close-btn');
  const minSuccess = historyContainer.querySelector('.minSuccess');
  const maxSuccess = historyContainer.querySelector('.maxSuccess');
  const minGivenTime = historyContainer.querySelector('.minGivenTime');
  const maxGivenTime = historyContainer.querySelector('.maxGivenTime');
  const minExtraTime = historyContainer.querySelector('.minExtraTime');
  const maxExtraTime = historyContainer.querySelector('.maxExtraTime');
  const startDate = historyContainer.querySelector('.startDate');
  const endDate = historyContainer.querySelector('.endDate');

  const filterBtn = historyContainer.querySelector('.filter')
  const resetBtn = historyContainer.querySelector('.reset');

  const logs = await readLogs();
  l(JSON.stringify(logs));
  renderLogs(logs);

  l(JSON.stringify(logs));



  function applyFilter(){
    const filtered = logs.filter(log => {
      const logDate = new Date(log.timestamp);

      return (
        (!minSuccess.value || minSuccess.value <= log.success) &&
        (!maxSuccess.value || maxSuccess.value >= log.success) && 
        (!minGivenTime.value || minGivenTime.value <= log.givenTime) &&
        (!maxGivenTime.value || maxGivenTime.value >= log.givenTime) &&
        (!minExtraTime.value || minExtraTime.value <= log.extraAlocatedTime) &&
        (!maxExtraTime.value || maxExtraTime.value >= log.extraAlocatedTime) &&
        (!startDate.valueAsDate || startDate.valueAsDate <= logDate) &&
        (!endDate.valueAsDate || endDate.valueAsDate >= logDate)
      );
    });
    renderLogs(filtered);
  }

  function resetFilter(){
    historyContainer.querySelectorAll('.filter-container input').forEach(input => input.value = '');
    renderLogs(logs);
  }
  // function vanishViewLogs(){
  //   document.body.removeChild(historyContainer);
  //   if(wasSmall){
  //     fullScreen(false);
  //   }
  // }
filterBtn.addEventListener('click', applyFilter);
resetBtn.addEventListener('click', resetFilter);
// closeBtn.addEventListener('click',  vanishViewLogs);

}

  function renderLogs(filteredLogs) {
    // filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    filteredLogs.sort((a,b)=> Date.parse(b.timestamp) - Date.parse(a.timestamp));
    const tbody = historyContainer.querySelector('.logTableBody');
    tbody.innerHTML = '';
    filteredLogs.forEach((log, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${log.title}</td>
        <td>${log.givenTime}</td>
        <td>${log.extraAlocatedTime}</td>
        <td>${log.success}</td>
        <td>${log.description}</td>
        <td  class="timestamp">${formateTimeStamp(log.timestamp)}</td>
      `;
      tbody.appendChild(row);
      // l('I am here');
      // l(`innerHTML of row is ${row.innerHTML}`);
    });
  }
  async function mergeTwoLogs(log1, log2){
    const merged = [];
    const seen = new Set();
    for(const log of log1){
      if(!seen.has(log.timestamp)){
        seen.add(log.timestamp);
        merged.push(log);
      }
    }
    
    for(const log of log2) {
      if(!seen.has(log.timestamp)){
        seen.add(log.timestamp);
        merged.push(log);
      }
    }
    merged.sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
    return merged;
  }
  importLogFile.addEventListener('change', async function () {
    const logs = await readLogs();
    const file = this.files[0];
    let data;
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async function (e) {
      let content = e.target.result;
      try{
        data = JSON.parse(content);
      } catch(err){
        showWarningMessage(`${err.message}`);
      }
      try{
        if(data.logs){
          const mergedLogs = await mergeTwoLogs(data.logs, logs );
          l("merged Log :" + JSON.stringify(mergedLogs));
          const response = await ipcRenderer.invoke('write-logs', mergedLogs);
          if(response.success){
            showWarningMessage("Logs have successfully Updated", "green", 2);
          } else {
            showWarningMessage("SWW when writting logs to file", undefined, 5);
          }
          renderLogs(mergedLogs);
        } else {
          throw new Error('imported file is corupted or Invalid');
        }
      }catch(err){
        showWarningMessage(`${err.message}`,undefined, 5); 
      }
    }
    reader.readAsText(file);
    this.value = '';
  });

  exportLogBtn.addEventListener('click', async()=> {
    const response = await ipcRenderer.invoke('export-logs');
    if(response.success){
      showWarningMessage('Logs Sucessfully Exported', 'green');
    } else {
      showWarningMessage(`SomeThing went wrong ${response.message}`);
    }
  });
  

async function readLogs(){
    try {
        const data = await ipcRenderer.invoke('load-logs');
        if(data.success) {
          return data.logs;
        } else {
          throw Error(`'Failed to load logs from main.js' , Err message : ${data.message}`);
        }
    } catch(err){
        console.error('hey, something went wrong, ',err.message);
        return null;
    }
} 
function formateTimeStamp(iso){
  const date = new Date(iso);
  return date.toLocaleString('en-US',{
    dateStyle : 'medium',
    timeStyle : 'short'
  });
}

function showWarningMessage(message, bg = '#f44336', timeInSec = 3) {
  let container = document.querySelector(".warning-message-container");
  if (!container) {
      container = document.createElement("div");
      container.className = "warning-message-container";
      container.style.position = "fixed";
      container.style.top = "10px";
      container.style.right = "15px";
      container.style.paddingLeft = "15px";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "5px";
      document.body.appendChild(container);
  }

  const warning = document.createElement("div");
  warning.className = "warning-message";
  warning.textContent = message;
  warning.style.background = bg; // red
  warning.style.color = "#fff";
  warning.style.padding = "4px 8px";
  warning.style.borderRadius = "8px";
  warning.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  warning.style.fontFamily = "sans-serif";
  warning.style.transition = "opacity 0.3s";
  warning.style.fontSize = '13px';
  warning.style.opacity = "1";

  console.warn("Warn:", message);
  container.appendChild(warning);

  setTimeout(() => {
      warning.style.opacity = "0";
      setTimeout(() => {
          warning.remove();
      }, 300);
  }, 1000 * timeInSec);
}

historyTab.addEventListener('click', () => {
  showHistory();
})


// calendar view

const now = new Date();
let year = now.getFullYear();
let month = now.getMonth() + 1;


        const checkins = {
      "2025-06-20": [{ id: "watchP", answer: "Yes" }, { id: "didM", answer: "No" }],
      "2025-06-21": [{ id: "watchP", answer: "Yes" }, { id: "didM", answer: "Yes" }],
      "2025-06-22": [{ id: "watchP", answer: "No" }, { id: "didM", answer: "Yes" }],
      "2025-06-23": [{ id: "watchP", answer: "No" }, { id: "didM", answer: "No" }],
      "2025-06-24": []
    };

   function getDayColor(entryArray) {
      let didM = null;
      let didP = null;

      for (const item of entryArray) {
        if (item.id === "didM") didM = item.answer.toLowerCase();
        if (item.id === "watchP") didP = item.answer.toLowerCase();
      }

      if (didM === "yes" && didP === "yes") return "dot-red";
      if (didM === "yes") return "dot-orange";
      if (didP === "yes") return "dot-purple";
      if (didM === "no" && didP === "no") return "dot-green";
      return "dot-gray";
    }
       function generateCalendar(year, month) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = ''; // clear previous

  const startDate = new Date(year, month - 1, 1); // month is 0-based
  const startDay = startDate.getDay();

  const daysInMonth = new Date(year, month, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const dayDiv = document.createElement('div');
    const colorClass = getDayColor(checkins[dateStr] || []);
    dayDiv.className = `day ${colorClass}`;
    dayDiv.textContent = day;
    calendar.appendChild(dayDiv);
  }

function getMonthLabel(year, month) {
  const date = new Date(year, month - 1); // month is 0-indexed
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}
document.querySelector('.month-label').innerText = getMonthLabel(year, month);
l(`getMonthLabel is ${getMonthLabel(year, month)}`);

function getMonthLabel(year, month) {
  const date = new Date(year, month - 1); // month is 0-indexed
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}
document.querySelector('.month-label').innerText = getMonthLabel(year, month);
l(`getMonthLabel is ${getMonthLabel(year, month)}`);
}


document.getElementById('nextMonth').addEventListener('click', ()=> {
    if(month >= 12){
        month = 1; year++;
    } else {
        month++;
    }
    generateCalendar(year, month);
});
document.getElementById('prevMonth').addEventListener('click', ()=> {
    if(month <= 1){
        month = 12 ; year--;
    } else {
        month--;
    }
    generateCalendar(year, month);
});
generateCalendar(year, month);

// dynamic  qoutes
const readQoutes = async() => {
  try{
    const response = await ipcRenderer.invoke('load-qoutes');
    if(response.success){
      return response.qoutes;
    }else{
      throw new Error(`'SWW Err M: ${response.message}`);
    }
  } catch(err){
    return [`${err.message}`];
  }
}
const popFromQoutes = (qoutes) => {
  const index = Math.floor(Math.random() * qoutes.length);
  const qoute = qoutes[index];
  qoutes.splice(index, 1);
  return qoute;
} 
(async ()=> {
  let qoutes = await readQoutes() || [];  

  const intervalForQoutes = setInterval(async()=> {
    if(qoutes.length == 0){
      qoutes = await readQoutes() || [];
      
    } 
    if(qoutes.length > 0){
      // taskShowQuote.style.opacity = 0;
      // setTimeout(()=> {
      //   const qoute = popFromQoutes(qoutes);
      //   taskShowQuote.innerHTML = qoute;
      //   taskShowQuote.style.opacity = 1;
      // }, 300);
        const qoute = popFromQoutes(qoutes);
        taskShowQuote.innerHTML = qoute;
    } else {
      taskShowQuote.innerHTML = 'Time & Tide wait for none, not even for Error 😎';
    }
  }, 10000);
})();