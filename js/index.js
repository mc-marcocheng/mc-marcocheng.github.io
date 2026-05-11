import { hobbies } from "./data/hobbies.js";
import { works } from "./data/works.js";
import { blogs } from "./data/blogs.js";
import { createHobbyCard, createWorkCard, createBlogCard } from "./components.js";

// Render content first
const hobbiesContainer = document.getElementById("hobbies-container");
if (hobbiesContainer) {
    hobbiesContainer.innerHTML = hobbies.map(createHobbyCard).join("");
}

const worksContainer = document.getElementById("works-container");
if (worksContainer) {
    worksContainer.innerHTML = works.map(createWorkCard).join("");
}

const blogsContainer = document.getElementById("blogs-container");
if (blogsContainer) {
    blogsContainer.innerHTML = blogs.map(createBlogCard).join("");
}

// initialization

const RESPONSIVE_WIDTH = 1024;

let isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH;
const collapseBtn = document.getElementById("collapse-btn");
const collapseHeaderItems = document.getElementById("collapsed-header-items");

const pagesDropdownBtn = document.getElementById("pages-dropdown-btn");
const pagesDropdownMenu = document.getElementById("pages-dropdown-menu");

let isPagesDropdownOpen = false;

if (pagesDropdownBtn && pagesDropdownMenu) {
    gsap.set(pagesDropdownMenu, { autoAlpha: 0, y: -10, display: "none" });
    pagesDropdownMenu.classList.remove("tw-hidden");

    pagesDropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isPagesDropdownOpen = !isPagesDropdownOpen;

        if (isPagesDropdownOpen) {
            gsap.to(pagesDropdownMenu, {
                autoAlpha: 1,
                y: 0,
                duration: 0.2,
                display: "flex",
                ease: "power2.out",
            });
        } else {
            gsap.to(pagesDropdownMenu, {
                autoAlpha: 0,
                y: -10,
                duration: 0.2,
                display: "none",
                ease: "power2.in",
            });
        }
    });

    window.addEventListener("click", (e) => {
        if (isPagesDropdownOpen && !pagesDropdownMenu.contains(e.target)) {
            isPagesDropdownOpen = false;
            gsap.to(pagesDropdownMenu, {
                autoAlpha: 0,
                y: -10,
                duration: 0.2,
                display: "none",
                ease: "power2.in",
            });
        }
    });
}

function onHeaderClickOutside(e) {
    if (collapseHeaderItems && !collapseHeaderItems.contains(e.target)) {
        toggleHeader();
    }
}

function toggleHeader() {
    if (!collapseHeaderItems || !collapseBtn) return;

    if (isHeaderCollapsed) {
        collapseHeaderItems.classList.add("opacity-100");
        collapseHeaderItems.style.width = "60vw";
        collapseBtn.classList.remove("bi-list");
        collapseBtn.classList.add("bi-x", "max-lg:tw-fixed");
        isHeaderCollapsed = false;

        window.addEventListener("click", onHeaderClickOutside);
    } else {
        collapseHeaderItems.classList.remove("opacity-100");
        collapseHeaderItems.style.width = "0vw";
        collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed");
        collapseBtn.classList.add("bi-list");
        isHeaderCollapsed = true;
        window.removeEventListener("click", onHeaderClickOutside);
    }
}

// Set up event listeners
if (collapseBtn) {
    collapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleHeader();
    });
}

function responsive() {
    if (window.innerWidth > RESPONSIVE_WIDTH && collapseHeaderItems) {
        collapseHeaderItems.style.width = "";
    } else {
        isHeaderCollapsed = true;
    }
}

window.addEventListener("resize", responsive);

/**
 * Animations
 */

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
    // animate from initial position (defined in CSS with opacity: 0)
    gsap.to(".reveal-hero-text", {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        stagger: 0.3,
    });

    gsap.to(".reveal-hero-img", {
        opacity: 1,
        y: "0%",
        duration: 0.8,
    });

    // reveal section animations
    const sections = gsap.utils.toArray("section");

    sections.forEach((sec) => {
        const revealUptimeline = gsap.timeline({
            paused: true,
            scrollTrigger: {
                trigger: sec,
                start: "10% 80%",
                end: "20% 90%",
            },
        });

        revealUptimeline.to(sec.querySelectorAll(".reveal-up"), {
            opacity: 1,
            duration: 0.8,
            y: "0%",
            stagger: 0.2,
        });
    });
});
