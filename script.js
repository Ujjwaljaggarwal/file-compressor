// script.js

let originalText = '';
let compressedData = null;
let huffmanTree = null;

document.getElementById('compressButton').addEventListener('click', compressFile);
document.getElementById('decompressButton').addEventListener('click', decompressFile);
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            originalText = e.target.result;
            document.getElementById('compressionInfo').textContent = `File loaded: ${file.name}`;
            document.getElementById('huffmanCodes').style.display = 'none';
        };
        reader.readAsText(file);
    }
}

function compressFile() {
    if (!originalText) {
        alert("Please select a file first.");
        return;
    }

    const frequencyMap = buildFrequencyMap(originalText);
    huffmanTree = buildHuffmanTree(frequencyMap);
    const huffmanCodes = buildHuffmanCodes(huffmanTree);

    compressedData = originalText.split('').map(char => huffmanCodes[char]).join('');
    const compressionPercentage = ((1 - (compressedData.length / (originalText.length * 8))) * 100).toFixed(2);

    document.getElementById('compressionInfo').textContent = `Compression Completed: ${compressionPercentage}%`;

    displayHuffmanCodes(huffmanCodes);
    createDownloadLink(compressedData, 'compressed.huff');
}

function decompressFile() {
    if (!compressedData || !huffmanTree) {
        alert("Please compress a file first.");
        return;
    }

    const decompressedText = decompressHuffman(compressedData, huffmanTree);
    createDownloadLink(decompressedText, 'decompressed.txt');
}

function buildFrequencyMap(text) {
    const frequencyMap = {};
    for (const char of text) {
        frequencyMap[char] = (frequencyMap[char] || 0) + 1;
    }
    return frequencyMap;
}

function buildHuffmanTree(frequencyMap) {
    const nodes = Object.keys(frequencyMap).map(char => ({
        char,
        freq: frequencyMap[char],
        left: null,
        right: null
    }));

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);

        const left = nodes.shift();
        const right = nodes.shift();

        const newNode = {
            char: null,
            freq: left.freq + right.freq,
            left,
            right
        };

        nodes.push(newNode);
    }

    return nodes[0];
}

function buildHuffmanCodes(tree, prefix = '', codeMap = {}) {
    if (tree.char !== null) {
        codeMap[tree.char] = prefix;
    } else {
        buildHuffmanCodes(tree.left, prefix + '0', codeMap);
        buildHuffmanCodes(tree.right, prefix + '1', codeMap);
    }
    return codeMap;
}

function decompressHuffman(compressedData, tree) {
    let result = '';
    let node = tree;

    for (const bit of compressedData) {
        node = bit === '0' ? node.left : node.right;

        if (node.char !== null) {
            result += node.char;
            node = tree;
        }
    }

    return result;
}

function displayHuffmanCodes(huffmanCodes) {
    const codesBox = document.getElementById('huffmanCodes');
    codesBox.style.display = 'block';
    codesBox.innerHTML = '<strong>Huffman Codes:</strong><br><br>' + 
                         Object.keys(huffmanCodes).map(char => `'${char}': ${huffmanCodes[char]}`).join('<br>');
}

function createDownloadLink(content, fileName) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.textContent = `Download ${fileName}`;
    downloadLink.style.display = 'inline-block';
}
