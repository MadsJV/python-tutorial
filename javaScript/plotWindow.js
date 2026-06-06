let latestPlotSrc = "";
let activePlotDrag = null;
let plotWindowTemplatePromise;
let plotTabTemplatePromise;

async function ensurePlotWindow() {
    let plotWindow = document.querySelector(".plotWindow");

    if (plotWindow) return plotWindow;

    plotWindow = document.createElement("section");
    plotWindow.className = "plotWindow";
    plotWindow.hidden = true;
    plotWindowTemplatePromise ||= fetchText(plotWindowTemplatePath);
    plotWindow.innerHTML = await plotWindowTemplatePromise;

    document.body.appendChild(plotWindow);
    makePlotWindowDraggable(plotWindow);
    return plotWindow;
}

function makePlotWindowDraggable(plotWindow) {
    const header = plotWindow.querySelector(".plotWindowHeader");

    const endDrag = () => {
        activePlotDrag = null;
        plotWindow.classList.remove("isDragging");
        document.body.classList.remove("isDraggingPlotWindow");
    };

    header.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) return;
        event.preventDefault();

        const rect = plotWindow.getBoundingClientRect();

        activePlotDrag = {
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top
        };

        plotWindow.classList.add("isDragging");
        document.body.classList.add("isDraggingPlotWindow");
        plotWindow.style.left = `${rect.left}px`;
        plotWindow.style.top = `${rect.top}px`;
        plotWindow.style.right = "auto";
        plotWindow.style.bottom = "auto";
        header.setPointerCapture(event.pointerId);
    });

    header.addEventListener("pointermove", (event) => {
        if (!activePlotDrag) return;

        const rect = plotWindow.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);
        const nextLeft = Math.min(Math.max(0, event.clientX - activePlotDrag.offsetX), maxLeft);
        const nextTop = Math.min(Math.max(0, event.clientY - activePlotDrag.offsetY), maxTop);

        plotWindow.style.left = `${nextLeft}px`;
        plotWindow.style.top = `${nextTop}px`;
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
        if (plotWindow.hidden || plotWindow.style.left === "") return;

        const rect = plotWindow.getBoundingClientRect();
        const maxLeft = Math.max(0, window.innerWidth - rect.width);
        const maxTop = Math.max(0, window.innerHeight - rect.height);

        plotWindow.style.left = `${Math.min(rect.left, maxLeft)}px`;
        plotWindow.style.top = `${Math.min(rect.top, maxTop)}px`;
    });
}

async function showPlotWindow(src) {
    latestPlotSrc = src;

    const plotWindow = await ensurePlotWindow();
    const image = plotWindow.querySelector(".plotWindowImage");

    image.src = src;
    plotWindow.hidden = false;
}

function closePlotWindow() {
    const plotWindow = document.querySelector(".plotWindow");
    if (plotWindow) plotWindow.hidden = true;
}

async function openPlotInNewTab() {
    if (!latestPlotSrc) return;

    const tab = window.open();
    if (!tab) return;

    plotTabTemplatePromise ||= fetchText(plotTabTemplatePath);

    const template = await plotTabTemplatePromise;

    tab.document.write(template.replace("{{plotSrc}}", latestPlotSrc));
    tab.document.close();
}
