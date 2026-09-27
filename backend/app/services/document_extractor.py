from io import BytesIO

import pymupdf


class DocumentExtractionError(Exception):
    """Raised when a document cannot be extracted."""


def extract_pdf_text(file_bytes: bytes) -> str:
    if not file_bytes:
        raise DocumentExtractionError("The uploaded PDF is empty.")

    try:
        document = pymupdf.open(stream=BytesIO(file_bytes), filetype="pdf")
    except Exception as exc:
        raise DocumentExtractionError("The uploaded file is not a valid PDF.") from exc

    try:
        pages = [page.get_text("text") for page in document]
    finally:
        document.close()

    text = "\n".join(pages).strip()

    if not text:
        raise DocumentExtractionError(
            "No readable text was found in the uploaded PDF."
        )

    return text
