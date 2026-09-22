<script lang="ts">
    import {
        VENUE_CATEGORY_TO_COLOR,
        VENUE_CATEGORY_TO_ICON,
        VENUE_CATEGORY_TO_TEXT,
        type VenueCategoryMapped,
    } from "../../constants";
    import { idFromRecordId } from "../../utils";

    import type { RecordId } from "surrealdb";

    interface Props {
        categoryId: RecordId<any>;
        active?: boolean;
        size?: "md" | "lg";
    }

    const { categoryId, size = "md", active = false }: Props = $props();

    const category = $derived(idFromRecordId(categoryId) as VenueCategoryMapped);
    const categoryText = $derived(VENUE_CATEGORY_TO_TEXT[category] ?? category);
    const CategoryIcon = $derived(
        VENUE_CATEGORY_TO_ICON[category] ?? VENUE_CATEGORY_TO_ICON["default"],
    );
    const categoryColor = $derived(
        VENUE_CATEGORY_TO_COLOR[category] ?? VENUE_CATEGORY_TO_COLOR["default"],
    );
</script>

<div
    class:active
    style={`background-color: ${categoryColor};`}
    class={[
        "inline-flex w-fit items-center gap-1 rounded-md border capitalize transition-all",
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "px-3 py-1 text-xs": size === "md",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "px-4 py-3 text-xl": size === "lg",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "shadow-text border-text -translate-y-0.5 shadow-[0_4px]": active,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "border-transparent": !active,
        },
    ]}
>
    <CategoryIcon />
    {categoryText}
</div>
