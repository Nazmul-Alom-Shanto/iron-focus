    /*settings template*/
const templateDailyAddTaskBtn = document.getElementById('template-daily-add-task-btn');
const todayTaskListAddTaskBtn = document.getElementById('todayTaskList-add-task-btn');
const tomorrowTaskListAddTaskBtn = document.getElementById('tomorrowTaskList-add-task-btn');

let taskListToday = null;
let taskListTomorrow = null;
let dailyTemplate = null;

// const containerIdTo

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

      taskList.push({ title, time, tags, editing: false , done : false, id : generateTaskId() });
      console.log('Task added:', { title, time, tags });
      updateTaskList(taskList, containerId);
      renderTasks(taskList, containerId);
      console.log(`Rendered tasks in container: ${containerId}`);
      document.getElementById(`${containerId}-title`).value = "";
      document.getElementById(`${containerId}-time`).value = "";
      templateTagInputMap[containerId]?.updateTags([]);
    }

    function renderToDo(template){ 
    const taskStartTemplateContainer = document.getElementById('task-start-template-container');
    const taskCount = document.getElementById('task-count');
    let done = 0;
    for( let i = 0; i < template.length ; i++ ) {
      const task = template[i];
    if(task.done) {
      done += 1;
      continue;
    }
    const templateBtn = document.createElement('button');
    templateBtn.classList.add('template-btn');
    templateBtn.dataset.title = task.title;
    templateBtn.dataset.time = task.time;
    templateBtn.innerHTML = `${task.title} <span class="time">${task.time} min</span>`;
    taskStartTemplateContainer.appendChild(templateBtn);

    templateBtn.addEventListener('click', () => {
        if(dummySettings['general-Settings']['preferances']['editTemplateBeforeStart']) {
        taskStartTitle.value = task.title;
        taskStartTitle.dataset.fromToDo = true;
        startTaskTimeSlider.value = task.time;
        startTaskTimeDisplay.textContent = `${task.time} min`;
        updateSliderBackground(startTaskTimeSlider);
        taskStartTagInputSuggestor.updateTags(task.tags);
        } else {
        startTask(task.title, task.time, task.tags, true, task.id);
        }
    });
    };
    taskCount.innerHTML = `${done}/${template.length}`;
};
        // const tagInputContainerEdit = container.querySelecto rAll('.settings-template-tags-container-edit');
    const tagInputContainerEditSuggestor = new TagInput(null, dummytagTree, [] );
     
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
              <div class="task-tags">${task.tags.map(tag => `<span>${tag}</span>`).join(' ')} <val  style="color :  #6C63FF; "> |  ${task.score || 0}</val></div>
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

    async function updateTaskList(taskList, containerId) {
      try {
        const now = new Date();
        console.log('we are on upadte task list');
        console.log("task list is : " + JSON.stringify(taskList));
        if(containerId === "taskList"){
          const res = await ipcRenderer.invoke('load-templates');
          const templates = res.data || (() => { throw new Error('failed to load'); })();
          templates.dailyTemplate = taskList;
          ipcRenderer.invoke('write-templates', templates);
        } else if(containerId === "todayTaskList") {
          console.log('updating today\'s task list');
          const res = await ipcRenderer.invoke('load-daily-tasks');
          const dailyTasks = res.data || (()=> {throw new Error('failed to load');})();
          dailyTasks[now.toISOString().slice(0,10)] = taskList;   
          ipcRenderer.invoke('write-daily-tasks', dailyTasks);     
          renderToDo(taskList);  
        } else if(containerId === "tomorrowTaskList") {
          const res = await ipcRenderer.invoke('load-daily-tasks');
          const dailyTasks = res.data || (()=> {throw new Error('failed to load');})();
          dailyTasks[new Date(now.setDate(now.getDate() + 1)).toISOString().slice(0,10)] = taskList; 
          ipcRenderer.invoke('write-daily-tasks', dailyTasks);       
        } else {
          throw new Error('params is wrong');
        }
      } catch(err) {
        showWarningMessage('SWW : ' + err.message);
      }
        }
    
  function generateTaskId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

    function saveTask(index, taskList = dummyTaskTemplate, containerId = "taskList") {
      const title = document.getElementById(`edit-title-${index}`).value.trim();
      const time = document.getElementById(`edit-time-${index}`).value.trim();
      // const tags = document.getElementById(`edit-tags-${index}`).value.trim().split(',').map(t => t.trim()).filter(Boolean);
      const tags = tagInputContainerEditSuggestor.getTags();
      if (!title || !time) return;

      taskList[index] = { title, time, tags, editing: false , done : false, id : generateTaskId()};
      updateTaskList(taskList, containerId);
      renderTasks(taskList, containerId);
    }

    function deleteTask(index, taskList, containerId ) {
      taskList.splice(index, 1);
      renderTasks(taskList, containerId);
    }
 
    const dummyTaskListToday = dummyTaskTemplate;
    const dummyTaskListTomorrow = dummyTaskTemplate;


    initSettingsTemplate();
    async function initSettingsTemplate() {
      const res1 =  await ipcRenderer.invoke('load-daily-tasks');
      const res2 = await ipcRenderer.invoke('load-templates');
      const dailyTasks = res1.success ? res1.data : [];
      const templates = res2.success ? res2.data : [];
      const now = new Date();
      const today = now.toISOString().slice(0,10);
      now.setDate(now.getDate() + 1)
      const tomorrow = now.toISOString().slice(0,10); 
      // now.setDate(now.getDate() - 1);
      const setTaskListToday = ()=> {
        taskListToday = templates.dailyTemplate;
        dailyTasks[today] = taskListToday;
        ipcRenderer.invoke('write-daily-tasks', dailyTasks);
      } 
      const setTaskListTomorrow = ()=> {
        taskListTomorrow = templates.dailyTemplate;
        dailyTasks[tomorrow] = taskListTomorrow;
        ipcRenderer.invoke('write-daily-tasks', dailyTasks);
    } 
      
    taskListToday = dailyTasks[today] || setTaskListToday();
    taskListTomorrow = dailyTasks[tomorrow] || setTaskListTomorrow(); 
    dailyTemplate = templates.dailyTemplate;
      
    renderTasks(dailyTemplate, 'taskList');
    renderTasks(taskListToday, 'todayTaskList');
    renderTasks(taskListTomorrow, 'tomorrowTaskList');
    renderToDo(taskListToday);

    templateDailyAddTaskBtn.addEventListener('click', ()=> {
      addTaskToTemplate(dailyTemplate, 'taskList');
    });
    todayTaskListAddTaskBtn.addEventListener('click', () => {
      addTaskToTemplate( taskListToday , 'todayTaskList');
    });
    tomorrowTaskListAddTaskBtn.addEventListener('click', () => {
      addTaskToTemplate( taskListTomorrow, 'tomorrowTaskList');
    });
    }