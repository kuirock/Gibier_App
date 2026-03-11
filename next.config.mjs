/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dummyimage.com',
                /*hostname: "res.cloudinary.com"*/
            }
        ]
    }
};

export default nextConfig;
