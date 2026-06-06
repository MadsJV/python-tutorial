const examTaskContainer = document.getElementById("examContentContainer");

async function loadExamTasks() {
    try {
        const response = await fetch("../json/content/exams.json");
        const data = await response.json();

        exams = data.exams;

        if (!exams) return;

    } catch (err) {
        console.error("Failed to load exams:", err);
    }
}

function createDiv(text, className = "text", elementType = "div", style = "") {
    const element = document.createElement(elementType);
    element.className = className;
    element.textContent = text;
    element.style.cssText = style;
    return element;
}

function createQuestionBlock(question, label) {
    const wrapper = createDiv("", "questionWrapper");
    wrapper.appendChild(createDiv(label ? `${label})` : "  ", "questionLabel"));
    wrapper.appendChild(createDiv(question, "questionText", "pre"));
    return wrapper;
}

function createCodeDisplayBlock(file, examId) {
    const wrapper = createDiv("", "codeDisplayWrapper");
    const element = createDiv("", "codeDisplay");
    element.className = "codeDisplay";
    element.setAttribute("data-display", `${examId}/${file}`);
    wrapper.appendChild(element);
    return wrapper;
}

function constructExamTaskBlockFlow(examId) {
    const exam = globalThis.exams.find(exam => exam.id === examId);
    if (!exam) {
        console.warn(`Exam task with id ${examId} not found`);
        return null;
    }

    let blocks = [];
    let taskTitleMarginTop = 0;

    for (const task of exam.tasks) {
        blocks.push(createDiv(`Oppgave ${task.taskId}`, "taskTitle", "div", `margin-top: ${taskTitleMarginTop}`));
        for (const block of task.blocks) {
            if (block.type === "text") {
                blocks.push(createDiv(block.content));
            } else if (block.type === "question") {
                blocks.push(createQuestionBlock(block.content.join("\n"), block.label));
            } else if (block.type === "code") {
                blocks.push(createCodeDisplayBlock(block.file, examId));
            } else {
                console.warn(`Unknown block type: ${block.type}`);
            }
        taskTitleMarginTop = "1em";
        }
    }
    return blocks;
}

function renderExamTask(examId) {
    const blocks = constructExamTaskBlockFlow(examId);
    if (!blocks) {
        console.warn(`No blocks to render for examId: ${examId}`);
        return;
    }
    examTaskContainer.innerHTML = "";
    for (const block of blocks) {
        examTaskContainer.appendChild(block);
    }
    if (typeof initCodeDisplays === "function") {
        initCodeDisplays();
    }
}

