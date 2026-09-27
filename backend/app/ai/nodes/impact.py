import json

from app.ai.client import get_groq_client
from app.ai.prompts.deviation import IMPACT_SYSTEM_PROMPT
from app.ai.schemas import ImpactAssessment
from app.ai.state import DeviationGraphState
from app.core.config import settings


def _format_knowledge(state: DeviationGraphState) -> str:
    records = state.get("retrieved_knowledge", [])

    if not records:
        return "No supporting knowledge records were retrieved."

    formatted: list[str] = []

    for index, record in enumerate(records, start=1):
        source_label = (
            "SYNTHETIC DEMO PATTERN"
            if record.get("is_synthetic")
            else record.get("authority", "Unknown authority")
        )

        formatted.append(
            f"""
EVIDENCE {index}
Authority: {source_label}
Source type: {record.get("source_type", "unknown")}
Topic: {record.get("topic", "unknown")}
Title: {record.get("title", "Untitled")}
Content: {record.get("content", "")}
"""
        )

    return "\n".join(formatted)


def impact_node(state: DeviationGraphState) -> DeviationGraphState:
    extracted = state["extracted"]
    knowledge = _format_knowledge(state)

    client = get_groq_client()

    response = client.chat.completions.create(
        model=settings.groq_model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": IMPACT_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"""
Assess the potential impact of this deviation.

CURRENT DEVIATION
=================
{extracted.model_dump_json(indent=2)}

SUPPORTING KNOWLEDGE AND PATTERNS
=================================
The following records are retrieved from a curated knowledge base.

IMPORTANT:
- They are supporting evidence and patterns, not facts about the current batch.
- Do not claim that an event occurred merely because it appears in a retrieved
  record.
- Synthetic records are explicitly labelled and must not be presented as real
  historical pharmaceutical cases.
- Prefer confirmed facts in the current deviation over hypothetical risks.
- Do not invent test results, product failures, contamination, patient impact,
  regulatory impact, or batch disposition.
- If important evidence is missing, explicitly state the evidence gap.
- A higher assessment requires stronger evidence; do not increase the level
  merely because a retrieved record describes a serious event.

{knowledge}

ASSESSMENT METHOD
=================
Consider, only when supported by evidence:
1. What process or parameter deviated?
2. Magnitude and duration of the deviation.
3. What material, product, or batch was exposed?
4. Whether product/material impact is confirmed, suspected, or unknown.
5. How the event was detected and whether containment is described.
6. Any confirmed patient, regulatory, supply, or other consequence.
7. Important evidence that is still missing.

Return ONLY valid JSON:
{{
  "level": "LOW | MEDIUM | HIGH | CRITICAL",
  "reason": "short factual explanation grounded in the current deviation and retrieved evidence"
}}
""",
            },
        ],
    )

    content = response.choices[0].message.content or "{}"
    payload = json.loads(content)

    impact = ImpactAssessment.model_validate(payload)

    return {
        **state,
        "impact": impact,
    }
