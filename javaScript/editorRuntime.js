function clearEditor(buttonElement) {
    const container = buttonElement.closest(".editorContainer");
    const editorElement = container.querySelector(".editor");

    const editorData = editors.get(editorElement.id);
    if (!editorData) return;

    editorData.editor.setValue("");
}

async function resetEditor(buttonElement) {
    const container = buttonElement.closest(".editorContainer");
    const editorElement = container.querySelector(".editor");

    const editorData = editors.get(editorElement.id);

    if (!editorData) return;

    try {
        const text = await loadDemoSource(editorData.instanceName);
        editorData.editor.setValue(text);

    } catch (err) {
        console.error("Reset failed:", err);
    }
}
