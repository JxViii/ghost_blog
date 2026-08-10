import { getWildRiftAnalysis } from "./api/wild-rift.js"

const sheetGrid = document.querySelector(".wr-sheet-grid");

function clearSheets() {
  sheetGrid.innerHTML = "";
}

function createSheet(file) {
  return `
    <a class="wr-sheet" href="${file.webViewLink}" target="_blank" rel="noopener noreferrer">
      <img src="/icons/xls.png" alt="Sheets Icon">
      <div class="wr-sheet-info">
        <h3>${file.name}</h3>
      </div>
    </a>`;
}

function renderSheets(files) {
  clearSheets();

  if (!files.length) {
    sheetGrid.innerHTML = `<p class="blog-empty">No analysis found.</p>`;
    return;
  }

  const sheets = files.map(createSheet).join("");
  sheetGrid.insertAdjacentHTML("beforeend", sheets);
}

const main = async () => {
  const files = await getWildRiftAnalysis();
  if (!files) {
    console.log("Couldn't load the champ analysis");
    sheetGrid.innerHTML = `<p class="blog-empty">Could not load analysis.</p>`;
    return;
  }

  renderSheets(files);
}

main();
