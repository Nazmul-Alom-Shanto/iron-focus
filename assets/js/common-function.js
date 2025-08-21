async function readLogs(){
    console.log('I am on readlog');
    try {
        const data = await ipcRenderer.invoke('load-logs');
        if(data.success) {
          // l('return data :' + JSON.stringify(data.logs));
          return data.logs;
        } else {
          throw Error(`'Failed to load logs from main.js' , Err message : ${data.message}`);
        }
    } catch(err){
        console.error('hey, something went wrong, ',err.message);
        return null;
    }
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
  function startTask(title, time, tags, fromToDo = false, id = null) {
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
        fromToDo : fromToDo,
        id : id,
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
    // l(JSON.stringify(log));
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


