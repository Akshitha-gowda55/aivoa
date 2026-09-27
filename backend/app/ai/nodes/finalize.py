from app.ai.schemas import AIProcessingResult
from app.ai.state import DeviationGraphState


def finalize_node(state: DeviationGraphState) -> DeviationGraphState:
    result = AIProcessingResult(
        extracted=state["extracted"],
        impact=state["impact"],
        severity=state["severity"],
        knowledge_matches=state.get("retrieved_knowledge", []),
        source_type=state.get("source_type", "text"),
        processing_summary=(
            "AI extracted the deviation information, retrieved relevant "
            "quality and deviation patterns, and generated preliminary "
            "impact and severity recommendations for human review."
        ),
    )

    return {
        **state,
        "result": result,
    }
