const express = require('express');
// const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;
const axios = require('axios');
require('dotenv').config()
let latitude,longitude;

app.use('/static',express.static('static'));
app.use(express.urlencoded({extended: true})); 
// app.use(express.json());


// PUG SPECIFIC STUFF
app.set('view engine','pug')// Set the template engine as pug
app.set('views',path.join(__dirname,'views'))// Set the views directory

// END POINTS
app.get('/',(req,res)=>{
    res.status(200).render('index.pug')
})

app.post('/submit',async (req,res)=>{
    let city = req.body.name

    try {
        const link1 = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.API_KEY}` 
        let response = await axios.get(link1)
        let latitude = response.data.results[0].geometry.lat
        let longitude = response.data.results[0].geometry.lng
        const link2 = `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${process.env.API_KEY}`
        response = await axios.get(link2)
        let aqi = response.data.data.current.pollution.aqius
        let major_pollutant = response.data.data.current.pollution.mainus
        
        const params = {'AQI':aqi,'Pollutant':major_pollutant,'City':city}
        // console.log(latitude,longitude)
        switch (true) {
            case (aqi <= 50):
                res.status(200).render('page1.pug',params)
                break;
            case (aqi > 50 && aqi <= 100):
                res.status(200).render('page2.pug',params)
                break;
            case (aqi > 100 && aqi <= 150):
                res.status(200).render('page3.pug',params)
                break;
            case (aqi > 150 && aqi <=200):
                res.status(200).render('page4.pug',params)
                break;
            case (aqi > 150 && aqi <=250):
                res.status(200).render('page5.pug',params)
                break;
            default:
                res.status(200).render('page6.pug',params)
                break;
        }    
    } catch (error) {
        console.log(error)
    }

})

app.get('*',(req,res)=>{
    res.status(200).render('index.pug')
})

app.listen(port,()=>{
    console.log(`The application started successsfully on port ${port}`)
})
