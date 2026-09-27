from langgraph.graph import END, START, StateGraph

from app.ai.nodes.extraction import extraction_node
from app.ai.nodes.finalize import finalize_node
from app.ai.nodes.impact import impact_node
from app.ai.nodes.retrieval import retrieve_knowledge_node
from app.ai.nodes.severity import severity_node
from app.ai.state import DeviationGraphState


def build_deviation_graph():
    graph = StateGraph(DeviationGraphState)

    graph.add_node("extract", extraction_node)
    graph.add_node("retrieve_knowledge", retrieve_knowledge_node)
    graph.add_node("assess_impact", impact_node)
    graph.add_node("assess_severity", severity_node)
    graph.add_node("finalize", finalize_node)

    graph.add_edge(START, "extract")
    graph.add_edge("extract", "retrieve_knowledge")
    graph.add_edge("retrieve_knowledge", "assess_impact")
    graph.add_edge("assess_impact", "assess_severity")
    graph.add_edge("assess_severity", "finalize")
    graph.add_edge("finalize", END)

    return graph.compile()


deviation_graph = build_deviation_graph()
