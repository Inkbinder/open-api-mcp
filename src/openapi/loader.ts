import {dereference} from "@readme/openapi-parser";

 export async function load(){
     return await dereference('https://weather-gov.github.io/api/assets/openapi.yaml')
 }