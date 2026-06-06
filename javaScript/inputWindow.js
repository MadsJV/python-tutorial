let inputWindowTemplatePromise;
let currentInputPrompt = "";
let inputResolver = null;

async function ensureInputWindow() {
    let inputWindow = document.querySelector(".inputWindow");

    if (inputWindow) return inputWindow;

    inputWindow = document.createElement("section");
    inputWindow.className = "inputWindow";
    inputWindow.hidden = true;
    inputWindowTemplatePromise ||= fetchText(inputWindowTemplatePath);
    inputWindow.innerHTML = await inputWindowTemplatePromise;

    document.body.appendChild(inputWindow);
    makeInputWindowDraggable(inputWindow);
    return inputWindow;
}

function makeInputWindowDraggable(inputWindow) {
    const header = inputWindow.querySelector(".inputWindowHeader");
    let activeInputDrag = null;

    const endDrag = () => {
        activeInputDrag = null;
        inputWindow.classList.remove("isDragging");
        document.body.classList.remove("isDraggingInputWindow");
    };

    header.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) return;
        event.preventDefault();

        const rect = inputWindow.getBoundingClientRect();
        activeInputDrag = {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };

        inputWindow.classList.add("isDragging");
        document.body.classList.add("isDraggingInputWindow");
        inputWindow.style.left = `${rect.left}px`;
        inputWindow.style.top = `${rect.top}px`;
        inputWindow.style.right = "auto";
        inputWindow.style.bottom = "auto";
        header.setPointerCapture(event.pointerId);
    });

    header.addEventListener("pointermove", (event) => {
        if (!activeInputDrag) return;

        const rect = inputWindow.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        const nextLeft = Math.min(Math.max(0, event.clientX - activeInputDrag.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, event.clientY - activeInputDrag.offsetY), maxTop);

        inputWindow.style.left = `${nextLeft}px`;
        inputWindow.style.top = `${nextTop}px`;
    });

    header.addEventListener("pointerup", (event) => {
        endDrag();
        if (header.hasPointerCapture(event.pointerId)) {
            header.releasePointerCapture(event.pointerId);
        }
    });

    header.addEventListener("pointercancel", endDrag);
    window.addEventListener("blur", endDrag);
    window.addEventListener("resize", () => {
        if (inputWindow.hidden || inputWindow.style.left === "") return;

        const rect = inputWindow.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        const nextLeft = Math.min(rect.left, maxLeft);
        const nextTop = Math.min(rect.top, maxTop);

        inputWindow.style.left = `${nextLeft}px`;
        inputWindow.style.top = `${nextTop}px`;
    });
}

function submitInput() {
    const inputWindow = document.querySelector(".inputWindow");
    const inputElement = inputWindow.querySelector(".inputWindowInput");
    const userInput = inputElement.value;

    if (inputResolver) {
        inputResolver(userInput);
        inputResolver = null;
    }

    closeInputWindow();
}

function closeInputWindow() {
    const inputWindow = document.querySelector(".inputWindow");
    if (inputWindow) {
        inputWindow.hidden = true;
    }
    currentInputPrompt = "";
}

document.addEventListener("keydown", (event) => {
    const inputWindow = document.querySelector(".inputWindow");
    if (inputWindow && !inputWindow.hidden && event.key === "Enter") {
        event.preventDefault();
        submitInput();
    }
});

function showInputWindowSync(prompt) {
    const inputWindow = document.querySelector(".inputWindow");
    if (!inputWindow) {
        console.error("Input window not initialized");
        return Promise.reject("Input window not initialized");
    }

    currentInputPrompt = prompt;

    const inputElement = inputWindow.querySelector(".inputWindowInput");
    const promptElement = inputWindow.querySelector(".inputWindowPrompt");

    if (promptElement) {
        promptElement.textContent = prompt;
    }

    if (inputElement) {
        inputElement.value = "";
        inputWindow.hidden = false;
        inputElement.focus();
    }

    return new Promise((resolve) => {
        inputResolver = resolve;
    });
}
