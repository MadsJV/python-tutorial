let pyodide = null;
let pyodideReady = false;

async function initSandbox() {
    const runButton = document.querySelector('.runButton');
    const clearButton = document.querySelector('.clearButton');
    const toggleOutputButton = document.querySelector('.toggleOutputWindowButton');
    const saveButton = document.querySelector('.saveButton');
    const uploadButton = document.querySelector('.uploadButton');
    const outputWindow = document.getElementById('outputWindow');
    const closeButton = document.querySelector('.outputWindowCloseButton');

    runButton.addEventListener('click', () => runCode());
    clearButton.addEventListener('click', () => clearEditor());
    toggleOutputButton.addEventListener('click', () => toggleOutputWindow());
    saveButton.addEventListener('click', () => saveCode());
    uploadButton.addEventListener('click', () => uploadCode());
    closeButton.addEventListener('click', () => hideOutputWindow());

    makeWindowDraggable(outputWindow);

    await initPyodide();
}

async function initPyodide() {
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
        });
        await pyodide.loadPackage(["numpy", "matplotlib"]);

        const matplotlibHook = await fetchText(pyodideInitPath);
        await pyodide.runPythonAsync(matplotlibHook);

        pyodide.globals.set("plotWindow", showPlotWindow);

        pyodideReady = true;
        console.log("Pyodide initialized successfully");
    } catch (err) {
        console.error("Failed to initialize Pyodide:", err);
        appendOutput("Error: Failed to initialize Python environment\n");
    }
}

async function runCode() {
    if (!pyodideReady) {
        appendOutput("Error: Python environment is loading. Please wait...\n");
        return;
    }

    const code = window.monacoEditor.getValue();
    if (!code.trim()) {
        appendOutput("No code to run\n");
        return;
    }

    showOutputWindow();
    clearOutput();

    try {
        const stdoutDecoder = new TextDecoder("utf-8");

        pyodide.setStdout({
            raw: (charCode) => {
                appendOutput(stdoutDecoder.decode(
                    new Uint8Array([charCode]),
                    { stream: true }
                ));
            }
        });

        pyodide.setStderr({
            batched: (text) => {
                appendOutput(text);
            }
        });

        pyodide.globals.set(
            "js_input",
            (prompt) => window.prompt(prompt || "")
        );

        await pyodide.runPythonAsync(`
import builtins
builtins.input = js_input
        `);

        await pyodide.runPythonAsync(code);

        if (!document.getElementById('output').textContent.endsWith("\n")) {
            appendOutput("\n");
        }

    } catch (err) {
        appendOutput("Error: " + err.message + "\n");
    }
}

function clearEditor() {
    if (window.monacoEditor) {
        window.monacoEditor.setValue('');
    }
}

function toggleOutputWindow() {
    const outputWindow = document.getElementById('outputWindow');
    outputWindow.classList.toggle('hidden');
}

function showOutputWindow() {
    document.getElementById('outputWindow').classList.remove('hidden');
}

function hideOutputWindow() {
    document.getElementById('outputWindow').classList.add('hidden');
}

function clearOutput() {
    document.getElementById('output').textContent = '';
}

function appendOutput(text) {
    const outputElement = document.getElementById('output');
    outputElement.textContent += text;
    outputElement.scrollTop = outputElement.scrollHeight;
}

function saveCode() {
    const code = window.monacoEditor.getValue();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code.py';
    a.click();
    URL.revokeObjectURL(url);
}

function uploadCode() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            window.monacoEditor.setValue(event.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
}

function makeWindowDraggable(element) {
    const header = element.querySelector('.outputWindowHeader');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    header.onmousedown = (e) => {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = (event) => {
            event.preventDefault();
            pos1 = pos3 - event.clientX;
            pos2 = pos4 - event.clientY;
            pos3 = event.clientX;
            pos4 = event.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.bottom = "auto";
            element.style.right = "auto";
        };
    };

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
