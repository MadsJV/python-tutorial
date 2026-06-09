const parentContainer = document.querySelector(".mainContentContainer");
const textContent = globalThis.textContent;

async function fetchJson() {
    try {
        const response = await fetch("../json/content/textContent.json");
        const textContent = await response.json();
        return textContent;
    } catch (err) {
        console.error("Failed to fetch JSON:", err);
    }
}

function createTextBox(text, contentId) {
    const element = document.createElement("div");
    element.className = "text";
    element.textContent = text;
    element.id = contentId;
    
    element.innerHTML = element.innerHTML
        .replace(
            /\[key\](.*?)\[\/key\]/g,
            '<span class="keyText">$1</span>'
        )
        .replace(
            /\n/g, '<br>'
        )
    return element;
}

function stylizeChapterNumber(chapter, length) {
    return String(chapter).padStart(length, "0");
}

function createSubTitle(text, chapter) {
    const element = document.createElement("div");
    element.className = "subTitle";
    element.textContent = text;
    element.setAttribute("data-chapter", chapter);
    element.setAttribute("data-chapterDisplayNumber", stylizeChapterNumber(chapter, 2));
    element.id = `chapter${chapter}`;
    return element;
}

function createEditor(data, chapter) {
    const element = document.createElement("div");
    element.className = "editorContainer";
    element.setAttribute("data-instance", `chapter${chapter}/${data}`);
    return element;
}

function createLinkCard(text, link) {
    const card = document.createElement("div");
    const linkElement = document.createElement("a");
    card.className = "linkCard";
    linkElement.className = "link";
    linkElement.href = link
    linkElement.textContent = text;
    card.appendChild(linkElement);
    return card
}

function createLinkCardContainer(block) {
    const container = document.createElement("div");
    container.className = "linkCardContainer";
    const linkCards = [];
    for (const link of block.links) {
        linkCards.push(createLinkCard(link.name, link.source))
    };
    container.replaceChildren(...linkCards);
    return container;
}

function createElement(type, className, href, textContent, clickEventTargetScrollElement = null, ) {
    const htmlElement = document.createElement(type);
    htmlElement.className = className;
    htmlElement.href = href || "";
    htmlElement.textContent = textContent || "";
    
    if (clickEventTargetScrollElement) {
        htmlElement.addEventListener("click", (event) => {
            event.preventDefault();

            document
                .querySelector(`#chapter${clickEventTargetScrollElement}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    return htmlElement;
}

function loadSidebarChapters(lessons) {
    const sidebarChapterList = document.querySelector(".sidebarChapterList");
    if (!sidebarChapterList) return;

    sidebarChapterList.innerHTML = "";

    if (!Array.isArray(lessons)) return;

    lessons.forEach((lesson) => {
        const chapterWrapper = createElement("div", "chapterWrapper")
        const subChapterWrapper = createElement("div", "subChapterWrapper")

        chapterWrapper.appendChild(createElement("a", "sidebarChapterLink chapterNavItem", `#chapter${lesson.chapter}`, `${lesson.chapter}. ${lesson.subTitle}`, lesson.chapter))

        for (const block of lesson.blockFlow) {
            if (block.type == "text") {
                subChapterWrapper.appendChild(createElement("a", "sidebarSubChapterLink chapterNavItem", `#chapterSubChapter${lesson.chapter}.${block.content}`, `${lesson.chapter}.${block.content} - ${block.name}`))
            }
        }

        chapterWrapper.appendChild(subChapterWrapper)

        sidebarChapterList.appendChild(chapterWrapper)
    });
}

function constructTextContent() {
    fetchJson().then((textContent) => {
        const lessons = textContent.lessons;
        if (!lessons) return;

        const currentContent = [];
        const linkCardContainer = [];

        for (const chapter of lessons) {
            currentContent.push(createSubTitle(chapter.subTitle, chapter.chapter));

            for (const block of chapter.blockFlow) {
                if (block.type === "text") {
                    currentContent.push(createTextBox(chapter.text[block.content], `chapterSubChapter${chapter.chapter}.${block.content}`));
                }
                if (block.type === "code") {
                    currentContent.push(createEditor(block.file, chapter.chapter));
                }
                if (block.type === "linkCardContainer") {
                    currentContent.push(createLinkCardContainer(block))
                }
            }
        }
        currentContent.push(...linkCardContainer)
        parentContainer.replaceChildren(...currentContent);
        loadSidebarChapters(lessons);
});}