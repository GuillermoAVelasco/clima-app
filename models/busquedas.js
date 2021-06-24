const fs=require('fs');

const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath='./db/database.json';

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado(){
    return this.historial.map(lugar=>{
      let palabras=lugar.split(' ');
      palabras=palabras.map(p=>p[0].toUpperCase()+p.substring(1));
      
      return palabras.join(' ');
    });
  }

  get paramsMapbox(){
    return {
      'access_token':process.env.MAPBOX_KEY,
      'limit':5,
      'language':'es'
    }
  }

  async ciudad(lugar = "") {
    try {
        //peticion http
        const instance= axios.create({
          baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
          params:this.paramsMapbox
        })

        const resp=await instance.get();
        return resp.data.features.map(lugar =>({
          id:lugar.id,
          nombre:lugar.place_name,
          lng:lugar.center[0],
          lat:lugar.center[1]
        }));
        
    } catch (error) {
        return [];
        
    }
    
  }

  get paramsOpenWeather(){
    return {
      'appid':process.env.OPENWEATHER_KEY,
      'units':'metric',
      'lang':'es'
    }
  }

  async climaLugar(lat,lon){
    try {
        //instance axios.create()
        //peticion http
        const instance= axios.create({
          baseURL:'https://api.openweathermap.org/data/2.5/weather',
          params:{...this.paramsOpenWeather,lat,lon},
        })
        //respuesta
        const resp=await instance.get();
        //desestructurar
        const {weather,main}=resp.data;
        //console.log(weather);
        return {
          desc:weather[0].description,
          min:main.temp_min,
          max:main.temp_max,
          temp:main.temp
        };

    } catch (error) {
        console.log(error);
    }
  }

  agregarHistorial(lugar=''){
    //prevenir duplicados
    if(this.historial.includes(lugar.toLocaleLowerCase())) return;
    
    this.historial=this.historial.splice(0,5);
    
    this.historial.unshift(lugar.toLocaleLowerCase());

    
    //Grabar en DB
    this.guardarDB();
  }

  guardarDB(){
    const payload={
      historial:this.historial
    }
    fs.writeFileSync(this.dbPath,JSON.stringify(payload));
  }

  leerDB(){
    //Verifica si existe
    if( !fs.existsSync(this.dbPath) ) return ;

    //Cargar info
    const info = fs.readFileSync(this.dbPath,{ encoding:'utf-8' });
    //para convertirlo otra vez en json
    const data = JSON.parse( info );
    //console.log(data);

    this.historial=data.historial;
    return data;
  }

 
}

module.exports = Busquedas;
