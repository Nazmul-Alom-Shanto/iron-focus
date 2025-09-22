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

let dummytagTree = {
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


async function makeTagTreeFormHistory(){
    const logs = await readLogs();
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

let taskStartTagInputSuggestor;
let taskSaveTagInputSuggestor;
let settingsTemplateTagInputSuggestor;
let todayTaskListTagInputSuggestor;
let tomorrowTaskListTagInputSuggestor;


makeTagTreeFormHistory().then((dummytagTree)=> {
  
taskStartTagInputSuggestor = new TagInput(
   taskStartTagsContainer,
  dummytagTree,
  []
);
taskSaveTagInputSuggestor = new TagInput(
  taskSaveTagsContainer,
  dummytagTree,
  []
);
settingsTemplateTagInputSuggestor = new TagInput(
  settingsTemplateTagsContainer,
  dummytagTree,
  []
);
todayTaskListTagInputSuggestor = new TagInput(
  todayTaskListTagsContainer,
  dummytagTree,
  []
);
tomorrowTaskListTagInputSuggestor = new TagInput(
  tomorrowTaskListTagsContainer,
  dummytagTree,
  []
);

});
 