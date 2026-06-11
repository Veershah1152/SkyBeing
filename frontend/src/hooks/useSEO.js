import { useEffect } from 'react';

export default function useSEO({ title, description }) {
    useEffect(() => {
        if (title) {
            document.title = `${title} | SkyBeings`;
        } else {
            document.title = 'SkyBeings | Premium Bird Feeders & Houses';
        }

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }

        if (description) {
            metaDescription.setAttribute('content', description);
        } else {
            metaDescription.setAttribute(
                'content',
                'Discover premium bird feeders, bird houses, and water feeders at SkyBeings. Create a sanctuary for birds in your garden today.'
            );
        }
    }, [title, description]);
}
