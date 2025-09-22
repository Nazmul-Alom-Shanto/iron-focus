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