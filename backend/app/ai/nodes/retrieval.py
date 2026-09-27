from app.ai.retrieval import retrieve_knowledge
from app.ai.state import DeviationGraphState


def retrieve_knowledge_node(state: DeviationGraphState) -> dict:
    extracted = state["extracted"]

    matches = retrieve_knowledge(
        site=extracted.site,
        title=extracted.title,
        source=extracted.source,
        product=extracted.product,
        batch_number=extracted.batch_number,
        description=extracted.description,
        limit=5,
    )

    return {
        "retrieved_knowledge": matches,
    }
