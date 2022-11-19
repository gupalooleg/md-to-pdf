const { join } = require("path");
const { readdir, writeFile } = require("fs/promises");
const { mdToPdf } = require("md-to-pdf");
const { merge } = require("merge-pdf-buffers");

//only index.md and article.md matter
const dirContainsMdFiles = "gitRepositoryWithMdFiles";
const resourcePath = join(__dirname, "..", dirContainsMdFiles);
const resultPath = join(__dirname, "..", "Result.pdf");

const mdFilePaths = [];

async function getMdFilePaths(path) {
  try {
    const dirents = await readdir(path, { withFileTypes: true });
    const indexDirent = dirents.find((dirent) => dirent.name === "index.md");
    if (indexDirent) {
      mdFilePaths.push(`${join(path, indexDirent.name)}`);
    }

    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        await getMdFilePaths(`${join(path, dirent.name)}`);
      } else {
        if (dirent.name === "article.md") {
          mdFilePaths.push(`${join(path, dirent.name)}`);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  console.log("Start");

  await getMdFilePaths(resourcePath);
  console.log(`Total number of files: ${mdFilePaths.length}`);

  try {
    const chunks = [];
    let i = 0;
    for (const path of mdFilePaths) {
      console.log(`${++i}. Getting content of file: ${path}`);
      const pdf = await mdToPdf({ path: path });
      chunks.push(pdf.content);
    }

    console.log("Merging pdf buffers to one...");
    const content = await merge(chunks);
    console.log(`Total buffer length: ${content.length}`);

    console.log("Writing file...");
    await writeFile(resultPath, content);

    console.log("Finish");
    process.exit();
  } catch (error) {
    console.log(error);
  }
}

main();
