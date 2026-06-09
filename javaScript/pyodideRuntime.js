async function initPyodide() {
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
    });

    await pyodide.loadPackage(["numpy", "matplotlib"]);

    const matplotlibHook = await fetchText(pyodideInitPath);

    await pyodide.runPythonAsync(matplotlibHook);
    
    pyodideReady = true;
}

async function runPython(buttonElement) {
    const container = buttonElement.closest(".editorContainer");
    const editorElement = container.querySelector(".editor")
    const outputElement = container.querySelector(".output");

    const editorData = editors.get(editorElement.id);

    if (!pyodideReady || !editorData) {
        console.warn("Pyodide not ready");
        return;
    }

    try {
        editorData.outputElement.textContent = "";

        pyodide.globals.set("plotWindow", showPlotWindow);

        const stdoutDecoder = new TextDecoder("utf-8");

        pyodide.setStdout({
            raw: (charCode) => {
                console.log(`STDOUT: ${JSON.stringify(charCode)}`);
                editorData.outputElement.textContent += stdoutDecoder.decode(
                    new Uint8Array([charCode]),
                    { stream: true }
                );
            }
        });

        pyodide.setStderr({
            batched: (text) => {
                console.log(`STDERR: ${JSON.stringify(text)}`);
                editorData.outputElement.textContent += text;
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

        const code = editorData.editor.getValue();
        await pyodide.runPythonAsync(code);
        if (!editorData.outputElement.textContent.endsWith("\n")) {
            editorData.outputElement.textContent += "\n";
        }

    } catch (err) {
        editorData.outputElement.textContent += "Error: " + err;
    }
}
