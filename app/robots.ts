import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/private/', '/admin/', '/dashboard/'],
        },
        sitemap: 'https://pornse.org/sitemap/main.xml',
    };
}
