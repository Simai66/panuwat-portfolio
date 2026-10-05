// =====================================================
// main.js — สคริปต์ของเว็บพอร์ต
//
// ส่วน A (vanilla JS ล้วน — ทำงานเสมอ):
//   1. เมนูมือถือ  2. navbar เปลี่ยนพื้นหลังตอน scroll
//   3. ไฮไลต์เมนูตาม section  4. ปุ่ม to-top + ปีใน footer
//
// ส่วน B (Motion — ทีมเดียวกับ Framer Motion รุ่น vanilla):
//   5. Hero stagger ตอนเปิดหน้า  6. section fade+slide ครั้งแรก
//   7. Skills stagger  8. รูปโปรไฟล์ scale-in
//
// กฎ timing: duration 0.4–0.7s / stagger 0.08–0.15s / easeOut
// ถ้าเปิด prefers-reduced-motion หรือโหลด Motion ไม่ได้
// → ข้าม animation ทั้งหมด เนื้อหายังแสดงครบเหมือนเดิม
// =====================================================

// ---------- ตั้งค่ากลาง ----------
const EASE = [0.22, 1, 0.36, 1]; // easeOut นุ่มๆ (ไม่เด้ง)
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasMotion = typeof window.Motion !== "undefined" && !reducedMotion;

// ---------- 1. เมนูมือถือ ----------
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ---------- 2 + 3 + 4. scroll: navbar / เมนู active / ปุ่ม top ----------
const navbar = document.getElementById("navbar");
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-link");
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  navbar.classList.toggle("scrolled", y > 10); // พื้นหลังเปลี่ยนนุ่มๆ ด้วย CSS transition

  let current = "";
  sections.forEach((sec) => {
    if (y >= sec.offsetTop - 120) current = sec.id;
  });
  navItems.forEach((item) => {
    item.classList.toggle("active", item.getAttribute("href") === "#" + current);
  });

  toTop.classList.toggle("show", y > 500);
}, { passive: true });

toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
document.getElementById("year").textContent = new Date().getFullYear();

// =====================================================
// ส่วน B — Animation ด้วย Motion (เล่นเฉพาะครั้งแรก)
// =====================================================
if (hasMotion) {
  const { animate, stagger } = window.Motion;

  // ซ่อน element ไว้ก่อน (ทำใน JS เพื่อให้ไม่มี-JS/CDN-พังก็ยังเห็นเนื้อหา)
  const hide = (els) => els.forEach((el) => { el.style.opacity = "0"; });
  const fadeUp = (els, extra = {}) =>
    animate(
      els,
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.6, ease: EASE, ...extra }
    );

  // ---------- 5. Hero: stagger ทีละบรรทัดตอนเปิดหน้า ----------
  const heroItems = Array.from(document.querySelectorAll(".hero-text > *"));
  hide(heroItems);
  fadeUp(heroItems, { delay: stagger(0.12, { startDelay: 0.1 }) });

  // ---------- 8. รูปโปรไฟล์: scale-in เบาๆ พร้อม hero ----------
  const heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto) {
    heroPhoto.style.opacity = "0";
    animate(
      heroPhoto,
      { opacity: [0, 1], scale: [0.96, 1] },
      { duration: 0.7, ease: EASE, delay: 0.25 }
    );
  }

  // ---------- 6 + 7. ทุก section: fade+slide ครั้งแรกที่เข้ามา ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sec = entry.target;
        io.unobserve(sec); // เล่นครั้งเดียวพอ

        // หัวข้อ + การ์ดใน section นี้ ค่อยๆ ขึ้นทีละชิ้น
        const items = sec.querySelectorAll(".section-tag, .section-title, .section-sub, .card");
        hide(Array.from(items));
        fadeUp(Array.from(items), { delay: stagger(0.1) });

        // Skills: ป้าย tag ในแต่ละการ์ด stagger ตามหลังอีกชั้น (ขยับน้อยๆ แค่ 8px)
        if (sec.id === "skills") {
          const tags = sec.querySelectorAll(".tags span");
          hide(Array.from(tags));
          animate(
            Array.from(tags),
            { opacity: [0, 1], y: [8, 0] },
            { duration: 0.4, ease: EASE, delay: stagger(0.06, { startDelay: 0.3 }) }
          );
        }
      });
    },
    { threshold: 0.15 }
  );

  // สังเกตทุก section ยกเว้น hero (hero เล่นตั้งแต่เปิดหน้าแล้ว)
  document.querySelectorAll("section:not(.hero)").forEach((sec) => io.observe(sec));
}
