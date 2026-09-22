<script lang="ts">
    interface Props {
        count: number;
    }

    const { count }: Props = $props();
</script>

<div class="bg-primary-400 fluffy grid size-8 place-items-center rounded-full">
    {count}
</div>
