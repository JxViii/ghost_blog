/*
  Web recreation of the Zhonyal Swing chrono ( ui/pages/Chrono.java ).
  Keeps the same model: a Session holds Splits, each Split is a STUDY / PAUSE
  stretch of time. The ticker refreshes total + current split every second.
*/

const TYPE = {
  STUDY: "STUDY",
  PAUSE: "PAUSE",
};

/* Theme.java ( cat version, the one the gif uses ) */
const COLORS = {
  total: "#fff9d2",           // cat_LILA
  [TYPE.STUDY]: "#f6c83b",    // cat_GREEN
  [TYPE.PAUSE]: "#da5771",    // cat_RED
};

const LABELS = {
  [TYPE.STUDY]: "STUDY",
  [TYPE.PAUSE]: "PAUSE",
};

/* helpers/Split.java */
class Split {

  constructor(n, type){
    this.type = type;
    this.title = `Split #${n}`;
    this.start = Date.now();
    this.end = null;
  }

  getDuration(){
    return (this.end ?? Date.now()) - this.start;
  }

  getColor(){
    return COLORS[this.type];
  }

  stop(){
    this.end = Date.now();
  }
}

/* helpers/Session.java */
class Session {

  constructor(title){
    this.title = title;
    this.nextSplit = TYPE.STUDY;
    this.n = 0;
    this.splits = [];
    this.isRunning = false;
    this.start = null;
    this.end = null;
    this.current = null;
  }

  startSession(){
    this.start = Date.now();
    this.end = null;
    this.isRunning = true;

    this.current = new Split(++this.n, this.nextSplit);
    this.splits.push(this.current);
  }

  stop(){
    if(!this.isRunning) return;

    this.current.stop();
    this.end = Date.now();
    this.isRunning = false;
  }

  changeSplits(){
    if(!this.isRunning) return;

    this.current.stop();
    this.nextSplit = this.nextSplit === TYPE.STUDY ? TYPE.PAUSE : TYPE.STUDY;

    this.current = new Split(++this.n, this.nextSplit);
    this.splits.push(this.current);
  }

  getTotalTime(){
    if(this.start == null) return 0;
    return (this.end ?? Date.now()) - this.start;
  }

  getTimeOf(type){
    return this.splits
      .filter(s => s.type === type)
      .reduce((acc, s) => acc + s.getDuration(), 0);
  }

  getFocusRate(){
    const total = this.getTotalTime();
    if(total === 0) return 0;
    return this.getTimeOf(TYPE.STUDY) / total * 100;
  }
}

/* Chrono.fmt() -> h:mm:ss once past the hour, mm:ss before that */
function fmt(ms){

  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const pad = (v) => String(v).padStart(2, "0");

  return h > 0
    ? `${h}:${pad(m)}:${pad(sec)}`
    : `${pad(m)}:${pad(sec)}`;
}

function clockTime(ms){
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ui/pages/Chrono.java */
class Chrono {

  constructor(root, session){

    this.root = root;
    this.session = session;
    this.isCollapsed = false;
    this.ticker = null;

    this.title = root.querySelector(".crono__title");
    this.startDate = root.querySelector(".crono__start");
    this.endDate = root.querySelector(".crono__end");

    this.totalTime = root.querySelector(".crono__times .total");
    this.splitTime = root.querySelector(".crono__times .split");
    this.splitType = root.querySelector(".crono__times .type");

    this.collapseBtn = root.querySelector(".crono__btn.collapse");
    this.swapBtn = root.querySelector(".crono__btn.swap");
    this.stopBtn = root.querySelector(".crono__btn.close");

    this.bindButtons();
  }

  bindButtons(){

    this.collapseBtn.addEventListener("click", () => {
      this.isCollapsed ? this.restore() : this.collapse();
    });

    this.swapBtn.addEventListener("click", () => {

      this.session.changeSplits();

      const split = this.session.current;
      if(!split) return;

      this.splitType.textContent = LABELS[split.type];
      this.splitTime.style.color = split.getColor();
      this.splitTime.textContent = "+ 00:00";
    });

    this.stopBtn.addEventListener("click", () => this.stop());

    /* the Swing window is disposed on stop, here the card just freezes:
       clicking it again runs a new session */
    this.root.addEventListener("click", (e) => {
      if(!this.root.classList.contains("is-stopped")) return;
      if(e.target.closest(".crono__btn")) return;
      this.start();
    });
  }

  start(){

    this.session = new Session(this.session.title);
    this.session.startSession();

    this.root.classList.remove("is-stopped");
    this.startDate.textContent = clockTime(this.session.start);
    this.title.textContent = this.session.title;

    this.splitType.textContent = LABELS[this.session.current.type];
    this.splitTime.style.color = this.session.current.getColor();
    this.totalTime.style.color = COLORS.total;

    this.render();

    clearInterval(this.ticker);
    this.ticker = setInterval(() => this.render(), 1000);
  }

  render(){

    const total = fmt(this.session.getTotalTime());

    this.totalTime.textContent = total;
    this.splitTime.textContent = `+ ${fmt(this.session.current.getDuration())}`;
    this.endDate.textContent = clockTime(Date.now());

    /* Chrono.moveCatAtHour() : the digits shift left once they grow past mm:ss
       so they don't run under the cat */
    this.root.classList.toggle("is-hour", total.length === 7);
    this.root.classList.toggle("is-hours", total.length >= 8);
  }

  collapse(){
    this.isCollapsed = true;
    this.root.classList.add("is-collapsed");
  }

  restore(){
    this.isCollapsed = false;
    this.root.classList.remove("is-collapsed");
  }

  stop(){
    clearInterval(this.ticker);
    this.ticker = null;

    this.session.stop();
    this.render();

    this.root.classList.add("is-stopped");
    this.root.classList.remove("is-collapsed");
    this.isCollapsed = false;
  }

  stopTicker(){
    clearInterval(this.ticker);
    this.ticker = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const root = document.querySelector(".crono");
  if(!root) return;

  const session = new Session("Zhonyal Crono");
  const chrono = new Chrono(root, session);

  /* only run while the widget is on screen, no point ticking off-view */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting && !chrono.session.isRunning && !root.classList.contains("is-stopped")){
        chrono.start();
      }
    })
  }, { threshold: .3 });

  observer.observe(root);
});
