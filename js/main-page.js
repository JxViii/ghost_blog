
document.addEventListener("DOMContentLoaded", () => {

  gsap.registerPlugin(ScrollTrigger)

  const lenis = new Lenis();

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  gsap.defaults({
    ease: "power3.InOut",
  })

  const isMobile = window.innerWidth <= 480;

  const isQuiteSmall = window.innerWidth <= 700;

  function initSectionTrack() {

    const sections = gsap.utils.toArray(document.querySelectorAll("section"));

    console.log(sections);

    sections.forEach(sec => {

      ScrollTrigger.create({
        trigger: sec,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            console.log(sec.dataset.section);
            document.querySelector(".section").textContent =
              sec.dataset.section;
          }
        }
      })

    })
  }

  function initWebsiteBar() {

    const header = document.querySelector("header");
    const pb = document.getElementById("pb");
    const bar = document.querySelector(".pb-bar");

    const state = { progress: 0 };

    const colorHeader = () => {

      if (state.progress <= 33) header.style.setProperty('--color-accent', "var(--hl-cyan)");
      else if (state.progress <= 67) header.style.setProperty('--color-accent', "var(--hl-green)");
      else header.style.setProperty('--color-accent', "var(--hl-pink)");

    }

    const render = () => {

      pb.textContent = Math.round(state.progress);
      bar.style.width = state.progress + "%";
      colorHeader();

    }

    const update = () => {

      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);

      state.progress = gsap.utils.clamp(0, 100, (window.scrollY / max) * 100);
      render();

    }

    lenis.on('scroll', update);
    ScrollTrigger.addEventListener("refresh", update);
    window.addEventListener("resize", update);
    window.addEventListener("load", () => ScrollTrigger.refresh());

    update();

  }

  function initIntroScroll() {

    const introSection = document.querySelector(".intro");
    const introTitleEl = document.querySelector(".intro-title");
    const introShow = introTitleEl.querySelector("h2");
    const titles = gsap.utils.toArray(document.querySelectorAll(".intro-title h1 span"));

    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: introSection,
        pin: introSection,
        start: "top top",
        end: "+=2500",
        scrub: 1,
        refreshPriority: 1,
      }
    })

    tl.to(introTitleEl, { duration: 4 });

    titles.forEach((title, i) => {
      tl.to(title, {
        x: (i % 2 === 0) ? -800 : 800,
        opacity: 0,
        duration: 7,
        ease: "power2.Out",
      })
    });

    tl.to(introShow, { y: isMobile ? -100 : -200, scale: 1.5, duration: 3 })
    tl.to(introShow, { duration: 10 });
    tl.to(introShow, { opacity: 0, duration: 2 });
    tl.to(introShow, { duration: 3 });
  }

  function initAboutScroll() {

    const aboutSection = document.querySelector(".about");
    const aboutEl = document.querySelector(".about-wrapper");
    const aboutTitle = aboutEl.querySelector("h2");
    const aboutCards = gsap.utils.toArray(aboutEl.querySelectorAll("p"));

    if (isQuiteSmall) return;

    const tl = gsap.timeline({
      paused: true,
      scrollTrigger: {
        trigger: aboutSection,
        pin: aboutSection,
        start: "top top",
        end: "+=5000",
        scrub: 1,
        refreshPriority: 1,
      }
    })

    tl.to(aboutEl, { duration: 2 });

    tl.from(aboutTitle, {
      x: -200,
      opacity: 0,
      duration: 4,
    })

    const COLORS_ABOUT = [
      "var(--hl-green)",
      "var(--hl-cyan)",
      "var(--hl-pink)"
    ]

    const COLORS_ABOUT_DESC = [
      "var(--dl-green)",
      "var(--dl-cyan)",
      "var(--dl-pink)"
    ]

    aboutCards.forEach((card, i) => {

      tl.from(card, {
        x: 400,
        opacity: 0,
        duration: 15,
        onUpdate: (self) => {
          aboutEl.style.setProperty("--color-accent", `${COLORS_ABOUT[i]}`);
          aboutEl.style.setProperty("--about-color", `${COLORS_ABOUT_DESC[i]}`);
        }
      })

      tl.to(card, { duration: 25 })

      tl.to(card, {
        y: 50,
        opacity: 0,
        duration: 8,
        onUpdate: (self) => {
          aboutEl.style.setProperty("--color-accent", `${COLORS_ABOUT[i]}`);
          aboutEl.style.setProperty("--about-color", `${COLORS_ABOUT_DESC[i]}`);
        }
      })
    });

    tl.to(aboutTitle, { x: -200, opacity: 0, duration: 10 });
    tl.to(aboutEl, { duration: 5 });
  }

  initIntroScroll();
  initAboutScroll();
  initSectionTrack();
  initWebsiteBar();

  ScrollTrigger.refresh();

})