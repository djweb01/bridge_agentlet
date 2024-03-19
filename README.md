# bridge_agentlet
Bridge_agentlet is to connect your local database and LLM models from Agentlet website. 
通过 Bridge_agentlet 您可以将本地数据库加载到Agentlet网站的LLM大模型中。

## 工具下载
**1.网站**  https://agentlet.com/dbconnection

**2.Github**  
通过 SSH:
```bash
git clone git@github.com:djweb01/bridge_agentlet.git
```

或者通过 HTTPS:
```bash
git clone https://github.com/djweb01/bridge_agentlet.git
```
## 安装
**1.下载bridge_agentlet，并将文件解压** 

**2. 打开Terminal(终端)/CMD（Windows命令行），进入文件夹的位置**  
例如:
(Mac OS): 
```bash
cd Downloads/bridge_agentlet
```

(Windows): 
```bash
cd C:\Users\%USERNAME%\Downloads\bridge_agentlet
```

**3. 安装python（Mac OS, Windows），以及相关依赖** 
1. Langchain
```bash
pip install langchain
```

2. Chroma
```bash
sudo pip install chromadb
```
3. Transformers
```bash
pip install transformers
``` 

4. InstructorEmbedding
```bash
pip install InstructorEmbedding
``` 

**4. 安装NodeJS** 

**5. 安装Nodejs相关依赖** 
运行：
```bash
npm install
``` 

## 运行
**1. 启动程序** 
运行：
```bash
npm start
```
当命令行出现：listening on https://:::8080 表示运行成功，可以尝试在网页上加载prompt等相关操作。

**1. 错误** 
如果遇到运行错误，请根据返回的错误信息 Error: 来解决问题。
