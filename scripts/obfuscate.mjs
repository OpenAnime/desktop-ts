import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JavaScriptObfuscator from "javascript-obfuscator";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(projectRoot, "src");

// Matches multi-line and single-line static import statements
const staticImportPattern =
  /^\s*import\s*(?:(?:(?:\*\s*as\s+[\w$]+|[\w$]+(?:,\s*\{[^}]*\})?|\{[^}]*\})\s*from\s*)?["'][^"'\r\n]+["']|["'][^"'\r\n]+["'])\s*;?\s*$/gm;

const obfuscatorOptions = {
  target: "node",
  compact: true,
  simplify: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 1,
  stringArrayEncoding: ["rc4"],
  stringArrayIndexesType: ["hexadecimal-number"],
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 1,
  splitStrings: true,
  splitStringsChunkLength: 5,
  transformObjectKeys: true,
  numbersToExpressions: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  selfDefending: true,
  ignoreImports: true,
  sourceMap: false,
};

function splitImportsAndBody(source) {
  const imports = [];
  const body = source.replace(staticImportPattern, (match) => {
    imports.push(match.trim());
    return "";
  });

  return {
    importsHeader: imports.length > 0 ? imports.join("\n") + "\n\n" : "",
    cleanBody: body,
  };
}

function obfuscateFile(filename) {
  const source = fs.readFileSync(filename, "utf8");
  const isESM = filename.endsWith(".js");

  let output;

  if (isESM) {
    const { importsHeader, cleanBody } = splitImportsAndBody(source);

    // Obfuscate the code body without the top-level import statements
    const result = JavaScriptObfuscator.obfuscate(cleanBody, obfuscatorOptions);

    // Prepend the clean static imports to the top of the file
    output = importsHeader + result.getObfuscatedCode();
  } else {
    // CommonJS (.cjs) files can be obfuscated directly
    const result = JavaScriptObfuscator.obfuscate(source, obfuscatorOptions);
    output = result.getObfuscatedCode();
  }

  fs.writeFileSync(filename, output, "utf8");
}

function prepareOutputDirectory() {
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const filename of fs.readdirSync(outputDirectory)) {
    if (filename.endsWith(".jsc")) {
      fs.rmSync(path.join(outputDirectory, filename));
    }
  }

  fs.writeFileSync(
    path.join(outputDirectory, "package.json"),
    '{"type":"module"}\n',
    "utf8",
  );
}

function main() {
  prepareOutputDirectory();

  for (const filename of fs.readdirSync(outputDirectory)) {
    if (filename.endsWith(".js") || filename.endsWith(".cjs")) {
      obfuscateFile(path.join(outputDirectory, filename));
    }
  }
}

main();
