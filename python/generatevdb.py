from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
import sys
import os
import re
import math
def main():
    vdbname = sys.argv[1]
    txt = sys.argv[2]
    vdbfilename = sys.argv[3]
    splitorInput = sys.argv[4]
    maxLength = sys.argv[5]
    overlapLength = sys.argv[6]
   

    current_path = os.getcwd()
    final_path = current_path + "/vectorDB/" + vdbname
    
    
    
    
    def metadata(content,vdb_name,opt=""):
        meta_data = []
        
        if type(vdb_name) == str:
            for i in range(len(content)):
                meta_data.append({"source": vdb_name, "page": i})
        else:
            for i in range(len(content)):
                meta_data.append({"source": opt+"_"+vdb_name[i], "page": i})

        return meta_data 
    
    if splitorInput == "":
        text_splitter = CharacterTextSplitter(chunk_size=maxLength, chunk_overlap=overlapLength)
        TEXT = text_splitter.split_text(txt)
        meta_data = metadata(TEXT,vdbfilename)
    else:
        TEXT=[]
        index_T=[]
        titleList = re.findall(splitorInput, txt, re.I)
        newtitleList =  titleList.copy()
        index = 0
        for t in titleList:
            index_T.append(re.search(t, txt))  #(0, 3)
            if len(index_T)>1:
                if (index_T[index].start()-1) - (index_T[index-1].end()+1) > 500:
                    n = math.ceil(((index_T[index].start()-1) - (index_T[index-1].end()+1))/500)
                    init = index_T[index-1].end()+1
                    for j in range(n):
                        if j == n-1:
                           
                            TEXT.append(txt[init+j*500: index_T[index].start()-1]) 
                        else:
                            TEXT.append(txt[init+j*500:init+(j+1)*500])
                            newtitleList.insert(index-1,titleList[index-1])
                        
                else:
                    TEXT.append(txt[index_T[index-1].end()+1:index_T[index].start()-1]) 
            index += 1
            

        TEXT.append(txt[index_T[index-1].end()+1:-1]) 
        meta_data = metadata(TEXT,newtitleList,vdbname)
    
        
   

    embedding_function = HuggingFaceEmbeddings(model_name="BAAI/bge-base-zh-v1.5")

    docsearch = Chroma.from_texts(
                                texts=TEXT,
                                embedding=embedding_function,
                                metadatas=meta_data, 
                                persist_directory=final_path)
    docsearch.persist()

    print("success")
    sys.stdout.flush()

if __name__ == "__main__":
    try:
        main()
    except Exception as erro:
        print("erro")
        print(erro)

