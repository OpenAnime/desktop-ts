import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JavaScriptObfuscator from "javascript-obfuscator";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(projectRoot, "src");
const staticImportPattern =
  /^\s*import(?:[\s\S]*?from\s*|\s*)["'][^"'\r\n]+["'];?\s*$/gm;

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

function getStaticImports(source) {
  return source.match(staticImportPattern) ?? [];
}

function getModuleSpecifier(importStatement) {
  return importStatement.match(/["']([^"']+)["']\s*;?\s*$/)?.[1];
}

function verifyImports(original, obfuscated, filename) {
  for (const importStatement of getStaticImports(original)) {
    const moduleSpecifier = getModuleSpecifier(importStatement);
    if (
      moduleSpecifier &&
      !obfuscated.includes(`"${moduleSpecifier}"`) &&
      !obfuscated.includes(`'${moduleSpecifier}'`)
    ) {
      throw new Error(
        `Obfuscation removed import '${moduleSpecifier}' from ${filename}`,
      );
    }
  }
}

function obfuscateFile(filename) {
  const source = fs.readFileSync(filename, "utf8");
  const result = JavaScriptObfuscator.obfuscate(source, obfuscatorOptions);
  const output = result.getObfuscatedCode();

  if (filename.endsWith(".js")) {
    verifyImports(source, output, filename);
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
