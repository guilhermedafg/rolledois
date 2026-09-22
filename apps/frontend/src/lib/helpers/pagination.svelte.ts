import type { Paginated } from "@rolle/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FetchFn<T, M extends Record<string, any> = object> = (
    page: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
) => Promise<Paginated<T, M>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPaginationState<T, M extends Record<string, any> = object>(
    initialData: Paginated<T, M>,
    fetchFn: FetchFn<T, M>,
) {
    const { page, limit, total, ...extraMeta } = initialData.meta;
    let data = $state(initialData.data);
    let pagination = $state({
        page,
        limit,
        total,
    });
    let extra = $state(extraMeta);
    let loading = $state(false);
    let refetching = $state(false);
    const lastPage = $derived(Math.ceil(pagination.total / pagination.limit));

    async function nextPage() {
        if (loading) return;
        const nextPage = pagination.page + 1;
        if (nextPage > lastPage) return;
        loading = true;
        const next = await fetchFn(nextPage).finally(() => (loading = false));
        const { page, limit, total, ...rest } = next.meta;
        data = [...data, ...next.data];
        extra = rest;
        pagination = {
            page,
            limit,
            total,
        };
    }

    async function refetch() {
        if (refetching) return;
        loading = true;
        refetching = true;
        const next = await fetchFn(1).finally(() => {
            refetching = false;
            loading = false;
        });
        const { page, limit, total, ...rest } = next.meta;
        data = next.data;
        pagination = {
            page,
            limit,
            total,
        };
        extra = rest;
    }

    return {
        get data() {
            return data;
        },
        get pagination() {
            return pagination;
        },
        get extra() {
            return extra;
        },
        get loading() {
            return loading;
        },
        get refetching() {
            return refetching;
        },
        nextPage,
        refetch,
    };
}
