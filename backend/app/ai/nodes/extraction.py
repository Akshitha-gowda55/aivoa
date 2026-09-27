import json
from datetime import date, datetime

from app.ai.client import get_groq_client
from app.ai.prompts.deviation import EXTRACTION_SYSTEM_PROMPT
from app.ai.schemas import ExtractedDeviation
from app.ai.state import DeviationGraphState
from app.core.config import settings


def normalize_date(value: object) -> date | None:
    if value is None or value == "":
        return None

    if isinstance(value, date):
        return value

    text = str(value).strip()

    formats = [
        "%Y-%m-%d",
        "%d %B %Y",
        "%d %b %Y",
        "%B %d, %Y",
        "%b %d, %Y",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue

    return None


def extraction_node(state: DeviationGraphState) -> DeviationGraphState:
    source_text = state["source_text"]

    client = get_groq_client()

    response = client.chat.completions.create(
        model=settings.groq_model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": EXTRACTION_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"""
Extract the deviation information from the following source.

SOURCE:
{source_text}

Return JSON with exactly these fields:
site
date_of_occurrence
title
source
product
batch_number
description

For date_of_occurrence, ALWAYS return the date in ISO format:
YYYY-MM-DD

If the date is missing or cannot be determined, return null.

Use null for all other missing values.
Do not add fields.
""",
            },
        ],
    )

    content = response.choices[0].message.content or "{}"
    payload = json.loads(content)

    if "date_of_occurrence" in payload:
        payload["date_of_occurrence"] = normalize_date(
            payload["date_of_occurrence"]
        )

    extracted = ExtractedDeviation.model_validate(payload)

    return {
        **state,
        "extracted": extracted,
    }
