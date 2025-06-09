const fs = require('fs');
const fsp = require('fs').promises;
// if (typeof window === 'undefined') {
//     const fs = require('fs');
//     // Node-specific logic here
// }
const { ipcRenderer } = require('electron');

// main blocks
const taskSetup = document.querySelector('.task-setup');
const taskShow = document.querySelector('.task-show');
const timeUp = document.querySelector('.time-up');
const saveTask = document.querySelector('.save-task');
// lets 
let title = '';
let extraAlocatedTime = 0;
let givenTime = 0;
let timer = null;
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

// taskShow
const titleShow = taskShow.querySelector('.title');
const qoute = taskShow.querySelector('.qoute');
const audio = new Audio('./assets/voice/timeUp.wav');
(async () => {
    console.log(JSON.stringify(await readLogs()));
})();
function countDown(minutes){
    const hInput = taskShow.querySelector('.hours');
    const mInput = taskShow.querySelector('.minutes');
    const sInput = taskShow.querySelector('.seconds');
    
    let seconds = minutes * 60;
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds - 3600 * h) / 60);
        const s = seconds - 3600 * h - 60 * m;

        hInput.innerText = h;
        mInput.innerText = m;
        sInput.innerText = s;
        seconds--;
        if(seconds < 0){
            clearInterval(timer);
            displayBlock(timeUp);   
            audio.play();
        }
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
    extraAlocatedTime += 10;
    countDown(10);
    displayBlock(taskShow);
})
finishBtn.addEventListener('click', () => {
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
        const logs  = JSON.parse(fs.readFileSync('log.json').toString());
        return logs.logs;
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
    fsp.writeFile('log.json', JSON.stringify(temp), null, 2);
    console.log('have written sucessfully');
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
displayBlock(taskSetup)
function displayBlock(block){
    [taskSetup, taskShow, timeUp, saveTask].forEach(b => {
        if(b != block){
            b.style.display = 'none';
            
        }
    });
    block.style.display = 'flex';

}


//click handleing
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
})
document.addEventListener('keydown', (e) => {
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == 'r'){
        e.preventDefault();
    }
})

// 