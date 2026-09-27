from app.ai.graph import deviation_graph


TEST_TEXT = """
During manufacturing of API Product A at the Bangalore API Manufacturing Site
on 2026-09-26, the granulation temperature exceeded the approved process
parameter range for approximately 8 minutes in batch BATCH-2026-001.
The event was identified during routine manufacturing monitoring.
No confirmed product quality impact has been established.
The deviation was reported by Manufacturing.
"""


def test_deviation_graph_completes_full_workflow():
    result = deviation_graph.invoke(
        {
            "source_text": TEST_TEXT,
            "source_type": "text",
        }
    )

    assert result["extracted"].site == "Bangalore API Manufacturing Site"
    assert result["extracted"].batch_number == "BATCH-2026-001"

    assert result["impact"].level in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    assert result["severity"].level in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    assert result["retrieved_knowledge"]
    assert result["result"].knowledge_matches

    assert result["result"].source_type == "text"
    assert result["result"].processing_summary
