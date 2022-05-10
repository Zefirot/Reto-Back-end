import path from 'path';
import fs from 'fs';
import os from 'os';
import {v4 as uuidv4} from 'uuid';
import {spawn} from 'child_process';

const deletePathTmp = () =>{};

const uploadNewFileToStorage = () => {};

const createPathTemp = (filename: string, extension: string) =>{
  try {
    const randomDirPath = `ffmpeg-output-${uuidv4()}`;
    const dirPath = path.join(os.tmpdir(), randomDirPath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const extName = path.extname(filename);
    const fileName = path.basename(filename, extName);

    const pathTemp = `${path.join(dirPath, fileName )}.${extension}`;

    return pathTemp;
  } catch (error) {
    throw error;
  }
};

const runCommand = async ( principalCommand: any, args: any, options: any ) =>
  new Promise((resolve, reject)=> {
    const child = spawn(principalCommand, args, options);

    child.stdout.on('data', (data) => {
      console.log(`Output: ${data}`);
    });

    child.stderr.on('data', (data: any) => {
      console.log(`LogLevel: ${data}`);
      if (data.includes('Error')) {
        reject('Error al crear archivo');
      };
    });

    child.on('close', (code) => {
      resolve(code);
    });
  });

const appendText = async (inputvideo1: string, output: string) => {
  const principalCommand = 'echo';

  const args = ['file',`${inputvideo1}`, '>>', `${output}`]

  const options = {
    shell: true,
  };
  
  await runCommand(principalCommand, args, options);
  return output;
 };

const removeDir =async (dirLocation: string) => {
  const principalCommand = 'del';

  const args = [`${dirLocation}`]

  const options = {
    shell: true,
  };
  
  await runCommand(principalCommand, args, options);
};

export {createPathTemp, appendText, removeDir};
