const fs = require('fs');
var app = require('express')();
var http = require('http').Server(app);
const axios = require('axios');
const Folderdir = './files/';
const VDBdir = './vectorDB/';
var io = require('socket.io')(http,{
    extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
});
const PDFParser = require('pdf-parse');
const {spawn} = require('child_process');

io.on('connection', async function(socket){
    console.log('a user connected');
    let fileList = []
    let vdbList = []
    if(socket.handshake.query['request'] === "dbconnection"){
        fs.readdir(Folderdir, async (err, files) => {
            if (err) {
                console.log(err); 
            }
            else { 
                files.forEach(async file => {
                    if(file.split(".")[1] && ["pdf", "txt"].includes(file.split(".")[1])){
                        fileList.push(file)
                    }
                });

                fs.readdir( VDBdir, async (err, files) => {
                    if (err) {
                        console.log(err); 
                    }else { 
                        files.forEach(async file => {
                            vdbList.push(file)
                        });
                        await socket.emit("data", { 
                            fileList: fileList,
                            vdbList:vdbList
                        });
                    }
                  });
            }
        
          });
    }else if(socket.handshake.query['request'] === "vdbconnection"){
        fs.readdir( VDBdir, async (err, files) => {
            if (err) {
                console.log(err); 
            }else { 
                files.forEach(async file => {
                    fileList.push(file)
                });
                await socket.emit("connectvdb", { 
                    fileList: fileList,
                });
            }
          });
    }

    
   

    socket.on('loadprompt', (arg) =>onConnect(arg));
    socket.on('generatevdb', (arg) =>generatevdb_init(arg));
    socket.on('loadvdb', (arg) =>onVDB(arg));
    socket.on('getfilecontent', (arg) =>onfilel(arg));

    socket.off('loadprompt', (arg)=>onConnect(arg));
    socket.off('generatevdb', (arg) =>generatevdb_init(arg));
    socket.off('loadvdb', (arg) =>onVDB(arg));
    socket.off('getfilecontent', (arg) =>onfilel(arg));

    
    async function httppost(arg,filecontent,type){
        let httpbody = {...arg.HttpBody}
        httpbody["file"] = filecontent
        httpbody["type"] = type
        new axios.post(arg.url ,httpbody)
        .then(response => {
            if(response.status == 200)
            {
                socket.emit("response", "加载成功");
            }else{socket.emit("response", "加载失败，请重新尝试");}
            
        })
        .catch(error => {
            console.log(error);
            socket.emit("response", "加载失败，请重新尝试");
        });
    }
    async function onVDB(arg){
        let python 
        let stdin_content = [process.cwd()+'/python/readvdb.py',arg.filename,arg.question]
        python = spawn('python3', stdin_content);
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            let result = data.toString().substring(0, data.length - 1)
            
            if(result.slice(0,6) === "error"){
                socket.emit("responsetxt", "查询失败");
            }else{
                result= {question:arg.question,TXTprompt:result}
                socket.emit("responsetxt", result);
            }
            
        });

        python.stderr.on('code', (code) => {
            console.log(`child process error with code ${code}`);
            python.stdout.end()
            socket.emit("responsetxt", "查询失败");
            
        });

        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            python.stdout.end()
            
        });

    }
    async function onConnect(arg){
        let type = arg.filename.split(".")[1]
        var filecontent
        if(type){
            if(type === "txt"){
                try{
                    filecontent = fs.readFileSync(Folderdir+arg.filename, "utf-8")
                    httppost(arg,filecontent,type)
                }catch(err){
                    console.log(err)
                }
    
            }else if(type === "pdf"){
                try{
                    let dataBuffer = fs.readFileSync(Folderdir+arg.filename);

                    PDFParser(dataBuffer).then(function(data) {
                        httppost(arg,data.text,type)
                    }).catch(function(error){
                            // handle exceptions
                            console.log(error)
                            socket.emit("response", "加载失败，该文件无法打开");
                        });
                }catch(err){
                    console.log(err);
                    socket.emit("response", "加载失败，该文件无法打开");
                }
            }
        }
    
    }

    function generatevdb(vdbname,filecontent,vdbfilename,splitorInput,maxLength,overlapLength){
        let python 
        let stdin_content = [process.cwd()+'/python/generatevdb.py',vdbname,filecontent,vdbfilename,splitorInput,maxLength,overlapLength]
        python = spawn('python3', stdin_content);
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            let result = data.toString().substring(0, data.length - 1)
            if(result === "success"){
                socket.emit("response", "数据库生成成功");
            }else{
                socket.emit("response", "数据库生成失败，该文件无法打开");
            }
            
        });

        python.stderr.on('code', (code) => {
            console.log(`child process error with code ${code}`);
            python.stdout.end()
            socket.emit("response", "数据库生成失败，该文件无法打开");
            
        });

        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            python.stdout.end()
            
        });
    }

    function onfilel(arg){

    let type = arg.filename.split(".")[1]
        var filecontent
        if(type){
            if(type === "txt"){
                try{
                    filecontent = fs.readFileSync(Folderdir+arg.filename, "utf-8")
                    socket.emit("content", filecontent);
                }catch(err){
                    console.log(err)
                }
    
            }else if(type === "pdf"){
                try{
                    let dataBuffer = fs.readFileSync(Folderdir+arg.filename);

                    PDFParser(dataBuffer).then(function(data) {
                        socket.emit("content", data.text);
                    }).catch(function(error){
                            // handle exceptions
                            console.log(error)
                            socket.emit("content", "加载失败，该文件无法打开");
                        });
                }catch(err){
                    console.log(err);
                    socket.emit("content", "加载失败，该文件无法打开");
                }
            }
        }
    }
   


    async function generatevdb_init(arg){
        let type = arg.filename.split(".")[1]
        var filecontent
        if(type){
            if(type === "txt"){
                try{
                    filecontent = fs.readFileSync(Folderdir+arg.filename, "utf-8")
                    generatevdb(arg.vdbname,filecontent,arg.vdbfilename)
                }catch(err){
                    console.log(err)
                }
    
            }else if(type === "pdf"){
                try{
                    let dataBuffer = fs.readFileSync(Folderdir+arg.filename);

                    PDFParser(dataBuffer).then(function(data) {
                        generatevdb(arg.vdbname,data.text,arg.vdbfilename,arg.splitorInput,arg.maxLength,arg.overlapLength)
                    }).catch(function(error){
                            // handle exceptions
                            console.log(error)
                            socket.emit("response", "加载失败，该文件无法打开");
                        });
                }catch(err){
                    console.log(err);
                    socket.emit("response", "加载失败，该文件无法打开");
                }
            }
        }
    }
   
});


http.listen(8080, function(){
    console.log('listening on  https://%s:8080', http.address().address);
});

