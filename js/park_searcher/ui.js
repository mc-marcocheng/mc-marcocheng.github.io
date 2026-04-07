// Modal Gallery State
let currentModalImages = [];
let currentImageIndex = 0;

function buildImagePath(parkId, imgName) {
    if (imgName.startsWith("http")) return imgName;
    return `assets/parks/${parkId}/${imgName}`;
}

function renderList(parks) {
    const container = document.getElementById("park-list");

    if (parks.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-sm font-bold text-slate-500">無符合的公園</div>`;
        return;
    }

    container.innerHTML = parks
        .map((p) => {
            const imageSrc =
                p.park_images && p.park_images.length > 0
                    ? buildImagePath(p.id, p.park_images[0])
                    : "https://via.placeholder.com/150?text=No+Image";

            const district =
                p.district && p.district.zh
                    ? p.district.zh
                    : p.district && p.district.en
                      ? p.district.en
                      : "未知";

            return `
            <div class="park-card glass-panel flex cursor-pointer gap-4 rounded-2xl p-3 transition" onclick="openModal('${p.id}')">
                <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 shadow-sm">
                    <img src="${imageSrc}" class="h-full w-full object-cover">
                </div>
                <div class="flex-1 overflow-hidden flex flex-col justify-center">
                    <h3 class="truncate text-base font-black text-slate-800">${p.name.zh || p.name.en}</h3>
                    <p class="truncate text-xs font-semibold text-slate-500">${p.name.en || ""} • ${district}</p>
                    ${p.distance ? `<p class="mt-1 text-xs font-bold text-blue-600">距離 ${p.distance.toFixed(2)} 公里</p>` : ""}
                </div>
            </div>
        `;
        })
        .join("");
}

function renderPagination(totalItems) {
    const container = document.getElementById("pagination");
    const maxPage = Math.ceil(totalItems / itemsPerPage) || 1;

    if (totalItems === 0) {
        container.innerHTML = `<span class="text-xs text-slate-500">0 筆結果</span>`;
        return;
    }

    container.innerHTML = `
        <button onclick="changePage(-1)" class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent" ${currentPage === 1 ? "disabled" : ""}>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <span class="text-xs font-bold text-slate-700">第 ${currentPage} 頁 / 共 ${maxPage} 頁</span>
        <button onclick="changePage(1)" class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent" ${currentPage === maxPage ? "disabled" : ""}>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
    `;
}

function openModal(id) {
    const p = parksData.find((x) => x.id === id);
    if (!p) return;

    const modal = document.getElementById("park-modal");
    const content = document.getElementById("modal-content");

    // Build Gallery: Park Images First
    currentModalImages = [];
    if (p.park_images)
        p.park_images.forEach((img) => currentModalImages.push(buildImagePath(p.id, img)));
    if (p.equipment) {
        p.equipment.forEach((eq) => {
            if (eq.images)
                eq.images.forEach((img) => {
                    const path = buildImagePath(p.id, img);
                    if (!currentModalImages.includes(path)) currentModalImages.push(path);
                });
        });
    }
    if (currentModalImages.length === 0)
        currentModalImages.push("https://via.placeholder.com/800x600?text=No+Image");

    currentImageIndex = 0;

    const district = p.district?.zh || "";
    const address = p.address?.zh || "";

    const equipmentHTML =
        p.equipment && p.equipment.length > 0
            ? p.equipment
                  .map((e) => {
                      const zhName = getEquipmentName(e.type);
                      const firstImg =
                          e.images && e.images.length > 0
                              ? buildImagePath(p.id, e.images[0])
                              : null;
                      const clickAction = firstImg ? `onclick="jumpToImage('${firstImg}')"` : "";
                      return `<button ${clickAction} class="rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm font-extrabold text-blue-900 shadow-sm transition hover:bg-blue-100 text-left">
                ${zhName}
            </button>`;
                  })
                  .join("")
            : `<p class="text-sm text-slate-500">無器材記錄</p>`;

    content.innerHTML = `
        <div class="relative h-80 w-full bg-slate-900 md:h-[450px] overflow-hidden">
            <img id="modal-main-img" src="${currentModalImages[0]}" class="h-full w-full object-cover transition-opacity duration-200">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>

            ${
                currentModalImages.length > 1
                    ? `
                <div class="absolute inset-0 flex items-center justify-between px-4 z-30 pointer-events-none">
                    <button onclick="prevModalImage()" class="pointer-events-auto rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <button onclick="nextModalImage()" class="pointer-events-auto rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition hover:bg-black/60 focus:outline-none">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
                <div class="absolute bottom-6 right-8 z-30 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md" id="modal-img-counter">
                    1 / ${currentModalImages.length}
                </div>
            `
                    : ""
            }

            <div class="absolute bottom-6 left-8 z-20 text-white pr-24">
                <h2 class="text-3xl font-black drop-shadow-xl leading-tight">${p.name.zh || p.name.en}</h2>
                <p class="text-base font-bold opacity-80">${p.name.en || ""}</p>
            </div>
        </div>

        <div class="p-8">
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <p class="text-xl font-black text-slate-800">${district}</p>
                    <p class="text-base font-bold text-slate-600">${address}</p>
                </div>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${p.coords.lat},${p.coords.lng}" target="_blank"
                   class="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl transition hover:bg-blue-700">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    開始導航
                </a>
            </div>

            <div class="mt-10 space-y-6">
                <h4 class="flex items-center gap-2 text-sm font-black text-slate-800">
                    <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    場內器材
                </h4>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    ${equipmentHTML}
                </div>
                ${
                    p.comment
                        ? `
                    <div class="mt-6 rounded-2xl bg-slate-50 p-5 border border-slate-200">
                        <div class="prose prose-sm prose-slate max-w-none text-slate-700 font-medium">
                            ${marked.parse(p.comment)}
                        </div>
                    </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
    document.body.classList.add("modal-open");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

/**
 * Updates the image source and the text counter in the modal
 */
function updateModalImageDisplay() {
    const imgEl = document.getElementById("modal-main-img");
    const counterEl = document.getElementById("modal-img-counter");

    if (imgEl && currentModalImages.length > 0) {
        // Fade effect for smoother transition
        imgEl.style.opacity = "0.5";
        setTimeout(() => {
            imgEl.src = currentModalImages[currentImageIndex];
            imgEl.style.opacity = "1";
        }, 50);
    }

    if (counterEl) {
        counterEl.innerText = `${currentImageIndex + 1} / ${currentModalImages.length}`;
    }
}

/**
 * Moves to the next image in the array
 */
function nextModalImage() {
    if (currentModalImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentModalImages.length;
    updateModalImageDisplay();
}

/**
 * Moves to the previous image in the array
 */
function prevModalImage() {
    if (currentModalImages.length <= 1) return;
    currentImageIndex =
        (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length;
    updateModalImageDisplay();
}

/**
 * Jumps to a specific image and scrolls the modal up
 */
function jumpToImage(imgUrl) {
    const idx = currentModalImages.indexOf(imgUrl);
    if (idx !== -1) {
        currentImageIndex = idx;
        updateModalImageDisplay();

        const modalContent = document.getElementById("modal-content");
        if (modalContent) {
            modalContent.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
}

function closeModal() {
    const modal = document.getElementById("park-modal");
    document.body.classList.remove("modal-open");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}
