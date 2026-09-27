import json

from app.ai.client import get_groq_client
from app.ai.prompts.deviation import SEVERITY_SYSTEM_PROMPT
from app.ai.schemas import SeverityAssessment
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


def severity_node(state: DeviationGraphState) -> DeviationGraphState:
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
                "content": SEVERITY_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": f"""
Assess the severity of this deviation.

CURRENT DEVIATION
=================
{extracted.model_dump_json(indent=2)}

SUPPORTING KNOWLEDGE AND PATTERNS
=================================
The following records were retrieved from a curated knowledge base.

IMPORTANT:
- These records provide patterns and supporting context.
- They are NOT facts about the current deviation.
- Never claim that an event happened to the current batch because it appears
  in a retrieved record.
- Synthetic records are explicitly labelled and must not be presented as
  real historical pharmaceutical cases.
- Do not invent test results, product failures, contamination, patient harm,
  regulatory findings, batch rejection, or recurrence.
- Confirmed consequences carry more weight than hypothetical possibilities.
- Missing information should reduce confidence and should be stated as an
  evidence gap.
- Do not assign HIGH or CRITICAL merely because a retrieved record describes
  a serious event.

{knowledge}

SEVERITY FRAMEWORK
==================
Consider the following dimensions when supported by evidence:

1. Magnitude of the process or parameter excursion.
2. Duration and extent of the event.
3. Process stage and importance of the affected operation.
4. Material, product, or batch exposure.
5. Confirmed, suspected, or unknown product-quality impact.
6. Detection and containment.
7. Recurrence or evidence of a systemic problem.
8. Confirmed patient, regulatory, supply, or other consequences.
9. Important evidence that is still unavailable.

SEPARATE SEVERITY FROM IMPACT
=============================
Severity should be assessed independently. Do not simply copy an impact
assessment or assume that the two levels must be identical.

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

    severity = SeverityAssessment.model_validate(payload)

    return {
        **state,
        "severity": severity,
    }
