let activeFilters = [];
let dropPinMode = false;
let currentSearchQuery = "";
let isMapFocused = false; // Tracks if mobile user is looking at the map or the list
let isHeaderCollapsed = false;

// Pagination State
let currentPage = 1;
const itemsPerPage = 8;
let currentFilteredData = [];

function initCollapsibleHeader() {
    const header = document.querySelector("#search-aside .border-b");
    const title = header.querySelector("h1");

    // Add collapsible functionality on ANY short screen (regardless of width)
    function checkAndToggleCollapsible() {
        const isShortScreen = window.innerHeight <= 600; // Removed width constraint
        const existingToggle = title.querySelector(".header-toggle");

        if (isShortScreen && !existingToggle) {
            // Add collapse toggle button
            const toggleBtn = document.createElement("button");
            toggleBtn.innerHTML = "▼";
            toggleBtn.className =
                "header-toggle ml-2 text-sm opacity-60 hover:opacity-100 transition-all duration-200 transform hover:scale-110";
            toggleBtn.title = "收合搜尋選項";

            toggleBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleHeaderCollapse();
            };

            // Add keyboard support
            toggleBtn.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleHeaderCollapse();
                }
            };
            toggleBtn.tabIndex = 0;

            title.appendChild(toggleBtn);
        } else if (!isShortScreen && existingToggle) {
            // Remove toggle button and expand header if not on short screen
            existingToggle.remove();
            if (isHeaderCollapsed) {
                expandHeader();
            }
        }
    }

    // Initial check
    checkAndToggleCollapsible();

    // Check on window resize
    window.addEventListener("resize", checkAndToggleCollapsible);
}

function toggleHeaderCollapse() {
    if (isHeaderCollapsed) {
        expandHeader();
    } else {
        collapseHeader();
    }
}

function collapseHeader() {
    const header = document.querySelector("#search-aside .border-b");
    const toggleBtn = header.querySelector(".header-toggle");
    const searchControls = header.querySelector(".space-y-3");
    const filterContainer = header.querySelector("#filter-container");

    // Add collapsed class and hide elements
    header.classList.add("collapsed");
    searchControls.style.display = "none";
    filterContainer.style.display = "none";

    // Update toggle button
    if (toggleBtn) {
        toggleBtn.innerHTML = "▲";
        toggleBtn.title = "展開搜尋選項";
    }

    isHeaderCollapsed = true;

    // Add a subtle animation
    header.style.transition = "padding 0.3s ease";
}

function expandHeader() {
    const header = document.querySelector("#search-aside .border-b");
    const toggleBtn = header.querySelector(".header-toggle");
    const searchControls = header.querySelector(".space-y-3");
    const filterContainer = header.querySelector("#filter-container");

    // Remove collapsed class and show elements
    header.classList.remove("collapsed");
    searchControls.style.display = "block";
    filterContainer.style.display = "flex";

    // Update toggle button
    if (toggleBtn) {
        toggleBtn.innerHTML = "▼";
        toggleBtn.title = "收合搜尋選項";
    }

    isHeaderCollapsed = false;
}

/**
 * Entry point: Initializes data, map, and event listeners
 */
async function start() {
    await fetchParks();
    initMap("map");
    initFilters();
    initCollapsibleHeader();

    const toggleBtn = document.getElementById("mobile-view-toggle");

    // --- Search Logic ---
    document.getElementById("search-input").addEventListener("input", (e) => {
        currentSearchQuery = e.target.value.toLowerCase();
        currentPage = 1; // Reset to page 1 on search
        updateView();
    });

    // --- Geolocation Logic ---
    document.getElementById("btn-geolocate").addEventListener("click", () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                calculateDistances(pos.coords.latitude, pos.coords.longitude);
                updateLocationMarker(pos.coords.latitude, pos.coords.longitude);
                currentPage = 1; // Reset to page 1 after sort
                updateView();

                // If on mobile, stay on list to see the results
                isMapFocused = false;
                updateMobileVisibility();
            },
            (error) => {
                console.error("Geolocation failed:", error);
                alert("無法獲取位置。請檢查瀏覽器權限。");
            }
        );
    });

    // --- Mobile View Toggle Logic ---
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            isMapFocused = !isMapFocused;
            updateMobileVisibility();
        });
    }

    // --- Drop Pin Mode Logic ---
    document.getElementById("btn-drop-pin").addEventListener("click", () => {
        dropPinMode = true;
        isMapFocused = true; // Auto-hide the search panel on mobile to show the map
        updateMobileVisibility();

        document.getElementById("map").classList.add("cursor-crosshair");
        const indicator = document.getElementById("pin-indicator");
        indicator.classList.remove("opacity-0", "translate-y-[-20px]");
        indicator.classList.add("opacity-100", "translate-y-0");
    });

    // --- Map Click Logic (for Drop Pin) ---
    map.on("click", (e) => {
        if (!dropPinMode) return;

        calculateDistances(e.latlng.lat, e.latlng.lng);
        updateLocationMarker(e.latlng.lat, e.latlng.lng);
        currentPage = 1;
        updateView();

        // Exit drop pin mode and slide the search panel back up
        dropPinMode = false;
        isMapFocused = false;
        updateMobileVisibility();

        document.getElementById("map").classList.remove("cursor-crosshair");
        const indicator = document.getElementById("pin-indicator");
        indicator.classList.add("opacity-0", "translate-y-[-20px]");
        indicator.classList.remove("opacity-100", "translate-y-0");
    });

    updateView();
}

/**
 * Handles sliding the panel in/out on mobile and updating button text
 */
function updateMobileVisibility() {
    const aside = document.getElementById("search-aside");
    const toggleText = document.getElementById("toggle-text");
    const toggleIcon = document.getElementById("toggle-icon");
    const toggleBtn = document.getElementById("mobile-view-toggle");

    // Only proceed with toggle logic if we are on mobile
    if (window.innerWidth < 768) {
        if (isMapFocused) {
            aside.classList.add("panel-hidden");
            toggleText.innerText = "查看列表";
            toggleIcon.innerText = "📋";
            toggleBtn.classList.replace("bg-slate-900/80", "bg-blue-600");
        } else {
            aside.classList.remove("panel-hidden");
            toggleText.innerText = "查看地圖";
            toggleIcon.innerText = "🗺️";
            toggleBtn.classList.replace("bg-blue-600", "bg-slate-900/80");
        }
    } else {
        // Desktop cleanup: Ensure class is removed if user resizes window
        aside.classList.remove("panel-hidden");
        isMapFocused = false;
    }
}

// Add a resize listener to handle window snapping
window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
        const aside = document.getElementById("search-aside");
        aside.classList.remove("panel-hidden");
        // Reset map focus state for desktop
        isMapFocused = false;
    }
});

/**
 * Populates the filter pill container based on dictionary keys
 */
function initFilters() {
    const container = document.getElementById("filter-container");
    const filterTypes = Object.keys(equipmentDict);

    container.innerHTML = filterTypes
        .map(
            (type) =>
                `<button class="filter-pill" data-value="${type}">${getEquipmentName(type)}</button>`
        )
        .join("");

    // Add event listeners for filter pills
    document.querySelectorAll(".filter-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
            pill.classList.toggle("active");
            const val = pill.dataset.value;
            activeFilters = pill.classList.contains("active")
                ? [...activeFilters, val]
                : activeFilters.filter((f) => f !== val);
            currentPage = 1; // Reset on filter change
            updateView();
        });
    });

    // Wait for DOM to render, then check for overflow
    setTimeout(() => {
        setupFilterCollapse();
    }, 0);
}

function setupFilterCollapse() {
    const container = document.getElementById("filter-container");
    const wrapper = document.getElementById("filter-container-wrapper");
    container.classList.remove("collapsed");
    // Remove existing button if any
    const existingBtn = wrapper.querySelector(".show-more-btn");
    if (existingBtn) existingBtn.remove();

    // Calculate if more than 1 line
    const pills = Array.from(container.querySelectorAll(".filter-pill"));
    if (pills.length === 0) return;

    // Get the top offset of the first pill
    const firstTop = pills[0].offsetTop;
    let rowCount = 1;
    let lastTop = firstTop;
    for (let i = 1; i < pills.length; i++) {
        if (pills[i].offsetTop !== lastTop) {
            rowCount++;
            lastTop = pills[i].offsetTop;
            if (rowCount === 2) break;
        }
    }

    if (rowCount > 1) {
        container.classList.add("collapsed");
        // Add toggle button OUTSIDE the collapsed container, to the right
        const btn = document.createElement("button");
        btn.className = "show-more-btn";
        btn.title = "顯示更多/收合篩選器材";
        btn.innerHTML = `
            <svg class="icon-chevron" style="transition:transform 0.2s;" width="18" height="18" viewBox
            ="0 0 20 20" fill="none">
            <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        btn.onclick = () => {
            if (container.classList.contains("collapsed")) {
                container.classList.remove("collapsed");
                btn.querySelector(".icon-chevron").style.transform = "rotate(180deg)";
            } else {
                container.classList.add("collapsed");
                btn.querySelector(".icon-chevron").style.transform = "rotate(0deg)";
            }
        };
        wrapper.appendChild(btn);
    }
}

// Re-check on window resize
window.addEventListener("resize", () => {
    setupFilterCollapse();
});

/**
 * Filters the master parksData and triggers UI re-renders
 */
function updateView() {
    currentFilteredData = parksData.filter((p) => {
        const districtEn = p.district?.en?.toLowerCase() || "";
        const districtZh = p.district?.zh?.toLowerCase() || "";
        const nameEn = p.name?.en?.toLowerCase() || "";
        const nameZh = p.name?.zh?.toLowerCase() || "";

        const matchesSearch =
            nameZh.includes(currentSearchQuery) ||
            nameEn.includes(currentSearchQuery) ||
            districtZh.includes(currentSearchQuery) ||
            districtEn.includes(currentSearchQuery);

        const matchesFilter =
            activeFilters.length === 0 ||
            (p.equipment && p.equipment.some((e) => activeFilters.includes(e.type)));

        return matchesSearch && matchesFilter;
    });

    // Pagination Calculation
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = currentFilteredData.slice(startIndex, startIndex + itemsPerPage);

    // Render components
    renderList(paginatedData);
    renderPagination(currentFilteredData.length);
    renderMarkers(currentFilteredData);
}

/**
 * Handles page increment/decrement
 */
function changePage(delta) {
    const maxPage = Math.ceil(currentFilteredData.length / itemsPerPage);
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > maxPage) currentPage = maxPage;
    updateView();

    // Scroll list back to top on page change
    document.getElementById("park-list").scrollTo({ top: 0, behavior: "smooth" });
}

// Start the engine
start();
