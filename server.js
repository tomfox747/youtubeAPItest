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
var RedirectUrl = "http://d5c7bb4b.ngrok.io"//'https://youtubeapitest.herokuapp.com'

function getOAuthClient(){
    return new OAuth2(ClientId, ClientSecret, RedirectUrl)
}

const oauth2Client = getOAuthClient()

//SET UP REDIRECT FROM GET AUTH TO CALLBACK NEXT!!
//RESOURCE --> https://stackoverflow.com/questions/43930184/get-access-token-on-server-side-javascript-nodejs-using-google-authorization-c

app.get('/auth', (req,res) =>{
    console.log("auth is running")
    var url = getAuthUrl()
    res.redirect(url)
})

function getAuthUrl(){
    var scope = 'https://www.googleapis.com/auth/youtube.upload'
    
    var url = oauth2Client.generateAuthUrl({
            access_type:'offline',
            scope:scope,
            approval_prompt: 'force'
    })

    return url
}

app.post('/setCode', async (req,res) =>{
    console.log("setcode has been called")
    var code = req.body.code
    var tokens = await getToken(code)

    oauth2Client.setCredentials(tokens)

    var output = await uploadVideo(oauth2Client)
    
    res.send("upload completed")
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
/*
function uploadVideo(){
    console.log("upload video had been called")
    var youtube = Youtube({ 
        video: {
          part: 'status,snippet' 
        }
      })
       
      var params = {
        resource: {
          snippet: {
            title: 'test video',
            description: 'This is a test video uploaded via the YouTube API'
          },
          status: {
            privacyStatus: 'public'
          }
        }
      }
    youtube.upload('./src/resources/piano.mp4', params, function(err,video){
        if(err){return err}
        else{
            console.log("video is uploading")
            console.log(video)
        }
        //console.log("video was uploaded with ID: " + video.id)
    })
}
*/
async function uploadVideo(){
    
    console.log(oauth2Client)
    
    const youtube = google.youtube({
        version:'v3',
        auth:oauth2Client
    })

    const  fileSize = fs.statSync('./src/resources/piano2.mp4').size
    console.log("file size = " + fileSize)
    const res = youtube.videos.insert({
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
    })
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

