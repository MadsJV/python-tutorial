async function populateEditorContainers() {
    try {
        let editorCounter = 1;
        const response = await fetch('../html/editor.html');
        const templateHTML = await response.text();

        const containers = document.querySelectorAll('.editorContainer');

        containers.forEach(container => {
            if (container.children.length === 0) {
                container.innerHTML = templateHTML;

                const editor = container.querySelector('.editor');
                if (editor) {
                    editor.id = `editor${editorCounter}`;

                    const dataInstance = container.getAttribute('data-instance');
                    if (dataInstance) {
                        editor.setAttribute('data-instance', dataInstance);
                    }

                    editorCounter++;
                }
            }
        });

        document.body.offsetHeight;
    } catch (error) {
        console.error('Error loading editor template:', error);
    }
}