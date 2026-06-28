import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    // Replace this with your actual Vercel domain
    sitemap: 'https://general-multi-tools.vercel.app/sitemap.xml',
  }
}
