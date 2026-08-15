from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PDF_DIRECTORY = PROJECT_ROOT / "data" / "pdfs"


@app.get("/")
def home():
    return {"message": "Math-Reader backend is running"}


@app.get("/pdfs/{filename}")
def get_pdf(filename: str):
    # Path of the pdf
    pdf_path = PDF_DIRECTORY / filename

    if pdf_path.suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="ONLY PDF ARE ALLOWED",
        )

    if not pdf_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="PDF NOT FOUND",
        )

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename,
        content_disposition_type="inline"
    )
