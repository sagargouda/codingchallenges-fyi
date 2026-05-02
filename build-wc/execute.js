const fs = require("fs");
const readline = require("readline");

function analyze(text) {
  const lines = text.split("\n").length - 1;
  const words = text.split(/\s+/).filter((token) => token !== "").length;
  const bytes = Buffer.byteLength(text, "utf8");
  return { lines, words, bytes };
}


function format({ lines, words, bytes }, label = "") {
  return [lines, words, bytes, label].filter(Boolean).join("\t");
}


function analyzeFile(filePath) {
  let data;

  try {
    data = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    const message =
      err.code === "ENOENT"
        ? `File not found: ${filePath}`
        : `Failed to read file: ${err.message}`;
    console.error(message);
    process.exit(1);
  }

  console.log(format(analyze(data), filePath));
}


function analyzeStdin() {
  const chunks = [];

  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });

  rl.on("line", (line) => {
    chunks.push(line);
  });

  rl.on("close", () => {
    const text = chunks.join("\n");
    const stats = analyze(text);

    // Byte count accounts for newline characters between lines
    const bytes = stats.bytes + chunks.length - 1;
    console.log(format({ ...stats, bytes }));
  });
}


const filePath = process.argv[2];

if (filePath) {
  analyzeFile(filePath);
} else {
  analyzeStdin();
}