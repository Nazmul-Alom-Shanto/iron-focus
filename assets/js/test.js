function makeTagTreeFormHistory1(){
    // const logs = await readLogs();
    const logs = [
  { tags: ["study", "physics"] },
  { tags: ["study", "math", "algebra"] },
  { tags: ["work", "js"] },
  { tags: ["work", "design"] },
  { tags: ["study", "math", "calculus"] },
  { tags: ["bro hey"] }
];

    console.log(Array.isArray(logs));
    console.log('it is log from fun ', JSON.stringify(logs));
    const tagTree = {};
    logs.forEach(log => {
      let currLevel = tagTree;
      const tags = log.tags;
      console.log(tags ? "tag is not falsy" : "tag is falsy");
      tags?.forEach(tag => {
        if(!currLevel[tag]){
          currLevel[tag] = {};
        }
        currLevel = currLevel[tag];
      });
    });
    return tagTree;
}