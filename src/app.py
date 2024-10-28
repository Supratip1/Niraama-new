# app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Replace with your Hugging Face API key
HF_API_KEY = "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"
client = InferenceClient(api_key=HF_API_KEY)

# Request body model
class ChatRequest(BaseModel):
    message: str

# Root endpoint
@app.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI Chat Service!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    messages = [
        {"role": "user", "content": request.message}
    ]

    try:
        stream = client.chat.completions.create(
            model="mistralai/Mistral-Nemo-Instruct-2407",
            messages=messages,
            max_tokens=500,
            stream=True
        )

        response_text = ""
        for chunk in stream:
            response_text += chunk.choices[0].delta.content

        return {"response": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
