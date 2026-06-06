async function loadTheme(themeName) {
    try {
        const response = await fetch(`../json/themes/${themeName}.json`);
        const theme = await response.json();

        if (!theme) {
            console.error("Theme file is empty or invalid");
            return;
        }

        monaco.editor.defineTheme(themeName, theme);
        monaco.editor.setTheme(themeName);
        updateCodeDisplayThemes(themeName);

    } catch (err) {
        console.error(`Failed to load theme ${themeName}: ${err}`);
    }
}

function updateCodeDisplayThemes(themeName) {
    for (const [_, displayData] of codeDisplays) {
        displayData.editor.updateOptions({ theme: themeName });
    }
}