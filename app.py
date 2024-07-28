import base64
import logging
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import OpenAI
from langchain.chains.question_answering import load_qa_chain
import os
import io

app = Flask(__name__)
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Global variables to store API key and PDF content
api_key = None
knowledge_base = None

def extract_text_from_pdf(pdf_content):
    logging.info("Extracting text from PDF")
    pdf_data = base64.b64decode(pdf_content)
    reader = PdfReader(io.BytesIO(pdf_data))
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    logging.info("Text extraction complete")
    return text

@app.route('/upload', methods=['POST'])
def upload():
    global api_key, knowledge_base

    logging.info("Received upload request")
    api_key = request.json.get('api_key')
    pdf_content = request.json.get('pdf_content')

    pdf_text = extract_text_from_pdf(pdf_content)

    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(pdf_text)
    embeddings = OpenAIEmbeddings(api_key=api_key)
    knowledge_base = FAISS.from_texts(chunks, embeddings)

    logging.info("PDF content and API key uploaded successfully")
    return jsonify({'message': 'PDF content and API key uploaded successfully'})

@app.route('/ask', methods=['POST'])
def ask():
    global api_key, knowledge_base

    logging.info("Received ask request")
    if not api_key or not knowledge_base:
        logging.error("API key or PDF content not uploaded")
        return jsonify({'error': 'API key or PDF content not uploaded'}), 400

    user_question = request.json.get('question')
    docs = knowledge_base.similarity_search(user_question)

    llm = OpenAI(api_key=api_key)
    qa_chain = load_qa_chain(llm, chain_type="stuff")
    response = qa_chain.run(question=user_question, input_documents=docs)

    logging.info("Question answered successfully")
    return jsonify({'answer': response})

if __name__ == '__main__':
    logging.info("Starting Flask app")
    app.run(port=5000)