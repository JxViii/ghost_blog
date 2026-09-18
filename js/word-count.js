/*
  Shared word counting for the editor footer and the public post.
  Both sides must agree, so the rules live here and only here:

  counted    -> paragraph, header, list, quote, ghost quote, table
  not counted -> code, image captions, attached files, delimiters, embeds
*/

const WORDS_PER_MINUTE = 200;

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const countWords = (text) => {
  if (!text) return 0;
  return (text.replace(/\u00a0/g, " ").match(/[^\s]+/g) || []).length;
};

export const readingTime = (words) => Math.max(1, Math.round(words / WORDS_PER_MINUTE));

export const formatWords = (words) =>
  `${words.toLocaleString("en-US")} ${ (words === 1) ? "word" : "words" }`;

export const formatReadingTime = (words) =>
  (words === 0) ? "" : `${readingTime(words)} min read`;

// Text of a single Editor.js block, before tags are stripped.
const blockText = (block) => {

  const data = block?.data;
  if (!data) return "";

  switch (block.type) {

    case "paragraph":
    case "header":
      return data.text || "";

    case "list":
      return (data.items || []).map( item => item?.content ?? item ?? "" ).join(" ");

    case "quote":
      return `${data.text || ""} ${data.caption || ""}`;

    case "ghostQuote":
      return data.text || "";

    case "table":
      return (data.content || []).flat().join(" ");

    default:
      return "";
  }

};

export const countBlock = (block) => countWords(stripHtml(blockText(block)));

export const countBlocks = (blocks) =>
  (blocks || []).reduce( (total, block) => total + countBlock(block), 0);

// Same rules, but applied to already rendered post HTML.
const IGNORED_SELECTOR = [
  ".blog-post-code",
  ".blog-post-image-caption",
  ".blog-post-file",
  ".blog-post-delimiter",
  ".blog-post-embed"
].join(", ");

export const countRendered = (element) => {

  if (!element) return 0;

  const clone = element.cloneNode(true);
  clone.querySelectorAll(IGNORED_SELECTOR).forEach( node => node.remove() );

  return countWords(clone.textContent);

};
