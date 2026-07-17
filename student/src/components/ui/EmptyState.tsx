import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center animate-in fade-in-50",
                className
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <Icon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
            {actionLabel && onAction && (
                <div className="mt-6">
                    <Button onClick={onAction} variant="outline" className="shadow-sm">
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
