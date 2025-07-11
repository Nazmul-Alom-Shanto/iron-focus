
// const {app} = require('electron');
const { ipcRenderer} = require('electron');

  // const fs = require('fs');
  // const path = require('path');
  // const pathLog = 

// const pathLog = path.join(app.getPath('userData'), 'log.json');
// if(!fs.existsSync(pathLog)){
//   fs.writeFileSync(pathLog, JSON.stringify({"logs":[]}));
// }
// if (typeof window === 'undefined') {
//     const fs = require('fs');
//     // Node-specific logic here
// }


// main blocks
const taskSetup = document.querySelector('.task-setup');
const taskShow = document.querySelector('.task-show');
const timeUp = document.querySelector('.time-up');
const saveTask = document.querySelector('.save-task');
// lets 
let title = '';
let pause = false;
let extraAlocatedTime = 0;
let givenTime = 0;
let timer = null;
let timeremaining = null;
let fallbackTimeout = null;
// taskSetup 
const taskNameInput = document.getElementById('task-name-input');
const totalTimeInput = document.getElementById('task-minutes-input');
const startTaskBtn = document.getElementById('start-task');
startTaskBtn.addEventListener('click', ()=> {
    fullScreen(false);
    title = taskNameInput.value;
    givenTime = totalTimeInput.value;
    titleShow.innerText = title;
    countDown(givenTime);
    displayBlock(taskShow);
})

document.getElementById('task-minutes-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('start-task').click();
  }
});

// taskShow
const titleShow = taskShow.querySelector('.title');
const qouteShow = taskShow.querySelector('.qoute');
const audio = new Audio('./assets/voice/timeUp.wav');
(async () => {
    console.log(JSON.stringify(await readLogs()));
})();
function countDown(minutes){
    const hInput = taskShow.querySelector('.hours');
    const mInput = taskShow.querySelector('.minutes');
    const sInput = taskShow.querySelector('.seconds');
    
    let seconds = minutes * 60;
    timeremaining = seconds;
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
        if(!pause){
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds - 3600 * h) / 60);
        const s = seconds - 3600 * h - 60 * m;

        hInput.innerText = h;
        mInput.innerText = m;
        sInput.innerText = s;
        seconds--;
        timeremaining = seconds;
        if(seconds < 0){
            clearInterval(timer);
            displayBlock(timeUp);   
            audio.play();
        }}
    }, 1000);
}

// saveTask 
const titleConfirm = saveTask.querySelector('.save-task-title');
const successInput = saveTask.querySelector('.save-task-success');
const description = saveTask.getElementsByTagName('textarea')[0];
const saveBtn = document.getElementById('save-btn');
saveBtn.addEventListener('click', ()=> {
    if(titleConfirm.value.length < 4 || !successInput.value){
        console.error('hey, fill them 1st')
        return;
    }
    const log = {
        title : titleConfirm.value,
        success : parseInt(successInput.value),
        description : description.value,
        givenTime : parseInt(givenTime),
        extraAlocatedTime : parseInt(extraAlocatedTime),
        timestamp : new Date().toISOString()
    }

    updateLogs(log);
})
//timeUp
const alocateTimeBtn = document.getElementById('alocate-time');
const finishBtn = document.getElementById('finish');
alocateTimeBtn.addEventListener('click', ()=> {
    if(fallbackTimeout) clearTimeout(fallbackTimeout);
    extraAlocatedTime += 10;
    countDown(10);
    displayBlock(taskShow);
})
finishBtn.addEventListener('click', () => {
  if(fallbackTimeout) clearTimeout(fallbackTimeout);
   displayBlock(saveTask);
   titleConfirm.value = title;
   successInput.focus(); 
   fullScreen(true);
})

function l(m){
    console.log(m);
}
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
    location.reload();
    } catch (err){
        console.error(err.message);
    }
}

function fullScreen(f){
    if(f){
        ipcRenderer.send('fullScreen');
    } else {
        ipcRenderer.send('exitFullScreen')
    }
}
function formateTimeStamp(iso){
  const date = new Date(iso);
  return date.toLocaleString('en-US',{
    dateStyle : 'medium',
    timeStyle : 'short'
  });
}
displayBlock(taskSetup)
function displayBlock(block){
    [taskSetup, taskShow, timeUp, saveTask].forEach(b => {
        if(b != block){
            b.style.display = 'none';
        }
    });
    block.style.display = 'flex';
    const dragEl = document.querySelector('.drag');
    if(block == taskSetup || block == saveTask){
      dragEl.style.display = 'none';
    } else {
      dragEl.style.display = 'unset'
    }
    if(block == taskShow){
  finishNowBtn.classList.remove('disabled');
  pauseResumeBtn.classList.remove('disabled');

    }
    if(block == timeUp) {
      fallbackTimeout = setTimeout(()=> {
        extraAlocatedTime += 3;
        finishBtn.click();
      },180 * 1000);
    finishNowBtn.classList.add('disabled');
    pauseResumeBtn.classList.add('disabled');
    }

}

//click handleing
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})
document.addEventListener('keydown', (e) => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == 'r'){
        e.preventDefault();
    }
});
// Pause & Resume
const pauseResumeBtn = document.getElementById('pause-resume-btn');
pauseResumeBtn.addEventListener('click', ()=> {
  pauseResumeBtn.innerText = pauseResumeBtn.innerText === 'Pause' ? 'Resume' : 'Pause';
  pause = !pause;
});
// finish now

const finishNowBtn = document.getElementById('finish-now-btn');
finishNowBtn.classList.add('disabled');
pauseResumeBtn.classList.add('disabled');

finishNowBtn.addEventListener('click', ()=> {
      extraAlocatedTime -= Math.floor(timeremaining / 60);
      finishBtn.click();
      finishNowBtn.classList.add('disabled');
      pauseResumeBtn.classList.add('disabled');

      if(timer) clearInterval(timer);
})
// log view
const showLogsBtn = document.getElementById('show-logs-btn');
showLogsBtn.addEventListener('click', async()=> {
  const wasSmall = window.innerWidth < screen.width * 0.5;
  if(wasSmall){
    fullScreen(true);
  }
  l('log btn is clicked');
  const viewLogsOverlay = document.createElement('div');
  viewLogsOverlay.className = 'view-logs-overlay';
  viewLogsOverlay.innerHTML = `
     <button class="close-btn">×</button>

  <div class="filter-container">
    <input type="number" class="minSuccess" placeholder="Min Success %">
    <input type="number" class="maxSuccess" placeholder="Max Success %">
    <input type="number" class="minGivenTime" placeholder="Min Given Time">
    <input type="number" class="maxGivenTime" placeholder="Max Given Time">
    <input type="number" class="minExtraTime" placeholder="Min Extra Time">
    <input type="number" class="maxExtraTime" placeholder="Max Extra Time">
    <input type="date" class="startDate">
    <input type="date" class="endDate">
    <input type="button" value="Filter" class='filter'>
    <input type="button" value="Reset" class='reset'>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Title</th>
        <th>Given Time</th>
        <th>Extra Time</th>
        <th>Success %</th>
        <th>Description</th>
        <th>Timestamp</th>
      </tr>
    </thead>
    <tbody class="logTableBody"></tbody>
  </table>
  `;
  document.body.appendChild(viewLogsOverlay);
  const closeBtn = viewLogsOverlay.querySelector('.close-btn');
  const minSuccess = viewLogsOverlay.querySelector('.minSuccess');
  const maxSuccess = viewLogsOverlay.querySelector('.maxSuccess');
  const minGivenTime = viewLogsOverlay.querySelector('.minGivenTime');
  const maxGivenTime = viewLogsOverlay.querySelector('.maxGivenTime');
  const minExtraTime = viewLogsOverlay.querySelector('.minExtraTime');
  const maxExtraTime = viewLogsOverlay.querySelector('.maxExtraTime');
  const startDate = viewLogsOverlay.querySelector('.startDate');
  const endDate = viewLogsOverlay.querySelector('.endDate');

  const filterBtn = viewLogsOverlay.querySelector('.filter')
  const resetBtn = viewLogsOverlay.querySelector('.reset');
  const logs = await readLogs();
  l(JSON.stringify(logs));
  renderLogs(logs);
  function renderLogs(filteredLogs) {
    const tbody = viewLogsOverlay.querySelector('.logTableBody');
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
      l('I am here');
      l(`innerHTML of row is ${row.innerHTML}`);
    });
  }

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
    viewLogsOverlay.querySelectorAll('.filter-container input').forEach(input => input.value = '');
    renderLogs(logs);
  }
  function vanishViewLogs(){
    document.body.removeChild(viewLogsOverlay);
    if(wasSmall){
      fullScreen(false);
    }
  }
filterBtn.addEventListener('click', applyFilter);
resetBtn.addEventListener('click', resetFilter);
closeBtn.addEventListener('click',  vanishViewLogs);

})

// dynamic qoute functionality 

//const qoute = document.querySelector('.qoute');

// const readQoutes = async () => {
//   try{
//     const qoutes = await fsp.readFile('qoute.json');
//     return JSON.parse(qoutes);
//   } catch(err) {
//     console.error('something went wrong when reading file from qoute.json', err.message);
//     return null;
//   }
// }
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
      // qouteShow.style.opacity = 0;
      // setTimeout(()=> {
      //   const qoute = popFromQoutes(qoutes);
      //   qouteShow.innerHTML = qoute;
      //   qouteShow.style.opacity = 1;
      // }, 300);
        const qoute = popFromQoutes(qoutes);
        qouteShow.innerHTML = qoute;
    } else {
      qouteShow.innerHTML = 'Time & Tide wait for none, not even for Error 😎';
    }
  }, 10000);
})();