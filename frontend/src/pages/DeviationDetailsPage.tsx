import { useParams } from "react-router-dom";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export function DeviationDetailsPage() {
  const { id } = useParams();

  return (
    <PagePlaceholder
      title="Deviation details"
      badge={id ? `ID ${id}` : "Foundation"}
      description="Human review, AI assessment results, and persistence will be implemented later. This page currently confirms that the details route is wired."
    />
  );
}
