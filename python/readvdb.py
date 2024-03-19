from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
import sys
import os

def main():
    vdbname = sys.argv[1]
    question = sys.argv[2]

    current_path = os.getcwd()
    final_path = current_path + "/vectorDB/" + vdbname
    embedding_function = HuggingFaceEmbeddings(model_name="BAAI/bge-base-zh-v1.5")

    vector_db = Chroma(persist_directory=final_path, embedding_function=embedding_function)
    result = vector_db.similarity_search(question,k=3)

    txt=""
    for subresult in result:
        txt+=subresult.page_content

    print(txt)
    sys.stdout.flush()

if __name__ == "__main__":
    try:
        main()
    except Exception as erro:
        print("erro")
        print(erro)

