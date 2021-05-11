const express=require('express')
const fs=require('fs')
const path=require('path')
const app=express() 
const port=8080 || process.env.PORT
const axios = require('axios')

var latitude,longitude

app.use('/static',express.static('static'))
app.use(express.urlencoded())

// PUG SPECIFIC STUFF
app.set('view engine','pug')// Set the template engine as pug
app.set('views',path.join(__dirname,'views'))// Set the views directory

// END POINTS
app.get('/',(req,res)=>{
    res.status(200).render('index.pug')
})
app.get('*',(req,res)=>{
    res.status(200).render('index.pug')
})
 
app.post('/submit',(req,res)=>{
    city = req.body.name
    // console.log(city)
    link1 = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=79b1287a90d94822bf29b3bff1f25936` 
    axios.get(link1)
    .then(response=>{
            latitude = response.data.results[0].geometry.lat
            longitude = response.data.results[0].geometry.lng
            // console.log(latitude,longitude)

            link2= `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=d5d356c2-7819-4791-9082-0b8b5a3ef8f2`
            axios.get(link2)
            .then(response =>{
                // console.log(response.data.data.current)
             aqi = response.data.data.current.pollution.aqius
             major_pollutant = response.data.data.current.pollution.mainus
            //  console.log(aqi,major_pollutant)
            const params = {'AQI':aqi,'Pollutant':major_pollutant,'City':city}
            if(aqi <= 50)
            {
                res.status(200).render('page1.pug',params)
            }
            else if (aqi > 50 && aqi <=100)
            {
                res.status(200).render('page2.pug',params)
            }
            else if (aqi > 100 && aqi <=150)
            {
                res.status(200).render('page3.pug',params)
            }
            else if (aqi > 150 && aqi <=200)
            {
                res.status(200).render('page4.pug',params)
            }
            else if (aqi > 200 && aqi <=250)
            {
                res.status(200).render('page5.pug',params)
            }
            else
            {
                res.status(200).render('page6.pug',params)
            }
    })
    })
    
    
})
app.listen(port,()=>{
    console.log(`The application started successsfully on port ${port}`)
})
