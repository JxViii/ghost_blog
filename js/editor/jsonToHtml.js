
export default{

  methods: {

    makeParagraph(obj) {
        return `
          <p class="blog-post-text">
            ${obj.data.text}
          </p>
        `
    },

    makeHeading(obj) {
        return `
          <h${obj.data.level} class="blog-post-heading">
            ${obj.data.text}
          </h${obj.data.level}
        `
    },

    makeList(obj) {

      const type = (obj.data.style === "unordered") ? "u" : "o";

      const list = obj.data.items.map( item => {
        return `
          <li class="blog-post-li">
            ${item.content}
          </li>
        `
      });

      return `
        <${type}l>
          ${list.join('')}
        </${type}l>
      `
    },

    makeCode(obj) {

    },

    makeDelimiter(obj) {

    },

    makeImage(obj) {

    },

    makeFile(obj) {

    }

  }

}