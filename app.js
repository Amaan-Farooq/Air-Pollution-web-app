const express = require('express');
const axios = require('axios');
const path = require('path');
const PORT = process.env.PORT || 8080;
require('dotenv').config()

function dateBuilder (d) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
  
    return `${day} ${date} ${month} ${year}`;
}


const app = express();

app.use('/static',express.static('static'));
app.use(express.urlencoded({extended: true})); 

// PUG SPECIFIC STUFF
app.set('view engine','pug')// Set the template engine as pug
app.set('views',path.join(__dirname,'views'))// Set the views directory
app.use(express.static(path.join(__dirname, 'views')));


// END POINTS
app.get('/',async (req,res)=>{
    let now = new Date();
    let date = dateBuilder(now);
    const params = {'Date':date}
    res.status(200).render('index.pug',params)

})

app.post('/submit',async(req,res)=>{
    let city = req.body.name
    console.log(city);
    try {
        const link1 = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${process.env.API_KEY}` 
        let response = await axios.get(link1)
        let latitude = response.data.results[0].geometry.lat
        let longitude = response.data.results[0].geometry.lng
        console.log(latitude, longitude);
        const link2 = `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${process.env.API_KEY2}`
        response = await axios.get(link2)
        let aqi = response.data.data.current.pollution.aqius
        let major_pollutant = response.data.data.current.pollution.mainus
        let CITY = response.data.data.city + ', ' +response.data.data.country
        /// day and date
        let now = new Date();
        let date = dateBuilder(now);

        
        const params = {'AQI':aqi,'Pollutant':major_pollutant,'City':CITY, 'Date':date}
        
        switch (true) {
            case (aqi <= 50):
                res.status(200).render('green.pug',params)
                break;
            case (aqi > 50 && aqi <= 100):
                res.status(200).render('yellow.pug',params)
                break;
            case (aqi > 100 && aqi <= 150):
                res.status(200).render('orange.pug',params)
                break;
            case (aqi > 150 && aqi <=200):
                res.status(200).render('red.pug',params)
                break;
            case (aqi > 150 && aqi <=250):
                res.status(200).render('purple.pug',params)
                break;
            default:
                res.status(200).render('dark.pug',params)
                break;
        }
    } catch (error) {console.log(error)}
})

app.get('*',(req,res)=>{
    let now = new Date();
    let date = dateBuilder(now);
    const params = {'Date':date}
    res.status(200).render('index.pug',params)
})

app.listen(PORT,()=>{
    console.log(`The application started successsfully on port ${PORT}`)
})
