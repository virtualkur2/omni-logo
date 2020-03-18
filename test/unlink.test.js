const assert = require('assert');
const path = require('path');
const fs = require('fs');
const unlinkFile = require('../src/server/helpers/file.upload.helper').unlinkFile;

const files = [];
const fileNameLength = 32;
const contentLength = 1024;
const destinationPath = path.join(__dirname, '/temporal');

for(let i = 0; i < 10; i++) {
  let file = {
    name: `${[...Array(fileNameLength)].map((element) => (~~(Math.random()*36)).toString(36)).join('')}.test`,
    content: [...Array(contentLength)].map((element) => (~~(Math.random()*36)).toString(36)).join('')
  }
  files.push(file);
}

const writeMultipleFiles = files.map(file => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(destinationPath, file.name), file.content, error => {
      if(error) return reject(error);
      resolve(`File ${file.name} written succesfully`);
    });
  });
});

Promise.all(writeMultipleFiles)
  .then(() => {
    console.log(`All files were successfully written.`);
    Promise.all(files.map(file => {
      unlinkFile(destinationPath, file.name)
        .then(fileName => {return fileName;})
        .catch(error => {throw error;})
    }))
      .then(() => {
        console.log(`All files were deleted succesfully.`);
      })
      .catch(error => {
        console.log(error.message);
      });
  })
  .catch(error => {
    console.log(error.message);
  });

