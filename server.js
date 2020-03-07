const express = require("express")
const path =  require('path')
const favicon = require("express-favicon")
const fs = require('fs')
const {google} = require('googleapis')
const OAuth2 = google.auth.OAuth2
const readline = require('readline')
//const Youtube = require('youtube-video-api')
const youtube = require('youtube-api')
const cors = require('cors')
const bodyParser = require('body-parser')

const credentials = require('./src/resources/credentials.json')
//const tkn = require('./src/resources/token.txt')

var ypi = require('youtube-channel-videos');

const app = express()
const port = process.env.PORT || 5000

app.use(favicon(__dirname + '/build/favicon.ico'))
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(cors())

//api key = AIzaSyClokCm5RDTCkNY9N7ninR3No967wvFEz4

//AUTHENTICATE
var ClientId = credentials.web.client_id
var ClientSecret = credentials.web.client_secret
var RedirectUrl = "http://bcb77490.ngrok.io"//'https://youtubeapitest.herokuapp.com'

function getOAuthClient(){
    return new OAuth2(ClientId, ClientSecret, RedirectUrl)
}

const oauth2Client = getOAuthClient()

app.get('/auth', (req,res) =>{
    console.log("auth is running")
    var url = getAuthUrl()
    res.redirect(url)
})

function getAuthUrl(){
    var scopes = ['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtube.readonly']
    
    var url = oauth2Client.generateAuthUrl({
            access_type:'offline',
            scope:scopes,
            approval_prompt: 'force'
    })

    return url
}

app.post('/setCode', async (req,res) =>{
    console.log("setcode has been called")
    var code = req.body.code
    var tokens = await getToken(code)

    oauth2Client.setCredentials({
        access_token:tokens.tokens.access_token
    })

    const youtube = google.youtube({
        version:'v3',
        auth:oauth2Client
    })

    /* this code will upload a specified video from the server to youtube
    const fileSize = fs.statSync('./src/resources/piano2.mp4').size
    console.log("file size = " + fileSize)
    const response = youtube.videos.insert({
        part: 'id,snippet,status',
        notifySubscribers: false,
        requestBody: {
            snippet: {
            title: 'Me playing some key bois',
            description: 'key bois are being played',
            },
            status: {
            privacyStatus: 'public',
            },
        },
        media: {
            body: fs.createReadStream('./src/resources/piano2.mp4'),
        }
    },(err, data) =>{
        if(err){
            console.log(err)
        }else{
            console.log("upload complete")
            console.log(data)   
        }
    })*/
    
    res.send("upload completed")
})

app.get('/getVideos', (req,res) =>{
    console.log("getting your youtube videos")

    const youtube = google.youtube({
        version:'v3',
        auth:oauth2Client
    })


    youtube.videos.list({
        part: 'snippet,status'
    },(err, videos) =>{
        if(!err){   
            console.log(videos)
        }
        else{
            console.log("Error ==> " + err)
        }
    })
})

async function getToken(code){
    console.log("generating token")
    try{
        var tokens = await oauth2Client.getToken(code)
        return tokens
    }catch(err){
        return err
    }
}

app.get('/', (req,res) =>{
    res.send("running")
})
app.get('/ping',(req,res) =>{
    console.log("pong")
    res.send("pong")
})

app.get('/vids', (req,res) =>{
    ypi.channelVideos("AIzaSyClokCm5RDTCkNY9N7ninR3No967wvFEz4", "UCKmEFdiZhwXQqkDF-mKxlZg", function(channelItems) {
        console.log(channelItems);
    });
    res.send("complete")    
})

app.listen(port, () =>{
    console.log(`server is running on port ${port}`)
})

