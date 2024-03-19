from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
import sys
import os

def main():
    vdbname = sys.argv[1]
    txt = sys.argv[2]
    vdbfilename = sys.argv[3]
    current_path = os.getcwd()
    final_path = current_path + "/vectorDB/" + vdbname
    
    
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    TEXT = text_splitter.split_text(txt)
    
    def metadata(content,vdb_name):
        meta_data = []
        for i in range(len(content)):
            meta_data.append({"source": vdb_name, "page": i})
        return meta_data 
    
    meta_data = metadata(TEXT,vdbfilename)

    embedding_function = HuggingFaceEmbeddings(model_name="BAAI/bge-base-zh-v1.5")

    # # 持久化数据
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

