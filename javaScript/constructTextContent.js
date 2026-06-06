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

function createSubTitle(text, chapter) {
    const element = document.createElement("div");
    element.className = "subTitle";
    element.textContent = text;
    element.setAttribute("data-chapter", chapter);
    element.id = `chapter${chapter}`;
    return element;
}

function createEditor(data, chapter) {
    const element = document.createElement("div");
    element.className = "editorContainer";
    element.setAttribute("data-instance", `chapter${chapter}/${data}`);
    return element;
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

        for (const chapter of lessons) {
            let currentChapter = `${chapter.chapter}: ${chapter.subTitle}`
            currentContent.push(createSubTitle(currentChapter, chapter.chapter));

            for (const block of chapter.blockFlow) {
                if (block.type === "text") {
                    currentContent.push(createTextBox(chapter.text[block.content], `chapterSubChapter${chapter.chapter}.${block.content}`));
                }
                if (block.type === "code") {
                    currentContent.push(createEditor(block.file, chapter.chapter));
                }
            }
        }
        parentContainer.replaceChildren(...currentContent);
        loadSidebarChapters(lessons);
});}