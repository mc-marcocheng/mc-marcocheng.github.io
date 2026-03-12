export function createHobbyCard(hobby) {
    return `
    <div class="reveal-up tw-flex tw-h-fit tw-w-full tw-max-w-[450px] tw-mx-auto tw-break-inside-avoid tw-flex-col tw-gap-2 tw-rounded-lg tw-bg-[#f3f3f3b4] tw-p-4 tw-shadow-lg">
        <div class="tw-flex tw-place-items-center tw-gap-3">
            <div class="tw-h-[300px] tw-w-full tw-overflow-hidden tw-rounded-lg">
                <img
                    src="${hobby.image}"
                    class="tw-h-full tw-w-full tw-object-cover"
                    alt="${hobby.title.toLowerCase()}"
                />
            </div>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-2">
            <h3 class="tw-text-xl tw-font-medium">${hobby.title}</h3>
            <p class="tw-text-gray-600">
                ${hobby.description}
            </p>
        </div>
    </div>
    `;
}

export function createWorkCard(work) {
    const roundedClass = work.roundedImage ? 'tw-rounded-full' : '';
    return `
    <div class="tw-flex tw-h-fit tw-w-full tw-flex-col tw-gap-4 tw-border-2 tw-border-black tw-bg-white tw-p-4">
        <div class="tw-flex tw-w-full tw-place-items-center tw-gap-4 tw-p-2">
            <div class="tw-flex tw-h-[60px] tw-w-[60px] tw-overflow-hidden ${roundedClass}">
                <img
                    src="${work.image}"
                    alt="${work.company.toLowerCase()}"
                    class="tw-h-full tw-w-full tw-object-cover"
                />
            </div>

            <div>
                <p class="tw-text-xl tw-font-semibold">${work.company}</p>
                <p class="tw-text-lg tw-text-gray-600">
                    ${work.role}
                </p>
            </div>
        </div>
        <div class="tw-text-justify tw-text-gray-800">
            ${work.description}
        </div>
    </div>
    `;
}

export function createBlogCard(blog) {
    return `
    <a
        href="${blog.url}"
        class="tw-flex tw-h-[400px] tw-w-[350px] tw-flex-col tw-gap-2 tw-overflow-clip tw-rounded-lg tw-bg-[#edecec79] tw-p-4 tw-shadow-xl max-lg:tw-w-[300px]"
    >
        <div class="tw-h-[200px] tw-w-full tw-overflow-hidden tw-rounded-md">
            <img
                src="${blog.image}"
                alt="article image"
                class="tw-h-full tw-w-full tw-object-cover"
                srcset=""
            />
        </div>
        <h3 class="tw-text-2xl tw-font-semibold max-md:tw-text-xl">
            ${blog.title}
        </h3>
        <p class="tw-mt-2 tw-text-gray-600">
            ${blog.description}
        </p>
        <span>
            <span>Read</span>
            <i class="bi bi-arrow-right"></i>
        </span>
    </a>
    `;
}
