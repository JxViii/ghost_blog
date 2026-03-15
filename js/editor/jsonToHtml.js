
export default{

  methods: {

    makeParagraph(obj) {
      return `<p class="blog-post-text">
                ${obj.data.text}
              </p>`
    },

    makeHeading(obj) {
      return `<h${obj.data.level} class="blog-post-heading">
                ${obj.data.text}
              </h${obj.data.level}>`
    },

    makeList(obj) {

      const type = (obj.data.style === "unordered") ? "u" : "o";

      const list = obj.data.items.map( item => {
        return `<li class="blog-post-li">
                  ${item.content}
                </li>`
      });

      return `<${type}l class="blog-post-list">
                ${list.join('')}
              </${type}l>`
    },

    makeCode(obj) {
      return `<div class="blog-post-code">
                <div class="blog-post-code-header">
                  Visual Studio Code VS
                  <div class="blog-post-code-buttons">
                    <button id="minimize">_</button>
                    <button id="full-screen">🗖</button>
                    <button id="close">✖</button>
                  </div>
                </div>
                <textarea class="blog-post-code" readonly>${obj.data.code}</textarea>
              </div>`
    },

    makeDelimiter(obj) {
      return `<div class="blog-post-delimiter">
                * * *
              </div>`
    },

    makeImage(obj) {
      return `<div class="blog-post-image">
              <img src="${obj.data.file.url}" alt="${obj.data.caption}">
              <p class="blog-post-image-caption">${obj.data.caption}</p>
            </div>`
    },

    makeFile(obj) {

      const type = obj.data.file.extension;
      let url = "/images/icons/doc.png";
      let style="";

      switch (type) {

        case "html" || "css" || "js": {
          url = "/images/icons/terminal.png";
          style="filter: invert()";
        }
        
        case "pdf": {
          url = "/images/icons/pdf.png";
        }

        case "xls": {
          url = "/images/icons/xls.png";
        }

      };

      return `<a class="blog-post-file" href="${obj.data.file.url}" download>
                <div class="blog-post-file-grid">
                  <div class="blog-post-file-info">
                    <div class="blog-post-file-icon">
                      <img src="${url}" alt="" style="${style}">
                    </div>
                    <div class="blog-post-file-text">
                      <h3 class="blog-post-file-title">${obj.data.file.title}</h3>
                      <p class="blog-post-file-size">${ (obj.data.file.size / 1024).toFixed(2) } KB</p>
                    </div>
                  </div>
                  <div class="blog-post-file-download">
                    <div class="blog-post-file-hover">
                      Download
                    </div>
                    <img src="/images/icons/download.png" alt="">
                  </div>
                </div>
              </a>`
    },

    makeGhostQuote(obj){
      return `<div class="blog-ghost-quote">
              ${obj.data.text}
            </div>`
    },

    makeEmbed(obj){
      return `<div class="blog-post-embed"><iframe width="700" height="455" src="${obj.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`
    }

  }

}