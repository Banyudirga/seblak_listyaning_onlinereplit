import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReportKpiCardsProps = {
  items: Array<{
    label: string;
    value: string | number;
    accentClassName?: string;
    helperText?: string;
  }>;
};

export function ReportKpiCards({ items }: ReportKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.accentClassName || "text-foreground"}`}>
              {item.value}
            </div>
            {item.helperText ? (
              <p className="mt-1 text-xs text-muted-foreground">{item.helperText}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
