function renderToDo(template){
    const taskStartTemplateContainer = document.getElementById('task-start-template-container');
    template.forEach(task => {
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
};

