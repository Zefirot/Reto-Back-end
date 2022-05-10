/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
import {ffmpegController} from './ffmpeg.controller';
import {videosourceController} from './videosources.controller';
import {videoStatusController} from './videostatus.controller';
import {appendText, removeDir} from './utils.controller';
import {cwd} from 'process';
import path from 'path';

class TASKFLOW {

  async processVideos(inputVideoSource1: string, inputVideoSource2: string, context: any, outputVideoName: string){
    try {  
      const fileTxt = path.join(process.cwd(), 'videos.txt') //Path del archivo en donde se insertan los paths
      const output = path.join(process.cwd(), outputVideoName+".mp4") //Path del output
  
      //Se crea un archivo text que contiene los paths de los videos
      await appendText(inputVideoSource1, fileTxt)
      await appendText(inputVideoSource2, fileTxt)
  
      //Se crean los 2 paths tmp y se almacenan en la base de datos
      const videoSource1 = await videosourceController.createVideoSource(inputVideoSource1, context);
      const videoSource2 = await videosourceController.createVideoSource(inputVideoSource2, context);

      //Se crea el primer status de procesamiento y se almancena en al base de datos
      
      await videoStatusController.createVideoStatus(videoSource1._id, context, 'pending');
      await videoStatusController.createVideoStatus(videoSource2._id, context, 'pending');
      
      // enviar a ejecutar el procesamiento de video
      let isVideoAvailable = true;
      try {
        await ffmpegController.unionVideos(fileTxt, //Lista de direcciones
        output, //video de salida
        context,
        videoSource1._id,
        videoSource2._id);
      } catch (error) {
        //Status de failed en caso de que haya un error
        await videoStatusController.createVideoStatus(videoSource1._id, context, 'failed');
        await videoStatusController.createVideoStatus(videoSource2._id, context, 'failed');
        isVideoAvailable = false;
      }
      await removeDir(fileTxt);

      //Se genera el ultimo status de finalizacion
      await videoStatusController.createVideoStatus(videoSource1._id, context, 'completed');
      await videoStatusController.createVideoStatus(videoSource2._id, context, 'completed');
      if (!isVideoAvailable) {
        return ""; //Respuesta que se entrega cuando el procedimiento fue correcto
      };
      return output; //Se retorna el path del archivo de salida
    } catch (error) {
      throw error;
    }
  }

  async unionVideos(inputVideoSource1: string, inputVideoSource2: string, inputVideoSource3: string, inputVideoSource4: string) {
    const context = {userId: '6275bb583af43b4205af521a'};
  
    let inputVideoSource5 = await this.processVideos(inputVideoSource1, inputVideoSource4, context, 'inputVideoSource5'); //Union 1-4 = 5    
    inputVideoSource5 = inputVideoSource5.split(path.sep).join('/'); // Esto es con el fin de transformar el path al formato correcto

    let inputVideoSource6 = await this.processVideos(inputVideoSource2, inputVideoSource3, context, 'inputVideoSource6'); //Union 2-3 = 6
    inputVideoSource6 = inputVideoSource6.split(path.sep).join('/');

    if (inputVideoSource5 && inputVideoSource6){
      const inputVideoSource7 = await this.processVideos(inputVideoSource5, inputVideoSource6, context, 'inputVideoSource7'); //Union 5-6 = 7
    }
  }
}

const taskFlowController = new TASKFLOW();

export {
    taskFlowController,
};
