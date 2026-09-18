import { countBlock, countWords, formatWords } from "/js/word-count.js";

const wordCount = document.querySelector(".word-count");

// blockId -> word count, so a keystroke only recounts the block being typed in.
const counts = new Map();

const total = () => [...counts.values()].reduce( (sum, n) => sum + n, 0);

const render = () => {

  if (!wordCount) return;

  const selected = window.getSelection()?.toString() ?? "";
  const selectedWords = countWords(selected);

  wordCount.textContent = (selectedWords > 0)
    ? `${selectedWords.toLocaleString("en-US")} of ${total().toLocaleString("en-US")} words`
    : formatWords(total());

};

// Full recount, used on load and after render()/clear() swaps the whole document.
export const syncWordCount = async (editor) => {

  await editor.isReady;

  const { blocks } = await editor.save();

  counts.clear();
  blocks.forEach( block => counts.set(block.id, countBlock(block)) );

  render();

};

let timer = null;

export const watchWordCount = (editor) => {

  syncWordCount(editor);

  document.addEventListener("selectionchange", render);

  return (api, event) => {

    clearTimeout(timer);

    timer = setTimeout( async () => {

      const events = Array.isArray(event) ? event : [event];
      const ids = new Set();

      for (const e of events) {

        const id = e?.detail?.target?.id;

        // A removed block can no longer be read back, and a move changes nothing.
        if (e?.type === "block-removed") {
          counts.delete(id);
          continue;
        }

        if (id) ids.add(id);

      }

      // No usable ids (batch paste, undo, tool swap) -> recount everything.
      if (ids.size === 0) return syncWordCount(editor);

      for (const id of ids) {

        const blockApi = api.blocks.getById(id);

        if (!blockApi) {
          counts.delete(id);
          continue;
        }

        try {
          const saved = await blockApi.save();
          // BlockAPI.save() names the tool "tool"; editor.save() calls it "type".
          counts.set(id, countBlock({ type: blockApi.name, data: saved?.data }));
        } catch {
          return syncWordCount(editor);
        }

      }

      render();

    }, 300);

  };

};
