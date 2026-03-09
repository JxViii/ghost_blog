import { uploadFile } from "./api.js";

class GhostQuoteTool {
  static get toolbox() {
    return {
      title: "Ghost Quote",
      icon: ":)"
    };
  }

  constructor({ data }) {
    this.data = data || {
      text: "",
      caption: ""
    };
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.className = "ce-ghost-quote";

    const text = document.createElement("div");
    text.className = "ce-ghost-quote__text";
    text.contentEditable = true;
    text.dataset.placeholder = "Enter a quote";
    text.innerHTML = this.data.text || "";

    wrapper.appendChild(text);

    return wrapper;
  }

  save(blockContent) {
    return {
      text: blockContent.querySelector(".ce-ghost-quote__text")?.innerHTML || ""
    };
  }
}


function replaceToolbarSVG(){

  const toolBar = document.querySelector(".ce-toolbar__plus");
  if(!toolBar) return;

  console.log("+");

  toolBar.innerHTML = `
    <div class="plus-icon">+</div>
  `

}

const editor = new EditorJS({
  holder: "editorjs",
  tools: {
    header: Header,
    list: {
      class: EditorjsList,
      inlineToolbar: true
    },
    image: {
      class: ImageTool,
      config: {
        endpoints:{
          byFile: '/.netlify/functions/postImage'
        }
      }
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: "Enter a quote",
        captionPlaceholder: "Quote's author"
      }
    },
    ghostQuote: {
      class: GhostQuoteTool,
      inlineToolbar: true
    },
    embed: {
      class: Embed,
      inlineToolbar: true,
      config: {
        services: {
          youtube: true,
          coub: true,
          codepen: true,
        },
      },
    }
  },
  onReady: () => {
    replaceToolbarSVG();
    document.querySelector(".codex-editor").setAttribute("spellcheck", "false");
  }
});


