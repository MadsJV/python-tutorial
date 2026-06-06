async function initCodeDisplays() {
    const displayElements = document.querySelectorAll(".codeDisplay");

    for (const displayElement of displayElements) {
        const displayName = displayElement.dataset.display;

        if (!displayName) {
            console.warn("codeDisplay missing data-display attribute");
            continue;
        }

        const code = await loadExamSource(displayName);

        const numberOfLines = code.split('\n').length;
        displayElement.style.cssText = `--height: ${numberOfLines * 18}px`;

        const model = monaco.editor.createModel(code, "python");

        const editor = monaco.editor.create(displayElement, {
            model: model,
            theme: defaultEditorTheme,

            readOnly: true,
            automaticLayout: false,

            minimap: { enabled: false },

            scrollBeyondLastLine: false,
            scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
                handleMouseWheel: false,
                alwaysConsumeMouseWheel: false
            },

            lineNumbers: "off",
            glyphMargin: false,
            folding: false,

            renderLineHighlight: "none",
            occurrencesHighlight: "off",
            selectionHighlight: false,
            overviewRulerLanes: 0,
        });
        
        editor.layout();

        codeDisplays.set(displayElement.id, {
            editor,
            displayName
        });
    }
}

async function loadExamSource(displayName) {
    const path = `${examPythonPath}/${displayName}.py`;

    try {
        return await fetchText(path);
    } catch (err) {
        console.warn(err);
        return `# Missing exam file: ${path}\n`;
    }
}
