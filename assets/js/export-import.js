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
  
