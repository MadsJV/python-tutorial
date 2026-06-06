async function fetchText(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }

    return response.text();
}

async function loadDemoSource(instanceName) {
    const path = `${demoPythonPath}/${instanceName}.py`;

    try {
        return await fetchText(path);
    } catch (err) {
        console.warn(err);
        return `# Missing demo file: ${path}\n`;
    }
}
