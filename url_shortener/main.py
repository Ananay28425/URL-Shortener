from fastapi import FastAPI

app = FastAPI(title="URL Shortener")

@app.get("/")
async def root():
    return {"message": "URL Shortener is running"}
