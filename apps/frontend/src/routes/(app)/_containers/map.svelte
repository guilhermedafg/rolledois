<script lang="ts">
    import "mapbox-gl/dist/mapbox-gl.css";
    import mapboxgl, { type Marker, type Map as MapType } from "mapbox-gl";
    import Supercluster from "supercluster";

    import { mount, untrack } from "svelte";
    import { currentPositionStore, mapZoomStore } from "$lib/store";

    import { VenueMarker, ClusterMarker } from "$lib/containers";

    import type { LatLng } from "@rolle/geo";
    import type { Venue } from "@rolle/types";

    interface Props {
        map: MapType | undefined;
        geo: LatLng;
        venues: Venue[];
        venueWrapperElements: HTMLDivElement[];
        handleMarkerClick: (venue: Venue) => void;
    }

    let { geo, venues, handleMarkerClick, map = $bindable() }: Props = $props();

    let mapElement: HTMLDivElement | undefined = $state();

    let supercluster: Supercluster | undefined = $state();
    const mountedMarkers = new Map<string, Marker>();

    $effect(() => {
        if (typeof mapElement === "undefined") return;
        initMap(mapElement);
        return () => {
            map?.remove();
            map = undefined;
        };
    });

    $effect(() => {
        initSupercluster(venues);
        untrack(() => {
            renderClustersForView();
        });
    });

    /**
     * Sets map object up.
     */
    async function initMap(container: HTMLDivElement) {
        await currentPositionStore.updatePosition();
        map = new mapboxgl.Map({
            accessToken:
                "__SEU_TOKEN_MAPBOX_AQUI__",
            container: container,
            style: "mapbox://styles/mapbox/streets-v12",
            localFontFamily: "SF Pro Text",
            center: [geo.longitude, geo.latitude],
            zoom: 13.5,
        });

        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
        });

        map.addControl(geolocate);

        map.on("style.load", () => {
            if (typeof map === "undefined") return;
            geolocate.trigger();

            map.setLayoutProperty("poi-label", "visibility", "none");

            const roadLabel = "road-label";
            map.setLayerZoomRange(roadLabel, 15.5, 24);
            map.setLayoutProperty(roadLabel, "symbol-spacing", 500);
            map.setLayoutProperty(roadLabel, "text-size", 10);
            map.setLayoutProperty(roadLabel, "text-padding", 12);
        });

        map.on("zoomend", () => {
            if (typeof map === "undefined") return;
            mapZoomStore.set(map.getZoom());
        });

        map.on("moveend", renderClustersForView);
        map.on("zoomend", renderClustersForView);
    }

    function initSupercluster(venues: Venue[]) {
        supercluster = new Supercluster({
            radius: 30,
        }).load(
            venues
                .filter((v) => v.geo?.coordinates)
                .map((v) => ({
                    type: "Feature",
                    geometry: { type: "Point", coordinates: v.geo!.coordinates },
                    properties: {
                        venue: v,
                    },
                })),
        );
    }

    /**
     * Renders stuff on map.
     */
    function renderClustersForView() {
        if (typeof map === "undefined") return;
        if (typeof supercluster === "undefined") return;

        const bounds = map.getBounds()!;
        const clusters = supercluster.getClusters(
            [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
            Math.floor(map.getZoom()),
        );

        // cleanup
        const clusterIds = clusters.map((c) => c.id || c.properties.venue.id);
        for (const id of mountedMarkers.keys()) {
            if (clusterIds.includes(id)) continue;
            mountedMarkers.get(id)!.remove();
            mountedMarkers.delete(id);
        }

        // draw
        for (const item of clusters) {
            if (item.properties.cluster) {
                if (mountedMarkers.has(item.id!.toString())) continue;
                const hostElement = document.createElement("div");
                mount(ClusterMarker, {
                    target: hostElement,
                    props: { count: item.properties.point_count },
                });
                const marker = new mapboxgl.Marker(hostElement)
                    .setLngLat(item.geometry.coordinates as [number, number])
                    .addTo(map!);
                mountedMarkers.set(item.id!.toString(), marker);
                continue;
            }

            const venue = item.properties.venue as Venue;
            if (mountedMarkers.has(venue.id.toString())) continue;
            const hostElement = document.createElement("div");

            mount(VenueMarker, {
                target: hostElement,
                props: { venue, click: handleMarkerClick },
            });
            const marker = new mapboxgl.Marker(hostElement)
                .setLngLat(venue.geo!.coordinates)
                .addTo(map!);

            mountedMarkers.set(venue.id.toString(), marker);
        }
    }
</script>

<div class="h-[40dvh] w-full" bind:this={mapElement}></div>
