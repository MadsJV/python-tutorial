window.addEventListener("DOMContentLoaded", async () => {
    await constructTextContent();
    const pyodidePromise = initPyodide();

    require.config({
        paths: {
            vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs",
            stackframe: "https://unpkg.com/stackframe@1/dist/stackframe",
            "error-stack-parser": "https://unpkg.com/error-stack-parser@2/dist/error-stack-parser"
        },
        shim: {
            stackframe: { exports: "StackFrame" },
            "error-stack-parser": { deps: ["stackframe"], exports: "ErrorStackParser" }
        }
    });

    await new Promise((resolve, reject) => {
        require(["vs/editor/editor.main"], async () => {
            try {
                await initEditors(pyodidePromise);
                resolve();
            } catch (e) {
                console.error("Failed to init editors:", e);
                reject(e);
            }
        });
    });
});

function fetchWrappers() {
    try {
        return document.querySelectorAll(".editorWrapper");
    } catch (err) {
        console.error("Couldn't find .editorWrapper", err)
    }
}

function fetchObjectFromParent(parent, child) {
    try {
        return parent.querySelector(child);
    } catch (err) {
        console.error(`Error fetching ${child} from ${parent}`, err)
    }
}

function fetchObjectFromSibling(self, sibling) {
    try {
        return self.parentElement.querySelector(sibling);
    } catch (err) {
        console.error(`Error fetching ${sibling} from ${self}`, err)
    }
}

function createMonacoEditorInstanceElement(editor, model, enableAutomaticLayout, enableMiniMap) {
    return monaco.editor.create(editor, {
        model: model,
        theme: defaultEditorTheme,
        automaticLayout: enableAutomaticLayout,
        minimap: { enabled: enableMiniMap },
    });
}

async function initEditors(pyodidePromise) {
    await populateEditorContainers()

    const editorWrappers = fetchWrappers()

    await loadTheme(defaultEditorTheme);

    for (const wrapper of editorWrappers) {
        const editorElement = fetchObjectFromParent(wrapper, ".editor");
        const loaderElement = fetchObjectFromParent(wrapper, ".editorLoader");
        const outputElement = fetchObjectFromSibling(wrapper, ".output");

        const runButton = fetchObjectFromSibling(wrapper, ".runButton");
        const instanceName = editorElement?.dataset?.instance || fallbackDemo;

        if (runButton) runButton.disabled = true;

        const template = await loadDemoSource(instanceName);

        const model = monaco.editor.createModel(
            template,
            "python"
        );

        const editor = createMonacoEditorInstanceElement(editorElement, model, true, false)

        editor.layout();

        editors.set(editorElement.id, {
            editor,
            outputElement,
            instanceName
        });

        if (runButton) runButton.disabled = false;
        if (loaderElement) loaderElement.style.display = "none";
    }

    await pyodidePromise;
}
