
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




  async function init(){

  }

 
  // switchSection('task-paused');
  let justSwitched = false;

 

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


// start task form submit
const startTaskForm = document.getElementById('custom-form');
startTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const tags = taskStartTagInputSuggestor.getTags();

  startTask(taskStartTitle.value, startTaskTimeSlider.value, tags, taskStartTitle.dataset.fromToDo);
  taskStartTitle.dataset.fromToDo = false;
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


// task save


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
  if(tasks[currTasks].fromToDo) {
    console.log('this task is from todo');
    const task =  taskListToday?.find(task => task?.id === tasks[currTasks]?.id);
    if(task) {
      task.done = true;
      task.title = title;
      task.tags = tags;
      updateTaskList(taskListToday, 'todayTaskList');
    } else {
      l('task is ', task);
    }
  }
  updateLogs(tasks[currTasks]);
  tasks[currTasks] = null;
  currTasks = getAlternateTask();
  taskShowTitle.textContent = tasks[currTasks]?.title || '';
  switchSection(tasks[currTasks] ? 'task-show' : 'task-start');
});

taskSaveSuccessRange.addEventListener('input', () => {
  updateSliderBackground(taskSaveSuccessRange);
  taskSaveSuccessDisplay.textContent = `${taskSaveSuccessRange.value}%`;
});

function handleFinishBack(){
  tasks[currTasks].paused = false;
  switchSection('task-show');
}


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


    // pie Chart

/// intigrate the auto tag suggestion

// history load logic




// calendar view


// dynamic  qoutes

 

// Initialize the tag input with the dummy tree and pre-filled 