<script lang="ts">
    import type { User } from "@rolle/types";

    interface Props {
        user: Pick<User, "id" | "name" | "nickname" | "pictureUrl">;
    }

    const { user }: Props = $props();
</script>

<a href="/u/{user.nickname}" class="inline-flex items-center gap-2">
    <img
        src={user.pictureUrl || "https://picsum.photos/800/600"}
        alt="User profile"
        class="aspect-square w-10 rounded-full object-cover"
    />
    <div>
        <div class="font-rounded">@{user.nickname}</div>
        <div class="font-rounded text-secondary-text text-xs">{user.name.full}</div>
    </div>
</a>
