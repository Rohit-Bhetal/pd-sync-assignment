import dotenv from "dotenv";
import type { PipedrivePerson } from "./types/pipedrive";
import { InputDataType, MappingDataType, PipeDrivePayloadType } from "./types/workflow";
import * as fs from 'fs'
import path from "path";
import axios, { AxiosError } from 'axios';
import { error } from "console";

// Load environment variables from .env file
dotenv.config();

// Get API key and company domain from environment variables
const apiKey = process.env.PIPEDRIVE_API_KEY;
const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;
//Checking Correct ENV LOADED or NOT
if(!apiKey || !companyDomain){
  throw new Error('Missing Credentials from ENV')
}

const pipeDriveURL = `https://${companyDomain}.pipedrive.com/api/v1/persons`


//Parsing JSON from json files
const parseJson = async(filePath:string):Promise<any>=>{
  try {
    const fileContent = await fs.promises.readFile(filePath,'utf-8');
    return JSON.parse(fileContent)
  } catch (error:any) {
    //EdgeCase 1: Json File Might Not be in the desired location
    throw new Error(`Error while Reading JSON file at path:${filePath}:${error.message}`)
  }
}

//Create a payload for the pipeDrivePerson
const pipeDriveMapping = (inputData:InputDataType,mappings:MappingDataType[]):PipeDrivePayloadType=>{
  let pipeDrivePayload:PipeDrivePayloadType|any ={};
  mappings.forEach(mapp=>{
    const inputValue = nestedLoopHandler(inputData,mapp.inputKey);
    //Checking if the value from inputData is not Null or Undefined
    if(inputValue!=undefined && inputValue !=null){
      pipeDrivePayload[mapp.pipedriveKey] = inputValue
    }
  })
  if (pipeDrivePayload == undefined || pipeDrivePayload==null){
    //Edge Case 2: Mapping Issue due to improper data
     throw new Error('PipeDrive Payload Value are not matching and issue in Mapping')
  }
  return pipeDrivePayload
}

//Nested Loop Handler
const nestedLoopHandler = (obj:any,path:string):any=>{
  return path.split('.').reduce((acc,red)=>(acc?acc[red]:undefined),obj)
}

const checkPersoninPipeDrive = async(name:string)=>{
  try {
    const url = pipeDriveURL+`/search`;
    const {data}=await axios.get(url,{
      params:{
        term:name,
        api_token:apiKey
      }
    });

    if(data?.data?.items?.length>0){
      return data.data.items[0].item;
    }
    return null
  } catch (err:any) {
    const message = err instanceof AxiosError ? err.response?.status : err.message
    throw new Error(`Error searching person in Pipedrive: ${message}`);
  }
}
// PipeDrive Deliverable

const syncPdPerson = async ():Promise<PipedrivePerson> => {
  try {
    const inputData:InputDataType = await parseJson(path.resolve(__dirname,'mappings/inputData.json'))
    const mappings:MappingDataType[] = await parseJson(path.resolve(__dirname,'mappings/mappings.json'))
    const pipePayLoad:PipeDrivePayloadType = pipeDriveMapping(inputData,mappings);

    //Find the mappings and handling the errors
    const nameMapping = mappings.find(m=>m.pipedriveKey ==="name");
    if (!nameMapping) throw new Error("No mapping found for 'name' field.");
    const personName = nestedLoopHandler(inputData,nameMapping.inputKey)
    if (!personName) throw new Error("No name value found in input data.");
    const personInPipeDrive:PipedrivePerson|null = await checkPersoninPipeDrive(personName);
    let response:PipedrivePerson;
    if (personInPipeDrive){
      const updateURL = pipeDriveURL+`/${personInPipeDrive.id}`;
      const udpateRes = await axios.put(updateURL,pipePayLoad,{
        params:{
          api_token:apiKey
        }
      });
      response = udpateRes.data.data;
    }else{
      const createResp = await axios.post(pipeDriveURL,pipePayLoad,{
        params:{
          api_token:apiKey
        }
      });
      response = createResp.data.data

    }
    return response

  } catch (error:any) {
    throw new Error(`Failed to get proper data from Pipedrive:${error.message}`)
  }
};


// LOgging the promise data
syncPdPerson()
  .then(pipedrivePerson => {
    console.log(pipedrivePerson);
  })
  .catch(error => {
    console.error('Error syncing Pipedrive person:', error);
  });