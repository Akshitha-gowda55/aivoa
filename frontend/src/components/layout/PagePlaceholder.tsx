import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

type PagePlaceholderProps = {
  title: string;
  description: string;
  badge?: string;
};

export function PagePlaceholder({ title, description, badge }: PagePlaceholderProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <CardTitle>{title}</CardTitle>
        {badge ? <Badge>{badge}</Badge> : null}
      </div>
      <CardDescription>{description}</CardDescription>
    </Card>
  );
}
